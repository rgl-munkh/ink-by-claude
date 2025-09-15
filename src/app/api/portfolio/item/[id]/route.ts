import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { portfolios, tattooists } from '@/lib/db/schema';
import { portfolioUpdateSchema } from '@/lib/schemas/upload';
import { deleteObject } from '@/lib/storage/r2';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

async function patchHandler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const result = portfolioUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { description, styleTags } = result.data;
    const userId = request.auth!.userId;

    // Validate portfolio ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid portfolio ID format' },
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

    // Check if portfolio item exists and belongs to this tattooist
    const [existingPortfolio] = await db
      .select()
      .from(portfolios)
      .where(and(
        eq(portfolios.id, id),
        eq(portfolios.tattooistId, tattooist.id)
      ))
      .limit(1);

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio item not found or access denied' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Partial<typeof portfolios.$inferInsert> = {};
    if (description !== undefined) updateData.description = description || null;
    if (styleTags !== undefined) updateData.styleTags = styleTags.length > 0 ? styleTags : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update portfolio item
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set(updateData)
      .where(eq(portfolios.id, id))
      .returning({
        id: portfolios.id,
        tattooistId: portfolios.tattooistId,
        imageUrl: portfolios.imageUrl,
        description: portfolios.description,
        styleTags: portfolios.styleTags,
        createdAt: portfolios.createdAt,
      });

    return NextResponse.json({
      portfolio: updatedPortfolio,
      message: 'Portfolio item updated successfully',
    });
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteHandler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;
    const userId = request.auth!.userId;

    // Validate portfolio ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid portfolio ID format' },
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

    // Check if portfolio item exists and belongs to this tattooist
    const [existingPortfolio] = await db
      .select()
      .from(portfolios)
      .where(and(
        eq(portfolios.id, id),
        eq(portfolios.tattooistId, tattooist.id)
      ))
      .limit(1);

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio item not found or access denied' },
        { status: 404 }
      );
    }

    // Delete from database
    await db
      .delete(portfolios)
      .where(eq(portfolios.id, id));

    // Optionally delete from R2 (extract key from imageUrl)
    try {
      const url = new URL(existingPortfolio.imageUrl);
      const key = url.pathname.substring(1); // Remove leading slash
      await deleteObject(key);
    } catch (r2Error) {
      console.warn('Failed to delete image from R2:', r2Error);
      // Don't fail the entire operation if R2 deletion fails
    }

    return NextResponse.json({
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  return withRole(['tattooist', 'admin'], (authRequest: AuthenticatedRequest) =>
    patchHandler(authRequest, context)
  )(request);
}

export async function DELETE(request: NextRequest, context: Context) {
  return withRole(['tattooist', 'admin'], (authRequest: AuthenticatedRequest) =>
    deleteHandler(authRequest, context)
  )(request);
}