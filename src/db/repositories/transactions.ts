import { and, desc, eq, gte, lte } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { transactions, type TransactionType } from '../schema';

function bumpTransactionRelatedData() {
  const { bump } = useDataStore.getState();
  bump('transactions');
  bump('accounts');
}

export type NewTransactionInput = {
  accountId: number;
  categoryId?: number | null;
  type: TransactionType;
  transferAccountId?: number | null;
  amountCents: number;
  date: string;
  description?: string | null;
};

export async function createTransaction(db: AppDatabase, input: NewTransactionInput) {
  const [row] = await db.insert(transactions).values(input).returning();
  bumpTransactionRelatedData();
  return row;
}

export async function updateTransaction(
  db: AppDatabase,
  id: number,
  input: Partial<NewTransactionInput>,
) {
  const [row] = await db
    .update(transactions)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(transactions.id, id))
    .returning();
  bumpTransactionRelatedData();
  return row;
}

export async function deleteTransaction(db: AppDatabase, id: number) {
  await db.delete(transactions).where(eq(transactions.id, id));
  bumpTransactionRelatedData();
}

export async function getTransaction(db: AppDatabase, id: number) {
  const [row] = await db.select().from(transactions).where(eq(transactions.id, id));
  return row;
}

export type TransactionFilters = {
  accountId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
};

export async function listTransactions(db: AppDatabase, filters: TransactionFilters = {}) {
  const conditions = [];
  if (filters.accountId !== undefined) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters.categoryId !== undefined) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }

  const query = db.select().from(transactions).orderBy(desc(transactions.date), desc(transactions.id));

  if (conditions.length === 0) {
    return query;
  }
  return query.where(and(...conditions));
}
