import { db } from '@/db/client';
import { listAccounts } from '@/db/repositories/accounts';
import type { accounts } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type Account = typeof accounts.$inferSelect;

export function useAccounts(options: { includeArchived?: boolean } = {}) {
  const version = useDataStore((state) => state.version.accounts);
  const { data, loading, error } = useAsyncQuery<Account[]>(
    () => listAccounts(db, options),
    [version, options.includeArchived],
    [],
  );

  return { accounts: data, loading, error };
}
