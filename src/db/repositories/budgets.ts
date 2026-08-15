import { and, eq, gte, lt, sql } from 'drizzle-orm';

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
 * Exclusive [start, end) date range for a YYYY-MM month, expressed as
 * comparisons rather than `substr(date, 1, 7) = month` so the existing
 * `(categoryId, date)` index can actually be used.
 */
function monthDateRange(month: string): { start: string; end: string } {
  const [year, monthNum] = month.split('-').map(Number);
  const start = `${month}-01`;
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, end };
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
  const { start, end } = monthDateRange(month);
  const categoryCondition =
    categoryId === null
      ? sql`1 = 1`
      : eq(transactions.categoryId, categoryId);

  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, 'expense'),
        gte(transactions.date, start),
        lt(transactions.date, end),
        categoryCondition,
      ),
    );

  return row?.total ?? 0;
}

export type SpentCentsByMonth = {
  /** Sum of every expense transaction in the month, regardless of category. */
  totalCents: number;
  /** Sum of expense transactions per category, for categorized transactions only. */
  byCategoryId: Map<number, number>;
};

/**
 * Spent totals for a month in two grouped queries total, instead of one
 * `getSpentCentsForCategory` call per budget row — callers with several
 * budgets for the same month should use this instead.
 */
export async function getSpentCentsByCategoryForMonth(
  db: AppDatabase,
  month: string,
): Promise<SpentCentsByMonth> {
  const { start, end } = monthDateRange(month);
  const monthExpenseCondition = and(
    eq(transactions.type, 'expense'),
    gte(transactions.date, start),
    lt(transactions.date, end),
  );

  const [totalRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(monthExpenseCondition);

  const categoryRows = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(monthExpenseCondition)
    .groupBy(transactions.categoryId);

  const byCategoryId = new Map<number, number>();
  for (const row of categoryRows) {
    if (row.categoryId !== null) {
      byCategoryId.set(row.categoryId, row.total);
    }
  }

  return { totalCents: totalRow?.total ?? 0, byCategoryId };
}
