import { Directory, File, Paths } from 'expo-file-system';

import type { AppDatabase } from '@/db/types';
import {
  accounts,
  budgets,
  categories,
  goalContributions,
  goals,
  recurringRules,
  transactions,
} from '@/db/schema';
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
    goals: (typeof goals.$inferSelect)[];
    goalContributions: (typeof goalContributions.$inferSelect)[];
  };
};

export async function buildBackupSnapshot(db: AppDatabase): Promise<BackupSnapshot> {
  const [
    accountsRows,
    categoriesRows,
    transactionsRows,
    recurringRulesRows,
    budgetsRows,
    goalsRows,
    goalContributionsRows,
  ] = await Promise.all([
    db.select().from(accounts),
    db.select().from(categories),
    db.select().from(transactions),
    db.select().from(recurringRules),
    db.select().from(budgets),
    db.select().from(goals),
    db.select().from(goalContributions),
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
      goals: goalsRows,
      goalContributions: goalContributionsRows,
    },
  };
}

/**
 * Replaces all local data with the contents of a snapshot. IDs are preserved
 * so cross-table references stay valid. Deletes children before parents and
 * inserts parents before children to respect foreign keys.
 */
export async function restoreBackupSnapshot(db: AppDatabase, snapshot: BackupSnapshot): Promise<void> {
  if (snapshot.version !== BACKUP_SNAPSHOT_VERSION) {
    throw new Error(`Versão de backup não suportada: ${snapshot.version}`);
  }

  await db.delete(goalContributions);
  await db.delete(budgets);
  await db.delete(goals);
  await db.delete(transactions);
  await db.delete(recurringRules);
  await db.delete(categories);
  await db.delete(accounts);

  const { data } = snapshot;
  if (data.accounts.length > 0) {
    await db.insert(accounts).values(data.accounts);
  }
  if (data.categories.length > 0) {
    await db.insert(categories).values(data.categories);
  }
  if (data.recurringRules.length > 0) {
    await db.insert(recurringRules).values(data.recurringRules);
  }
  if (data.transactions.length > 0) {
    await db.insert(transactions).values(data.transactions);
  }
  if (data.budgets.length > 0) {
    await db.insert(budgets).values(data.budgets);
  }
  if (data.goals.length > 0) {
    await db.insert(goals).values(data.goals);
  }
  if (data.goalContributions.length > 0) {
    await db.insert(goalContributions).values(data.goalContributions);
  }

  const { bump } = useDataStore.getState();
  bump('accounts');
  bump('categories');
  bump('transactions');
  bump('budgets');
  bump('goals');
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
