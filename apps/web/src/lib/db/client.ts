import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not configured. Copy .env.local.example → apps/web/.env.local and fill in the Neon connection string.',
    );
  }
  _db = drizzle({ client: neon(url), schema });
  return _db;
}

export type { Db };
