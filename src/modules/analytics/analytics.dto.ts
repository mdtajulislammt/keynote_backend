import { z } from 'zod';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const userAnalyticsParamSchema = z.object({
  userId: z.string().regex(objectIdRegex, 'Invalid User ID format'),
});

export type UserAnalyticsParamDto = z.infer<typeof userAnalyticsParamSchema>;
