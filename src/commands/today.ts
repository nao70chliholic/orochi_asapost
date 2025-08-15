import { SlashCommandBuilder, CommandInteraction, Client } from 'discord.js';
import { postDaily } from '../services/post';

export const data = new SlashCommandBuilder()
  .setName('today')
  .setDescription('Post today\'s anniversaries immediately');

export async function execute(interaction: CommandInteraction, client: Client) {
  await interaction.deferReply(); // 遅延応答を追加
  await postDaily(client, process.env.POST_CHANNEL_ID!, interaction);
}
