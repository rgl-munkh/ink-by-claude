import { NextRequest, NextResponse } from 'next/server';
import { eq, and, or, gte, desc } from 'drizzle-orm';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { bookings, tattooists, users } from '@/lib/db/schema';
import { bookingCreateSchema, bookingQuerySchema } from '@/lib/schemas/booking';
import { validateSlotAvailability, checkBookingConflicts } from '@/lib/utils/booking';

// POST /api/bookings - Create a new booking (customer only)
async function createBookingHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = bookingCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { tattooistId, slot, notes, depositAmount } = result.data;
    const customerId = request.auth!.userId;
    const slotDate = new Date(slot);

    // Verify customer role
    if (request.auth!.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can create bookings' },
        { status: 403 }
      );
    }

    // Check if tattooist exists and is approved
    const [tattooist] = await db
      .select()
      .from(tattooists)
      .where(eq(tattooists.id, tattooistId))
      .limit(1);

    if (!tattooist) {
      return NextResponse.json(
        { error: 'Tattooist not found' },
        { status: 404 }
      );
    }

    if (!tattooist.approved) {
      return NextResponse.json(
        { error: 'Tattooist is not approved for bookings' },
        { status: 403 }
      );
    }

    // Start a database transaction to prevent race conditions
    const bookingResult = await db.transaction(async (tx) => {
      // Check availability
      const availabilityCheck = await validateSlotAvailability(tattooistId, slotDate);
      if (!availabilityCheck.isValid) {
        throw new Error(`Slot not available: ${availabilityCheck.reason}`);
      }

      // Check for booking conflicts
      const conflictCheck = await checkBookingConflicts(tattooistId, slotDate);
      if (conflictCheck.hasConflict) {
        throw new Error('Time slot is already booked');
      }

      // Create the booking
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          customerId,
          tattooistId,
          slot: slotDate,
          status: 'pending',
          paymentStatus: 'unpaid',
          depositAmount: depositAmount || null,
        })
        .returning({
          id: bookings.id,
          customerId: bookings.customerId,
          tattooistId: bookings.tattooistId,
          slot: bookings.slot,
          status: bookings.status,
          depositAmount: bookings.depositAmount,
          paymentStatus: bookings.paymentStatus,
          createdAt: bookings.createdAt,
        });

      return newBooking;
    });

    return NextResponse.json(
      {
        booking: bookingResult,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking create error:', error);

    // Handle specific validation errors
    if (error instanceof Error && error.message.startsWith('Slot not available:')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Time slot is already booked') {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/bookings - List bookings (user-specific, role-sensitive)
async function listBookingsHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const queryResult = bookingQuerySchema.safeParse(queryParams);
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { status, limit, offset } = queryResult.data;
    const userId = request.auth!.userId;
    const userRole = request.auth!.role;

    let baseQuery = db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        tattooistId: bookings.tattooistId,
        slot: bookings.slot,
        status: bookings.status,
        depositAmount: bookings.depositAmount,
        paymentStatus: bookings.paymentStatus,
        createdAt: bookings.createdAt,
        customer: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customerId, users.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(bookings.createdAt));

    // Role-based filtering
    if (userRole === 'customer') {
      baseQuery = baseQuery.where(eq(bookings.customerId, userId));
    } else if (userRole === 'tattooist') {
      // Get tattooist ID for this user
      const [tattooist] = await db
        .select()
        .from(tattooists)
        .where(eq(tattooists.userId, userId))
        .limit(1);

      if (!tattooist) {
        return NextResponse.json(
          { error: 'Tattooist profile not found' },
          { status: 404 }
        );
      }

      baseQuery = baseQuery.where(eq(bookings.tattooistId, tattooist.id));
    }
    // Admin users can see all bookings (no additional filter)

    // Optional status filter
    if (status) {
      baseQuery = baseQuery.where(eq(bookings.status, status));
    }

    const userBookings = await baseQuery;

    return NextResponse.json({
      bookings: userBookings,
      pagination: {
        limit,
        offset,
        total: userBookings.length, // This is approximate, would need a separate count query for exact total
      },
      message: 'Bookings retrieved successfully',
    });
  } catch (error) {
    console.error('Booking list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withRole(['customer'], createBookingHandler);
export const GET = withAuth(listBookingsHandler);