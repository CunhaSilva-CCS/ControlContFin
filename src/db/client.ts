import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import { getOrCreateDatabaseKey } from './encryptionKey';
import * as schema from './schema';

export const sqliteDb = openDatabaseSync('controlcontfin.db', { enableChangeListener: true });

// Must run before any other statement on this connection: SQLCipher reads
// the `key` pragma to decrypt/encrypt the database file. Requires the
// `useSQLCipher` build flag (see app.json's expo-sqlite plugin config) — on
// a plain (non-SQLCipher) SQLite build this pragma is a harmless no-op.
sqliteDb.execSync(`PRAGMA key = "x'${getOrCreateDatabaseKey()}'";`);

export const db = drizzle(sqliteDb, { schema });

export type Database = typeof db;
