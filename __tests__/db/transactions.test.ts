import { createAccount } from '@/db/repositories/accounts';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from '@/db/repositories/transactions';
import { createTestDatabase } from '@/db/testClient';
import type { AppDatabase } from '@/db/types';

describe('transactions repository', () => {
  let db: AppDatabase;
  let accountId: number;

  beforeEach(async () => {
    db = createTestDatabase();
    const account = await createAccount(db, {
      name: 'Principal',
      type: 'checking',
      initialBalanceCents: 0,
      color: '#000000',
      icon: 'bank',
    });
    accountId = account.id;
  });

  it('creates, updates and deletes a transaction', async () => {
    const created = await createTransaction(db, {
      accountId,
      type: 'expense',
      amountCents: 1500,
      date: '2026-08-10',
      description: 'Mercado',
    });
    expect(created.amountCents).toBe(1500);

    const updated = await updateTransaction(db, created.id, { amountCents: 2000 });
    expect(updated.amountCents).toBe(2000);

    await deleteTransaction(db, created.id);
    const remaining = await listTransactions(db, { accountId });
    expect(remaining).toHaveLength(0);
  });

  it('filters transactions by date range', async () => {
    await createTransaction(db, { accountId, type: 'expense', amountCents: 100, date: '2026-07-15' });
    await createTransaction(db, { accountId, type: 'expense', amountCents: 200, date: '2026-08-05' });
    await createTransaction(db, { accountId, type: 'expense', amountCents: 300, date: '2026-08-20' });

    const august = await listTransactions(db, {
      accountId,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
    expect(august).toHaveLength(2);
    expect(august.map((t) => t.amountCents).sort()).toEqual([200, 300]);
  });

  it('orders transactions by date descending', async () => {
    await createTransaction(db, { accountId, type: 'expense', amountCents: 100, date: '2026-08-01' });
    await createTransaction(db, { accountId, type: 'expense', amountCents: 200, date: '2026-08-15' });

    const all = await listTransactions(db, { accountId });
    expect(all.map((t) => t.date)).toEqual(['2026-08-15', '2026-08-01']);
  });
});
