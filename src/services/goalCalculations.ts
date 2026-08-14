export type GoalProgress = {
  currentCents: number;
  targetCents: number;
  percent: number;
  remainingCents: number;
  isComplete: boolean;
};

export function calculateGoalProgress(currentCents: number, targetCents: number): GoalProgress {
  const percent = targetCents > 0 ? Math.min((currentCents / targetCents) * 100, 100) : 0;
  return {
    currentCents,
    targetCents,
    percent,
    remainingCents: Math.max(targetCents - currentCents, 0),
    isComplete: currentCents >= targetCents,
  };
}
