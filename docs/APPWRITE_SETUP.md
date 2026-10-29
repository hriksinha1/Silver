# Silveram backend: Appwrite guide

This project uses Appwrite Cloud's free-plan **TablesDB Serverless** database, Storage, passwordless email OTP, and an Appwrite Function. The browser never receives an API key or payment secret. Keep checkout disabled until the launch checklist at the end is complete.

## What is in Appwrite

The configured project uses endpoint `https://sgp.cloud.appwrite.io/v1` and project ID `6ae2df98002eb5a1a39b`.

| Resource | ID | Purpose | Access model |
|---|---|---|---|
| TablesDB database | `silveram-store` | Store data | No public database permissions |
| `products` table | `products` | Product catalog and inventory | Public read on each published row; server-only writes |
| `orders` table | `orders` | Customer/order/payment records | Owner-only row read; server-only writes |
| Storage bucket | `product-images` | Public product photos | Public read on each product image; server-only writes |
| Function | Set after deployment | OTP start, order creation and payment verification | Public invocation for OTP; verified Appwrite user JWT for order/payment routes |

The project is on Appwrite's free plan. Free-plan limits, service availability, backups, and feature availability can change; confirm them in the Console. The current plan does not provide a production SLA or automatic backups.

## Project layout

| Path | Responsibility |
|---|---|
| `src/shared/lib/appwrite.ts` | Browser SDK setup, Function calls, checkout gate, and product-image URLs |
| `src/features/checkout/components/CheckoutDialog.tsx` | Email OTP and checkout UI |
| `src/features/storefront/data/catalog.ts` | Presentation catalog; keep IDs, names, prices, and image IDs aligned with Appwrite |
| `functions/storefront/src/main.js` | Server-side OTP, product/stock validation, order writes, and Razorpay verification |
| `functions/storefront/scripts/provision-database.mjs` | Idempotent schema, image, and inactive starter-product provisioning |
| `functions/storefront/scripts/provision-appwrite.ps1` | Hidden API-key prompt and environment cleanup |
| `.env.example` | Public browser configuration template; never put secrets here |

## Authentication and authorization

- Use Appwrite's native **six-digit email OTP**. Configure a verified sender and production email domain in **Auth** before relying on delivery.
- A guest enters an email and verifies the OTP. A new email creates a password-free Appwrite account. Orders require an authenticated Appwrite user JWT; the Function compares the verified account email with the checkout email.
- Enable only the authentication methods the store actually uses. Add the exact localhost and production hostnames as Appwrite Web platforms; do not use wildcard origins in production.
- The Function's server API key is private and limited to `users.read`, `databases.read`, and `databases.write`. Never send it to the browser. The provisioning key is a separate, short-lived key with only the required database and storage scopes; revoke it after provisioning.
- Appwrite row security must be enabled on both tables, with no broad table-level permissions. Public visitors must not be able to create, update, list private data, or delete rows.
- Product rows and product-image files may each have **read-only** `Role.any()` permissions. Order rows may only have `Permission.read(Role.user(userId))`; the Function's server key performs order writes.
- Do not add a public admin route or give customers Appwrite write permissions. For staff changes, use the Appwrite Console or a trusted server-side tool with a separately scoped, protected API key.

## Schema

Column keys are case-sensitive. The Function and provisioning script expect these names and types.

### `products`

| Column | Type | Required | Notes |
|---|---|---:|---|
| `sku` | varchar(64) | yes | Unique store SKU; add a uniqueness index before live catalog management |
| `name` | varchar(160) | yes | Customer-facing name |
| `description` | text | yes | Verified product details; do not use placeholder copy for live products |
| `category` | varchar(32) | yes | `ring`, `necklace`, `earring`, or `bracelet` |
| `priceInPaise` | integer | yes | Canonical INR price in paise; never trust a browser-supplied price |
| `currency` | varchar(3) | yes | `INR` |
| `stockQuantity` | integer | yes | Non-negative available units |
| `active` | boolean | yes | Keep false until listing, price, image, and inventory are verified |
| `imageFileId` | varchar(36) | yes | File ID in `product-images` |

### `orders`

| Column | Type | Required | Notes |
|---|---|---:|---|
| `userId` | varchar(36) | yes | Appwrite user ID |
| `email` | varchar(254) | yes | Verified account email |
| `status` | varchar(32) | yes | `placed_cod`, `pending_payment`, or `paid` in current code |
| `paymentMethod` | varchar(20) | yes | `cod` or `razorpay` |
| `amountInPaise` | integer | yes | Server-calculated order total |
| `currency` | varchar(3) | yes | `INR` |
| `itemsJson` | text | yes | Server-priced order line snapshot |
| `shippingAddressJson` | text | yes | Validated customer delivery details |
| `razorpayOrderId` | varchar(100) | yes | Empty string until provider order exists |
| `razorpayPaymentId` | varchar(100) | yes | Empty string until payment is captured and verified |
| `createdAt` | datetime | yes | ISO-8601 timestamp |

The function's order ID is the checkout idempotency key (at most 36 characters). Keep customer PII in the private `orders` table; never put it in product data, public logs, or the image bucket.

## Provisioning the database

The source-controlled script creates/checks the database, private tables, columns, image bucket, uploads existing WebP assets, and inserts starter product rows with `active: false` and `stockQuantity: 0`. It never overwrites existing catalog rows.

1. In Appwrite **API Keys**, create a short-lived provisioning key with only `databases.read`, `databases.write`, `storage.read`, and `storage.write`.
2. From the repository root, run `.\functions\storefront\scripts\provision-appwrite.ps1` and enter the key at the hidden prompt. Do not paste the key in chat, a command argument, `.env`, or source control.
3. Check that the script reports all columns as available and that the tables are private with row security enabled.
4. Revoke the provisioning key when done.

