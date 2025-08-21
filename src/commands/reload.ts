'''import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import type { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Clear anniversary cache');

export async function execute(interaction: CommandInteraction) {
  const cacheDir = path.join(process.cwd(), 'tmp');
  const files = await fs.readdir(cacheDir);
  for (const file of files) {
    if (file.startsWith('.anniv-')) {
      await fs.unlink(path.join(cacheDir, file));
    }
  }
  await interaction.reply('♻️ Reloaded!');
}
'''