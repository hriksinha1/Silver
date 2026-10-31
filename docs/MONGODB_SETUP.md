# Silveram MongoDB backend

The storefront uses a Node.js/Express API and MongoDB Atlas. The browser never connects directly to MongoDB. Database operations, email OTP, sessions, inventory, orders, payment verification, webhooks, and admin CRUD are in `server/src/`.

## Status and launch gates

- Atlas project `Silveram` and the `silveram-dev` free cluster have been created in AWS Mumbai. The free tier provides shared compute and 512 MB storage, has no backups, and is for learning/testing—not production orders or a production SLA. No paid resources were created.
- The `silveram_app` database user has only `readWrite` on the `silveram` database. The temporary broad-access bootstrap database user was removed. Atlas access is restricted to the current developer IP (`/32`); add only the API host's fixed egress IP when deploying.
- `server/.env` is configured locally with the Atlas URI and separate random app secrets. It is Git-ignored and its Windows ACL grants access only to the current Windows user. Never copy it into chat, source control, or a frontend build; production must use the deployment secret manager.
- The app connected successfully, its seven collections and indexes were provisioned, and five sample catalog records were seeded inactive with zero stock. Real product information and inventory are not configured.
- SMTP, production admin allowlist, Razorpay, production origins, backups, and deployment settings remain unconfigured, so checkout stays disabled. A free cluster is not sufficient for the requested production-ready real-world workload.
- Checkout is off by default (`STORE_LIVE_CHECKOUT=false` and `VITE_CHECKOUT_ENABLED=false`). Do not enable production checkout until this guide's launch checklist is complete.
- Replace sample catalog details with verified product information and explicitly set actual inventory before listing anything for sale.

## Simple project structure

| Path | Purpose |
|---|---|
| `src/shared/lib/api.ts` | Browser requests to the same-origin `/api` |
| `src/features/checkout/components/CheckoutDialog.tsx` | Email code, delivery form, COD, and Razorpay UI |
| `src/features/products/data/products.ts` | Storefront catalogue (three placeholder products) |
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
| `server/src/payments/razorpay/` | Isolated Razorpay order creation, captured-payment verification, and signature helpers; disabled until separately configured |
| `server/src/scripts/seed-catalog.js` | Adds missing inactive starter items without overwriting existing catalog rows |
| `server/app.js` | Vercel Express entry point; reuses the process-level Mongo connection and exports the API app |
| `server/.env.example` | Configuration template; put actual values only in ignored `server/.env` |

## Atlas setup

1. The existing `Silveram` project and `silveram-dev` free cluster are for development/staging only. Before real orders, choose and authorize a paid production tier with backups/retention and capacity appropriate for the business.
2. Keep the application database user separate from Atlas console users. `silveram_app` currently has `readWrite` only on `silveram`; never use an Atlas organization owner or an all-databases admin in the API URI.
3. Atlas currently allows only the developer machine's `/32` IP. When deploying, replace or supplement it with only the production API host's fixed egress IPs. Avoid `0.0.0.0/0`.
4. The ignored local `server/.env` is already configured for development. Keep its file ACL restricted, never commit it, and do not overwrite it with the template. For another machine, provision credentials through its secret manager instead of copying this file.
5. `SESSION_SECRET` and `OTP_PEPPER` are separate cryptographically random secrets of at least 32 bytes. Keep them out of source control, browser build variables, issue trackers, and chat.
6. Configure MongoDB TLS (Atlas defaults to TLS) and verify the actual API host can connect before enabling any checkout route.

For local development, use a local MongoDB instance or the existing IP-restricted Atlas development cluster. The current ignored `server/.env` is already configured; never overwrite it with the template. On a new machine, create that file only if it does not already exist, then set local secrets securely. Run the server from the repository root with `npm --prefix server run dev`.

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
- Checkout requires a verified email, recipient name, 10-digit Indian phone, street address, city, state, and six-digit PIN. COD stock decrement/order creation is transactional; order details are restricted to the owner and allowlisted admins.
- Online payment is disabled in both layers by default (`VITE_RAZORPAY_ENABLED=false`, `RAZORPAY_ENABLED=false`). Provider code is isolated in `server/src/payments/razorpay/`; only enable it after account activation, payment tests, webhook setup, and reliable expired-reservation scheduling.

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

The seed script inserts sample catalog rows only if missing, with `active=false`, `stockQuantity=0`, and placeholder descriptions. The current Atlas database has these rows already:

