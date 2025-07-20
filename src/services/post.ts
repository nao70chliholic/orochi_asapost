import { Client, EmbedBuilder } from 'discord.js';
import { getTodaysAnniversaries } from './anniversaries';
import { logger } => '../utils/logger';

export async function postDaily(client: Client, channelId: string): Promise<void> {
  try {
    const list = await getTodaysAnniversaries(new Date());

    if (list.length === 0) {
      logger.info('No anniversaries to post today.');
      return;
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

    const description = list
      .map((a, i) => `${i + 1}. **${a.title}** – ${a.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`今日の記念日一覧 (${dateString})`)
      .setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description)
      .setColor('#0099ff');

    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [embed] });
      logger.info(`Posted daily anniversaries to channel ${channelId}`);
    }
  } catch (error) {
    logger.error(error, 'Failed to post daily anniversaries');
  }
}