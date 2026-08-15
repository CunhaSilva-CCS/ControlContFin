import { createCategory, listCategories, recolorSeedDefaults, seedDefaultCategories } from '@/db/repositories/categories';
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

  it('recolorSeedDefaults only updates rows that still have the exact pre-redesign name+color', async () => {
    const untouched = await createCategory(db, {
      name: 'Alimentação',
      type: 'expense',
      icon: 'food',
      color: '#C62828', // pre-redesign default color
    });
    const userRecolored = await createCategory(db, {
      name: 'Moradia',
      type: 'expense',
      icon: 'home',
      color: '#123456', // user picked a custom color, not the old default
    });

    const recolored = await recolorSeedDefaults(db, defaultCategories);
    expect(recolored).toBe(1);

    const newColorFor = new Map(defaultCategories.map((c) => [c.name, c.color]));
    const all = await listCategories(db);
    const untouchedAfter = all.find((c) => c.id === untouched.id);
    const userRecoloredAfter = all.find((c) => c.id === userRecolored.id);

    expect(untouchedAfter?.color).toBe(newColorFor.get('Alimentação'));
    expect(userRecoloredAfter?.color).toBe('#123456');

    // Idempotent: colors now match the new palette, not the old one, so a
    // second pass finds nothing left to recolor.
    const secondPass = await recolorSeedDefaults(db, defaultCategories);
    expect(secondPass).toBe(0);
  });
});
