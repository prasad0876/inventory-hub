## Create admin account

Create the admin user in Lovable Cloud auth and grant the admin role.

### Steps

1. Use the Supabase admin API to create user `admin@gmail.com` with password `P@ssw0rd` (email auto-confirmed) via a one-off server function or admin call.
2. Insert a row into `public.user_roles` with `role = 'admin'` for that user's id.
3. Verify sign-in works at `/auth` and that `/admin` loads.

### Credentials
- Email: `admin@gmail.com`
- Password: `P@ssw0rd`

Note: `P@ssw0rd` is a very common/leaked password. If HIBP leaked-password protection is enabled it will be rejected — I'll temporarily create it via the admin API (bypasses that check) but recommend changing it after first login.
