-- AR 사냥 보물 획득 판정을 서버(DB 함수)에서 원자적으로 처리하는 RPC.
--
-- 계약 문서: docs/db/Claim_Treasure_RPC_Contract.md
--
-- 구성
--   1. treasure_claims (user_id, treasure_box_id) where result = 'success' partial unique index
--      → 동일 사용자·동일 보물상자 성공 claim 1건 보장(DB 레벨 중복 방어).
--   2. public.claim_treasure_with_lock(p_treasure_id, p_latitude, p_longitude) returns jsonb
--      → 인증 / 계정 상태 / 보물 존재 / 활성 상태 / 기간 / 서버 거리 / 반경 / 중복 / 수량 / 동시성 검증 후
--        treasure_claims(+ 성공 시 inventory_items ready) insert.
--   3. execute 권한: authenticated, service_role 만. anon / public 은 호출 불가.
--
-- 롤백 SQL은 파일 하단 주석 참고.

-- ---------------------------------------------------------------------------
-- 1. 중복 성공 claim 방어용 partial unique index
-- ---------------------------------------------------------------------------
-- 기존 데이터에 동일 user + box 성공 claim이 2건 이상 있으면 index 생성이 실패한다.
-- 데이터 삭제 없이 적용할 수 있도록 사전 점검 후 명확한 메시지로 중단시킨다.
-- (중복이 있을 때의 정리 SQL 예시는 계약 문서 "적용 전 점검" 절 참고)
do $$
declare
  v_dup_count integer;
begin
  select count(*)
    into v_dup_count
    from (
      select user_id, treasure_box_id
        from public.treasure_claims
       where result = 'success'
       group by user_id, treasure_box_id
      having count(*) > 1
    ) d;

  if v_dup_count > 0 then
    raise exception
      'treasure_claims에 동일 user_id+treasure_box_id 성공 claim 중복 %건 존재. partial unique index를 만들 수 없습니다. docs/db/Claim_Treasure_RPC_Contract.md "적용 전 점검" 절의 정리 SQL을 먼저 검토·실행하세요.',
      v_dup_count;
  end if;
end;
$$;

create unique index if not exists treasure_claims_user_box_success_uidx
  on public.treasure_claims (user_id, treasure_box_id)
  where result = 'success';

