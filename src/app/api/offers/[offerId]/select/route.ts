import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Database } from '@/lib/db';
import { offers, requests, bookings } from '@/db/schema';
import { eq, and, gte, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

const selectSlotSchema = z.object({
  slotIso: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid ISO date format'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

async function checkSlotAvailability(db: Database, tattooistId: string, slotStart: Date, durationMinutes: number) {
  const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

  // Check for overlapping confirmed bookings
  const overlappingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.tattooistId, tattooistId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'completed'),
          // Include reserved bookings that haven't expired
          and(
            eq(bookings.status, 'reserved'),
            gte(bookings.reservationExpiresAt, new Date())
          )
        ),
        // Check for time overlap
        and(
          lte(bookings.slot, slotEnd.getTime()),
          gte(
            // Calculate end time of existing booking
            sql`(slot + (duration_minutes * 60 * 1000))`,
            slotStart.getTime()
          )
        )
      )
    );

  return overlappingBookings.length === 0;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = selectSlotSchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { offerId } = await params;

    // Check for existing booking with same idempotency key (idempotent behavior)
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
          offerId: booking.offerId,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          slot: new Date(booking.slot),
          durationMinutes: booking.durationMinutes,
          quotedAmount: booking.quotedAmount / 100, // Convert to dollars
          depositAmount: booking.depositAmount / 100, // Convert to dollars
          status: booking.status,
          reservationExpiresAt: booking.reservationExpiresAt,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        },
        idempotent: true,
      });
    }

    // Get offer with related request data
    const offerData = await db
      .select({
        offer: offers,
        request: requests,
      })
      .from(offers)
      .innerJoin(requests, eq(offers.requestId, requests.id))
      .where(eq(offers.id, offerId))
      .limit(1);

    if (offerData.length === 0) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    const { offer, request } = offerData[0];

    // Check if offer has expired
    if (offer.expiresAt && new Date() > offer.expiresAt) {
      return NextResponse.json(
        { error: 'Offer has expired' },
        { status: 410 }
      );
    }

    const slotStart = new Date(validatedData.slotIso);

    // Validate that the selected slot is in the offer's available slots
    const isSlotAvailable = offer.availableSlots.includes(validatedData.slotIso);
    if (!isSlotAvailable) {
      return NextResponse.json(
        { error: 'Selected slot is not available in this offer' },
        { status: 400 }
      );
    }

    // Check for slot conflicts with existing bookings
    const durationMinutes = 120; // Default 2 hours
    const isSlotFree = await checkSlotAvailability(db, request.tattooistId!, slotStart, durationMinutes);

    if (!isSlotFree) {
      return NextResponse.json(
        { error: 'Selected slot is no longer available due to conflicts' },
        { status: 409 }
      );
    }

    // Calculate reservation expiration (15 minutes from now)
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Calculate deposit amount
    const depositAmount = Math.round((offer.quotedAmount * offer.depositPercent) / 100);

    // Create the booking
    const newBooking = await db
      .insert(bookings)
      .values({
        offerId: offerId,
        requestId: request.id,
        customerId: null, // Anonymous booking
        tattooistId: request.tattooistId!,
        customerName: validatedData.contactName,
        customerPhone: validatedData.contactPhone,
        slot: slotStart.getTime(),
        durationMinutes: durationMinutes,
        quotedAmount: offer.quotedAmount,
        depositAmount: depositAmount,
        status: 'reserved',
        reservationExpiresAt: reservationExpiresAt,
        paymentStatus: 'unpaid',
        idempotencyKey: validatedData.idempotencyKey,
      })
      .returning();

    console.log(`📅 Booking reserved: ${newBooking[0].id} for ${validatedData.contactName} at ${slotStart.toISOString()}`);

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking[0].id,
        offerId: newBooking[0].offerId,
        customerName: newBooking[0].customerName,
        customerPhone: newBooking[0].customerPhone,
        slot: new Date(newBooking[0].slot),
        durationMinutes: newBooking[0].durationMinutes,
        quotedAmount: newBooking[0].quotedAmount / 100, // Convert to dollars
        depositAmount: newBooking[0].depositAmount / 100, // Convert to dollars
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

    console.error('Error selecting slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}