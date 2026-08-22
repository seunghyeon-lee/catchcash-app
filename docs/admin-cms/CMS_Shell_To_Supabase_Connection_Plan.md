# CMS Shell 이후 Supabase 연결 계획

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | CMS Shell 이후 Supabase 연결 계획 |
| 파일명 | `CMS_Shell_To_Supabase_Connection_Plan.md` |
| 작성일 | 2026-08-22 |
| 작성 목적 | mock-only로 완료된 관리자 CMS shell 이후, Supabase 실제 연결을 어떤 순서로 진행할지 리더/팀원이 이해할 수 있도록 정리 |
| 문서 성격 | 연결 범위와 우선순위 계획. 바로 착수하는 작업 지시서가 아님 |

참고 문서:

- `docs/admin-cms/Admin_CMS_Shell_QA_Result.md`
- `docs/admin-cms/CMS_Coding_Rules_And_Component_Guide.md`
- `docs/admin-cms/screens` 하위 A01~A24 화면 정의서
- `supabase/migrations/001_init_mvp_schema.sql`
- `lib/admin/mock-*.ts`, `lib/admin/support-service.ts`

### 1.1 전제 조건

| 전제 | 상태 |
|---|---|
| 관리자 CMS shell 화면 QA | 2026-08-22 수동 확인 완료 |
| A01~A24 화면 shell | 완료 |
| mock-only 기준 | 유지 |
| DB schema | `001_init_mvp_schema.sql` 기준 적용 완료 |
| 기존 문의 fallback | `lib/admin/support-service.ts`에 구조 존재 |
| 외부 API | 이번 연결 계획에서 후순위 |

### 1.2 연결 대상 범위

포함:

- 사용자 앱 Auth / profiles
- 사용자 알림, 보관함, 문의
- 관리자 CMS 주요 목록/상세 조회
- 기존 문의 Supabase fallback 구조 정리

제외 또는 후순위:

- Giftishow Biz 실제 쿠폰 발급
- Naver Map / GPS 실제 연결
- 관리자 권한 가드 고도화 전체
- schema 변경이 필요한 작업 (별도 migration PR)

---

## 2. 현재 상태 요약

| 항목 | 현재 상태 |
|---|---|
| 관리자 CMS shell route QA | 완료. 404/화면 깨짐/민감정보 노출/주요 링크 문제 없음 |
| A01~A24 화면 shell | 완료 |
| mock-only 기준 | 유지 |
| Supabase schema | `001_init_mvp_schema.sql` 기준 적용 완료 |
| 관리자 CMS 데이터 | 문의 일부를 제외하면 대부분 `lib/admin/mock-*.ts` 기반 |
| 문의 연결 | `loadAdminInquiries`, `loadAdminInquiry`, `createAdminSupportReply`가 세션/RPC 있을 때 Supabase를 쓰고, 없으면 mock fallback |
| 외부 API | 후순위. 이번 단계에서 연결하지 않음 |

현재 `lib/admin` mock/helper 파일:

| 파일 | 용도 |
|---|---|
| `mock-dashboard.ts` | 대시보드 지표/최근 현황 |
| `mock-admin-accounts.ts` | 관리자 계정 목록/상세 |
| `mock-users.ts` | 유저 목록/상세 |
| `mock-treasures.ts` | 보물상자 |
| `mock-products.ts` | 상품 |
| `mock-mappings.ts` | 보물-상품 매핑 |
| `mock-reward-requests.ts` | 보상/재처리 |
| `mock-inquiries.ts` | 문의 mock data/label |
| `support-service.ts` | 문의 Supabase fallback service |
| `mock-security-logs.ts` | 보안 로그 |
| `mock-operation-logs.ts` | 운영 로그 |

스키마 기준 주요 table/view:

| 구분 | 이름 |
|---|---|
| table | `profiles`, `admin_users`, `treasure_boxes`, `gift_products`, `treasure_rewards`, `treasure_claims`, `inventory_items`, `reward_retry_requests`, `support_inquiries`, `support_replies`, `notifications`, `operation_logs`, `security_logs` |
| view | `inventory_item_list`, `hall_of_fame`, `admin_dashboard_stats`, `admin_user_statistics`, `admin_reward_list` |

참고: `inventory_item_list`와 `admin_reward_list`는 쿠폰 번호/바코드 컬럼을 포함하지 않는다. 관리자/사용자 화면 연결 시 이 view 기준을 유지한다.

---

## 3. 연결 원칙

