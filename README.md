# Lusiant

Custom e-commerce storefront for Lusiant, a porcelain-inspired denim brand. Built as a full replacement for their Shopify store with a bespoke admin panel and a signature self-drawing floral hero animation.

**Live:** [lusiant.vercel.app](https://lusiant.vercel.app)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Database / Auth | Supabase (PostgreSQL + Row-Level Security) |
| Payments | Stripe (Embedded Checkout + Webhooks) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Deploy | Vercel |

---

## Features

### Store
- Product grid with collection filters, search, and sold-out toggle
- Per-size inventory tracking — sold-out sizes are greyed out on the PDP and in the grid
- Size availability chips shown directly on product cards
- Cart drawer with quantity controls and stock enforcement
- Stripe Embedded Checkout with shipping calculation (flat rate, free threshold, oversize surcharge)
- Order confirmation page with itemized receipt and shipping address
- Customer accounts with order history (email/password + Google OAuth popup)
- Newsletter + phone signup stored in Supabase
- Policy pages (returns, privacy, shipping, terms) with DB override support
- Mobile-responsive with sticky add-to-cart bar and inline nav search

### Admin (`/admin`)
- Product CRUD: name, slug, description, pricing, compare-at price, images, collection, sizes with per-size stock quantities, shipping class
- Order management with status workflow (pending → paid → shipped → delivered → cancelled)
- Site settings: hero banner, announcement bar, shipping rates, live-orders toggle
- Lookbook and community gallery management
- Image upload to Supabase Storage

### Animations
- **Self-drawing porcelain floral hero** — build-time pipeline (`npm run porcelain`) renders the source `.ai` artwork via mupdf, traces contours with potrace, chunks and sorts them center-outward, then animates each chunk's `stroke-dashoffset` via a `requestAnimationFrame` loop. A fills layer (original art with outline strips removed) reveals behind with a clip-path wipe.
- **WebGL ink field** — Three.js shader on the `/lab` page

### Brand identity pipeline
- `npm run logo` — isolates the blossom mark from the logo `.ai` via flood-fill and connected-component labeling, vectorizes it with potrace into an adaptive `icon.svg` (black on light tabs, white on dark via `prefers-color-scheme`), and extracts the wordmark as a CSS-masked nav logo that tints with `currentColor`.

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database

Run `supabase/schema.sql` in the Supabase SQL editor. This creates all tables, RLS policies, and default settings. If upgrading an existing project, run the v2 migration block at the bottom of the file (adds `size_inventory` and `shipping_class` columns).

### 4. Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Dev server

```bash
npm run dev
```

---

## Asset Pipelines

### Porcelain animation

```bash
npm run porcelain
```

Reads the source `.ai` file from `D:\Downloads\Lusiant Assets\For Gabe\ai files\`, outputs:
- `public/porcelain-trace.svg` — 376 center-ordered SVG contour chunks
- `public/porcelain-fills.png` — original shading with outline strips removed

### Logo / favicon

```bash
npm run logo
```

Outputs:
- `src/app/icon.svg` — adaptive SVG favicon
- `src/app/favicon.ico` + `src/app/apple-icon.png`
- `public/logo-wordmark.png` — CSS-masked nav wordmark

---

## Auth

- Email/password via Supabase Auth
- Google OAuth via popup flow — configure in Supabase Dashboard → Authentication → Providers → Google
- Supabase Site URL must be set to the production domain in Authentication → URL Configuration

---

## Deployment

Deploys automatically to Vercel on push to `Main`. Set all env vars in the Vercel project settings. Point the Stripe webhook to `https://lusiant.vercel.app/api/webhooks/stripe`.

---

## Project Structure

```
src/
  app/
    (store)/          # Public storefront
    admin/            # Admin panel (auth-gated)
    api/              # checkout + stripe webhook
    auth/             # OAuth callback + popup-close
  components/
    store/            # Navbar, Cart, ProductCard, PorcelainBackdrop, …
    admin/            # ProductForm, ImageUpload, Sidebar
    lab/              # InkField (Three.js)
  lib/
    types.ts          # Shared TypeScript interfaces
    shipping.ts       # Shipping calculation utility
    site-content.ts   # Server-side settings fetchers
    stripe.ts         # Stripe client singleton
    supabase/         # Browser + server Supabase clients
supabase/
  schema.sql          # Full DB schema + RLS policies
scripts/
  gen-porcelain-art.mjs
  gen-porcelain-layers.mjs
  gen-logo.mjs
```
