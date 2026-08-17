import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const accountTypeValues = ['checking', 'savings', 'cash', 'credit_card', 'investment'] as const;
export type AccountType = (typeof accountTypeValues)[number];

export const categoryTypeValues = ['income', 'expense'] as const;
export type CategoryType = (typeof categoryTypeValues)[number];

export const transactionTypeValues = ['income', 'expense', 'transfer'] as const;
export type TransactionType = (typeof transactionTypeValues)[number];

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: accountTypeValues }).notNull(),
  initialBalanceCents: integer('initial_balance_cents').notNull().default(0),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: categoryTypeValues }).notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const recurringFrequencyValues = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type RecurringFrequency = (typeof recurringFrequencyValues)[number];

export const recurringRules = sqliteTable('recurring_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'restrict' }),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: text('type', { enum: transactionTypeValues }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  description: text('description'),
  frequency: text('frequency', { enum: recurringFrequencyValues }).notNull(),
  interval: integer('interval').notNull().default(1),
  dayOfMonth: integer('day_of_month'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  nextRunDate: text('next_run_date').notNull(),
  lastGeneratedDate: text('last_generated_date'),
  notifyBeforeDays: integer('notify_before_days').notNull().default(0),
  notificationId: text('notification_id'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  isSubscription: integer('is_subscription', { mode: 'boolean' }).notNull().default(false),
  provider: text('provider'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'restrict' }),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
    type: text('type', { enum: transactionTypeValues }).notNull(),
    transferAccountId: integer('transfer_account_id').references(() => accounts.id, {
      onDelete: 'restrict',
    }),
    amountCents: integer('amount_cents').notNull(),
    date: text('date').notNull(),
    description: text('description'),
    recurringRuleId: integer('recurring_rule_id').references(() => recurringRules.id, {
      onDelete: 'set null',
    }),
    isRecurringGenerated: integer('is_recurring_generated', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index('transactions_account_date_idx').on(table.accountId, table.date),
    index('transactions_category_date_idx').on(table.categoryId, table.date),
    index('transactions_transfer_account_idx').on(table.transferAccountId, table.type),
  ],
);

export const budgets = sqliteTable(
  'budgets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
    month: text('month').notNull(),
    limitCents: integer('limit_cents').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex('budgets_category_month_idx').on(table.categoryId, table.month)],
);
