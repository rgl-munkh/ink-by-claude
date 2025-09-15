import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { portfolios, tattooists, users } from '@/lib/db/schema';

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

    // Get portfolio items for this tattooist
    const portfolioItems = await db
      .select({
        id: portfolios.id,
        imageUrl: portfolios.imageUrl,
        description: portfolios.description,
        styleTags: portfolios.styleTags,
        createdAt: portfolios.createdAt,
      })
      .from(portfolios)
      .where(eq(portfolios.tattooistId, tattooistId))
      .orderBy(portfolios.createdAt);

    return NextResponse.json({
      tattooist: {
        id: tattooist.id,
        name: `${tattooist.user.firstName} ${tattooist.user.lastName}`,
      },
      portfolio: portfolioItems,
      message: 'Portfolio retrieved successfully',
    });
  } catch (error) {
    console.error('Portfolio list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}