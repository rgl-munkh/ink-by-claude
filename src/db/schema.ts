import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['customer', 'tattooist', 'admin'] }).notNull().default('customer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tattooists = sqliteTable('tattooists', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  bio: text('bio'),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const portfolios = sqliteTable('portfolios', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tattooistId: text('tattooist_id').references(() => tattooists.id).notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  styleTags: text('style_tags'), // JSON string array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const availability = sqliteTable('availability', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tattooistId: text('tattooist_id').references(() => tattooists.id).notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  isBooked: integer('is_booked', { mode: 'boolean' }).notNull().default(false),
  note: text('note'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  customerId: text('customer_id').references(() => users.id).notNull(),
  tattooistId: text('tattooist_id').references(() => tattooists.id).notNull(),
  slot: integer('slot', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled'] }).notNull().default('pending'),
  depositAmount: integer('deposit_amount'), // amount in cents
  paymentStatus: text('payment_status', { enum: ['unpaid', 'paid', 'refunded'] }).notNull().default('unpaid'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tattooIdeas = sqliteTable('tattoo_ideas', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  amount: integer('amount').notNull(), // amount in cents
  status: text('status', { enum: ['pending', 'paid', 'refunded'] }).notNull().default('pending'),
  qpayInvoiceId: text('qpay_invoice_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const requests = sqliteTable('requests', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tattooistId: text('tattooist_id').references(() => tattooists.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  description: text('description').notNull(),
  size: text('size').notNull(),
  placement: text('placement').notNull(),
  images: text('images', { mode: 'json' }).notNull().$type<string[]>(),
  preferredDates: text('preferred_dates', { mode: 'json' }).$type<string[]>(),
  status: text('status', { enum: ['new', 'reviewed', 'accepted', 'rejected'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

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
  requests: many(requests),
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

export const requestRelations = relations(requests, ({ one }) => ({
  tattooist: one(tattooists, {
    fields: [requests.tattooistId],
    references: [tattooists.id],
  }),
}));