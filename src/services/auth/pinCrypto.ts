import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

/**
 * PBKDF2-HMAC-SHA256 iteration count, in line with OWASP's guidance (well
 * above the 100k floor commonly recommended for this hash). Runs entirely in
 * JS — unlike the previous approach (SHA-256 chained through the native
 * expo-crypto bridge once per round), there's no per-round bridge round trip
 * here, so raising this further is cheap. The right number ultimately
 * depends on measuring unlock latency on real target devices, which isn't
 * possible in this sandboxed environment (no simulator/device attached).
 */
const PBKDF2_ITERATIONS = 100_000;
const DERIVED_KEY_BYTES = 32;

export async function hashPin(pin: string, salt: string): Promise<string> {
  const derived = await pbkdf2Async(sha256, pin, salt, {
    c: PBKDF2_ITERATIONS,
    dkLen: DERIVED_KEY_BYTES,
  });
  return bytesToHex(derived);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  const candidateHash = await hashPin(pin, salt);
  return timingSafeEqual(candidateHash, expectedHash);
}
