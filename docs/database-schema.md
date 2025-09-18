```
import { pgTable, uuid, text, varchar, timestamp, boolean, decimal, pgEnum, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['customer', 'tattooist', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'paid', 'refunded']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

export const tattooists = pgTable('tattooists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  bio: text('bio'),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('tattooists_user_id_idx').on(table.userId),
  approvedIdx: index('tattooists_approved_idx').on(table.approved),
}));

export const portfolios = pgTable('portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  tattooistId: uuid('tattooist_id').references(() => tattooists.id).notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  styleTags: text('style_tags').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tattooistIdIdx: index('portfolios_tattooist_id_idx').on(table.tattooistId),
}));

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  tattooistId: uuid('tattooist_id').references(() => tattooists.id).notNull(),
  day: integer('day').notNull(), // 0-6 for Sunday-Saturday
  startTime: varchar('start_time', { length: 8 }).notNull(), // TIME format HH:MM:SS
  endTime: varchar('end_time', { length: 8 }).notNull(), // TIME format HH:MM:SS
}, (table) => ({
  tattooistIdIdx: index('availability_tattooist_id_idx').on(table.tattooistId),
  dayIdx: index('availability_day_idx').on(table.day),
}));

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  tattooistId: uuid('tattooist_id').references(() => tattooists.id).notNull(),
  slot: timestamp('slot', { withTimezone: true }).notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  depositAmount: integer('deposit_amount'), // amount in cents
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  customerIdIdx: index('bookings_customer_id_idx').on(table.customerId),
  tattooistIdIdx: index('bookings_tattooist_id_idx').on(table.tattooistId),
  slotIdx: index('bookings_slot_idx').on(table.slot),
  statusIdx: index('bookings_status_idx').on(table.status),
}));

export const tattooIdeas = pgTable('tattoo_ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  bookingIdIdx: index('tattoo_ideas_booking_id_idx').on(table.bookingId),
}));

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  amount: integer('amount').notNull(), // amount in cents
  status: transactionStatusEnum('status').notNull().default('pending'),
  qpayInvoiceId: text('qpay_invoice_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  bookingIdIdx: index('transactions_booking_id_idx').on(table.bookingId),
  statusIdx: index('transactions_status_idx').on(table.status),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tattooist: one(tattooists, {
    fields: [users.id],
    references: [tattooists.userId],
  }),
  customerBookings: many(bookings, { relationName: 'customerBookings' }),
}));

export const tattooistRelations = relations(tattooists, ({ one, many }) => ({
  user: one(users, {
    fields: [tattooists.userId],
    references: [users.id],
  }),
  portfolios: many(portfolios),
  availability: many(availability),
  tattooistBookings: many(bookings, { relationName: 'tattooistBookings' }),
}));

export const portfolioRelations = relations(portfolios, ({ one }) => ({
  tattooist: one(tattooists, {
    fields: [portfolios.tattooistId],
    references: [tattooists.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  tattooist: one(tattooists, {
    fields: [availability.tattooistId],
    references: [tattooists.id],
  }),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: 'customerBookings'
  }),
  tattooist: one(tattooists, {
    fields: [bookings.tattooistId],
    references: [tattooists.id],
    relationName: 'tattooistBookings'
  }),
  tattooIdeas: many(tattooIdeas),
  transactions: many(transactions),
}));

export const tattooIdeaRelations = relations(tattooIdeas, ({ one }) => ({
  booking: one(bookings, {
    fields: [tattooIdeas.bookingId],
    references: [bookings.id],
  }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  booking: one(bookings, {
    fields: [transactions.bookingId],
    references: [bookings.id],
  }),
}));
```