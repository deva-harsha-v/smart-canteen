# Smart Canteen 🍔

A campus food-ordering platform that lets students browse live stall menus, order in a few taps, and track status in real time — while stall owners manage menus and incoming orders from their own console.

**Live demo:** _add your Vercel URL here_

---

## Why this exists

Campus canteens run on queues and guesswork. Smart Canteen replaces both: students see what's actually available *today* before they walk over, and owners get a queue of orders they can action with one tap instead of a foreman shouting tickets.

## Features

- **Role-based accounts** — students and stall owners share one auth system but get entirely different experiences.
- **Live daily menus** — owners publish a subset of their catalog each day; students only ever see what's actually being served.
- **Real-time order tracking** — order status (`pending → accepted → preparing → ready → completed`) updates live on both sides via Supabase Realtime, no polling or manual refresh.
- **Owner console** — create/open/close a stall, manage a reusable menu catalog, publish today's selection, and process incoming orders with one-tap status transitions.
- **Persistent cart** — survives refreshes and tab closes; automatically clears when you switch stalls (orders are single-stall).
- **Toast-based feedback** — no `alert()` dialogs; non-blocking, accessible toast notifications throughout.
- **Fully responsive** — built mobile-first since most orders happen from a phone between classes.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres, Auth, Realtime) |
| Icons | lucide-react |
| Hosting | Vercel |
| CI/CD | GitHub Actions → Vercel |

## Architecture notes (the "why")

A few decisions worth calling out if this comes up in an interview:

- **N+1 queries eliminated.** The original owner orders view fetched each order, then sequentially fetched its items, then sequentially fetched each item's menu details — a chain of round trips per order. It's now a single Supabase `select` using nested foreign-table joins (`orders → order_items → menu_items`), cutting a list of *N* sequential requests down to one query regardless of order count.
- **Optimistic, debounced client state.** Cart quantities, role state, and auth session are held in React context (not re-fetched from Supabase on every interaction), so adding/removing items is instant and the network is only touched when it has to be — at checkout.
- **Realtime over polling.** Order status pages subscribe to Postgres change events instead of polling on an interval, so updates arrive the moment a stall owner acts, without wasted requests.
- **Static-first rendering.** Every route that doesn't need request-time data is statically generated at build time (`○` in the build output) and served from Vercel's edge — only the dynamic stall page renders per request.

### A note on the numbers

If you're using a bullet like *"handling 500+ concurrent users with <200ms API response times"* on your resume, back it with a real number, not a guess — it takes ten minutes and makes the line genuinely defensible in an interview:

```bash
npm install -g artillery
artillery quick --count 50 -n 20 https://your-deployed-url.vercel.app/student/stalls
```

Run that (or a small [k6](https://k6.io/) script) against your deployed app, then quote whatever p95 response time and concurrency it reports. Supabase's free tier and Vercel's edge network comfortably handle the load this app generates; an actual benchmark just turns the claim into a fact you can defend.

## Project structure

```
app/
  page.tsx                 # Landing page
  login/, signup/          # Auth
  auth/callback/           # OAuth redirect handler
  student/
    layout.tsx             # Student nav (cart badge, active links)
    stalls/                # Browse open stalls
    stall/[id]/             # Stall menu + add to cart
    cart/                  # Cart + checkout
    orders/                 # Live order tracking
  owner/
    layout.tsx             # Owner nav
    dashboard/              # Stall creation, open/close, today's stats
    menu/                  # Catalog management + daily publish
    orders/                  # Live incoming order queue
components/
  ui.tsx                   # Shared primitives: Button, Card, Badge, Skeleton, EmptyState…
lib/
  supabase.ts               # Typed Supabase client
  auth-context.tsx          # Session + role, app-wide
  cart-context.tsx          # Cart state, localStorage-backed
  toast.tsx                 # Toast notification system
  types.ts                  # Shared domain types
```

## Database schema

This app expects the following Supabase tables (with foreign keys so Supabase can resolve nested `select()` joins):

- `users (id uuid pk, email text, name text, role text)`
- `stalls (id uuid pk, owner_id uuid fk→users, stall_name text, status text, created_at timestamptz)`
- `menu_items (id uuid pk, stall_id uuid fk→stalls, name text, price numeric, created_at timestamptz)`
- `daily_menu (id uuid pk, stall_id uuid fk→stalls, item_id uuid fk→menu_items, date date)`
- `orders (id uuid pk, stall_id uuid fk→stalls, student_id uuid fk→users, status text, created_at timestamptz)`
- `order_items (id uuid pk, order_id uuid fk→orders, item_id uuid fk→menu_items, quantity int)`

Enable Row Level Security and add policies so students can only read/write their own orders and owners can only manage their own stall's data.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This repo ships with two GitHub Actions workflows:

- **`ci.yml`** — runs lint + build on every push/PR.
- **`deploy.yml`** — deploys to Vercel on every push to `main` using the Vercel CLI action. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as repo secrets (get these via `npx vercel link` and `npx vercel env pull` locally), plus your Supabase env vars as repo secrets for the CI build step.

Alternatively, just connect the repo directly in the Vercel dashboard for the same effect with zero workflow files.

## Security note

The Supabase **anon** key is safe to expose client-side by design — access is governed entirely by Row Level Security policies on the database, not by hiding the key. Make sure RLS is enabled on every table before going to production.
