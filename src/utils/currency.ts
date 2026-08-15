export function centsToBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function brlToCents(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) {
    throw new Error(`Valor inválido: ${value}`);
  }
  return Math.round(amount * 100);
}
