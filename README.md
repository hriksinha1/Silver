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
npm --prefix server install
npm run dev
npm run dev:server
npm run lint
npm run build
npm run preview
```

`server/.env` is configured for the local Atlas development cluster. It is Git-ignored and ACL-restricted to the current Windows user; never commit, share, or overwrite it. For another environment, use that host's secret manager.

`npm run build` type-checks the project before creating the production bundle in `dist/`.

## Storefront and backend status

The checkout calls a separate Node.js API backed by MongoDB. Email OTP, secure cookie sessions, server-priced orders, transactional inventory reservations, Razorpay verification, webhook reconciliation, and allowlisted admin CRUD live in `server/`.

The database structure, Atlas setup, collections/indexes, admin operations, API routes, secrets, and launch checklist are documented in [docs/MONGODB_SETUP.md](./docs/MONGODB_SETUP.md).

The current Atlas free cluster is for development/testing only—not a production workload. Checkout remains deliberately disabled until a production-capable Atlas tier and backups, verified SMTP, the admin allowlist, Razorpay credentials/webhook, production origins, and approved business policies are configured and tested. Keep secrets in the ignored local `server/.env` and in your host's secret manager in production.

## Assets

The image manifest is maintained in `src/shared/data/images.ts`. Referenced image files live in `public/images/`. `SafeImage` displays a branded fallback when an image cannot load.

## Deployment

The app can be deployed as a static Vite site. Use:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `^20.19.0` or `>=22.12.0`
- The API in `server/` must also be deployed as a long-running Node.js service and routed at `/api`.
