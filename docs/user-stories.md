# Ordered User Stories — Single Tattooist MVP (Cursor-ready)

---

<!-- - Simple rate-limit for login attempts (in-memory or small throttle). -->
<!-- - Middleware protects all tattooist routes (`/tattooist/*`, `/api/tattooist/*`). -->
<!-- - Implement `POST /tattooist/logout` to clear session. -->

<!-- - Invalid credentials return `401` and do not set a session. -->
<!-- - Protected routes return `401` for unauthenticated requests. -->
<!-- - Logout clears session cookie. -->


## Story 1 — Tattooist (Admin) — Hard-coded Login & Session
**Requirements**
- Create a login page `/tattooist/login` that accepts username & password.
- Use hard-coded credentials from constant variables: `TATTOOIST_USERNAME`, `TATTOOIST_PASSWORD`.
- Successful login issues secure HTTP-only session cookie (or short-lived JWT cookie).

**Acceptance Criteria**
- Correct credentials redirect to `/tattooist/dashboard` and set a session.


**API / DB / Tests**
- `POST /tattooist/login` — body `{ username, password }`.
- `POST /tattooist/logout`.
- Middleware checks session cookie and attaches `currentUser` (hard-coded artist).
<!-- - Tests: login success/failure, access control to protected routes. -->

---

## Story 2 — Tattooist — Manage Availability / Time Slots
**Requirements**
- Tattooist can CRUD availability blocks: create, update, delete.
- Availability model: `id, start_time (timestamptz), end_time (timestamptz), is_booked (bool), note, created_at`.
- Server-side validation prevents overlapping availability blocks.
- Public `GET /api/availability` returns computed bookable windows (availability minus confirmed bookings).

**Acceptance Criteria**
- Tattooist creates availability block and sees it in dashboard.
- System blocks creation of overlapping availability.
- When a booking is confirmed, corresponding availability becomes unavailable.
- `GET /api/availability` returns current bookable windows.

**API / DB / Tests**
- `POST /api/tattooist/availability` — create block.
- `GET /api/availability` — public.
- `PATCH /api/tattooist/availability/:id`.
- `DELETE /api/tattooist/availability/:id`.
- DB table: `availability(id, start_time, end_time, note, is_booked, created_at)`.
- Tests: overlapping prevention; availability computation correctness.

---

## Story 3 — Client — Submit Tattoo Request (image + metadata)
**Requirements**
- Public form `/request` collects: `name, phone, optional email, description, size, placement, images[]`.
- Backend provides presigned R2 PUT URLs: `POST /api/uploads/presign`.
- Client uploads images directly to R2, then posts `POST /api/requests` with image URLs + meta.
- Store request in `requests` table with `status='new'` and `created_at`.
- Trigger notification to tattooist on new request.
- Validate inputs with Zod.

**Acceptance Criteria**
- `POST /api/uploads/presign` returns upload & public URLs.
- `POST /api/requests` persists request record with `status='new'`.
- Tattooist receives notification (email/log).
- Anonymous clients can submit requests.

**API / DB / Tests**
- `POST /api/uploads/presign` — body `{ filenames: [{ name, contentType }] }`.
- `POST /api/requests` — body `{ name, phone, email?, description, size, placement, images: [publicUrl], preferredDates? }`.
- DB: `requests(id, name, phone, email, description, size, placement, images jsonb, preferred_dates jsonb, status, created_at)`.
- Tests: presign URL generation (mock), request creation, notification enqueued.

---

## Story 4 — Tattooist — Review Request & Send Offer
**Requirements**
- Tattooist views request details & uploaded images.
- Tattooist creates Offer: `{ offerId, requestId, quotedAmount, depositPercent, availableSlots[], message, expiresAt }`.
- Save Offer in `offers` table and update `requests.status='offered'`.
- Send email/notification to client with offer link.
- Compute deposit amount (e.g., depositPercent of quotedAmount or min).

**Acceptance Criteria**
- `POST /api/requests/:id/offer` persists offer and sets request status to `offered`.
- Client receives offer notification with link to view/accept.
- Offer expires after `expiresAt` if specified.

**API / DB / Tests**
- `POST /api/requests/:id/offer` — tattooist-only.
- `GET /api/offers/:offerId` — public view for client.
- DB: `offers(id, request_id, quoted_amount, deposit_percent, slots jsonb, message, expires_at, created_at)`.
- Tests: offer creation, request status update, notification.

