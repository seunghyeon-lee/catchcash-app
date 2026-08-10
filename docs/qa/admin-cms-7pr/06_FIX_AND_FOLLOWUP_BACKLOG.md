# Admin CMS 7PR — 검수 수정·후속 리스트

> 출처: `2026-08-10-admin-cms-7pr-0bb4d26` Web QA (`PASS WITH WARNINGS`)
> 목적: 검수에서 나온 **수정 후보 / 제품 결정 / 후속 작업**을 한곳에 모아 추적한다.
> 팀 공유 보고서: [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)
> 로컬 runtime 증거: `qa-artifacts/2026-08-10-admin-cms-7pr-0bb4d26/`

## 사용 방법

- 새 검수에서 이슈가 나오면 여기 ID를 이어 붙인다 (`FIX-007` …).
- 상태: `OPEN` / `DECIDED` / `IN_PROGRESS` / `DONE` / `WONTFIX` / `DEFERRED`
- 우선순위: `P0` 즉시 / `P1` 이번 스프린트 / `P2` 여유 / `P3` 백로그·제품결정

---

## 요약

| ID | 우선순위 | 상태 | 한 줄 요약 |
|---|---|---|---|
| FIX-001 | P2 | DONE | A04 등록 성공 메시지가 리다이렉트 때문에 안 보임 → `?created=1` query param + 목록 toast |
| FIX-002 | P3 | DONE | favicon.ico 404 → `app/favicon.ico` 추가 |
| FIX-003 | P3 | DONE | A24 raw `reason:` 코드는 개발 환경에서만 표시 |
| FIX-004 | P3 | DONE | A24 allowlist 밖 reason은 전용 안내 문구로 처리 |
| FIX-005 | P3 | WONTFIX(정책) | AdminShell `min-w-[980px]` — CMS 데스크톱 전용 정책 |
| FIX-006 | P2 | DONE | A21 mock 날짜를 `Date.now()` 기준 상대 시간으로 변경 |
| FIX-007 | P3 | DEFERRED | legacy `/admin/treasures` 등 404 baseline 처리 |
| FIX-008 | P3 | DEFERRED | 단위·Playwright Test 러너 도입 |
| FIX-009 | P3 | DEFERRED | Vercel Preview 환경 재검수 |
| FIX-010 | P3 | DEFERRED | 실제 Auth/API/Supabase 연결 후 재검수 |
| FIX-011 | P3 | DEFERRED | 문의 화면 인증 후 Supabase 경로 검수 |
| FIX-012 | P2 | DONE | A04 form에 `noValidate` 추가 → 커스텀 FieldError 정상 동작 |
| FIX-013 | P2 | DONE | mappings → treasures 링크에 `prefetch={false}` 적용 |
| FIX-014 | P3 | DONE | products edit 링크 + treasures 링크에 `prefetch={false}` 적용 |
| FIX-015 | P2 | DONE | 공용 `DialogOverlay` 컴포넌트 → Escape 닫기 지원 (전체 11파일 적용) |
| FIX-016 | P2 | DONE | `DialogOverlay` → backdrop 클릭 닫기 지원 |
| FIX-017 | P2 | DONE | `DialogOverlay` → focus trap + 초기 focus + 닫을 때 restore |

---

## 코드 수정 후보

### FIX-001 — A04 등록 성공 피드백 미표시

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | A04 → A03 |
| 파일 | `app/admin/admins/new/page.tsx` (목록 쪽 toast 수신부도 필요 시 `app/admin/admins/page.tsx`) |
| 재현 | 유효 입력 → 확인 dialog → 등록 → `/admin/admins` 이동 |
| 현상 | `setCompletedMessage(...)` 직후 `router.push` 해서 메시지가 화면에 안 남음 |
| 제안 | (A) 목록으로 `?created=1` 쿼리 전달 후 목록에서 toast, 또는 (B) 메시지 표시 후 짧은 delay 후 이동, 또는 (C) 목록 전역 banner |
| 해결 | `/admin/admins?created=1`로 이동하고 목록에서 성공 toast를 표시한 뒤 URL을 정리 |
| 검수 시 재확인 | 등록 직후 성공 문구 가시 / 비밀번호 미표시 유지 |

### FIX-002 — favicon 404

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DONE |
| 파일 | `app/` 또는 `public/favicon.ico` (프로젝트 관례에 맞게) |
| 재현 | 아무 admin 페이지 로드 → console |
| 현상 | `Failed to load resource: ... /favicon.ico` 404 |
| 제안 | favicon 자산 추가 또는 `<link rel="icon">` 정리 |
| 해결 | App Router 규약에 맞춰 `app/favicon.ico` 추가 |
| 비고 | 기능 비차단. 콘솔 노이즈 제거용 |

