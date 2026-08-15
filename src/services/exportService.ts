import type { TransactionType } from '@/db/schema';
import { centsToBRL } from '@/utils/currency';

export type ExportableTransaction = {
  date: string;
  description: string | null;
  categoryName: string | null;
  accountName: string;
  type: TransactionType;
  amountCents: number;
};

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCSV(transactions: ExportableTransaction[]): string {
  const header = ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'];
  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.description ?? '',
      transaction.categoryName ?? '',
      transaction.accountName,
      TYPE_LABELS[transaction.type],
      centsToBRL(transaction.amountCents),
    ]
      .map(escapeCsvField)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function transactionsToJSON(transactions: ExportableTransaction[]): string {
  return JSON.stringify(transactions, null, 2);
}
