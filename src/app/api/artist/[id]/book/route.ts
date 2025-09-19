import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Database } from '@/lib/db';
import { bookings, tattooists, availability } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

const directBookingSchema = z.object({
  slotStartTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start time'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().email().optional(),
  tattooDescription: z.string().min(1, 'Tattoo description is required'),
  estimatedHours: z.number().min(0.5).max(12),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

async function checkDirectSlotAvailability(db: Database, tattooistId: string, startTime: Date, durationMinutes: number) {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  // Check if this time falls within an available block
  const availableBlocks = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.tattooistId, tattooistId),
        lte(availability.startTime, startTime.getTime()),
        gte(availability.endTime, endTime.getTime()),
        eq(availability.isBooked, false)
      )
    );

  if (availableBlocks.length === 0) {
    return false; // No availability block covers this time
  }

  // Check for conflicting bookings
  const conflictingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.tattooistId, tattooistId),
        eq(bookings.status, 'confirmed'),
        // Check for time overlap
        lte(bookings.slot, endTime),
        gte(
          // This represents booking end time
          sql`(slot + (duration_minutes * 60 * 1000))`,
          startTime
        )
      )
    );

  return conflictingBookings.length === 0;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = directBookingSchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id: artistId } = await params;

    // Check for existing booking with same idempotency key
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.idempotencyKey, validatedData.idempotencyKey))
      .limit(1);

    if (existingBooking.length > 0) {
      const booking = existingBooking[0];
      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id,
          artistId: booking.tattooistId,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          slot: new Date(booking.slot),
          durationMinutes: booking.durationMinutes,
          quotedAmount: booking.quotedAmount / 100,
          depositAmount: booking.depositAmount / 100,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        },
        idempotent: true,
      });
    }

    // Verify artist exists
    const artist = await db.select().from(tattooists).where(eq(tattooists.id, artistId)).limit(1);
    if (artist.length === 0) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    const startTime = new Date(validatedData.slotStartTime);
    const durationMinutes = Math.round(validatedData.estimatedHours * 60);

    // Check availability
    const isAvailable = await checkDirectSlotAvailability(db, artistId, startTime, durationMinutes);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 409 }
      );
    }

    // Calculate pricing (mock calculation - replace with real pricing logic)
    const baseHourlyRate = 150; // This should come from artist profile
    const quotedAmount = Math.round(validatedData.estimatedHours * baseHourlyRate * 100); // in cents
    const depositPercent = 25;
    const depositAmount = Math.round((quotedAmount * depositPercent) / 100);

    // Create 15-minute reservation
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Create booking
    const newBooking = await db
      .insert(bookings)
      .values({
        tattooistId: artistId,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        slot: startTime,
        durationMinutes: durationMinutes,
        quotedAmount: quotedAmount,
        depositAmount: depositAmount,
        status: 'reserved',
        reservationExpiresAt: reservationExpiresAt,
        paymentStatus: 'unpaid',
        idempotencyKey: validatedData.idempotencyKey,
      })
      .returning();

    console.log(`🎨 Direct booking created: ${newBooking[0].id} for ${validatedData.customerName} with artist ${artistId}`);

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking[0].id,
        artistId: newBooking[0].tattooistId,
        customerName: newBooking[0].customerName,
        customerPhone: newBooking[0].customerPhone,
        slot: new Date(newBooking[0].slot),
        durationMinutes: newBooking[0].durationMinutes,
        quotedAmount: newBooking[0].quotedAmount / 100,
        depositAmount: newBooking[0].depositAmount / 100,
        status: newBooking[0].status,
        reservationExpiresAt: newBooking[0].reservationExpiresAt,
        paymentStatus: newBooking[0].paymentStatus,
        createdAt: newBooking[0].createdAt,
      },
      idempotent: false,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating direct booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}