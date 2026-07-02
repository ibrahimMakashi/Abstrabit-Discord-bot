import { StatusCodes } from 'http-status-codes';
import { Settings } from '../models/Settings.js';
import { AppError } from '../utils/AppError.js';
import { decryptSecret, encryptSecret } from '../utils/encryption.js';

const decryptStoredSecrets = (settings) => ({
  mainChannelId: decryptSecret(settings.mainChannelIdEnc),
  mirrorChannelId: decryptSecret(settings.mirrorChannelIdEnc),
  mirrorWebhookUrl: decryptSecret(settings.mirrorWebhookUrlEnc),
});

const toPublicSettings = (settings, secrets) => ({
  id: settings.id,
  guildId: settings.guildId || '',
  mainChannelId: secrets.mainChannelId || '',
  mirrorChannelId: secrets.mirrorChannelId || '',
  mirrorWebhookUrl: secrets.mirrorWebhookUrl || '',
  enableAI: settings.enableAI,
  enableNotifications: settings.enableNotifications,
  autoReply: settings.autoReply,
  commandConfiguration: settings.commandConfiguration,
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

export const getDefaultInteractionSettings = () => ({
  enableAI: true,
  enableNotifications: false,
  autoReply: true,
  commandConfiguration: {
    reportEnabled: true,
    statusEnabled: true,
  },
  mainChannelId: null,
  mirrorChannelId: null,
  mirrorWebhookUrl: null,
});

export const getSettingsForAdmin = async (adminId) => {
  let settings = await Settings.findOne({ adminId });

  if (!settings) {
    settings = await Settings.create({ adminId });
  }

  return toPublicSettings(settings, decryptStoredSecrets(settings));
};

export const getSettingsByGuildId = async (guildId) => {
  if (!guildId) {
    return null;
  }

  const settings = await Settings.findOne({ guildId });

  if (!settings) {
    return null;
  }

  const secrets = decryptStoredSecrets(settings);

  return {
    ...settings.toObject(),
    ...secrets,
  };
};

export const updateSettingsForAdmin = async (adminId, payload) => {
  let settings = await Settings.findOne({ adminId });

  if (!settings) {
    settings = new Settings({ adminId });
  }

  if (payload.guildId) {
    const existingGuild = await Settings.findOne({
      guildId: payload.guildId,
      adminId: { $ne: adminId },
    });

    if (existingGuild) {
      throw new AppError(
        'This Discord server is already linked to another admin account',
        StatusCodes.CONFLICT,
      );
    }

    settings.guildId = payload.guildId;
  } else if (payload.guildId === '') {
    settings.guildId = undefined;
  }

  if (payload.mainChannelId !== undefined) {
    settings.mainChannelIdEnc = encryptSecret(payload.mainChannelId || null);
  }

  if (payload.mirrorChannelId !== undefined) {
    settings.mirrorChannelIdEnc = encryptSecret(payload.mirrorChannelId || null);
  }

  if (payload.mirrorWebhookUrl !== undefined) {
    settings.mirrorWebhookUrlEnc = encryptSecret(payload.mirrorWebhookUrl || null);
  }

  if (payload.enableAI !== undefined) {
    settings.enableAI = payload.enableAI;
  }

  if (payload.enableNotifications !== undefined) {
    settings.enableNotifications = payload.enableNotifications;
  }

  if (payload.autoReply !== undefined) {
    settings.autoReply = payload.autoReply;
  }

  if (payload.commandConfiguration) {
    settings.commandConfiguration = payload.commandConfiguration;
  }

  await settings.save();

  return toPublicSettings(settings, decryptStoredSecrets(settings));
};