-- ---------------------------------------------------------------------------
-- 2. RPC
-- ---------------------------------------------------------------------------
create or replace function public.claim_treasure_with_lock(
  p_treasure_id uuid,
  p_latitude double precision,
  p_longitude double precision
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  -- radius_m 이 유효하지 않을 때(null / 0 / 음수) 사용하는 기본 허용 반경(m)
  c_default_radius_m constant integer := 20;
  -- Haversine 지구 반지름(m)
  c_earth_radius_m constant double precision := 6371000.0;

  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_profile_status public.profile_status;
  v_box public.treasure_boxes%rowtype;
  v_reward public.treasure_rewards%rowtype;
  v_radius_m integer;
  v_distance_m numeric(10, 2);
  v_claim_id uuid;
  v_inventory_item_id uuid;
  v_result jsonb;
begin
  -- 응답 기본 골격. 이후 단계에서 || 로 필요한 키만 덮어쓴다.
  v_result := jsonb_build_object(
    'status', null,
    'ok', false,
    'claim_id', null,
    'claim_result', null,
    'treasure_box_id', p_treasure_id,
    'treasure_reward_id', null,
    'reward_type', null,
    'gift_product_id', null,
    'inventory_item_id', null,
    'distance_m', null,
    'radius_m', null,
    'detail', null
  );

  -- 1) 인증: 사용자 ID는 클라이언트 입력이 아니라 JWT(auth.uid())만 신뢰한다.
  if v_user_id is null then
    return v_result || jsonb_build_object('status', 'UNAUTHENTICATED');
  end if;

  -- 2) 계정 상태: 프로필이 있고 active 가 아니면 사냥 불가. (프로필 미생성 사용자는 막지 않는다)
  select p.status into v_profile_status
    from public.profiles p
   where p.user_id = v_user_id;

  if found and v_profile_status <> 'active' then
    return v_result || jsonb_build_object('status', 'SUSPENDED_USER', 'detail', v_profile_status::text);
  end if;

  -- 3) 입력 GPS 방어: null / NaN / Infinity / 범위 밖 → LOCATION_ERROR
  --    (NaN, Infinity 는 between 비교에서 false 가 되어 함께 걸러진다)
  if p_latitude is null or p_longitude is null
     or not (p_latitude between -90 and 90)
     or not (p_longitude between -180 and 180) then
    return v_result || jsonb_build_object('status', 'LOCATION_ERROR', 'detail', 'INVALID_COORDINATES');
  end if;

  if p_treasure_id is null then
    return v_result || jsonb_build_object('status', 'INVALID_TREASURE', 'detail', 'NULL_ID');
  end if;

  -- 4) 보물 조회 + 행 잠금.
  --    같은 보물상자에 대한 모든 claim 요청은 이 행 잠금으로 직렬화된다.
  --    → 중복 검사 / 수량 확인·차감 / claim insert 가 한 transaction 안에서 순서대로 실행된다.
  select * into v_box
    from public.treasure_boxes tb
   where tb.id = p_treasure_id
     for update;

  if not found then
    return v_result || jsonb_build_object('status', 'INVALID_TREASURE', 'detail', 'NOT_FOUND');
  end if;

  -- 5) 활성 상태 (treasure_status enum: draft / active / paused / ended / deleted)
  if v_box.deleted_at is not null or v_box.status = 'deleted' then
    return v_result || jsonb_build_object('status', 'INVALID_TREASURE', 'detail', 'DELETED');
  end if;

  if v_box.status = 'ended' then
    insert into public.treasure_claims (user_id, treasure_box_id, result, claimed_latitude, claimed_longitude)
    values (v_user_id, v_box.id, 'expired', p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EXPIRED_TREASURE', 'claim_id', v_claim_id, 'claim_result', 'expired', 'detail', 'STATUS_ENDED'
    );
  end if;

  if v_box.status <> 'active' then
    -- draft / paused
    return v_result || jsonb_build_object('status', 'INVALID_TREASURE', 'detail', 'STATUS_' || upper(v_box.status::text));
  end if;

  -- 6) 기간: DB 시각(now()) 기준. 클라이언트 시각은 사용하지 않는다.
  if v_box.starts_at is not null and v_box.starts_at > v_now then
    return v_result || jsonb_build_object('status', 'INVALID_TREASURE', 'detail', 'NOT_STARTED');
  end if;

  if v_box.ends_at is not null and v_box.ends_at <= v_now then
    insert into public.treasure_claims (user_id, treasure_box_id, result, claimed_latitude, claimed_longitude)
    values (v_user_id, v_box.id, 'expired', p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EXPIRED_TREASURE', 'claim_id', v_claim_id, 'claim_result', 'expired', 'detail', 'ENDS_AT_PASSED'
    );
  end if;

  -- 7) 서버 거리 계산 (Haversine, m) + 허용 반경
  v_radius_m := case
    when v_box.radius_m is null or v_box.radius_m <= 0 then c_default_radius_m
    else v_box.radius_m
  end;

  v_distance_m := round(
    (
      2 * c_earth_radius_m * asin(
        least(
          1.0,
          sqrt(
            power(sin(radians(p_latitude - v_box.latitude::double precision) / 2), 2)
            + cos(radians(v_box.latitude::double precision))
              * cos(radians(p_latitude))
              * power(sin(radians(p_longitude - v_box.longitude::double precision) / 2), 2)
          )
        )
      )
    )::numeric,
    2
  );

  v_result := v_result || jsonb_build_object('distance_m', v_distance_m, 'radius_m', v_radius_m);

  if v_distance_m > v_radius_m then
    insert into public.treasure_claims
      (user_id, treasure_box_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, 'too_far', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object('status', 'TOO_FAR', 'claim_id', v_claim_id, 'claim_result', 'too_far');
  end if;

  -- 8) 중복: 동일 사용자 + 동일 보물상자 성공 claim 재획득 금지.
  --    보물상자 행 잠금 아래에서 조회하므로 같은 사용자의 동시 요청도 직렬화된다.
  --    (추가로 partial unique index 가 insert 시점에 한 번 더 막는다 → unique_violation 분기)
  if exists (
    select 1
      from public.treasure_claims tc
     where tc.user_id = v_user_id
       and tc.treasure_box_id = v_box.id
       and tc.result = 'success'
  ) then
    insert into public.treasure_claims
      (user_id, treasure_box_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, 'already_claimed', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'ALREADY_CLAIMED', 'claim_id', v_claim_id, 'claim_result', 'already_claimed'
    );
  end if;

  -- 9) 수량: 보물상자 자체 한도(max_claim_count) + 활성 보상 매핑 잔여 수량(remaining_quantity)
  --    둘 중 하나라도 소진이면 정상 게임 결과 EMPTY (상자는 열리고 빈 상자).
  if v_box.current_claim_count >= v_box.max_claim_count then
    insert into public.treasure_claims
      (user_id, treasure_box_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, 'empty', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EMPTY', 'ok', true, 'claim_id', v_claim_id, 'claim_result', 'empty', 'detail', 'BOX_QUOTA_EXHAUSTED'
    );
  end if;

  -- 활성 보상 매핑 행 잠금 (보물상자당 active 는 최대 1건: treasure_rewards_one_active_per_box_idx)
  select * into v_reward
    from public.treasure_rewards tr
   where tr.treasure_box_id = v_box.id
     and tr.status = 'active'
     for update;

  if not found then
    insert into public.treasure_claims
      (user_id, treasure_box_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, 'empty', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EMPTY', 'ok', true, 'claim_id', v_claim_id, 'claim_result', 'empty', 'detail', 'NO_ACTIVE_REWARD'
    );
  end if;

  v_result := v_result || jsonb_build_object(
    'treasure_reward_id', v_reward.id,
    'reward_type', v_reward.reward_type,
    'gift_product_id', v_reward.gift_product_id
  );

  if v_reward.reward_type = 'empty' then
    -- 운영자가 의도적으로 매핑한 빈 보상: 수량 차감 없이 빈 상자 결과.
    insert into public.treasure_claims
      (user_id, treasure_box_id, treasure_reward_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, v_reward.id, 'empty', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EMPTY', 'ok', true, 'claim_id', v_claim_id, 'claim_result', 'empty', 'detail', 'EMPTY_REWARD'
    );
  end if;

  if v_reward.remaining_quantity <= 0 then
    insert into public.treasure_claims
      (user_id, treasure_box_id, treasure_reward_id, result, distance_m, claimed_latitude, claimed_longitude)
    values
      (v_user_id, v_box.id, v_reward.id, 'empty', v_distance_m, p_latitude, p_longitude)
    returning id into v_claim_id;

    return v_result || jsonb_build_object(
      'status', 'EMPTY', 'ok', true, 'claim_id', v_claim_id, 'claim_result', 'empty', 'detail', 'REWARD_SOLD_OUT'
    );
  end if;

  -- 10) 성공: 수량 차감 + 보물상자 획득 수 증가 + claim insert + 보관함 ready row 생성 (같은 transaction)
  --     remaining_quantity >= 0 / current_claim_count <= max_claim_count 는 위 검사 + check constraint 로 이중 보장.
  update public.treasure_rewards
     set remaining_quantity = remaining_quantity - 1
   where id = v_reward.id;

  update public.treasure_boxes
     set current_claim_count = current_claim_count + 1
   where id = v_box.id;

  insert into public.treasure_claims
    (user_id, treasure_box_id, treasure_reward_id, result, distance_m, claimed_latitude, claimed_longitude)
  values
    (v_user_id, v_box.id, v_reward.id, 'success', v_distance_m, p_latitude, p_longitude)
  returning id into v_claim_id;

  insert into public.inventory_items
    (user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id, status)
  values
    (v_user_id, v_claim_id, v_box.id, v_reward.id, v_reward.gift_product_id, 'ready')
  returning id into v_inventory_item_id;

  return v_result || jsonb_build_object(
    'status', 'SUCCESS',
    'ok', true,
    'claim_id', v_claim_id,
    'claim_result', 'success',
    'inventory_item_id', v_inventory_item_id
  );

