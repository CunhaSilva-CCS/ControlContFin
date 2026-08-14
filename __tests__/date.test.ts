import { formatDatePtBR, formatMonthLabelPtBR, lastNMonths } from '@/utils/date';

describe('date utils', () => {
  it('formats an ISO date as dd/mm/yyyy', () => {
    expect(formatDatePtBR('2026-08-14')).toBe('14/08/2026');
  });

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatDatePtBR('not-a-date')).toBe('not-a-date');
  });

  it('returns the last N months ending at the reference month, oldest first', () => {
    const reference = new Date(Date.UTC(2026, 7, 14)); // August 2026
    expect(lastNMonths(4, reference)).toEqual(['2026-05', '2026-06', '2026-07', '2026-08']);
  });

  it('rolls back across a year boundary', () => {
    const reference = new Date(Date.UTC(2026, 1, 1)); // February 2026
    expect(lastNMonths(3, reference)).toEqual(['2025-12', '2026-01', '2026-02']);
  });

  it('formats a YYYY-MM month as a 3-letter pt-BR label', () => {
    expect(formatMonthLabelPtBR('2026-08')).toBe('ago');
    expect(formatMonthLabelPtBR('2026-01')).toBe('jan');
  });
});
