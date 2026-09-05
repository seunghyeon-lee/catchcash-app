# Claim RPC 계약 — `claim_treasure_with_lock`

AR 사냥에서 보물 획득 판정을 클라이언트가 아니라 DB 서버 함수에서 원자적으로 처리하기 위한 RPC 계약이다.
Migration: `supabase/migrations/20260902090000_claim_treasure_with_lock_rpc.sql`

## 1. 호출

```ts
const { data, error } = await supabase.rpc("claim_treasure_with_lock", {
  p_treasure_id: treasureId,      // uuid  (treasure_boxes.id)
  p_latitude: coords.latitude,    // double precision (현재 GPS)
  p_longitude: coords.longitude,  // double precision (현재 GPS)
});
```

- 사용자 ID는 넘기지 않는다. 함수 내부에서 `auth.uid()`(JWT)만 사용한다.
- `error`(네트워크/권한 등 supabase-js 레벨 에러)가 아닌 이상 함수는 예외를 던지지 않고 항상 아래 JSON을 반환한다.
- 함수 내부에서 예상 못 한 SQL 오류가 나면 `status = SERVER_ERROR` 로 반환되고, 그 호출에서 수행한 insert/update는 모두 롤백된다.

## 2. 반환값 (jsonb)

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | 판정 결과. 아래 3장 참고 |
| `ok` | boolean | 정상 게임 결과(`SUCCESS`, `EMPTY`)면 `true`. 상자 Open 연출 여부 판단용 |
| `claim_id` | uuid \| null | 기록된 `treasure_claims.id` (기록이 없는 status 는 null) |
| `claim_result` | string \| null | 기록된 `treasure_claims.result` (`success` / `empty` / `too_far` / `expired` / `already_claimed`). `/hunt-result?result=` 값으로 그대로 사용 가능 |
| `treasure_box_id` | uuid \| null | 입력 id 그대로 |
| `treasure_reward_id` | uuid \| null | 판정에 사용된 활성 `treasure_rewards.id` |
| `reward_type` | string \| null | `coupon` / `point` / `empty` |
| `gift_product_id` | uuid \| null | 활성 보상의 상품 id |
| `inventory_item_id` | uuid \| null | `SUCCESS` 시 생성된 `inventory_items.id` (status=`ready`) |
| `distance_m` | number \| null | 서버가 계산한 현재 위치 ↔ 보물 거리(m, 소수 2자리). 거리 계산 단계 이후에만 채워짐 |
| `radius_m` | number \| null | 실제 적용된 허용 반경(m). `radius_m` 이 무효(null/0/음수)면 `20` |
| `detail` | string \| null | 세부 사유 코드(디버깅/QA용, UI 문구 매핑 대상 아님) |

예시:

```json
{ "status": "SUCCESS", "ok": true, "claim_id": "…", "claim_result": "success",
  "treasure_box_id": "…", "treasure_reward_id": "…", "reward_type": "coupon", "gift_product_id": "…",
  "inventory_item_id": "…", "distance_m": 10.01, "radius_m": 50, "detail": null }

{ "status": "TOO_FAR", "ok": false, "claim_id": "…", "claim_result": "too_far",
  "treasure_box_id": "…", "treasure_reward_id": null, "reward_type": null, "gift_product_id": null,
  "inventory_item_id": null, "distance_m": 100.08, "radius_m": 50, "detail": null }
```

## 3. `status` 목록과 AR 정책 매핑

`status` 값은 PR #105 `features/ar/types/ar.types.ts` 의 `ClaimFailureReason` 이름과 정렬했다.

