import { Client, GatewayIntentBits } from 'discord.js';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as todayCommand from './commands/today';
import * as reloadCommand from './commands/reload';

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
    logger.error(error);
  }
});

import { postDaily } from './services/post';

export async function dailyJob() {
  logger.info('Running daily job...');
  await postDaily(client, process.env.POST_CHANNEL_ID!)
}

cron.schedule('0 6 * * *', dailyJob, {
  timezone: 'Asia/Tokyo',
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'today') {
    await todayCommand.execute(interaction, client);
  } else if (commandName === 'reload') {
    await reloadCommand.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
