import { db } from '@/db/client';
import { listGoals } from '@/db/repositories/goals';
import type { goals } from '@/db/schema';
import { calculateGoalProgress, type GoalProgress } from '@/services/goalCalculations';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type Goal = typeof goals.$inferSelect;

export type GoalWithProgress = Goal & { progress: GoalProgress };

export function useGoals() {
  const version = useDataStore((state) => state.version.goals);
  const { data, loading, error } = useAsyncQuery<GoalWithProgress[]>(
    async () => {
      const rows = await listGoals(db);
      return rows.map((goal) => ({
        ...goal,
        progress: calculateGoalProgress(goal.currentCents, goal.targetCents),
      }));
    },
    [version],
    [],
  );

  return { goals: data, loading, error };
}
