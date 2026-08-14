import { useEffect, useState } from 'react';

import { db } from '@/db/client';
import { listCategories } from '@/db/repositories/categories';
import type { categories, CategoryType } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

type Category = typeof categories.$inferSelect;

export function useCategories(type?: CategoryType) {
  const version = useDataStore((state) => state.version.categories);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCategories(db, type).then((rows) => {
      if (!cancelled) {
        setCategoriesList(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [version, type]);

  return { categories: categoriesList, loading };
}
