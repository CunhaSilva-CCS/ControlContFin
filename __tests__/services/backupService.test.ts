import { createAccount } from '@/db/repositories/accounts';
import { upsertBudget } from '@/db/repositories/budgets';
import { createCategory } from '@/db/repositories/categories';
import { contributeToGoal, createGoal } from '@/db/repositories/goals';
import { createRecurringRule } from '@/db/repositories/recurringRules';
import { createTransaction } from '@/db/repositories/transactions';
import { createTestDatabase } from '@/db/testClient';
import { accounts, categories, transactions } from '@/db/schema';
import type { AppDatabase } from '@/db/types';
import { buildBackupSnapshot, restoreBackupSnapshot } from '@/services/backupService';

async function seedSampleData(db: AppDatabase) {
  const account = await createAccount(db, {
    name: 'Principal',
    type: 'checking',
    initialBalanceCents: 100000,
    color: '#1B5E4F',
    icon: 'bank',
  });
  const category = await createCategory(db, {
    name: 'Alimentação',
    type: 'expense',
    icon: 'food',
    color: '#C62828',
  });
  await createTransaction(db, {
    accountId: account.id,
    categoryId: category.id,
    type: 'expense',
    amountCents: 5000,
    date: '2026-08-10',
    description: 'Mercado',
  });
  await createRecurringRule(db, {
    accountId: account.id,
    categoryId: category.id,
    type: 'expense',
    amountCents: 2000,
    description: 'Assinatura',
    frequency: 'monthly',
    interval: 1,
    startDate: '2026-08-01',
    nextRunDate: '2026-09-01',
  });
  await upsertBudget(db, { categoryId: category.id, month: '2026-08', limitCents: 30000 });
  const goal = await createGoal(db, {
    name: 'Viagem',
    targetCents: 200000,
    color: '#1B5E4F',
    icon: 'airplane',
  });
  await contributeToGoal(db, goal.id, 10000, '2026-08-05');

  return { account, category, goal };
}

describe('backup snapshot round-trip', () => {
  it('captures every table in the snapshot', async () => {
    const db = createTestDatabase();
    await seedSampleData(db);

    const snapshot = await buildBackupSnapshot(db);

    expect(snapshot.data.accounts).toHaveLength(1);
    expect(snapshot.data.categories).toHaveLength(1);
    expect(snapshot.data.transactions).toHaveLength(1);
    expect(snapshot.data.recurringRules).toHaveLength(1);
    expect(snapshot.data.budgets).toHaveLength(1);
    expect(snapshot.data.goals).toHaveLength(1);
    expect(snapshot.data.goalContributions).toHaveLength(1);
  });

  it('restores a snapshot into an empty database, preserving IDs and relations', async () => {
    const sourceDb = createTestDatabase();
    const { account, category } = await seedSampleData(sourceDb);
    const snapshot = await buildBackupSnapshot(sourceDb);

    const targetDb = createTestDatabase();
    await restoreBackupSnapshot(targetDb, snapshot);

    const restoredAccounts = await targetDb.select().from(accounts);
    const restoredCategories = await targetDb.select().from(categories);
    const restoredTransactions = await targetDb.select().from(transactions);

    expect(restoredAccounts).toHaveLength(1);
    expect(restoredAccounts[0].id).toBe(account.id);
    expect(restoredCategories[0].id).toBe(category.id);
    expect(restoredTransactions[0].accountId).toBe(account.id);
    expect(restoredTransactions[0].categoryId).toBe(category.id);
  });

  it('replaces existing data rather than appending to it', async () => {
    const sourceDb = createTestDatabase();
    await seedSampleData(sourceDb);
    const snapshot = await buildBackupSnapshot(sourceDb);

    const targetDb = createTestDatabase();
    await createAccount(targetDb, {
      name: 'Conta antiga',
      type: 'savings',
      initialBalanceCents: 0,
      color: '#000',
      icon: 'bank',
    });

    await restoreBackupSnapshot(targetDb, snapshot);

    const restoredAccounts = await targetDb.select().from(accounts);
    expect(restoredAccounts).toHaveLength(1);
    expect(restoredAccounts[0].name).toBe('Principal');
  });

  it('rejects a snapshot with an unsupported version', async () => {
    const db = createTestDatabase();
    const snapshot = await buildBackupSnapshot(db);

    await expect(restoreBackupSnapshot(db, { ...snapshot, version: 999 })).rejects.toThrow();
  });
});
