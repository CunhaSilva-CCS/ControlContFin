import { computeLockoutMs, isLockedOut, lockoutRemainingMs } from '@/services/auth/lockoutPolicy';

describe('computeLockoutMs', () => {
  it('is zero below the first threshold', () => {
    expect(computeLockoutMs(0)).toBe(0);
    expect(computeLockoutMs(2)).toBe(0);
  });

  it('escalates at each threshold', () => {
    expect(computeLockoutMs(3)).toBe(30 * 1000);
    expect(computeLockoutMs(4)).toBe(30 * 1000);
    expect(computeLockoutMs(5)).toBe(5 * 60 * 1000);
    expect(computeLockoutMs(8)).toBe(30 * 60 * 1000);
    expect(computeLockoutMs(10)).toBe(24 * 60 * 60 * 1000);
    expect(computeLockoutMs(50)).toBe(24 * 60 * 60 * 1000);
  });
});

describe('isLockedOut / lockoutRemainingMs', () => {
  it('is not locked out below the first threshold regardless of elapsed time', () => {
    expect(isLockedOut(1, 0, 0)).toBe(false);
  });

  it('is locked out immediately after crossing a threshold', () => {
    const now = 1_000_000;
    expect(isLockedOut(3, now, now)).toBe(true);
    expect(lockoutRemainingMs(3, now, now)).toBe(30 * 1000);
  });

  it('counts down and unlocks once the lockout window passes', () => {
    const lastFailedAt = 1_000_000;
    const midway = lastFailedAt + 15 * 1000;
    const after = lastFailedAt + 30 * 1000;

    expect(isLockedOut(3, lastFailedAt, midway)).toBe(true);
    expect(lockoutRemainingMs(3, lastFailedAt, midway)).toBe(15 * 1000);
    expect(isLockedOut(3, lastFailedAt, after)).toBe(false);
    expect(lockoutRemainingMs(3, lastFailedAt, after)).toBe(0);
  });
});
