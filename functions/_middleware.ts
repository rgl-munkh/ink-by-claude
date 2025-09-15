// Cloudflare Pages Functions middleware
// This enables server-side functionality for Next.js on Cloudflare Pages

import { createCloudflareDb } from '../src/lib/db/cloudflare';

// Define the Cloudflare Pages environment interface
interface CloudflarePagesEnv {
  // Hyperdrive database connection
  HYPERDRIVE?: Hyperdrive;
  
  // KV namespaces
  CACHE?: KVNamespace;
  SESSIONS?: KVNamespace;
  
  // R2 bucket for images
  IMAGES?: R2Bucket;
  
  // Secrets and environment variables
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  QPAY_API_KEY?: string;
  QPAY_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV?: string;
}

// Middleware function to handle database connections and other Cloudflare services
export async function onRequest(context: {
  request: Request;
  env: CloudflarePagesEnv;
  next: (request?: Request) => Promise<Response>;
}) {
  const { request, env, next } = context;

  try {
    // Initialize database connection if needed
    if (env.HYPERDRIVE || env.DATABASE_URL) {
      const db = createCloudflareDb(env);
      
      // Attach database to request context (for API routes)
      (request as any).db = db;
    }

    // Add CORS headers for API routes
    if (request.url.includes('/api/')) {
      const response = await next(request);
      
      // Clone response to add headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return newResponse;
    }

    // Handle preflight CORS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Continue with normal request processing
    return await next(request);

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}