import { eq } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { recurringRules, type RecurringFrequency, type TransactionType } from '../schema';

export type NewRecurringRuleInput = {
  accountId: number;
  categoryId?: number | null;
  type: TransactionType;
  amountCents: number;
  description?: string | null;
  frequency: RecurringFrequency;
  interval: number;
  dayOfMonth?: number | null;
  startDate: string;
  endDate?: string | null;
  nextRunDate: string;
  notifyBeforeDays?: number;
};

export async function createRecurringRule(db: AppDatabase, input: NewRecurringRuleInput) {
  const [row] = await db.insert(recurringRules).values(input).returning();
  useDataStore.getState().bump('transactions');
  return row;
}

export async function updateRecurringRule(
  db: AppDatabase,
  id: number,
  input: Partial<NewRecurringRuleInput> & {
    active?: boolean;
    lastGeneratedDate?: string | null;
    notificationId?: string | null;
  },
) {
  const [row] = await db
    .update(recurringRules)
    .set(input)
    .where(eq(recurringRules.id, id))
    .returning();
  useDataStore.getState().bump('transactions');
  return row;
}

export async function deleteRecurringRule(db: AppDatabase, id: number) {
  await db.delete(recurringRules).where(eq(recurringRules.id, id));
  useDataStore.getState().bump('transactions');
}

export async function listRecurringRules(db: AppDatabase, { includeInactive = false } = {}) {
  if (includeInactive) {
    return db.select().from(recurringRules).orderBy(recurringRules.nextRunDate);
  }
  return db
    .select()
    .from(recurringRules)
    .where(eq(recurringRules.active, true))
    .orderBy(recurringRules.nextRunDate);
}

export async function getRecurringRule(db: AppDatabase, id: number) {
  const [row] = await db.select().from(recurringRules).where(eq(recurringRules.id, id));
  return row;
}