```powershell
# Configure server/.env through a secure local process; do not overwrite an existing env file.
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

Vite proxies `/api` to `http://127.0.0.1:4000`. The `/api/health` endpoint pings MongoDB before reporting the API ready.

### Vercel

Deploy this monorepo as two Vercel projects:

1. **Storefront:** project root is the repository root; framework Vite, build command `npm run build`, output directory `dist`.
2. **API:** project root is `server/`; Vercel detects the Express app exported from `server/app.js` as one serverless function. Configure its production environment variables in Vercel's encrypted Environment Variables UI; do not upload `server/.env`.
3. Use a custom domain and same-site hostnames for the web app and API (for example `shop.example.com` and `api.example.com`). Set storefront `VITE_API_BASE_URL=https://api.example.com/api` and `VITE_CHECKOUT_ENABLED=false`. Set API `FRONTEND_ORIGINS=https://shop.example.com`, `NODE_ENV=production`, `TRUST_PROXY_HOPS=1`, `MONGODB_URI`, `MONGODB_DB_NAME`, `SESSION_SECRET`, and `OTP_PEPPER`. Rebuild/redeploy the storefront whenever its `VITE_*` values change.
4. Add only the API deployment's static egress IP to Atlas Network Access. If your Vercel plan/deployment does not provide a stable egress IP, do not compensate with `0.0.0.0/0`; choose a deployment/network option with fixed egress or use an appropriately configured private network.
5. Confirm `https://api.example.com/api/health` returns `{"status":"ok"}` after connecting to Atlas. The endpoint pings MongoDB, not just the HTTP process.
6. Vercel serverless functions do not run the Node server's in-process reservation sweeper. COD does not create expiring reservations. Razorpay remains off until a reliable external scheduler or suitable Vercel cron plan can release expired reservations; Vercel Hobby cron is limited to once daily, which is not suitable for 30-minute payment reservations.

Vercel deployment cannot be completed from this workspace without linking your Vercel account, domain, and project settings. Never put Atlas credentials in frontend `VITE_*` variables.

### Production

1. Deploy the Vite output and the `server/` Node.js API. Route `/api/*` to the API on the same origin when possible; otherwise set `VITE_API_BASE_URL` and exact `FRONTEND_ORIGINS` deliberately. Set `PRODUCT_IMAGE_HOSTS` to a comma-separated allowlist of HTTPS CDN/storage hostnames used for product image URLs.
2. Provide `server/.env.example` values through the host's secret manager. Set production `SESSION_SECRET`, `OTP_PEPPER`, `MONGODB_URI`, SMTP, admin allowlist, and `NODE_ENV=production`.
3. Use HTTPS end-to-end. Set the correct trusted proxy count rather than trusting arbitrary forwarded IP headers.
4. Configure Razorpay test credentials first and a webhook pointed at `/api/webhooks/razorpay`; store `RAZORPAY_WEBHOOK_SECRET` as a secret.
5. Enable automatic capture. Test payment success, failure, cancellation, duplicate callbacks, browser-close reconciliation, webhook replay, and refund workflow.
6. COD is the only payment option currently shown. Keep both checkout flags false until staging has passed. Only then deliberately set `STORE_LIVE_CHECKOUT=true` on the API and `VITE_CHECKOUT_ENABLED=true` on the frontend build. Keep `RAZORPAY_ENABLED=false` and `VITE_RAZORPAY_ENABLED=false` until the later Razorpay integration, credentials, webhook, and reservation worker have been tested.

## Production launch checklist

- [ ] MongoDB cluster, dedicated database user, TLS, restricted network access, required indexes, backup/restore test, and monitoring are verified.
- [ ] SMTP sender/domain passes SPF/DKIM/DMARC; deliverability, OTP expiry, resend limits, and brute-force limits are tested.
- [ ] Production site origins, TLS, trusted proxy/IP settings, and cookie behavior are verified.
- [ ] Admin addresses are correct and each authorized staff member has verified their own email.
- [ ] Real product materials, price/tax treatment, image rights, stock counts, shipping charges/coverage, invoices, and published legal/privacy/return policies are approved.
- [ ] If online payment is launched later: Razorpay account activation, test/live keys, automatic capture, webhooks, reservation expiry worker, reconciliation, refund process, and alerting are tested. Keep Razorpay disabled until then.
- [ ] Transaction concurrency tests demonstrate no overselling; reservation expiry and worker recovery are tested in the deployed hosting model.
- [ ] Order confirmation emails, support/fulfillment/tracking operations, monitoring, alerts, and incident/key rotation runbooks are in place.
- [ ] Staging has passed signup/sign-in, OTP abuse cases, COD, successful/failed/cancelled payment, duplicate requests, webhook retry, order privacy, and full refund tests.

