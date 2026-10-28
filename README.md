# Aurelia — Luxury Jewellery Landing Page

A complete, production-ready, accessible, and responsive landing page for "Aurelia", a luxury jewellery e-commerce brand. Built with React, Vite, Tailwind CSS v4, and GSAP.

## Project Overview

- **Aesthetic Direction**: Deep aubergine hero (`#26102C`) with subtle silk-like sheen, purple page frame (`#5F496E`), seamless light-grey content flow (`#EFEFEF`), crisp white testimonials band, and inset white card footer.
- **Typography**: Geometric display headings in League Spartan (`@fontsource-variable/league-spartan`) and refined body typography in DM Sans (`@fontsource-variable/dm-sans`).
- **Brand Motifs**: Inline gold ring symbol in the hero headline, hand-written SVG icons, and precise near-square (`2px`) radius discipline.
- **Restrained Motion**: GSAP and ScrollTrigger animations with automatic degradation for users with `prefers-reduced-motion: reduce`.
- **Accessibility**: Semantic HTML5 landmarks (`header`, `nav`, `main`, `section`, `article`, `footer`), WAI-ARIA live regions, accessible accordion keyboard interactions, focus traps, and WCAG AA contrast compliance.

## Front-End Demonstration Notice

All behavior in this project is strictly client-side demonstration behavior:
- Cart interactions persist across sessions via client-side storage without processing financial transactions.
- Product listings, demonstration pricing, and checkout notifications are interactive showcase models.
- Newsletter subscriptions validate user inputs client-side and display a confirmation status without external server transmission.
- Testimonial quotes and customer profiles represent illustrative demonstration content.

## Image Manifest & Asset Slots

All visual media assets are managed through `src/data/images.ts` and loaded from `/public/images/`. A resilient `<SafeImage>` component provides instant fallback to brand-aligned tonal gradients with SVG jewelry iconography if an asset fails to load.

| Filename | Description | Slot / Section | Dimensions |
|---|---|---|---|
| `hero-model.webp` | Smiling woman in lavender open shirt with gold chain | Hero stage visual anchor | 620 × 760 |
| `hero-ring-box.webp` | Open white jewelry box with gold diamond ring | Hero right panel feature | 260 × 260 |
| `cat-rings.webp` | Diamond band ring cut-out | Shop by Category — Rings | 280 × 280 |
| `cat-necklaces.webp` | Floral pendant necklace cut-out | Shop by Category — Necklaces | 280 × 280 |
| `cat-bracelets.webp` | Layered gold bracelets cut-out | Shop by Category — Bracelets | 340 × 280 |
| `cat-earrings.webp` | Polished gold hoop earrings cut-out | Shop by Category — Earrings | 280 × 280 |
| `craft.webp` | Gold & pearl earring on textured ceramic surface | Timeless Craftsmanship | 790 × 615 |
| `product-ring.webp` | Celeste Diamond Ring worn on hand | Best Sellers ($249) | 386 × 386 |
| `product-necklace.webp` | Minimal Diamond Necklace on collarbone | Best Sellers ($199) | 386 × 386 |
| `product-earring.webp` | Floral Pattern Earring with enamel detail | Best Sellers ($149) | 386 × 386 |
| `product-bracelet.webp` | Solis Charm Bracelet on wrist | Best Sellers ($189) | 386 × 386 |
| `why-portrait.webp` | Model wearing Aurelia earrings & bracelet | Why Choose Aurelia | 790 × 740 |
| `avatar-1.webp` | Sophia M. circular portrait | Loved by Our Customers | 96 × 96 |
| `avatar-2.webp` | Emma L. circular portrait | Loved by Our Customers | 96 × 96 |
| `avatar-3.webp` | Olivia R. circular portrait | Loved by Our Customers | 96 × 96 |

## Local Development & Build

### Prerequisites
- Node.js 18+
- npm or pnpm

### Commands

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Compile TypeScript and build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment Instructions (Vercel)

This application can be deployed directly to Vercel without environment variables or complex configuration:

1. Import the repository in your Vercel Dashboard.
2. Select the **Vite** framework preset (or let Vercel auto-detect).
3. Verify the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**.

## Libraries & Third-Party Components

- **Aceternity UI**: Evaluated against the luxury design brief. As permitted in the specification, external glowing and 3D effects were skipped in favor of custom bespoke GSAP transitions and lightweight inline SVGs to maintain strict aesthetic fidelity with the reference design.
- **GSAP 3.12**: For performant compositor-only animations and ScrollTrigger reveals.
- **Tailwind CSS v4**: Theme tokens defined via `@theme` in `src/index.css`.
