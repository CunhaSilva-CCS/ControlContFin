import { db } from '@/db/client';
import { listRecurringRules } from '@/db/repositories/recurringRules';
import type { recurringRules } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type RecurringRule = typeof recurringRules.$inferSelect;

export function useRecurringRules() {
  const version = useDataStore((state) => state.version.transactions);
  const { data, loading, error } = useAsyncQuery<RecurringRule[]>(
    () => listRecurringRules(db, { includeInactive: true }),
    [version],
    [],
  );

  return { rules: data, loading, error };
}
