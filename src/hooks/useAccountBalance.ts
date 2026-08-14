import { db } from '@/db/client';
import { getAccountBalanceCents, listAccounts } from '@/db/repositories/accounts';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

export function useAccountBalance(accountId: number) {
  const accountsVersion = useDataStore((state) => state.version.accounts);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const { data, loading, error } = useAsyncQuery(
    () => getAccountBalanceCents(db, accountId),
    [accountId, accountsVersion, transactionsVersion],
    0,
  );

  return { balanceCents: data, loading, error };
}

export function useTotalBalance() {
  const accountsVersion = useDataStore((state) => state.version.accounts);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const { data, loading, error } = useAsyncQuery(
    async () => {
      const accountsList = await listAccounts(db);
      const balances = await Promise.all(
        accountsList.map((account) => getAccountBalanceCents(db, account.id)),
      );
      return balances.reduce((sum, cents) => sum + cents, 0);
    },
    [accountsVersion, transactionsVersion],
    0,
  );

  return { totalCents: data, loading, error };
}
