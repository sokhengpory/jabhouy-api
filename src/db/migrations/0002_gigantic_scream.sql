DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "customer_user_idx";--> statement-breakpoint
DROP INDEX "user_idx";--> statement-breakpoint
DROP INDEX "category_idx";--> statement-breakpoint
DROP INDEX "loan_user_idx";--> statement-breakpoint
ALTER TABLE `item` ALTER COLUMN "base_price" TO "base_price" real;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `customer_user_idx` ON `customer` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `item` (`user_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `item` (`category_id`);--> statement-breakpoint
CREATE INDEX `loan_user_idx` ON `loan` (`user_id`);--> statement-breakpoint
ALTER TABLE `item` ALTER COLUMN "customer_price" TO "customer_price" real NOT NULL;