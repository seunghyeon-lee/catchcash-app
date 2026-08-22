# Supabase 연결 공통 규칙

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | Supabase 연결 공통 규칙 |
| 파일명 | `Supabase_Connection_Common_Rules.md` |
| 작성일 | 2026-08-22 |
| 작성 목적 | 팀원이 기능 연결 PR을 나눌 때 같은 클라이언트, fallback, 보안 기준으로 작업하기 위한 공통 규칙 |
| 대상 | 사용자 앱 / 관리자 CMS의 Supabase 조회 연결 PR |

참고 문서:

- `docs/admin-cms/CMS_Shell_To_Supabase_Connection_Plan.md`
- `docs/admin-cms/Admin_CMS_Shell_QA_Result.md`
- `docs/project/Supabase_Connection_File_Ownership.md`
- `docs/project/Supabase_Connection_Work_Assignment_2026-08-26.md`
- `supabase/migrations/001_init_mvp_schema.sql`

이 문서는 작업 규칙이다. 이번 기반 세팅 PR에서는 `/login`, `/nickname`, `/notification`, `/inventory`, `/admin/users`를 실제 연결하지 않는다.

---

## 2. 공통 파일

| 파일 | 역할 |
|---|---|
| `lib/supabase/client.ts` | public anon env 확인, 브라우저 클라이언트 생성 |
| `lib/supabase/session.ts` | 현재 세션 / current user id 조회 |
| `lib/supabase/fallback.ts` | mock fallback 판단 helper |
| `lib/supabase/index.ts` | 위 helper 재export |
| `lib/profile/auth-session.ts` | 기존 문의/보관함 코드 호환 래퍼. 내부는 공통 session helper 사용 |

새 기능 연결 PR에서는 `@/lib/supabase`에서 helper를 import한다. 화면마다 `createClient`를 다시 만들지 않는다.

---

## 3. 클라이언트 / env 규칙

사용할 수 있는 값:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

사용 금지:

- `service_role` key
- secret key
- 서버 전용 key를 브라우저 코드에 넣는 것

권장 사용:

```ts
import {
  getSupabaseBrowserClientOrNull,
  getBrowserAuthSession,
  getCurrentUserId,
  shouldUseMockFallback,
} from "@/lib/supabase";
```

`getSupabaseBrowserClient()`는 기존 문의 코드 호환용이다. env가 없으면 throw 한다. 새 코드는 `getSupabaseBrowserClientOrNull()`을 쓰고, env가 없으면 mock fallback 한다.

---

## 4. 세션 / user id 규칙

| 규칙 | 설명 |
|---|---|
| 세션 조회 | `getBrowserAuthSession()` 사용 |
| current user id | `getCurrentUserId()` 사용 |
| fake user_id 금지 | 임의 UUID를 만들어 DB에 쓰지 않는다 |
| 세션 없음 | `null` 반환 후 화면별 mock fallback |
| Auth 오류 | `null` 반환 후 mock fallback |

`auth.users.id`만 사용자 식별에 사용한다.

---

## 5. fallback 규칙

아래 중 하나라도 해당되면 mock data를 보여준다.

| 조건 | 처리 |
|---|---|
| public env 없음 | mock fallback |
| 세션 없음 | mock fallback |
| Supabase select/insert 오류 | mock fallback 또는 안전한 안내. 화면이 깨지면 안 된다 |
| RLS 거부 | mock fallback 또는 빈 목록 + 안내 |

권장 흐름:

1. env / session 확인
2. 없으면 기존 mock 반환
3. 있으면 본인 데이터만 조회
4. 오류면 mock 또는 안전한 안내
5. 결과의 `source`를 `"supabase"` / `"mock"`로 구분

기존 `/support`와 관리자 문의 fallback 구조를 깨지 않는다.

---

## 6. 브랜치 / PR 규칙

| 규칙 | 설명 |
|---|---|
| 한 브랜치에서 기능 1개만 | 알림, 보관함, 유저 관리를 한 PR에 섞지 않는다 |
| 기존 mock fallback 유지 | 연결 실패해도 화면이 보여야 한다 |
| 기존 디자인/layout 크게 변경 금지 | 데이터 연결만 한다 |
| `package.json` / `package-lock.json` 수정 금지 | 새 패키지 추가 없음 |
| `supabase/migrations/**` 수정은 별도 PR | 연결 PR과 schema 변경을 분리 |
| 외부 API 연결 금지 | Naver Map, Giftishow Biz 실제 호출 없음 |
| 실제 쿠폰 번호/바코드 노출 금지 | `inventory_item_list` view 또는 민감 컬럼 제외 select 사용 |
| lint / build 통과 필수 | `npm run lint`, `npm run build` |

---

## 7. 금지 작업

- service_role key를 프론트에서 사용
- secret key를 코드/화면에 노출
- fake `user_id` 생성
- 실제 쿠폰 번호, 바코드, token, 원본 payload 표시
- 실제 Giftishow Biz API 호출
- 실제 Naver Map API 연결
- 실제 GPS 연결
- 사용자 이메일/전화번호/소셜 원문 식별자 표시
- 공통 금지 파일 수정 (`File_Ownership` 문서 참고)
- 기존 support 연결을 제거하거나 mock-only로 되돌리기

---

## 8. 화면 연결 시 체크리스트

기능 연결 PR을 열기 전에 확인한다.

- [ ] 기능 1개만 포함했다
- [ ] `@/lib/supabase` 공통 helper를 사용했다
- [ ] 세션 없으면 mock fallback을 유지했다
- [ ] Supabase 오류 시 화면이 깨지지 않는다
- [ ] fake user_id를 쓰지 않았다
- [ ] service_role / secret key를 쓰지 않았다
- [ ] 쿠폰 번호/바코드를 조회·표시하지 않았다
- [ ] 기존 디자인을 크게 바꾸지 않았다
- [ ] 공통 금지 파일을 수정하지 않았다
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
