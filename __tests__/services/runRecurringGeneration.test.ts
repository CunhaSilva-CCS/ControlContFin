import { createAccount } from '@/db/repositories/accounts';
import { createRecurringRule } from '@/db/repositories/recurringRules';
import { listTransactions } from '@/db/repositories/transactions';
import { createTestDatabase } from '@/db/testClient';
import type { AppDatabase } from '@/db/types';

// db/client.ts opens a real (native-only) SQLCipher connection at import
// time, which doesn't work under Jest — runRecurringGeneration.ts imports it
// as a fixed singleton, so redirect that singleton to an in-memory test DB
// for this file, matching the pattern used for other db-touching services.
let mockDb: AppDatabase;
jest.mock('@/db/client', () => ({
  get db() {
    return mockDb;
  },
}));

// eslint-disable-next-line import/first -- must load after jest.mock('@/db/client') above
import { runRecurringGeneration } from '@/services/runRecurringGeneration';

describe('runRecurringGeneration', () => {
  beforeEach(() => {
    mockDb = createTestDatabase();
  });

  it('tags every generated transaction with recurringRuleId and isRecurringGenerated', async () => {
    const account = await createAccount(mockDb, {
      name: 'Principal',
      type: 'checking',
      initialBalanceCents: 0,
      color: '#000',
      icon: 'bank',
    });
    const rule = await createRecurringRule(mockDb, {
      accountId: account.id,
      categoryId: null,
      type: 'expense',
      amountCents: 2000,
      description: 'Assinatura',
      frequency: 'monthly',
      interval: 1,
      startDate: '2026-06-01',
      nextRunDate: '2026-06-01',
    });

    const generated = await runRecurringGeneration('2026-08-15');
    expect(generated).toBeGreaterThan(0);

    const rows = await listTransactions(mockDb);
    expect(rows.length).toBe(generated);
    for (const row of rows) {
      expect(row.recurringRuleId).toBe(rule.id);
      expect(row.isRecurringGenerated).toBe(true);
    }
  });
});
