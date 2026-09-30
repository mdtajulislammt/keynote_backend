import { z } from 'zod';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const noteIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid Note ID format'),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().trim().min(1, 'Content is required'),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z.string().trim().min(1, 'Content cannot be empty').optional(),
});

export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;

export const noteQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type NoteQueryDto = z.infer<typeof noteQuerySchema>;
