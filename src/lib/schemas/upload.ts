import { z } from 'zod';

export const presignedUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters')
    .regex(/^[^\/\\<>:"|?*]+\.[a-zA-Z0-9]+$/, 'Invalid filename format'),
  contentType: z.string()
    .min(1, 'Content type is required')
    .regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Only image files are allowed'),
  folder: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid folder name')
    .default('portfolio'),
});

export const portfolioCreateSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  styleTags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').default([]),
});

export const portfolioUpdateSchema = z.object({
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  styleTags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional(),
});

export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>;
export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;