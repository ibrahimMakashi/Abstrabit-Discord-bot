import { z } from 'zod';

export const commandQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(''),
  status: z.string().trim().optional().default(''),
  commandType: z.string().trim().optional().default(''),
  sortBy: z.enum(['createdAt', 'executionTimeMs', 'retryCount', 'username', 'commandName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
