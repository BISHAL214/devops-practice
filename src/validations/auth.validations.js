import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(255, 'Name must be at most 255 characters long')
    .trim(),
  email: z
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters long')
    .max(255, 'Email must be at most 255 characters long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 255 characters long'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters long')
    .max(255, 'Email must be at most 255 characters long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 255 characters long'),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(255, 'Name must be at most 255 characters long')
    .trim()
    .optional(),
  email: z
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters long')
    .max(255, 'Email must be at most 255 characters long')
    .toLowerCase()
    .trim()
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password must be at most 255 characters long')
    .optional(),
  role: z.enum(['user', 'admin']).optional(),
});
