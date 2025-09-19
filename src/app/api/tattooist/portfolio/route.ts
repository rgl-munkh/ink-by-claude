import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDatabase, Database } from '@/lib/db';
import { portfolios, tattooists } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createPortfolioSchema = z.object({
  imageUrl: z.string().url('Valid image URL is required'),
  description: z.string().min(1, 'Description is required'),
  styleTags: z.array(z.string()).optional().default([]),
});

async function getTattooistId(db: Database, userId: string) {
  const tattooist = await db.select().from(tattooists).where(eq(tattooists.userId, userId)).limit(1);
  return tattooist.length > 0 ? tattooist[0].id : null;
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

    const tattooistId = await getTattooistId(db, user.id);
    if (!tattooistId) {
      return NextResponse.json(
        { error: 'Tattooist profile not found' },
        { status: 404 }
      );
    }

    const portfolioItems = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.tattooistId, tattooistId))
      .orderBy(portfolios.createdAt);

    const formattedPortfolio = portfolioItems.map(item => ({
      id: item.id,
      imageUrl: item.imageUrl,
      description: item.description,
      styleTags: item.styleTags ? JSON.parse(item.styleTags) : [],
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      portfolio: formattedPortfolio,
      count: formattedPortfolio.length,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPortfolioSchema.parse(body);

    const db = getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const tattooistId = await getTattooistId(db, user.id);
    if (!tattooistId) {
      return NextResponse.json(
        { error: 'Tattooist profile not found' },
        { status: 404 }
      );
    }

    const newPortfolioItem = await db
      .insert(portfolios)
      .values({
        tattooistId: tattooistId,
        imageUrl: validatedData.imageUrl,
        description: validatedData.description,
        styleTags: JSON.stringify(validatedData.styleTags),
      })
      .returning();

    return NextResponse.json({
      success: true,
      portfolioItem: {
        id: newPortfolioItem[0].id,
        imageUrl: newPortfolioItem[0].imageUrl,
        description: newPortfolioItem[0].description,
        styleTags: JSON.parse(newPortfolioItem[0].styleTags || '[]'),
        createdAt: newPortfolioItem[0].createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}