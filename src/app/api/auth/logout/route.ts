import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';

export async function POST(_request: NextRequest) {
  try {
    // Remove the auth cookie
    await removeAuthCookie();
    
    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}