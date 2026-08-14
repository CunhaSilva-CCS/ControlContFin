export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
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
  return new Date().toISOString().slice(0, 7);
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
