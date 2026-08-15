import { db } from '@/db/client';
import { listRecurringRules, updateRecurringRule } from '@/db/repositories/recurringRules';
import { createTransaction } from '@/db/repositories/transactions';
import type { recurringRules } from '@/db/schema';

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

    for (const occurrence of result.occurrences) {
      await createTransaction(db, {
        accountId: row.accountId,
        categoryId: row.categoryId,
        type: row.type,
        amountCents: row.amountCents,
        date: occurrence.date,
        description: row.description,
        recurringRuleId: row.id,
        isRecurringGenerated: true,
      });
      generatedCount += 1;
    }

    await cancelRecurringReminder(row.notificationId);
    const newNotificationId = await scheduleRecurringReminder({
      title: 'Lançamento recorrente',
      body: row.description ?? 'Você tem uma transação recorrente programada.',
      nextRunDate: result.nextRunDate,
      notifyBeforeDays: row.notifyBeforeDays,
    });

    await updateRecurringRule(db, row.id, {
      nextRunDate: result.nextRunDate,
      lastGeneratedDate: result.lastGeneratedDate,
      notificationId: newNotificationId,
    });
  }

  return generatedCount;
}
