import { currentMonth, formatDatePtBR, formatMonthLabelPtBR, lastNMonths, todayISODate } from '@/utils/date';

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

  describe('todayISODate / currentMonth use the local calendar date, not UTC', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not roll over to the next day while it is still evening in BRT (UTC-3)', () => {
      // 2026-08-15T01:30:00Z is 2026-08-14 22:30 in BRT (jest.config.js sets
      // TZ=America/Sao_Paulo) — still the 14th locally, but a UTC-based
      // implementation (toISOString().slice(0, 10)) would already report the 15th.
      jest.useFakeTimers().setSystemTime(new Date('2026-08-15T01:30:00Z'));
      expect(todayISODate()).toBe('2026-08-14');
      expect(currentMonth()).toBe('2026-08');
    });

    it('matches the UTC date once local time has actually crossed midnight', () => {
      // 2026-08-15T04:00:00Z is 2026-08-15 01:00 BRT — genuinely the 15th.
      jest.useFakeTimers().setSystemTime(new Date('2026-08-15T04:00:00Z'));
      expect(todayISODate()).toBe('2026-08-15');
    });
  });
});