The project already has a `silveram-store` TablesDB database and `products`/`orders` tables. If using the authenticated Console terminal instead of the provisioner, create only missing columns; do not recreate or delete existing resources. The Console's **Columns** tab should show every schema column above as `Available`. The provisioning script is the source of truth for the exact schema.

## Safe day-to-day CRUD

### Product catalog

For a small team, use Appwrite Console → **Databases → TablesDB → silveram-store → products → Rows**. Create/edit rows there; upload the matching WebP to **Storage → product-images**. Give each published product row and image `read(Role.any())`, and no create/update/delete permissions for `Role.any()`. Verify ID, price, image, and stock, then set `active` to true. To delist, set `active` to false rather than deleting a product that may appear in an order.

For repeatable bulk catalog changes, use a local server-side script with the `node-appwrite` SDK already installed under `functions/storefront`. Keep its API key in a hidden prompt or secret manager, use a restricted key, and run it only from a trusted machine. A standard TablesDB row operation looks like:

```js
import { Client, Permission, Role, TablesDB } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const tables = new TablesDB(client);
const databaseId = 'silveram-store';
const tableId = 'products';

// Create; the key must be server-side. Public permission is read-only.
await tables.createRow(databaseId, tableId, 'your-stable-product-id', productData, [
  Permission.read(Role.any()),
]);

// Read/update/delete by row ID from a trusted server script:
const product = await tables.getRow(databaseId, tableId, 'your-stable-product-id');
await tables.updateRow(databaseId, tableId, product.$id, { active: false });
// Only delete when no historical order/report needs the catalog row.
```

Never use an API key in `VITE_*` variables, frontend code, browser storage, or a designer's client-side tool. Do not let a bulk update accidentally set `active: true` or positive stock on sample data. Test one row in a non-live environment first.

### Orders

Use the Console for authorized store operations and support review. Do not offer customer-facing CRUD on order rows: customers must not create, change amounts/statuses, or delete orders. The Function creates rows with owner-only reads; it writes payment status only after server-side Razorpay verification. Before staff-facing order editing is built, define staff identities, role assignment, audit trail, allowed status transitions, and refund/fulfillment workflows; never expose the Function API key to staff browsers.

## Function deployment and configuration

Create a Node.js 22 Appwrite Function from `functions/storefront` with entry point `src/main.js`. Install dependencies from `functions/storefront/package.json` (`npm install`). Allow unauthenticated Function execution only because `/auth/start` must send OTP to guests; the handler rejects unauthenticated order and payment requests.

Set these variables in the Function settings:

| Variable | Value |
|---|---|
| `APPWRITE_API_KEY` | Server-only API key with `users.read`, `databases.read`, `databases.write` |
| `APPWRITE_DATABASE_ID` | `silveram-store` |
| `APPWRITE_ORDERS_TABLE_ID` | `orders` |
| `APPWRITE_PRODUCTS_TABLE_ID` | `products` |
| `RAZORPAY_KEY_ID` | Razorpay key ID (not secret) |
| `RAZORPAY_KEY_SECRET` | Store as a secret |
| `STORE_LIVE_CHECKOUT` | Keep `false` until all launch blockers are fixed |

Appwrite injects `APPWRITE_FUNCTION_API_ENDPOINT` and `APPWRITE_FUNCTION_PROJECT_ID`. The Function checks the user's JWT, uses Appwrite product rows for authoritative price and availability, validates Indian delivery fields, checks idempotent order requests, and verifies both the Razorpay signature and captured payment before marking an order paid.

The current Function does **not** implement atomic stock reservations, email confirmations, webhook reconciliation, or staff/admin CRUD. Do not enable live checkout until those risks are addressed and tested.

## Frontend configuration

Set only public values in `.env.local` (ignored by Git). `.env.example` is the template:

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6ae2df98002eb5a1a39b
VITE_APPWRITE_STORE_FUNCTION_ID=<deployed-function-id>
VITE_APPWRITE_PRODUCT_IMAGES_READY=false
VITE_CHECKOUT_ENABLED=false
```

Set image readiness true only after confirming the product image bucket and files. Keep checkout disabled until the Function is deployed with secrets and the full launch checklist passes.

## Production launch checklist

- Use a staging Appwrite project and Razorpay test credentials to test sign-up, returning-user OTP, invalid/expired code, rate limits, COD, cancellation, duplicate submit, failed/captured payment, and browser-close recovery.
- Implement atomic stock reservation/decrement with expiry, payment-failure cleanup, and retry protection. Current stock checking alone can oversell under concurrent requests.
- Add and validate required database indexes, including unique `sku`; plan indexes for order lookups by user/date and payment provider IDs.
- Add payment webhooks and periodic reconciliation so browser-close/payment callback failures cannot strand paid orders.
- Configure real products, images, actual stock, shipping/tax rules, GST/invoice handling, delivery scope, returns/refunds, cancellation, COD policy, and approved privacy/terms copy.
- Add confirmation emails, staff order fulfillment, tracking, monitoring/alerts, API-key rotation, and a tested backup/export/restore plan.
- Configure exact production Web platform origins, sender/domain, rate limits, and minimal Function execution roles. Check Appwrite free-tier quotas and lack of automatic backups against actual business needs.
- Only after all above: test a full order and refund in staging, then deliberately enable `STORE_LIVE_CHECKOUT` and `VITE_CHECKOUT_ENABLED`.

This repository can prepare application code and database schema, but it cannot supply business/legal decisions, production domain/email verification, payment credentials, or operational guarantees. The current project is **not production-ready for real transactions** until the launch blockers above are completed.
