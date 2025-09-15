import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import postgres from 'postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Type for Cloudflare Worker bindings
interface CloudflareBindings {
  HYPERDRIVE?: Hyperdrive;
  DATABASE_URL?: string;
}

// Cloudflare Hyperdrive connection
export function createCloudflareDb(bindings: CloudflareBindings) {
  if (bindings.HYPERDRIVE) {
    // Use Hyperdrive for optimized PostgreSQL connections in Cloudflare Workers
    const client = postgres(bindings.HYPERDRIVE.connectionString);
    return drizzle(client, { schema });
  }
  
  if (bindings.DATABASE_URL) {
    // Fallback to direct connection
    const client = postgres(bindings.DATABASE_URL);
    return drizzle(client, { schema });
  }
  
  throw new Error('No database connection available in Cloudflare Worker');
}

// Node.js connection (for local development and traditional deployments)
export function createNodeDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    // Optimize for serverless environments
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  return drizzleNode(pool, { schema });
}

// Universal database connection
export function createDatabase(env?: CloudflareBindings) {
  // Check if we're in a Cloudflare Worker environment
  if (typeof globalThis !== 'undefined' && 'HYPERDRIVE' in (env || {})) {
    return createCloudflareDb(env!);
  }
  
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
    return createNodeDb(process.env.DATABASE_URL);
  }
  
  // Check for runtime environment variables
  const databaseUrl = env?.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  
  // For Cloudflare Workers with direct DATABASE_URL
  if (databaseUrl.startsWith('hyperdrive://')) {
    return createCloudflareDb({ DATABASE_URL: databaseUrl });
  }
  
  // Default to Node.js connection
  return createNodeDb(databaseUrl);
}

// Export a default instance for convenience
export const db = createDatabase();