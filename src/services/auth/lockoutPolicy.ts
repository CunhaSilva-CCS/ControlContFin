/**
 * Escalating lockout after repeated failed PIN attempts — the main defense
 * against brute-forcing a short local PIN. Thresholds must be ascending.
 */
const LOCKOUT_THRESHOLDS: { attempts: number; lockoutMs: number }[] = [
  { attempts: 3, lockoutMs: 30 * 1000 },
  { attempts: 5, lockoutMs: 5 * 60 * 1000 },
  { attempts: 8, lockoutMs: 30 * 60 * 1000 },
  { attempts: 10, lockoutMs: 24 * 60 * 60 * 1000 },
];

export function computeLockoutMs(failedAttempts: number): number {
  let lockoutMs = 0;
  for (const threshold of LOCKOUT_THRESHOLDS) {
    if (failedAttempts >= threshold.attempts) {
      lockoutMs = threshold.lockoutMs;
    }
  }
  return lockoutMs;
}

export function lockoutRemainingMs(
  failedAttempts: number,
  lastFailedAtMs: number,
  nowMs: number,
): number {
  const lockoutMs = computeLockoutMs(failedAttempts);
  if (lockoutMs === 0) {
    return 0;
  }
  return Math.max(0, lockoutMs - (nowMs - lastFailedAtMs));
}

export function isLockedOut(failedAttempts: number, lastFailedAtMs: number, nowMs: number): boolean {
  return lockoutRemainingMs(failedAttempts, lastFailedAtMs, nowMs) > 0;
}
