1. Implement Drizzle schema for Postgres.

Tables:  
- users: id, name, email, password_hash, role, created_at  
- tattooists: id, user_id, bio, approved  
- portfolios: id, tattooist_id, image_url, description, style_tags[]  
- availability: id, tattooist_id, day, start_time, end_time  
- bookings: id, customer_id, tattooist_id, slot, status, deposit_amount, payment_status  
- tattoo_ideas: id, booking_id, image_url, description  
- transactions: id, booking_id, amount, status, qpay_invoice_id  

Acceptance Criteria:  
- All tables have foreign keys.  
- Migration runs without error.  
- Types generated for use in API routes.

2. Implement authentication & authorization.

Requirements:  
- NextAuth with credentials provider (email/password).  
- Role stored in users table (customer, tattooist, admin).  
- Middleware to restrict API routes by role.  
- Password hashing with bcrypt.  

Acceptance Criteria:  
- User can sign up/login via API route.  
- JWT/session includes role.  
- Unauthorized access to protected API returns 403.

3. You are a backend engineer. Implement Cloudflare R2 presigned uploads and the Portfolio CRUD API for tattooists.

Requirements:
- Implement an API endpoint to generate presigned PUT URLs for R2:
  - POST /api/upload/presign
  - Input: { filename, contentType, folder? }
  - Output: { uploadUrl, publicUrl }
- Ensure presigned URLs are short lived and include metadata where possible.
- Portfolio CRUD API (tattooist only for create/update/delete):
  - POST /api/portfolio -> create portfolio item (image_url from R2 publicUrl, description, tags[])
  - GET /api/portfolio/[tattooistId] -> list items (public)
  - PATCH /api/portfolio/[id] -> edit description/tags
  - DELETE /api/portfolio/[id] -> delete record and optionally delete object from R2 (or mark)
- Use Drizzle for DB operations; validate inputs with Zod; protect endpoints via middleware (role=tatooist for create/edit/delete).

Acceptance Criteria:
- Presigned upload endpoint returns a working PUT URL that lets a client upload a file directly to R2.
- Portfolio create stores image_url + metadata in DB.
- Public GET returns portfolio items with image_url pointing to R2 public URL (or signed short URL).
- Role checks enforce access control.
- Unit/integration tests for presign and create portfolio endpoints.

4. You are a backend engineer. Implement availability and booking APIs.

Requirements:
- Availability endpoints:
  - POST /api/availability -> (tattooist) add weekly availability (day 0-6, start_time, end_time)
  - GET /api/availability/[tattooistId] -> fetch availability
  - DELETE /api/availability/[id] -> remove slot
- Booking endpoints:
  - POST /api/bookings -> (customer) create booking with fields {tattooistId, slot (ISO timestamptz), notes, depositAmount}
    - Validate slot against tattooist availability and existing bookings to prevent double-book.
    - Create booking record status=pending, payment_status=unpaid.
  - GET /api/bookings -> user-specific: returns bookings for current user (role-sensitive: tattooists see their bookings; customers see their bookings)
  - GET /api/bookings/[id] -> booking detail (role-validated)
  - PATCH /api/bookings/[id] -> update status (tattooist/admin) e.g., pending→confirmed→completed/cancelled
- Enforce time zone handling (store as timestamptz) and use server-side checks to prevent race conditions (use DB transactions / row locking where available).

Acceptance Criteria:
- Availability CRUD works for tattooists.
- Creating a booking validates availability and prevents double-book.
- Booking shows in both tattooist and customer lists.
- Booking status updates are role-protected and audited (created_at, updated_at).
- Tests for slot conflict handling and status transitions.

5. You are a backend engineer. Implement QPay deposit flow using a Cloudflare Worker and server-side Next.js API wiring.

Worker (edge) requirements:
- POST /worker/qpay/invoice:
  - Input: { bookingId, amount, returnUrl, notifyUrl }
  - Worker constructs & signs QPay invoice request using QPAY_SECRET (do not embed secret in frontend).
  - Worker calls QPay API and returns { qpayInvoiceId, qrUrl, checkoutUrl, expiresAt } to Next.js.
