import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { bookings, tattooists, users } from '@/lib/db/schema';
import { bookingUpdateSchema } from '@/lib/schemas/booking';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/bookings/[id] - Get booking details (role-validated)
async function getBookingHandler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;

    // Validate booking ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    // Get booking with related data
    const [booking] = await db
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
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const userId = request.auth!.userId;
    const userRole = request.auth!.role;

    let hasAccess = false;

    if (userRole === 'admin') {
      hasAccess = true;
    } else if (userRole === 'customer' && booking.customerId === userId) {
      hasAccess = true;
    } else if (userRole === 'tattooist') {
      // Check if user owns the tattooist profile for this booking
      const [tattooist] = await db
        .select()
        .from(tattooists)
        .where(and(
          eq(tattooists.userId, userId),
          eq(tattooists.id, booking.tattooistId)
        ))
        .limit(1);

      hasAccess = !!tattooist;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get tattooist info
    const [tattooistInfo] = await db
      .select({
        tattooist: {
          id: tattooists.id,
          bio: tattooists.bio,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(tattooists)
      .innerJoin(users, eq(tattooists.userId, users.id))
      .where(eq(tattooists.id, booking.tattooistId))
      .limit(1);

    return NextResponse.json({
      booking: {
        ...booking,
        tattooist: {
          id: tattooistInfo.tattooist.id,
          name: `${tattooistInfo.user.firstName} ${tattooistInfo.user.lastName}`,
          bio: tattooistInfo.tattooist.bio,
          email: tattooistInfo.user.email,
        },
      },
      message: 'Booking details retrieved successfully',
    });
  } catch (error) {
    console.error('Booking detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status (tattooist/admin only)
async function updateBookingHandler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const result = bookingUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { status: newStatus, notes } = result.data;
    const userId = request.auth!.userId;
    const userRole = request.auth!.role;

    // Validate booking ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    // Get existing booking
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let canUpdate = false;

    if (userRole === 'admin') {
      canUpdate = true;
    } else if (userRole === 'tattooist') {
      // Check if user owns the tattooist profile for this booking
      const [tattooist] = await db
        .select()
        .from(tattooists)
        .where(and(
          eq(tattooists.userId, userId),
          eq(tattooists.id, existingBooking.tattooistId)
        ))
        .limit(1);

      canUpdate = !!tattooist;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Access denied. Only tattooists and admins can update booking status.' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [], // Final state
    };

    if (!validTransitions[existingBooking.status]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existingBooking.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Update booking
    const updateData: any = { status: newStatus };
    if (notes !== undefined) updateData.notes = notes;

    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
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

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking status updated successfully',
    });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: Context) {
  return withAuth((authRequest: AuthenticatedRequest) =>
    getBookingHandler(authRequest, context)
  )(request);
}

export async function PATCH(request: NextRequest, context: Context) {
  return withRole(['tattooist', 'admin'], (authRequest: AuthenticatedRequest) =>
    updateBookingHandler(authRequest, context)
  )(request);
}