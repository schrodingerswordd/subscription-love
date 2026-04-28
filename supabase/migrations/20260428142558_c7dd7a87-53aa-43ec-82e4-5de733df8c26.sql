CREATE OR REPLACE FUNCTION public.validate_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be active or cancelled.', NEW.status;
  END IF;
  IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := now();
  END IF;
  IF NEW.status = 'active' THEN
    NEW.cancelled_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_subscription_status() FROM PUBLIC, anon, authenticated;