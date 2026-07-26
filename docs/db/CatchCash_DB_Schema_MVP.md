# CatchCash Supabase DB Schema MVP

## 1. DB 설계 목적

이 설계는 캐치캐쉬 사용자 앱과 관리자 CMS의 MVP 운영 데이터를 Supabase PostgreSQL로 분리·보호하기 위한 기준이다. 사용자 인증은 `auth.users`가 담당하고, 앱 도메인 데이터와 관리자 역할은 `public` 스키마에서 관리한다. 이 PR은 SQL과 문서만 제공하며 실제 Supabase 프로젝트에는 적용하지 않는다.

## 2. 전체 테이블 목록

| 영역 | 테이블 | 역할 |
| --- | --- | --- |
| 계정 | `profiles` | 사용자 프로필·약관 동의·상태 |
| 계정 | `admin_users` | 관리자 역할·상태·마지막 로그인 |
| 보물 | `treasure_boxes` | 위치, 운영 기간, 반경, 수량이 있는 보물상자 |
| 보상 카탈로그 | `gift_products` | Giftishow Biz 또는 mock 상품 메타데이터 |
| 보상 매핑 | `treasure_rewards` | 보물상자와 상품/빈 보상의 연결 |
| 사냥 | `treasure_claims` | 사용자의 사냥 시도와 결과 |
| 보관함 | `inventory_items` | 발급 가능한 보상과 발급 상태 |
| 재처리 | `reward_retry_requests` | 관리자 재발급/재처리 요청 이력 |
| 문의 | `support_inquiries` | 사용자 문의 |
| 문의 | `support_replies` | 관리자 답변 |
| 알림 | `notifications` | 사용자 알림함 데이터 |
| 감사 | `operation_logs` | 일반 관리자 작업 로그 |
| 보안 | `security_logs` | 로그인·권한·민감 정보 이벤트 |

## 3. 테이블별 역할과 주요 컬럼

- `profiles`: `auth.users.id`와 `user_id`로 1:1 연결한다. 닉네임, 아바타/배경 키, 소개, 이용약관·마케팅 동의 시각, 계정 상태를 둔다.
- `admin_users`: 별도 `auth.users` 계정을 참조한다. `super_admin`, `operator`, `viewer` 역할과 `active`, `inactive`, `locked` 상태를 둔다. `locked`는 CMS 기능 명세의 관리자 잠금 상태를 반영한 보조 상태다.
- `treasure_boxes`: `numeric(9,6)` 위도·경도와 미터 단위 반경을 저장한다. `deleted_at`과 `status=deleted`를 함께 사용해 soft delete를 명확하게 표현한다.
- `gift_products`: 외부 상품을 아직 호출하지 않고 제공자 식별자, 표시명, 가격, 이미지 URL, 상태만 저장한다.
- `treasure_rewards`: MVP에서는 partial unique index로 보물상자당 `active` 매핑을 하나만 허용한다. `empty` 보상은 상품 FK 없이 저장한다.
- `treasure_claims`: 성공·실패·거리 초과 등 모든 사냥 결과와 당시 좌표/거리를 남긴다.
- `inventory_items`: 보관함과 보상 상세의 원본이다. 쿠폰 코드·바코드·공급자 식별자는 이 테이블에만 둔다.
- `reward_retry_requests`: 실패 보상에 대한 관리자 재처리 요청과 공급자 응답 JSON을 보관한다.
- `support_inquiries`/`support_replies`: 사용자 문의와 관리자 답변을 분리한다. MVP 문의 상태는 요구사항대로 `reading`, `resolved` 두 단계다.
- `notifications`: 알림 유형, 읽음 처리, 앱 내 이동 경로를 저장한다.
- 로그 테이블: JSONB `metadata`로 변경 전후 값, 요청 원인 등 확장 메타데이터를 기록한다.

## 4. 관계 설명

```text
auth.users ── 1:1 ── profiles
auth.users ── 1:0..1 ── admin_users
treasure_boxes ── 1:N ── treasure_rewards ── N:1 ── gift_products
auth.users ── 1:N ── treasure_claims ── 0..1:1 ── inventory_items
auth.users ── 1:N ── support_inquiries ── 1:N ── support_replies
auth.users ── 1:N ── notifications
inventory_items ── 1:N ── reward_retry_requests
admin_users ── 1:N ── operation_logs / support_replies / reward_retry_requests
```

## 5. 사용자 앱 플로우와 DB 연결

