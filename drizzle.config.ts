import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  ...(process.env.NODE_ENV === 'development'
    ? {
        dbCredentials: {
          url: './dev.db'
        }
      }
    : {
        driver: 'd1-http',
        dbCredentials: {
          databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        }
      }
  ),
  verbose: true,
  strict: true,
});