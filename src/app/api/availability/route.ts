import { NextRequest, NextResponse } from 'next/server';
import { getBookableWindows } from '@/lib/availability';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tattooistId = searchParams.get('tattooistId');

    const bookableWindows = await getBookableWindows(tattooistId || undefined);

    return NextResponse.json({
      success: true,
      availability: bookableWindows,
      count: bookableWindows.length,
    });
  } catch (error) {
    console.error('Error fetching public availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}