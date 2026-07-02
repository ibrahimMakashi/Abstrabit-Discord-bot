import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectDatabase } from '../src/database/mongoose.js';
import { registerDiscordCommands } from '../src/services/discordService.js';
import { logger } from '../src/config/logger.js';

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
  try {
    await connectDatabase();
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed during request');
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
      data: {
        error: error.message,
        hint: 'Check MONGODB_URI on Vercel and MongoDB Atlas Network Access (0.0.0.0/0).',
      },
    });
  }

  await registerCommandsOnce();

  if (!handler) {
    handler = serverless(app);
  }

  return handler(req, res);
}
