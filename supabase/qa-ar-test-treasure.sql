-- QA-only AR/GPS/bearing test treasure seed.
--
-- Run manually only against a local or QA Supabase database.
-- This file is intentionally not a migration, so production will not create this treasure automatically.
-- Giftishow is not used: the reward product uses provider='manual_mock' and exists only to exercise
-- the existing claim_treasure_with_lock SUCCESS path without issuing a real external coupon.

do $$
declare
  -- Easy QA coordinate config. Change these two values to the real device test location.
  qa_treasure_latitude numeric(9, 6) := 37.566500;
  qa_treasure_longitude numeric(9, 6) := 126.978000;

  qa_treasure_id uuid := '50000000-0000-0000-0000-000000000105';
  qa_product_id uuid := '60000000-0000-0000-0000-000000000105';
  qa_reward_id uuid := '70000000-0000-0000-0000-000000000105';
  qa_radius_m integer := 30;
  qa_stock_count integer := 10;
begin
  insert into public.gift_products (
    id,
    provider,
    provider_product_id,
    brand_name,
    product_name,
    product_image_url,
    price,
    status,
    created_by
  )
  values (
    qa_product_id,
    'manual_mock',
    'qa-ar-test-reward',
    'QA',
    '[QA] AR 테스트 보상',
    null,
    0,
    'active',
    null
  )
  on conflict (provider, provider_product_id) do update
     set brand_name = excluded.brand_name,
         product_name = excluded.product_name,
         product_image_url = excluded.product_image_url,
         price = excluded.price,
         status = excluded.status,
         updated_at = now();

  insert into public.treasure_boxes (
    id,
    title,
    description,
    hint_text,
    latitude,
    longitude,
    radius_m,
    status,
    starts_at,
    ends_at,
    max_claim_count,
    current_claim_count,
    marker_image_url,
    created_by
  )
  values (
    qa_treasure_id,
    '[QA] AR 테스트 보물',
    'Giftishow 없이 AR/GPS/bearing/claim 실기기 QA를 검증하기 위한 수동 생성 보물입니다.',
    '테스트 좌표 주변에서 카메라 방향을 맞춰 상자를 찾아보세요.',
    qa_treasure_latitude,
    qa_treasure_longitude,
    qa_radius_m,
    'active',
    now() - interval '1 hour',
    now() + interval '30 days',
    qa_stock_count,
    0,
    null,
    null
  )
  on conflict (id) do update
     set title = excluded.title,
         description = excluded.description,
         hint_text = excluded.hint_text,
         latitude = excluded.latitude,
         longitude = excluded.longitude,
         radius_m = excluded.radius_m,
         status = 'active',
         starts_at = now() - interval '1 hour',
         ends_at = now() + interval '30 days',
         max_claim_count = greatest(public.treasure_boxes.current_claim_count + qa_stock_count, qa_stock_count),
         marker_image_url = null,
         deleted_at = null,
         updated_at = now();

  insert into public.treasure_rewards (
    id,
    treasure_box_id,
    gift_product_id,
    reward_quantity,
    remaining_quantity,
    reward_type,
    status,
    created_by
  )
  values (
    qa_reward_id,
    qa_treasure_id,
    qa_product_id,
    qa_stock_count,
    qa_stock_count,
    'coupon',
    'active',
    null
  )
  on conflict (id) do update
     set gift_product_id = excluded.gift_product_id,
         reward_quantity = excluded.reward_quantity,
         remaining_quantity = excluded.remaining_quantity,
         reward_type = excluded.reward_type,
         status = 'active',
         updated_at = now();
end $$;

-- QA route shortcut:
-- /ar-hunt?treasureId=50000000-0000-0000-0000-000000000105

-- To force EMPTY for this QA treasure without Giftishow:
-- update public.treasure_rewards
--    set remaining_quantity = 0, updated_at = now()
--  where id = '70000000-0000-0000-0000-000000000105';

-- To delete only this QA fixture:
-- delete from public.inventory_items where treasure_box_id = '50000000-0000-0000-0000-000000000105';
-- delete from public.treasure_claims where treasure_box_id = '50000000-0000-0000-0000-000000000105';
-- delete from public.treasure_rewards where id = '70000000-0000-0000-0000-000000000105';
-- delete from public.treasure_boxes where id = '50000000-0000-0000-0000-000000000105';
-- delete from public.gift_products where id = '60000000-0000-0000-0000-000000000105';
