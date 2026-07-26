-- Development-only mock seed for 001_init_mvp_schema.sql.
-- Never run this in production. The auth rows are deterministic fixtures, not real accounts.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'dev-super-admin@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dev Super Admin"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'dev-operator@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dev Operator"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'dev-hunter-one@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"nickname":"蹂대Ъ?щ깷袁?}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'dev-hunter-two@example.test', crypt('dev-only-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"nickname":"吏?꾪깘?섍?"}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.admin_users (id, user_id, name, email, role, status, last_login_at)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Dev Super Admin', 'dev-super-admin@example.test', 'super_admin', 'active', now() - interval '1 hour'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Dev Operator', 'dev-operator@example.test', 'operator', 'active', now() - interval '2 hours')
on conflict (user_id) do update set name = excluded.name, role = excluded.role, status = excluded.status, updated_at = now();

insert into public.profiles (id, user_id, nickname, avatar_key, background_key, intro_text, terms_agreed_at, marketing_agreed_at, status)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '蹂대Ъ?щ깷袁?, 'avatar_dev_01', 'background_dev_01', '?ㅻ뒛???곸옄瑜?李얜뒗 以?', now() - interval '14 days', now() - interval '14 days', 'active'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '吏?꾪깘?섍?', 'avatar_dev_02', 'background_dev_02', '?⑥? 湲몄쓣 醫뗭븘?댁슂.', now() - interval '7 days', null, 'active')
on conflict (user_id) do update set nickname = excluded.nickname, avatar_key = excluded.avatar_key, updated_at = now();

insert into public.treasure_boxes (id, title, description, hint_text, latitude, longitude, radius_m, status, starts_at, ends_at, max_claim_count, current_claim_count, created_by)
values
  ('50000000-0000-0000-0000-000000000001', '?쒓컯 怨듭썝 蹂대Ъ?곸옄', '?곗콉湲?洹쇱쿂???⑥? 泥?踰덉㎏ ?곸옄', '臾쇰튆??諛섏쭩?대뒗 ?곗콉濡쒕? ?곕씪媛 遊?', 37.528300, 126.932700, 80, 'active', now() - interval '1 day', now() + interval '14 days', 20, 1, '30000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '?깆닔 怨⑤ぉ 蹂대Ъ?곸옄', '怨⑤ぉ湲몄뿉??留뚮굹???묒? 蹂댁긽', '踰쏀솕媛 蹂댁씠??紐⑦뎮?대? 李얠븘遊?', 37.544600, 127.055900, 60, 'active', now() - interval '2 hours', now() + interval '7 days', 10, 0, '30000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', '?ㅼ쓬 二??ㅽ뵂 ?곸옄', '媛쒕컻???덉빟 蹂대Ъ?곸옄', '?꾩쭅 ?대━吏 ?딆? ?곸옄??', 37.566500, 126.978000, 50, 'draft', now() + interval '7 days', now() + interval '21 days', 5, 0, '30000000-0000-0000-0000-000000000001')
on conflict (id) do update set title = excluded.title, status = excluded.status, updated_at = now();

insert into public.gift_products (id, provider, provider_product_id, brand_name, product_name, product_image_url, price, status, created_by)
values
  ('60000000-0000-0000-0000-000000000001', 'manual_mock', 'dev-coffee-001', '紐⑥뭅??, '?꾨찓由ъ뭅??援먰솚沅?, 'https://example.test/mock/coffee.png', 4500, 'active', '30000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'manual_mock', 'dev-snack-001', '?ㅻ궢?섏슦??, '荑좏궎 ?명듃 援먰솚沅?, 'https://example.test/mock/cookie.png', 3500, 'active', '30000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'manual_mock', 'dev-store-001', '?몄쓽??, '紐⑤컮???곹뭹沅?5泥쒖썝', 'https://example.test/mock/store.png', 5000, 'inactive', '30000000-0000-0000-0000-000000000001')
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
  ('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'reward', '蹂댁긽 諛쒓툒 ?곹깭媛 沅곴툑?댁슂', '蹂닿??⑥뿉 以鍮?以묒쑝濡??쒖떆?⑸땲??', 'reading', now() - interval '1 day'),
  ('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'general', '???ъ슜 諛⑸쾿 臾몄쓽', '蹂대Ъ ?뚰듃???대뵒?먯꽌 ?뺤씤?섎굹??', 'reading', now() - interval '2 days'),
  ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'bug', '吏???붾㈃ ?꾩튂媛 ?댁깋?댁슂', '?꾩옱 ?꾩튂? 留덉빱媛 議곌툑 ?ㅻⅤ寃?蹂댁엯?덈떎.', 'resolved', now() - interval '3 days')
on conflict (id) do update set title = excluded.title, content = excluded.content, updated_at = now();

insert into public.support_replies (id, inquiry_id, admin_user_id, content, created_at)
values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '?쒕낫 媛먯궗?⑸땲?? ?ㅼ쓬 ?낅뜲?댄듃?먯꽌 ?꾩튂 ?쒖떆瑜??먭??섍쿋?듬땲??', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.notifications (id, user_id, type, title, body, target_route, is_read, created_at)
values
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'treasure', '??蹂대Ъ?곸옄 諛쒓껄', '?깆닔 怨⑤ぉ 洹쇱쿂?????곸옄媛 ?섑??ъ뼱??', '/map', false, now() - interval '30 minutes'),
  ('c0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'coupon', '蹂댁긽??以鍮꾨릱?댁슂', '蹂닿??⑥뿉??蹂댁긽 ?곹깭瑜??뺤씤??遊?', '/inventory', false, now() - interval '3 hours'),
  ('c0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'support', '臾몄쓽 ?듬? ?꾩갑', '?깅줉??臾몄쓽???듬????꾩갑?덉뼱??', '/support/a0000000-0000-0000-0000-000000000003', true, now() - interval '2 days')
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
