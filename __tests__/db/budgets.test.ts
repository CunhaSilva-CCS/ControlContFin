import { createAccount } from '@/db/repositories/accounts';
import {
  getSpentCentsByCategoryForMonth,
  getSpentCentsForCategory,
  listBudgets,
  upsertBudget,
} from '@/db/repositories/budgets';
import { createCategory } from '@/db/repositories/categories';
import { createTransaction } from '@/db/repositories/transactions';
import { createTestDatabase } from '@/db/testClient';
import type { AppDatabase } from '@/db/types';

describe('budgets repository', () => {
  let db: AppDatabase;
  let accountId: number;
  let categoryId: number;

  beforeEach(async () => {
    db = createTestDatabase();
    const account = await createAccount(db, {
      name: 'Principal',
      type: 'checking',
      initialBalanceCents: 0,
      color: '#000',
      icon: 'bank',
    });
    accountId = account.id;
    const category = await createCategory(db, {
      name: 'Alimentação',
      type: 'expense',
      icon: 'food',
      color: '#C62828',
    });
    categoryId = category.id;
  });

  it('creates a budget and updates it on a second upsert for the same category/month', async () => {
    await upsertBudget(db, { categoryId, month: '2026-08', limitCents: 50000 });
    await upsertBudget(db, { categoryId, month: '2026-08', limitCents: 60000 });

    const budgets = await listBudgets(db, '2026-08');
    expect(budgets).toHaveLength(1);
    expect(budgets[0].limitCents).toBe(60000);
  });

  it('sums only expense transactions within the given month for the category', async () => {
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 3000,
      date: '2026-08-05',
    });
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 2000,
      date: '2026-08-20',
    });
    // Outside the month, and an income transaction: should not be counted.
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 9000,
      date: '2026-07-31',
    });
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'income',
      amountCents: 5000,
      date: '2026-08-10',
    });

    const spent = await getSpentCentsForCategory(db, categoryId, '2026-08');
    expect(spent).toBe(5000);
  });

  it('sums across all categories when categoryId is null (overall budget)', async () => {
    const otherCategory = await createCategory(db, {
      name: 'Transporte',
      type: 'expense',
      icon: 'car',
      color: '#6A1B9A',
    });
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 1000,
      date: '2026-08-01',
    });
    await createTransaction(db, {
      accountId,
      categoryId: otherCategory.id,
      type: 'expense',
      amountCents: 1500,
      date: '2026-08-02',
    });

    const spent = await getSpentCentsForCategory(db, null, '2026-08');
    expect(spent).toBe(2500);
  });

  it('excludes transactions from the following month across a year boundary', async () => {
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 4000,
      date: '2026-12-31',
    });
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 9000,
      date: '2027-01-01',
    });

    const decemberSpent = await getSpentCentsForCategory(db, categoryId, '2026-12');
    expect(decemberSpent).toBe(4000);

    const januarySpent = await getSpentCentsForCategory(db, null, '2027-01');
    expect(januarySpent).toBe(9000);
  });

  it('getSpentCentsByCategoryForMonth matches per-category and overall totals from getSpentCentsForCategory', async () => {
    const otherCategory = await createCategory(db, {
      name: 'Transporte',
      type: 'expense',
      icon: 'car',
      color: '#6A1B9A',
    });
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 1000,
      date: '2026-08-01',
    });
    await createTransaction(db, {
      accountId,
      categoryId: otherCategory.id,
      type: 'expense',
      amountCents: 1500,
      date: '2026-08-02',
    });
    // Outside the month: should not be counted in either query.
    await createTransaction(db, {
      accountId,
      categoryId,
      type: 'expense',
      amountCents: 7000,
      date: '2026-07-15',
    });

    const { totalCents, byCategoryId } = await getSpentCentsByCategoryForMonth(db, '2026-08');

    expect(totalCents).toBe(await getSpentCentsForCategory(db, null, '2026-08'));
    expect(byCategoryId.get(categoryId)).toBe(await getSpentCentsForCategory(db, categoryId, '2026-08'));
    expect(byCategoryId.get(otherCategory.id)).toBe(
      await getSpentCentsForCategory(db, otherCategory.id, '2026-08'),
    );
  });
});
