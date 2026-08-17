import { db } from '@/db/client';
import { listRecurringRules } from '@/db/repositories/recurringRules';
import type { recurringRules } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

export type RecurringRule = typeof recurringRules.$inferSelect;

export function useRecurringRules({ onlySubscriptions = false } = {}) {
  const version = useDataStore((state) => state.version.recurringRules);
  const { data, loading, error } = useAsyncQuery<RecurringRule[]>(
    () => listRecurringRules(db, { includeInactive: true, onlySubscriptions }),
    [version, onlySubscriptions],
    [],
  );

  return { rules: data, loading, error };
}
