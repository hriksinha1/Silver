# Silveram Appwrite setup (free-tier deployment)

The storefront is configured for India (INR), Appwrite's native six-digit email OTP, Razorpay, and cash on delivery. The browser never receives an Appwrite API key or Razorpay secret. Product prices and payment verification are enforced by the Appwrite Function.

## 1. Create the Appwrite project

The project identifiers you shared are configured locally in the ignored `.env.local` file and in `.env.example`:

- Project ID: `6ae2df98002eb5a1a39b`
- Endpoint: `https://sgp.cloud.appwrite.io/v1`

1. In **Platforms**, add `http://localhost:3000` and the exact production website hostname to project `6ae2df98002eb5a1a39b`.
2. In **Auth > Settings**, enable email/passwordless email OTP and configure a verified sender/domain and email template. Appwrite's native email OTP is six digits; this project uses that native flow. Guest checkout creates a password-free Appwrite account when the email is new.
3. Configure the project's allowed origins to include the deployed website. Do not use wildcard origins for production.
4. Confirm the free plan currently includes the Function runtime, email OTP, storage and database quotas needed for your expected traffic. Appwrite plan limits can change; monitor usage and email delivery before launch.

## 2. Provision database, catalog, and product photos

The repository includes an idempotent provisioning script. It creates database `silveram-store`, the private `orders` collection, a `products` collection, and the `product-images` storage bucket. It uploads the five existing product photos and creates matching starter product records. Starter product records are deliberately **inactive and have zero stock**, so sample products cannot be sold accidentally.

Create a short-lived Appwrite server API key with `databases.read`, `databases.write`, `storage.read`, and `storage.write` scopes. From the repository root, run the secure-prompt helper. It keeps the key out of command history and removes it from the process environment after provisioning:

```powershell
.\functions\storefront\scripts\provision-appwrite.ps1
```

