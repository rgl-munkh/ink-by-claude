import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { availability, tattooists, users } from '@/db/schema';
import { checkAvailabilityOverlap, validateAvailabilityTimes, getAvailabilityBlocks } from '@/lib/availability';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const createAvailabilitySchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  note: z.string().optional(),
});

async function getOrCreateTattooist(db: any, userId: string) {
  // First try to find existing user
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (existingUser.length === 0) {
    // Create the user first
    await db.insert(users).values({
      id: userId,
      firstName: 'Admin',
      lastName: 'Tattooist',
      email: 'admin@tattoo.studio',
      passwordHash: 'dummy-hash',
      role: 'tattooist',
    });
  }

  // Now try to find existing tattooist
  const existingTattooist = await db.select().from(tattooists).where(eq(tattooists.userId, userId)).limit(1);

  if (existingTattooist.length > 0) {
    return existingTattooist[0].id;
  }

  // Create tattooist record
  const newTattooist = await db.insert(tattooists).values({
    userId: userId,
    bio: 'Professional tattoo artist',
    approved: true,
  }).returning();

  return newTattooist[0].id;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startTime, endTime, note } = createAvailabilitySchema.parse(body);

    // Parse datetime-local format (YYYY-MM-DDTHH:MM) and assume local timezone
    const startDate = new Date(startTime + ':00'); // Add seconds
    const endDate = new Date(endTime + ':00'); // Add seconds

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DDTHH:MM' },
        { status: 400 }
      );
    }

    // Validate time constraints
    const timeValidation = validateAvailabilityTimes(startDate, endDate);
    if (timeValidation) {
      return NextResponse.json({ error: timeValidation }, { status: 400 });
    }

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get or create tattooist for the current user
    const tattooistId = await getOrCreateTattooist(db, user.id);

    // Check for overlapping availability
    const hasOverlap = await checkAvailabilityOverlap(
      tattooistId,
      startDate,
      endDate
    );

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Availability block overlaps with existing availability' },
        { status: 409 }
      );
    }

    const newAvailability = await db
      .insert(availability)
      .values({
        tattooistId: tattooistId,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        isBooked: false,
        note: note || null,
        createdAt: Date.now(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      availability: {
        id: newAvailability[0].id,
        startTime: new Date(newAvailability[0].startTime),
        endTime: new Date(newAvailability[0].endTime),
        isBooked: newAvailability[0].isBooked,
        note: newAvailability[0].note,
        createdAt: new Date(newAvailability[0].createdAt),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get or create tattooist for the current user
    const tattooistId = await getOrCreateTattooist(db, user.id);
    const blocks = await getAvailabilityBlocks(tattooistId);

    return NextResponse.json({
      success: true,
      availability: blocks,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}