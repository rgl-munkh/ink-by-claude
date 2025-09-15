// Cloudflare Worker Entry Point for Claude Ink By
import { createCloudflareDb } from './lib/db/cloudflare';
import { users, bookings, tattooists } from './lib/db/schema';
import { eq } from 'drizzle-orm';

// Cloudflare Worker environment bindings
export interface Env {
  // Hyperdrive database connection
  HYPERDRIVE: Hyperdrive;
  
  // KV namespaces
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  
  // R2 bucket for images
  IMAGES: R2Bucket;
  
  // Secrets (set via wrangler secret put)
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  QPAY_API_KEY?: string;
  QPAY_SECRET?: string;
  
  // Environment variables
  NODE_ENV?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// JSON response helper
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Error response helper
function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status);
}

// Main worker handler
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    try {
      // Initialize database connection
      const db = createCloudflareDb(env);
      
      const url = new URL(request.url);
      const pathname = url.pathname;
      const method = request.method;

      // Health check endpoint
      if (pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: env.NODE_ENV || 'unknown'
        });
      }

      // API Routes
      if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api/', '');
        
        switch (apiPath) {
          case 'users':
            if (method === 'GET') {
              // Get all users (admin only - add auth check in production)
              const allUsers = await db.select().from(users).limit(50);
              return jsonResponse(allUsers);
            }
            break;

          case 'tattooists':
            if (method === 'GET') {
              // Get approved tattooists with user info
              const approvedTattooists = await db
                .select({
                  id: tattooists.id,
                  userId: tattooists.userId,
                  bio: tattooists.bio,
                  approved: tattooists.approved,
                  createdAt: tattooists.createdAt,
                  userName: users.name,
                  userEmail: users.email,
                })
                .from(tattooists)
                .leftJoin(users, eq(tattooists.userId, users.id))
                .where(eq(tattooists.approved, true));
              
              return jsonResponse(approvedTattooists);
            }
            break;

          case 'bookings':
            if (method === 'GET') {
              // Get recent bookings (add pagination in production)
              const recentBookings = await db
                .select()
                .from(bookings)
                .limit(20)
                .orderBy(bookings.createdAt);
              
              return jsonResponse(recentBookings);
            }
            break;

          default:
            return errorResponse('API endpoint not found', 404);
        }
      }

      // Static file handling or redirect to frontend
      if (pathname === '/' || pathname === '/app') {
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Claude Ink By</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
              <h1>Claude Ink By</h1>
              <p>Tattoo booking platform API is running!</p>
              <ul>
                <li><a href="/health">Health Check</a></li>
                <li><a href="/api/tattooists">View Tattooists</a></li>
                <li><a href="/api/bookings">View Bookings</a></li>
              </ul>
            </body>
          </html>
        `, {
          headers: {
            'Content-Type': 'text/html',
            ...corsHeaders,
          },
        });
      }

      // 404 for other routes
      return errorResponse('Route not found', 404);

    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  },
};

export default worker;