한 번에 전체를 연결하지 않는다. 기능/화면 단위로 작은 PR을 진행한다.

| 원칙 | 설명 |
|---|---|
| 한 번에 전체 연결 금지 | Auth, 알림, 보관함, 관리자 화면을 한 PR에 묶지 않는다 |
| 기능/화면 단위 작은 PR | 화면 1개 또는 연관 2~3개 route까지만 연결 |
| 기존 mock fallback 유지 | 세션 없음, RLS 실패, 환경 변수 누락 시 화면이 깨지지 않게 한다 |
| 세션 없으면 mock fallback | `auth.getUser()` 실패 또는 세션 없음이면 mock data 표시 |
| Supabase 에러 시 mock fallback | select/insert 실패 시 오류만 던지지 말고 fallback 또는 안전한 안내 |
| service_role key 프론트 사용 금지 | 브라우저는 anon key + RLS만 사용 |
| secret key 노출 금지 | Vercel/로컬 env에만 두고 화면·코드·문서 예시에 원문을 쓰지 않는다 |
| 실제 쿠폰 번호/바코드 노출 금지 | `inventory_items.coupon_code`, `barcode_value`를 화면/API 응답에 넣지 않는다 |
| 실제 Giftishow Biz API 호출 금지 | 상품/보상 연결은 DB 조회까지. 외부 발급은 후순위 |
| 실제 Naver Map API 연결 금지 | 지도/AR/보물 위치는 mock 또는 기존 좌표 표시만. 실제 지도 SDK 연결은 후순위 |
| 사용자 개인정보 최소 표시 | 사용자 이메일, 전화번호, 소셜 원문 식별자 미표시 |
| 관리자 권한 가드는 별도 단계 | 조회 연결 PR에 권한 가드 전체 구현을 섞지 않는다 |
| schema 변경은 별도 migration PR | `001_init_mvp_schema.sql` 수정이 필요하면 연결 PR과 분리 |

상태값 주의:

- DB `inquiry_status`는 `reading` / `resolved`이다.
- 화면 MD의 `open` / `in_progress` / `answered` / `closed`는 label map으로 맞추고, 필요하면 별도 migration으로 검토한다.

---

## 4. Supabase 연결 우선순위

| 순위 | 작업 | 대상 | 1차 목표 |
|---:|---|---|---|
| 1 | Auth / profiles 연결 | 사용자 로그인, 세션, 닉네임 | Google 로그인 후 profiles 조회/생성/upsert |
| 2 | 사용자 알림 연결 | `/notification` | `notifications` 조회, 문의 답변 알림 확인 |
| 3 | 사용자 보관함 연결 | `/inventory` | `inventory_item_list` 조회 |
| 4 | 관리자 유저 관리 조회 | `/admin/users`, `/admin/users/[id]` | `profiles` + 집계 view/table 조회 |
| 5 | 관리자 문의 관리 정리 | `/admin/inquiries`, `/admin/inquiries/[id]` | 기존 fallback 구조 정리 |
| 6 | 관리자 보물상자 관리 | `/admin/treasures/**` | `treasure_boxes` 조회/등록 shell 연결 |
| 7 | 관리자 상품 관리 | `/admin/products/**` | `gift_products` 조회. 외부 발급 없음 |
| 8 | 관리자 매핑 관리 | `/admin/mappings/**` | `treasure_rewards` 조회/등록 |
| 9 | 보상/재처리 관리 | `/admin/reward-requests/**`, `/admin/rewards/[id]` | `admin_reward_list`, `reward_retry_requests` 조회 |
| 10 | 운영/보안 로그 | `/admin/operation-logs`, `/admin/security-logs/**` | `operation_logs`, `security_logs` 조회 |

### 1순위 — Auth / profiles

- Google 로그인 1차
- Kakao/Apple은 mock 유지 가능
- 로그인 후 `profiles` 조회
- 없으면 생성, 있으면 기존 사용
- 세션 기반 사용자 식별
- fake `user_id` 사용 금지

### 2순위 — notifications

- `/notification` 목록 조회
- 문의 답변 도착 알림 흐름 확인
- 읽음 처리는 검토 후 작은 PR로 분리 가능

### 3순위 — inventory

- `/inventory`를 `inventory_item_list` view 기준으로 조회
- 쿠폰 번호/바코드 컬럼 사용 금지

### 4순위 — 관리자 유저 관리

