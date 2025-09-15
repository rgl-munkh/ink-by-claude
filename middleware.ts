import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from './src/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for public routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  // Check for protected API routes
  if (pathname.startsWith('/api/')) {
    const auth = await getAuthFromRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Add auth info to headers for API routes to use
    const response = NextResponse.next();
    response.headers.set('x-user-id', auth.userId);
    response.headers.set('x-user-email', auth.email);
    response.headers.set('x-user-role', auth.role);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};