ALTER TABLE `recurring_rules` ADD `is_subscription` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `recurring_rules` ADD `provider` text;