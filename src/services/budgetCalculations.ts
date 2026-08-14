export type BudgetProgress = {
  spentCents: number;
  limitCents: number;
  percent: number;
  remainingCents: number;
  isOverBudget: boolean;
};

export function calculateBudgetProgress(spentCents: number, limitCents: number): BudgetProgress {
  const percent = limitCents > 0 ? Math.min((spentCents / limitCents) * 100, 999) : 0;
  return {
    spentCents,
    limitCents,
    percent,
    remainingCents: limitCents - spentCents,
    isOverBudget: spentCents > limitCents,
  };
}
