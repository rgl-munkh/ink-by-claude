import { z } from 'zod';

export const signupSchema = z.object({
  firstName: z.string().max(255, 'First name must be less than 255 characters').optional().default(''),
  lastName: z.string().max(255, 'Last name must be less than 255 characters').optional().default(''),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(100, 'Password must be less than 100 characters'),
  role: z.enum(['customer', 'tattooist', 'admin']).default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;