- 로그인 후 프로필이 없으면 `/nickname`에서 `profiles`를 생성하고 동의 시각을 기록한다.
- 홈·지도는 로그인 사용자가 `active`, 미삭제 보물상자와 활성 보상 매핑을 읽는다.
- AR 사냥은 `treasure_claims`에 결과를 남긴다. 실제 출시 전에는 클라이언트 직접 insert보다 서버/RPC에서 위치·기간·수량을 검증해야 한다.
- 성공 결과는 서버 작업이 `inventory_items`의 `ready` row를 만든다. 보관함 목록은 `inventory_item_list` view를 사용해 쿠폰 코드/바코드를 조회하지 않는다.
- 명예의 전당은 다른 사용자의 민감 프로필을 노출하지 않는 `hall_of_fame` view를 사용한다. 이 view만 랭킹 노출을 위해 `security_invoker=false`를 명시하며, 내부 user ID·소개·약관 시각은 투영하지 않는다.
- 알림함은 `notifications`를 사용자별로 필터링하고 읽음 처리한다.

## 6. 관리자 CMS 플로우와 DB 연결

- 대시보드는 `admin_dashboard_stats`, 사용자 상세는 `admin_user_statistics`, 보상 목록은 `admin_reward_list`를 기반으로 한다.
- 보물·상품·매핑 CRUD는 각각 `treasure_boxes`, `gift_products`, `treasure_rewards`를 사용한다.
- 관리자 계정 관리는 `admin_users`이며 super_admin만 변경한다.
- 보상 상세/재처리 화면은 `inventory_items`, `reward_retry_requests`를 사용한다. CMS 목록/상세 응답에는 쿠폰 코드·바코드를 포함하지 않는 것이 원칙이다.
- 모든 관리자 mutation은 애플리케이션 서버에서 `operation_logs`를 남긴다. RLS는 방어선이며, route handler/server action에서 역할을 한 번 더 검증한다.

## 7. 문의 플로우와 알림 구조

사용자는 `/support`에서 자기 `support_inquiries`만 보고 `/support/new`에서 작성한다. `/support/{inquiryId}`는 본인 문의와 그 문의의 답변만 읽는다. 관리자가 `support_replies`를 insert하면 `resolve_inquiry_after_reply` trigger가 문의 상태를 `resolved`로 바꾸고 `notifications`에 `type=support`, `target_route=/support/{inquiryId}` 알림을 만든다.

MVP에서는 데이터 일관성을 위해 trigger를 사용한다. 향후 발송 채널, 템플릿, 재시도 큐가 필요하면 trigger는 outbox row만 만들고 Edge Function/worker가 외부 전달을 처리하도록 확장한다.

## 8. 보물 사냥·보상 지급·재발급 플로우

1. 위치·기간·수량 검증을 통과한 사냥 결과를 `treasure_claims`에 기록한다.
2. 성공 시 활성 `treasure_rewards`를 참조해 `inventory_items(status=ready)`를 만든다.
3. 서버 전용 발급 작업이 Giftishow Biz를 호출하는 미래 단계에서 `issued` 또는 `failed`로 갱신한다. 이 migration은 외부 호출을 포함하지 않는다.
4. 실패 보상은 운영자가 `reward_retry_requests`에 요청을 남긴다. Worker가 처리한 결과만 `provider_response`, `after_status`, `processed_at`에 기록한다.

`current_claim_count`와 `remaining_quantity` 갱신은 경쟁 조건이 있으므로 실제 구현 시 단일 RPC/transaction에서 `FOR UPDATE` 또는 조건부 update로 처리한다. 클라이언트가 직접 수량을 갱신하면 안 된다.

## 9. enum, 제약, index

Migration은 프로필/관리자/보물/상품/보상/사냥/보관함/재처리/문의/알림 상태를 PostgreSQL enum으로 정의한다. 좌표 범위, 반경, 수량, 기간, 닉네임·문의 길이, 빈 보상 상품 FK 관계를 check constraint로 제한한다.

주요 index는 지도용 보물 상태·좌표, 사용자별 사냥/보관함/문의/알림, 관리자 보상 상태, 문의 상태, 답변, 재처리 및 로그 조회를 대상으로 한다. `treasure_rewards_one_active_per_box_idx`는 보물상자당 활성 상품 하나라는 MVP 명세를 강제한다.

## 10. RLS 정책 요약

