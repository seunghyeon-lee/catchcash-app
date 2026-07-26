-- CatchCash MVP schema for Supabase PostgreSQL.
-- This file is intentionally not applied by this repository change.

create extension if not exists pgcrypto;

create type public.profile_status as enum ('active', 'suspended', 'deleted');
create type public.admin_role as enum ('super_admin', 'operator', 'viewer');
create type public.admin_status as enum ('active', 'inactive', 'locked');
create type public.treasure_status as enum ('draft', 'active', 'paused', 'ended', 'deleted');
create type public.product_provider as enum ('giftishow_biz', 'manual_mock');
create type public.product_status as enum ('active', 'inactive', 'sold_out');
create type public.reward_type as enum ('coupon', 'point', 'empty');
create type public.treasure_reward_status as enum ('active', 'replaced', 'ended');
create type public.claim_result as enum ('success', 'fail', 'empty', 'too_far', 'already_claimed', 'expired');
create type public.inventory_status as enum ('ready', 'issued', 'used', 'expired', 'failed', 'canceled');
create type public.retry_request_status as enum ('requested', 'processing', 'succeeded', 'failed', 'canceled');
create type public.inquiry_category as enum ('general', 'coupon', 'reward', 'account', 'bug', 'improvement', 'etc');
create type public.inquiry_status as enum ('reading', 'resolved');
create type public.notification_type as enum ('treasure', 'coupon', 'notice', 'setting', 'support');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  avatar_key text,
  background_key text,
  intro_text text check (intro_text is null or char_length(intro_text) <= 160),
  terms_agreed_at timestamptz,
  marketing_agreed_at timestamptz,
  status public.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null unique,
  role public.admin_role not null default 'viewer',
  status public.admin_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.treasure_boxes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text,
  hint_text text,
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  radius_m integer not null check (radius_m between 1 and 10000),
  status public.treasure_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  max_claim_count integer not null default 1 check (max_claim_count >= 0),
  current_claim_count integer not null default 0 check (current_claim_count >= 0),
  marker_image_url text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (current_claim_count <= max_claim_count),
  check ((status = 'deleted') = (deleted_at is not null))
);

create table public.gift_products (
  id uuid primary key default gen_random_uuid(),
  provider public.product_provider not null default 'manual_mock',
  provider_product_id text,
  brand_name text not null,
  product_name text not null,
  product_image_url text,
  price integer not null check (price >= 0),
  status public.product_status not null default 'active',
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_product_id)
);

create table public.treasure_rewards (
  id uuid primary key default gen_random_uuid(),
  treasure_box_id uuid not null references public.treasure_boxes(id) on delete restrict,
  gift_product_id uuid references public.gift_products(id) on delete restrict,
  reward_quantity integer not null default 1 check (reward_quantity > 0),
  remaining_quantity integer not null default 1 check (remaining_quantity >= 0),
  reward_type public.reward_type not null default 'coupon',
  status public.treasure_reward_status not null default 'active',
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (remaining_quantity <= reward_quantity),
  check ((reward_type = 'empty' and gift_product_id is null) or (reward_type <> 'empty' and gift_product_id is not null))
);

create unique index treasure_rewards_one_active_per_box_idx
  on public.treasure_rewards (treasure_box_id) where status = 'active';

create table public.treasure_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treasure_box_id uuid not null references public.treasure_boxes(id) on delete restrict,
  treasure_reward_id uuid references public.treasure_rewards(id) on delete set null,
  result public.claim_result not null,
  distance_m numeric(10, 2) check (distance_m is null or distance_m >= 0),
  claimed_latitude numeric(9, 6) check (claimed_latitude is null or claimed_latitude between -90 and 90),
  claimed_longitude numeric(9, 6) check (claimed_longitude is null or claimed_longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treasure_claim_id uuid unique references public.treasure_claims(id) on delete set null,
  treasure_box_id uuid references public.treasure_boxes(id) on delete set null,
  treasure_reward_id uuid references public.treasure_rewards(id) on delete set null,
  gift_product_id uuid references public.gift_products(id) on delete set null,
  status public.inventory_status not null default 'ready',
  issued_at timestamptz,
  used_at timestamptz,
  expired_at timestamptz,
  coupon_code text,
  barcode_value text,
  provider_order_id text,
  provider_coupon_id text,
  issue_failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'issued' and issued_at is not null) or status <> 'issued')
);

