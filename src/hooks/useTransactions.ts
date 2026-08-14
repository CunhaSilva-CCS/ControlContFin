import { db } from '@/db/client';
import { listTransactions, type TransactionFilters } from '@/db/repositories/transactions';
import type { transactions } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type Transaction = typeof transactions.$inferSelect;

export function useTransactions(filters: TransactionFilters = {}) {
  const version = useDataStore((state) => state.version.transactions);
  const filtersKey = JSON.stringify(filters);
  const { data, loading, error } = useAsyncQuery<Transaction[]>(
    () => listTransactions(db, filters),
    [version, filtersKey],
    [],
  );

  return { transactions: data, loading, error };
}
