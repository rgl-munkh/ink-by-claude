import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDatabase, Database } from '@/lib/db';
import { requests, offers, tattooists } from '@/db/schema';
import { notifyOfferSent } from '@/lib/notifications';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createOfferSchema = z.object({
  quotedAmount: z.number().min(1, 'Quoted amount must be positive'),
  depositPercent: z.number().min(0).max(100, 'Deposit percent must be between 0-100'),
  availableSlots: z.array(z.string(), 'Available slots must be an array of datetime strings').min(1, 'At least one slot is required'),
  message: z.string().min(1, 'Message is required'),
  expiresAt: z.string().optional(), // ISO datetime string
});

async function getTattooistId(db: Database, userId: string) {
  const tattooist = await db.select().from(tattooists).where(eq(tattooists.userId, userId)).limit(1);
  return tattooist.length > 0 ? tattooist[0].id : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { id } = await params;

    // Get tattooist ID for the current user
    const tattooistId = await getTattooistId(db, user.id);
    if (!tattooistId) {
      return NextResponse.json(
        { error: 'Tattooist profile not found' },
        { status: 404 }
      );
    }

    // Check if the request exists and belongs to this tattooist
    const existingRequest = await db
      .select()
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const requestData = existingRequest[0];

    // Verify this request belongs to the current tattooist
    if (requestData.tattooistId !== tattooistId) {
      return NextResponse.json(
        { error: 'Not authorized to make offer on this request' },
        { status: 403 }
      );
    }

    // Check if request is in a valid state for offers
    if (requestData.status === 'offered') {
      return NextResponse.json(
        { error: 'Request already has an offer' },
        { status: 409 }
      );
    }

    // Parse expiration date if provided
    let expiresAt = null;
    if (validatedData.expiresAt) {
      expiresAt = new Date(validatedData.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date format' },
          { status: 400 }
        );
      }
    }

    // Create the offer
    const newOffer = await db
      .insert(offers)
      .values({
        requestId: id,
        quotedAmount: Math.round(validatedData.quotedAmount * 100), // Convert to cents
        depositPercent: validatedData.depositPercent,
        availableSlots: validatedData.availableSlots,
        message: validatedData.message,
        expiresAt: expiresAt,
      })
      .returning();

    // Update request status to 'offered'
    await db
      .update(requests)
      .set({ status: 'offered' })
      .where(eq(requests.id, id));

    // Calculate deposit amount
    const depositAmount = Math.round(
      (newOffer[0].quotedAmount * newOffer[0].depositPercent) / 100
    );

    // Send notification to client
    await notifyOfferSent({
      offerId: newOffer[0].id,
      requestId: id,
      clientName: requestData.name,
      clientPhone: requestData.phone,
      clientEmail: requestData.email,
      quotedAmount: newOffer[0].quotedAmount / 100, // Convert to dollars
      depositAmount: depositAmount / 100, // Convert to dollars
      message: newOffer[0].message,
      expiresAt: expiresAt,
    });

    return NextResponse.json({
      success: true,
      offer: {
        id: newOffer[0].id,
        requestId: newOffer[0].requestId,
        quotedAmount: newOffer[0].quotedAmount / 100, // Convert back to dollars
        depositPercent: newOffer[0].depositPercent,
        depositAmount: depositAmount / 100, // Convert to dollars
        availableSlots: newOffer[0].availableSlots,
        message: newOffer[0].message,
        expiresAt: newOffer[0].expiresAt,
        createdAt: newOffer[0].createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}