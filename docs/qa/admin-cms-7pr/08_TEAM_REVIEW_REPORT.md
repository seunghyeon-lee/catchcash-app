# Admin CMS 7PR — 팀장 검토 및 Release 보고서

> 최종 상태: **PASS WITH WARNINGS**
> 검수 기간: 2026-08-10 ~ 2026-08-11 (KST)
> 기준 SHA: `0bb4d26` (`main`, Admin CMS 7PR 병합 완료 시점)
> 대상 PR: [#47](https://github.com/seunghyeon-lee/catchcash-app/pull/47) · [#48](https://github.com/seunghyeon-lee/catchcash-app/pull/48) · [#49](https://github.com/seunghyeon-lee/catchcash-app/pull/49) · [#50](https://github.com/seunghyeon-lee/catchcash-app/pull/50) · [#51](https://github.com/seunghyeon-lee/catchcash-app/pull/51) · [#52](https://github.com/seunghyeon-lee/catchcash-app/pull/52) · [#53](https://github.com/seunghyeon-lee/catchcash-app/pull/53)
> 검수·수정 라운드: Web QA Round 1~14 + Phase7 일괄 수정

## 1. 결론

- P0 Blocker: **0건**
- P1 Critical: **0건**
- 발견 항목: FIX-001~017
- 코드 수정 완료: **11건**
- 정책 수용(WONTFIX): **1건**
- 외부 환경·후속 범위로 연기(DEFERRED): **5건**
- mock-only Admin CMS 기준 핵심 Journey, 정적 Gate, 브라우저 회귀를 통과했다.
- 실제 Auth/API/Supabase/RLS까지 production-ready라는 의미는 아니다. 실연동 시 FIX-009~011 Gate를 다시 수행해야 한다.

## 2. 검수 범위

### 신규 7개 화면

| ID | Route | 검수 내용 | 최종 결과 |
|---|---|---|---|
| A01 | `/admin/login` | 입력 검증, 키보드 이동, Enter submit, mock 로그인, storage·뒤로가기 | PASS |
| A03 | `/admin/admins` | 검색, 역할·상태 필터, 초기화, 페이지네이션, 빈 결과, unknown/locked 데이터 | PASS |
| A04 | `/admin/admins/new` | 필드 오류, 비밀번호 규칙, 역할/상태, dirty confirm, 등록 dialog, 성공 feedback | PASS |
| A05 | `/admin/admins/[id]` | 상세/unknown ID, 역할·상태·비밀번호 mock action, IP 마스킹, 원본 불변 | PASS |
| A21 | `/admin/security-logs` | 검색, 복합 필터, 기간, 정렬, 페이지 크기, 페이지네이션, XSS 문자열 | PASS |
| A22 | `/admin/security-logs/[id]` | 상세/unknown ID, 좌표·IP 마스킹, UA 일반화, 연관 로그 | PASS |
| A24 | `/admin/access-denied` | reason allowlist, unknown reason, 운영 raw 코드 비노출, 안전한 복귀 | PASS |

### 회귀 화면

- `/admin/dashboard`
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]`
- `/admin/mappings`, `/admin/mappings/new`
- `/admin/reward-requests`, `/admin/reward-requests/history`, `/admin/rewards/[id]`
- `/admin/inquiries`, `/admin/inquiries/[id]`
- AdminShell header/sidebar/active navigation
- 사용자 앱 핵심 route 최소 HTTP smoke

## 3. 수행한 검수

### 정적·빌드 Gate

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
- Admin 7PR 경로의 금지 API/Supabase/storage 호출과 민감정보 문자열 점검
- 비밀번호·쿠폰·바코드·token·secret이 dialog/list/detail에 노출되지 않는지 확인

### 브라우저 기능·경계 검수

- 정상/빈 값/공백/형식 오류/약한 비밀번호/불일치/역할 미선택
- 검색어, 역할, 상태, 심각도, 이벤트, 기간, 정렬, 페이지 크기의 단독·복합 조합
- 검색 결과 없음, unknown ID, locked/inactive 데이터
- 페이지 1~3 이동, 이전/다음 disabled, 필터 변경 시 page reset
- 등록·역할 변경·활성화·비활성화·비밀번호 재설정 mock 동작과 reload 후 원본 불변
- `Escape`, backdrop click, Tab 순환, 초기 focus, 종료 후 focus 복원
- XSS 형태 문자열(`<img ...>`)이 DOM으로 해석되지 않는지 확인
- Console/Network의 RSC 404, runtime error, hydration error 확인

### viewport·접근성

- 필수: 1440×900, 1280×720, 1024×768
- 정책 확인: 768×1024, 375×812
- keyboard Tab/Enter/Escape
- `role="dialog"`, `aria-modal`, `aria-labelledby`, `role="status"`
- CMS는 데스크톱 전용으로 확정했으며 980px 미만 가로 스크롤은 FIX-005 WONTFIX 정책으로 수용했다.

## 4. 발견 항목과 처리 결과

| ID | Pri | 결과 | 처리 |
|---|---|---|---|
| FIX-001 | P2 | DONE | A04 성공 결과를 query로 전달하고 A03에서 toast 표시 |
| FIX-002 | P3 | DONE | 유효한 `app/favicon.ico` 추가 |
| FIX-003 | P3 | DONE | raw reason은 development에서만 표시 |
| FIX-004 | P3 | DONE | allowlist 밖 reason에 `unknown` 전용 안내 |
| FIX-005 | P3 | WONTFIX | CMS 데스크톱 전용·최소 폭 980px 정책 승인 |
| FIX-006 | P2 | DONE | 보안 로그 mock을 상대 시각으로 생성하고 미래 시각 상한 적용 |
| FIX-007 | P3 | DEFERRED | 아직 없는 legacy treasures/users/edit route 정책 |
| FIX-008 | P3 | DEFERRED | Vitest/Playwright Test 러너 및 자동 테스트 도입 |
| FIX-009 | P3 | DEFERRED | Vercel Preview 환경 재검수 |
| FIX-010 | P3 | DEFERRED | 실제 Auth/API/Supabase/RLS 연결 후 검수 |
| FIX-011 | P3 | DEFERRED | 인증 세션 기반 문의 Supabase 경로 검수 |
| FIX-012 | P2 | DONE | A04 HTML native 검증 대신 일관된 FieldError 사용 |
| FIX-013 | P2 | DONE | mappings의 미구현 treasure route prefetch 차단 |
| FIX-014 | P3 | DONE | products의 미구현 edit/treasure route prefetch 차단 |
| FIX-015 | P2 | DONE | 전체 Admin custom dialog Escape 닫기 |
| FIX-016 | P2 | DONE | 전체 Admin custom dialog backdrop 닫기 |
| FIX-017 | P2 | DONE | 초기 focus, focus trap, 종료 후 focus 복원 |

## 5. 주요 코드 변경

### 공용 dialog 안정화

- `components/admin/dialog-overlay.tsx` 추가
- 11개 Admin 화면의 custom dialog를 공용 컴포넌트로 통일
- Escape, backdrop, focus trap, focus restore를 한 구현으로 관리

### 관리자 등록

- `app/admin/admins/new/page.tsx`
  - `noValidate`로 React validation 일원화
  - 성공 시 `/admin/admins?created=1` 이동
- `app/admin/admins/page.tsx`
  - query를 소비해 성공 toast 표시 후 URL 정리

### 보안 로그·접근 차단

- `lib/admin/mock-security-logs.ts`
  - 고정 2026-08 날짜 대신 현재 시각 상대 mock
- `app/admin/security-logs/page.tsx`
  - 오늘/7일/30일 필터에서 미래 시각 제외
- `app/admin/access-denied/page.tsx`
  - unknown reason 전용 문구
  - raw reason production 비노출

### Console/Network noise

- 미구현 route Link에 `prefetch={false}` 적용
- favicon 404 제거

## 6. 수정 후 재검증 결과

| 항목 | 결과 |
|---|---|
| TypeScript | PASS |
| Next production build | PASS |
| A24 unknown reason / production raw code | PASS |
| A21 오늘 / 최근 7일 | PASS (1건 / 8건, 실행 시각 상대) |
| A04 custom email FieldError | PASS |
| A04 성공 toast / 비밀번호 미노출 | PASS |
| dialog 초기 focus / Escape / backdrop / Tab trap | PASS |
| mappings treasure prefetch 404 | PASS (요청 없음) |
| products edit prefetch 404 | PASS (요청 없음) |
| 브라우저 Console | PASS (error 0) |
| favicon | PASS (HTTP 200, `image/x-icon`) |

## 7. 남은 리스크와 재검수 Trigger

### 병합 전 차단하지 않는 항목

1. **FIX-007 legacy route**
   - 사용자가 링크를 직접 클릭하면 아직 404가 가능하다.
   - 자동 prefetch 404는 제거했다.
   - treasures/users/edit 화면 개발 시 route를 구현하거나 안내/redirect 정책을 정한다.

2. **FIX-008 자동 테스트 러너**
   - 현재 저장소에는 Vitest/Playwright Test script가 없다.
   - 이번 검수는 lint/tsc/build + Playwright CLI 수동 자동화로 수행했다.

3. **FIX-009~011 외부 환경**
   - Preview URL, 실제 관리자 인증, 실제 Supabase 문의 경로가 준비되면 별도 Release Gate로 재검수한다.

### Rollback

- 이 PR은 mock-only Admin CMS UI와 QA 문서만 변경한다.
- 문제 발생 시 PR의 단일 commit을 revert하면 기존 7PR 병합 상태로 복귀한다.
- DB migration, 외부 API, 실제 사용자 데이터 변경은 없다.

## 8. Reviewer 권장 확인 순서

1. 이 문서의 범위와 DEFERRED 항목을 확인한다.
2. [`06_FIX_AND_FOLLOWUP_BACKLOG.md`](./06_FIX_AND_FOLLOWUP_BACKLOG.md)에서 FIX별 재현·해결을 확인한다.
3. [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)에서 화면별 최종 결과를 확인한다.
4. `components/admin/dialog-overlay.tsx`와 A04/A21/A24 변경을 우선 코드 리뷰한다.
5. 아래 명령으로 로컬 Gate를 재현한다.

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start -- -p 3010
```

6. `/admin/admins/new`, `/admin/security-logs`, `/admin/access-denied?reason=unknown_xyz`를 smoke test한다.

## 9. 관련 문서

- [범위·판정 기준](./00_QA_SCOPE_AND_INDEX.md)
- [Master QA 체크리스트](./01_MASTER_QA_CHECKLIST.md)
- [화면·Journey E2E 체크리스트](./02_E2E_SCREEN_AND_JOURNEY_CHECKLIST.md)
- [단위·컴포넌트 테스트 설계](./03_UNIT_AND_COMPONENT_TEST_CHECKLIST.md)
- [자동화·증거·수동 확인 정책](./04_AUTOMATION_EVIDENCE_AND_HUMAN_CHECKLIST.md)
- [실행 계획](./05_QA_EXECUTION_PLAN.md)
- [FIX 및 후속 백로그](./06_FIX_AND_FOLLOWUP_BACKLOG.md)
- [누적 실행 결과](./07_EXECUTED_CHECKLIST_RESULTS.md)

로컬 runtime screenshot/trace/network artifact는 용량과 재현성 때문에 Git에서 제외했다. 팀이 확인해야 할 판정·수치·재현·해결 내용은 위 문서에 보존했다.
