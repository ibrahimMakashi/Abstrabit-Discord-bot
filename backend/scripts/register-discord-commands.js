import { connectDatabase } from '../src/database/mongoose.js';
import { registerDiscordCommands } from '../src/services/discordService.js';
import { logger } from '../src/config/logger.js';

const run = async () => {
  await connectDatabase();
  const result = await registerDiscordCommands();

  if (result.skipped) {
    logger.error('Discord command registration skipped. Set DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN.');
    process.exit(1);
  }

  logger.info({ commandsRegistered: result.commandsRegistered }, 'Discord slash commands registered');
  process.exit(0);
};

run().catch((error) => {
  logger.error({ err: error }, 'Discord command registration failed');
  process.exit(1);
});
