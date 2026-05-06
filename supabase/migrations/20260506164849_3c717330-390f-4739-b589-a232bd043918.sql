ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS shared_with_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_shared_with_count_check
  CHECK (shared_with_count >= 1 AND shared_with_count <= 50);