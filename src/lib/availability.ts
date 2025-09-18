import { getDatabase } from '@/lib/db';
import { availability, bookings } from '@/db/schema';
import { and, eq, lt, gt, or, ne } from 'drizzle-orm';

export interface AvailabilityBlock {
  id: string;
  tattooistId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  note?: string | null;
  createdAt: Date;
}

export interface BookableWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  note?: string | null;
}

export async function checkAvailabilityOverlap(
  tattooistId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string
): Promise<boolean> {
  const db = getDatabase();
  if (!db) {
    throw new Error('Database connection failed');
  }

  const overlappingBlocks = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.tattooistId, tattooistId),
        excludeId ? ne(availability.id, excludeId) : undefined,
        or(
          // New block starts during existing block
          and(
            lt(availability.startTime, endTime.getTime()),
            gt(availability.endTime, startTime.getTime())
          ),
          // New block completely contains existing block
          and(
            gt(availability.startTime, startTime.getTime()),
            lt(availability.endTime, endTime.getTime())
          ),
          // Existing block completely contains new block
          and(
            lt(availability.startTime, startTime.getTime()),
            gt(availability.endTime, endTime.getTime())
          )
        )
      )
    );

  return overlappingBlocks.length > 0;
}

export async function getAvailabilityBlocks(tattooistId: string): Promise<AvailabilityBlock[]> {
  const db = getDatabase();
  if (!db) {
    throw new Error('Database connection failed');
  }

  const blocks = await db
    .select()
    .from(availability)
    .where(eq(availability.tattooistId, tattooistId))
    .orderBy(availability.startTime);

  return blocks.map(block => ({
    id: block.id,
    tattooistId: block.tattooistId,
    startTime: new Date(block.startTime),
    endTime: new Date(block.endTime),
    isBooked: block.isBooked,
    note: block.note,
    createdAt: new Date(block.createdAt),
  }));
}

export async function getBookableWindows(tattooistId?: string): Promise<BookableWindow[]> {
  const db = getDatabase();
  if (!db) {
    throw new Error('Database connection failed');
  }

  // Get all availability blocks that are not booked
  const query = db
    .select({
      id: availability.id,
      startTime: availability.startTime,
      endTime: availability.endTime,
      note: availability.note,
      tattooistId: availability.tattooistId,
    })
    .from(availability)
    .where(
      and(
        eq(availability.isBooked, false),
        tattooistId ? eq(availability.tattooistId, tattooistId) : undefined,
        // Only show future availability
        gt(availability.startTime, Date.now())
      )
    )
    .orderBy(availability.startTime);

  const availableBlocks = await query;

  // Get all confirmed bookings to subtract from availability
  const confirmedBookings = await db
    .select({
      slot: bookings.slot,
      tattooistId: bookings.tattooistId,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        tattooistId ? eq(bookings.tattooistId, tattooistId) : undefined
      )
    );

  // Filter out availability blocks that conflict with confirmed bookings
  const bookableWindows = availableBlocks.filter(block => {
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);

    return !confirmedBookings.some(booking => {
      const bookingTime = new Date(booking.slot);
      // Assuming bookings are 1-hour slots
      const bookingEnd = new Date(bookingTime.getTime() + 60 * 60 * 1000);

      return (
        booking.tattooistId === block.tattooistId &&
        bookingTime < blockEnd &&
        bookingEnd > blockStart
      );
    });
  });

  return bookableWindows.map(window => ({
    id: window.id,
    startTime: new Date(window.startTime),
    endTime: new Date(window.endTime),
    note: window.note,
  }));
}

export function validateAvailabilityTimes(startTime: Date, endTime: Date): string | null {
  if (startTime >= endTime) {
    return 'Start time must be before end time';
  }

  if (startTime < new Date()) {
    return 'Start time cannot be in the past';
  }

  const duration = endTime.getTime() - startTime.getTime();
  const minDuration = 30 * 60 * 1000; // 30 minutes
  const maxDuration = 12 * 60 * 60 * 1000; // 12 hours (more realistic for tattoo artists)

  if (duration < minDuration) {
    return 'Availability block must be at least 30 minutes';
  }

  if (duration > maxDuration) {
    return 'Availability block cannot exceed 12 hours';
  }

  return null;
}