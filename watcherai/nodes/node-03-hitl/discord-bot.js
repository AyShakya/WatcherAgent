// nodes/node-03-hitl/discord-bot.js
// Guardian Node 03 — Discord HITL (Human-in-the-Loop)
<<<<<<< HEAD
// Manages Discord incident threads and approval buttons
=======
// Uses explicit loginBot() at startup. Falls back gracefully when credentials are absent.
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
<<<<<<< HEAD
  EmbedBuilder
=======
  EmbedBuilder,
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
} from 'discord.js';
import dotenv from 'dotenv';
import {
  getIncident,
  removeIncident,
  saveIncidentTimeout,
<<<<<<< HEAD
  clearIncidentTimeout
=======
  clearIncidentTimeout,
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
} from '../../services/incident-store.js';

dotenv.config();

<<<<<<< HEAD
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;
const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || `http://localhost:${process.env.PORT || 3000}`;
=======
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;
const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);
const ORCHESTRATOR_URL =
  process.env.ORCHESTRATOR_URL || `http://localhost:${process.env.PORT || 3000}`;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

let botReady = false;

client.once('ready', () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
  botReady = true;
});

<<<<<<< HEAD
export async function loginBot() {
  if (!DISCORD_TOKEN) {
    console.warn('⚠️ DISCORD_BOT_TOKEN not set. Discord notifications are disabled.');
=======
/**
 * Call once at server startup. Resolves when the bot is ready.
 * Safe to call when DISCORD_BOT_TOKEN is absent — just warns and returns.
 */
export async function loginBot() {
  if (!DISCORD_TOKEN) {
    console.warn('⚠️  DISCORD_BOT_TOKEN not set. Discord notifications are disabled.');
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
    return;
  }

  if (botReady) return;

  await client.login(DISCORD_TOKEN);

  await new Promise((resolve, reject) => {
<<<<<<< HEAD
    if (botReady) {
      resolve();
      return;
    }

=======
    if (botReady) { resolve(); return; }
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
    client.once('ready', resolve);
    setTimeout(() => reject(new Error('Discord bot login timeout')), 15000);
  });
}

<<<<<<< HEAD
export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.error('❌ Discord credentials missing. Skipping Discord notification.');
=======
/**
 * Sends an incident approval card to Discord.
 */
export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.warn('⚠️  Discord credentials missing — skipping HITL notification.');
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
    return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
  }

  if (!botReady) {
    console.error('❌ Discord bot is not ready. Was loginBot() called at startup?');
    return { ...incidentData, hitl_status: 'FAILED_BOT_NOT_READY' };
  }

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
<<<<<<< HEAD
      .setColor(incidentData.severity === 'P1' ? 0xFF0000 : 0xFFA500)
      .setTitle(`🚨 Incident Triage: ${incidentData.service}`)
      .setDescription(incidentData.reasoning)
      .addFields(
        { name: 'Severity', value: incidentData.severity, inline: true },
        { name: 'Confidence', value: `${incidentData.confidence}%`, inline: true },
        { name: 'Suggested Fix', value: incidentData.runbooks[0]?.steps.join('\n') || 'No automated fix found.' }
=======
      .setColor(incidentData.severity === 'P1' ? 0xff0000 : 0xffa500)
      .setTitle(`🚨 Incident: ${incidentData.service}`)
      .setDescription(incidentData.reasoning || 'No reasoning provided.')
      .addFields(
        { name: 'Severity', value: incidentData.severity ?? 'P2', inline: true },
        { name: 'Confidence', value: `${incidentData.confidence ?? 50}%`, inline: true },
        {
          name: 'Suggested Fix',
          value:
            incidentData.runbooks?.[0]?.steps?.slice(0, 3).join('\n') ||
            'No automated runbook found.',
        }
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
      )
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
<<<<<<< HEAD
      name: `thread-${incidentData.incident_id}`,
      autoArchiveDuration: 60
    });

    await thread.send(`Thread started for ${incidentData.incident_id}. Awaiting human decision...`);

