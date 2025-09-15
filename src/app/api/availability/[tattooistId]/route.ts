import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { availability, tattooists, users } from '@/lib/db/schema';

interface Context {
  params: Promise<{
    tattooistId: string;
  }>;
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const { tattooistId } = await context.params;

    // Validate tattooistId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tattooistId)) {
      return NextResponse.json(
        { error: 'Invalid tattooist ID format' },
        { status: 400 }
      );
    }

    // Check if tattooist exists and is approved
    const [tattooist] = await db
      .select({
        id: tattooists.id,
        approved: tattooists.approved,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(tattooists)
      .innerJoin(users, eq(tattooists.userId, users.id))
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
        { error: 'Tattooist not approved' },
        { status: 403 }
      );
    }

    // Get availability for this tattooist
    const tattooistAvailability = await db
      .select({
        id: availability.id,
        day: availability.day,
        startTime: availability.startTime,
        endTime: availability.endTime,
      })
      .from(availability)
      .where(eq(availability.tattooistId, tattooistId))
      .orderBy(availability.day, availability.startTime);

    // Transform data for better client consumption
    const weeklyAvailability = Array.from({ length: 7 }, (_, day) => ({
      day,
      dayName: getDayName(day),
      slots: tattooistAvailability
        .filter(slot => slot.day === day)
        .map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
    }));

    return NextResponse.json({
      tattooist: {
        id: tattooist.id,
        name: `${tattooist.user.firstName} ${tattooist.user.lastName}`,
      },
      availability: weeklyAvailability,
      message: 'Availability retrieved successfully',
    });
  } catch (error) {
    console.error('Availability list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}