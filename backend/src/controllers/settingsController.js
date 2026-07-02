import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils/apiResponse.js';
import { getSettingsForAdmin, updateSettingsForAdmin } from '../services/settingsService.js';
import { createAuditLog } from '../services/auditService.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const BOT_PERMISSIONS = 84992;

export const getDiscordInviteController = async (req, res) => {
  if (!env.DISCORD_APPLICATION_ID) {
    throw new AppError('Discord application is not configured', StatusCodes.SERVICE_UNAVAILABLE);
  }

  const inviteUrl = new URL('https://discord.com/api/oauth2/authorize');
  inviteUrl.searchParams.set('client_id', env.DISCORD_APPLICATION_ID);
  inviteUrl.searchParams.set('permissions', String(BOT_PERMISSIONS));
  inviteUrl.searchParams.set('scope', 'bot applications.commands');

  return res.json(
    apiResponse({
      message: 'Discord invite link loaded',
      data: {
        inviteUrl: inviteUrl.toString(),
      },
    }),
  );
};

const redactSensitiveSettings = (payload) => ({
  ...payload,
  mainChannelId: payload.mainChannelId ? '[redacted]' : payload.mainChannelId,
  mirrorChannelId: payload.mirrorChannelId ? '[redacted]' : payload.mirrorChannelId,
  mirrorWebhookUrl: payload.mirrorWebhookUrl ? '[redacted]' : payload.mirrorWebhookUrl,
});

export const getSettingsController = async (req, res) => {
  const settings = await getSettingsForAdmin(req.user.id);

  return res.json(
    apiResponse({
      message: 'Settings loaded',
      data: settings,
    }),
  );
};

export const updateSettingsController = async (req, res) => {
  const settings = await updateSettingsForAdmin(req.user.id, req.validated.body);

  await createAuditLog({
    actorId: req.user.id,
    action: 'settings.update',
    target: 'settings',
    details: redactSensitiveSettings(req.validated.body),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json(
    apiResponse({
      message: 'Settings saved',
      data: settings,
    }),
  );
};
