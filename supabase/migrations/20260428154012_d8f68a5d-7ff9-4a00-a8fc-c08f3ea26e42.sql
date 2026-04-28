
-- Add alert preferences to subscriptions
alter table public.subscriptions
  add column if not exists alert_threshold_pct numeric not null default 0,
  add column if not exists alerts_enabled boolean not null default true;

-- Price history per subscription
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id uuid not null,
  cost numeric not null,
  source text not null default 'manual_edit',
  recorded_at timestamptz not null default now()
);
create index if not exists idx_price_history_sub on public.price_history(subscription_id, recorded_at desc);
create index if not exists idx_price_history_user on public.price_history(user_id);

alter table public.price_history enable row level security;
drop policy if exists "Users select own price history" on public.price_history;
create policy "Users select own price history" on public.price_history
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own price history" on public.price_history;
create policy "Users insert own price history" on public.price_history
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own price history" on public.price_history;
create policy "Users delete own price history" on public.price_history
  for delete using (auth.uid() = user_id);

-- Price alerts (generated)
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id uuid not null,
  old_cost numeric not null,
  new_cost numeric not null,
  change_pct numeric not null,
  source text not null default 'manual_edit',
  status text not null default 'unread',
  created_at timestamptz not null default now()
);
create index if not exists idx_price_alerts_user_status on public.price_alerts(user_id, status, created_at desc);
create index if not exists idx_price_alerts_sub on public.price_alerts(subscription_id);

alter table public.price_alerts enable row level security;
drop policy if exists "Users select own price alerts" on public.price_alerts;
create policy "Users select own price alerts" on public.price_alerts
  for select using (auth.uid() = user_id);
drop policy if exists "Users update own price alerts" on public.price_alerts;
create policy "Users update own price alerts" on public.price_alerts
  for update using (auth.uid() = user_id);
drop policy if exists "Users insert own price alerts" on public.price_alerts;
create policy "Users insert own price alerts" on public.price_alerts
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own price alerts" on public.price_alerts;
create policy "Users delete own price alerts" on public.price_alerts
  for delete using (auth.uid() = user_id);

-- Trigger: when price_history row is inserted, compare to previous record
-- and create a price_alert if the change crosses the subscription's threshold.
create or replace function public.handle_price_history_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prev_cost numeric;
  sub_threshold numeric;
  sub_alerts_enabled boolean;
  pct numeric;
begin
  select cost into prev_cost
  from public.price_history
  where subscription_id = new.subscription_id
    and id <> new.id
  order by recorded_at desc
  limit 1;

  if prev_cost is null or prev_cost = 0 or new.cost = prev_cost then
    return new;
  end if;

  select alert_threshold_pct, alerts_enabled
    into sub_threshold, sub_alerts_enabled
  from public.subscriptions
  where id = new.subscription_id;

  if sub_alerts_enabled is not true then
    return new;
  end if;

  pct := round(((new.cost - prev_cost) / prev_cost) * 100, 2);

  -- threshold_pct = 0 means alert on ANY change.
  -- positive threshold means alert when |pct| >= threshold.
  if coalesce(sub_threshold, 0) > 0 and abs(pct) < sub_threshold then
    return new;
  end if;

  insert into public.price_alerts (subscription_id, user_id, old_cost, new_cost, change_pct, source)
  values (new.subscription_id, new.user_id, prev_cost, new.cost, pct, new.source);

  return new;
end;
$$;

drop trigger if exists trg_price_history_insert on public.price_history;
create trigger trg_price_history_insert
after insert on public.price_history
for each row execute function public.handle_price_history_insert();

-- When a subscription is created, seed initial price history row
create or replace function public.handle_subscription_insert_seed_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.price_history (subscription_id, user_id, cost, source)
  values (new.id, new.user_id, new.cost, 'initial');
  return new;
end;
$$;

drop trigger if exists trg_subscription_insert_seed on public.subscriptions;
create trigger trg_subscription_insert_seed
after insert on public.subscriptions
for each row execute function public.handle_subscription_insert_seed_price();

-- Backfill: for any existing subscription without history, seed a row.
insert into public.price_history (subscription_id, user_id, cost, source)
select s.id, s.user_id, s.cost, 'initial'
from public.subscriptions s
left join public.price_history ph on ph.subscription_id = s.id
where ph.id is null;
