import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { getSpentCentsForCategory, listBudgets } from '@/db/repositories/budgets';
import type { budgets } from '@/db/schema';
import { calculateBudgetProgress, type BudgetProgress } from '@/services/budgetCalculations';
import { useDataStore } from '@/store/dataStore';

type Budget = typeof budgets.$inferSelect;

export type BudgetWithProgress = Budget & { progress: BudgetProgress };

export function useBudgets(month: string) {
  const budgetsVersion = useDataStore((state) => state.version.budgets);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const [budgetsList, setBudgetsList] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listBudgets(db, month).then(async (rows) => {
      const withProgress = await Promise.all(
        rows.map(async (budget) => {
          const spentCents = await getSpentCentsForCategory(db, budget.categoryId, month);
          return { ...budget, progress: calculateBudgetProgress(spentCents, budget.limitCents) };
        }),
      );
      if (!cancelled) {
        setBudgetsList(withProgress);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [month, budgetsVersion, transactionsVersion]);

  return { budgets: budgetsList, loading };
}
