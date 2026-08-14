import * as Crypto from 'expo-crypto';

export function generateSalt(): string {
  return Crypto.randomUUID();
}
