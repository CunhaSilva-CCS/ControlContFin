import { calculateGoalProgress } from '@/services/goalCalculations';

describe('calculateGoalProgress', () => {
  it('computes percent progress toward the target', () => {
    const progress = calculateGoalProgress(2500, 10000);
    expect(progress.percent).toBe(25);
    expect(progress.remainingCents).toBe(7500);
    expect(progress.isComplete).toBe(false);
  });

  it('caps percent at 100 and marks complete when target is reached or exceeded', () => {
    const progress = calculateGoalProgress(15000, 10000);
    expect(progress.percent).toBe(100);
    expect(progress.remainingCents).toBe(0);
    expect(progress.isComplete).toBe(true);
  });

  it('handles a zero target without dividing by zero', () => {
    const progress = calculateGoalProgress(500, 0);
    expect(progress.percent).toBe(0);
    expect(Number.isFinite(progress.percent)).toBe(true);
  });
});
