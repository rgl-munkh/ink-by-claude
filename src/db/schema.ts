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
  offerId: text('offer_id').references(() => offers.id),
  requestId: text('request_id').references(() => requests.id),
  customerId: text('customer_id').references(() => users.id), // nullable for anonymous bookings
  tattooistId: text('tattooist_id').references(() => tattooists.id).notNull(),
  customerName: text('customer_name').notNull(), // for anonymous clients
  customerPhone: text('customer_phone').notNull(), // for anonymous clients
  slot: integer('slot', { mode: 'timestamp' }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(120), // default 2 hours
  quotedAmount: integer('quoted_amount').notNull(), // amount in cents
  depositAmount: integer('deposit_amount').notNull(), // amount in cents
  status: text('status', { enum: ['reserved', 'confirmed', 'completed', 'cancelled'] }).notNull().default('reserved'),
  reservationExpiresAt: integer('reservation_expires_at', { mode: 'timestamp' }), // 15 min reservation
  paymentStatus: text('payment_status', { enum: ['unpaid', 'paid', 'refunded'] }).notNull().default('unpaid'),
  idempotencyKey: text('idempotency_key').unique(), // for idempotent booking creation
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
  status: text('status', { enum: ['new', 'reviewed', 'offered', 'accepted', 'rejected'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const offers = sqliteTable('offers', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  requestId: text('request_id').references(() => requests.id).notNull(),
  quotedAmount: integer('quoted_amount').notNull(), // amount in cents
  depositPercent: integer('deposit_percent').notNull(), // percentage (e.g., 25 for 25%)
  availableSlots: text('available_slots', { mode: 'json' }).notNull().$type<string[]>(), // array of datetime strings
  message: text('message').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
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
  offer: one(offers, {
    fields: [bookings.offerId],
    references: [offers.id],
  }),
  request: one(requests, {
    fields: [bookings.requestId],
    references: [requests.id],
  }),
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

export const requestRelations = relations(requests, ({ one, many }) => ({
  tattooist: one(tattooists, {
    fields: [requests.tattooistId],
    references: [tattooists.id],
  }),
  offers: many(offers),
}));

export const offerRelations = relations(offers, ({ one, many }) => ({
  request: one(requests, {
    fields: [offers.requestId],
    references: [requests.id],
  }),
  bookings: many(bookings),
}));