- `/admin/users`, `/admin/users/[id]`
- `profiles`, `treasure_claims`, `inventory_items`, `support_inquiries`
- 집계는 `admin_user_statistics` 사용 검토
- 실제 정지/해제는 이 단계에서 하지 않음

### 5순위 — 관리자 문의 관리

- `/admin/inquiries`, `/admin/inquiries/[id]`
- `support_inquiries`, `support_replies`, `notifications`
- 기존 `support-service.ts` 구조 정리 중심
- 갈아엎지 않고 fallback 유지

### 6순위 — 보물상자

- `/admin/treasures`, `/new`, `/[id]`, `/[id]/edit`
- `treasure_boxes` 기준
- 실제 지도 API 연결 없음

### 7순위 — 상품

- `/admin/products`, `/new`, `/[id]`
- `gift_products` 기준
- `provider = manual_mock` 우선. Giftishow 실제 호출 없음

### 8순위 — 매핑

- `/admin/mappings`, `/admin/mappings/new`
- `treasure_rewards`, `treasure_boxes`, `gift_products`

### 9순위 — 보상/재처리

- `/admin/reward-requests`, `/history`, `/admin/rewards/[id]`
- `treasure_claims`, `reward_retry_requests`, `admin_reward_list`
- 실제 재처리 실행/외부 발급은 후순위

### 10순위 — 로그

- `/admin/operation-logs`
- `/admin/security-logs`, `/admin/security-logs/[id]`
- `operation_logs`, `security_logs`
- 원본 payload/token 미표시
- 보안 로그는 schema상 super_admin select 정책이 있으므로 권한 가드와 함께 검토 필요

---

## 5. 화면별 연결 매핑 표

현재 상태는 2026-08-22 shell QA 기준이다. 1차 연결 방식은 조회 우선이다.

| 화면 | route | 현재 상태 | 연결 대상 table/view | 1차 연결 방식 | mock fallback 필요 여부 | 우선순위 | 비고 |
|---|---|---|---|---|---|---:|---|
| 운영 대시보드 | `/admin/dashboard` | mock shell | `admin_dashboard_stats` | select view | 필요 | 4 이후 | Auth 이후 지표 조회. 최근 현황은 별도 조회 검토 |
| 관리자 계정 목록 | `/admin/admins` | mock shell | `admin_users` | select | 필요 | 권한 가드 단계 | 조회 연결과 권한 가드를 같이 검토 |
| 관리자 계정 등록 | `/admin/admins/new` | mock shell | `admin_users` | 등록은 후순위 | 필요 | 권한 가드 단계 | 실제 insert는 가드 이후 |
| 관리자 계정 상세 | `/admin/admins/[id]` | mock shell | `admin_users` | select | 필요 | 권한 가드 단계 | mock 관리자 이메일은 허용 |
| 유저 목록 | `/admin/users` | mock shell | `profiles`, `admin_user_statistics` | select | 필요 | 4 | 사용자 이메일 미표시 |
| 유저 상세 | `/admin/users/[id]` | mock shell | `profiles`, `treasure_claims`, `inventory_items`, `support_inquiries` | select | 필요 | 4 | 정지/해제 실제 실행 없음 |
| 보물상자 목록 | `/admin/treasures` | mock shell | `treasure_boxes` | select | 필요 | 6 | 삭제되지 않은 행 기준 검토 |
| 보물상자 등록 | `/admin/treasures/new` | mock shell | `treasure_boxes` | insert는 조회 안정화 후 | 필요 | 6 | 지도 API 없음 |
| 보물상자 상세 | `/admin/treasures/[id]` | mock shell | `treasure_boxes`, `treasure_rewards` | select | 필요 | 6 | |
| 보물상자 수정 | `/admin/treasures/[id]/edit` | mock shell | `treasure_boxes` | update는 조회 안정화 후 | 필요 | 6 | schema 변경 시 별도 PR |
| 상품 목록 | `/admin/products` | mock shell | `gift_products` | select | 필요 | 7 | Giftishow 호출 없음 |
| 상품 등록 | `/admin/products/new` | mock shell | `gift_products` | insert는 조회 안정화 후 | 필요 | 7 | `manual_mock` 우선 |
| 상품 상세 | `/admin/products/[id]` | mock shell | `gift_products` | select | 필요 | 7 | 쿠폰/바코드 없음 |
| 매핑 목록 | `/admin/mappings` | mock shell | `treasure_rewards`, `treasure_boxes`, `gift_products` | select | 필요 | 8 | active 1개/박스 제약 있음 |
| 매핑 등록·교체 | `/admin/mappings/new` | mock shell | `treasure_rewards` | insert/replace는 조회 후 | 필요 | 8 | 교체 시 기존 row 상태 변경 검토 |
| 보상 목록 | `/admin/reward-requests` | mock shell | `admin_reward_list` | select view | 필요 | 9 | 재처리 실행 없음 |
| 재처리 이력 | `/admin/reward-requests/history` | mock shell | `reward_retry_requests` | select | 필요 | 9 | 외부 응답 원문 미표시 |
| 보상 상세 | `/admin/rewards/[id]` | mock shell | `inventory_items` 또는 `admin_reward_list`, `treasure_claims` | select | 필요 | 9 | 쿠폰/바코드 미표시 |
| 문의 목록 | `/admin/inquiries` | fallback 구조 존재 | `support_inquiries`, `profiles` | 기존 service 정리 | 필요 | 5 | 갈아엎지 않음 |
| 문의 상세 | `/admin/inquiries/[id]` | fallback 구조 존재 | `support_inquiries`, `support_replies`, `notifications` | 기존 답변 흐름 유지 | 필요 | 5 | 답변 등록 흐름 유지 |
| 보안 로그 목록 | `/admin/security-logs` | mock shell | `security_logs` | select | 필요 | 10 | super_admin 정책. 가드와 함께 검토 |
| 보안 로그 상세 | `/admin/security-logs/[id]` | mock shell | `security_logs` | select | 필요 | 10 | metadata 원문/token 미표시 |
| 운영 로그 목록 | `/admin/operation-logs` | mock shell | `operation_logs` | select | 필요 | 10 | operator/super_admin 정책 |

