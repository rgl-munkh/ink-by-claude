import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { offers, requests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { offerId } = await params;

    // Get offer with related request data
    const offerData = await db
      .select({
        offer: offers,
        request: requests,
      })
      .from(offers)
      .innerJoin(requests, eq(offers.requestId, requests.id))
      .where(eq(offers.id, offerId))
      .limit(1);

    if (offerData.length === 0) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    const { offer, request } = offerData[0];

    // Check if offer has expired
    const isExpired = offer.expiresAt && new Date() > offer.expiresAt;

    // Calculate deposit amount
    const depositAmount = Math.round((offer.quotedAmount * offer.depositPercent) / 100);

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        quotedAmount: offer.quotedAmount / 100, // Convert to dollars
        depositPercent: offer.depositPercent,
        depositAmount: depositAmount / 100, // Convert to dollars
        availableSlots: offer.availableSlots,
        message: offer.message,
        expiresAt: offer.expiresAt,
        createdAt: offer.createdAt,
        isExpired,
      },
      request: {
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
      },
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}