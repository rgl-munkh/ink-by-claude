import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

interface D1Database {
  prepare(query: string): unknown;
  exec(query: string): Promise<unknown>;
  batch(statements: unknown[]): Promise<unknown[]>;
  dump(): Promise<ArrayBuffer>;
}

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase(d1Database?: D1Database) {
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const sqlite = new Database('dev.db');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
      db = drizzleSqlite(sqlite, { schema });
    } else {
      if (!d1Database) {
        throw new Error('D1 database instance required in production');
      }
      db = drizzle(d1Database, { schema });
    }
  }

  return db;
}

export type Database = NonNullable<ReturnType<typeof getDatabase>>;
export * from '@/db/schema';