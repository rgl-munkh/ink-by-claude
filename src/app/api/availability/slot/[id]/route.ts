import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { availability, tattooists } from '@/lib/db/schema';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

async function deleteHandler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;
    const userId = request.auth!.userId;

    // Validate availability ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid availability ID format' },
        { status: 400 }
      );
    }

    // Find the tattooist record for this user
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

    // Check if availability exists and belongs to this tattooist
    const [existingAvailability] = await db
      .select()
      .from(availability)
      .where(and(
        eq(availability.id, id),
        eq(availability.tattooistId, tattooist.id)
      ))
      .limit(1);

    if (!existingAvailability) {
      return NextResponse.json(
        { error: 'Availability slot not found or access denied' },
        { status: 404 }
      );
    }

    // Delete availability
    await db
      .delete(availability)
      .where(eq(availability.id, id));

    return NextResponse.json({
      message: 'Availability slot deleted successfully',
    });
  } catch (error) {
    console.error('Availability delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  return withRole(['tattooist', 'admin'], (authRequest: AuthenticatedRequest) =>
    deleteHandler(authRequest, context)
  )(request);
}