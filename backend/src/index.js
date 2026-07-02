/**
 * Local development entry (Render, nodemon). Vercel uses api/index.js instead.
 */
import http from 'node:http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { connectDatabase } from './src/database/mongoose.js';
import { initializeSocket } from './src/socket/index.js';
import { startRetryQueueJob } from './src/jobs/retryQueueJob.js';
import { registerDiscordCommands } from './src/services/discordService.js';

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
