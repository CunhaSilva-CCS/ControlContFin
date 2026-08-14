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
