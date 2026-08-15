/**
 * Local calendar date as YYYY-MM-DD. Deliberately NOT `new Date().toISOString()`
 * (that reads the UTC date) — for a UTC-3 timezone, that flips to tomorrow's
 * date starting at 21:00 local time, which would fire recurring transactions
 * and the "once per day" automatic backup a day early in the evening.
 */
export function todayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDatePtBR(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function currentMonth(): string {
  return todayISODate().slice(0, 7);
}

const MONTH_LABELS_PT_BR = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/**
 * Returns the last `count` months as YYYY-MM strings, oldest first,
 * ending with the current month.
 */
export function lastNMonths(count: number, referenceDate: Date = new Date()): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(
      Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - i, 1),
    );
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
}

export function formatMonthLabelPtBR(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) {
    return month;
  }
  const monthIndex = Number(match[2]) - 1;
  return MONTH_LABELS_PT_BR[monthIndex] ?? month;
}
