import {
  decryptBackupWithPassword,
  decryptPayload,
  encryptBackupWithPassword,
  encryptPayload,
  type EncryptedBackupEnvelope,
} from '@/services/backupEncryption';

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

describe('password-protected backup envelope', () => {
  it('round-trips a JSON payload with the correct password', async () => {
    const original = JSON.stringify({ hello: 'world', amountCents: 12345 });
    const envelopeJson = await encryptBackupWithPassword(original, 'correct horse battery', 'fixed-salt', fakeRandomBytes);
    const envelope: EncryptedBackupEnvelope = JSON.parse(envelopeJson);

    expect(envelopeJson).not.toContain('hello');
    await expect(decryptBackupWithPassword(envelope, 'correct horse battery')).resolves.toBe(original);
  });

  it('throws a clear error for the wrong password instead of returning garbage', async () => {
    const original = JSON.stringify({ secret: 'value' });
    const envelopeJson = await encryptBackupWithPassword(original, 'right-password', 'fixed-salt', fakeRandomBytes);
    const envelope: EncryptedBackupEnvelope = JSON.parse(envelopeJson);

    await expect(decryptBackupWithPassword(envelope, 'wrong-password')).rejects.toThrow('Senha incorreta');
  });

  it('throws when the payload has been tampered with, even with the correct password', async () => {
    const original = JSON.stringify({ secret: 'value' });
    const envelopeJson = await encryptBackupWithPassword(original, 'right-password', 'fixed-salt', fakeRandomBytes);
    const envelope: EncryptedBackupEnvelope = JSON.parse(envelopeJson);
    const tampered: EncryptedBackupEnvelope = { ...envelope, payload: `${envelope.payload}00` };

    await expect(decryptBackupWithPassword(tampered, 'right-password')).rejects.toThrow('Senha incorreta');
  });

  it('uses a different salt for each export, producing different envelopes for the same password', async () => {
    const original = JSON.stringify({ a: 1 });
    const first = await encryptBackupWithPassword(original, 'same-password', 'salt-one', fakeRandomBytes);
    const second = await encryptBackupWithPassword(original, 'same-password', 'salt-two', fakeRandomBytes);

    expect(first).not.toBe(second);
    const firstEnvelope: EncryptedBackupEnvelope = JSON.parse(first);
    const secondEnvelope: EncryptedBackupEnvelope = JSON.parse(second);
    await expect(decryptBackupWithPassword(firstEnvelope, 'same-password')).resolves.toBe(original);
    await expect(decryptBackupWithPassword(secondEnvelope, 'same-password')).resolves.toBe(original);
  });
});