=======
      name: `inc-${incidentData.incident_id}`,
      autoArchiveDuration: 60,
    });
    await thread.send(`Thread opened for ${incidentData.incident_id}. Awaiting human decision…`);

    console.log(`📨 Discord approval card sent for ${incidentData.incident_id}`);

    // Auto-cleanup if nobody responds within HITL_TIMEOUT_MS
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
    const timeout = setTimeout(async () => {
      const stillPending = await getIncident(incidentData.incident_id);
      if (!stillPending) return;

<<<<<<< HEAD
      console.warn(`⏰ HITL timeout for ${incidentData.incident_id}. Auto-cleaning pending incident.`);
=======
      console.warn(`⏰ HITL timeout for ${incidentData.incident_id}. Auto-cleaning.`);
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
      await removeIncident(incidentData.incident_id);

      try {
        await thread.delete().catch(async () => {
          await thread.send('⏰ **Timeout.** Incident timed out.').catch(() => {});
          await thread.setArchived(true).catch(() => {});
        });
        await message.delete().catch(async () => {
<<<<<<< HEAD
          await message.edit({ content: '⏰ **Incident Timed Out & Archived.**', components: [], embeds: [] }).catch(() => {});
        });
      } catch (error) {
        console.warn(`⚠️ Failed to clean up Discord artifacts for ${incidentData.incident_id}: ${error.message}`);
=======
          await message
            .edit({ content: '⏰ **Incident Timed Out & Archived.**', components: [], embeds: [] })
            .catch(() => {});
        });
      } catch (error) {
        console.warn(`⚠️ Failed to clean up Discord artifacts: ${error.message}`);
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
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
<<<<<<< HEAD
      hitl_expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('❌ Discord Bot Error:', error);
    return { ...incidentData, hitl_status: 'FAILED' };
=======
      hitl_expires_at: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('❌ Discord Bot Error:', error.message);
    return { ...incidentData, hitl_status: 'FAILED', discord_error: error.message };
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

<<<<<<< HEAD
  const [action, incidentId] = interaction.customId.split('_');
=======
  const parts = interaction.customId.split('_');
  const action = parts[0];
  const incidentId = parts.slice(1).join('_');
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

  clearIncidentTimeout(incidentId);

  if (action === 'approve') {
<<<<<<< HEAD
    await interaction.update({ content: '✅ **Fix Accepted.** Deploying PR...', components: [] });
=======
    await interaction.update({ content: '✅ **Fix Accepted.** Deploying PR…', components: [] });
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

    try {
      await fetch(`${ORCHESTRATOR_URL}/internal/discord-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
<<<<<<< HEAD
          'X-Internal-Token': process.env.INTERNAL_CALLBACK_SECRET || ''
        },
        body: JSON.stringify({
          incident_id: incidentId,
          approver: interaction.user.tag
        })
      });
    } catch (err) {
      console.error('❌ Failed to notify orchestrator:', err);
    }
  } else if (action === 'ignore') {
    removeIncident(incidentId);
    await interaction.reply('🗑️ **Incident Ignored.** Cleaning up...');
=======
          'X-Internal-Token': process.env.INTERNAL_CALLBACK_SECRET || '',
        },
        body: JSON.stringify({ incident_id: incidentId, approver: interaction.user.tag }),
      });
    } catch (err) {
      console.error('❌ Failed to notify orchestrator:', err.message);
    }
  } else if (action === 'ignore') {
    await interaction.update({
      content: '🗑️ **Incident Ignored.** Archived.',
      components: [],
      embeds: [],
    });

    await removeIncident(incidentId);
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

    const thread = interaction.message.thread;
    const message = interaction.message;

    try {
<<<<<<< HEAD
      if (thread) {
        console.log(`🗑️ Attempting to delete thread ${thread.id}`);
        await thread.delete();
      } else {
        const threads = await interaction.channel.threads.fetch();
        const foundThread = threads.threads.find((t) => t.name.includes(incidentId));
        if (foundThread) {
          console.log(`🗑️ Found thread by name. Attempting to delete ${foundThread.id}`);
          await foundThread.delete();
        }
      }
    } catch (err) {
      if (err.code === 50013) {
        console.warn('⚠️ Bot lacks "Manage Threads" permission. Archiving thread instead.');
        if (thread) await thread.setArchived(true).catch(() => {});
      } else {
        console.error('❌ Failed to delete thread:', err.message);
      }
    }

    try {
      console.log(`🗑️ Attempting to delete original message ${message.id}`);
      await message.delete();
    } catch (err) {
      if (err.code === 50013) {
        console.warn('⚠️ Bot lacks "Manage Messages" permission. Updating message content instead.');
        await message.edit({ content: '🗑️ **Incident Ignored & Archived.**', components: [], embeds: [] }).catch(() => {});
=======
      if (thread) await thread.delete().catch(async () => thread.setArchived(true).catch(() => {}));
    } catch (err) {
      console.error('❌ Failed to clean up thread:', err.message);
    }

    try {
      await message.delete();
    } catch (err) {
      if (err.code === 50013) {
        await message
          .edit({ content: '🗑️ **Incident Ignored & Archived.**', components: [], embeds: [] })
          .catch(() => {});
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
      } else {
        console.error('❌ Failed to delete message:', err.message);
      }
    }
  }
});
