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

## Demo behavior and production integration

This repository is a frontend demonstration, not a complete commerce backend:

- Cart state is stored in the browser; checkout does not process payments.
- Newsletter signup validates locally and does not transmit or store addresses.
- Product and testimonial content is illustrative.
- Replace example policy text, contact addresses, and social links before launch.

Before using this as a live storefront, connect trusted server-side services for product and inventory data, customer accounts, order processing, payment, newsletter delivery, and policy content. Validate all inputs and prices on the server; do not treat browser state as authoritative.

## Assets

The image manifest is maintained in `src/shared/data/images.ts`. Referenced image files live in `public/images/`. `SafeImage` displays a branded fallback when an image cannot load.

## Deployment

The app can be deployed as a static Vite site. Use:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `^20.19.0` or `>=22.12.0`
