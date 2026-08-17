import { and, eq } from 'drizzle-orm';

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
  isSubscription?: boolean;
  provider?: string | null;
};

export async function createRecurringRule(db: AppDatabase, input: NewRecurringRuleInput) {
  const [row] = await db.insert(recurringRules).values(input).returning();
  useDataStore.getState().bump('recurringRules');
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
  useDataStore.getState().bump('recurringRules');
  return row;
}

export async function deleteRecurringRule(db: AppDatabase, id: number) {
  await db.delete(recurringRules).where(eq(recurringRules.id, id));
  useDataStore.getState().bump('recurringRules');
}

export async function listRecurringRules(
  db: AppDatabase,
  { includeInactive = false, onlySubscriptions = false } = {},
) {
  const conditions = [];
  if (!includeInactive) {
    conditions.push(eq(recurringRules.active, true));
  }
  if (onlySubscriptions) {
    conditions.push(eq(recurringRules.isSubscription, true));
  }

  const query = db.select().from(recurringRules).orderBy(recurringRules.nextRunDate);

  if (conditions.length === 0) {
    return query;
  }
  return query.where(and(...conditions));
}

export async function getRecurringRule(db: AppDatabase, id: number) {
  const [row] = await db.select().from(recurringRules).where(eq(recurringRules.id, id));
  return row;
}
