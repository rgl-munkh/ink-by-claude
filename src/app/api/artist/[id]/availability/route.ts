import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { availability, bookings, tattooists } from '@/db/schema';
import { eq, gte, and, or } from 'drizzle-orm';

// Get public availability for a specific artist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id: artistId } = await params;

    // Verify artist exists
    const artist = await db.select().from(tattooists).where(eq(tattooists.id, artistId)).limit(1);
    if (artist.length === 0) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Get all availability blocks for this artist
    const availabilityBlocks = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.tattooistId, artistId),
          gte(availability.startTime, Date.now()), // Only future availability
          eq(availability.isBooked, false) // Only unbooked slots
        )
      )
      .orderBy(availability.startTime);

    // Get all confirmed/reserved bookings to filter out unavailable times
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.tattooistId, artistId),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'completed'),
            // Include unexpired reservations
            and(
              eq(bookings.status, 'reserved'),
              gte(bookings.reservationExpiresAt, new Date())
            )
          )
        )
      );

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    for (const block of availabilityBlocks) {
      let currentTime = block.startTime;
      const endTime = block.endTime;

      while (currentTime + slotDuration <= endTime) {
        const slotEnd = currentTime + slotDuration;

        // Check if this slot conflicts with any existing booking
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = booking.slot.getTime();
          const bookingEnd = bookingStart + (booking.durationMinutes * 60 * 1000);

          // Check for overlap
          return (currentTime < bookingEnd && slotEnd > bookingStart);
        });

        if (!hasConflict) {
          availableSlots.push({
            id: `${block.id}-${currentTime}`,
            startTime: new Date(currentTime),
            endTime: new Date(slotEnd),
            duration: 120, // minutes
            availabilityBlockId: block.id,
            note: block.note,
          });
        }

        // Move to next slot (every 30 minutes for flexibility)
        currentTime += 30 * 60 * 1000;
      }
    }

    return NextResponse.json({
      success: true,
      artistId,
      availableSlots,
      count: availableSlots.length,
    });
  } catch (error) {
    console.error('Error fetching artist availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}