---

## Story 5 — Client — View Offer & Select Slot (Idempotent Booking Creation)
**Requirements**
- Client views offer, deposit amount, and available slots.
- Client selects slot via `POST /api/offers/:offerId/select` with `idempotency_key`.
- Server validates slot is still available, not overlapping with confirmed bookings.
- If valid, server creates `booking` with `status='reserved'`, `payment_status='unpaid'`, `reservation_expires_at = now + 15m`.
- Enforce idempotency: same `idempotency_key` returns same booking.

**Acceptance Criteria**
- `POST /api/offers/:offerId/select` returns `201` with booking data on first call.
- Duplicate calls with same `idempotency_key` return same booking (idempotent).
- If slot no longer available, return `409 Conflict`.
- `booking.reservation_expires_at` set.

**API / DB / Tests**
- `POST /api/offers/:offerId/select` — body `{ slotIso, contactName, contactPhone, idempotency_key }`.
- DB: `bookings(id, offer_id, request_id, customer_name, customer_phone, slot, duration_minutes, quoted_amount, deposit_amount, status, reservation_expires_at, payment_status, created_at, idempotency_key)`.
- Use DB transaction + overlap check (Postgres `tstzrange &&`) to avoid race conditions.
- Tests: idempotency, concurrent booking attempts prevention.

---

## Story 6 — Payment — Create QPay Invoice & Return QR
**Requirements**
- After booking created, client triggers payment: `POST /api/payments/create` with `bookingId`.
- Server calls Cloudflare Worker `/worker/qpay/invoice` (signed) to create invoice; Worker returns `{ qpayInvoiceId, qrUrl, checkoutUrl, expiresAt }`.
- Create `transaction` row with `status='pending'`, attach `qpay_invoice_id`.
- Return QR/checkout info to client for payment.

**Acceptance Criteria**
- `POST /api/payments/create` returns QR info and creates pending transaction.
- Booking `payment_status` updated to `pending`.
- Transaction saved with `qpay_invoice_id`.

**API / DB / Tests**
- `POST /api/payments/create` — body `{ bookingId }`.
- Worker: `POST /worker/qpay/invoice`.
- DB: `transactions(id, booking_id, amount, currency, status, qpay_invoice_id, raw_payload, created_at)`.
- Tests: mock worker response, transaction persisted, booking payment_status updated.

---

## Story 7 — Payment Webhook — Confirm Booking
**Requirements**
- Cloudflare Worker receives QPay webhook and validates signature.
- On `paid` event: update `transactions.status='paid', processed_at=now, raw_payload=payload`; update `bookings.payment_status='paid', bookings.status='confirmed', deposit_paid_at=now'`.
- Worker/backend must handle idempotency (ignore duplicates).
- Notify client & tattooist.

**Acceptance Criteria**
- Valid webhook transitions booking → `confirmed` and transaction → `paid`.
- Duplicate webhooks are idempotently ignored.
- Invalid signatures return `400` and are logged.

**API / DB / Tests**
- Worker endpoint: `POST /worker/qpay/webhook`.
- Optional forward to `POST /api/payments/webhook` after verification.
- Tests: valid & invalid signature behavior, duplicate event handling, booking state change.

---

## Story 8 — Reservation Expiry Job (Cron)
**Requirements**
- Scheduled job (Cloudflare Worker Cron or manual trigger) runs every few minutes to find `bookings` where `status='reserved'` AND `reservation_expires_at < now` AND `payment_status != 'paid'`.
- For each expired booking: set `status='cancelled'`, `payment_status='unpaid'`, optionally delete pending transactions.
- Notify client about expiration and free up slot(s).

**Acceptance Criteria**
- Expired reserved bookings are updated to `cancelled` automatically.
- Notifications are triggered for expired bookings.
- No interference with confirmed bookings.

**API / DB / Tests**
- Worker cron or `POST /admin/cron/cleanup-reservations`.
- Tests: create reserved booking with short TTL, run cron, assert booking cancelled.

---

