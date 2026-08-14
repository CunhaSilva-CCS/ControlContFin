import { addPeriod, generateDueOccurrences, type RecurringRuleData } from '@/services/recurringEngine';

function makeRule(overrides: Partial<RecurringRuleData> = {}): RecurringRuleData {
  return {
    id: 1,
    accountId: 1,
    categoryId: null,
    type: 'expense',
    amountCents: 1000,
    description: 'Assinatura',
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: null,
    startDate: '2026-01-15',
    endDate: null,
    nextRunDate: '2026-01-15',
    active: true,
    ...overrides,
  };
}

describe('addPeriod', () => {
  it('advances daily and weekly frequencies', () => {
    expect(addPeriod('2026-08-10', 'daily', 1)).toBe('2026-08-11');
    expect(addPeriod('2026-08-10', 'weekly', 1)).toBe('2026-08-17');
    expect(addPeriod('2026-08-10', 'weekly', 2)).toBe('2026-08-24');
  });

  it('clamps day-of-month when the target month is shorter (31st -> Feb)', () => {
    expect(addPeriod('2026-01-31', 'monthly', 1)).toBe('2026-02-28');
    expect(addPeriod('2026-03-31', 'monthly', 1)).toBe('2026-04-30');
  });

  it('handles a leap-year Feb 29 anniversary on non-leap years', () => {
    expect(addPeriod('2024-02-29', 'yearly', 1)).toBe('2025-02-28');
    expect(addPeriod('2024-02-29', 'yearly', 4)).toBe('2028-02-29');
  });

  it('rolls over into the next year for monthly intervals crossing December', () => {
    expect(addPeriod('2026-11-15', 'monthly', 2)).toBe('2027-01-15');
  });

  it('respects a custom dayOfMonth override', () => {
    expect(addPeriod('2026-08-05', 'monthly', 1, 28)).toBe('2026-09-28');
  });
});

describe('generateDueOccurrences', () => {
  it('produces no occurrences when nextRunDate is in the future', () => {
    const rule = makeRule({ nextRunDate: '2026-09-01' });
    const result = generateDueOccurrences(rule, '2026-08-14');
    expect(result.occurrences).toHaveLength(0);
    expect(result.nextRunDate).toBe('2026-09-01');
  });

  it('produces a single occurrence when exactly due today', () => {
    const rule = makeRule({ nextRunDate: '2026-08-14' });
    const result = generateDueOccurrences(rule, '2026-08-14');
    expect(result.occurrences).toEqual([{ ruleId: 1, date: '2026-08-14' }]);
    expect(result.nextRunDate).toBe('2026-09-14');
    expect(result.lastGeneratedDate).toBe('2026-08-14');
  });

  it('catches up on multiple missed periods since the app was last opened', () => {
    const rule = makeRule({ nextRunDate: '2026-05-15', frequency: 'monthly', interval: 1 });
    const result = generateDueOccurrences(rule, '2026-08-14');
    expect(result.occurrences.map((o) => o.date)).toEqual([
      '2026-05-15',
      '2026-06-15',
      '2026-07-15',
    ]);
    expect(result.nextRunDate).toBe('2026-08-15');
  });

  it('stops generating once past the end date', () => {
    const rule = makeRule({
      nextRunDate: '2026-06-01',
      endDate: '2026-07-01',
      frequency: 'monthly',
    });
    const result = generateDueOccurrences(rule, '2026-12-31');
    expect(result.occurrences.map((o) => o.date)).toEqual(['2026-06-01', '2026-07-01']);
  });

  it('generates nothing for an inactive rule', () => {
    const rule = makeRule({ nextRunDate: '2026-01-01', active: false });
    const result = generateDueOccurrences(rule, '2026-08-14');
    expect(result.occurrences).toHaveLength(0);
  });
});
