import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { requests, tattooists } from '@/db/schema';
import { notifyNewRequest } from '@/lib/notifications';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  description: z.string().min(1, 'Description is required'),
  size: z.string().min(1, 'Size is required'),
  placement: z.string().min(1, 'Placement is required'),
  images: z.array(z.string().url(), 'At least one image is required').min(1),
  preferredDates: z.array(z.string()).optional(),
  // New fields for artist-specific requests
  requestedArtistId: z.string().optional(),
  requestType: z.enum(['general', 'artist-specific']).optional().default('general'),
  budget: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Determine which tattooist to assign the request to
    let tattooistId = null;

    if (validatedData.requestType === 'artist-specific' && validatedData.requestedArtistId) {
      // For artist-specific requests, assign to the requested artist
      const requestedTattooist = await db.select().from(tattooists).where(eq(tattooists.id, validatedData.requestedArtistId)).limit(1);
      tattooistId = requestedTattooist.length > 0 ? requestedTattooist[0].id : null;
    } else {
      // For general requests, assign to the first available tattooist
      const availableTattooists = await db.select().from(tattooists).limit(1);
      tattooistId = availableTattooists.length > 0 ? availableTattooists[0].id : null;
    }

    const newRequest = await db
      .insert(requests)
      .values({
        tattooistId: tattooistId,
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
        description: validatedData.description,
        size: validatedData.size,
        placement: validatedData.placement,
        images: validatedData.images,
        preferredDates: validatedData.preferredDates || null,
        status: 'new',
      })
      .returning();

    // Trigger notification to tattooist
    await notifyNewRequest({
      requestId: newRequest[0].id,
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      description: validatedData.description,
      size: validatedData.size,
      placement: validatedData.placement,
      imageCount: validatedData.images.length,
    });

    return NextResponse.json({
      success: true,
      request: {
        id: newRequest[0].id,
        status: newRequest[0].status,
        createdAt: newRequest[0].createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}