`/admin/login`은 mock 관리자 로그인 shell이다. 사용자 Auth와 분리해서 유지하고, 관리자 세션 연결은 권한 가드 단계에서 검토한다.

---

## 6. 사용자 앱 연결 매핑 표

사용자 앱 화면은 관리자 CMS와 별도 PR로 연결한다. 이번 계획의 1~3순위가 사용자 앱 기준 시작점이다.

| route | 연결 대상 | 즉시 연결 여부 | 후순위 여부 | 외부 API 여부 | 비고 |
|---|---|---|---|---|---|
| `/login` | Supabase Auth, Google provider | 1순위에서 연결 | Kakao/Apple은 후순위 가능 | Auth provider | Google 1차. fake user_id 금지 |
| `/nickname` | `profiles` insert/upsert | 1순위에서 연결 | 아님 | 없음 | 닉네임 없는 신규 유저 흐름 유지 |
| `/notification` | `notifications` | 2순위 | 읽음 처리는 검토 | 없음 | 문의 답변 알림 확인 |
| `/inventory` | `inventory_item_list` | 3순위 | 발급/사용 처리는 후순위 | 없음 | 쿠폰/바코드 미표시 |
| `/support` | `support_inquiries` | 5순위 또는 문의 사용자 PR | 아님 | 없음 | 기존 사용자 문의 화면 유지 |
| `/support/new` | `support_inquiries` insert | 문의 사용자 PR | 아님 | 없음 | 관리자 목록과 카테고리 enum 맞춤 검토 |
| `/support/[inquiryId]` | `support_inquiries`, `support_replies` | 문의 사용자 PR | 아님 | 없음 | 내부 메모 미노출 |
| `/hall-of-fame` | `hall_of_fame` | 검토 필요 | 1~3순위 이후 가능 | 없음 | 공개 닉네임/아바타/횟수만 |
| `/home` | `profiles` 세션 확인 | 1순위 이후 진입 유지 | 통계 고도화는 후순위 | 없음 | 로그인 후 기존 흐름 유지 |
| `/map` | `treasure_boxes` 조회는 검토 | 후순위 | 후순위 | Naver Map은 후순위 | 실제 지도 SDK 연결 금지 |
| `/ar-hunt` | `treasure_boxes`, `treasure_claims` | 후순위 | 후순위 | GPS/카메라 후순위 | shell 유지 |
| `/hunt-result` | `treasure_claims`, `inventory_items` | 후순위 | 후순위 | 없음 | 사냥 연결 이후 |
| `/profile` | `profiles` | 1순위 이후 조회 가능 | 수정은 `/profile/edit` | 없음 | 이메일 미표시 |
| `/profile/edit` | `profiles` update | 1순위 이후 검토 | 아바타 업로드는 후순위 | 없음 | 닉네임/소개 범위만 |

