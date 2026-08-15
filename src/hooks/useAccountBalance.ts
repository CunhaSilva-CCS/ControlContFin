import { db } from '@/db/client';
import { getAllAccountBalancesCents } from '@/db/repositories/accounts';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

const EMPTY_BALANCES = new Map<number, number>();

/**
 * Balances for every account, fetched in one batch (two grouped queries
 * total, see `getAllAccountBalancesCents`) instead of one query per account
 * — callers needing several accounts' balances (or the total) should read
 * from this single map rather than each computing its own balance.
 */
export function useAccountBalances() {
  const accountsVersion = useDataStore((state) => state.version.accounts);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const { data, loading, error } = useAsyncQuery(
    () => getAllAccountBalancesCents(db),
    [accountsVersion, transactionsVersion],
    EMPTY_BALANCES,
  );

  return { balances: data, loading, error };
}
