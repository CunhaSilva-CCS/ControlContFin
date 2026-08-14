import { transactionsToCSV, transactionsToJSON, type ExportableTransaction } from '@/services/exportService';

const sample: ExportableTransaction[] = [
  {
    date: '2026-08-10',
    description: 'Supermercado, compras',
    categoryName: 'Alimentação',
    accountName: 'Conta corrente',
    type: 'expense',
    amountCents: 15050,
  },
  {
    date: '2026-08-11',
    description: null,
    categoryName: null,
    accountName: 'Carteira',
    type: 'income',
    amountCents: 200000,
  },
];

describe('transactionsToCSV', () => {
  it('renders a header row and one row per transaction', () => {
    const csv = transactionsToCSV(sample);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Data,Descrição,Categoria,Conta,Tipo,Valor');
    expect(lines).toHaveLength(3);
  });

  it('quotes and escapes fields containing commas', () => {
    const csv = transactionsToCSV(sample);
    expect(csv).toContain('"Supermercado, compras"');
  });

  it('renders empty strings for missing description/category', () => {
    const csv = transactionsToCSV(sample);
    const secondRow = csv.split('\n')[2];
    expect(secondRow.startsWith('2026-08-11,,,Carteira,Receita,')).toBe(true);
  });
});

describe('transactionsToJSON', () => {
  it('round-trips the transaction list as JSON', () => {
    const json = transactionsToJSON(sample);
    expect(JSON.parse(json)).toEqual(sample);
  });
});
