# Admin CMS 7PR — 핵심 체크리스트 실행 결과 (누적)

> 전체 ~900 ID 중 **브라우저·정적으로 실제로 확인한 핵심 항목**만 PASS/WARNING/DEFERRED로 기록한다.
> 미기입 ID는 아직 미실행이거나 동일 시나리오로 커버된 파생 항목일 수 있다.
> 팀 공유 요약: [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)
> 로컬 runtime 증거: `qa-artifacts/2026-08-10-admin-cms-7pr-0bb4d26/`

## 정적·보안

| ID | 결과 | 비고 |
|---|---|---|
| QA-STATIC-102 lint | PASS | |
| QA-STATIC-103 build | PASS | Round2 |
| QA-STATIC-106 tsc | PASS | |
| QA-SEC-101~107 forbidden | PASS | fetch/supabase/storage 없음 |
| QA-SEC password plaintext dialog | PASS | A04/A05 |

## A01

| ID | 결과 |
|---|---|
| E2E-A01-001/020/021 login success | PASS |
| E2E-A01-010 empty email | PASS |
| E2E-A01-012 invalid email | PASS |
| E2E-A01-015 empty password | PASS |
| E2E-A01-008 Tab order | PASS |

## A03

| ID | 결과 |
|---|---|
| list/search/filter/reset/pagination | PASS |
| viewer+locked combo | PASS (2명) |
| locked only | PASS (3명) |
| inactive only | PASS (4명) |
| active only | PASS (17명) |
| operator / viewer / super_admin | PASS (12/11/1) |
| search admin.ops | PASS (김운영) |
| page 2 | PASS | R8: 4행 · 최운영 |

## A04

| ID | 결과 | 비고 |
|---|---|---|
| empty validation | PASS | |
| password mismatch | PASS | R7 |
| weak password rule | PASS | R7 |
| no role selected | PASS | R7 「역할을 선택하세요.」 |
| confirm dialog no password | PASS | |
| dirty leave confirm | PASS | R7 dismiss/accept |
| success feedback visible | PASS | FIX-001 · 목록 이동 후 toast |
| native email vs FieldError | PASS | FIX-012 · `noValidate` + FieldError |
| Escape closes confirm | PASS | FIX-015~017 · 공용 DialogOverlay |

## A05

| ID | 결과 | 비고 |
|---|---|---|
| detail / unknown ID | PASS | |
| pw reset no temp password | PASS | |
| locked unlock disabled | PASS | |
| role change mock + no mutate on reload | PASS | |
| deactivate mock | PASS | |
| activate mock (inactive) | PASS | R5 toast, status 유지 |
| Escape closes dialog | PASS | FIX-015~017 · 공용 DialogOverlay |

## A21/A22/A24

| ID | 결과 | 비고 |
|---|---|---|
| A21 list/filters/pagination | PASS | |
| A21 severity sort + pageSize 50 | PASS | |
| A21 event+severity combo | PASS | |
| A21 search SEC-1001 | PASS | |
| A21 unresolved + 7d | PASS (37건) | |
| A21 Date.now / today future | PASS | Phase7 relative mock timestamps + upper time bound |
| A21 sorts asc/risk/open | PASS | R4 |
| A21 status counts 10/11/11/10 | PASS | |
| A21 severity 10/11/11/10 | PASS | R7 |
| A21 last_7_days | PASS | Phase7 relative mock timestamps · 현재 검증 8건 |
| A21 query userId/treasureId | PASS | |
| A21 empty + pageSize100 | PASS | |
| A22 SEC-1001 / unknown | PASS | R8 unknown 재확인 |
| A24 reason variants | PASS | FIX-003 raw reason은 development에서만 표시 |
| A24 permission_denied | PASS | R8 |
| A24 allowlist 4 reasons | PASS | R13 role_missing 등 |
| A24 out-of-allowlist fallback | PASS | FIX-004 `unknown` 전용 문구 |
| A05 activity IP mask | PASS | R13 203.0.113.*** |
| A21 XSS search | PASS | R13 0건 · no img |
| A21 permission_denied+critical | PASS | R13 2건 |
| A04 inactive submit | PASS | FIX-001 toast 표시 · 비밀번호 미노출 |

## 회귀·공통

| ID | 결과 | 비고 |
|---|---|---|
| products/mappings/rewards/inquiries/dashboard | PASS | R8 rewards 8행 · shell 7 links |
| product detail edit prefetch | PASS | FIX-014 prefetch 제거 |
| mappings treasures prefetch | PASS | FIX-013 prefetch 제거 |
| rewards/[id] detail + unknown | PASS | R4 |
| inquiries row→dialog→detail | PASS | Escape/backdrop/focus FIX-015~017 |
| inquiries status 해결됨/읽는 중 | PASS | R8: 1건 / 2건 |
| inquiries Escape closes | PASS | FIX-015/016/017 공용 DialogOverlay |
| inquiries 상세 보기 nav | PASS | R8 `/admin/inquiries/42b7dfe7-…` |
| products UI status=inactive | PASS | R8: 2건 |
| mappings status=inactive | PASS | R13: 4행 |
| products detail + edit prefetch | PASS | FIX-014 · prefetch 404 제거 |
| shell route smoke (7+mappings) | PASS | R13 · `/admin/rewards` list 404 정책 |
| home/map/login/dashboard/access-denied HTTP | PASS | R8 전부 200 · R13 재확인 |
| rewards detail + history | PASS | R8 `/admin/rewards/:id` · history 5건 |
| A24 unknown/session/role_mismatch fallback | PASS | FIX-004 unknown 안내 |
| legacy treasures/users/edit 직접 접근 404 | WARNING | FIX-007 · prefetch 노이즈는 FIX-013/014로 제거 |
| favicon 404 | PASS | FIX-002 · `/favicon.ico` HTTP 200 |
| CMS min-w 980 narrow | WONTFIX(정책) | FIX-005 · CMS 데스크톱 전용 정책 |
| Phase5 viewport 1440/1280/1024 | PASS | R11 |
| Phase5 768/375 | WONTFIX(정책) | FIX-005 · 980px 최소 폭 및 가로 스크롤 수용 |
| A04 dialog Escape/backdrop/focus | PASS | FIX-015/016/017 |
| unit tests | DEFERRED | FIX-008 |
| Vercel Preview | DEFERRED | FIX-009 |

## 판정

- P0 FAIL: 0
- 누적 Verdict: **PASS WITH WARNINGS**
- Phase7 수정: FIX-001/002/003/004/006/012/013/014/015/016/017 **DONE**, FIX-005 **WONTFIX(정책)**
- Round8: `WEB_QA_CONTINUITY_R8.md` · 신규 FIX 없음
- Round9: `WEB_QA_CONTINUITY_R9.md` · A21 기간·A05 reset·A04 FIX-012 · 신규 FIX 없음
- Round10: `WEB_QA_CONTINUITY_R10.md` · FIX-001/004 재확인 · 신규 FIX 없음
- Round11: `WEB_QA_CONTINUITY_R11.md` · Phase5 viewport · FIX-005/017 · Shell routes
- Round12: `WEB_QA_CONTINUITY_R12.md` · products search · history Escape FIX-015
- Round13: `WEB_QA_CONTINUITY_R13.md` · 잔여 시나리오 마감 · 신규 FIX 없음 · **QA 런 완료(수정 보류)**
- Round14: post-Phase7 재검증 · tsc/build PASS · A24/A21/A04/dialog/prefetch/favicon PASS · **FIX-005 정책 WONTFIX**
