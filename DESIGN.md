---
name: Silveram
description: Midnight Silver design tokens and visual language for authentic 925 sterling silver jewellery
colors:
  brand-primary: "#182d49"
  brand-primary-hover: "#243f63"
  brand-primary-active: "#101f34"
  surface-primary: "#f8f7f4"
  surface-secondary: "#eeece7"
  surface-white: "#ffffff"
  text-primary: "#20232b"
  text-secondary: "#4a4f5c"
  text-muted: "#5e6471"
  accent-silver: "#a7adb5"
  border: "#d9dadc"
  border-strong: "#a7adb5"
  danger: "#9b2c2c"
typography:
  display:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "clamp(2.75rem, 7.5vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "clamp(1.375rem, 2.4vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0em"
  body-lg:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  caption:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  eyebrow:
    fontFamily: "League Spartan Variable, League Spartan, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.22em"
rounded:
  sm: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.surface-primary}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.brand-primary-hover}"
    textColor: "{colors.surface-primary}"
    rounded: "{rounded.sm}"
  field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: Midnight Silver

## Overview

Silveram's design language couples the restrained sophistication of fine jewellery with dynamic, youth-centric energy and kinetic motion. The palette is centered around deep **Midnight Navy** (`#182d49`), soft warm **Ivory** (`#f8f7f4`), and refined **Sterling Silver** accents (`#a7adb5`). Sharp, architectural 2px corners and geometric typography give the brand a modern, editorial silhouette distinct from both generic e-commerce templates and traditional bridal gold portals.

## Colors

The palette is strictly intentional and restrained. Contrast is achieved through light and dark blocks rather than multi-color saturation.

- **Brand & Primary Interactive**:
  - `brand-primary` (`#182d49`): Deep Midnight Navy. The anchor of all primary actions, key headlines, and dark showcase sections.
  - `brand-primary-hover` (`#243f63`): Elevated navy on hover.
  - `brand-primary-active` (`#101f34`): Compressed navy for active/pressed states.
- **Surfaces**:
  - `surface-primary` (`#f8f7f4`): Warm Ivory background, softening pure white glare.
  - `surface-secondary` (`#eeece7`): Soft Stone for contrast cards, filter bars, and alternating section bands.
  - `surface-white` (`#ffffff`): Pure white reserved for product image stages, modal sheets, and form fields.
- **Text & Editorial**:
  - `text-primary` (`#20232b`): Near-black charcoal for primary readability.
  - `text-secondary` (`#4a4f5c`): Medium charcoal for secondary descriptions and specs.
  - `text-muted` (`#5e6471`): Subtle gray for timestamps, breadcrumbs, and disabled states.
- **Accents & Metals**:
  - `accent-silver` (`#a7adb5`): Sterling silver tone used for refined dividers, subtle borders, and specular highlight simulations.
  - `border` (`#d9dadc`): Soft neutral container outline.
  - `border-strong` (`#a7adb5`): High-definition boundary line.
- **Feedback**:
  - `danger` (`#9b2c2c`): Reserved exclusively for errors and stock depletion alerts. Never used decoratively.

## Typography

A single font family—**League Spartan**—powers the entire interface across display, body, and UI controls. Its clean geometric sans-serif geometry provides both bold editorial punch in headings and crisp, readable micro-copy.

- **Display & Headings**:
  - `type-display`: `clamp(2.75rem, 7.5vw, 5rem)`, weight 500, line-height 1.02, letter-spacing `-0.02em`. Used for editorial hero statements.
  - `type-h1`: `clamp(2.25rem, 5.5vw, 3.75rem)`, weight 500, line-height 1.05. Primary page banners.
  - `type-h2`: `clamp(1.875rem, 4vw, 3rem)`, weight 500, line-height 1.1. Section headings.
  - `type-h3`: `clamp(1.375rem, 2.4vw, 2rem)`, weight 500, line-height 1.2. Product titles and card headers.
- **Body & Controls**:
  - `type-body-lg`: `1.125rem`, line-height 1.6, weight 400. Introductory paragraphs and lead copy.
  - `type-body`: `1rem`, line-height 1.65, weight 400. Descriptions, product details, specs.
  - `type-caption`: `0.8125rem`, line-height 1.5, weight 400. Disclaimers, dimensions, delivery notices.
  - `type-eyebrow`: `0.75rem`, weight 600, letter-spacing `0.22em`, uppercase. Category markers and section badges.

## Layout

- **Page Container**: Max-width `80rem` (1280px) centered with responsive padding (`1.25rem` mobile, `2.5rem` desktop).
- **Rhythm & Sections**: Section padding alternates consistently with `4rem` (mobile) to `6rem` (desktop) vertical breathing room (`.section-pad`).
- **Product Grids**:
  - Mobile: Single or 2-column compact grid with tap-friendly touch targets.
  - Tablet/Desktop: 3-column asymmetric or balanced showcase grid.
- **Navigation & Sticky Shells**: Fixed top banner with announcement ribbon and quick-access Cart drawer.

## Elevation & Depth

- **Flat & Precise**: Avoid generic muddy drop-shadows. Elevation is conveyed primarily through high-contrast boundary borders (`border` and `border-strong`) and crisp surface tint shifts.
- **Silver Lighting (`.silver-light`)**: Subtle radial metallic silver illuminations on navy backgrounds simulating specular reflections on polished silver.
- **Overlays**: Soft darkened backdrop blur (`backdrop-blur-sm bg-black/40`) for the cart drawer and authentication dialogs.

## Shapes

- **Corner Radii**: Strictly sharp and architectural (`2px` / `--radius-sm`).
- **No Pill Buttons**: Buttons and input fields maintain straight, disciplined edges to evoke the precision of cut metals.

## Components

- **Buttons**:
  - Primary: Midnight Navy background with Ivory text, sharp 2px corners, uppercase or tracking typography, expanding smoothly on hover (`--color-brand-primary-hover`).
  - Secondary/Outline: Transparent background with `border-strong` border and charcoal text.
  - WhatsApp CTA: Bold button featuring brand contrast with green badge icon accent or WhatsApp logo.
- **Product Card**:
  - Clean photographic stage with aspect ratio 1:1 or 4:5.
  - Hover reveals secondary angle or gentle scale with GSAP kinetic polish.
  - Price rendered prominently in INR (`₹`) with purity badge ("925 Silver").
- **Cart Drawer**:
  - Slide-over panel anchored to the right viewport edge.
  - Line-item breakdown with quantity adjusters, subtotal, and dual checkout actions (Instant WhatsApp Order vs. Direct Checkout).
- **Form Fields (`.field`)**:
  - Clean white background, 1px border (`border-strong`), crisp focus ring with 2px solid Midnight Navy.

## Do's and Don'ts

### Do
- Pair rich photography of polished silver against clean Ivory or deep Midnight Navy.
- Maintain League Spartan across all UI levels to preserve typographic harmony.
- Keep micro-interactions snappy, tactile, and purposeful using GSAP.
- Make metal purity (925 sterling silver) immediately clear on every product representation.

### Don't
- Don't use generic purple/blue gradients or neon aesthetic accents.
- Don't use round pill buttons or bubbly curved cards (`rounded-2xl`, `rounded-full`).
- Don't bury WhatsApp order actions or force mandatory account creation before browsing.
- Don't clutter product gallery viewports with aggressive discount badges or faux timers.

