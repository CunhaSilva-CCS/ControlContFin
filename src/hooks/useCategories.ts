import { db } from '@/db/client';
import { listCategories } from '@/db/repositories/categories';
import type { categories, CategoryType } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { useAsyncQuery } from './useAsyncQuery';

type Category = typeof categories.$inferSelect;

export function useCategories(type?: CategoryType) {
  const version = useDataStore((state) => state.version.categories);
  const { data, loading, error } = useAsyncQuery<Category[]>(
    () => listCategories(db, type),
    [version, type],
    [],
  );

  return { categories: data, loading, error };
}
