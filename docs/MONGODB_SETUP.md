# Silveram MongoDB backend

The storefront uses a Node.js/Express API and MongoDB Atlas. The browser never connects directly to MongoDB. Database operations, email OTP, sessions, inventory, orders, payment verification, webhooks, and admin CRUD are in `server/src/`.

## Status and launch gates

- MongoDB code and configuration templates are in place, but no Atlas account credentials or SMTP/payment secrets were provided. Atlas cluster creation and a real end-to-end purchase cannot be completed without access to those accounts.
- Checkout is off by default (`STORE_LIVE_CHECKOUT=false` and `VITE_CHECKOUT_ENABLED=false`). Do not enable production checkout until this guide's launch checklist is complete.
- The sample catalog is seeded as inactive with zero inventory. Replace sample details and explicitly set actual inventory before listing anything for sale.

## Simple project structure

| Path | Purpose |
|---|---|
| `src/shared/lib/api.ts` | Browser requests to the same-origin `/api` |
| `src/features/checkout/components/CheckoutDialog.tsx` | Email code, delivery form, COD, and Razorpay UI |
| `src/features/storefront/data/catalog.ts` | Static presentation images and sample content |
| `server/src/index.js` | API startup and graceful shutdown |
| `server/src/app.js` | HTTP security, CORS, body parsing, and route wiring |
| `server/src/config.js` | Validates server environment and secrets |
| `server/src/db.js` | MongoDB connection pool and collection indexes |
| `server/src/security.js` | OTP hashing, opaque session tokens, and database rate limits |
| `server/src/middleware.js` | Session authentication and admin allowlist |
| `server/src/routes/auth.js` | Email OTP, session, current user, logout |
| `server/src/routes/products.js` | Public catalog and admin product CRUD |
| `server/src/routes/orders.js` | Owner order history, checkout, inventory reservation, payment verification |
| `server/src/routes/webhooks.js` | Signed Razorpay capture/refund events |
| `server/src/routes/admin.js` | Allowlisted staff order lookup and fulfillment |
| `server/src/scripts/seed-catalog.js` | Adds missing inactive starter items without overwriting existing catalog rows |
| `server/.env.example` | Configuration template; put actual values only in ignored `server/.env` |

## Atlas setup

1. In MongoDB Atlas, create a cluster in a region close to the API host. Choose a production tier and backup/retention plan appropriate for real orders; free/shared cluster availability and backup features are not a production SLA.
2. Create a dedicated database user for this application. Use a strong generated password and the minimum database permissions needed for the `silveram` database. Do not use an Atlas organization owner account in the URI.
3. Configure Atlas Network Access to allow only the production API host's fixed egress IPs (and your developer IP temporarily). Avoid `0.0.0.0/0` for production.
4. Copy `server/.env.example` to `server/.env`. Add the Atlas connection URI, URL-encode special characters in the database password, and set `MONGODB_DB_NAME=silveram`.
5. Generate separate cryptographically random `SESSION_SECRET` and `OTP_PEPPER` values of at least 32 bytes. Keep them out of source control, build variables exposed to the browser, issue trackers, and chat. Production deployments should read secrets from the host secret manager.
6. Configure MongoDB TLS (Atlas defaults to TLS) and verify your API host can connect before enabling any checkout route.

For local development, create a local MongoDB instance or use an Atlas development cluster with an IP-restricted URI. Run the server from the repository root with `npm --prefix server run dev`.

## Collections and indexes

The API creates the required indexes on startup. MongoDB applies TTL cleanup asynchronously; TTL indexes are housekeeping, not an exact-time job.

| Collection | Important data | Index / retention |
|---|---|---|
| `users` | Normalized verified email, display name, timestamps | Unique `email` |
| `authChallenges` | Email-keyed OTP digest, failed attempts, expiry | TTL `expiresAt`; raw OTP is never stored |
| `sessions` | Hash of random cookie token, user ID/email, expiry | Unique token hash and TTL `expiresAt` |
| `rateLimits` | Hashed identity/action, time window, counter | TTL `expiresAt`; rate limits shared across API instances |
| `products` | SKU, name/details, category, price in paise, stock, active flag, image URL | Unique `sku`; compound `active/category/_id` |
| `orders` | Owner, verified email, status, immutable line/price snapshot, delivery details, payment references | `userId/createdAt` descending; unique sparse payment order ID; partial pending-reservation expiry index |
| `webhookEvents` | Razorpay event ID/type and received timestamp | Unique `_id`; TTL 180 days |

MongoDB stores image references, not image binaries. Current demo images are served as static files from `public/images`; for a production catalog, use an object-storage/CDN provider and store only its validated public URL in `products.imageUrl`. Never put private customer or payment documents in a public media location.

## Authentication and security

- Passwordless sign-up/sign-in uses a six-digit email code sent via the configured SMTP relay. Codes are HMAC-digested with `OTP_PEPPER`, expire after 10 minutes by default, permit at most five guesses, and are limited by hashed email and IP identity.
- Successful verification creates a random opaque session token. Only its SHA-256 hash is stored in MongoDB. The browser receives it as an `HttpOnly`, `SameSite=Lax` cookie; production sets `Secure`. The API can revoke sessions by deleting their records.
- Admin access is determined by the normalized `ADMIN_EMAILS` allowlist on the server, not by a client-supplied role. Only add trusted staff emails; remove access by removing the address and revoking existing sessions.
- CORS allows only explicit `FRONTEND_ORIGINS`. Never use `*` with credentials. Set `NODE_ENV=production` in deployment and set `TRUST_PROXY_HOPS` to the exact number of trusted ingress proxies; an incorrect value can make IP-based rate limits unreliable.
- Helmet security headers, JSON body-size limits, Zod request validation, escaped/static product images, parameterized MongoDB queries, and server-side price calculation are used.
- Do not expose MongoDB, SMTP, Razorpay, OTP, or session secrets as `VITE_*` variables. Do not grant the web client database credentials.

