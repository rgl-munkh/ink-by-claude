import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { availability, tattooists } from '@/lib/db/schema';
import { availabilityCreateSchema } from '@/lib/schemas/booking';

async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = availabilityCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { day, startTime, endTime } = result.data;
    const userId = request.auth!.userId;

    // Find the tattooist record for this user
    const [tattooist] = await db
      .select()
      .from(tattooists)
      .where(eq(tattooists.userId, userId))
      .limit(1);

    if (!tattooist) {
      return NextResponse.json(
        { error: 'Tattooist profile not found. Please create a tattooist profile first.' },
        { status: 404 }
      );
    }

    if (!tattooist.approved) {
      return NextResponse.json(
        { error: 'Tattooist account not approved yet.' },
        { status: 403 }
      );
    }

    // Check for existing availability on the same day
    const existingAvailability = await db
      .select()
      .from(availability)
      .where(and(
        eq(availability.tattooistId, tattooist.id),
        eq(availability.day, day)
      ));

    // Check for time conflicts with existing availability
    const hasTimeConflict = existingAvailability.some(existing => {
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasTimeConflict) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing availability' },
        { status: 409 }
      );
    }

    // Create availability record
    const [newAvailability] = await db
      .insert(availability)
      .values({
        tattooistId: tattooist.id,
        day,
        startTime,
        endTime,
      })
      .returning({
        id: availability.id,
        tattooistId: availability.tattooistId,
        day: availability.day,
        startTime: availability.startTime,
        endTime: availability.endTime,
      });

    return NextResponse.json(
      {
        availability: newAvailability,
        message: 'Availability created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Availability create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export const POST = withRole(['tattooist', 'admin'], handler);