import { useMemo } from 'react';

import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useLookup } from '@/hooks/useLookup';
import { useTransactions } from '@/hooks/useTransactions';
import {
  aggregateByCategory,
  aggregateMonthlyBalanceTrend,
  aggregateMonthlyTotals,
} from '@/services/reportAggregations';
import { currentMonth, lastNMonths } from '@/utils/date';

const TREND_MONTHS = 6;

export function useReportsData() {
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { categories, loading: loadingCategories } = useCategories();
  const { accounts, loading: loadingAccounts } = useAccounts({ includeArchived: true });

  const categoryLookup = useLookup(categories);
  const accountLookup = useLookup(accounts);

  const months = useMemo(() => lastNMonths(TREND_MONTHS), []);

  const categoryBreakdown = useMemo(
    () => aggregateByCategory(transactions, categoryLookup, 'expense'),
    [transactions, categoryLookup],
  );
  const monthlyTotals = useMemo(
    () => aggregateMonthlyTotals(transactions, months),
    [transactions, months],
  );
  const initialBalanceCents = useMemo(
    () =>
      accounts
        .filter((account) => !account.archived)
        .reduce((sum, account) => sum + account.initialBalanceCents, 0),
    [accounts],
  );
  const balanceTrend = useMemo(
    () => aggregateMonthlyBalanceTrend(transactions, initialBalanceCents, months),
    [transactions, initialBalanceCents, months],
  );

  return {
    transactions,
    categories,
    accounts,
    categoryLookup,
    accountLookup,
    categoryBreakdown,
    monthlyTotals,
    balanceTrend,
    currentMonth: currentMonth(),
    loading: loadingTransactions || loadingCategories || loadingAccounts,
  };
}
