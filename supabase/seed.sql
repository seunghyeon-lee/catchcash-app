-- Development-only mock seed for 001_init_mvp_schema.sql.
-- Never run this in production. The auth rows are deterministic fixtures, not real accounts.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'dev-super-admin@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dev Super Admin"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'dev-operator@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dev Operator"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'dev-hunter-one@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"nickname":"보물사냥꾼"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'dev-hunter-two@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"nickname":"지도탐험가"}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.admin_users (id, user_id, name, email, role, status, last_login_at)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Dev Super Admin', 'dev-super-admin@example.test', 'super_admin', 'active', now() - interval '1 hour'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Dev Operator', 'dev-operator@example.test', 'operator', 'active', now() - interval '2 hours')
on conflict (user_id) do update set name = excluded.name, role = excluded.role, status = excluded.status, updated_at = now();

insert into public.profiles (id, user_id, nickname, avatar_key, background_key, intro_text, terms_agreed_at, marketing_agreed_at, status)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '보물사냥꾼', 'avatar_dev_01', 'background_dev_01', '오늘도 상자를 찾는 중.', now() - interval '14 days', now() - interval '14 days', 'active'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '지도탐험가', 'avatar_dev_02', 'background_dev_02', '숨은 길을 좋아해요.', now() - interval '7 days', null, 'active')
on conflict (user_id) do update set nickname = excluded.nickname, avatar_key = excluded.avatar_key, updated_at = now();

insert into public.treasure_boxes (id, title, description, hint_text, latitude, longitude, radius_m, status, starts_at, ends_at, max_claim_count, current_claim_count, created_by)
values
  ('50000000-0000-0000-0000-000000000001', '한강 공원 보물상자', '산책길 근처에 숨은 첫 번째 상자', '물빛이 반짝이는 산책로를 따라가 봐.', 37.528300, 126.932700, 80, 'active', now() - interval '1 day', now() + interval '14 days', 20, 1, '30000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '성수 골목 보물상자', '골목길에서 만나는 작은 보상', '벽화가 보이는 모퉁이를 찾아봐.', 37.544600, 127.055900, 60, 'active', now() - interval '2 hours', now() + interval '7 days', 10, 0, '30000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', '다음 주 오픈 상자', '개발용 예약 보물상자', '아직 열리지 않은 상자야.', 37.566500, 126.978000, 50, 'draft', now() + interval '7 days', now() + interval '21 days', 5, 0, '30000000-0000-0000-0000-000000000001')
on conflict (id) do update set title = excluded.title, status = excluded.status, updated_at = now();

insert into public.gift_products (id, provider, provider_product_id, brand_name, product_name, product_image_url, price, status, created_by)
values
  ('60000000-0000-0000-0000-000000000001', 'manual_mock', 'dev-coffee-001', '모카랩', '아메리카노 교환권', 'https://example.test/mock/coffee.png', 4500, 'active', '30000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'manual_mock', 'dev-snack-001', '스낵하우스', '쿠키 세트 교환권', 'https://example.test/mock/cookie.png', 3500, 'active', '30000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'manual_mock', 'dev-store-001', '편의점', '모바일 상품권 5천원', 'https://example.test/mock/store.png', 5000, 'inactive', '30000000-0000-0000-0000-000000000001')
on conflict (provider, provider_product_id) do update set product_name = excluded.product_name, status = excluded.status, updated_at = now();

insert into public.treasure_rewards (id, treasure_box_id, gift_product_id, reward_quantity, remaining_quantity, reward_type, status, created_by)
values
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 20, 19, 'coupon', 'active', '30000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 10, 10, 'coupon', 'active', '30000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', null, 5, 5, 'empty', 'active', '30000000-0000-0000-0000-000000000001')
on conflict (id) do update set remaining_quantity = excluded.remaining_quantity, status = excluded.status, updated_at = now();

insert into public.treasure_claims (id, user_id, treasure_box_id, treasure_reward_id, result, distance_m, claimed_latitude, claimed_longitude, created_at)
values
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'success', 21.50, 37.528310, 126.932690, now() - interval '3 hours'),
  ('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'too_far', 144.20, 37.527000, 126.930000, now() - interval '2 hours')
on conflict (id) do nothing;

insert into public.inventory_items (id, user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id, status, issued_at, expired_at, coupon_code, barcode_value)
values
  ('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'ready', null, now() + interval '30 days', null, null)
on conflict (id) do update set status = excluded.status, updated_at = now();

insert into public.support_inquiries (id, user_id, category, title, content, status, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'reward', '보상 발급 상태가 궁금해요', '보관함에 준비 중으로 표시됩니다.', 'reading', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'general', '앱 사용 방법 문의', '보물 힌트는 어디에서 확인하나요?', 'reading', now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'bug', '지도 화면 위치가 어색해요', '현재 위치와 마커가 조금 다르게 보입니다.', 'resolved', now() - interval '3 days')
on conflict (id) do update set title = excluded.title, content = excluded.content, updated_at = now();

insert into public.support_replies (id, inquiry_id, admin_user_id, content, created_at)
values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '제보 감사합니다. 다음 업데이트에서 위치 표시를 점검하겠습니다.', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.notifications (id, user_id, type, title, body, target_route, is_read, created_at)
values
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'treasure', '새 보물상자 발견', '성수 골목 근처에 새 상자가 나타났어요.', '/map', false, now() - interval '30 minutes'),
  ('c0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'coupon', '보상이 준비됐어요', '보관함에서 보상 상태를 확인해 봐.', '/inventory', false, now() - interval '3 hours'),
  ('c0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'support', '문의 답변 도착', '등록한 문의에 답변이 도착했어요.', '/support/a0000000-0000-0000-0000-000000000003', true, now() - interval '2 days')
on conflict (id) do nothing;

insert into public.operation_logs (id, admin_user_id, action, target_table, target_id, metadata, created_at)
values
  ('d0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'create', 'treasure_boxes', '50000000-0000-0000-0000-000000000001', '{"source":"seed"}'::jsonb, now() - interval '1 day'),
  ('d0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'reply', 'support_inquiries', 'a0000000-0000-0000-0000-000000000003', '{"source":"seed"}'::jsonb, now() - interval '2 days')
on conflict (id) do nothing;

insert into public.security_logs (id, user_id, admin_user_id, event_type, ip_address, user_agent, metadata, created_at)
values
  ('e0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'admin_login_success', '127.0.0.1', 'seed-script', '{"source":"seed"}'::jsonb, now() - interval '1 hour'),
  ('e0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', null, 'unauthorized_admin_access', '127.0.0.1', 'seed-script', '{"route":"/admin/security-logs"}'::jsonb, now() - interval '45 minutes')
on conflict (id) do nothing;
