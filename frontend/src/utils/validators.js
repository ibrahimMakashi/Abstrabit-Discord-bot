import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const snowflakeSchema = z
  .string()
  .regex(/^\d{17,20}$/, 'Enter a valid Discord snowflake ID');

export const settingsSchema = z.object({
  guildId: z.union([snowflakeSchema, z.literal('')]),
  mainChannelId: z.union([snowflakeSchema, z.literal('')]),
  mirrorChannelId: z.union([snowflakeSchema, z.literal('')]),
  mirrorWebhookUrl: z.string().url('Enter a valid webhook URL').or(z.literal('')),
  enableAI: z.boolean(),
  enableNotifications: z.boolean(),
  autoReply: z.boolean(),
  commandConfiguration: z.object({
    reportEnabled: z.boolean(),
    statusEnabled: z.boolean(),
  }),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
});
