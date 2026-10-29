# Silveram Storefront

A responsive jewellery storefront demonstration built with React, TypeScript, Vite, Tailwind CSS v4, and GSAP.

## Project structure

```text
src/
  app/                 Application composition and page-level state
  features/
    cart/              Cart state and cart drawer
    policies/          Policy dialog
    storefront/
      components/      Landing-page sections
      data/            Product catalog and editorial content
  shared/
    data/              Shared image manifest
    ui/                Reusable controls, icons, and image fallback
  styles/              Global styles and design tokens
  main.tsx             Browser entry point
```

Feature-specific code belongs in its feature folder. Reusable UI and static resources belong in `shared`. The `@/` import alias points to `src/`.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

`npm run build` type-checks the project before creating the production bundle in `dist/`.

## Storefront and backend status

The storefront includes a checkout interface and an Appwrite Function integration for six-digit email OTP, order creation, and Razorpay verification. Appwrite's free plan uses TablesDB Serverless for the `products` and `orders` tables. Checkout is intentionally disabled until the Function is deployed and the remaining production controls are implemented and tested.

The backend resource map, authentication/permissions model, product CRUD workflow, provisioning steps, schema, Function configuration, and production blockers are documented in [docs/APPWRITE_SETUP.md](./docs/APPWRITE_SETUP.md).

Important launch constraints:

- The Appwrite product table is authoritative for server-side prices and availability. Keep its rows aligned with the presentation catalog in `src/features/storefront/data/catalog.ts`.
- Product and order changes are not public CRUD operations. Use Appwrite Console or a trusted server-side tool with a restricted API key; never put API keys or payment secrets in frontend code or `VITE_*` variables.
- Inventory is checked but not atomically reserved, so concurrent orders may oversell. Do not enable live checkout until reservations, payment reconciliation, policies, and operational processes are complete.
- Newsletter signup, testimonials, product copy, policy text, contact details, stock, and prices still require real business data and review.

## Assets

The image manifest is maintained in `src/shared/data/images.ts`. Referenced image files live in `public/images/`. `SafeImage` displays a branded fallback when an image cannot load.

## Deployment

The app can be deployed as a static Vite site. Use:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `^20.19.0` or `>=22.12.0`
