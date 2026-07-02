import { z } from 'zod';

const snowflakeSchema = z
  .string()
  .trim()
  .regex(/^\d{17,20}$/, 'Enter a valid Discord snowflake ID');

export const updateSettingsSchema = z.object({
  guildId: z.union([snowflakeSchema, z.literal('')]).optional(),
  mainChannelId: z.union([snowflakeSchema, z.literal('')]).optional(),
  mirrorChannelId: z.union([snowflakeSchema, z.literal('')]).optional(),
  mirrorWebhookUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
  enableAI: z.boolean(),
  enableNotifications: z.boolean(),
  autoReply: z.boolean(),
  commandConfiguration: z.object({
    reportEnabled: z.boolean(),
    statusEnabled: z.boolean(),
  }),
});
