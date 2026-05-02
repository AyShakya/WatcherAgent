// nodes/node-03-hitl/discord-bot.js
// Guardian Node 03 — Discord HITL (Human-in-the-Loop)
// Lazy-initialises the Discord client on first use so the server can
// boot and handle webhooks even when DISCORD_BOT_TOKEN is absent.

import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;

let client = null;
let botReady = false;

/**
 * Returns an initialised, logged-in Discord client.
 * Creates the client and logs in once; returns the same instance after that.
 */
async function getClient() {
  if (!DISCORD_TOKEN || !CHANNEL_ID) return null;

  if (client && botReady) return client;

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  // Wire interaction handler before login
  client.on('interactionCreate', handleInteraction);

  await new Promise((resolve, reject) => {
    client.once('ready', () => {
      console.log(`🤖 Discord bot logged in as ${client.user?.tag}`);
      botReady = true;
      resolve();
    });
    client.once('error', reject);
    client.login(DISCORD_TOKEN).catch(reject);
  });

  return client;
}

/**
 * Sends an incident approval card to Discord.
 */
export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.warn('⚠️  Discord credentials missing — skipping HITL notification.');
    return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
  }

  try {
    const discord = await getClient();
    if (!discord) {
      return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
    }

    const channel = await discord.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
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
      name: `inc-${incidentData.incident_id}`,
      autoArchiveDuration: 60,
    });
    await thread.send(`Thread opened for ${incidentData.incident_id}. Awaiting human decision…`);

    console.log(`📨 Discord approval card sent for ${incidentData.incident_id}`);

    return {
      ...incidentData,
      discord_message_id: message.id,
      discord_thread_id: thread.id,
      hitl_status: 'AWAITING_APPROVAL',
    };
  } catch (error) {
    console.error('❌ Discord Bot Error:', error.message);
    return { ...incidentData, hitl_status: 'FAILED', discord_error: error.message };
  }
}

/**
 * Handles Discord button interactions (approve / ignore).
 */
async function handleInteraction(interaction) {
  if (!interaction.isButton()) return;

  const parts = interaction.customId.split('_');
  const action = parts[0];
  const incidentId = parts.slice(1).join('_');

  if (action === 'approve') {
    await interaction.update({ content: '✅ **Fix Accepted.** Deploying PR…', components: [] });

    try {
      await fetch(
        `http://localhost:${process.env.PORT || 3001}/internal/discord-approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incident_id: incidentId,
            approver: interaction.user.tag,
          }),
        }
      );
    } catch (err) {
      console.error('❌ Failed to notify orchestrator:', err.message);
    }
  } else if (action === 'ignore') {
    await interaction.update({
      content: '🗑️ **Incident Ignored.** Archived.',
      components: [],
      embeds: [],
    });

    // Notify orchestrator to remove from store
    try {
      await fetch(
        `http://localhost:${process.env.PORT || 3001}/internal/discord-ignore`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident_id: incidentId }),
        }
      );
    } catch (err) {
      console.error('❌ Failed to notify orchestrator of ignore:', err.message);
    }

    const thread = interaction.message.thread;
    if (thread) {
      await thread.setArchived(true).catch(() => {});
    }
  }
}