---

## 7. 추천 첫 개발 브랜치

| 후보 | 장점 | 단점 | 추천 |
|---|---|---|---|
| `feature/auth-profile-connect` | 이후 모든 연결의  ident 기준이 된다. fake user_id를 없앨 수 있다 | Auth/RLS/닉네임 흐름을 같이 봐야 해서 초보 기준으로는 어렵다 | **공식 1순위 추천** |
| `feature/notification-supabase-connect` | select 위주라 범위가 작다. 화면 1개로 연습하기 쉽다 | 세션/`user_id`가 없으면 실제 데이터가 비거나 mock만 보인다 | 초보 개발 기준 쉬운 시작 후보 |
| `feature/inventory-supabase-connect` | view가 이미 민감 컬럼을 제외한다 | 세션과 보상 데이터가 있어야 의미가 있다 | Auth 이후 3순위 |

공식 추천은 `feature/auth-profile-connect`이다.

초보 개발 기준으로 더 쉬운 시작은 `feature/notification-supabase-connect`일 수 있다. 다만 알림 연결만 먼저 하면 세션이 없을 때 mock fallback만 확인하게 되므로, 팀 합의 없이 Auth를 건너뛰면 이후 PR에서 `user_id` 기준을 다시 고쳐야 한다.

권장 순서:

1. 리더/팀 기준: `feature/auth-profile-connect`
2. 연습용 작은 PR이 필요하면: `feature/notification-supabase-connect`
3. Auth 완료 후: `feature/inventory-supabase-connect`

---

## 8. 첫 번째 개발 작업 상세 계획

대상 브랜치: `feature/auth-profile-connect`

이 절만 첫 작업 범위로 본다. 관리자 CMS 화면 연결과 외부 API는 포함하지 않는다.

### 8.1 목표

- Google 로그인 1차 연결
- 로그인 성공 후 기존 `/nickname` 또는 `/home` 흐름 유지
- 세션의 `auth.users.id`로 `profiles` 조회
- `profiles` 없으면 생성
- `profiles` 있으면 기존 사용
- 세션 없으면 기존 mock 흐름 유지
- fake `user_id` 사용 금지
- service_role key 사용 금지

Kakao/Apple은 이 PR에서 mock 유지를 허용한다.

### 8.2 수정 예상 파일

실제 파일은 착수 시 재확인한다. 예상 범위는 아래와 같다.

| 구분 | 예상 경로 | 이유 |
|---|---|---|
| 로그인 | `app/login/page.tsx` 또는 관련 컴포넌트 | Google Auth 시작 |
| 닉네임 | `app/nickname/page.tsx` | profiles 생성/upsert |
| 세션 유틸 | `lib/supabase.ts` 및 세션/profile helper | 브라우저 클라이언트 재사용 |
| 홈/프로필 진입 | `app/home/page.tsx`, `app/profile/page.tsx` | 세션 있으면 실제 nickname 표시 검토 |
| 문서 | 필요 시 PR 설명만 | 코드 외 문서 수정은 최소화 |

### 8.3 금지 파일

| 금지 | 이유 |
|---|---|
| `package.json`, `package-lock.json` | 의존성 추가 없이 기존 클라이언트로 연결 |
| `supabase/migrations/**` | schema 변경이 필요하면 별도 PR |
| `app/api/**` | 신규 API route 추가 금지 |
| `middleware.ts` | 권한 가드와 섞지 않음 |
| `app/admin/**` | 이번 PR은 사용자 Auth만 |
| `app/support/**` | 문의 연결은 5순위 |
| `app/inventory/**` 또는 inventory 화면 | 3순위 |
| `app/map`, `app/ar-hunt` | 외부 API/후순위 |
| `.env` 원문을 커밋 | secret 노출 금지 |

### 8.4 완료 기준

- Google 로그인으로 세션을 만들 수 있다
- 세션 `user.id`로 `profiles`를 조회할 수 있다
- `profiles`가 없으면 닉네임 입력 후 생성된다
- `profiles`가 있으면 기존 행을 사용한다
- 세션이 없으면 기존 mock/비로그인 흐름이 유지된다
- fake `user_id`를 새로 만들지 않는다
- 사용자 이메일을 화면에 표시하지 않는다
- `npm run lint` 통과
- `npm run build` 통과

### 8.5 테스트 기준