### FIX-006 — A21 기간 필터 / mock 시각

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | A21 |
| 파일 | `lib/admin/mock-security-logs.ts`, `app/admin/security-logs/page.tsx` (필터 로직) |
| 재현 | `/admin/security-logs` → 기간 「오늘」(실행일 2026-08-11) |
| 현상 | mock은 `2026-08-01`~`28` 고정 ISO인데, 「오늘」이 `requested >= today 00:00`이라 **미래(12~28일)까지 포함** → 23건. 7/30일도 `Date.now()` 상대라 고정 mock과 어긋날 수 있음 |
| 제안 | (A) today를 `startOfDay..endOfDay`로 제한, (B) mock를 `now-N days` 상대 생성으로 통일, (C) 기간 경계 단위 테스트 |
| 해결 | mock timestamp를 `Date.now()` 상대값으로 생성하고 오늘/7일/30일 필터에 현재 시각 상한 적용 |
| 증거 | Round4: today=23건, last_30_days=42건. Round7: last_7_days=37건(미래일≥now도 포함) |
| 비고 | 실데이터 전에는 데이터 품질 WARNING |

### FIX-012 — A04 HTML5 email 검증이 커스텀 오류를 가로챔

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | A04 |
| 파일 | `app/admin/admins/new/page.tsx` (`type="email"` input) |
| 재현 | 이메일 `bad` + 짧은 이름/비밀번호 등 입력 후 「계정 등록」 |
| 현상 | 브라우저 네이티브 툴팁(`@` 포함 안내)만 뜨고 React `FieldError`(이름/비밀번호/역할 등)는 실행·표시되지 않음 |
| 제안 | (A) `type="text"` + 커스텀 EMAIL_PATTERN만 사용, (B) form에 `noValidate`, (C) 네이티브 유지·문서상 허용 |
| 해결 | form에 `noValidate`를 추가해 모든 오류를 React FieldError로 일관되게 표시 |
| 증거 | `qa-artifacts/.../screenshots/cont-a04-errors-verified.png` |
| 비고 | 빈 값 submit 시에는 커스텀 오류가 정상 동작함 |

### FIX-013 — mappings → treasures RSC 404

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | `/admin/mappings` (회귀) |
| 재현 | 매핑 목록 진입 |
| 현상 | Console에 `/admin/treasures/treasure-*?_rsc=...` 404 다수 |
| 원인 후보 | 매핑 행/링크가 아직 없는 treasures 상세 route를 prefetch |
| 제안 | 링크 제거·비활성·준비 중 처리, 또는 treasures shell 전까지 prefetch 방지 |
| 해결 | 존재하지 않는 treasure 상세 링크에 `prefetch={false}` 적용 |
| 비고 | FIX-007과 연관. 7PR 범위 밖일 수 있으나 회귀 콘솔 오염 |

### FIX-014 — 상품 상세가 edit route를 prefetch

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DONE |
| 화면 | `/admin/products/[id]` |
| 재현 | 상품 상세 진입 |
| 현상 | Console에 `/admin/products/.../edit?_rsc=...` 404 |
| 제안 | edit 링크 prefetch 제거, 또는 edit shell 구현 전 링크 숨김 |
| 해결 | 상품 edit 및 연관 treasure 링크에 `prefetch={false}` 적용 |
| 증거 | Round8: `prod-starbucks-americano-tall/edit?_rsc=...` 404 |
| 비고 | `/edit` 직접 접근 404는 기존 baseline(FIX-007 계열) |

### FIX-015 — 커스텀 dialog Escape 미지원

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | A04 등록 확인 / A05 역할·비활성·비밀번호 dialog / 문의 목록 상세 이동 dialog / 보상 재처리 history 상세 |
| 재현 | dialog 연 뒤 `Escape` |
| 현상 | dialog가 닫히지 않음 (취소 버튼으로는 닫힘) |
| 제안 | `keydown Escape` → close, 가능하면 focus trap·backdrop click도 정렬 |
| 해결 | 공용 `DialogOverlay`에서 Escape 처리 후 전체 Admin custom dialog에 적용 |
| 증거 | `r3-a04-escape.png`, 문의 Escape 재현, Round12 history 상세 Escape 유지 |
| 비고 | a11y P2. mock shell 기능 차단은 아님 |

