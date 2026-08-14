import * as Crypto from 'expo-crypto';

import type { Sha256Fn } from './pinCrypto';

export const sha256: Sha256Fn = (input) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);

export function generateSalt(): string {
  return Crypto.randomUUID();
}
