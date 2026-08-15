import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { listRecurringRules } from '@/db/repositories/recurringRules';
import { recurringRules, transactions } from '@/db/schema';
import { useDataStore } from '@/store/dataStore';

import { generateDueOccurrences, type RecurringRuleData } from './recurringEngine';
import { cancelRecurringReminder, scheduleRecurringReminder } from './notifications';

type RecurringRuleRow = typeof recurringRules.$inferSelect;

function toRuleData(row: RecurringRuleRow): RecurringRuleData {
  return {
    id: row.id,
    accountId: row.accountId,
    categoryId: row.categoryId,
    type: row.type,
    amountCents: row.amountCents,
    description: row.description,
    frequency: row.frequency,
    interval: row.interval,
    dayOfMonth: row.dayOfMonth,
    startDate: row.startDate,
    endDate: row.endDate,
    nextRunDate: row.nextRunDate,
    active: row.active,
  };
}

/**
 * Generates every transaction due for active recurring rules (catching up on
 * missed periods), then reschedules each rule's reminder notification.
 * Meant to run on app foreground/launch; safe to call repeatedly.
 */
export async function runRecurringGeneration(today: string): Promise<number> {
  const rules = await listRecurringRules(db);
  let generatedCount = 0;

  for (const row of rules) {
    const result = generateDueOccurrences(toRuleData(row), today);
    if (result.occurrences.length === 0) {
      continue;
    }

    await cancelRecurringReminder(row.notificationId);
    const newNotificationId = await scheduleRecurringReminder({
      title: 'Lançamento recorrente',
      body: row.description ?? 'Você tem uma transação recorrente programada.',
      nextRunDate: result.nextRunDate,
      notifyBeforeDays: row.notifyBeforeDays,
    });

    db.transaction((tx) => {
      for (const occurrence of result.occurrences) {
        tx.insert(transactions)
          .values({
            accountId: row.accountId,
            categoryId: row.categoryId,
            type: row.type,
            amountCents: row.amountCents,
            date: occurrence.date,
            description: row.description,
            recurringRuleId: row.id,
            isRecurringGenerated: true,
          })
          .run();
      }

      tx.update(recurringRules)
        .set({
          nextRunDate: result.nextRunDate,
          lastGeneratedDate: result.lastGeneratedDate,
          notificationId: newNotificationId,
        })
        .where(eq(recurringRules.id, row.id))
        .run();
    });

    generatedCount += result.occurrences.length;
  }

  if (generatedCount > 0) {
    const { bump } = useDataStore.getState();
    bump('transactions');
    bump('accounts');
    bump('recurringRules');
  }

  return generatedCount;
}
