-- Table for Vault Assets (Digital Content)
CREATE TABLE public.vault_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- CBRN, Engineering, Food Security, Medical, Tactical
  type TEXT NOT NULL, -- Guide, Scenario Pack, Proprietary Text
  file_path TEXT, -- Path in Supabase storage
  is_premium_only BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for User Assets (Which user bought what)
CREATE TABLE public.user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.vault_assets(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

-- RLS for Vault Assets
ALTER TABLE public.vault_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view asset metadata" ON public.vault_assets FOR SELECT USING (true);

-- RLS for User Assets
ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assets" ON public.user_assets FOR SELECT USING (auth.uid() = user_id);

-- Inventory Table (Synced from Airtable or managed here)
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10,2) NOT NULL,
  msrp NUMERIC(10,2) NOT NULL,
  hub_location TEXT,
  has_lithium_battery BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Inventory (Only for internal dash / efficiency agent)
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
-- Note: Admin/Ops policies would go here. For now, restricted.
