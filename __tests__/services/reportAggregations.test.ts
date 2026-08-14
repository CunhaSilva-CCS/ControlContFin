import {
  aggregateBalanceTrend,
  aggregateByCategory,
  aggregateMonthlyBalanceTrend,
  aggregateMonthlyTotals,
  type TransactionForAggregation,
} from '@/services/reportAggregations';

describe('aggregateByCategory', () => {
  const categoryLookup = new Map([
    [1, { name: 'Alimentação', color: '#C62828' }],
    [2, { name: 'Transporte', color: '#6A1B9A' }],
  ]);

  it('sums expenses per category, sorted descending, with percent of total', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 3000, date: '2026-08-01', type: 'expense', categoryId: 1 },
      { amountCents: 1000, date: '2026-08-02', type: 'expense', categoryId: 2 },
      { amountCents: 2000, date: '2026-08-03', type: 'expense', categoryId: 1 },
      { amountCents: 5000, date: '2026-08-04', type: 'income', categoryId: 3 },
    ];

    const result = aggregateByCategory(transactions, categoryLookup, 'expense');
    expect(result).toEqual([
      { categoryId: 1, categoryName: 'Alimentação', color: '#C62828', totalCents: 5000, percent: 5000 / 6000 * 100 },
      { categoryId: 2, categoryName: 'Transporte', color: '#6A1B9A', totalCents: 1000, percent: 1000 / 6000 * 100 },
    ]);
  });

  it('falls back to "Sem categoria" for uncategorized transactions', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 1000, date: '2026-08-01', type: 'expense', categoryId: null },
    ];
    const result = aggregateByCategory(transactions, categoryLookup, 'expense');
    expect(result[0].categoryName).toBe('Sem categoria');
    expect(result[0].percent).toBe(100);
  });

  it('returns an empty array when there is nothing of that type', () => {
    const result = aggregateByCategory([], categoryLookup, 'income');
    expect(result).toEqual([]);
  });
});

describe('aggregateMonthlyTotals', () => {
  it('sums income and expense per month', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 5000, date: '2026-07-15', type: 'income', categoryId: null },
      { amountCents: 2000, date: '2026-07-20', type: 'expense', categoryId: null },
      { amountCents: 3000, date: '2026-08-05', type: 'expense', categoryId: null },
    ];

    const result = aggregateMonthlyTotals(transactions, ['2026-07', '2026-08']);
    expect(result).toEqual([
      { month: '2026-07', incomeCents: 5000, expenseCents: 2000 },
      { month: '2026-08', incomeCents: 0, expenseCents: 3000 },
    ]);
  });
});

describe('aggregateBalanceTrend', () => {
  it('accumulates balance in date order, ignoring transfers', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 2000, date: '2026-08-05', type: 'expense', categoryId: null },
      { amountCents: 10000, date: '2026-08-01', type: 'income', categoryId: null },
      { amountCents: 1000, date: '2026-08-03', type: 'transfer', categoryId: null },
    ];

    const result = aggregateBalanceTrend(transactions, 5000);
    expect(result).toEqual([
      { date: '2026-08-01', balanceCents: 15000 },
      { date: '2026-08-03', balanceCents: 15000 },
      { date: '2026-08-05', balanceCents: 13000 },
    ]);
  });
});

describe('aggregateMonthlyBalanceTrend', () => {
  it('carries the balance forward through months with no transactions', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 10000, date: '2026-06-10', type: 'income', categoryId: null },
      { amountCents: 3000, date: '2026-08-05', type: 'expense', categoryId: null },
    ];

    const result = aggregateMonthlyBalanceTrend(transactions, 5000, ['2026-06', '2026-07', '2026-08']);
    expect(result).toEqual([
      { month: '2026-06', balanceCents: 15000 },
      { month: '2026-07', balanceCents: 15000 },
      { month: '2026-08', balanceCents: 12000 },
    ]);
  });

  it('returns the initial balance for months entirely before any transaction', () => {
    const transactions: TransactionForAggregation[] = [
      { amountCents: 1000, date: '2026-08-01', type: 'income', categoryId: null },
    ];
    const result = aggregateMonthlyBalanceTrend(transactions, 500, ['2026-07']);
    expect(result).toEqual([{ month: '2026-07', balanceCents: 500 }]);
  });
});
