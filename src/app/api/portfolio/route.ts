import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { portfolios, tattooists } from '@/lib/db/schema';
import { portfolioCreateSchema } from '@/lib/schemas/upload';

async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = portfolioCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { imageUrl, description, styleTags } = result.data;
    const userId = request.auth!.userId;

    console.log(request.auth)

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

    // Create portfolio item
    const [newPortfolioItem] = await db
      .insert(portfolios)
      .values({
        tattooistId: tattooist.id,
        imageUrl,
        description: description || null,
        styleTags: styleTags.length > 0 ? styleTags : null,
      })
      .returning({
        id: portfolios.id,
        tattooistId: portfolios.tattooistId,
        imageUrl: portfolios.imageUrl,
        description: portfolios.description,
        styleTags: portfolios.styleTags,
        createdAt: portfolios.createdAt,
      });

    return NextResponse.json(
      {
        portfolio: newPortfolioItem,
        message: 'Portfolio item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Portfolio create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withRole(['tattooist', 'admin'], handler);