create table public.reward_retry_requests (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  requested_by_admin_id uuid not null references public.admin_users(id) on delete restrict,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  status public.retry_request_status not null default 'requested',
  before_status public.inventory_status not null,
  after_status public.inventory_status,
  provider_response jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.inquiry_category not null default 'general',
  title text not null check (char_length(btrim(title)) between 1 and 120),
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  status public.inquiry_status not null default 'reading',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.support_replies (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.support_inquiries(id) on delete cascade,
  admin_user_id uuid not null references public.admin_users(id) on delete restrict,
  content text not null check (char_length(btrim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  target_route text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.operation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.security_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  admin_user_id uuid references public.admin_users(id) on delete set null,
  event_type text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_status_created_at_idx on public.profiles (status, created_at desc);
create index admin_users_role_status_idx on public.admin_users (role, status);
create index treasure_boxes_map_active_idx on public.treasure_boxes (status, starts_at, ends_at) where deleted_at is null;
create index treasure_boxes_location_idx on public.treasure_boxes (latitude, longitude);
create index gift_products_status_idx on public.gift_products (status, brand_name, product_name);
create index treasure_rewards_box_status_idx on public.treasure_rewards (treasure_box_id, status);
create index treasure_claims_user_result_created_idx on public.treasure_claims (user_id, result, created_at desc);
create index treasure_claims_box_result_created_idx on public.treasure_claims (treasure_box_id, result, created_at desc);
create index inventory_items_user_status_created_idx on public.inventory_items (user_id, status, created_at desc);
create index inventory_items_status_created_idx on public.inventory_items (status, created_at desc);
create index reward_retry_requests_inventory_created_idx on public.reward_retry_requests (inventory_item_id, created_at desc);
create index support_inquiries_user_created_idx on public.support_inquiries (user_id, created_at desc);
create index support_inquiries_status_updated_idx on public.support_inquiries (status, updated_at desc);
create index support_replies_inquiry_created_idx on public.support_replies (inquiry_id, created_at);
create index notifications_user_read_created_idx on public.notifications (user_id, is_read, created_at desc);
create index operation_logs_target_created_idx on public.operation_logs (target_table, target_id, created_at desc);
create index security_logs_event_created_idx on public.security_logs (event_type, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.has_admin_role(allowed_roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.status = 'active'
      and au.role = any(allowed_roles)
  );
$$;

revoke all on function public.has_admin_role(public.admin_role[]) from public;
grant execute on function public.has_admin_role(public.admin_role[]) to authenticated;

create function public.current_admin_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select au.id
  from public.admin_users au
  where au.user_id = auth.uid()
    and au.status = 'active'
  limit 1;
$$;

revoke all on function public.current_admin_user_id() from public;
grant execute on function public.current_admin_user_id() to authenticated;

create function public.resolve_inquiry_after_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inquiry_owner uuid;
begin
  update public.support_inquiries
     set status = 'resolved', resolved_at = now(), updated_at = now()
   where id = new.inquiry_id
   returning user_id into inquiry_owner;

  insert into public.notifications (user_id, type, title, body, target_route)
  values (
    inquiry_owner,
    'support',
    '문의 답변 도착',
    '등록한 문의에 관리자의 답변이 도착했어요.',
    '/support/' || new.inquiry_id::text
  );

  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger admin_users_set_updated_at before update on public.admin_users for each row execute function public.set_updated_at();
create trigger treasure_boxes_set_updated_at before update on public.treasure_boxes for each row execute function public.set_updated_at();
create trigger gift_products_set_updated_at before update on public.gift_products for each row execute function public.set_updated_at();
create trigger treasure_rewards_set_updated_at before update on public.treasure_rewards for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();
create trigger support_inquiries_set_updated_at before update on public.support_inquiries for each row execute function public.set_updated_at();
create trigger support_replies_set_updated_at before update on public.support_replies for each row execute function public.set_updated_at();
create trigger support_replies_resolve_inquiry after insert on public.support_replies for each row execute function public.resolve_inquiry_after_reply();

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.treasure_boxes enable row level security;
alter table public.gift_products enable row level security;
alter table public.treasure_rewards enable row level security;
alter table public.treasure_claims enable row level security;
alter table public.inventory_items enable row level security;
alter table public.reward_retry_requests enable row level security;
alter table public.support_inquiries enable row level security;
alter table public.support_replies enable row level security;
alter table public.notifications enable row level security;
alter table public.operation_logs enable row level security;
alter table public.security_logs enable row level security;

create policy profiles_select_own_or_admin on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));

create policy admin_users_select_admin on public.admin_users for select to authenticated
  using (public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy admin_users_manage_super_admin on public.admin_users for all to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin']::public.admin_role[]));

create policy treasure_boxes_select_active on public.treasure_boxes for select to authenticated
  using ((status = 'active' and deleted_at is null) or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy treasure_boxes_insert_admin on public.treasure_boxes for insert to authenticated
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));
create policy treasure_boxes_update_admin on public.treasure_boxes for update to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy gift_products_select_active on public.gift_products for select to authenticated
  using (status = 'active' or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy gift_products_insert_admin on public.gift_products for insert to authenticated
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));
create policy gift_products_update_admin on public.gift_products for update to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy treasure_rewards_select_active on public.treasure_rewards for select to authenticated
  using (status = 'active' or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy treasure_rewards_insert_admin on public.treasure_rewards for insert to authenticated
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));
create policy treasure_rewards_update_admin on public.treasure_rewards for update to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy treasure_claims_select_own_or_admin on public.treasure_claims for select to authenticated
  using (user_id = auth.uid() or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy treasure_claims_insert_own on public.treasure_claims for insert to authenticated with check (user_id = auth.uid());

create policy inventory_items_select_own_or_admin on public.inventory_items for select to authenticated
  using (user_id = auth.uid() or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy inventory_items_manage_admin on public.inventory_items for all to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy reward_retry_requests_select_admin on public.reward_retry_requests for select to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));
create policy reward_retry_requests_insert_admin on public.reward_retry_requests for insert to authenticated
  with check (
    public.has_admin_role(array['super_admin', 'operator']::public.admin_role[])
    and requested_by_admin_id = public.current_admin_user_id()
  );
create policy reward_retry_requests_update_admin on public.reward_retry_requests for update to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy support_inquiries_select_own_or_admin on public.support_inquiries for select to authenticated
  using (user_id = auth.uid() or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy support_inquiries_insert_own on public.support_inquiries for insert to authenticated with check (user_id = auth.uid());
create policy support_inquiries_update_own on public.support_inquiries for update to authenticated
  using (user_id = auth.uid() and status = 'reading') with check (user_id = auth.uid());
create policy support_inquiries_update_admin on public.support_inquiries for update to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]))
  with check (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));

