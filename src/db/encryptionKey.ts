import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DB_KEY_STORAGE_KEY = 'controlcontfin_db_encryption_key';
const KEY_BYTE_LENGTH = 32;

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns the SQLCipher key used to encrypt the local database, generating
 * and persisting a new random one on first launch. Stored device-bound
 * (excluded from encrypted backups/restores) in the OS keychain/keystore, so
 * the key never leaves this device and isn't recoverable from a leaked
 * database file alone.
 */
export function getOrCreateDatabaseKey(): string {
  const existing = SecureStore.getItem(DB_KEY_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const key = bytesToHex(Crypto.getRandomBytes(KEY_BYTE_LENGTH));
  SecureStore.setItem(DB_KEY_STORAGE_KEY, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

/**
 * Discards the current key so the next `getOrCreateDatabaseKey()` call
 * generates a fresh one. Used by the database-open-failure recovery flow —
 * only safe to call once the undecryptable `.db` file has also been deleted,
 * since the old key is what made that file readable in the first place.
 */
export async function clearDatabaseKey(): Promise<void> {
  await SecureStore.deleteItemAsync(DB_KEY_STORAGE_KEY);
}
