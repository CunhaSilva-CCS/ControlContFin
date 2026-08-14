import type { RecurringFrequency, TransactionType } from '@/db/schema';

export type RecurringRuleData = {
  id: number;
  accountId: number;
  categoryId: number | null;
  type: TransactionType;
  amountCents: number;
  description: string | null;
  frequency: RecurringFrequency;
  interval: number;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  active: boolean;
};

export type DueOccurrence = {
  ruleId: number;
  date: string;
};

export type GenerationResult = {
  occurrences: DueOccurrence[];
  nextRunDate: string;
  lastGeneratedDate: string | null;
};

function parseISODate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

function addMonthsClamped(
  year: number,
  monthIndex0: number,
  day: number,
  monthsToAdd: number,
  dayOverride?: number | null,
): string {
  const rolled = new Date(Date.UTC(year, monthIndex0 + monthsToAdd, 1));
  const targetYear = rolled.getUTCFullYear();
  const targetMonthIndex0 = rolled.getUTCMonth();
  const desiredDay = dayOverride ?? day;
  const clampedDay = Math.min(desiredDay, daysInMonth(targetYear, targetMonthIndex0));
  return toISODate(new Date(Date.UTC(targetYear, targetMonthIndex0, clampedDay)));
}

/**
 * Advances an ISO date by one period of the given frequency, clamping the day
 * of month when the target month is shorter (e.g. 31st -> Feb 28th/29th).
 */
export function addPeriod(
  dateISO: string,
  frequency: RecurringFrequency,
  interval: number,
  dayOfMonth?: number | null,
): string {
  const { year, month, day } = parseISODate(dateISO);
  const monthIndex0 = month - 1;

  switch (frequency) {
    case 'daily':
      return toISODate(new Date(Date.UTC(year, monthIndex0, day + interval)));
    case 'weekly':
      return toISODate(new Date(Date.UTC(year, monthIndex0, day + interval * 7)));
    case 'monthly':
      return addMonthsClamped(year, monthIndex0, day, interval, dayOfMonth);
    case 'yearly':
      return addMonthsClamped(year, monthIndex0, day, interval * 12, dayOfMonth);
    default:
      return dateISO;
  }
}

const MAX_CATCH_UP_OCCURRENCES = 1000;

/**
 * Given a recurring rule and today's date, returns every occurrence due
 * (nextRunDate <= today), catching up on multiple missed periods if the app
 * wasn't opened for a while, plus the rule's new nextRunDate/lastGeneratedDate.
 */
export function generateDueOccurrences(rule: RecurringRuleData, today: string): GenerationResult {
  const occurrences: DueOccurrence[] = [];
  let nextRunDate = rule.nextRunDate;
  let lastGeneratedDate: string | null = null;

  if (!rule.active) {
    return { occurrences, nextRunDate, lastGeneratedDate };
  }

  let iterations = 0;
  while (
    nextRunDate <= today &&
    (!rule.endDate || nextRunDate <= rule.endDate) &&
    iterations < MAX_CATCH_UP_OCCURRENCES
  ) {
    occurrences.push({ ruleId: rule.id, date: nextRunDate });
    lastGeneratedDate = nextRunDate;
    nextRunDate = addPeriod(nextRunDate, rule.frequency, rule.interval, rule.dayOfMonth);
    iterations += 1;
  }

  return { occurrences, nextRunDate, lastGeneratedDate };
}
