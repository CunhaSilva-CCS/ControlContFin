import type { TransactionType } from '@/db/schema';

export type TransactionForAggregation = {
  amountCents: number;
  date: string;
  type: TransactionType;
  categoryId: number | null;
};

export type CategoryInfo = { name: string; color: string };

export type CategoryBreakdownItem = {
  categoryId: number | null;
  categoryName: string;
  color: string;
  totalCents: number;
  percent: number;
};

export function aggregateByCategory(
  transactions: TransactionForAggregation[],
  categoryLookup: Map<number, CategoryInfo>,
  type: 'income' | 'expense',
): CategoryBreakdownItem[] {
  const totals = new Map<number | null, number>();
  for (const transaction of transactions) {
    if (transaction.type !== type) {
      continue;
    }
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amountCents);
  }

  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);

  const items: CategoryBreakdownItem[] = [...totals.entries()].map(([categoryId, totalCents]) => {
    const info = categoryId !== null ? categoryLookup.get(categoryId) : undefined;
    return {
      categoryId,
      categoryName: info?.name ?? 'Sem categoria',
      color: info?.color ?? '#9E9E9E',
      totalCents,
      percent: grandTotal > 0 ? (totalCents / grandTotal) * 100 : 0,
    };
  });

  return items.sort((a, b) => b.totalCents - a.totalCents);
}

export type MonthlyTotal = {
  month: string;
  incomeCents: number;
  expenseCents: number;
};

/**
 * `months` should be an ordered list of YYYY-MM strings; each is matched
 * against the date prefix of every transaction.
 */
export function aggregateMonthlyTotals(
  transactions: TransactionForAggregation[],
  months: string[],
): MonthlyTotal[] {
  return months.map((month) => {
    let incomeCents = 0;
    let expenseCents = 0;
    for (const transaction of transactions) {
      if (!transaction.date.startsWith(month)) {
        continue;
      }
      if (transaction.type === 'income') {
        incomeCents += transaction.amountCents;
      } else if (transaction.type === 'expense') {
        expenseCents += transaction.amountCents;
      }
    }
    return { month, incomeCents, expenseCents };
  });
}

export type BalancePoint = {
  date: string;
  balanceCents: number;
};

/**
 * Cumulative balance over time from an initial balance. Transfers are
 * excluded since, summed across all accounts, they net to zero.
 */
export function aggregateBalanceTrend(
  transactions: TransactionForAggregation[],
  initialBalanceCents: number,
): BalancePoint[] {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  let running = initialBalanceCents;
  const points: BalancePoint[] = [];

  for (const transaction of sorted) {
    if (transaction.type === 'income') {
      running += transaction.amountCents;
    } else if (transaction.type === 'expense') {
      running -= transaction.amountCents;
    }
    points.push({ date: transaction.date, balanceCents: running });
  }

  return points;
}

export type MonthlyBalancePoint = {
  month: string;
  balanceCents: number;
};

/**
 * End-of-month balance for each month in `months` (ordered, oldest first),
 * carrying the balance forward across months with no transactions.
 */
export function aggregateMonthlyBalanceTrend(
  transactions: TransactionForAggregation[],
  initialBalanceCents: number,
  months: string[],
): MonthlyBalancePoint[] {
  const points = aggregateBalanceTrend(transactions, initialBalanceCents);

  return months.map((month) => {
    const monthEnd = `${month}-31`;
    let balanceCents = initialBalanceCents;
    for (const point of points) {
      if (point.date > monthEnd) {
        break;
      }
      balanceCents = point.balanceCents;
    }
    return { month, balanceCents };
  });
}
