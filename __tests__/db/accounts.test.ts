import {
  createAccount,
  getAccountBalanceCents,
  getAllAccountBalancesCents,
  listAccounts,
  updateAccount,
} from '@/db/repositories/accounts';
import { createTransaction } from '@/db/repositories/transactions';
import { createTestDatabase } from '@/db/testClient';
import type { AppDatabase } from '@/db/types';

describe('accounts repository', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it('creates and lists accounts, excluding archived ones by default', async () => {
    const checking = await createAccount(db, {
      name: 'Conta corrente',
      type: 'checking',
      initialBalanceCents: 10000,
      color: '#000000',
      icon: 'bank',
    });
    const archived = await createAccount(db, {
      name: 'Antiga',
      type: 'savings',
      initialBalanceCents: 0,
      color: '#000000',
      icon: 'bank',
    });
    await updateAccount(db, archived.id, { archived: true });

    const active = await listAccounts(db);
    expect(active.map((a) => a.id)).toEqual([checking.id]);

    const all = await listAccounts(db, { includeArchived: true });
    expect(all).toHaveLength(2);
  });

  it('computes balance from initial balance plus income/expense/transfers', async () => {
    const main = await createAccount(db, {
      name: 'Principal',
      type: 'checking',
      initialBalanceCents: 100000,
      color: '#000000',
      icon: 'bank',
    });
    const savings = await createAccount(db, {
      name: 'Poupança',
      type: 'savings',
      initialBalanceCents: 0,
      color: '#000000',
      icon: 'piggy-bank',
    });

    await createTransaction(db, {
      accountId: main.id,
      type: 'income',
      amountCents: 50000,
      date: '2026-08-01',
    });
    await createTransaction(db, {
      accountId: main.id,
      type: 'expense',
      amountCents: 20000,
      date: '2026-08-02',
    });
    await createTransaction(db, {
      accountId: main.id,
      transferAccountId: savings.id,
      type: 'transfer',
      amountCents: 30000,
      date: '2026-08-03',
    });

    expect(await getAccountBalanceCents(db, main.id)).toBe(100000 + 50000 - 20000 - 30000);
    expect(await getAccountBalanceCents(db, savings.id)).toBe(30000);
  });

  it('getAllAccountBalancesCents matches getAccountBalanceCents for every account, including archived ones', async () => {
    const main = await createAccount(db, {
      name: 'Principal',
      type: 'checking',
      initialBalanceCents: 100000,
      color: '#000000',
      icon: 'bank',
    });
    const savings = await createAccount(db, {
      name: 'Poupança',
      type: 'savings',
      initialBalanceCents: 0,
      color: '#000000',
      icon: 'piggy-bank',
    });
    const archived = await createAccount(db, {
      name: 'Antiga',
      type: 'checking',
      initialBalanceCents: 5000,
      color: '#000000',
      icon: 'bank',
    });
    await updateAccount(db, archived.id, { archived: true });

    await createTransaction(db, {
      accountId: main.id,
      type: 'income',
      amountCents: 50000,
      date: '2026-08-01',
    });
    await createTransaction(db, {
      accountId: main.id,
      type: 'expense',
      amountCents: 20000,
      date: '2026-08-02',
    });
    await createTransaction(db, {
      accountId: main.id,
      transferAccountId: savings.id,
      type: 'transfer',
      amountCents: 30000,
      date: '2026-08-03',
    });

    const balances = await getAllAccountBalancesCents(db);

    expect(balances.get(main.id)).toBe(await getAccountBalanceCents(db, main.id));
    expect(balances.get(savings.id)).toBe(await getAccountBalanceCents(db, savings.id));
    expect(balances.get(archived.id)).toBe(await getAccountBalanceCents(db, archived.id));
    expect(balances.get(archived.id)).toBe(5000);
  });
});
