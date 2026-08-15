export const MIN_BACKUP_PASSWORD_LENGTH = 8;

export type PasswordValidationResult = { valid: true } | { valid: false; reason: string };

export function validateBackupPassword(password: string): PasswordValidationResult {
  if (password.length < MIN_BACKUP_PASSWORD_LENGTH) {
    return {
      valid: false,
      reason: `A senha deve ter pelo menos ${MIN_BACKUP_PASSWORD_LENGTH} caracteres.`,
    };
  }
  return { valid: true };
}
