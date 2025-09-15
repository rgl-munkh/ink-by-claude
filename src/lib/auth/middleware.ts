import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  auth?: JWTPayload;
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    const auth = await getAuthFromRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.auth = auth || undefined;
    
    return handler(authenticatedRequest);
  };
}

export function withRole(
  requiredRoles: ('customer' | 'tattooist' | 'admin')[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
) {
  return withAuth(async (request: AuthenticatedRequest) => {
    if (!request.auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!requiredRoles.includes(request.auth.role)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }
    
    return handler(request);
  });
}

export function withOptionalAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    const auth = await getAuthFromRequest(request);
    
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.auth = auth || undefined;
    
    return handler(authenticatedRequest);
  };
}