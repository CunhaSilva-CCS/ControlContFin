import { formatDatePtBR } from '@/utils/date';

describe('date utils', () => {
  it('formats an ISO date as dd/mm/yyyy', () => {
    expect(formatDatePtBR('2026-08-14')).toBe('14/08/2026');
  });

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatDatePtBR('not-a-date')).toBe('not-a-date');
  });
});
