'''import { SlashCommandBuilder } from 'discord.js';
import { postDaily } from '../services/post';
import type { CommandInteraction, Client } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('today')
  .setDescription("Post today's anniversaries immediately");

export async function execute(interaction: CommandInteraction, client: Client) {
  await postDaily(client, process.env.POST_CHANNEL_ID!);
  await interaction.reply('✅ Posted!');
}
'''