import * as SecureStore from 'expo-secure-store';

const AUTH_CONFIG_KEY = 'controlcontfin_auth_config';
const LOCKOUT_STATE_KEY = 'controlcontfin_auth_lockout';

export type AuthConfig = {
  salt: string;
  hash: string;
  biometricEnabled: boolean;
  autoLockMinutes: number;
};

export type LockoutState = {
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
  await SecureStore.deleteItemAsync(LOCKOUT_STATE_KEY);
}

export async function getLockoutState(): Promise<LockoutState> {
  const raw = await SecureStore.getItemAsync(LOCKOUT_STATE_KEY);
  return raw ? (JSON.parse(raw) as LockoutState) : { failedAttempts: 0, lastFailedAtMs: 0 };
}

export async function setLockoutState(state: LockoutState): Promise<void> {
  await SecureStore.setItemAsync(LOCKOUT_STATE_KEY, JSON.stringify(state));
}

export async function resetLockoutState(): Promise<void> {
  await setLockoutState({ failedAttempts: 0, lastFailedAtMs: 0 });
}
