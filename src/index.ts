import { Client, GatewayIntentBits, Interaction, TextChannel, EmbedBuilder } from 'discord.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as todayCommand from './commands/today';
import * as reloadCommand from './commands/reload';
import { getTodaysAnniversaries } from './services/anniversaries';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', async () => {
  logger.info('Bot is ready!');

  const commands = [todayCommand.data.toJSON(), reloadCommand.data.toJSON()];
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands },
    );
    logger.info('Successfully registered application commands.');
  } catch (error) {
    logger.error(error as any);
  }
});

export async function dailyJob() {
  logger.info('Running daily job...');
  try {
    const today = new Date();
    const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const list = await getTodaysAnniversaries(today);

    const channel = await client.channels.fetch(process.env.POST_CHANNEL_ID!) as TextChannel;
    if (!channel || !(channel instanceof TextChannel)) {
      logger.warn(`Channel ${process.env.POST_CHANNEL_ID!} not found or is not a text channel.`);
      return;
    }

    if (list.length === 0) {
      logger.info('No anniversaries to post today.');
      await channel.send(`今日の記念日一覧 (${dateString})\n今日の記念日はありません。`);
      return;
    }

    const description = list
      .map((a, i) => `${i + 1}. **${a.title}** – ${a.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`今日の記念日一覧 (${dateString})`)
      .setDescription(description.length > 4096 ? description.substring(0, 4093) + '...' : description)
      .setColor('#0099ff');

    await channel.send({ embeds: [embed] });
    logger.info(`Posted daily anniversaries to channel ${process.env.POST_CHANNEL_ID!}`);
  } catch (error) {
    logger.error(error, 'Failed to run daily job');
  }
}

cron.schedule('0 6 * * *', dailyJob, {
  timezone: 'Asia/Tokyo',
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'today') {
      await todayCommand.execute(interaction, client);
    } else if (commandName === 'reload') {
      await reloadCommand.execute(interaction);
    }
  } catch (error) {
    logger.error(error as any, `Failed to execute command: ${commandName}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);