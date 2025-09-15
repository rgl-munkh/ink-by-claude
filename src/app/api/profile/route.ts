import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(request: AuthenticatedRequest) {
  return NextResponse.json({
    user: {
      id: request.auth!.userId,
      email: request.auth!.email,
      role: request.auth!.role,
    },
    message: 'Profile data retrieved successfully',
  });
}

export const GET = withAuth(handler);