create policy support_replies_select_owner_or_admin on public.support_replies for select to authenticated
  using (exists (select 1 from public.support_inquiries si where si.id = inquiry_id and si.user_id = auth.uid())
    or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy support_replies_insert_admin on public.support_replies for insert to authenticated
  with check (
    public.has_admin_role(array['super_admin', 'operator']::public.admin_role[])
    and admin_user_id = public.current_admin_user_id()
  );
create policy support_replies_update_admin on public.support_replies for update to authenticated
  using (
    public.has_admin_role(array['super_admin', 'operator']::public.admin_role[])
    and admin_user_id = public.current_admin_user_id()
  )
  with check (
    public.has_admin_role(array['super_admin', 'operator']::public.admin_role[])
    and admin_user_id = public.current_admin_user_id()
  );

create policy notifications_select_own_or_admin on public.notifications for select to authenticated
  using (user_id = auth.uid() or public.has_admin_role(array['super_admin', 'operator', 'viewer']::public.admin_role[]));
create policy notifications_update_own on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy operation_logs_select_operator_or_super_admin on public.operation_logs for select to authenticated
  using (public.has_admin_role(array['super_admin', 'operator']::public.admin_role[]));
create policy operation_logs_insert_operator_or_super_admin on public.operation_logs for insert to authenticated
  with check (
    public.has_admin_role(array['super_admin', 'operator']::public.admin_role[])
    and admin_user_id = public.current_admin_user_id()
  );
create policy security_logs_select_super_admin on public.security_logs for select to authenticated
  using (public.has_admin_role(array['super_admin']::public.admin_role[]));

create view public.inventory_item_list with (security_invoker = true) as
select id, user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id,
       status, issued_at, used_at, expired_at, issue_failed_reason, created_at, updated_at
from public.inventory_items;

-- This view intentionally bypasses base-table RLS so authenticated hunters can see ranks.
-- It exposes only public display data; internal auth user IDs and profile text are excluded.
create view public.hall_of_fame with (security_invoker = false) as
select
  p.nickname,
  p.avatar_key,
  count(tc.id) filter (where tc.result = 'success') as find_count,
  rank() over (order by count(tc.id) filter (where tc.result = 'success') desc, min(tc.created_at)) as rank
from public.profiles p
left join public.treasure_claims tc on tc.user_id = p.user_id
where p.status = 'active'
group by p.user_id, p.nickname, p.avatar_key;

create view public.admin_dashboard_stats with (security_invoker = true) as
select
  (select count(*) from public.profiles where status = 'active') as active_user_count,
  (select count(*) from public.treasure_boxes where status = 'active' and deleted_at is null) as active_treasure_count,
  (select count(*) from public.inventory_items where status = 'failed') as failed_reward_count,
  (select count(*) from public.support_inquiries where status = 'reading') as open_inquiry_count;

create view public.admin_user_statistics with (security_invoker = true) as
select
  p.user_id,
  coalesce(claim_stats.found_treasure_count, 0) as found_treasure_count,
  coalesce(inventory_stats.available_coupon_count, 0) as available_coupon_count,
  claim_stats.last_success_claimed_at
from public.profiles p
left join (
  select user_id,
         count(*) filter (where result = 'success') as found_treasure_count,
         max(created_at) filter (where result = 'success') as last_success_claimed_at
  from public.treasure_claims
  group by user_id
) claim_stats on claim_stats.user_id = p.user_id
left join (
  select user_id, count(*) filter (where status in ('ready', 'issued')) as available_coupon_count
  from public.inventory_items
  group by user_id
) inventory_stats on inventory_stats.user_id = p.user_id;

create view public.admin_reward_list with (security_invoker = true) as
select
  ii.id, ii.user_id, ii.status, ii.issued_at, ii.used_at, ii.expired_at, ii.issue_failed_reason,
  gp.brand_name, gp.product_name, gp.product_image_url, tb.title as treasure_title
from public.inventory_items ii
left join public.gift_products gp on gp.id = ii.gift_product_id
left join public.treasure_boxes tb on tb.id = ii.treasure_box_id;

grant select on public.inventory_item_list, public.hall_of_fame to authenticated;
grant select on public.admin_dashboard_stats, public.admin_user_statistics, public.admin_reward_list to authenticated;
