import { z } from 'zod';
import { UserRole } from '../../constants';

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const userIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid User ID format'),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters'),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).default(UserRole.USER),
  interests: z.array(z.string().trim().min(1)).optional().default([]),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100).optional(),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
  interests: z.array(z.string().trim().min(1)).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
});

export type UserQueryDto = z.infer<typeof userQuerySchema>;
