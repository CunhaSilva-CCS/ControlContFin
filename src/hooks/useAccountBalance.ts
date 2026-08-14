import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { getAccountBalanceCents, listAccounts } from '@/db/repositories/accounts';
import { useDataStore } from '@/store/dataStore';

export function useAccountBalance(accountId: number) {
  const accountsVersion = useDataStore((state) => state.version.accounts);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const [balanceCents, setBalanceCents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAccountBalanceCents(db, accountId).then((cents) => {
      if (!cancelled) {
        setBalanceCents(cents);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [accountId, accountsVersion, transactionsVersion]);

  return { balanceCents, loading };
}

export function useTotalBalance() {
  const accountsVersion = useDataStore((state) => state.version.accounts);
  const transactionsVersion = useDataStore((state) => state.version.transactions);
  const [totalCents, setTotalCents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAccounts(db).then(async (accountsList) => {
      const balances = await Promise.all(
        accountsList.map((account) => getAccountBalanceCents(db, account.id)),
      );
      if (!cancelled) {
        setTotalCents(balances.reduce((sum, cents) => sum + cents, 0));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [accountsVersion, transactionsVersion]);

  return { totalCents, loading };
}