exception
  when unique_violation then
    -- treasure_claims_user_box_success_uidx 충돌: 행 잠금을 우회한 경로가 있더라도 성공 claim 은 1건만 남는다.
    -- (이 블록에 들어오면 위에서 수행한 update/insert 는 모두 롤백된다)
    return v_result || jsonb_build_object('status', 'ALREADY_CLAIMED', 'claim_result', null, 'detail', 'UNIQUE_VIOLATION');
  when others then
    raise warning 'claim_treasure_with_lock failed: % (%)', sqlerrm, sqlstate;
    return v_result || jsonb_build_object('status', 'SERVER_ERROR', 'detail', sqlstate);
end;
$$;

comment on function public.claim_treasure_with_lock(uuid, double precision, double precision) is
  'AR 사냥 보물 획득 서버 판정. auth.uid() 기준으로 인증/계정상태/보물상태/기간/거리(radius_m, 무효 시 20m)/중복/수량/동시성(FOR UPDATE)을 검증하고 treasure_claims(성공 시 inventory_items ready 포함)를 기록한다. 반환: jsonb {status, ok, claim_id, claim_result, treasure_box_id, treasure_reward_id, reward_type, gift_product_id, inventory_item_id, distance_m, radius_m, detail}. 계약: docs/db/Claim_Treasure_RPC_Contract.md';

-- ---------------------------------------------------------------------------
-- 3. 권한: 로그인 사용자만 호출. anon / public 은 호출 불가.
--    (Supabase 기본 default privilege 로 anon 에 execute 가 붙을 수 있어 명시적으로 회수)
-- ---------------------------------------------------------------------------
revoke all on function public.claim_treasure_with_lock(uuid, double precision, double precision) from public;
revoke all on function public.claim_treasure_with_lock(uuid, double precision, double precision) from anon;
grant execute on function public.claim_treasure_with_lock(uuid, double precision, double precision) to authenticated;
grant execute on function public.claim_treasure_with_lock(uuid, double precision, double precision) to service_role;

-- ---------------------------------------------------------------------------
-- Rollback (필요 시 Supabase SQL editor 에서 실행)
-- ---------------------------------------------------------------------------
-- drop function if exists public.claim_treasure_with_lock(uuid, double precision, double precision);
-- drop index if exists public.treasure_claims_user_box_success_uidx;
--
-- 참고: 함수가 이미 기록한 treasure_claims / inventory_items 행과 차감된 remaining_quantity /
-- 증가된 current_claim_count 는 데이터이므로 롤백 SQL 로 되돌리지 않는다.
