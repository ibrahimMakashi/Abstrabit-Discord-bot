import serverless from 'serverless-http';
import app from './src/app.js';
import { connectDatabase } from './src/database/mongoose.js';
import { registerDiscordCommands } from './src/services/discordService.js';
import { logger } from './src/config/logger.js';

let handler;
let commandsRegistered = false;

const registerCommandsOnce = async () => {
  if (commandsRegistered) {
    return;
  }

  try {
    const result = await registerDiscordCommands();
    if (!result.skipped) {
      logger.info({ commandsRegistered: result.commandsRegistered }, 'Discord slash commands registered');
    }
    commandsRegistered = true;
  } catch (error) {
    logger.warn({ err: error }, 'Discord slash command registration failed');
  }
};

export default async function vercelHandler(req, res) {
  await connectDatabase();
  await registerCommandsOnce();

  if (!handler) {
    handler = serverless(app);
  }

  return handler(req, res);
}