The free Atlas cluster and code foundation are provisioned for development/testing, not production. Production still requires an authorized paid cluster and backup plan, verified mail/payment accounts, deployment/network settings, approved tax/shipping/legal policies, and real-world staging tests.

## Data storage split: Cloudinary vs MongoDB

| Data | Where |
|---|---|
| Product and site image files | **Cloudinary** (never MongoDB) |
| Image references (`publicId`, `width`, `height`, `alt`) | MongoDB `products.images[]` |
| Users, phone/email, addresses, orders, transaction/payment IDs, sessions | **MongoDB** |

### Cloudinary folder structure

```
silveram/
├── development/            # dev uploads never mix with production
│   ├── products/<sku>/     # one folder per product, e.g. products/sr-001/<generated-id>
│   └── site/{hero,categories,editorial,avatars}/
└── production/
    ├── products/<sku>/
    └── site/...
```

Code: `server/src/storage/cloudinary/folders.js` (paths), `client.js` (signing, delivery URL, delete).

### Upload flow

1. Admin calls `POST /api/uploads/sign` with `{ "target": "product", "sku": "SR-001" }` (or `{ "target": "site", "area": "hero" }`).
2. API returns a short-lived SHA-1 signed payload (`uploadUrl`, `apiKey`, `signature`, `timestamp`, `folder`, `allowed_formats`). The API secret never leaves the server.
3. The browser POSTs the file plus those fields to `uploadUrl`, then sends the returned `public_id`, `width`, `height` to `POST/PATCH /api/products/admin` as `images: [{ publicId, width, height, alt }]`.
4. The API rejects any `publicId` outside `products/<sku>/` of the current environment, and returns optimised delivery URLs (`f_auto,q_auto,c_limit,w_1200`) on every product as `images[].url` / `imageUrl`.

Setup: fill `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env` (all or none; set them in the deployment secret manager for production). Legacy `/images/*.webp` entries keep working until migrated.

## Database guide for developers and designers

**One file describes the whole database: [`server/src/database/schema.js`](../server/src/database/schema.js).** Each collection lists its purpose, allowed fields (validator) and indexes.

| Collection | Holds | Typical CRUD |
|---|---|---|
| `users` | verified email, name, phone | created on first login; edit name/phone |
| `authChallenges`, `sessions`, `rateLimits` | login codes (hashed), sessions (hashed), throttles | automatic; expire themselves |
| `products` | catalog, price (paise), stock, Cloudinary `images[]` | `/api/products/admin` POST/GET/PATCH/DELETE (delete = `active:false`) |
| `orders` | items, shipping phone/address, `razorpayOrderId`, `razorpayPaymentId` (transaction ID) | created at checkout; staff via `/api/admin/orders` |
| `webhookEvents` | processed Razorpay event IDs | automatic |

Commands (run in `server/`):

| Command | What it does |
|---|---|
| `npm run db:setup` | creates collections, validators, indexes from `schema.js` (idempotent) |
| `npm run db:check` | read-only audit: TLS, structure, stock/reservation integrity, placeholder products |
| `npm run seed:catalog` | adds the three inactive placeholder products |
| `npm run dev` / `npm test` | run API / tests |

Change the structure: edit `schema.js` → `npm run db:setup`. Validation is "moderate": new writes must match, old documents are untouched.

### Security model
- Browser never touches MongoDB; only the API does. Runtime user `silveram_app` is `readWrite` on one database, so it **cannot** set validators. Run `npm run db:setup` once with `MONGODB_SETUP_URI` set to a temporary Atlas user that has `dbAdmin` on `silveram`, then delete that user.
- Login: emailed 6-digit code (peppered hash, max attempts, resend delay, rate limits); sessions are opaque tokens stored only as SHA-256 hashes in HttpOnly cookies; admin = `ADMIN_EMAILS` allowlist.
- Payments: Razorpay signatures and webhooks verified server-side; prices/stock come from the DB, never the browser; stock reserved in a transaction; checkout is idempotent by request ID.
- Secrets only in `server/.env` (Git-ignored) / host secret manager.

### Scalability
Pooled connections (max 10), every query path indexed, TTL indexes clean up expired data, API is stateless (horizontally scalable / serverless). Free Atlas M0 has no backups: before real orders upgrade to a paid tier (M10+) with continuous backup, set Atlas IP access to the API's egress IPs, and enable alerts.
