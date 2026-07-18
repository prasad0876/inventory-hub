
# Electronics Inventory Management System

A responsive storefront + hidden admin dashboard built on the current TanStack Start + Lovable Cloud stack (not the MERN stack in the brief — Lovable Cloud replaces Node/Express/MongoDB with Postgres + auth + storage, which is the supported path here).

## Stack adjustments from the brief

- Frontend: TanStack Start, React, TypeScript, Tailwind v4, shadcn/ui, TanStack Query, Recharts.
- Backend: Lovable Cloud (Postgres + Auth + Storage) via server functions. No separate Express server, no MongoDB, no Cloudinary — product images go in a Cloud Storage bucket.
- Auth: Lovable Cloud email/password. Admin gating via a `user_roles` table + `has_role` security-definer function (industry-standard, avoids RLS recursion). No public signup surface; a single admin user is provisioned.

I'll flag this to you rather than silently swap; everything the brief asks for is achievable on this stack.

## Public site (no login)

Routes:
- `/` — hero, featured, categories, latest arrivals, search bar, footer
- `/products` — grid + filters (category, brand, availability, price range) + sort (newest, price asc/desc, name A–Z) + instant search (name/brand/model)
- `/products/$id` — gallery, specs, price, warranty, availability badge ("Available" / "Only N left" when ≤6 / "Out of Stock")
- `/category/$slug` — filtered grid

All read-only. No admin links exposed anywhere in nav/footer.

## Admin (hidden)

- `/admin/login` — email + password (no signup UI)
- `/admin` layout gated by `_authenticated` + `has_role('admin')`; non-admins get 404-style redirect (never reveal existence)
- Sidebar: Dashboard, Products, Categories, Inventory, Pending Due, Activity, Settings, Logout
- Dashboard: KPI cards (total products, in stock, out of stock, categories, pending due total, overdue count) + Recharts (inventory by category bar, stock status donut, recent updates list)
- Products CRUD: form (name, brand, category, model, price, description, specs JSON, quantity, warranty, image upload to Storage), search, edit, delete w/ confirm
- Inventory: quick +/- stock, set quantity, low-stock (<=5) highlight
- Categories CRUD with product counts
- Pending Due CRUD: customer name, phone, product, amount, due date, status (pending/paid/overdue auto by date), notes, mark paid, filter by status, search
- Activity log: every mutation writes a row; table with date/time/action/admin

Toasts (sonner), skeletons, confirm dialogs, pagination on tables.

## Data model (Postgres, all in `public`, RLS on)

- `categories` (id, name, slug, created_at)
- `products` (id, name, brand, category_id, model, description, specs jsonb, price numeric, quantity int, warranty, image_url, created_at, updated_at)
- `pending_dues` (id, customer_name, phone, product_id nullable, amount, due_date, status, notes, created_at)
- `activity_logs` (id, admin_id, action, entity, entity_id, meta jsonb, created_at)
- `app_role` enum (`admin`)
- `user_roles` (id, user_id, role) + `has_role(uuid, app_role)` security-definer

Grants + RLS:
- `products`, `categories`: `SELECT` to `anon` + `authenticated` (public browsing). Write policies restricted to `has_role(auth.uid(),'admin')`.
- `pending_dues`, `activity_logs`, `user_roles`: no anon; select/write only for admins.
- Storage bucket `product-images` public read; writes admin-only via policy.

## Server functions

- Public reads via publishable-key server client (SSR-safe) for `/`, `/products`, `/products/$id`.
- Admin mutations use `requireSupabaseAuth` middleware + verify `has_role` before touching data; each mutation inserts an `activity_logs` row.

## Design

Clean white/blue/gray theme, rounded cards, soft shadows, subtle glass on hero. Tokens defined in `src/styles.css` under `@theme` — no hardcoded colors in components. Fully responsive.

## Out of scope for v1 (call out now)

- Excel/PDF export, dark mode toggle, email notifications, rate limiting middleware (Cloud handles auth throttling), multi-admin. Easy to add later.

## Build order

1. Enable Lovable Cloud.
2. Migrations: enum, tables, grants, RLS, `has_role`, storage bucket + policies. Seed ~12 categories + a few demo products.
3. Design tokens in `src/styles.css`; shared layout (header/footer).
4. Public routes + product queries + filters/search.
5. Admin auth gate + layout + sidebar.
6. Admin CRUD (products, categories, inventory, dues) + activity logging + dashboard charts.
7. Provision the single admin account (I'll ask you for the email; you'll set the password via the login screen after I trigger a password reset, or you give me a temp password to seed).

Approve and I'll build it. Two things I need from you before/while I build:
- Admin email to seed
- OK to skip MongoDB/Express and use Lovable Cloud (Postgres) as described?
