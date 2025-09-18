import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { availability } from '@/db/schema';
import { checkAvailabilityOverlap, validateAvailabilityTimes } from '@/lib/availability';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

const updateAvailabilitySchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  note: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates = updateAvailabilitySchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get existing availability block
    const existingBlock = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.id, id),
          eq(availability.tattooistId, 'tattooist-admin')
        )
      )
      .limit(1);

    if (existingBlock.length === 0) {
      return NextResponse.json(
        { error: 'Availability block not found' },
        { status: 404 }
      );
    }

    const current = existingBlock[0];

    // Determine new start and end times
    const newStartTime = updates.startTime
      ? new Date(updates.startTime + ':00') // Add seconds for datetime-local format
      : new Date(current.startTime);
    const newEndTime = updates.endTime
      ? new Date(updates.endTime + ':00') // Add seconds for datetime-local format
      : new Date(current.endTime);

    // Check if dates are valid
    if ((updates.startTime && isNaN(newStartTime.getTime())) ||
        (updates.endTime && isNaN(newEndTime.getTime()))) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DDTHH:MM' },
        { status: 400 }
      );
    }

    // Validate new times if they changed
    if (updates.startTime || updates.endTime) {
      const timeValidation = validateAvailabilityTimes(newStartTime, newEndTime);
      if (timeValidation) {
        return NextResponse.json({ error: timeValidation }, { status: 400 });
      }

      // Check for overlapping availability (excluding current block)
      const hasOverlap = await checkAvailabilityOverlap(
        'tattooist-admin',
        newStartTime,
        newEndTime,
        id
      );

      if (hasOverlap) {
        return NextResponse.json(
          { error: 'Updated availability block overlaps with existing availability' },
          { status: 409 }
        );
      }
    }

    // Update the availability block
    const updateData: Record<string, number | string | null> = {};
    if (updates.startTime) updateData.startTime = newStartTime.getTime();
    if (updates.endTime) updateData.endTime = newEndTime.getTime();
    if (updates.note !== undefined) updateData.note = updates.note;

    const updated = await db
      .update(availability)
      .set(updateData)
      .where(eq(availability.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      availability: {
        id: updated[0].id,
        startTime: new Date(updated[0].startTime),
        endTime: new Date(updated[0].endTime),
        isBooked: updated[0].isBooked,
        note: updated[0].note,
        createdAt: new Date(updated[0].createdAt),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if availability block exists and belongs to the tattooist
    const existingBlock = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.id, id),
          eq(availability.tattooistId, 'tattooist-admin')
        )
      )
      .limit(1);

    if (existingBlock.length === 0) {
      return NextResponse.json(
        { error: 'Availability block not found' },
        { status: 404 }
      );
    }

    // Check if the block is booked
    if (existingBlock[0].isBooked) {
      return NextResponse.json(
        { error: 'Cannot delete booked availability block' },
        { status: 409 }
      );
    }

    // Delete the availability block
    await db
      .delete(availability)
      .where(eq(availability.id, id));

    return NextResponse.json({
      success: true,
      message: 'Availability block deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}