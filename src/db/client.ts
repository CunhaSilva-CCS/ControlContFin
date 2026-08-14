import { drizzle } from 'drizzle-orm/expo-sqlite';
import { deleteDatabaseSync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { clearDatabaseKey, getOrCreateDatabaseKey } from './encryptionKey';
import * as schema from './schema';

const DB_NAME = 'controlcontfin.db';

function openAndKeyDatabase(): SQLiteDatabase {
  const database = openDatabaseSync(DB_NAME, { enableChangeListener: true });
  // Must run before any other statement on this connection: SQLCipher reads
  // the `key` pragma to decrypt/encrypt the database file. Requires the
  // `useSQLCipher` build flag (see app.json's expo-sqlite plugin config) — on
  // a plain (non-SQLCipher) SQLite build this pragma is a harmless no-op.
  database.execSync(`PRAGMA key = "x'${getOrCreateDatabaseKey()}'";`);
  // SQLCipher doesn't validate the key at PRAGMA-key time — a wrong key only
  // surfaces once something actually reads the encrypted file. Force that
  // check now (rather than on some arbitrary later query) so a bad key opens
  // as a clear, catchable error instead of failing unpredictably elsewhere.
  database.execSync('SELECT count(*) FROM sqlite_master;');
  return database;
}

/**
 * Non-null only when the database failed to open (e.g. the SQLCipher key in
 * secure-store doesn't match the on-disk file — this can happen after
 * restoring the device from a system backup, since the key is deliberately
 * device-bound and excluded from those backups while the file itself may not
 * be). App.tsx checks this before rendering anything that touches `db`.
 */
export let dbOpenError: Error | null = null;

let sqliteDbInstance: SQLiteDatabase | null = null;
try {
  sqliteDbInstance = openAndKeyDatabase();
} catch (error) {
  dbOpenError = error instanceof Error ? error : new Error(String(error));
}

export const sqliteDb = sqliteDbInstance as SQLiteDatabase;
export const db = sqliteDbInstance
  ? drizzle(sqliteDbInstance, { schema })
  : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

export type Database = typeof db;

/**
 * Recovery path when the database can't be opened: discards the
 * undecryptable file and the key that no longer matches it, so the app
 * starts fresh on next launch. Any data that was only in that file is lost —
 * a manually exported backup (Ajustes → Backup) is the only way to recover
 * it, since automatic backups are encrypted with the same now-discarded key.
 */
export async function resetDatabaseAfterOpenFailure(): Promise<void> {
  sqliteDbInstance?.closeSync();
  deleteDatabaseSync(DB_NAME);
  await clearDatabaseKey();
}