- 모든 도메인 테이블에 RLS를 enable한다.
- 사용자는 자신의 profile, claim, inventory, 문의, 답변, 알림만 읽고 허용된 데이터만 작성/수정한다.
- 지도/상품/보상 매핑은 로그인 사용자에게 활성 데이터만 보인다.
- `has_admin_role()` security definer helper가 활성 관리자 역할을 판정한다.
- `current_admin_user_id()` security definer helper는 현재 세션의 활성 관리자 row만 반환한다. 답변, 재처리 요청, 운영 로그 insert는 이 값과 작성자 FK가 같아야 하므로 다른 관리자 ID를 가장할 수 없다.
- viewer는 운영 데이터 조회만 가능하고, operator는 일반 운영 mutation·문의 답변·재처리를 수행하며, super_admin은 관리자 계정·보안 로그까지 접근한다.
- `security_logs`는 CMS 기능 명세에 맞춰 super_admin만 읽는다. 일반 operation log는 super_admin/operator가 읽는다.
- `inventory_items`의 민감 컬럼은 본인 또는 관리자 행에서만 접근 가능하다. 앱 목록 API는 반드시 민감 컬럼을 제외한 `inventory_item_list` view를 사용한다.

RLS는 프론트에서 service role key를 사용하지 않는 전제다. service role은 RLS를 우회하므로 Edge Function/서버 환경에서만 보관한다.

## 11. Seed data 설명

`supabase/seed.sql`은 로컬 개발 전용이다. 테스트용 auth fixture 4개, 관리자 2명, 사용자 프로필 2명, 보물상자 3개, 상품 3개, 매핑 3개, 사냥/보관함 예시, 문의 3개와 답변 1개, 알림·작업·보안 로그 예시를 만든다. 모든 이메일은 `.test` 도메인이고 쿠폰 코드·바코드·실제 개인정보는 넣지 않는다.

## 12. 아직 구현하지 않는 것

- 실제 Supabase 프로젝트 적용 및 Auth provider 설정
- Naver Map, 카메라/AR, Giftishow Biz API 호출
- 상품 재고 동기화, 실제 쿠폰 발급/사용 확인
- 첨부 파일, 실시간 상담, 관리자 초대/비밀번호 재설정
- PostGIS 반경 검색, outbox worker, Cron 만료 처리
- 관리자 화면별 세부 permission matrix의 DB 테이블화

## 13. 추후 확장 포인트

- 위치 성능이 필요하면 `postgis`의 `geography(Point, 4326)`와 GIST index를 추가하고 `latitude`/`longitude`를 마이그레이션한다.
- 보물상자 다중 보상, 확률형 보상, 포인트 지갑은 reward allocation 또는 ledger 테이블로 확장한다.
- 공급자 원문 payload, 쿠폰 암호화, outbox 이벤트, 관리자 권한 permission 테이블, 문의 첨부/내부 메모를 별도 테이블로 분리한다.
- 명예의 전당은 기간별 materialized view 또는 집계 테이블로 전환한다.

## 14. 실제 Supabase 적용 전 확인 체크리스트

- [ ] Supabase CLI로 빈 개발 프로젝트에 migration을 먼저 검증한다.
- [ ] `auth.users` seed fixture가 대상 Supabase Auth 버전의 제약과 호환되는지 로컬에서 확인한다.
- [ ] 운영에서는 seed의 개발용 비밀번호/이메일을 절대 실행하지 않는다.
- [ ] Auth 가입 직후 profile 생성 방식을 trigger, server action, RPC 중 하나로 확정한다.
- [ ] 사냥 성공·수량 차감·inventory 생성은 원자적 RPC/transaction으로 구현한다.
- [ ] Giftishow 쿠폰 코드·바코드는 암호화/마스킹, detail 전용 API, 감사 로그를 설계한다.
- [ ] RLS 정책을 사용자·viewer·operator·super_admin 시나리오로 e2e 테스트한다.
- [ ] View의 `security_invoker` 설정과 grant를 실제 Supabase PostgreSQL 버전에서 검증한다.
- [ ] `hall_of_fame`의 의도적 security-definer 공개 범위(닉네임·아바타 키·발견 수·순위) 외 컬럼이 추가되지 않는지 검토한다.
- [ ] soft delete/종료 상태와 scheduled·sold-out 같은 계산 상태를 CMS query에서 확정한다.
- [ ] 운영 로그 작성 지점과 보안 로그 보존 기간·접근 감사 기준을 확정한다.
