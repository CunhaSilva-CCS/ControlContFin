import { generateSalt } from './cryptoProvider';
import { isLockedOut, lockoutRemainingMs } from './lockoutPolicy';
import { hashPin, verifyPin } from './pinCrypto';
import { validatePinStrength } from './pinPolicy';
import { clearAuthConfig, getAuthConfig, setAuthConfig, type AuthConfig } from './secureStorage';

export const DEFAULT_AUTO_LOCK_MINUTES = 1;

export async function isAppLockConfigured(): Promise<boolean> {
  const config = await getAuthConfig();
  return config !== null;
}

export async function getAuthSettings(): Promise<Pick<AuthConfig, 'biometricEnabled' | 'autoLockMinutes'> | null> {
  const config = await getAuthConfig();
  if (!config) {
    return null;
  }
  return { biometricEnabled: config.biometricEnabled, autoLockMinutes: config.autoLockMinutes };
}

export async function setupPin(pin: string): Promise<{ success: boolean; reason?: string }> {
  const validation = validatePinStrength(pin);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  const salt = generateSalt();
  const hash = await hashPin(pin, salt);
  await setAuthConfig({
    salt,
    hash,
    biometricEnabled: false,
    autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES,
    failedAttempts: 0,
    lastFailedAtMs: 0,
  });
  return { success: true };
}

export async function changePin(
  currentPin: string,
  newPin: string,
): Promise<{ success: boolean; reason?: string }> {
  const config = await getAuthConfig();
  if (!config) {
    return { success: false, reason: 'Nenhum PIN configurado.' };
  }
  const currentValid = await verifyPin(currentPin, config.salt, config.hash);
  if (!currentValid) {
    return { success: false, reason: 'PIN atual incorreto.' };
  }

  const validation = validatePinStrength(newPin);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  const salt = generateSalt();
  const hash = await hashPin(newPin, salt);
  await setAuthConfig({ ...config, salt, hash, failedAttempts: 0, lastFailedAtMs: 0 });
  return { success: true };
}

export type PinAttemptResult =
  | { outcome: 'success' }
  | { outcome: 'locked_out'; remainingMs: number }
  | { outcome: 'incorrect'; remainingMs: number };

/**
 * Verifies a PIN attempt against the escalating lockout policy, updating the
 * persisted attempt counter either way. `remainingMs` on an incorrect result
 * reflects the lockout that attempt just triggered, if any. The lockout
 * counters live in the same secure-store entry as the credential (see
 * secureStorage.ts), so they can't be reset independently of it.
 */
export async function verifyPinAttempt(pin: string): Promise<PinAttemptResult> {
  const config = await getAuthConfig();
  if (!config) {
    throw new Error('Nenhum PIN configurado.');
  }

  const now = Date.now();
  if (isLockedOut(config.failedAttempts, config.lastFailedAtMs, now)) {
    return {
      outcome: 'locked_out',
      remainingMs: lockoutRemainingMs(config.failedAttempts, config.lastFailedAtMs, now),
    };
  }

  const isValid = await verifyPin(pin, config.salt, config.hash);
  if (isValid) {
    await setAuthConfig({ ...config, failedAttempts: 0, lastFailedAtMs: 0 });
    return { outcome: 'success' };
  }

  const failedAttempts = config.failedAttempts + 1;
  await setAuthConfig({ ...config, failedAttempts, lastFailedAtMs: now });
  return { outcome: 'incorrect', remainingMs: lockoutRemainingMs(failedAttempts, now, now) };
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  const config = await getAuthConfig();
  if (!config) {
    return;
  }
  await setAuthConfig({ ...config, biometricEnabled: enabled });
}

export async function setAutoLockMinutes(minutes: number): Promise<void> {
  const config = await getAuthConfig();
  if (!config) {
    return;
  }
  await setAuthConfig({ ...config, autoLockMinutes: minutes });
}

/**
 * "Forgot PIN" recovery: clears the app-lock configuration without requiring
 * the current PIN (by definition, the user doesn't have it) so they can set
 * up a new one. This never touches financial data — it only resets the gate.
 */
export async function resetAppLock(): Promise<void> {
  await clearAuthConfig();
}
