import { calculateBudgetProgress } from '@/services/budgetCalculations';

describe('calculateBudgetProgress', () => {
  it('computes percent spent and remaining under budget', () => {
    const progress = calculateBudgetProgress(6000, 10000);
    expect(progress.percent).toBe(60);
    expect(progress.remainingCents).toBe(4000);
    expect(progress.isOverBudget).toBe(false);
  });

  it('flags over-budget when spent exceeds the limit', () => {
    const progress = calculateBudgetProgress(12000, 10000);
    expect(progress.isOverBudget).toBe(true);
    expect(progress.remainingCents).toBe(-2000);
    expect(progress.percent).toBe(120);
  });

  it('handles a zero limit without dividing by zero', () => {
    const progress = calculateBudgetProgress(500, 0);
    expect(progress.percent).toBe(0);
    expect(Number.isFinite(progress.percent)).toBe(true);
  });

  it('caps percent at 999 for extreme overspend', () => {
    const progress = calculateBudgetProgress(1_000_000, 100);
    expect(progress.percent).toBe(999);
  });
});
