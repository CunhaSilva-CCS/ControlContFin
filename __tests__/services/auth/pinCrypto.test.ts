import { hashPin, verifyPin } from '@/services/auth/pinCrypto';

describe('hashPin / verifyPin', () => {
  it('produces the same hash for the same PIN and salt', async () => {
    const hashA = await hashPin('308451', 'salt-1');
    const hashB = await hashPin('308451', 'salt-1');
    expect(hashA).toBe(hashB);
  });

  it('produces different hashes for different salts (same PIN)', async () => {
    const hashA = await hashPin('308451', 'salt-1');
    const hashB = await hashPin('308451', 'salt-2');
    expect(hashA).not.toBe(hashB);
  });

  it('produces different hashes for different PINs (same salt)', async () => {
    const hashA = await hashPin('308451', 'salt-1');
    const hashB = await hashPin('308452', 'salt-1');
    expect(hashA).not.toBe(hashB);
  });

  it('verifies a correct PIN and rejects an incorrect one', async () => {
    const hash = await hashPin('308451', 'salt-1');
    await expect(verifyPin('308451', 'salt-1', hash)).resolves.toBe(true);
    await expect(verifyPin('000000', 'salt-1', hash)).resolves.toBe(false);
  });
});