| 시나리오 | 기대 |
|---|---|
| 세션 없음 | 기존 `/login` mock 또는 비로그인 흐름 유지 |
| Google 로그인 성공 + profile 없음 | `/nickname`으로 이동, 저장 후 profile 생성 |
| Google 로그인 성공 + profile 있음 | `/home` 또는 기존 진입 유지 |
| Google 로그인 취소/실패 | 오류 안내, 앱 크래시 없음 |
| Supabase env 없음 또는 RLS 실패 | mock fallback 또는 안전한 안내 |
| 화면 표시 | 기존 로그인/닉네임 디자인이 크게 깨지지 않음 |

### 8.6 PR 체크리스트

- [ ] 브랜치명이 `feature/auth-profile-connect`이다
- [ ] Google만 1차 연결했다
- [ ] Kakao/Apple을 무리하게 같이 붙이지 않았다
- [ ] `profiles` 조회 후 없으면 생성, 있으면 재사용한다
- [ ] fake `user_id`를 사용하지 않는다
- [ ] service_role key를 프론트에서 사용하지 않는다
- [ ] 사용자 이메일을 화면에 표시하지 않는다
- [ ] 세션 없을 때 mock/기존 흐름이 유지된다
- [ ] `app/admin/**`, `supabase/migrations/**`, package 파일을 수정하지 않았다
- [ ] lint/build가 통과한다
- [ ] PR 설명에 mock fallback 유지 여부를 적는다

---

## 9. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| RLS 정책으로 insert/select 실패 | 로그인 후 빈 화면 또는 저장 실패 | 에러 메시지 확인, 세션 없으면 fallback, 정책 수정은 별도 migration PR |
| profiles 자동 생성 타이밍 | 로그인 직후 `/home`에서 profile 없음 | `/nickname` 분기 유지, upsert는 닉네임 저장 시점에 수행 |
| mock fallback과 실제 세션 데이터 충돌 | 서로 다른 user_id가 섞임 | 세션 있으면 실제 데이터만, 없으면 mock만. 혼합 표시 금지 |
| Vercel env 누락 | Preview에서 Auth 실패 | `NEXT_PUBLIC_SUPABASE_URL`, anon key 확인. secret은 서버/대시보드에만 |
| 타입 불일치 | schema enum과 mock type이 다름 | 연결 PR에서 매핑 함수로 정리. 예: 문의 `reading`/`resolved` |
| 기존 화면 디자인 깨짐 | 연결 중 레이아웃 변경 | 데이터 연결만 하고 UI 재작성 금지 |
| 관리자 권한 가드 미구현 | `/admin/**`가 열려 있음 | 조회 연결과 가드 PR을 분리. 가드는 이후 단계 |
| 외부 API를 너무 빨리 연결 | 쿠폰 발급/지도 비용·보안 이슈 | Giftishow, Naver Map, GPS는 명시적 후순위 |

추가 검토 필요:

- 관리자 CMS mock ID(`user-202607-005` 등)와 DB uuid 매핑
- 문의 화면 MD 상태값과 DB enum 차이
- `current_admin_user_id` RPC가 필요한 관리자 mutation

---

## 10. 완료 기준

아래는 **Supabase 연결 단계 전체**의 완료 기준이다. 첫 PR(`feature/auth-profile-connect`)의 완료 기준이 아니다.

| 항목 | 기준 |
|---|---|
| 실제 로그인 | Google 로그인으로 세션 생성 가능 |
| profiles | 조회/생성 가능. 기존 행 재사용 |
| 알림 조회 | `/notification`에서 본인 `notifications` 조회 가능 |
| 보관함 조회 | `/inventory`에서 `inventory_item_list` 조회 가능 |
| 문의 흐름 | 작성/답변/알림까지 연결 가능 |
| 관리자 CMS 주요 목록 | 유저/문의/보물/상품/매핑/보상 조회 가능 |
| mock fallback | 세션 없음 또는 오류 시 화면 유지 |
| 민감정보 | 쿠폰 번호, 바코드, service_role, token 미노출 |
| 외부 API | Giftishow/Naver Map/GPS 미연결 |
| 품질 | `npm run lint`, `npm run build`, Vercel Preview 통과 |

이 기준을 한 번에 맞추지 않는다. 4장의 우선순위대로 PR을 나눈다.

다음 문서/작업 후보:

1. `feature/auth-profile-connect` 착수
2. 또는 연습용 `feature/notification-supabase-connect`
3. 관리자 권한 가드 계획은 조회 연결과 분리해서 별도 문서로 검토