### FIX-016 — 커스텀 dialog backdrop 클릭 미닫힘

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | 문의 확인 dialog (A04/A05 동일 패턴) |
| 재현 | dialog 연 뒤 overlay 모서리(20,20) 클릭 |
| 현상 | dialog 유지. 취소 버튼으로만 닫힘 |
| 제안 | backdrop `onClick`으로 close(패널 stopPropagation). Escape(FIX-015)·focus(FIX-017)와 한 묶음 권장 |
| 해결 | 공용 `DialogOverlay`에서 backdrop target을 확인해 닫고 panel propagation 차단 |
| 증거 | `r4-inq-backdrop-still-open.png` |

### FIX-017 — 커스텀 dialog focus trap / 초기 focus

| 항목 | 내용 |
|---|---|
| 우선순위 | P2 |
| 상태 | DONE |
| 화면 | 문의 확인 dialog (A04/A05 동일 패턴) |
| 재현 | dialog 연 뒤 Tab 반복 |
| 현상 | 초기 focus가 dialog로 이동하지 않음. Tab이 「취소」→「상세 보기」→ **BODY/페이지**로 탈출 |
| 제안 | 열릴 때 첫 focusable로 focus, Tab cycle trap, 닫을 때 트리거로 restore |
| 해결 | 공용 `DialogOverlay`에서 초기 focus, Tab 순환, 닫을 때 이전 focus 복원 |
| 증거 | Round4 eval activeElement 결과 |
| 비고 | E2E-A04-057 / E2E-A05-051 |

---

## 제품·정책 결정 필요

### FIX-003 — A24 `reason:` 코드 노출

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DONE |
| 화면 | A24 |
| 파일 | `app/admin/access-denied/page.tsx` |
| 재현 | `/admin/access-denied?reason=permission_denied` |
| 현상 | 사용자용 문구 아래 `reason: permission_denied` raw 코드 표시 |
| 결정 | 개발 환경에서만 요청 reason과 resolve 결과를 표시하고, 운영 환경에서는 숨긴다. |
| 비고 | mock shell 차단 아님 · 운영 사용자에게 내부 코드 비노출 |

### FIX-004 — A24 알 수 없는 reason query fallback

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DONE |
| 화면 | A24 |
| 파일 | `app/admin/access-denied/page.tsx` (`resolveReason`) |
| 재현 | `/admin/access-denied?reason=unknown_xyz` 또는 `session_expired` |
| 현상 | whitelist 밖 값이 `permission_denied`로 치환되어 원본 query와 UI reason이 불일치 |
| 결정 | whitelist 밖의 non-empty reason은 `unknown` 전용 문구로 표시한다. reason이 없으면 기존 공통 `permission_denied`를 사용한다. |
| 증거 | Round5: session_expired / unknown_xyz → `reason: permission_denied` |
| 연관 | FIX-003 |

### FIX-005 — AdminShell 최소 폭 980px

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | WONTFIX(정책) |
| 화면 | 공통 AdminShell |
| 파일 | `components/admin/admin-shell.tsx` (`min-w-[980px]`) |
| 재현 | viewport 375×812 `/admin/admins` |
| 현상 | shell ~980px 유지, 표 컬럼 찌그러짐/가로 스크롤 |
| 결정 | CMS는 표·필터 중심의 데스크톱 전용 화면으로 운영한다. 980px 미만 뷰포트의 가로 스크롤은 의도된 제약으로 수용한다. |
| 비고 | WARNING 관찰 결과를 정책적으로 수용 · 반응형 개선은 별도 제품 범위로 재논의 |

### FIX-007 — Legacy 라우트 404

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DEFERRED |
| 재현 | `/admin/treasures`, `/admin/users/*`, 보상 상세의 유저/보물 「이동」 Link |
| 현상 | Next 기본 404. 보상 상세에서 prefetch 시 콘솔 404 2건 |
| 제안 | 사이드바 「준비 중」과 일치하므로 당분간 baseline. 필요 시 안내 페이지 또는 redirect. Link prefetch 억제도 옵션 |
| 비고 | 이번 7PR 범위 밖. Round4 보상 상세 console로 재확인 |

---

## 인프라·후속 검수 (코드 수정 아님)

### FIX-008 — 단위 / Playwright Test 도입

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DEFERRED |
| 관련 문서 | `docs/qa/admin-cms-7pr/03_UNIT_AND_COMPONENT_TEST_CHECKLIST.md` |
| 내용 | Vitest 등 러너·의존성 미설치로 단위 게이트 미실행. 승인 후 설치·테스트 추가 |

### FIX-009 — Vercel Preview 재검수

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DEFERRED |
| 내용 | 로컬 `:3010`만 검수. Preview URL에서 smoke + 핵심 Journey 재실행 |

