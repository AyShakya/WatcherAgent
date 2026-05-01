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

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// These will be loaded from your .env later
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_INCIDENT_CHANNEL_ID;

/**
 * Sends an incident approval card to Discord.
 * Creates a private thread for the incident.
 */
export async function sendApprovalCard(incidentData) {
  if (!DISCORD_TOKEN || !CHANNEL_ID) {
    console.error('❌ Discord credentials missing. Skipping Discord notification.');
    return { ...incidentData, hitl_status: 'SKIPPED_NO_AUTH' };
  }

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    
    // 1. Create the Embed (The visual card)
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

    // 2. Create the Buttons
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

    // 3. Send the message
    const message = await channel.send({ embeds: [embed], components: [row] });

    // 4. Start a thread for this incident
    const thread = await message.startThread({
      name: `thread-${incidentData.incident_id}`,
      autoArchiveDuration: 60,
    });

    await thread.send(`Thread started for ${incidentData.incident_id}. Awaiting human decision...`);

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

// Handle Button Interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, incidentId] = interaction.customId.split('_');

  if (action === 'approve') {
    await interaction.update({ content: '✅ **Fix Accepted.** Deploying PR...', components: [] });
    
    // Notify the orchestrator to proceed to Phase 4 & 5
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
    await interaction.reply('🗑️ **Incident Ignored.** Cleaning up...');
    
    const thread = interaction.message.thread;
    const message = interaction.message;

    // 1. Try to delete the thread
    try {
      if (thread) {
        console.log(`🗑️ Attempting to delete thread ${thread.id}`);
        await thread.delete();
      } else {
        const threads = await interaction.channel.threads.fetch();
        const foundThread = threads.threads.find(t => t.name.includes(incidentId));
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

    // 2. Try to delete the original message
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

// Login the bot
if (DISCORD_TOKEN) {
  client.login(DISCORD_TOKEN);
}
