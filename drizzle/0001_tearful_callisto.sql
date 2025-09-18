CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`description` text NOT NULL,
	`size` text NOT NULL,
	`placement` text NOT NULL,
	`images` text NOT NULL,
	`preferred_dates` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
