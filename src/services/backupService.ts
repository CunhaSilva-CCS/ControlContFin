import { Directory, File, Paths } from 'expo-file-system';

import type { AppDatabase } from '@/db/types';
import { accounts, budgets, categories, recurringRules, transactions } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { filesToPrune, shouldCreateBackup } from './backupRetention';
import { encryptBackupPayload } from './backupEncryption';

const BACKUP_SNAPSHOT_VERSION = 1;
const BACKUP_RETENTION_COUNT = 5;

export type BackupSnapshot = {
  version: number;
  createdAt: string;
  data: {
    accounts: (typeof accounts.$inferSelect)[];
    categories: (typeof categories.$inferSelect)[];
    transactions: (typeof transactions.$inferSelect)[];
    recurringRules: (typeof recurringRules.$inferSelect)[];
    budgets: (typeof budgets.$inferSelect)[];
  };
};

export async function buildBackupSnapshot(db: AppDatabase): Promise<BackupSnapshot> {
  const [accountsRows, categoriesRows, transactionsRows, recurringRulesRows, budgetsRows] =
    await Promise.all([
      db.select().from(accounts),
      db.select().from(categories),
      db.select().from(transactions),
      db.select().from(recurringRules),
      db.select().from(budgets),
    ]);

  return {
    version: BACKUP_SNAPSHOT_VERSION,
    createdAt: new Date().toISOString(),
    data: {
      accounts: accountsRows,
      categories: categoriesRows,
      transactions: transactionsRows,
      recurringRules: recurringRulesRows,
      budgets: budgetsRows,
    },
  };
}

const BACKUP_DATA_KEYS = ['accounts', 'categories', 'transactions', 'recurringRules', 'budgets'] as const;

/**
 * Checked before anything is deleted, so a corrupted/truncated backup file
 * (e.g. the app was killed mid-write) fails fast with a clear error instead
 * of throwing partway through `restoreBackupSnapshot` after the live
 * database has already been wiped.
 */
function assertValidBackupShape(snapshot: BackupSnapshot): void {
  if (typeof snapshot !== 'object' || snapshot === null || typeof snapshot.data !== 'object' || snapshot.data === null) {
    throw new Error('Arquivo de backup corrompido: formato inválido.');
  }
  for (const key of BACKUP_DATA_KEYS) {
    if (!Array.isArray(snapshot.data[key])) {
      throw new Error(`Arquivo de backup corrompido: "${key}" ausente ou inválido.`);
    }
  }
}

/**
 * Replaces all local data with the contents of a snapshot. IDs are preserved
 * so cross-table references stay valid. Deletes children before parents and
 * inserts parents before children to respect foreign keys. Runs inside a
 * single DB transaction so a failure partway through rolls back instead of
 * leaving the database half-wiped.
 */
export async function restoreBackupSnapshot(db: AppDatabase, snapshot: BackupSnapshot): Promise<void> {
  if (snapshot.version !== BACKUP_SNAPSHOT_VERSION) {
    throw new Error(`Versão de backup não suportada: ${snapshot.version}`);
  }
  assertValidBackupShape(snapshot);

  const { data } = snapshot;

  db.transaction((tx) => {
    tx.delete(budgets).run();
    tx.delete(transactions).run();
    tx.delete(recurringRules).run();
    tx.delete(categories).run();
    tx.delete(accounts).run();

    if (data.accounts.length > 0) {
      tx.insert(accounts).values(data.accounts).run();
    }
    if (data.categories.length > 0) {
      tx.insert(categories).values(data.categories).run();
    }
    if (data.recurringRules.length > 0) {
      tx.insert(recurringRules).values(data.recurringRules).run();
    }
    if (data.transactions.length > 0) {
      tx.insert(transactions).values(data.transactions).run();
    }
    if (data.budgets.length > 0) {
      tx.insert(budgets).values(data.budgets).run();
    }
  });

  const { bump } = useDataStore.getState();
  bump('accounts');
  bump('categories');
  bump('transactions');
  bump('budgets');
  bump('recurringRules');
}

function backupsDirectory(): Directory {
  const directory = new Directory(Paths.document, 'backups');
  if (!directory.exists) {
    directory.create();
  }
  return directory;
}

function backupFilename(isoTimestamp: string): string {
  // .enc (not .json) since the contents are AES-encrypted, not plain JSON.
  return `backup-${isoTimestamp.replace(/[:.]/g, '-')}.enc`;
}

function listBackupFiles(): File[] {
  return backupsDirectory()
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Writes a new automatic backup if the last one is from a previous calendar
 * day, then prunes old backups beyond the retention count. Safe to call on
 * every app foreground/background-task run.
 */
export async function runAutomaticBackupIfDue(db: AppDatabase, todayISODate: string): Promise<void> {
  const existing = listBackupFiles();
  // The date portion (YYYY-MM-DD) at the start of the ISO timestamp is
  // unaffected by the ':'/'.' -> '-' filename sanitization, so it can be
  // read straight out of the filename without reconstructing a full ISO string.
  const lastBackupDate = existing.at(-1)?.name.slice('backup-'.length, 'backup-'.length + 10) ?? null;

  if (!shouldCreateBackup(lastBackupDate, todayISODate)) {
    return;
  }

  const snapshot = await buildBackupSnapshot(db);
  const file = new File(backupsDirectory(), backupFilename(snapshot.createdAt));
  file.create();
  file.write(encryptBackupPayload(JSON.stringify(snapshot)));

  const names = listBackupFiles().map((entry) => entry.name);
  for (const name of filesToPrune(names, BACKUP_RETENTION_COUNT)) {
    new File(backupsDirectory(), name).delete();
  }
}

export function listAutomaticBackups(): { name: string; createdAt: string }[] {
  return listBackupFiles()
    .map((file) => ({
      name: file.name,
      createdAt: file.name.replace('backup-', '').replace('.enc', ''),
    }))
    .reverse();
}
