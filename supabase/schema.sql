-- Lusiant Ecommerce Schema
-- Run this in your Supabase SQL editor

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  category TEXT DEFAULT 'uncategorized',
  sizes TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (key-value store for hero, announcement, lookbook, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('hero', '{"title":"PORCELAIN INSPIRED DENIM","subtitle":"New Collection","image_url":"","button_text":"SHOP NOW","button_href":"/shop"}'),
  ('announcement', '{"text":"FREE SHIPPING ON ALL U.S ORDERS","enabled":true}'),
  ('lookbook', '[]')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for products and site_settings
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Settings are publicly readable" ON site_settings FOR SELECT USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Service role bypass for webhook (order inserts via API route)
CREATE POLICY "Service role can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------
-- v2 migration: per-size inventory + shipping class
-- Run these in the Supabase SQL editor on existing projects
-- -------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_inventory JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_class TEXT DEFAULT 'standard';

INSERT INTO site_settings (key, value) VALUES
  ('shipping', '{"free_threshold":150,"standard_rate":9.99,"oversize_surcharge":5.00}')
ON CONFLICT (key) DO NOTHING;
