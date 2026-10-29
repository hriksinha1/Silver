# Silveram Storefront

A jewellery storefront built with React, TypeScript, Vite, Tailwind CSS, and GSAP. Its Node.js/Express API uses MongoDB Atlas for verified customer accounts, the catalog, and orders.

> **Launch status:** The configured Atlas cluster is free-tier development infrastructure. Email OTP delivery, production hosting/domain, backups, shipping/tax policies, and production inventory are not configured. Live checkout is deliberately disabled. Do not accept real orders until the launch checklist in [MongoDB setup](./docs/MONGODB_SETUP.md#production-launch-checklist) has passed.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- MongoDB access for local API development

## Quick start

```powershell
npm install
npm --prefix server install
npm run dev
npm run dev:server
```

The storefront runs on `http://localhost:3000`; Vite proxies `/api` to the API at `http://127.0.0.1:4000`.

The local `server/.env` is ignored by Git and restricted to the current Windows user. **Never print, commit, upload, or share it.** It is already configured on this machine. On a new machine, create it from `server/.env.example` only if it does not exist, then add secrets through a secure local process or a secret manager.

## Project structure

```text
src/
  app/                         Storefront composition and page state
  features/
    cart/                      Cart state and cart drawer
    checkout/                  Email OTP, delivery details, COD checkout UI
    policies/                  Store policy dialog
    storefront/                Landing page, product content, images
  shared/
    lib/api.ts                 Same-origin /api client and public feature gates
    ui/                         Reusable controls and icons
server/
  app.js                       Vercel Express entry point
  src/
    app.js                     API middleware and routes
    config.js                  Validated server-only configuration
    db.js                      Mongo connection, collections, and indexes
    middleware.js              Customer/admin authentication
    security.js                OTP/session primitives and shared rate limits
    payments/razorpay/         Isolated online-payment provider integration
    routes/                    Auth, catalog, orders, admin, and webhooks
    scripts/                   Safe inactive catalog seed
  test/                         Security/configuration tests
docs/
  MONGODB_SETUP.md             Atlas, data model, CRUD, security, and deployment guide
```

Feature-specific frontend code belongs under `src/features`. Backend route handlers belong under `server/src/routes`; provider integrations live under `server/src/payments/<provider>`.

## MongoDB database

The browser never connects directly to MongoDB. The API connects to the `silveram` database and creates the required indexes at startup.

| Collection | Purpose |
|---|---|
| `users` | Verified customer email and profile |
| `authChallenges` | Short-lived hashed email OTP challenges |
| `sessions` | Hashes of opaque authentication cookies |
| `rateLimits` | Shared OTP/IP rate-limit counters |
| `products` | Product catalog, prices, image references, inventory |
| `orders` | Customer, delivery, immutable item/price snapshot, payment/order state |
| `webhookEvents` | Razorpay webhook replay protection; provider stays disabled for now |

Atlas is configured for development with a least-privilege `silveram_app` user, restricted IP access, and a free cluster. Five sample products have been seeded **inactive with zero stock**. Replace all placeholder product details, validate inventory/pricing/tax/shipping, and configure paid production Atlas with backups before taking real orders.

For Atlas provisioning, collection/index details, safe CRUD, deployment secrets, and launch checks, follow [MongoDB Atlas and backend setup](./docs/MONGODB_SETUP.md).

## Authentication and COD order flow

1. Customer enters an email and receives a six-digit OTP from the configured SMTP relay.
2. The API stores only a peppered HMAC digest of the code, expires it, and applies Mongo-backed attempt/request limits.
3. OTP verification creates a random opaque, `HttpOnly` session cookie; only its SHA-256 hash is stored.
4. Checkout collects recipient name, Indian mobile number, street address, city, state, and PIN code.
5. The API validates the signed-in customer and delivery details, calculates prices from MongoDB, checks inventory, and writes the COD order plus stock decrement in a MongoDB transaction.
6. Customers can view only their own orders. Allowlisted admins manage catalog/fulfillment; cancelling eligible COD orders restores inventory transactionally.

Checkout is gated in both frontend and API (`VITE_CHECKOUT_ENABLED=false`, `STORE_LIVE_CHECKOUT=false`). The COD path is implemented, but cannot create orders until all launch conditions and staging tests pass.

## Razorpay integration (future)

Online payments are intentionally not offered at launch. Provider code and the handoff checklist are in [`server/src/payments/razorpay/README.md`](./server/src/payments/razorpay/README.md). The integration is independently gated by `VITE_RAZORPAY_ENABLED=false` and `RAZORPAY_ENABLED=false`. Keep both false until the merchant account, test/live credentials, webhooks, payment reconciliation, and reservation-expiry worker have been completed and verified.

Never put Razorpay secrets, Atlas credentials, SMTP passwords, session secrets, or OTP peppers into `VITE_*` variables, source files, commits, chat, or issue trackers.

## Development checks

```powershell
npm run lint
npm run build
npm --prefix server run check
npm --prefix server test
npm --prefix server audit --omit=dev
```

The database health endpoint, `GET /api/health`, pings MongoDB before returning `{"status":"ok"}`.

## Deployment

The documented Vercel deployment uses two projects: the Vite storefront rooted at the repository root and the Express API rooted at `server/`. Use same-site custom hostnames, exact HTTPS CORS origins, encrypted Vercel environment variables, and a fixed API egress IP allowlisted in Atlas. See the [Vercel deployment instructions](./docs/MONGODB_SETUP.md#vercel).

The project is **not production-ready for real orders yet**. The free Atlas cluster has no backups and is not a production SLA; the production domain, stable API egress, SMTP, business/admin configuration, product data, and launch testing remain outstanding. Keep all checkout flags off.
