import { create } from 'zustand';

export type DataTable = 'accounts' | 'categories' | 'transactions' | 'budgets' | 'goals';

type DataStoreState = {
  version: Record<DataTable, number>;
  bump: (table: DataTable) => void;
};

/**
 * Lightweight pub/sub: repository writes call bump(table), and hooks that
 * read that table subscribe to its counter to know when to re-query SQLite.
 */
export const useDataStore = create<DataStoreState>((set) => ({
  version: {
    accounts: 0,
    categories: 0,
    transactions: 0,
    budgets: 0,
    goals: 0,
  },
  bump: (table) =>
    set((state) => ({
      version: { ...state.version, [table]: state.version[table] + 1 },
    })),
}));
