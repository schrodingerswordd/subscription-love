-- Add Stripe columns to user_subscriptions
ALTER TABLE public.user_subscriptions ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE public.user_subscriptions ADD COLUMN stripe_customer_id TEXT;

-- Create unique index for stripe_subscription_id
CREATE UNIQUE INDEX idx_user_subscriptions_stripe_id ON public.user_subscriptions(stripe_subscription_id);

-- Make provider-specific columns optional
ALTER TABLE public.user_subscriptions ALTER COLUMN paddle_subscription_id DROP NOT NULL;
ALTER TABLE public.user_subscriptions ALTER COLUMN paddle_customer_id DROP NOT NULL;

-- Create user_orders table for one-time purchases (bundles)
CREATE TABLE public.user_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  product_id TEXT NOT NULL,
  amount_total NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_orders_user_id ON public.user_orders(user_id);

ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.user_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Update has_active_subscription to support both providers (already does based on columns used)
