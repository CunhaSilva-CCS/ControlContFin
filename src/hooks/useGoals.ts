import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { listGoals } from '@/db/repositories/goals';
import type { goals } from '@/db/schema';
import { calculateGoalProgress, type GoalProgress } from '@/services/goalCalculations';
import { useDataStore } from '@/store/dataStore';

type Goal = typeof goals.$inferSelect;

export type GoalWithProgress = Goal & { progress: GoalProgress };

export function useGoals() {
  const version = useDataStore((state) => state.version.goals);
  const [goalsList, setGoalsList] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listGoals(db).then((rows) => {
      if (!cancelled) {
        setGoalsList(
          rows.map((goal) => ({
            ...goal,
            progress: calculateGoalProgress(goal.currentCents, goal.targetCents),
          })),
        );
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { goals: goalsList, loading };
}