| status | 분류 | 의미 | `claim_result` | AR 처리 (지시서 8장) |
| --- | --- | --- | --- | --- |
| `SUCCESS` | 정상 결과 | 보상 획득. 수량 차감 + claim + 보관함 ready row 생성 | `success` | 상자 Open → `/hunt-result?result=success` |
| `EMPTY` | 정상 결과 | 빈 상자. `detail` 로 사유 구분 (`REWARD_SOLD_OUT` / `BOX_QUOTA_EXHAUSTED` / `NO_ACTIVE_REWARD` / `EMPTY_REWARD`) | `empty` | 상자 Open(lose) → `/hunt-result?result=empty` 권장 (현재 AR은 `fail` 사용, 4장 참고) |
| `TOO_FAR` | 운영 실패 | 서버 거리 > 허용 반경 | `too_far` | 오류 오버레이 (재시도 가능) |
| `EXPIRED_TREASURE` | 운영 실패 | `ends_at` 경과(`ENDS_AT_PASSED`) 또는 status `ended`(`STATUS_ENDED`) | `expired` | 오류 오버레이 |
| `ALREADY_CLAIMED` | 운영 실패 | 같은 사용자가 이미 이 보물에서 성공 claim | `already_claimed` | 오류 오버레이 |
| `INVALID_TREASURE` | 운영 실패 | 없음(`NOT_FOUND`) / `NULL_ID` / 삭제(`DELETED`) / `STATUS_DRAFT` / `STATUS_PAUSED` / 시작 전(`NOT_STARTED`) | null | 오류 오버레이 |
| `UNAUTHENTICATED` | 운영 실패 | `auth.uid()` null | null | 오류 오버레이 (로그인 유도) |
| `SUSPENDED_USER` | 운영 실패 | `profiles.status` 가 `active` 가 아님 (`detail` = 상태값) | null | 오류 오버레이 |
| `LOCATION_ERROR` | 운영 실패 | 입력 좌표 null / NaN / Infinity / 범위 밖 (`INVALID_COORDINATES`) | null | 오류 오버레이 (재시도 가능) |
| `SERVER_ERROR` | 운영 실패 | 예상 못 한 SQL 오류 (`detail` = SQLSTATE). 모든 변경 롤백 | null | 오류 오버레이 (재시도 가능) |

`ALREADY_CLOSED` 는 서버에서 반환하지 않는다(클라이언트 전용 reason 으로 남겨 둠).

## 4. 팀원3(AR) 연결 포인트

`features/ar/hooks/useTreasureClaim.ts` 는 `createHuntClaim` 을 호출한다. RPC 도입 후에는
`lib/hunt/claim-service.ts` 의 `createHuntClaim` 내부(또는 새 함수)를 `supabase.rpc("claim_treasure_with_lock", …)` 로 교체하고
결과를 `ClaimOutcome` 으로 매핑하면 된다. 이 PR 은 AR UI / `features/ar/*` / `lib/hunt/*` 를 수정하지 않는다.

```ts
// 매핑 예시 (참고용, 이 PR 에 포함되지 않음)
if (data.status === "SUCCESS") return { kind: "normal", result: "win", treasureId };
if (data.status === "EMPTY")   return { kind: "normal", result: "lose", treasureId };
return { kind: "failure", reason: data.status /* ClaimFailureReason */, message: … };
```

주의할 점:

- **EMPTY 결과 화면**: AR 의 `handleOpenComplete` 는 lose 를 `?result=fail` 로 보낸다. 결과 화면(`lib/hunt/mappers.ts`)에는 `empty` 콘텐츠("빈 상자")가 이미 있으므로 `data.claim_result`(`empty`)를 그대로 쓰면 더 정확한 문구가 나온다.
- **마지막 1개 성공 시 결과 화면**: `lib/hunt/reward-service.ts` 는 `remaining_quantity <= 0` 이면 보상 이름을 mock 으로 fallback 한다. RPC 가 마지막 수량을 차감하면 성공했는데도 mock 이름이 보일 수 있다. 결과 화면은 `remaining_quantity` 대신 `treasure_reward_id`/`inventory_item_id` 로 보상을 찾는 쪽이 맞다 (팀원2 후속).
- **세션 없음**: RPC 는 로그인 사용자만 호출할 수 있다. 세션 없을 때의 mock 흐름 유지는 클라이언트 몫이며 기존 정책(mock fallback 제거 금지)을 그대로 따른다.
- **거리 무관 AR 진입**: 지도에서 거리와 관계없이 AR 진입 가능하고, 실제 오픈 가능 여부는 이 RPC 가 최종 판정한다.

