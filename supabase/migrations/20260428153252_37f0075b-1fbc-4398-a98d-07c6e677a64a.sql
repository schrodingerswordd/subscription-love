alter table public.user_subscriptions replica identity full;
alter publication supabase_realtime add table public.user_subscriptions;