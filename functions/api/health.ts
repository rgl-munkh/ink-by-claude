// Cloudflare Pages Function for health check API
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  HYPERDRIVE?: Hyperdrive;
  CACHE?: KVNamespace;
  SESSIONS?: KVNamespace;
  IMAGES?: R2Bucket;
  DATABASE_URL?: string;
  NODE_ENV?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV || 'unknown',
      services: {
        database: !!env.HYPERDRIVE || !!env.DATABASE_URL,
        cache: !!env.CACHE,
        sessions: !!env.SESSIONS,
        images: !!env.IMAGES,
      }
    };

    return new Response(JSON.stringify(health, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};