import { bytesToHex } from '@/db/encryptionKey';

describe('bytesToHex', () => {
  it('converts bytes to zero-padded lowercase hex', () => {
    expect(bytesToHex(new Uint8Array([0, 15, 16, 255]))).toBe('000f10ff');
  });

  it('returns an empty string for an empty array', () => {
    expect(bytesToHex(new Uint8Array([]))).toBe('');
  });

  it('produces a 64-character hex string for a 32-byte key', () => {
    const bytes = new Uint8Array(32).fill(1);
    expect(bytesToHex(bytes)).toHaveLength(64);
  });
});