## 5. 서버 검증 순서와 방식

```
auth.uid() null ────────────────────────── UNAUTHENTICATED
profiles.status ≠ active ───────────────── SUSPENDED_USER
좌표 null/NaN/Inf/범위 밖 ───────────────── LOCATION_ERROR
treasure_boxes 행 SELECT … FOR UPDATE      (여기서부터 같은 보물상자 요청은 직렬화)
  없음 / deleted ─────────────────────────── INVALID_TREASURE
  status ended ───────────────────────────── EXPIRED_TREASURE (+ claim: expired)
  status draft/paused ────────────────────── INVALID_TREASURE
  starts_at > now() ──────────────────────── INVALID_TREASURE (NOT_STARTED)
  ends_at <= now() ───────────────────────── EXPIRED_TREASURE (+ claim: expired)
Haversine 거리 > radius_m(무효면 20) ─────── TOO_FAR (+ claim: too_far)
같은 user 성공 claim 존재 ──────────────────── ALREADY_CLAIMED (+ claim: already_claimed)
current_claim_count >= max_claim_count ──── EMPTY (+ claim: empty)
treasure_rewards(active) SELECT … FOR UPDATE
  없음 / reward_type empty / remaining <= 0 ─ EMPTY (+ claim: empty)
remaining_quantity -1, current_claim_count +1,
claim: success, inventory_items(ready) ───── SUCCESS
```

- 시각은 DB `now()` 만 사용한다. 클라이언트 시각을 받지 않는다.
- 거리는 서버가 Haversine(지구 반지름 6,371,000m)으로 계산한다. `numeric(10,2)` 로 반올림해 `treasure_claims.distance_m` 에도 기록한다.
- 허용 반경은 `treasure_boxes.radius_m` 이고, null/0/음수면 20m. (현재 스키마는 `radius_m between 1 and 10000` check 가 있어 실제로는 항상 유효하지만 방어 로직을 둔다.)

## 6. Transaction / Lock / 중복 방어

- RPC 한 번 = transaction 한 번. 검증, 수량 차감, claim insert, 보관함 insert 가 모두 같은 transaction 에서 처리된다.
- `treasure_boxes` 행 `FOR UPDATE` → 같은 보물상자에 대한 모든 요청이 직렬화된다. 마지막 1개를 두 사용자가 동시에 요청하면 한 명만 `SUCCESS`, 다른 한 명은 잠금 해제 후 `EMPTY`.
- `treasure_rewards`(active) 행도 `FOR UPDATE` 로 잠근 뒤 확인·차감한다. 잔여 수량 음수는 check constraint(`remaining_quantity >= 0`)로도 막힌다.
- 같은 사용자의 동시 요청 2건: 보물상자 잠금으로 직렬화되어 두 번째는 첫 번째의 성공 claim 을 보고 `ALREADY_CLAIMED`.
- 추가 방어선: partial unique index `treasure_claims_user_box_success_uidx (user_id, treasure_box_id) where result = 'success'`. 어떤 경로로든 성공 claim 이 중복 insert 되면 `unique_violation` → 함수는 변경을 롤백하고 `ALREADY_CLAIMED` 를 반환한다.

## 7. claim 기록 정책

`treasure_claims` 는 DB 설계 문서대로 "성공·실패·거리 초과 등 모든 사냥 결과"를 남기는 테이블이므로, 보물이 실제로 존재하고 사용자가 유효한 경우의 판정은 모두 기록한다.

