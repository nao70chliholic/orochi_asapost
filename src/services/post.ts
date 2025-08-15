import { Client, EmbedBuilder, CommandInteraction } from 'discord.js';
import { getTodaysAnniversaries } from './anniversaries';
import { logger } from '../utils/logger';

export async function postDaily(client: Client, channelId: string, interaction: CommandInteraction): Promise<void> {
  try {
    const today = new Date();
    const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const list = await getTodaysAnniversaries(new Date());

    if (list.length === 0) {
      logger.info('No anniversaries to post today.');
      await interaction.editReply(`今日の記念日一覧 (${dateString})
今日の記念日はありません。`);
      return;
    }

    const description = list      .map((a, i) => `${i + 1}. **${a.title}** – ${a.description}`)      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`今日の記念日一覧 (${dateString})`)
      .setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description)
      .setColor('#0099ff');

    await interaction.editReply({ embeds: [embed] });
    logger.info(`Posted daily anniversaries to channel ${channelId}`);

  } catch (error) {
    logger.error(error, 'Failed to post daily anniversaries');
  }
}