## Story 9 — Client — Cancel or Reschedule Booking
**Requirements**
- Client can cancel or reschedule by `POST /api/bookings/:id/cancel` or `POST /api/bookings/:id/reschedule`.
- Since no auth, require `booking_token` (generated at booking creation and emailed to client) OR verify `contactPhone`.
- Policy:
  - Cancel >48h before slot → mark `cancelled`, refund stub (create refund task/set `deposit_refunded_at`).
  - Cancel <48h → deposit forfeited.
  - Reschedule allowed >24h without penalty; within 24h needs tattooist approval.
- Update booking, create audit log, notify parties.

**Acceptance Criteria**
- Identity is enforced via `booking_token` or phone match.
- Policy logic yields correct states (refund vs forfeiture).
- Reschedule runs availability checks and updates reservation TTL.

**API / DB / Tests**
- `POST /api/bookings/:id/cancel` — body `{ booking_token }`.
- `POST /api/bookings/:id/reschedule` — body `{ booking_token, newSlotIso }`.
- Tests: cancellation before/after cutoff; reschedule allowed/blocked per policy.

---

## Story 10 — Tattooist — Mark Booking Completed or No-Show
**Requirements**
- Tattooist can update booking status via `PATCH /api/tattooist/bookings/:id/status` with allowed transitions: `confirmed -> completed` or `confirmed -> no_show`.
- No-show marks deposit forfeited and flags for admin review if needed.
- Log action in audit logs.

**Acceptance Criteria**
- Allowed transitions enforced.
- No-show sets forfeiture flag and notifies admin.
- Completed bookings stored in history.

**API / DB / Tests**
- `PATCH /api/tattooist/bookings/:id/status` — auth-protected.
- Tests: transition rules and audit logging.

---

## Story 11 — Notifications (Email MVP)
**Requirements**
- Integrate transactional email provider (SendGrid/Mailgun) or use SMTP stub for MVP.
- Send emails for: new request (to tattooist), new offer (to client), booking reserved (client & tattooist), payment confirmed (both), reservation expired (client).
- Include actionable links (offer view, booking token).
- Implement retry logic for transient failures.

**Acceptance Criteria**
- Emails are queued/sent for each event (mockable).
- Templates include dynamic booking and offer data.
- Retries for transient failures (configurable attempts).

**API / DB / Tests**
- Internal notification service: `POST /api/notifications/send`.
- Tests: notification enqueued and template variables correct.

---

## Story 12 — Audit Logs & Monitoring
**Requirements**
- Implement `audit_logs` table: `{ id, resource_type, resource_id, action, actor, meta jsonb, created_at }`.
- Write audit entries for all critical events: request created, offer sent, slot selected, booking created, payment events, cancellations, status updates.
- Expose `GET /tattooist/admin/audit` for the tattooist (protected) to view recent logs.

**Acceptance Criteria**
- Audit entries exist for each key flow.
- Tattooist can view recent audit logs.
- Logs contain enough context to trace changes.

**API / DB / Tests**
- DB: `audit_logs`.
- `GET /tattooist/admin/audit` — protected endpoint with paging/filtering.
- Tests: trigger flows and assert audit entries exist.

---

## Story 13 — Minimal Admin Panel (Optional)
**Requirements**
- Admin panel `/tattooist/admin` (uses same hard-coded auth) with:
  - List & filter bookings.
  - View transactions.
  - Manually mark refunds / override statuses.
  - Add admin notes to bookings.
- Use simple ShadCN tables/components for lists and actions.

**Acceptance Criteria**
- Admin can list/ filter bookings by status/date.
- Admin can manually mark refund done and override booking status.
- Manual actions are audited.

**API / DB / Tests**
- `GET /admin/bookings?status=&from=&to=` — protected.
- `POST /admin/bookings/:id/refund` — protected; sets `deposit_refunded_at`.
- Tests: admin-only access, override operations persisted.

---

## Implementation Notes for Cursor Agent
- Paste stories in order starting from **Story 1**.
- Include env vars in Cursor prompt:  
  `DATABASE_URL`, `R2_BUCKET`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `WORKER_API_TOKEN`, `QPAY_SECRET`, `MAIL_API_KEY`, `TATTOOIST_USERNAME`, `TATTOOIST_PASSWORD`.
- Use Drizzle ORM for schema & migrations, Zod for input validation.
- Prioritize tests for booking idempotency, race condition prevention (DB transactions), and webhook idempotency.
