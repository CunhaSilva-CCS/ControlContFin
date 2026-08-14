import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { listAccounts } from '@/db/repositories/accounts';
import type { accounts } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

type Account = typeof accounts.$inferSelect;

export function useAccounts(options: { includeArchived?: boolean } = {}) {
  const version = useDataStore((state) => state.version.accounts);
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAccounts(db, options).then((rows) => {
      if (!cancelled) {
        setAccountsList(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, options.includeArchived]);

  return { accounts: accountsList, loading };
}
