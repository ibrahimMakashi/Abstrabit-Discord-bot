import { InteractionType } from 'discord-interactions';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import {
  createCommandRecord,
  hasProcessedInteraction,
} from '../services/commandService.js';
import {
  buildDiscordReply,
  buildReportReply,
  ensureInteractionFresh,
  getStatusResponseText,
} from '../services/discordService.js';
import {
  getDefaultInteractionSettings,
  getSettingsByGuildId,
} from '../services/settingsService.js';
import { queueReportProcessing } from '../services/reportProcessingService.js';
import { emitSocketEvent } from '../socket/index.js';

const getDiscordUsername = (interaction) =>
  interaction.member?.user?.username || interaction.user?.username || 'unknown-user';

const getDiscordUserId = (interaction) => interaction.member?.user?.id || interaction.user?.id || 'unknown-user-id';

const resolveInteractionSettings = async (guildId) =>
  (await getSettingsByGuildId(guildId)) || getDefaultInteractionSettings();

export const interactionHealthController = async (req, res) =>
  res.json({ ok: true });

export const interactionsController = async (req, res) => {
  logger.info(
    {
      interactionType: req.body?.type,
      commandName: req.body?.data?.name,
    },
    'Discord interaction received',
  );

  ensureInteractionFresh(req.headers['x-signature-timestamp']);

  const interaction = req.body;

  if (await hasProcessedInteraction(interaction.id)) {
    throw new AppError('Duplicate interaction received', StatusCodes.CONFLICT);
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    await createCommandRecord({
      interactionId: interaction.id,
      commandType: 'component',
      commandName: interaction.data?.custom_id || 'component',
      username: getDiscordUsername(interaction),
      userId: getDiscordUserId(interaction),
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
      responseMessage: 'Component interaction handled.',
      status: 'success',
    });

    return res.json(buildDiscordReply('Component interaction received.'));
  }

  if (interaction.type === InteractionType.MODAL_SUBMIT) {
    await createCommandRecord({
      interactionId: interaction.id,
      commandType: 'modal',
      commandName: interaction.data?.custom_id || 'modal_submit',
      username: getDiscordUsername(interaction),
      userId: getDiscordUserId(interaction),
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
      responseMessage: 'Modal submission handled.',
      status: 'success',
    });

    return res.json(buildDiscordReply('Modal submission received.'));
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND) {
    return res.json(buildDiscordReply('Interaction received.'));
  }

  const commandName = interaction.data?.name;

  if (commandName === 'status') {
    const startedAt = Date.now();
    const settings = await resolveInteractionSettings(interaction.guild_id);

    if (!settings.commandConfiguration?.statusEnabled) {
      return res.json(buildDiscordReply('The /status command is currently disabled.'));
    }

    const command = await createCommandRecord({
      interactionId: interaction.id,
      commandType: 'status',
      commandName: 'status',
      username: getDiscordUsername(interaction),
      userId: getDiscordUserId(interaction),
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
      responseMessage: getStatusResponseText(),
      status: 'success',
      executionTimeMs: Date.now() - startedAt,
    });

    emitSocketEvent('command:created', command);

    return res.json(buildDiscordReply(command.responseMessage));
  }

  if (commandName === 'report') {
    const settings = await resolveInteractionSettings(interaction.guild_id);

    if (!settings.commandConfiguration?.reportEnabled) {
      return res.json(buildDiscordReply('The /report command is currently disabled.'));
    }

    const reportText =
      interaction.data?.options?.find((option) => option.name === 'message')?.value?.trim() || '';

    if (!reportText) {
      return res.json(buildDiscordReply('Report message is required.'));
    }

    const username = getDiscordUsername(interaction);
    const immediateReply = buildReportReply({
      username,
      reportText,
      includeUsername: settings.autoReply,
    });

    const command = await createCommandRecord({
      interactionId: interaction.id,
      commandType: 'report',
      commandName: 'report',
      username,
      userId: getDiscordUserId(interaction),
      guildId: interaction.guild_id,
      channelId: interaction.channel_id,
      requestContent: reportText,
      responseMessage: immediateReply,
      status: 'processing',
      mirrorStatus: 'pending',
    });

    emitSocketEvent('command:created', command);

    res.json(buildDiscordReply(immediateReply));
    queueReportProcessing({ command, reportText, settings });
    return undefined;
  }

  return res.json(buildDiscordReply(`Unsupported slash command: ${commandName}`));
};
