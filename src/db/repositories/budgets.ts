import { and, eq, sql } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { budgets, transactions } from '../schema';

export type NewBudgetInput = {
  categoryId: number | null;
  month: string;
  limitCents: number;
};

export async function upsertBudget(db: AppDatabase, input: NewBudgetInput) {
  const conditions =
    input.categoryId === null
      ? and(sql`${budgets.categoryId} is null`, eq(budgets.month, input.month))
      : and(eq(budgets.categoryId, input.categoryId), eq(budgets.month, input.month));

  const [existing] = await db.select().from(budgets).where(conditions);

  let row;
  if (existing) {
    [row] = await db
      .update(budgets)
      .set({ limitCents: input.limitCents })
      .where(eq(budgets.id, existing.id))
      .returning();
  } else {
    [row] = await db.insert(budgets).values(input).returning();
  }
  useDataStore.getState().bump('budgets');
  return row;
}

export async function deleteBudget(db: AppDatabase, id: number) {
  await db.delete(budgets).where(eq(budgets.id, id));
  useDataStore.getState().bump('budgets');
}

export async function listBudgets(db: AppDatabase, month: string) {
  return db.select().from(budgets).where(eq(budgets.month, month));
}

/**
 * Sum of expense transactions for a category (or all categories, when
 * categoryId is null) within the given month (YYYY-MM).
 */
export async function getSpentCentsForCategory(
  db: AppDatabase,
  categoryId: number | null,
  month: string,
): Promise<number> {
  const monthCondition = sql`substr(${transactions.date}, 1, 7) = ${month}`;
  const categoryCondition =
    categoryId === null
      ? sql`1 = 1`
      : eq(transactions.categoryId, categoryId);

  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.type, 'expense'), monthCondition, categoryCondition));

  return row?.total ?? 0;
}
