# Supabase 연결 작업 분배 (2026-08-26)

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | Supabase 연결 작업 분배 |
| 파일명 | `Supabase_Connection_Work_Assignment_2026-08-26.md` |
| 작성일 | 2026-08-22 |
| 작업 기준일 | 2026-08-26 |
| 작성 목적 | 연결 계획과 파일 소유 범위를 팀원별 작업으로 나눠 같은 날 병렬 착수할 수 있게 한다 |

참고 문서:

- `docs/admin-cms/CMS_Shell_To_Supabase_Connection_Plan.md`
- `docs/project/Supabase_Connection_Common_Rules.md`
- `docs/project/Supabase_Connection_File_Ownership.md`

전제:

- 관리자 CMS shell QA는 완료되어 있다
- 공통 helper는 `lib/supabase/**`에 정리되어 있다
- 이번 분배 문서는 이후 feature 연결용이다. 기반 세팅 PR에서 아래 화면을 실제 연결하지 않는다

---

## 2. 작업 원칙

모든 담당자는 아래를 지킨다.

- 한 브랜치에서 기능 1개만 작업
- `@/lib/supabase` 공통 helper 사용
- 세션 없거나 Supabase 오류면 mock fallback
- fake `user_id` 사용 금지
- service_role / secret key 사용 금지
- 외부 API 연결 금지
- 쿠폰 번호/바코드 노출 금지
- 기존 디자인 크게 변경 금지
- `npm run lint`, `npm run build` 통과

추천 브랜치 접두어: `feature/`

---

## 3. 리더

| 항목 | 내용 |
|---|---|
| 담당 | 리더 |
| 추천 브랜치 | `feature/auth-profile-connect` |
| 화면 | `/login`, `/nickname`, `/profile` |
| table | `profiles`, Auth session |
| 목표 | Google 로그인 1차, profiles 조회/생성/upsert, 세션 기준 user id |

포함:

- Google 로그인만 1차 연결
- Kakao/Apple은 mock 유지 가능
- 로그인 성공 후 `/nickname` 또는 `/home` 기존 흐름 유지
- `profiles` 없으면 생성, 있으면 재사용
- `lib/supabase/**` 유지 보수

제외:

- `/notification`, `/inventory`, `/admin/users` 실제 연결
- 관리자 권한 가드
- migration 수정

완료 기준:

- 세션이 있으면 `auth.users.id`로 profile을 찾는다
- 세션이 없으면 기존 mock/비로그인 흐름이 유지된다
- fake user_id를 만들지 않는다

---

## 4. 팀원 1

| 항목 | 내용 |
|---|---|
| 담당 | 팀원 1 |
| 추천 브랜치 | `feature/notification-supabase-connect` |
| 화면 | `/notification` |
| table | `notifications` |
| 목표 | 본인 알림 목록 조회. 문의 답변 알림 흐름 확인 |

포함:

- 세션 있으면 본인 `notifications` select
- 세션 없으면 기존 mock 알림 유지
- `target_route`로 문의 상세 이동 확인

제외:

- Google 로그인 구현
- `lib/supabase/**` 수정
- 알림 생성 insert를 관리자 문의와 동시에 바꾸기

완료 기준:

- 목록이 깨지지 않는다
- 쿠폰/개인정보가 알림에 노출되지 않는다
- fallback이 유지된다

초보 기준으로 시작하기 쉬운 작업이다. 다만 리더의 Auth가 아직이면 실제 행이 없을 수 있으므로 mock fallback 확인이 중요하다.

---

## 5. 팀원 2

| 항목 | 내용 |
|---|---|
| 담당 | 팀원 2 |
| 추천 브랜치 | `feature/inventory-supabase-connect` |
| 화면 | `/inventory` |
| table/view | `inventory_item_list`, 필요 시 `inventory_items` |
| 목표 | 보관함 목록을 view 기준으로 조회 |

포함:

- `inventory_item_list` select
- 본인 `user_id`만 조회
- 기존 `lib/hunt/inventory-service.ts` fallback 구조가 있으면 정리만 하고 제거하지 않음

제외:

- `coupon_code`, `barcode_value` 조회/표시
- Giftishow 실제 발급
- 보관함 상세에서 민감 컬럼 추가

완료 기준:

- 목록이 mock 또는 실제 데이터로 표시된다
- 민감 컬럼이 화면에 없다
- 디자인 변경이 크지 않다

---

## 6. 팀원 3

| 항목 | 내용 |
|---|---|
| 담당 | 팀원 3 |
| 추천 브랜치 | `feature/admin-users-supabase-connect` |
| 화면 | `/admin/users`, `/admin/users/[id]` |
| table/view | `profiles`, `admin_user_statistics`, `treasure_claims`, `inventory_items`, `support_inquiries` |
| 목표 | 관리자 유저 목록/상세 조회 연결 |

포함:

- 목록/상세 select
- 닉네임, 상태, 집계 수치 표시
- 존재하지 않는 ID 안내 유지

제외:

- 실제 정지/해제/저장
- 사용자 이메일 표시
- `components/admin/admin-shell.tsx` 수정
- 사용자 앱 `/profile` 수정

완료 기준:

- 목록에서 상세로 이동된다
- 민감정보가 없다
- 세션/관리자 컨텍스트가 없으면 mock fallback

관리자 권한 가드는 이 작업에 넣지 않는다. 조회만 연결한다.

---

## 7. 작업 순서와 의존

| 순서 | 담당 | 의존 |
|---|---|---|
| 1 | 리더 Auth/profiles | 없음. 가장 먼저 merge하는 것을 권장 |
| 2 | 팀원 1 알림 | 세션이 있으면 실제 데이터 확인이 쉽다. 없어도 fallback으로 진행 가능 |
| 2 | 팀원 2 보관함 | 위와 동일 |
| 2 | 팀원 3 관리자 유저 | 관리자 세션/RPC가 없으면 mock fallback. Auth와 별도로 시작 가능 |

리더 PR이 늦어도 팀원 1~3은 mock fallback을 유지한 채 화면 연결 골격을 만들 수 있다. 다만 실제 데이터 확인은 Auth 이후다.

---

## 8. 공통 완료 체크

각 PR 머지 전:

- [ ] 기능 1개만 들어 있다
- [ ] 다른 팀원 소유 파일을 수정하지 않았다
- [ ] 공통 금지 파일을 수정하지 않았다
- [ ] 기존 `/support` 연결을 깨지 않았다
- [ ] lint/build 통과
- [ ] PR 설명에 mock fallback 유지 여부를 적었다
