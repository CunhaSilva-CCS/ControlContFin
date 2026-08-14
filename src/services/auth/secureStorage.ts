import * as SecureStore from 'expo-secure-store';

const AUTH_CONFIG_KEY = 'controlcontfin_auth_config';

/**
 * A single secure-store entry holding both the PIN credential and the
 * lockout counters. Keeping them together (rather than two independent
 * entries) means there's no way to selectively wipe just the failed-attempt
 * counter while leaving the hash in place — tampering with one means
 * tampering with the other, which the app already treats as "no PIN
 * configured" (forces a fresh setup) rather than a silent lockout reset.
 */
export type AuthConfig = {
  salt: string;
  hash: string;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  failedAttempts: number;
  lastFailedAtMs: number;
};

export async function getAuthConfig(): Promise<AuthConfig | null> {
  const raw = await SecureStore.getItemAsync(AUTH_CONFIG_KEY);
  return raw ? (JSON.parse(raw) as AuthConfig) : null;
}

export async function setAuthConfig(config: AuthConfig): Promise<void> {
  await SecureStore.setItemAsync(AUTH_CONFIG_KEY, JSON.stringify(config));
}

export async function clearAuthConfig(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_CONFIG_KEY);
}
