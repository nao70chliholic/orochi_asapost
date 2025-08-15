import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

export const data = new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Clear anniversary cache');

export async function execute(interaction: CommandInteraction) {
  const cacheDir = path.join(process.cwd(), 'tmp');
  try {
    const files = await fs.readdir(cacheDir);
    for (const file of files) {
      if (file.startsWith('.anniv-')) {
        await fs.unlink(path.join(cacheDir, file));
      }
    }
    await interaction.reply('♻️ Reloaded!');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await interaction.reply('Cache directory not found. Nothing to reload.');
    } else {
      console.error('Failed to clear cache:', error);
      await interaction.reply('❌ Failed to reload cache.');
    }
  }
}
