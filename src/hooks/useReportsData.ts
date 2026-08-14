import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
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
  const { accounts, loading: loadingAccounts } = useAccounts();

  const categoryLookup = new Map(categories.map((category) => [category.id, category]));
  const months = lastNMonths(TREND_MONTHS);

  const categoryBreakdown = aggregateByCategory(transactions, categoryLookup, 'expense');
  const monthlyTotals = aggregateMonthlyTotals(transactions, months);
  const initialBalanceCents = accounts.reduce((sum, account) => sum + account.initialBalanceCents, 0);
  const balanceTrend = aggregateMonthlyBalanceTrend(transactions, initialBalanceCents, months);

  return {
    categoryBreakdown,
    monthlyTotals,
    balanceTrend,
    currentMonth: currentMonth(),
    loading: loadingTransactions || loadingCategories || loadingAccounts,
  };
}