| 기록됨 | 기록 안 됨 |
| --- | --- |
| `success`, `empty`, `too_far`, `expired`, `already_claimed` | `UNAUTHENTICATED`, `SUSPENDED_USER`, `LOCATION_ERROR`, `INVALID_TREASURE`, `SERVER_ERROR` |

기록 컬럼: `user_id`(=auth.uid()), `treasure_box_id`, `treasure_reward_id`(성공/empty 시), `result`, `distance_m`(거리 계산 이후), `claimed_latitude`, `claimed_longitude`, `created_at`(default now()). 기존 스키마 외 컬럼은 추가하지 않았다.

`SUCCESS` 시 `inventory_items` 에 `status='ready'` row 를 함께 만든다(DB 설계 문서 8장 2단계). Giftishow 발급(`issued`/`failed` 갱신)은 이 RPC 범위가 아니다.

## 8. RLS / 권한

- 함수는 `SECURITY DEFINER`, `set search_path = public`. 소유자(postgres) 권한으로 실행되므로 RLS 를 우회해 `treasure_boxes`/`treasure_rewards` 를 갱신하고 `treasure_claims`/`inventory_items` 에 insert 한다.
- 기존 RLS 정책은 그대로다(완화 없음). 클라이언트가 직접 `treasure_rewards`/`treasure_boxes` 수량을 갱신할 수 있게 열지 않았다.
- execute 권한: `authenticated`, `service_role` 만. `public`, `anon` 은 명시적으로 회수 → 비로그인(anon key 만)으로는 호출 자체가 `permission denied`.
- 함수 내부에서도 `auth.uid()` null 이면 `UNAUTHENTICATED` 로 한 번 더 막는다.
- 다른 user_id 를 지정할 입력이 없다.

## 9. 적용 전 점검 (기존 데이터 중복)

migration 은 index 생성 전에 동일 `user_id + treasure_box_id` 성공 claim 중복을 검사하고, 있으면 예외로 중단한다(데이터 삭제 없음).
중복이 있으면 아래처럼 확인한 뒤 리더 판단으로 정리하고 다시 적용한다.

```sql
-- 중복 확인
select user_id, treasure_box_id, count(*), array_agg(id order by created_at) as claim_ids
  from public.treasure_claims
 where result = 'success'
 group by user_id, treasure_box_id
having count(*) > 1;

-- 정리 예시(삭제 없이 최초 1건만 success 로 남기고 나머지는 already_claimed 로 재분류)
update public.treasure_claims tc
   set result = 'already_claimed'
  from (
    select id, row_number() over (partition by user_id, treasure_box_id order by created_at) as rn
      from public.treasure_claims
     where result = 'success'
  ) d
 where d.id = tc.id and d.rn > 1;
```

## 10. Rollback

```sql
drop function if exists public.claim_treasure_with_lock(uuid, double precision, double precision);
drop index if exists public.treasure_claims_user_box_success_uidx;
```

함수가 이미 기록한 `treasure_claims` / `inventory_items` 행과 차감된 `remaining_quantity`, 증가한 `current_claim_count` 는 데이터이므로 되돌리지 않는다.

## 11. 수동 QA 예시 (Supabase SQL editor)

SQL editor 는 `postgres` 로 실행되어 `auth.uid()` 가 null 이므로 RPC 를 직접 부르면 `UNAUTHENTICATED` 가 나온다. 실제 사용자 판정은 앱에서 로그인한 뒤 `supabase.rpc(...)` 로 확인하거나, SQL editor 에서 아래처럼 JWT claim 을 흉내 내서 확인한다.

```sql
-- 특정 사용자로 가장해서 호출 (테스트 프로젝트에서만)
begin;
select set_config('request.jwt.claims', json_build_object('sub', '<auth.users.id>')::text, true);
select public.claim_treasure_with_lock('<treasure_boxes.id>', 37.5665, 126.9780);
rollback;  -- 결과만 보고 되돌리기. 실제 기록하려면 commit
```
