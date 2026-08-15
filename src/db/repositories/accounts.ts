import { eq, sql } from 'drizzle-orm';

import type { AppDatabase } from '@/db/types';
import { useDataStore } from '@/store/dataStore';

import { accounts, type AccountType, transactions } from '../schema';

export type NewAccountInput = {
  name: string;
  type: AccountType;
  initialBalanceCents: number;
  color: string;
  icon: string;
};

export async function createAccount(db: AppDatabase, input: NewAccountInput) {
  const [row] = await db.insert(accounts).values(input).returning();
  useDataStore.getState().bump('accounts');
  return row;
}

export async function updateAccount(
  db: AppDatabase,
  id: number,
  input: Partial<NewAccountInput> & { archived?: boolean },
) {
  const [row] = await db.update(accounts).set(input).where(eq(accounts.id, id)).returning();
  useDataStore.getState().bump('accounts');
  return row;
}

export async function deleteAccount(db: AppDatabase, id: number) {
  await db.delete(accounts).where(eq(accounts.id, id));
  useDataStore.getState().bump('accounts');
}

export async function listAccounts(db: AppDatabase, { includeArchived = false } = {}) {
  if (includeArchived) {
    return db.select().from(accounts).orderBy(accounts.name);
  }
  return db.select().from(accounts).where(eq(accounts.archived, false)).orderBy(accounts.name);
}

export async function getAccount(db: AppDatabase, id: number) {
  const [row] = await db.select().from(accounts).where(eq(accounts.id, id));
  return row;
}

/**
 * Balance = initial balance + income - expense, adjusted for transfers
 * (a transfer debits the source account and credits the destination account).
 */
export async function getAccountBalanceCents(db: AppDatabase, accountId: number): Promise<number> {
  const account = await getAccount(db, accountId);
  if (!account) {
    return 0;
  }

  const [movement] = await db
    .select({
      total: sql<number>`coalesce(sum(case
        when ${transactions.accountId} = ${accountId} and ${transactions.type} = 'income' then ${transactions.amountCents}
        when ${transactions.accountId} = ${accountId} and ${transactions.type} = 'expense' then -${transactions.amountCents}
        when ${transactions.accountId} = ${accountId} and ${transactions.type} = 'transfer' then -${transactions.amountCents}
        when ${transactions.transferAccountId} = ${accountId} and ${transactions.type} = 'transfer' then ${transactions.amountCents}
        else 0 end), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.accountId} = ${accountId} or (${transactions.transferAccountId} = ${accountId} and ${transactions.type} = 'transfer')`,
    );

  return account.initialBalanceCents + (movement?.total ?? 0);
}

/**
 * Balances for every account in two grouped queries total, instead of one
 * call to `getAccountBalanceCents` per account — avoids re-scanning
 * `transactions` once per account when the caller needs all balances at
 * once (dashboard total, account list).
 */
export async function getAllAccountBalancesCents(
  db: AppDatabase,
): Promise<Map<number, number>> {
  const accountsList = await listAccounts(db, { includeArchived: true });

  const ownMovementRows = await db
    .select({
      accountId: transactions.accountId,
      total: sql<number>`coalesce(sum(case
        when ${transactions.type} = 'income' then ${transactions.amountCents}
        when ${transactions.type} = 'expense' then -${transactions.amountCents}
        when ${transactions.type} = 'transfer' then -${transactions.amountCents}
        else 0 end), 0)`,
    })
    .from(transactions)
    .groupBy(transactions.accountId);

  const incomingTransferRows = await db
    .select({
      accountId: transactions.transferAccountId,
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.type, 'transfer'))
    .groupBy(transactions.transferAccountId);

  const movementByAccountId = new Map<number, number>();
  for (const row of ownMovementRows) {
    movementByAccountId.set(row.accountId, (movementByAccountId.get(row.accountId) ?? 0) + row.total);
  }
  for (const row of incomingTransferRows) {
    if (row.accountId === null) {
      continue;
    }
    movementByAccountId.set(row.accountId, (movementByAccountId.get(row.accountId) ?? 0) + row.total);
  }

  return new Map(
    accountsList.map((account) => [
      account.id,
      account.initialBalanceCents + (movementByAccountId.get(account.id) ?? 0),
    ]),
  );
}
