import { eq, sql } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { goalContributions, goals, type GoalStatus } from '../schema';

export type NewGoalInput = {
  name: string;
  targetCents: number;
  deadline?: string | null;
  color: string;
  icon: string;
  linkedAccountId?: number | null;
};

export async function createGoal(db: AppDatabase, input: NewGoalInput) {
  const [row] = await db.insert(goals).values(input).returning();
  useDataStore.getState().bump('goals');
  return row;
}

export async function updateGoal(
  db: AppDatabase,
  id: number,
  input: Partial<NewGoalInput> & { status?: GoalStatus },
) {
  const [row] = await db.update(goals).set(input).where(eq(goals.id, id)).returning();
  useDataStore.getState().bump('goals');
  return row;
}

export async function deleteGoal(db: AppDatabase, id: number) {
  await db.delete(goals).where(eq(goals.id, id));
  useDataStore.getState().bump('goals');
}

export async function listGoals(db: AppDatabase) {
  return db.select().from(goals).orderBy(goals.createdAt);
}

export async function getGoal(db: AppDatabase, id: number) {
  const [row] = await db.select().from(goals).where(eq(goals.id, id));
  return row;
}

export async function contributeToGoal(
  db: AppDatabase,
  goalId: number,
  amountCents: number,
  date: string,
) {
  const [updated] = db.transaction((tx) => {
    tx.insert(goalContributions).values({ goalId, amountCents, date }).run();

    const rows = tx
      .update(goals)
      .set({ currentCents: sql`${goals.currentCents} + ${amountCents}` })
      .where(eq(goals.id, goalId))
      .returning()
      .all();

    const [row] = rows;
    if (row && row.currentCents >= row.targetCents && row.status === 'active') {
      tx.update(goals).set({ status: 'completed' }).where(eq(goals.id, goalId)).run();
    }

    return rows;
  });

  useDataStore.getState().bump('goals');
  return updated;
}
