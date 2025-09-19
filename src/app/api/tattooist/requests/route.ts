import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDatabase, Database } from '@/lib/db';
import { requests, tattooists } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getOrCreateTattooist(db: Database, userId: string) {
  // Check if tattooist exists for this user
  const existingTattooist = await db.select().from(tattooists).where(eq(tattooists.userId, userId)).limit(1);

  if (existingTattooist.length > 0) {
    return existingTattooist[0].id;
  }

  // This shouldn't happen in production, but handle gracefully
  return null;
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

    // Get tattooist ID for the current user
    const tattooistId = await getOrCreateTattooist(db, user.id);
    if (!tattooistId) {
      return NextResponse.json(
        { error: 'Tattooist profile not found' },
        { status: 404 }
      );
    }

    // Get all requests assigned to this tattooist
    const tattooistRequests = await db
      .select()
      .from(requests)
      .where(eq(requests.tattooistId, tattooistId))
      .orderBy(requests.createdAt);

    // Format the response
    const formattedRequests = tattooistRequests.map(request => ({
      id: request.id,
      name: request.name,
      phone: request.phone,
      email: request.email,
      description: request.description,
      size: request.size,
      placement: request.placement,
      images: request.images,
      preferredDates: request.preferredDates,
      status: request.status,
      createdAt: request.createdAt,
    }));

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
      count: formattedRequests.length,
    });
  } catch (error) {
    console.error('Error fetching tattooist requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}