## Goal
On first visit after deployment, the site shows the admin login page. Once the admin has ever signed in successfully (recorded globally in the database), all future visitors on any device go straight to the home page. The admin can still sign in later from their own device via `/auth`.

## Behavior

1. Add a global `app_settings` table with a single row storing `admin_initialized: boolean` (default `false`).
2. Public root `/` route loads this flag via a public server function:
   - If `admin_initialized` is `false` → redirect to `/auth` (setup screen).
   - If `true` → render the normal home page with all products.
3. `/auth` login page:
   - Reads the same flag. If `false`, shows "Initial Admin Setup" heading; if `true`, shows normal "Admin Sign In".
   - On successful sign-in, if the signed-in user has the `admin` role AND flag is `false`, call a server function to flip `admin_initialized` to `true`.
   - Then redirect: admins → `/admin`; anyone else → `/`.
4. Admin session persistence: Supabase client already persists sessions in localStorage with auto-refresh, so once the admin logs in on their browser they stay logged in indefinitely (until they explicitly sign out). No change needed beyond confirming `persistSession: true` (default).
5. Non-admin visitors after initialization never see `/auth` unless they navigate there manually.

## Technical

- Migration: create `public.app_settings (id int primary key default 1 check (id=1), admin_initialized boolean not null default false, updated_at timestamptz)`. Grants: `SELECT` to `anon, authenticated`; `ALL` to `service_role`. Enable RLS. Policy: public SELECT allowed; no client writes (updates go through a server function using `supabaseAdmin` after verifying caller is admin).
- Seed row `(1, false)` in the same migration.
- New file `src/lib/app-settings.functions.ts`:
  - `getAppSettings()` — public server fn using the server publishable client, returns `{ adminInitialized }`.
  - `markAdminInitialized()` — `requireSupabaseAuth` + role check (`has_role`) + `supabaseAdmin` write.
- `src/routes/index.tsx` loader: call `getAppSettings()`; if not initialized, `throw redirect({ to: '/auth' })`.
- `src/routes/auth.tsx`: fetch flag on mount (or via loader), adjust heading/CTA copy, after login call `markAdminInitialized()` when appropriate, then navigate to `/admin` (admin) or `/` (non-admin).
- No changes to `_authenticated` gate or admin pages.

## Out of scope
- No changes to product/catalogue logic, styling, or admin UI.
- No "reset setup" flow (the flag stays true once set; admin can always reach `/auth` directly).
