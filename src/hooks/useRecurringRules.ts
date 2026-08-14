import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { listRecurringRules } from '@/db/repositories/recurringRules';
import type { recurringRules } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

type RecurringRule = typeof recurringRules.$inferSelect;

export function useRecurringRules() {
  const version = useDataStore((state) => state.version.transactions);
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listRecurringRules(db, { includeInactive: true }).then((rows) => {
      if (!cancelled) {
        setRules(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { rules, loading };
}
