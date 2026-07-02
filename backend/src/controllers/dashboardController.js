import { apiResponse } from '../utils/apiResponse.js';
import { getAnalyticsSummary, getDashboardSummary } from '../services/commandService.js';
import { getSettingsForAdmin } from '../services/settingsService.js';
import { env } from '../config/env.js';
import { isDatabaseConnected } from '../database/mongoose.js';

export const getDashboardController = async (req, res) => {
  const settings = await getSettingsForAdmin(req.user.id);
  const summary = await getDashboardSummary(settings.guildId);

  const mirrorConfigured = Boolean(settings.enableNotifications && settings.mirrorWebhookUrl);

  return res.json(
    apiResponse({
      message: 'Dashboard loaded',
      data: {
        ...summary,
        botStatus: 'online',
        connectedServer: settings.guildId
          ? settings.mainChannelId || 'Main channel not configured'
          : 'Configure your Discord server in Settings',
        mirrorStatus: mirrorConfigured ? 'enabled' : 'disabled',
        aiStatus: settings.enableAI && env.OPENAI_API_KEY ? 'enabled' : 'disabled',
        guildConfigured: Boolean(settings.guildId),
      },
    }),
  );
};

export const getAnalyticsController = async (req, res) => {
  const settings = await getSettingsForAdmin(req.user.id);
  const analytics = await getAnalyticsSummary(settings.guildId);

  return res.json(
    apiResponse({
      message: 'Analytics loaded',
      data: analytics,
    }),
  );
};

export const getSystemStatusController = async (req, res) =>
  res.json(
    apiResponse({
      message: 'System status loaded',
      data: {
        botOnline: true,
        databaseConnected: isDatabaseConnected(),
        serverRunning: true,
      },
    }),
  );