### FIX-010 — Real Auth / API / Supabase 연결 후 재검수

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 (연결 시점에는 P0 게이트) |
| 상태 | DEFERRED (`DEFERRED_REAL_CONNECT`) |
| 내용 | mock-only 계약 종료 후 로그인·권한·저장·보안로그 실연동 재검증 |

### FIX-011 — 문의(inquiries) 인증 경로

| 항목 | 내용 |
|---|---|
| 우선순위 | P3 |
| 상태 | DEFERRED |
| 내용 | 비인증 mock fallback만 smoke. 인증 세션 + Supabase 문의 경로 별도 검수 |

---

## Phase7 배치 수정 결과

- FIX-001/002/006/012/013/014/015/016/017: **DONE**
- FIX-003: **DONE** — 운영 환경 raw reason 숨김
- FIX-004: **DONE** — 알 수 없는 reason 전용 문구
- FIX-005: **WONTFIX(정책)** — CMS 데스크톱 전용 및 980px 최소 폭 수용
- FIX-007~011: **DEFERRED** — legacy route, 테스트 러너, Preview, 실 Auth/API/Supabase 환경 필요

---

## 남은 후속 순서

1. **FIX-008** — 단위·Playwright Test 러너 도입
2. **FIX-009** — Vercel Preview 재검수
3. **FIX-010** — 실제 Auth/API/Supabase 연결 후 재검수
4. **FIX-011** — 인증된 문의 Supabase 경로 검수
5. **FIX-007** — legacy route 정책 결정 및 안내 페이지/redirect 검토

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-08-10 | 첫 Web QA 런 결과로 FIX-001~011 초안 작성 |
| 2026-08-10 | 2차 연속 검수: FIX-012, FIX-013 추가. 코드 수정 보류 |
| 2026-08-10 | 회귀 보강: FIX-014(상품 edit prefetch 404) 추가. build/A01 deep/A05 variants/A21 combo·search/viewports/회귀 HTTP+브라우저 완료 |
| 2026-08-11 | Round3: FIX-015(dialog Escape). A05 mock actions·A03 viewer+locked·A21 미확인/7일·문의 행→상세 PASS |
| 2026-08-11 | Round4: FIX-016/017(backdrop·focus). FIX-006 정정(오늘=미래 포함). A21 정렬·status·query·empty·pageSize100. rewards 상세·unknown. A03 locked |
| 2026-08-11 | Round5: A05 activate mock PASS. A22 SEC-1001 재확인. A24 allowlist PASS / unknown·session_expired → FIX-004 |
| 2026-08-11 | Round7: A21 severity·7일·page reset. A04 mismatch/weak/no-role/dirty. A03 role counts. A05 empty reason. mappings 404 재확인. 신규 FIX 없음 |
| 2026-08-11 | Round8: A03 page2·search · A22 · rewards/history · A24 FIX-004 재확인 · inquiries Escape/상세 · products inactive UI · FIX-013/014 재확인. 신규 FIX 없음 |
| 2026-08-11 | Round9: A21 기간 23/37/42 FIX-006 · empty 0건 · legacy HTTP 404 · A05 Escape/사유/성공 toast · A04 FIX-012. 신규 FIX 없음 |
| 2026-08-11 | Round10: A04 confirm·FIX-001 toast 미표시 재확인 · A24 not_authenticated→FIX-004 · A01 focusables. 신규 FIX 없음 |
| 2026-08-11 | Round11: Phase5 viewport 1440~375 · FIX-005 내부 min-w 980 · A04 Tab/dirty/focus trap FIX-017 · A21 page2/3 · Shell 7routes. 신규 FIX 없음 |
| 2026-08-11 | Round12: products search · reward history failed+상세 Escape→FIX-015 범위 확장. 신규 FIX 없음 |
| 2026-08-11 | Round13: A24 allowlist 4종 PASS · FIX-004 재확인 · A05 IP mask · A21 XSS/combo · A04 inactive submit(FIX-001) · mappings inactive · FIX-013/014 console · HTTP smoke. 신규 FIX 없음 · QA 잔여 마감 |
| 2026-08-11 | **Phase7 배치 수정**: FIX-001/002/006/012/013/014/015/016/017 → DONE. DialogOverlay 공용 컴포넌트 + 전체 11파일 적용. tsc·build PASS |
| 2026-08-11 | **Phase7 정책 반영**: FIX-003/004 → DONE(개발 전용 reason·unknown 문구), FIX-005 → WONTFIX(데스크톱 전용 CMS 정책) |