- POST /worker/qpay/webhook:
  - Endpoint receives QPay payment confirmations.
  - Verify signature, look up booking by invoice id, update transactions table and set booking.payment_status = paid and booking.status = confirmed (or other mapping).
  - Return 200/OK.

Next.js API wiring:
- POST /api/payments/create -> server calls Worker `/worker/qpay/invoice` with booking info; store transaction record with status=pending and qpay_invoice_id.
- Provide GET /api/payments/status/[qpayInvoiceId] -> return transaction/booking status.

Security & reliability:
- All Worker requests signed and restricted.
- Webhook authenticates QPay signature.
- Implement idempotency for webhook handling (ignore duplicate events).
- Transaction records include audit info (qpay_invoice_id, raw_payload, processed_at).

Acceptance Criteria:
- Client gets a QR/checkoutUrl for deposit via the Worker.
- When a payment webhook arrives, the booking is updated to payment_status=paid and booking.status transitions to confirmed.
- Transactions table reflects status changes and stores invoice id and timestamps.
- Webhook is idempotent and secure with signature verification.
- Tests or simulation of webhook processing included (e.g., sample payload).

6. You are a backend engineer. Implement tattoo ideas endpoints linked to bookings.

Endpoints:
- POST /api/tattoo-ideas
  - Body: { bookingId, description, optional image_url (from R2) }
  - Only booking.customer or associated tattooist can create ideas; customers create initial ideas, tattooists can add notes.
- GET /api/tattoo-ideas/[bookingId] -> list ideas for booking (role validated)
- PATCH /api/tattoo-ideas/[id] -> edit description (author or admin)
- DELETE /api/tattoo-ideas/[id] -> delete (author or admin)

DB:
- Store image_url pointing to R2; created_by user id; created_at.

Acceptance Criteria:
- Ideas can be uploaded and linked to booking.
- Access control works: only parties to the booking + admin can fetch/modify.
- Images use presigned R2 flow (Story 3).
- Tests for creation and access control enforcement.

7. You are a backend engineer. Implement admin-level APIs for approvals, disputes, and reporting.

Endpoints:
- PATCH /api/admin/tattooist/[id]/approve -> body: { approved: true|false, note? }
- GET /api/admin/bookings -> paginated list with filters (status, date range, tattooist)
- GET /api/admin/transactions -> paginated list with filters (status, date range)
- POST /api/admin/disputes -> create dispute { bookingId, reason, initiatorId }
- PATCH /api/admin/disputes/[id] -> resolve dispute { resolution, refundAmount?, set booking status }

Dispute workflow:
- Create dispute stores details and sets booking.status = "disputed"
- Admin resolve path may trigger refund logic (stubbed for MVP) and update transaction/booking.

Acceptance Criteria:
- Only admin role can call admin endpoints.
- Admin can approve tattooists; approved state reflected in tattooists table.
- Dispute create + resolve flows update booking & transaction records.
- Admin queries support pagination and basic filters.
- Tests for admin-only access and dispute resolution path.

8. You are a backend engineer. Implement DB migrations, seed scripts, tests, and deployment steps.

Requirements:
- Drizzle migrations created and runnable via npm scripts (e.g., pnpm db:migrate).
- Seed script to create:
  - Admin user (email + password)
  - One sample tattooist (approved=true) + sample portfolio + availability + one booking
- Tests:
  - Auth endpoints (signup/login)
  - Booking creation & conflict detection
  - Payment webhook handling (simulate QPay payload)
  - Presigned upload generation
- Deployment notes:
  - Worker deployment (terraform/Cloudflare CLI or `wrangler`) instructions for the QPay worker.
  - Environment variable checklist for production.
  - DB migration run step for CI/CD.
- Provide example curl/postman requests for main flows (create booking -> get QR -> simulate webhook -> booking confirmed).

Acceptance Criteria:
- Migrations run cleanly in a fresh DB.
- Seed script populates the sample data.
- Automated tests (unit/integration) run and pass locally.
- Deployment README with steps for deploying the Worker and Next.js app, running migrations, and setting env vars.
