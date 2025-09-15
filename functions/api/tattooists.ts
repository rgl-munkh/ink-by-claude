// Cloudflare Pages Function for tattooists API
import type { PagesFunction } from '@cloudflare/workers-types';
import { createCloudflareDb } from '../../src/lib/db/cloudflare';
import { users, tattooists } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Env {
  HYPERDRIVE?: Hyperdrive;
  DATABASE_URL?: string;
  CACHE?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // Initialize database connection
    const db = createCloudflareDb(env);

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
      .where(eq(tattooists.approved, true))
      .limit(50);

    // Cache the result for 5 minutes
    if (env.CACHE) {
      await env.CACHE.put(
        'tattooists:approved', 
        JSON.stringify(approvedTattooists),
        { expirationTtl: 300 }
      );
    }

    return new Response(JSON.stringify(approvedTattooists, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });

  } catch (error) {
    console.error('Tattooists API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch tattooists',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Initialize database connection
    const db = createCloudflareDb(env);

    // Parse request body
    const body = await request.json() as {
      userId: string;
      bio?: string;
    };

    if (!body.userId) {
      return new Response(JSON.stringify({
        error: 'Missing required field: userId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create tattooist profile (requires approval)
    const [newTattooist] = await db.insert(tattooists).values({
      userId: body.userId,
      bio: body.bio || null,
      approved: false, // Requires admin approval
    }).returning();

    // Invalidate cache
    if (env.CACHE) {
      await env.CACHE.delete('tattooists:approved');
    }

    return new Response(JSON.stringify(newTattooist, null, 2), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Create tattooist error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to create tattooist profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};