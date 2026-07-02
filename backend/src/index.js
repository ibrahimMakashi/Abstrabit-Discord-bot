/**
 * Local development entry (Render, nodemon). Vercel uses api/index.js instead.
 */
import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './database/mongoose.js';
import { initializeSocket } from './socket/index.js';
import { startRetryQueueJob } from './jobs/retryQueueJob.js';
import { registerDiscordCommands } from './services/discordService.js';

const bootstrap = async () => {
  await connectDatabase();
 
  const commandRegistration = await registerDiscordCommands();
  if (commandRegistration.skipped) {
    logger.warn('Discord slash commands were not registered. Check DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN.');
  } else {
    logger.info(
      { commandsRegistered: commandRegistration.commandsRegistered },
      'Discord slash commands registered',
    );
  }

  const server = http.createServer(app);
  initializeSocket(server, env.FRONTEND_URL);
  startRetryQueueJob();

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Backend server started');
  });
};

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Failed to bootstrap application');
  process.exit(1);
});
