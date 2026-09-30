import { z } from 'zod';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const postIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid Post ID format'),
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  body: z.string().trim().min(1, 'Body is required'),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;

export const postQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID filter').optional(),
});

export type PostQueryDto = z.infer<typeof postQuerySchema>;
