CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_type` text NOT NULL,
	`status` text DEFAULT 'pending',
	`input_image_url` text,
	`output_image_url` text,
	`parameters` text,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()),
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `tasks` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `tasks` (`created_at`);--> statement-breakpoint
CREATE TABLE `user_quotas` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quota_type` text NOT NULL,
	`total_quota` integer DEFAULT 0,
	`used_quota` integer DEFAULT 0,
	`reset_at` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_quota_idx` ON `user_quotas` (`user_id`,`quota_type`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`avatar_url` text,
	`oauth_provider` text DEFAULT 'manus',
	`oauth_id` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);