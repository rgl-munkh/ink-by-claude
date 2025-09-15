import { z } from 'zod';

// Availability schemas
export const availabilityCreateSchema = z.object({
  day: z.number()
    .int()
    .min(0, 'Day must be between 0-6 (Sunday-Saturday)')
    .max(6, 'Day must be between 0-6 (Sunday-Saturday)'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Start time must be in HH:MM:SS format')
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, 'Invalid start time'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'End time must be in HH:MM:SS format')
    .refine((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, 'Invalid end time'),
}).refine((data) => {
  const startMinutes = timeToMinutes(data.startTime);
  const endMinutes = timeToMinutes(data.endTime);
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Booking schemas
export const bookingCreateSchema = z.object({
  tattooistId: z.string()
    .uuid('Invalid tattooist ID format'),
  slot: z.string()
    .datetime('Invalid datetime format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS.sssZ)')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      return date > now;
    }, 'Booking slot must be in the future'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  depositAmount: z.number()
    .int('Deposit amount must be an integer (cents)')
    .min(0, 'Deposit amount must be non-negative')
    .max(100000, 'Deposit amount must be reasonable (max $1000)')
    .optional(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

// Query parameter schemas
export const bookingQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('20'),
  offset: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, 'Offset must be non-negative')
    .optional()
    .default('0'),
});

// Type exports
export type AvailabilityCreateInput = z.infer<typeof availabilityCreateSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;

// Helper function
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}