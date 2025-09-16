import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { tattooists } from '@/lib/db/schema';
import { z } from 'zod';

const approvalSchema = z.object({
  approved: z.boolean(),
});

interface Context {
  params: Promise<{ id: string }>;
}

async function handler(request: AuthenticatedRequest, context: Context) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid tattooist ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const result = approvalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { approved } = result.data;

    // Check if tattooist exists
    const [existingTattooist] = await db
      .select({
        id: tattooists.id,
      })
      .from(tattooists)
      .where(eq(tattooists.id, id))
      .limit(1);

    if (!existingTattooist) {
      return NextResponse.json(
        { error: 'Tattooist not found' },
        { status: 404 }
      );
    }

    // Update approval status
    const [updatedTattooist] = await db
      .update(tattooists)
      .set({ approved })
      .where(eq(tattooists.id, id))
      .returning({
        id: tattooists.id,
        approved: tattooists.approved,
      });

    const action = approved ? 'approved' : 'rejected';

    return NextResponse.json(
      {
        tattooist: updatedTattooist,
        message: `Tattooist ${action} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Tattooist approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  // return withRole(['admin'], (authRequest: AuthenticatedRequest) =>
  //   handler(authRequest, context)
  // )(request);
  return handler(request, context);
}