export type Sha256Fn = (input: string) => Promise<string>;

const HASH_ROUNDS = 50;

/**
 * Chains SHA-256 `HASH_ROUNDS` times over salt+pin as a lightweight stretch
 * against offline brute force. Each round crosses the native bridge, so the
 * count is kept modest to avoid slowing down every unlock; the real defenses
 * against a short local PIN are the escalating lockout and OS-encrypted
 * storage of the salt/hash, not the stretch factor itself.
 */
export async function hashPin(pin: string, salt: string, sha256: Sha256Fn): Promise<string> {
  let value = `${salt}:${pin}`;
  for (let round = 0; round < HASH_ROUNDS; round += 1) {
    value = await sha256(value);
  }
  return value;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPin(
  pin: string,
  salt: string,
  expectedHash: string,
  sha256: Sha256Fn,
): Promise<boolean> {
  const candidateHash = await hashPin(pin, salt, sha256);
  return timingSafeEqual(candidateHash, expectedHash);
}
