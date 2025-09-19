CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`quoted_amount` integer NOT NULL,
	`deposit_percent` integer NOT NULL,
	`available_slots` text NOT NULL,
	`message` text NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE no action
);
