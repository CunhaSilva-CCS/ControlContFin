import { createHash } from 'crypto';

import { hashPin, verifyPin, type Sha256Fn } from '@/services/auth/pinCrypto';

const nodeSha256: Sha256Fn = async (input) => createHash('sha256').update(input).digest('hex');

describe('hashPin / verifyPin', () => {
  it('produces the same hash for the same PIN and salt', async () => {
    const hashA = await hashPin('308451', 'salt-1', nodeSha256);
    const hashB = await hashPin('308451', 'salt-1', nodeSha256);
    expect(hashA).toBe(hashB);
  });

  it('produces different hashes for different salts (same PIN)', async () => {
    const hashA = await hashPin('308451', 'salt-1', nodeSha256);
    const hashB = await hashPin('308451', 'salt-2', nodeSha256);
    expect(hashA).not.toBe(hashB);
  });

  it('produces different hashes for different PINs (same salt)', async () => {
    const hashA = await hashPin('308451', 'salt-1', nodeSha256);
    const hashB = await hashPin('308452', 'salt-1', nodeSha256);
    expect(hashA).not.toBe(hashB);
  });

  it('verifies a correct PIN and rejects an incorrect one', async () => {
    const hash = await hashPin('308451', 'salt-1', nodeSha256);
    await expect(verifyPin('308451', 'salt-1', hash, nodeSha256)).resolves.toBe(true);
    await expect(verifyPin('000000', 'salt-1', hash, nodeSha256)).resolves.toBe(false);
  });
});
