# Silveram Appwrite setup (free-tier deployment)

The storefront is configured for India (INR), Appwrite's native six-digit email OTP, Razorpay, and cash on delivery. The browser never receives an Appwrite API key or Razorpay secret. Product prices and payment verification are enforced by the Appwrite Function.

## 1. Create the Appwrite project

1. Create a project in Appwrite Cloud and select a region close to your customers.
2. In **Platforms**, add your local web origin (for example `http://localhost:3000`) and the exact production website hostname.
3. In **Auth > Settings**, enable email/passwordless email OTP and configure a verified sender/domain and email template. Appwrite's native email OTP is six digits; this project uses that native flow.
4. Confirm the free plan currently includes the Function runtime, email OTP, and the quotas needed for your expected traffic. Appwrite plan limits can change; monitor usage and email delivery before launch.

## 2. Create the orders database

Create a database and an `orders` collection. Use these IDs in the Function environment variables.

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

Do not grant public create, update, or delete access to this collection. The Function writes documents with read permission limited to the owning user; all checkout writes and payment status updates use its server API key. No client-side collection permissions are needed for checkout.

## 3. Deploy the storefront Function

Create a Node.js 22 Function named `silveram-storefront-api`, using `functions/storefront/src/main.js` as its entrypoint and `npm install` as its install/build command. Set its execution permission to allow `Any` so a guest can request an email code; the function itself requires a verified Appwrite user JWT for every order and payment route.

Set these Function variables/secrets in Appwrite (never add the API key or Razorpay secret to `.env` or browser variables):

| Variable | Value |
|---|---|
| `APPWRITE_API_KEY` | Server API key with only `users.read`, `databases.read`, and `databases.write` scopes |
| `APPWRITE_DATABASE_ID` | ID of the database created above |
| `APPWRITE_ORDERS_COLLECTION_ID` | ID of the `orders` collection |
| `RAZORPAY_KEY_ID` | Razorpay key ID (not secret) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret; store as a secret |

Appwrite injects `APPWRITE_FUNCTION_API_ENDPOINT` and `APPWRITE_FUNCTION_PROJECT_ID` into Functions. The Function checks authenticated calls with the Appwrite user JWT, validates every submitted field, rebuilds totals from its own allow-listed catalog, applies order-request idempotency, and verifies Razorpay signatures and captured payment status before marking an order paid.

## 4. Configure Razorpay

1. Activate the Razorpay account for the business and enable INR payments.
2. Add the Razorpay key ID and secret to the Function variables. Test with Razorpay test credentials first; switch to live credentials only after a complete test purchase and refund.
3. Enable automatic capture in Razorpay. The server deliberately does not mark merely-authorized payments as paid.
4. Configure Razorpay's payment-failure/refund handling and a webhook/reconciliation process before accepting live payments. The browser callback is verified server-side, but it cannot reconcile a customer who closes the browser before the callback completes.

Cash on delivery is available without Razorpay credentials. It does not collect payment online.

## 5. Configure the frontend

Copy `.env.example` to `.env.local` and set:

```env
VITE_APPWRITE_ENDPOINT=https://<your-region>.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<your-project-id>
VITE_APPWRITE_STORE_FUNCTION_ID=<deployed-function-id>
```

Only these public project identifiers belong in the frontend. Redeploy the frontend after changing them.

## 6. Before accepting real orders

- Replace the sample product catalog and prices in both `src/features/storefront/data/catalog.ts` and `functions/storefront/src/main.js`. The Function catalog is authoritative. Add stock reservation and refund reconciliation before promising inventory.
- Confirm GST treatment, invoices, shipping charges/eligibility, delivery coverage, COD availability, cancellation/return/refund rules, and the legal/privacy text for the actual business. The current storefront content is not legal advice or a substitute for approved policies.
- Add a real order confirmation email, fulfillment/admin workflow, shipping tracking, and operational monitoring.
- Test signup, returning-user OTP, invalid/expired code, rate limits, COD, payment cancellation, duplicate submit, failed payment, successful captured payment, and browser-close recovery in a staging project.
- Set Appwrite and Razorpay usage alerts, restrict the deployed Function API key to the listed scopes, rotate secrets if exposed, and verify database backups/retention. Free-tier quotas and availability are not a production SLA.

The repository can prepare these resources and workflows, but it cannot create resources in a private Appwrite project or verify the production domain, sender, payment account, tax rules, or live credentials. The store should remain in test mode until those account-specific steps and end-to-end checks are complete.
