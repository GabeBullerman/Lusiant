@AGENTS.md

# Lusiant — project guide

Custom e-commerce site for the denim brand **Lusiant**, rebuilt to replicate their Shopify store (lusiant.co) with an equally easy admin. Personal/portfolio project for now; may go live if the friend prefers it to his Shopify.

## Stack & deploy

- **Next.js 16.2.7** (App Router) · **React 19** · **Tailwind v4** (no config; `@import "tailwindcss"` in `globals.css`)
- **Supabase** (Postgres + Auth + Storage) · **Stripe** (embedded checkout) · **Three.js** (experimental `/lab`)
- Repo: `GabeBullerman/Lusiant`, branch **`Main`** (capital M). Local: `C:\Users\gabeb\Desktop\Lusiant`
- **Deploy = push to `Main`** → Vercel auto-builds (~30–60s). Verify live with a cache-bust query (`?t=2`) since deploys lag a few seconds.
- Live: `lusiant.vercel.app` (no custom domain yet).

## Working conventions (important)

- **Do NOT add a `Co-Authored-By: Claude` trailer to commits.** History was scrubbed of it; keep it off.
- **Always `npx next build` before pushing** — catches type errors (Vercel build will fail otherwise).
- Commit in logical batches; push deploys immediately.
- **Next.js 16 specifics:** middleware lives in `src/proxy.ts` and exports `proxy` (not `middleware`). `params` and `searchParams` are **Promises** — `await` them. Use `dynamic(() => …, { ssr: false })` for Three.js. `next.config.ts` `images.remotePatterns` allows `**.supabase.co`, `cdn.shopify.com`, `lusiant.co/cdn/**`; `images.qualities` whitelists `[60,70,75]`.

## Architecture

- `src/app/(store)/` — public storefront: `page.tsx` (hero + best sellers + community), `shop` (+ `[slug]` PDP, `ShopSearch`), `lookbook`, `account` (login/register/page), `checkout`, `contact`, `policies/[slug]`, `order/success`.
- `src/app/admin/` — admin panel: `products` (+ filters, `[id]`, `new`), `orders` (+ filters/search/date), `lookbook`, `community`, `settings`. Sidebar in `components/admin/Sidebar.tsx`.
- `src/app/login` — **admin** login. `src/app/lab` — Three.js experiments (unlisted).
- `src/components/store/` — Navbar, Footer, CartContext (localStorage-persisted), CartSlider, ProductCard, LookbookCarousel (reused for Community), Newsletter, ClubTab, Reveal (scroll-in), PaymentIcons.
- `src/lib/` — `supabase/{server,client}.ts`, `collections.ts`, `site-content.ts` (community + policy overrides + store mode), `policy-content.ts` (default policy text), `blur.ts` (image placeholder), `types.ts`, `stripe.ts` (lazy `getStripe()`, apiVersion `2026-05-27.dahlia`).

## Data model (Supabase, ref `gqmnhvsinjiygipajgrz`)

- **products** — name, slug, description, price, compare_at_price, `category` (= **collection**, drives Shop dropdown/filters), sizes[], images[], is_active (false = Sold Out), is_featured (= Best Sellers), stock_quantity.
- **orders** — stripe_session_id, customer_email/name, items(jsonb), total, status, shipping_address. Inserted by the Stripe webhook.
- **site_settings** — key/value(jsonb). Keys: `hero`, `announcement`, `lookbook` (`[{title,images[]}]` sections), `community` (`string[]`), `store_mode` (`{orders_enabled}`), `policy_<slug>` (`{title,paragraphs}` overrides).
- **subscribers** — newsletter (email/phone). Insert open; read admin-only.
- **admins** — email allowlist. `public.is_admin()` (SECURITY DEFINER) checks `auth.email()` against it.

### Auth & RLS model
- One Supabase Auth pool for **both** admin and customers. **Admin = email in `admins` table.**
- `proxy.ts` gates `/admin` via `supabase.rpc('is_admin')`, protects `/account`, redirects on `/login`.
- RLS: public read products/site_settings; **writes admin-only** via `is_admin()`; customers read **own** orders (`auth.email() = customer_email`); storage writes admin-only.
- **Security-/data-changing SQL is blocked by the safety classifier** — hand the SQL to the user to run in the Supabase SQL editor.

## Store mode (checkout)
- `store_mode.orders_enabled` (default **false** = demo). Toggle in Admin → Site Settings.
- **Demo:** `/checkout` renders the real layout with the form **disabled** + a "demonstration storefront" notice; `/api/checkout` 403s. No payment possible.
- **Enabled:** mounts **Stripe Embedded Checkout** (`ui_mode: 'embedded_page'`, returns `client_secret`) — stays on-site, never redirects to checkout.stripe.com. `STRIPE_WEBHOOK_SECRET` is set on Vercel.

## What's built
Storefront (hero, best sellers, community carousel, lookbook carousels by season, shop w/ collection + sold-out filters + search, PDP w/ mobile sticky add-to-cart), cart (persisted) + slider, demo/embedded checkout, customer accounts + order history, policies, contact (mailto contact@lusiant.co), newsletter + Club Members popup, image blur-up, scroll-in reveals, Vercel Analytics, polished 404. Admin: products/orders (both filterable), lookbook (drag images between sections), community, settings. Brand: Instagram **@lusiant.sp**, payment icons, collections = Shattered Porcelain / Winter Uniform / Vintage Wash Sweatpants.

## Quirks & gotchas
- **Images currently load from `lusiant.co/cdn/...`** (friend's Shopify CDN). They'll break if his store goes down — re-host into the Supabase `site` bucket eventually (admins can swap via Lookbook/Community/Settings; products via product form).
- Supabase dashboard is **slow/flaky**; the SQL editor often takes 10–30s to load Monaco.
- **Browser automation for SQL:** inject via `window.monaco.editor.getModels()[0].setValue(sql)`. For large SQL across a cross-origin navigation, stash it in `window.name` (survives navigation) and read it on the Supabase tab.

## Known gaps / future ideas
Per-size inventory, order-confirmation emails (Resend/Postmark + webhook), discount codes, real shipping/tax, related products, wishlist, reviews, SEO (favicon, OG images, sitemap, product JSON-LD), custom domain + `NEXT_PUBLIC_SITE_URL`.
