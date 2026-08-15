import { validateBackupPassword } from '@/services/backupPasswordPolicy';

describe('validateBackupPassword', () => {
  it('accepts a password with at least 8 characters', () => {
    expect(validateBackupPassword('correct horse')).toEqual({ valid: true });
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(validateBackupPassword('short')).toMatchObject({ valid: false });
  });

  it('accepts a password of exactly 8 characters', () => {
    expect(validateBackupPassword('12345678')).toEqual({ valid: true });
  });
});
