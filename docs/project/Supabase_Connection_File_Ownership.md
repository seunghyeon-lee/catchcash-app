# Supabase 연결 파일 소유 범위

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | Supabase 연결 파일 소유 범위 |
| 파일명 | `Supabase_Connection_File_Ownership.md` |
| 작성일 | 2026-08-22 |
| 작성 목적 | 팀원별 수정 파일을 나눠 같은 파일을 동시에 고치지 않게 한다 |

소유 범위는 “이 사람이 해당 기능 연결 PR에서 주로 수정한다”는 뜻이다. 공통 helper는 리더가 관리하고, 다른 팀원은 import만 한다.

이번 기반 세팅 PR에서는 아래 화면을 실제 연결하지 않는다.

---

## 2. 리더

| 영역 | 소유 파일 / 범위 |
|---|---|
| 로그인 | `app/login/**` |
| 닉네임 | `app/nickname/**` |
| 프로필 | `app/profile/**`, `app/profile/edit/**` |
| 공통 helper | `lib/supabase/**` |
| profiles | `profiles` 조회/생성/upsert 관련 service. 예: `lib/profile/profile-service.ts`, `lib/profile/auth-session.ts` |

리더 작업 예:

- Google 로그인 1차 연결
- 로그인 후 `/nickname` 또는 `/home` 흐름
- `profiles` 없으면 생성, 있으면 재사용
- 공통 session/fallback helper 유지

다른 팀원은 `lib/supabase/**`를 수정하지 않고 import만 한다. helper 변경이 필요하면 리더에게 요청한다.

---

## 3. 팀원 1

| 영역 | 소유 파일 / 범위 |
|---|---|
| 알림 화면 | `app/notification/**` |
| 알림 데이터 | `notifications` table 조회. 기존 mock은 `lib/mock/notifications.ts` |

팀원 1 작업 예:

- `/notification` 목록 조회
- 본인 `user_id` 알림만 조회
- 문의 답변 알림의 `target_route` 확인
- 읽음 처리는 필요 시 같은 기능 범위에서만

로그인/프로필 화면과 `lib/supabase/**`는 수정하지 않는다.

---

## 4. 팀원 2

| 영역 | 소유 파일 / 범위 |
|---|---|
| 보관함 화면 | `app/inventory/**` |
| 보관함 데이터 | `inventory_item_list` view, 필요 시 `inventory_items` |
| 관련 helper | `lib/hunt/inventory-service.ts`, `lib/hunt/mock/inventory-item-list.ts` |

팀원 2 작업 예:

- `/inventory` 목록을 `inventory_item_list` 기준으로 정리
- 쿠폰 번호/바코드 컬럼 조회·표시 금지
- 세션 없으면 기존 mock 유지

`/login`, `/notification`, `/admin/users`는 수정하지 않는다.

---

## 5. 팀원 3

| 영역 | 소유 파일 / 범위 |
|---|---|
| 관리자 유저 목록 | `app/admin/users/page.tsx` |
| 관리자 유저 상세 | `app/admin/users/[id]/page.tsx` |
| 유저 mock/helper | `lib/admin/mock-users.ts` |
| 조회 대상 | `profiles`, `admin_user_statistics`, `treasure_claims`, `inventory_items`, `support_inquiries` |

팀원 3 작업 예:

- 관리자 유저 목록/상세 조회 연결
- 닉네임, mock/공개 ID, 집계 수치만 표시
- 사용자 이메일 미표시
- 실제 정지/해제 실행 없음

사용자 앱 `/profile`의 profiles 생성/수정은 리더 범위다. 팀원 3은 관리자 조회만 담당한다.

---

## 6. 기존 연결 유지 범위

아래는 이번 역할 분담의 신규 소유가 아니다. 깨지 않고 유지한다.

| 영역 | 주요 파일 |
|---|---|
| 사용자 문의 | `app/support/**`, `lib/profile/support-service.ts`, `lib/profile/support-mock.ts` |
| 관리자 문의 | `app/admin/inquiries/**`, `lib/admin/support-service.ts`, `lib/admin/mock-inquiries.ts` |

문의 연결을 손봐야 하면 별도 PR로 분리하고, 기존 fallback을 제거하지 않는다.

---

## 7. 공통 금지 파일

아래 파일은 기능 연결 PR에서 수정하지 않는다.

| 파일 | 이유 |
|---|---|
| `package.json` | 의존성 변경 금지 |
| `package-lock.json` | 의존성 변경 금지 |
| `supabase/migrations/**` | schema 변경은 별도 PR |
| `middleware.ts` | 권한 가드와 연결 PR 분리 |
| `next.config.mjs` | 공통 빌드 설정 |
| `tailwind.config.ts` | 공통 스타일 설정 |
| `app/layout.tsx` | 앱 전체 레이아웃 |
| `components/admin/admin-shell.tsx` | 관리자 공통 셸 |

추가로 다른 팀원 소유 화면을 같이 수정하지 않는다.

---

## 8. 충돌 방지

| 상황 | 처리 |
|---|---|
| 공통 helper 버그 | 리더가 `lib/supabase/**`만 수정 |
| 세션 함수가 필요함 | 이미 `getBrowserAuthSession`, `getCurrentUserId` 사용 |
| schema 변경 필요 | 연결 PR을 멈추고 migration PR을 따로 연다 |
| 문의 화면이 필요함 | 기존 support 파일을 최소 참조만 하고 로직을 옮기지 않는다 |
| 같은 파일을 두 사람이 고쳐야 함 | 기능을 더 나누거나 한 사람 PR이 먼저 merge된 뒤 진행 |
