export const DISCORD_SETUP_SKIPPED_KEY = 'discord-setup-skipped';

export const isDiscordSetupComplete = (settings) =>
  Boolean(
    settings?.guildId?.trim() &&
      settings?.mainChannelId?.trim() &&
      settings?.mirrorChannelId?.trim() &&
      settings?.mirrorWebhookUrl?.trim(),
  );

export const clearDiscordSetupSkip = () => {
  sessionStorage.removeItem(DISCORD_SETUP_SKIPPED_KEY);
};

export const markDiscordSetupSkipped = () => {
  sessionStorage.setItem(DISCORD_SETUP_SKIPPED_KEY, 'true');
};

export const hasSkippedDiscordSetup = () => Boolean(sessionStorage.getItem(DISCORD_SETUP_SKIPPED_KEY));
