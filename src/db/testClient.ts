import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import * as schema from './schema';
import type { AppDatabase } from './types';

/**
 * In-memory DB backed by the real migration files, used to exercise repository
 * code in Jest without a device (drizzle's query builder is driver-agnostic).
 */
export function createTestDatabase(): AppDatabase {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  return db as unknown as AppDatabase;
}
