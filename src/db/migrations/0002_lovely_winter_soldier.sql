PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer,
	`month` text NOT NULL,
	`limit_cents` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_budgets`("id", "category_id", "month", "limit_cents", "created_at") SELECT "id", "category_id", "month", "limit_cents", "created_at" FROM `budgets`;--> statement-breakpoint
DROP TABLE `budgets`;--> statement-breakpoint
ALTER TABLE `__new_budgets` RENAME TO `budgets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `budgets_category_month_idx` ON `budgets` (`category_id`,`month`);--> statement-breakpoint
CREATE TABLE `__new_goal_contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goal_id` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`date` text NOT NULL,
	`linked_transaction_id` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linked_transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_goal_contributions`("id", "goal_id", "amount_cents", "date", "linked_transaction_id") SELECT "id", "goal_id", "amount_cents", "date", "linked_transaction_id" FROM `goal_contributions`;--> statement-breakpoint
DROP TABLE `goal_contributions`;--> statement-breakpoint
ALTER TABLE `__new_goal_contributions` RENAME TO `goal_contributions`;--> statement-breakpoint
CREATE TABLE `__new_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`target_cents` integer NOT NULL,
	`current_cents` integer DEFAULT 0 NOT NULL,
	`deadline` text,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`linked_account_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`linked_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_goals`("id", "name", "target_cents", "current_cents", "deadline", "color", "icon", "linked_account_id", "status", "created_at") SELECT "id", "name", "target_cents", "current_cents", "deadline", "color", "icon", "linked_account_id", "status", "created_at" FROM `goals`;--> statement-breakpoint
DROP TABLE `goals`;--> statement-breakpoint
ALTER TABLE `__new_goals` RENAME TO `goals`;--> statement-breakpoint
CREATE TABLE `__new_recurring_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`category_id` integer,
	`type` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`description` text,
	`frequency` text NOT NULL,
	`interval` integer DEFAULT 1 NOT NULL,
	`day_of_month` integer,
	`weekday` integer,
	`start_date` text NOT NULL,
	`end_date` text,
	`next_run_date` text NOT NULL,
	`last_generated_date` text,
	`notify_before_days` integer DEFAULT 0 NOT NULL,
	`notification_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_recurring_rules`("id", "account_id", "category_id", "type", "amount_cents", "description", "frequency", "interval", "day_of_month", "weekday", "start_date", "end_date", "next_run_date", "last_generated_date", "notify_before_days", "notification_id", "active", "created_at") SELECT "id", "account_id", "category_id", "type", "amount_cents", "description", "frequency", "interval", "day_of_month", "weekday", "start_date", "end_date", "next_run_date", "last_generated_date", "notify_before_days", "notification_id", "active", "created_at" FROM `recurring_rules`;--> statement-breakpoint
DROP TABLE `recurring_rules`;--> statement-breakpoint
ALTER TABLE `__new_recurring_rules` RENAME TO `recurring_rules`;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`category_id` integer,
	`type` text NOT NULL,
	`transfer_account_id` integer,
	`amount_cents` integer NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`recurring_rule_id` integer,
	`is_recurring_generated` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`transfer_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`recurring_rule_id`) REFERENCES `recurring_rules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "account_id", "category_id", "type", "transfer_account_id", "amount_cents", "date", "description", "recurring_rule_id", "is_recurring_generated", "created_at", "updated_at") SELECT "id", "account_id", "category_id", "type", "transfer_account_id", "amount_cents", "date", "description", "recurring_rule_id", "is_recurring_generated", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
CREATE INDEX `transactions_account_date_idx` ON `transactions` (`account_id`,`date`);--> statement-breakpoint
CREATE INDEX `transactions_category_date_idx` ON `transactions` (`category_id`,`date`);--> statement-breakpoint
CREATE INDEX `transactions_transfer_account_idx` ON `transactions` (`transfer_account_id`,`type`);