### Email OTP

Configure a verified sender and authenticated SMTP relay in the API host's secrets:

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`.

Test delivery, junk-folder handling, sender-domain SPF/DKIM/DMARC, resend waits, wrong/expired codes, and provider limits before accepting customers. The API returns a configuration error rather than logging or returning the OTP if email is not set up.

## Safe CRUD and staff operations

### Catalog CRUD

Admin catalog routes require a live email-verified session and an `ADMIN_EMAILS` match:

| Method | Route | Operation |
|---|---|---|
| GET | `/api/products/admin` | List up to 500 products, including inactive items |
| POST | `/api/products/admin` | Create a validated product; `sku` is unique |
| PATCH | `/api/products/admin/:id` | Update validated fields |
| DELETE | `/api/products/admin/:id` | Soft-delete by setting `active=false`; order history remains intact |

Public `GET /api/products` returns active products only. For manual, audited changes, trusted developers can use MongoDB Compass with their own least-privilege database account. Prefer the API for routine edits so schema validation and update timestamps are applied. Keep the product IDs/prices in the storefront presentation in sync; the order API always reads prices and stock from MongoDB, never from browser-submitted price fields.

The seed script inserts sample catalog rows only if missing, with `active=false`, `stockQuantity=0`, and placeholder descriptions:

```powershell
Copy-Item .\server\.env.example .\server\.env
# Fill MongoDB connection details and secrets in server/.env, then:
npm --prefix server run seed:catalog
```

`POST /api/orders` creates an order only after verified login and an active item with sufficient stock. It decrements inventory and writes the order in a MongoDB transaction. For Razorpay, the decrement is a temporary reservation; a worker returns inventory for expired pending orders. COD orders permanently decrement inventory when placed. Razorpay callbacks are signature-checked and the payment must be captured through the provider API before `paid` is recorded. Signed webhooks provide reconciliation when a browser closes before its callback completes.

Orders are intentionally not public CRUD. Customers can only read their own order list. Staff can read orders through `GET /api/admin/orders`, mark eligible orders fulfilled through `PATCH /api/admin/orders/:id/status`, and cancel an unfulfilled COD order through `POST /api/admin/orders/:id/cancel`; that cancellation restores inventory in a transaction. Order/payment history is not deleted through the API. Refunds and payment-side cancellations require a separately audited business workflow.

## Run and deploy

### Local

```powershell
npm install
npm --prefix server install
Copy-Item .\server\.env.example .\server\.env
npm run dev
npm run dev:server
```

Vite proxies `/api` to `http://127.0.0.1:4000`. The API's `/api/health` endpoint indicates that the HTTP process is available; confirm the server startup log also says MongoDB connected before treating the deployment as healthy.

### Production

1. Deploy the Vite output and the `server/` Node.js API. Route `/api/*` to the API on the same origin when possible; otherwise set `VITE_API_BASE_URL` and exact `FRONTEND_ORIGINS` deliberately. Set `PRODUCT_IMAGE_HOSTS` to a comma-separated allowlist of HTTPS CDN/storage hostnames used for product image URLs.
2. Provide `server/.env.example` values through the host's secret manager. Set production `SESSION_SECRET`, `OTP_PEPPER`, `MONGODB_URI`, SMTP, admin allowlist, and `NODE_ENV=production`.
3. Use HTTPS end-to-end. Set the correct trusted proxy count rather than trusting arbitrary forwarded IP headers.
4. Configure Razorpay test credentials first and a webhook pointed at `/api/webhooks/razorpay`; store `RAZORPAY_WEBHOOK_SECRET` as a secret.
5. Enable automatic capture. Test payment success, failure, cancellation, duplicate callbacks, browser-close reconciliation, webhook replay, and refund workflow.
6. Keep both checkout flags false until staging has passed. Only then deliberately set `STORE_LIVE_CHECKOUT=true` on the API and `VITE_CHECKOUT_ENABLED=true` on the frontend build.

## Production launch checklist

- [ ] MongoDB cluster, dedicated database user, TLS, restricted network access, required indexes, backup/restore test, and monitoring are verified.
- [ ] SMTP sender/domain passes SPF/DKIM/DMARC; deliverability, OTP expiry, resend limits, and brute-force limits are tested.
- [ ] Production site origins, TLS, trusted proxy/IP settings, and cookie behavior are verified.
- [ ] Admin addresses are correct and each authorized staff member has verified their own email.
- [ ] Real product materials, price/tax treatment, image rights, stock counts, shipping charges/coverage, invoices, and published legal/privacy/return policies are approved.
- [ ] Razorpay account activation, test/live keys, automatic capture, webhooks, reconciliation, refund process, and alerting are tested.
- [ ] Transaction concurrency tests demonstrate no overselling; reservation expiry and worker recovery are tested in the deployed hosting model.
- [ ] Order confirmation emails, support/fulfillment/tracking operations, monitoring, alerts, and incident/key rotation runbooks are in place.
- [ ] Staging has passed signup/sign-in, OTP abuse cases, COD, successful/failed/cancelled payment, duplicate requests, webhook retry, order privacy, and full refund tests.

The repository supplies an understandable backend foundation; it cannot provision an Atlas cluster, verify your mail/payment business accounts, choose tax/shipping/legal policy, or guarantee production availability without those account settings and real-world tests.
