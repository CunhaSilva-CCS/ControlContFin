import { db } from '@/db/client';
import { getSpentCentsForCategory, listBudgets } from '@/db/repositories/budgets';
import type { budgets } from '@/db/schema';
import { calculateBudgetProgress, type BudgetProgress } from '@/services/budgetCalculations';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type Budget = typeof budgets.$inferSelect;

export type BudgetWithProgress = Budget & { progress: BudgetProgress };

export function useBudgets(month: string) {
  const budgetsVersion = useDataStore((state) => state.version.budgets);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const { data, loading, error } = useAsyncQuery<BudgetWithProgress[]>(
    async () => {
      const rows = await listBudgets(db, month);
      return Promise.all(
        rows.map(async (budget) => {
          const spentCents = await getSpentCentsForCategory(db, budget.categoryId, month);
          return { ...budget, progress: calculateBudgetProgress(spentCents, budget.limitCents) };
        }),
      );
    },
    [month, budgetsVersion, transactionsVersion],
    [],
  );

  return { budgets: data, loading, error };
}
