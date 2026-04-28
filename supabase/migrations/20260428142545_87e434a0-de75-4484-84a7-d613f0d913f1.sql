ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Validate status values via trigger (avoids immutable CHECK pitfalls)
CREATE OR REPLACE FUNCTION public.validate_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be active or cancelled.', NEW.status;
  END IF;
  -- Keep cancelled_at in sync with status
  IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := now();
  END IF;
  IF NEW.status = 'active' THEN
    NEW.cancelled_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_subscription_status_trigger ON public.subscriptions;
CREATE TRIGGER validate_subscription_status_trigger
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_status();

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(user_id, status);