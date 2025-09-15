import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users, tattooists, portfolios, availability, bookings, tattooIdeas, transactions } from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Tattooist = InferSelectModel<typeof tattooists>;
export type NewTattooist = InferInsertModel<typeof tattooists>;

export type Portfolio = InferSelectModel<typeof portfolios>;
export type NewPortfolio = InferInsertModel<typeof portfolios>;

export type Availability = InferSelectModel<typeof availability>;
export type NewAvailability = InferInsertModel<typeof availability>;

export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;

export type TattooIdea = InferSelectModel<typeof tattooIdeas>;
export type NewTattooIdea = InferInsertModel<typeof tattooIdeas>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;