import { listCategories, seedDefaultCategories } from '@/db/repositories/categories';
import { createTestDatabase } from '@/db/testClient';
import type { AppDatabase } from '@/db/types';
import { defaultCategories } from '@/constants/seedCategories';

describe('categories repository', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = createTestDatabase();
  });

  it('seeds default categories only once', async () => {
    const seeded = await seedDefaultCategories(db, defaultCategories);
    expect(seeded).toHaveLength(defaultCategories.length);

    const seededAgain = await seedDefaultCategories(db, defaultCategories);
    expect(seededAgain).toHaveLength(defaultCategories.length);

    const all = await listCategories(db);
    expect(all).toHaveLength(defaultCategories.length);
  });

  it('filters categories by type', async () => {
    await seedDefaultCategories(db, defaultCategories);
    const income = await listCategories(db, 'income');
    expect(income.every((c) => c.type === 'income')).toBe(true);
    expect(income.length).toBeGreaterThan(0);
  });
});
