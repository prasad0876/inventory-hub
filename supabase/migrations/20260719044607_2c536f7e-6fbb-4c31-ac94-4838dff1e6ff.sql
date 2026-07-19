CREATE TABLE public.app_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_initialized boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT TO public USING (true);
INSERT INTO public.app_settings (id, admin_initialized) VALUES (1, false) ON CONFLICT (id) DO NOTHING;