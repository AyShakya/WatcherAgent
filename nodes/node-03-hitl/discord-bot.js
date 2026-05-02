// nodes/node-03-hitl/discord-bot.js
// Guardian Node 03 — Discord HITL (Human-in-the-Loop)
// Manages Discord incident threads and approval buttons

import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import dotenv from 'dotenv';
import {
  getIncident,
  removeIncident,
  saveIncidentTimeout,
  clearIncidentTimeout
} from '../../services/incident-store.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;
const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);

let botReady = false;

client.once('ready', () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
  botReady = true;
});

export async function loginBot() {
  if (!DISCORD_TOKEN) {
    console.warn('⚠️ DISCORD_BOT_TOKEN not set. Discord notifications are disabled.');
    return;
  }

  if (botReady) return;

  await client.login(DISCORD_TOKEN);

  await new Promise((resolve, reject) => {
    if (botReady) {
      resolve();
      return;
    }

    client.once('ready', resolve);
    setTimeout(() => reject(new Error('Discord bot login timeout')), 15000);
  });
}

export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.error('❌ Discord credentials missing. Skipping Discord notification.');
    return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
  }

  if (!botReady) {
    console.error('❌ Discord bot is not ready. Was loginBot() called at startup?');
    return { ...incidentData, hitl_status: 'FAILED_BOT_NOT_READY' };
  }

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor(incidentData.severity === 'P1' ? 0xFF0000 : 0xFFA500)
      .setTitle(`🚨 Incident Triage: ${incidentData.service}`)
      .setDescription(incidentData.reasoning)
      .addFields(
        { name: 'Severity', value: incidentData.severity, inline: true },
        { name: 'Confidence', value: `${incidentData.confidence}%`, inline: true },
        { name: 'Suggested Fix', value: incidentData.runbooks[0]?.steps.join('\n') || 'No automated fix found.' }
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
      name: `thread-${incidentData.incident_id}`,
      autoArchiveDuration: 60
    });

    await thread.send(`Thread started for ${incidentData.incident_id}. Awaiting human decision...`);

    const timeout = setTimeout(async () => {
      const stillPending = getIncident(incidentData.incident_id);
      if (!stillPending) {
        return;
      }

      console.warn(`⏰ HITL timeout for ${incidentData.incident_id}. Auto-cleaning pending incident.`);
      removeIncident(incidentData.incident_id);

      try {
        await thread.send(`⏰ **Timeout.** Incident ${incidentData.incident_id} timed out without a human decision.`);
      } catch (error) {
        console.warn(`⚠️ Failed to post timeout notice for ${incidentData.incident_id}: ${error.message}`);
      }
    }, HITL_TIMEOUT_MS);

    saveIncidentTimeout(incidentData.incident_id, timeout);

    return {
      ...incidentData,
      discord_message_id: message.id,
      discord_thread_id: thread.id,
      hitl_status: 'AWAITING_APPROVAL'
    };
  } catch (error) {
    console.error('❌ Discord Bot Error:', error);
    return { ...incidentData, hitl_status: 'FAILED' };
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, incidentId] = interaction.customId.split('_');

  clearIncidentTimeout(incidentId);

  if (action === 'approve') {
    await interaction.update({ content: '✅ **Fix Accepted.** Deploying PR...', components: [] });

    try {
      await fetch(`http://localhost:${process.env.PORT || 3000}/internal/discord-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    const thread = interaction.message.thread;
    const message = interaction.message;

    try {
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
      } else {
        console.error('❌ Failed to delete message:', err.message);
      }
    }
  }
});
