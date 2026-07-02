import axios from 'axios';
import { InteractionResponseType, verifyKey } from 'discord-interactions';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { isDatabaseConnected } from '../database/mongoose.js';

export const verifyDiscordRequest = ({ signature, timestamp, rawBody }) => {
  if (!env.DISCORD_PUBLIC_KEY) {
    throw new AppError('Discord public key is not configured', StatusCodes.SERVICE_UNAVAILABLE);
  }

  if (!signature || !timestamp || !rawBody) {
    throw new AppError('Missing Discord signature headers', StatusCodes.UNAUTHORIZED);
  }

  const isValid = verifyKey(rawBody, signature, timestamp, env.DISCORD_PUBLIC_KEY);

  if (!isValid) {
    throw new AppError('Invalid Discord signature', StatusCodes.UNAUTHORIZED);
  }
};

export const ensureInteractionFresh = (timestamp) => {
  const interactionTime = Number(timestamp) * 1000;

  if (Number.isNaN(interactionTime) || Date.now() - interactionTime > env.INTERACTION_MAX_AGE_MS) {
    throw new AppError('Replay attack detected', StatusCodes.UNAUTHORIZED);
  }
};

export const buildDiscordReply = (content) => ({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content,
  },
});

const formatReportQuote = (reportText) =>
  reportText
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');

export const buildReportReply = ({ username, reportText, includeUsername = true }) => {
  const header = includeUsername
    ? `Report received from **${username}**.`
    : 'Report received.';
  const body = `\n\n**Submitted report:**\n${formatReportQuote(reportText)}`;
  const full = `${header}${body}`;

  if (full.length <= 2000) {
    return full;
  }

  const suffix = '...';
  const maxReportLength = 2000 - header.length - '\n\n**Submitted report:**\n> '.length - suffix.length;
  const truncated = reportText.slice(0, Math.max(0, maxReportLength));

  return `${header}\n\n**Submitted report:**\n${formatReportQuote(truncated)}${suffix}`;
};

export const getStatusResponseText = () =>
  [
    'Bot Online: Yes',
    `Database Connected: ${isDatabaseConnected() ? 'Yes' : 'No'}`,
    'Server Running: Yes',
  ].join('\n');

export const registerDiscordCommands = async () => {
  if (!env.DISCORD_APPLICATION_ID || !env.DISCORD_BOT_TOKEN) {
    return { skipped: true };
  }

  const commands = [
    {
      name: 'report',
      description: 'Submit a production issue report',
      options: [
        {
          type: 3,
          name: 'message',
          description: 'Describe the issue',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      description: 'Check bot and backend health status',
    },
  ];

  const url = `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`;

  await axios.put(url, commands, {
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return { skipped: false, commandsRegistered: commands.length };
};
