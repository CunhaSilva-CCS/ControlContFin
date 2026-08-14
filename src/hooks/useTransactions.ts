import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { listTransactions, type TransactionFilters } from '@/db/repositories/transactions';
import type { transactions } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

type Transaction = typeof transactions.$inferSelect;

export function useTransactions(filters: TransactionFilters = {}) {
  const version = useDataStore((state) => state.version.transactions);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTransactions(db, filters).then((rows) => {
      if (!cancelled) {
        setTransactionsList(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, filtersKey]);

  return { transactions: transactionsList, loading };
}
