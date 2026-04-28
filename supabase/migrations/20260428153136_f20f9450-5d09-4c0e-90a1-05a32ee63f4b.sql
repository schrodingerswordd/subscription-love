create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  -- Only allow checking your own status, or service role
  if auth.role() <> 'service_role' and auth.uid() <> user_uuid then
    return false;
  end if;
  return exists (
    select 1 from public.user_subscriptions
    where user_id = user_uuid
    and environment = check_env
    and (
      (status in ('active', 'trialing') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
end;
$$;