Enter the key when PowerShell prompts; it is not shown as you type. If local execution policy blocks this script, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\functions\storefront\scripts\provision-appwrite.ps1` from the repository root.

The script waits for all attributes to become available, uploads images with public-read-only permissions, and adds product records with individual public-read permissions. Collections and the bucket do not have broad permissions. It will not overwrite existing product records or accept an existing collection/bucket with unsafe permissions. It prints resource IDs for Function configuration. No API key has been provided to this environment, so remote resources have **not** yet been created.

### `orders` collection

| Attribute | Type | Required | Size / notes |
|---|---|---:|---|
| `userId` | String | yes | 36 |
| `email` | String | yes | 254 |
| `status` | String | yes | 32; values include `placed_cod`, `pending_payment`, `paid` |
| `paymentMethod` | String | yes | 20; `cod` or `razorpay` |
| `amountInPaise` | Integer | yes | INR amount in paise |
| `currency` | String | yes | 3; `INR` |
| `itemsJson` | String | yes | 10,000; server-priced order lines |
| `shippingAddressJson` | String | yes | 2,000 |
| `razorpayOrderId` | String | yes | 100; allow empty string |
| `razorpayPaymentId` | String | yes | 100; allow empty string |
| `createdAt` | Datetime | yes | ISO-8601 |

Do not grant public create, update, or delete access to orders. The Function writes documents with read permission limited to the owning user; order/payment writes use its server API key.

### `products` collection

| Attribute | Type | Required | Size / notes |
|---|---|---:|---|
| `sku` | String | yes | 64 |
| `name` | String | yes | 160 |
| `description` | String | yes | 2,000 |
| `category` | String | yes | 32 |
| `priceInPaise` | Integer | yes | Canonical INR price in paise |
| `currency` | String | yes | 3; `INR` |
| `stockQuantity` | Integer | yes | Set actual inventory before launch |
| `active` | Boolean | yes | Keep false until verified for sale |
| `imageFileId` | String | yes | 36; file in product image bucket |

Product documents and image files are publicly readable; only the backend API key should write them. Never put customer information or private order images in this bucket.

## 3. Deploy the storefront Function

Create a Node.js 22 Function named `silveram-storefront-api`, using `functions/storefront/src/main.js` as its entrypoint and `npm install` as its install/build command. Set its execution permission to allow `Any` so a guest can request an email code; the function itself requires a verified Appwrite user JWT for every order and payment route.

Set these Function variables/secrets in Appwrite (never add the API key or Razorpay secret to `.env` or browser variables):

| Variable | Value |
|---|---|
| `APPWRITE_API_KEY` | Server API key with only `users.read`, `databases.read`, and `databases.write` scopes |
| `APPWRITE_DATABASE_ID` | ID of the database created above |
| `APPWRITE_ORDERS_COLLECTION_ID` | ID of the `orders` collection |
| `APPWRITE_PRODUCTS_COLLECTION_ID` | ID of the `products` collection |
| `RAZORPAY_KEY_ID` | Razorpay key ID (not secret) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret; store as a secret |
| `STORE_LIVE_CHECKOUT` | Keep `false` until staging and launch checks pass; set to `true` deliberately to enable Function routes |

Appwrite injects `APPWRITE_FUNCTION_API_ENDPOINT` and `APPWRITE_FUNCTION_PROJECT_ID` into Functions. The Function checks authenticated calls with the Appwrite user JWT, validates every submitted field, reads current prices and stock from the Appwrite products collection, applies order-request idempotency, and verifies Razorpay signatures and captured payment status before marking an order paid.

The local provisioning API key and Function runtime API key should be separate. The Function key needs `users.read`, `databases.read`, and `databases.write`; it does not need storage write access.

## 4. Configure Razorpay

1. Activate the Razorpay account for the business and enable INR payments.
2. Add the Razorpay key ID and secret to the Function variables. Test with Razorpay test credentials first; switch to live credentials only after a complete test purchase and refund.
3. Enable automatic capture in Razorpay. The server deliberately does not mark merely-authorized payments as paid.
4. Configure Razorpay's payment-failure/refund handling and a webhook/reconciliation process before accepting live payments. The browser callback is verified server-side, but it cannot reconcile a customer who closes the browser before the callback completes.

Cash on delivery is available without Razorpay credentials. It does not collect payment online.

## 5. Configure the frontend

Copy `.env.example` to `.env.local` and set:

```env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6ae2df98002eb5a1a39b
VITE_APPWRITE_STORE_FUNCTION_ID=<deployed-function-id>
VITE_APPWRITE_PRODUCT_IMAGES_READY=false
VITE_CHECKOUT_ENABLED=false
```

The endpoint and project ID are public identifiers; API keys and payment secrets are not. Set `VITE_APPWRITE_PRODUCT_IMAGES_READY=true` only after the image bucket has been provisioned and populated. Keep checkout disabled until the backend is configured. For staging, use Razorpay test credentials, enable `STORE_LIVE_CHECKOUT` only after inventory controls are implemented, set `VITE_CHECKOUT_ENABLED=true` and redeploy.

## 6. Before accepting real orders

- Replace the sample catalog entries and photos with real products. Keep the storefront cards in `src/features/storefront/data/catalog.ts` synchronized with Appwrite product records; the Function uses Appwrite as the authoritative price, active-status, and stock source. Verify all amounts are INR and GST treatment is settled.
- Implement atomic stock reservation/decrement and reservation expiry. The current Function checks stock but does not reserve or decrement it, so simultaneous orders can oversell. Do not enable live checkout until this is addressed.
- Confirm GST treatment, invoices, shipping charges/eligibility, delivery coverage, COD availability, cancellation/return/refund rules, and the legal/privacy text for the actual business. The current storefront content is not legal advice or a substitute for approved policies.
- Add a real order confirmation email, fulfillment/admin workflow, shipping tracking, and operational monitoring. The current UI only displays the order reference; it does not send an order confirmation email.
- Test signup, returning-user OTP, invalid/expired code, rate limits, COD, payment cancellation, duplicate submit, failed payment, successful captured payment, and browser-close recovery in a staging project.
- Set Appwrite and Razorpay usage alerts, restrict the deployed Function API key to the listed scopes, rotate secrets if exposed, and verify database backups/retention. Free-tier quotas and availability are not a production SLA.

The repository can prepare these resources and workflows, but it cannot create resources in a private Appwrite project or verify the production domain, sender, payment account, tax rules, or live credentials. The store should remain in test mode until those account-specific steps and end-to-end checks are complete.
