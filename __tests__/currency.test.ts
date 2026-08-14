import { brlToCents, centsToBRL } from '@/utils/currency';

describe('currency utils', () => {
  it('formats cents as BRL', () => {
    expect(centsToBRL(150000)).toBe('R$ 1.500,00');
  });

  it('formats zero and negative cents as BRL', () => {
    expect(centsToBRL(0)).toBe('R$ 0,00');
    expect(centsToBRL(-500)).toBe('-R$ 5,00');
  });

  it('parses a BRL string into cents', () => {
    expect(brlToCents('1.500,00')).toBe(150000);
    expect(brlToCents('5,00')).toBe(500);
  });

  it('returns 0 for an unparsable value', () => {
    expect(brlToCents('abc')).toBe(0);
  });
});
