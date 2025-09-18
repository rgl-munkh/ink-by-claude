import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

interface D1Database {
  prepare(query: string): unknown;
  exec(query: string): Promise<unknown>;
  batch(statements: unknown[]): Promise<unknown[]>;
  dump(): Promise<ArrayBuffer>;
}

export function createDatabase(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
export * from './schema';