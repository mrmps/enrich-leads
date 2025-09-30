import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy initialization to avoid build-time errors when DATABASE_URL isn't available
const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
};

let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop) {
    if (!_db) {
      _db = getDb();
    }
    return (_db as unknown as Record<string, unknown>)[prop as string];
  }
});
