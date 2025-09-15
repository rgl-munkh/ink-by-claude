import { eq, and, gte, lte, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { availability, bookings } from '@/lib/db/schema';

export interface TimeSlot {
  day: number;
  startTime: string;
  endTime: string;
}

export interface BookingSlot {
  tattooistId: string;
  slot: Date;
  duration?: number; // in minutes, defaults to 60
}

/**
 * Validates if a booking slot falls within tattooist's availability
 */
export async function validateSlotAvailability(
  tattooistId: string,
  slot: Date,
  duration: number = 60
): Promise<{ isValid: boolean; reason?: string }> {
  const dayOfWeek = slot.getDay(); // 0 = Sunday, 6 = Saturday
  const slotTime = formatTimeFromDate(slot);
  const slotEndTime = formatTimeFromDate(new Date(slot.getTime() + duration * 60 * 1000));

  // Get tattooist's availability for this day
  const tattooistAvailability = await db
    .select()
    .from(availability)
    .where(and(
      eq(availability.tattooistId, tattooistId),
      eq(availability.day, dayOfWeek)
    ));

  if (tattooistAvailability.length === 0) {
    return { isValid: false, reason: 'Tattooist is not available on this day' };
  }

  // Check if slot falls within any availability window
  const isWithinAvailability = tattooistAvailability.some(avail => {
    return isTimeInRange(slotTime, slotEndTime, avail.startTime, avail.endTime);
  });

  if (!isWithinAvailability) {
    return { isValid: false, reason: 'Slot is outside tattooist\'s available hours' };
  }

  return { isValid: true };
}

/**
 * Checks for booking conflicts (double booking prevention)
 */
export async function checkBookingConflicts(
  tattooistId: string,
  slot: Date,
  duration: number = 60,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: typeof bookings.$inferSelect }> {
  const slotStart = slot;
  const slotEnd = new Date(slot.getTime() + duration * 60 * 1000);

  // Query for overlapping bookings
  // We need to check if the new slot overlaps with any existing booking
  // Assumption: each booking is 1 hour long (60 minutes)
  const conflictQuery = db
    .select()
    .from(bookings)
    .where(and(
      eq(bookings.tattooistId, tattooistId),
      or(
        eq(bookings.status, 'pending'),
        eq(bookings.status, 'confirmed')
      ),
      // Time overlap check: bookings overlap if one starts before the other ends
      and(
        lte(bookings.slot, slotEnd), // existing booking starts before new slot ends
        gte(bookings.slot, new Date(slotStart.getTime() - 60 * 60 * 1000)) // existing booking is within 1 hour before new slot
      )
    ));

  // Exclude specific booking ID if provided (for updates)
  if (excludeBookingId) {
    // Note: This would need to be added to the where clause, but Drizzle syntax might vary
  }

  const conflictingBookings = await conflictQuery;

  if (conflictingBookings.length > 0) {
    return { hasConflict: true, conflictingBooking: conflictingBookings[0] };
  }

  return { hasConflict: false };
}

/**
 * Gets all available time slots for a tattooist on a given date
 */
export async function getAvailableSlots(
  tattooistId: string,
  date: Date,
  duration: number = 60
): Promise<Date[]> {
  const dayOfWeek = date.getDay();

  // Get tattooist's availability for this day
  const tattooistAvailability = await db
    .select()
    .from(availability)
    .where(and(
      eq(availability.tattooistId, tattooistId),
      eq(availability.day, dayOfWeek)
    ));

  if (tattooistAvailability.length === 0) {
    return [];
  }

  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(and(
      eq(bookings.tattooistId, tattooistId),
      gte(bookings.slot, startOfDay),
      lte(bookings.slot, endOfDay),
      or(
        eq(bookings.status, 'pending'),
        eq(bookings.status, 'confirmed')
      )
    ));

  const availableSlots: Date[] = [];

  // For each availability window, generate time slots
  for (const avail of tattooistAvailability) {
    const slots = generateTimeSlots(date, avail.startTime, avail.endTime, duration);

    // Filter out conflicting slots
    const nonConflictingSlots = slots.filter(slot => {
      return !existingBookings.some(booking => {
        const bookingEnd = new Date(booking.slot.getTime() + duration * 60 * 1000);
        const slotEnd = new Date(slot.getTime() + duration * 60 * 1000);

        return (
          (slot >= booking.slot && slot < bookingEnd) ||
          (slotEnd > booking.slot && slotEnd <= bookingEnd) ||
          (slot <= booking.slot && slotEnd >= bookingEnd)
        );
      });
    });

    availableSlots.push(...nonConflictingSlots);
  }

  return availableSlots.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Validates if user can access booking (role-based)
 */
export function canAccessBooking(
  booking: typeof bookings.$inferSelect,
  userId: string,
  userRole: string
): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'customer' && booking.customerId === userId) return true;
  // For tattooists, we need to check if they own the booking
  // This would require joining with the tattooists table
  return false;
}

// Helper functions
function formatTimeFromDate(date: Date): string {
  return date.toTimeString().slice(0, 8); // HH:MM:SS
}

function isTimeInRange(
  slotStart: string,
  slotEnd: string,
  availStart: string,
  availEnd: string
): boolean {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const availStartMinutes = timeToMinutes(availStart);
  const availEndMinutes = timeToMinutes(availEnd);

  return slotStartMinutes >= availStartMinutes && slotEndMinutes <= availEndMinutes;
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function generateTimeSlots(
  date: Date,
  startTime: string,
  endTime: string,
  duration: number
): Date[] {
  const slots: Date[] = [];
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHours, startMinutes, 0, 0);

  const end = new Date(date);
  end.setHours(endHours, endMinutes, 0, 0);

  let current = new Date(start);
  while (current.getTime() + duration * 60 * 1000 <= end.getTime()) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + duration * 60 * 1000);
  }

  return slots;
}