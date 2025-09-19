PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`offer_id` text,
	`request_id` text,
	`customer_id` text,
	`tattooist_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`slot` integer NOT NULL,
	`duration_minutes` integer DEFAULT 120 NOT NULL,
	`quoted_amount` integer NOT NULL,
	`deposit_amount` integer NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`reservation_expires_at` integer,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`idempotency_key` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tattooist_id`) REFERENCES `tattooists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bookings`("id", "offer_id", "request_id", "customer_id", "tattooist_id", "customer_name", "customer_phone", "slot", "duration_minutes", "quoted_amount", "deposit_amount", "status", "reservation_expires_at", "payment_status", "idempotency_key", "created_at") SELECT "id", "offer_id", "request_id", "customer_id", "tattooist_id", "customer_name", "customer_phone", "slot", "duration_minutes", "quoted_amount", "deposit_amount", "status", "reservation_expires_at", "payment_status", "idempotency_key", "created_at" FROM `bookings`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
ALTER TABLE `__new_bookings` RENAME TO `bookings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_idempotency_key_unique` ON `bookings` (`idempotency_key`);