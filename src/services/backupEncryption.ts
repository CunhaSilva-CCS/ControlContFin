import { Counter, ModeOfOperation, utils } from 'aes-js';
import * as Crypto from 'expo-crypto';

import { getOrCreateDatabaseKey } from '@/db/encryptionKey';

const IV_BYTE_LENGTH = 16;

export type RandomBytesFn = (byteCount: number) => Uint8Array;

/**
 * Encrypts local automatic-backup files at rest (AES-256-CTR) using the same
 * device-bound key that protects the main database, so a leaked backup file
 * is as unreadable as the database itself. Confidentiality only — CTR has no
 * built-in tamper detection, which is an acceptable trade-off for a local,
 * non-networked file whose threat model is exposure, not manipulation.
 *
 * `hexKey` and `randomBytes` are injected so this stays testable without the
 * native expo-crypto/expo-secure-store modules.
 */
export function encryptPayload(plainText: string, hexKey: string, randomBytes: RandomBytesFn): string {
  const keyBytes = utils.hex.toBytes(hexKey);
  const ivBytes = randomBytes(IV_BYTE_LENGTH);
  const cipher = new ModeOfOperation.ctr(keyBytes, new Counter(ivBytes));
  const encryptedBytes = cipher.encrypt(utils.utf8.toBytes(plainText));
  return `${utils.hex.fromBytes(ivBytes)}:${utils.hex.fromBytes(encryptedBytes)}`;
}

export function decryptPayload(payload: string, hexKey: string): string {
  const [ivHex, cipherHex] = payload.split(':');
  const keyBytes = utils.hex.toBytes(hexKey);
  const cipher = new ModeOfOperation.ctr(keyBytes, new Counter(utils.hex.toBytes(ivHex)));
  const decryptedBytes = cipher.decrypt(utils.hex.toBytes(cipherHex));
  return utils.utf8.fromBytes(decryptedBytes);
}

export function encryptBackupPayload(plainText: string): string {
  return encryptPayload(plainText, getOrCreateDatabaseKey(), Crypto.getRandomBytes);
}

export function decryptBackupPayload(payload: string): string {
  return decryptPayload(payload, getOrCreateDatabaseKey());
}
