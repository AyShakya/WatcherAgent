// nodes/node-03-hitl/discord-bot.js
// Guardian Node 03 — Discord HITL (Human-in-the-Loop)
// Uses explicit loginBot() at startup. Falls back gracefully when credentials are absent.

import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import dotenv from 'dotenv';
import {
  getIncident,
  removeIncident,
  saveIncidentTimeout,
  clearIncidentTimeout,
} from '../../services/incident-store.js';
import { categoryLabel } from '../shared/categorize.js';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;
const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);
const ORCHESTRATOR_URL =
  process.env.ORCHESTRATOR_URL || `http://localhost:${process.env.PORT || 3000}`;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let botReady = false;

client.once('ready', () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
  botReady = true;
});

/**
 * Call once at server startup. Resolves when the bot is ready.
 * Safe to call when DISCORD_BOT_TOKEN is absent — just warns and returns.
 */
export async function loginBot() {
  if (!DISCORD_TOKEN) {
    console.warn('⚠️  DISCORD_BOT_TOKEN not set. Discord notifications are disabled.');
    return;
  }

  if (botReady) return;

  await client.login(DISCORD_TOKEN);

  await new Promise((resolve, reject) => {
    if (botReady) { resolve(); return; }
    client.once('ready', resolve);
    setTimeout(() => reject(new Error('Discord bot login timeout')), 15000);
  });
}

/**
 * Sends an incident approval card to Discord.
 */
export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.warn('⚠️  Discord credentials missing — skipping HITL notification.');
    return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
  }

  if (!botReady) {
    console.error('❌ Discord bot is not ready. Was loginBot() called at startup?');
    return { ...incidentData, hitl_status: 'FAILED_BOT_NOT_READY' };
  }

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const severityColor = incidentData.severity === 'P1' ? 0xff0000
      : incidentData.severity === 'P2' ? 0xffa500
      : 0xffdd57;

    const runbookSource = incidentData.runbooks?.[0]?.source || '';
    const isMemoryRecall = runbookSource === 'HISTORICAL_FIX';
    const runbookSteps = incidentData.runbooks?.[0]?.steps?.slice(0, 3).join('\n') || 'No automated runbook found.';

    const embed = new EmbedBuilder()
      .setColor(severityColor)
      .setTitle(`🚨 ${incidentData.severity} — ${incidentData.service}`)
      .setDescription(
        (incidentData.reasoning || 'No reasoning provided.').slice(0, 300)
      )
      .addFields(
        { name: '🏷️ Category',    value: categoryLabel(incidentData.error_category || 'UNKNOWN'), inline: true },
        { name: '⚡ Severity',    value: incidentData.severity ?? 'P2',                           inline: true },
        { name: '🎯 Confidence',  value: `${incidentData.confidence ?? 50}%`,                    inline: true },
        {
          name: isMemoryRecall ? '🧠 Memory Recall Fix' : '📋 Suggested Fix',
          value: isMemoryRecall
            ? `Replaying fix from **${incidentData.runbooks[0].incident_id}** (${Math.round((incidentData.runbooks[0].relevance || 0.9) * 100)}% match)\n${runbookSteps}`
            : runbookSteps,
        }
      )
      .setFooter({ text: `Incident ${incidentData.incident_id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve_${incidentData.incident_id}`)
        .setLabel('Accept & Fix')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`ignore_${incidentData.incident_id}`)
        .setLabel('Ignore')
        .setStyle(ButtonStyle.Danger)
    );

    const message = await channel.send({ embeds: [embed], components: [row] });

    const thread = await message.startThread({
      name: `inc-${incidentData.incident_id}`,
      autoArchiveDuration: 60,
    });
    await thread.send(`Thread opened for ${incidentData.incident_id}. Awaiting human decision…`);

    console.log(`📨 Discord approval card sent for ${incidentData.incident_id}`);

    // Auto-cleanup if nobody responds within HITL_TIMEOUT_MS
    const timeout = setTimeout(async () => {
      const stillPending = await getIncident(incidentData.incident_id);
      if (!stillPending) return;

      console.warn(`⏰ HITL timeout for ${incidentData.incident_id}. Auto-cleaning.`);
      await removeIncident(incidentData.incident_id);

      try {
        await thread.delete().catch(async () => {
          await thread.send('⏰ **Timeout.** Incident timed out.').catch(() => {});
          await thread.setArchived(true).catch(() => {});
        });
        await message.delete().catch(async () => {
          await message
            .edit({ content: '⏰ **Incident Timed Out & Archived.**', components: [], embeds: [] })
            .catch(() => {});
        });
      } catch (error) {
        console.warn(`⚠️ Failed to clean up Discord artifacts: ${error.message}`);
      }
    }, HITL_TIMEOUT_MS);

    saveIncidentTimeout(incidentData.incident_id, timeout);

    const initiatedAt = new Date();
    const expiresAt = new Date(initiatedAt.getTime() + HITL_TIMEOUT_MS);

    return {
      ...incidentData,
      discord_message_id: message.id,
      discord_thread_id: thread.id,
      hitl_status: 'AWAITING_APPROVAL',
      hitl_initiated_at: initiatedAt.toISOString(),
      hitl_expires_at: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('❌ Discord Bot Error:', error.message);
    return { ...incidentData, hitl_status: 'FAILED', discord_error: error.message };
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const parts = interaction.customId.split('_');
  const action = parts[0];
  const incidentId = parts.slice(1).join('_');

  clearIncidentTimeout(incidentId);

  if (action === 'approve') {
    const acceptedEmbed = new EmbedBuilder()
      .setColor(0x00c853)
      .setTitle(`✅ Fix Approved: ${incidentId}`)
      .setDescription(`Approved by **${interaction.user.tag}**. Deploying automated PR…`)
      .setTimestamp();

    await interaction.update({ embeds: [acceptedEmbed], components: [], content: '' });

    // Notify thread so there is an audit trail.
    const approveThread = interaction.message.thread;
    if (approveThread) {
      try {
        await approveThread.send(`✅ Fix approved by **${interaction.user.tag}**. PR pipeline running…`);
      } catch (_) {}
    }

    try {
      await fetch(`${ORCHESTRATOR_URL}/internal/discord-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': process.env.INTERNAL_CALLBACK_SECRET || '',
        },
        body: JSON.stringify({ incident_id: incidentId, approver: interaction.user.tag }),
      });
    } catch (err) {
      console.error('❌ Failed to notify orchestrator:', err.message);
    }
  } else if (action === 'ignore') {
    // Update the original card in-place with a clear IGNORED state.
    // Do NOT delete the message — deletion causes the prior channel message
    // (often a "Fix Accepted") to become visible, misleading the viewer.
    const ignoredEmbed = new EmbedBuilder()
      .setColor(0x5c5c5c)
      .setTitle(`🗑️ Incident Ignored: ${incidentId}`)
      .setDescription(`Dismissed by **${interaction.user.tag}**. No action will be taken.`)
      .setTimestamp();

    await interaction.update({ embeds: [ignoredEmbed], components: [], content: '' });

    // Send a thread message so there is an audit trail inside the thread.
    const thread = interaction.message.thread;
    if (thread) {
      try {
        await thread.send(`🗑️ Incident dismissed by **${interaction.user.tag}**. Archived with no action.`);
        await thread.setArchived(true).catch(() => {});
      } catch (err) {
        console.warn(`⚠️ Could not update thread on ignore: ${err.message}`);
      }
    }

    await removeIncident(incidentId);
    console.log(`🗑️ Incident ${incidentId} ignored by ${interaction.user.tag}`);
  }
});
