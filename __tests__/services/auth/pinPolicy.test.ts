import { validatePinStrength } from '@/services/auth/pinPolicy';

describe('validatePinStrength', () => {
  it('accepts a reasonably strong 6-digit PIN', () => {
    expect(validatePinStrength('308451')).toEqual({ valid: true });
  });

  it('rejects non-numeric input', () => {
    expect(validatePinStrength('12345a')).toMatchObject({ valid: false });
  });

  it('rejects PINs that are not exactly 6 digits', () => {
    expect(validatePinStrength('1234')).toMatchObject({ valid: false });
    expect(validatePinStrength('12345678')).toMatchObject({ valid: false });
  });

  it('rejects all-same-digit PINs', () => {
    expect(validatePinStrength('000000')).toMatchObject({ valid: false });
    expect(validatePinStrength('999999')).toMatchObject({ valid: false });
  });

  it('rejects ascending and descending sequential PINs', () => {
    expect(validatePinStrength('123456')).toMatchObject({ valid: false });
    expect(validatePinStrength('987654')).toMatchObject({ valid: false });
  });

  it('accepts a different non-sequential 6-digit PIN', () => {
    expect(validatePinStrength('482915')).toEqual({ valid: true });
  });
});
