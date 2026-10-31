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
```

Run these in separate terminals:

```powershell
npm run dev
```

```powershell
npm run dev:server
```

The storefront runs on `http://localhost:3000`; Vite proxies `/api` to the API at `http://127.0.0.1:4000`.

The local `server/.env` is ignored by Git and restricted to the current Windows user. **Never print, commit, upload, or share it.** This workspace already has a configured local file. On a new machine, create it from `server/.env.example` only if it does not exist, then add secrets through a secure local process or a secret manager.

## Project structure

```text
src/
  app/                         Storefront composition and page state
  features/
    cart/                      Cart state and cart drawer
    checkout/                  Email OTP, delivery details, COD checkout UI
    policies/                  Store policy dialog
    products/                  Catalogue data (products.ts), product page, gallery
    whatsapp/                  WhatsApp config, message builders, buttons
    storefront/                Homepage sections and editable copy (data/content.ts)
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

Atlas is configured for development with a least-privilege `silveram_app` user, restricted IP access, and a free cluster. Three placeholder products (`product-1..3`) are seeded **inactive with zero stock** by `npm --prefix server run seed:catalog`; any earlier sample records already in Atlas should be reviewed or deleted, and `npm --prefix server run db:setup` re-run because the category list gained `uncategorised`. Replace all placeholder product details, validate inventory/pricing/tax/shipping, and configure paid production Atlas with backups before taking real orders.

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


## Design system and WhatsApp ordering

- Midnight Silver tokens live in `src/styles/tokens.css`; League Spartan is the only font (`@fontsource-variable/league-spartan`).
- Public settings (`.env.example`): `VITE_WHATSAPP_NUMBER` (Indian mobile), optional `VITE_INSTAGRAM_URL`, `VITE_CONTACT_EMAIL`. Without a WhatsApp number the UI shows a "contact pending" state. Online checkout and Razorpay stay disabled (`VITE_CHECKOUT_ENABLED`/`VITE_RAZORPAY_ENABLED` = false and server gates).
- Policy text: `src/features/policies/data/policies.ts`. FAQ and page copy: `src/features/storefront/data/content.ts`.

## Replacing the three placeholder products

1. Put photographs in `public/images/products/` (resize/compress; WebP or JPEG, ~1600px long edge).
2. Edit `src/features/products/data/products.ts`: for each of the three records set `name`, `slug`, `price` (rupees), `shortDescription`, `description`, `images` (`src`, real `width`/`height`, `alt`), and only the verified optional fields (`material`, `purity`, `weight`, `dimensions`, `sizes`, `care`, `deliveryInfo`, `returnInfo`). Set `isPlaceholder: false`. Optional fields that are left out are not shown.
3. Hero/story/gifting photos: set `HERO.image`, `STORY.image`, `GIFTING.image` in `src/features/storefront/data/content.ts`.
4. Keep the server in step: edit the same three records in `server/src/scripts/seed-catalog.js` (or via the admin API) with the real category, `priceInPaise`, stock and Cloudinary images; the `_id` must equal the storefront `id`. Only then set `active: true`.
