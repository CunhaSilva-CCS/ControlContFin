import { Counter, ModeOfOperation, utils } from 'aes-js';
import * as Crypto from 'expo-crypto';
import { hmac } from '@noble/hashes/hmac.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

import { getOrCreateDatabaseKey } from '@/db/encryptionKey';
import { generateSalt } from '@/services/auth/cryptoProvider';
import { timingSafeEqual } from '@/services/auth/pinCrypto';

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

const PBKDF2_ITERATIONS = 100_000;
const DERIVED_KEY_BYTES = 32;

export const BACKUP_ENVELOPE_FORMAT = 'controlcontfin-encrypted-backup';

/**
 * The file format for a password-protected manual backup export. Unlike
 * `encryptBackupPayload` (device-bound key, CTR-only — fine for a file that
 * never leaves the device), this envelope carries everything needed to
 * re-derive the key from a user-supplied password, plus an HMAC so a wrong
 * password produces a clear "senha incorreta" error instead of silently
 * decrypting to garbage bytes.
 */
export type EncryptedBackupEnvelope = {
  format: typeof BACKUP_ENVELOPE_FORMAT;
  version: 1;
  salt: string;
  iterations: number;
  payload: string;
  mac: string;
};

export function isEncryptedBackupEnvelope(value: unknown): value is EncryptedBackupEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.format === BACKUP_ENVELOPE_FORMAT &&
    typeof candidate.salt === 'string' &&
    typeof candidate.iterations === 'number' &&
    typeof candidate.payload === 'string' &&
    typeof candidate.mac === 'string'
  );
}

/**
 * Derives two independent 32-byte keys (encryption, MAC) from one PBKDF2
 * call by splitting a double-length output, rather than reusing one key for
 * both purposes.
 */
async function deriveBackupKeys(
  password: string,
  salt: string,
  iterations: number,
): Promise<{ encKeyHex: string; macKeyHex: string }> {
  const derived = await pbkdf2Async(sha256, password, salt, {
    c: iterations,
    dkLen: DERIVED_KEY_BYTES * 2,
  });
  return {
    encKeyHex: bytesToHex(derived.slice(0, DERIVED_KEY_BYTES)),
    macKeyHex: bytesToHex(derived.slice(DERIVED_KEY_BYTES)),
  };
}

function computeMac(payload: string, macKeyHex: string): string {
  // aes-js's hex/utf8 helpers return plain arrays, not Uint8Array — @noble/hashes'
  // hmac() requires actual Uint8Array instances, hence the explicit wrap.
  const keyBytes = new Uint8Array(utils.hex.toBytes(macKeyHex));
  const messageBytes = new Uint8Array(utils.utf8.toBytes(payload));
  return bytesToHex(hmac(sha256, keyBytes, messageBytes));
}

/**
 * `salt`/`randomBytes` default to real values, but can be overridden — same
 * reason `encryptPayload` takes an injected `randomBytes` — so this stays
 * testable without the native expo-crypto module.
 */
export async function encryptBackupWithPassword(
  plainText: string,
  password: string,
  salt: string = generateSalt(),
  randomBytes: RandomBytesFn = Crypto.getRandomBytes,
): Promise<string> {
  const iterations = PBKDF2_ITERATIONS;
  const { encKeyHex, macKeyHex } = await deriveBackupKeys(password, salt, iterations);
  const payload = encryptPayload(plainText, encKeyHex, randomBytes);
  const envelope: EncryptedBackupEnvelope = {
    format: BACKUP_ENVELOPE_FORMAT,
    version: 1,
    salt,
    iterations,
    payload,
    mac: computeMac(payload, macKeyHex),
  };
  return JSON.stringify(envelope);
}

export async function decryptBackupWithPassword(
  envelope: EncryptedBackupEnvelope,
  password: string,
): Promise<string> {
  const { encKeyHex, macKeyHex } = await deriveBackupKeys(password, envelope.salt, envelope.iterations);
  const expectedMac = computeMac(envelope.payload, macKeyHex);
  if (!timingSafeEqual(expectedMac, envelope.mac)) {
    throw new Error('Senha incorreta ou arquivo corrompido.');
  }
  return decryptPayload(envelope.payload, encKeyHex);
}
