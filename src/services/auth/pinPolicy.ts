export const PIN_LENGTH = 6;

export type PinValidationResult = { valid: true } | { valid: false; reason: string };

function isAllSameDigit(pin: string): boolean {
  return new Set(pin.split('')).size === 1;
}

function isSequential(pin: string): boolean {
  const digits = pin.split('').map(Number);
  const ascending = digits.every((digit, index) => index === 0 || digit === digits[index - 1] + 1);
  const descending = digits.every((digit, index) => index === 0 || digit === digits[index - 1] - 1);
  return ascending || descending;
}

/**
 * Rejects PINs that are trivially guessable (all same digit, ascending/descending
 * runs) in addition to enforcing a fixed length, since the PIN is the app's
 * primary defense against someone with physical access to the device.
 */
export function validatePinStrength(pin: string): PinValidationResult {
  if (!/^\d+$/.test(pin)) {
    return { valid: false, reason: 'O PIN deve conter apenas números.' };
  }
  if (pin.length !== PIN_LENGTH) {
    return { valid: false, reason: `O PIN deve ter ${PIN_LENGTH} dígitos.` };
  }
  if (isAllSameDigit(pin)) {
    return { valid: false, reason: 'Evite PINs com todos os dígitos iguais.' };
  }
  if (isSequential(pin)) {
    return { valid: false, reason: 'Evite sequências óbvias como 123456 ou 987654.' };
  }
  return { valid: true };
}
