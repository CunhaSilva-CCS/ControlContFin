import { eq } from 'drizzle-orm';

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
  useDataStore.getState().bump('categories');
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
