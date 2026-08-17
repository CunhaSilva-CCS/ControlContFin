import { and, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { categories, type CategoryType } from '../schema';

export type NewCategoryInput = {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault?: boolean;
};

export async function createCategory(db: AppDatabase, input: NewCategoryInput) {
  const [row] = await db.insert(categories).values(input).returning();
  useDataStore.getState().bump('categories');
  return row;
}

export async function updateCategory(db: AppDatabase, id: number, input: Partial<NewCategoryInput>) {
  const [row] = await db.update(categories).set(input).where(eq(categories.id, id)).returning();
  useDataStore.getState().bump('categories');
  return row;
}

export async function deleteCategory(db: AppDatabase, id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  // Cascades to delete any budget referencing this category (FK onDelete:
  // 'cascade' on budgets.categoryId) and to null out categoryId on any
  // recurring rule referencing it (FK onDelete: 'set null'), so both need
  // to re-query too.
  useDataStore.getState().bump('categories');
  useDataStore.getState().bump('budgets');
  useDataStore.getState().bump('recurringRules');
}

export async function listCategories(db: AppDatabase, type?: CategoryType) {
  if (type) {
    return db.select().from(categories).where(eq(categories.type, type)).orderBy(categories.name);
  }
  return db.select().from(categories).orderBy(categories.name);
}

export async function seedDefaultCategories(
  db: AppDatabase,
  defaults: NewCategoryInput[],
) {
  const existing = await db.select().from(categories);
  if (existing.length > 0) {
    return existing;
  }
  const seeded = await db
    .insert(categories)
    .values(defaults.map((category) => ({ ...category, isDefault: true })))
    .returning();
  useDataStore.getState().bump('categories');
  return seeded;
}

/**
 * The default-category colors from before the premium palette redesign,
 * paired with their name (from `seedCategories.ts` at that time) so the
 * recolor below only ever touches rows that still have BOTH the original
 * seeded name AND the original seeded color — i.e. genuinely untouched
 * defaults, never a category the user renamed or recolored themselves.
 */
const PRE_REDESIGN_SEED_COLORS: { name: string; oldColor: string }[] = [
  { name: 'Salário', oldColor: '#2E7D32' },
  { name: 'Freelance', oldColor: '#388E3C' },
  { name: 'Investimentos', oldColor: '#43A047' },
  { name: 'Outras receitas', oldColor: '#66BB6A' },
  { name: 'Alimentação', oldColor: '#C62828' },
  { name: 'Moradia', oldColor: '#AD1457' },
  { name: 'Transporte', oldColor: '#6A1B9A' },
  { name: 'Saúde', oldColor: '#0277BD' },
  { name: 'Educação', oldColor: '#00838F' },
  { name: 'Lazer', oldColor: '#EF6C00' },
  { name: 'Compras', oldColor: '#D84315' },
  { name: 'Assinaturas', oldColor: '#4527A0' },
  { name: 'Outras despesas', oldColor: '#5D4037' },
];

/**
 * One-time recolor of default categories that still carry their pre-redesign
 * seed color, to the new palette in `seedCategories.ts`. Naturally
 * idempotent: after the first run, colors match the new palette (not the
 * old one), so a second run matches nothing and is a no-op — no "has run"
 * flag needed.
 */
export async function recolorSeedDefaults(db: AppDatabase, defaults: NewCategoryInput[]) {
  const newColorByName = new Map(defaults.map((category) => [category.name, category.color]));
  let recolored = 0;

  for (const { name, oldColor } of PRE_REDESIGN_SEED_COLORS) {
    const newColor = newColorByName.get(name);
    if (!newColor) {
      continue;
    }
    const result = await db
      .update(categories)
      .set({ color: newColor })
      .where(and(eq(categories.name, name), eq(categories.color, oldColor)))
      .returning({ id: categories.id });
    recolored += result.length;
  }

  if (recolored > 0) {
    useDataStore.getState().bump('categories');
  }
  return recolored;
}
