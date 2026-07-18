
-- Role enum + user_roles table + has_role
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  warranty TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Pending dues
CREATE TABLE public.pending_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_dues TO authenticated;
GRANT ALL ON public.pending_dues TO service_role;
ALTER TABLE public.pending_dues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage dues" ON public.pending_dues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity TEXT NOT NULL DEFAULT '',
  entity_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug) VALUES
  ('Laptop','laptop'),('Mobile','mobile'),('Monitor','monitor'),('Keyboard','keyboard'),
  ('Mouse','mouse'),('Printer','printer'),('Processor','processor'),('RAM','ram'),
  ('SSD','ssd'),('Hard Disk','hard-disk'),('Graphics Card','graphics-card'),('UPS','ups'),
  ('Router','router'),('Accessories','accessories');

-- Seed a few demo products
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'Dell Inspiron 15', 'Dell', '3520', c.id, '15.6" laptop, 12th Gen i5, 8GB RAM, 512GB SSD', 54999, 18, '1 Year',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
FROM public.categories c WHERE c.slug='laptop';
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'Logitech MX Master 3S', 'Logitech', 'MX3S', c.id, 'Wireless performance mouse', 8999, 24, '1 Year',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'
FROM public.categories c WHERE c.slug='mouse';
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'Samsung 27" 4K Monitor', 'Samsung', 'U28R550', c.id, '27-inch UHD monitor', 27499, 6, '3 Years',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'
FROM public.categories c WHERE c.slug='monitor';
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'Samsung 980 Pro 1TB', 'Samsung', '980PRO', c.id, 'NVMe Gen4 SSD', 9499, 0, '5 Years',
  'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800'
FROM public.categories c WHERE c.slug='ssd';
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'Corsair Vengeance 16GB', 'Corsair', 'DDR4-3200', c.id, '16GB DDR4 3200MHz', 4299, 12, '10 Years',
  'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800'
FROM public.categories c WHERE c.slug='ram';
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
SELECT 'iPhone 15', 'Apple', 'A3090', c.id, '128GB, Blue', 79999, 4, '1 Year',
  'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800'
FROM public.categories c WHERE c.slug='mobile';
