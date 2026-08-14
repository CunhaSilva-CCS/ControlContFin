import { decryptPayload, encryptPayload } from '@/services/backupEncryption';

const FAKE_KEY = 'a'.repeat(64); // 32 bytes hex
let counter = 0;
const fakeRandomBytes = (byteCount: number): Uint8Array => {
  counter += 1;
  return new Uint8Array(byteCount).fill(counter);
};

describe('backup payload encryption', () => {
  it('round-trips a JSON payload through encrypt/decrypt', () => {
    const original = JSON.stringify({ hello: 'world', amountCents: 12345 });
    const encrypted = encryptPayload(original, FAKE_KEY, fakeRandomBytes);
    expect(encrypted).not.toContain('hello');
    expect(decryptPayload(encrypted, FAKE_KEY)).toBe(original);
  });

  it('produces a different ciphertext for a different IV, but decrypts correctly either way', () => {
    const original = JSON.stringify({ a: 1 });
    const first = encryptPayload(original, FAKE_KEY, fakeRandomBytes);
    const second = encryptPayload(original, FAKE_KEY, fakeRandomBytes);
    expect(first).not.toBe(second);
    expect(decryptPayload(first, FAKE_KEY)).toBe(original);
    expect(decryptPayload(second, FAKE_KEY)).toBe(original);
  });

  it('fails to decrypt correctly with the wrong key', () => {
    const original = JSON.stringify({ secret: 'value' });
    const encrypted = encryptPayload(original, FAKE_KEY, fakeRandomBytes);
    const wrongKey = 'b'.repeat(64);
    expect(decryptPayload(encrypted, wrongKey)).not.toBe(original);
  });
});
