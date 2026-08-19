# 관리자 CMS 7PR 하드 QA 실행 계획서

> 상태: **EXECUTED — Round 1~14 및 Phase7 수정 완료 / PASS WITH WARNINGS**
> 수정 추적: [`06_FIX_AND_FOLLOWUP_BACKLOG.md`](./06_FIX_AND_FOLLOWUP_BACKLOG.md)
> 결과 요약: [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)
> 팀장 검토: [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)
>
> 이 계획서는 체크리스트 작성 이후의 실제 검수 순서를 정의한다. 사용자 승인 전에는 브라우저 QA, lint/build, 테스트 설치·작성, 기능 코드 수정, screenshot/trace 생성, PR/commit을 시작하지 않는다.

## 1. 목표

1. 이번 7PR이 mock-only shell 계약을 정확히 지키는지 검증한다.
2. 각 화면의 정상/오류/경계/빈 상태와 화면 간 Journey를 실제 브라우저로 검증한다.
3. AdminShell 변경이 기존 관리자 화면에 회귀를 만들지 않았는지 확인한다.
4. 민감정보·금지 호출·Network side effect가 없음을 증거로 남긴다.
5. 자동화 가능한 검증과 사용자 판단이 필요한 검증을 분리한다.
6. 결함 발견 시 최소 수정 → 해당 scenario → 연관 회귀 순으로 닫는다.

## 2. 전제·가정

- 기준 브랜치는 현재 `main`으로 가정하되 실행 직전 SHA를 다시 고정한다.
- 현재 화면은 실제 Auth/API/RLS가 없는 mock-only shell이다.
- 실제 인증·권한 검증은 후속 real-connect이며 이번 QA에서는 `DEFERRED_REAL_CONNECT`다.
- 데스크톱이 관리자 CMS의 주 지원 환경이다.
- `AdminShell`의 `min-w-[980px]`는 CMS 데스크톱 전용 정책으로 승인되어 WONTFIX 처리했다.
- 현재 정식 unit/component/E2E test runner는 없다.
- Playwright CLI는 설치·브라우저 구동 검증이 완료되어 있다.
- runtime artifact는 `qa-artifacts/`와 `.playwright-cli/`에 로컬 보존하고 commit하지 않는다. 팀 공유용 결과는 `07`·`08` 문서에 요약한다.

## 3. Plan

### Phase 0 — 사용자 승인·기준선 고정

1. 최종 대상 SHA, 환경, viewport 지원 정책을 확정한다.
2. 테스트 dependency/테스트 코드 추가 여부를 확정한다.
3. 결함 발견 시 자동 최소 수정 권한을 확정한다.
4. known warning(favicon 404, CMS 좁은 viewport)을 확정한다.
5. A24 reason code 노출과 레거시 404 baseline 정책을 확정한다.

### Phase 1 — 정적·보안·빌드 Gate

1. 변경 범위와 기존 untracked를 고정한다.
2. forbidden pattern·민감정보·mock invariant를 검사한다.
3. lint/build/route 생성 여부를 검사한다.
4. P0 발견 시 브라우저 검수 전에 중단한다.

### Phase 2 — 단위·컴포넌트 자동화 Gate(승인 시)

1. test runner를 별도 QA automation 변경으로 추가한다.
2. component 내부 pure logic을 최소 범위로 추출한다.
3. 날짜·timezone·timer를 고정한다.
4. P0 pure branch 100%, 전체 branch 90% 목표로 실행한다.

승인하지 않으면 Phase 2는 `BLOCKED_BY_DECISION`이 아니라 `DEFERRED_BY_USER`로 기록하고, Playwright CLI + 정적 검사로 진행한다.

### Phase 3 — P0 Browser Journey

1. headed Chrome·trace 세션을 시작한다.
2. A01 로그인 → 대시보드 → AdminShell을 검증한다.
3. A03→A04→A05 관리자 계정 Journey를 검증한다.
4. A21→A22 보안 로그 조사 Journey를 검증한다.
5. A24 reason/recovery Journey를 검증한다.
6. 각 Journey에서 Console/Network를 수집한다.

### Phase 4 — 화면별 Deep QA

1. 화면별 정상/오류/경계/빈/unknown 상태를 체크한다.
2. search/filter/sort/page/date/query 조합을 table-driven 방식으로 수행한다.
3. dialog·dirty confirm·duplicate click·reload/back/forward를 수행한다.
4. password/masking/no-mutation 계약을 별도 P0로 확인한다.

### Phase 5 — 시각·반응형·접근성

1. 1440×900, 1280×720, 1024×768을 필수로 검증한다.
2. 768×1024, 375×812는 지원 정책과 비교해 PASS/WARNING을 판정한다.
3. default/error/empty/dialog/submitting screenshot을 판독한다.
4. keyboard, focus, dialog semantics를 검증한다.
5. 사용자에게 핵심 screenshot 승인 요청을 전달한다.

### Phase 6 — 기존 관리자 회귀

1. dashboard/products/mappings/rewards/inquiries route를 순회한다.
2. 기존 sidebar active와 layout을 검증한다.
3. Console/Network 신규 오류를 확인한다.
4. 사용자 앱 최소 HTTP smoke를 수행한다.

### Phase 7 — 결함 수정 루프(승인 범위 내)

1. FAIL을 P0/P1/P2/P3로 분류한다.
2. 동일 scenario로 재현한다.
3. 최소 범위 수정한다.
4. 해당 scenario → 화면 smoke → 연관 회귀 → lint/build 순으로 재검증한다.
5. 2회 수정 후에도 실패하거나 범위를 벗어나면 중단·보고한다.

### Phase 8 — 문서·Release Gate

1. 모든 ID에 결과를 기록한다.
2. evidence manifest를 완성한다.
3. P0/P1 0건을 확인한다.
4. warning에 사용자 승인 기록을 연결한다.
5. 최종 verdict와 후속 real-connect 항목을 구분한다.

## 4. TODO

> 아래 체크박스는 최초 실행 계획의 추적 ID를 보존한 것이다. 핵심 실제 실행 결과와 최종 상태는 [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)를 기준으로 한다.

### Plan

- [ ] `PLAN-001` 대상 branch/SHA를 사용자와 확정한다.
- [ ] `PLAN-002` local production build와 Vercel Preview 중 최종 환경을 확정한다.
- [ ] `PLAN-003` viewport 지원 정책을 확정한다.
- [ ] `PLAN-004` known warning 정책을 확정한다.
- [ ] `PLAN-005` unit/component/E2E runner 도입 여부를 확정한다.
- [ ] `PLAN-006` 결함 자동 수정 권한을 확정한다.
- [ ] `PLAN-007` 레거시 404 링크 baseline 처리 방식을 확정한다.
- [ ] `PLAN-008` A24 reason code 화면 노출 정책을 확정한다.
- [ ] `PLAN-009` inquiries 실제 인증/Supabase 경로 검수 여부를 확정한다.

### Implement

- [ ] `IMPL-001` 승인 시 test runner/config를 별도 범위로 추가한다.
- [ ] `IMPL-002` 승인 시 pure validation/filter/sort helper를 최소 추출한다.
- [ ] `IMPL-003` 승인 시 unit/component test를 작성한다.
- [ ] `IMPL-004` 승인 시 안정화된 P0 Journey를 Playwright Test spec으로 작성한다.
- [ ] `IMPL-005` 발견 결함은 승인 범위 내 최소 수정한다.

### Verify

- [ ] `VERIFY-001` git 범위·금지 파일·민감정보를 검사한다.
- [ ] `VERIFY-002` `git diff --check`를 통과한다.
- [ ] `VERIFY-003` `npm run lint`를 통과한다.
- [ ] `VERIFY-004` `npm run build`를 통과한다.
- [ ] `VERIFY-005` unit/component test를 승인 시 통과한다.
- [ ] `VERIFY-006` A01/A03/A04/A05/A21/A22/A24 화면별 체크리스트를 수행한다.
- [ ] `VERIFY-007` P0 사용자 Journey 5개를 수행한다.
- [ ] `VERIFY-008` AdminShell과 기존 admin route 회귀를 수행한다.
- [ ] `VERIFY-009` Console/Network/side effect를 검사한다.
- [ ] `VERIFY-010` desktop/tablet/mobile 시각 검수를 수행한다.
- [ ] `VERIFY-011` keyboard/dialog/accessibility 검수를 수행한다.
- [ ] `VERIFY-012` 수정 후 연관 회귀와 최종 lint/build를 반복한다.

### Document

- [ ] `DOC-001` 실행 manifest에 SHA/환경/도구 버전을 기록한다.
- [ ] `DOC-002` 모든 체크리스트 ID에 결과를 기록한다.
- [ ] `DOC-003` screenshot/trace/video/Console/Network를 연결한다.
- [ ] `DOC-004` 결함에 severity/repro/expected/actual/cause/fix를 기록한다.
- [ ] `DOC-005` deferred real-connect 항목을 별도 표기한다.
- [ ] `DOC-006` 사용자의 visual/warning 승인을 기록한다.

### Automate

- [ ] `AUTO-001` 반복 정적 gate를 script 또는 CI로 옮길지 승인받는다.
- [ ] `AUTO-002` unit/component suite의 CI 실행을 승인받는다.
- [ ] `AUTO-003` P0 E2E의 CI 실행과 artifact upload를 승인받는다.
- [ ] `AUTO-004` retry/trace/video 보존 정책을 고정한다.
- [ ] `AUTO-005` flake를 retry로 은폐하지 않는 gate를 둔다.

### Release

- [ ] `REL-001` P0/P1 미해결 0건을 확인한다.
- [ ] `REL-002` P2/P3 수용 여부를 사용자에게 승인받는다.
- [ ] `REL-003` 최종 verdict를 확정한다.
- [ ] `REL-004` PASS가 아니면 merge/release 권고를 하지 않는다.
- [ ] `REL-005` 회귀 발생 시 해당 수정만 revert 가능한지 확인한다.
- [ ] `REL-006` QA artifact에 secret이 없고 gitignored인지 확인한다.

## 5. 상세 실행 순서

### Gate 0 — 시작 승인

필요 사용자 응답:

1. 검수 환경
2. 최소 viewport
3. test dependency 도입 여부
4. 자동 수정 허용 범위
5. warning 허용 기준

하나라도 결과를 크게 바꾸면 임의 결정하지 않는다.

### Gate 1 — Baseline

계획 command:

```powershell
git branch --show-current
git log -1 --oneline
git status --short
git diff --check
node -v
npm -v
playwright-cli --version
```

저장 결과:

- `manifest.md`
- `reports/static-gates.txt`

중단:

- 예상 밖 tracked diff
- secret 의심 파일
- 잘못된 SHA/branch

### Gate 2 — Static·Build

계획 command:

```powershell
npm run lint
npm run build
```

추가:

- 대상 파일 금지 패턴
- 이메일·IP·좌표 정책
- route href
- package/lock/supabase diff

중단:

- lint/build 실패
- 실제 API/Auth/storage 호출
- 민감정보 노출

### Gate 3 — Unit/Component(승인 시)

순서:

1. account fixture/helper
2. security fixture/helper
3. validation/reason/reason whitelist
4. filter/sort/pagination/period
5. AdminShell active
6. component state interaction

중단:

- package 변경 승인 없음
- pure function 추출이 화면 동작을 바꿀 위험
- timezone 기대가 불명확

### Gate 4 — P0 E2E

순서:

1. J1 로그인→계정 조회
2. J2 등록 mock
3. J3 상세 action
4. J4 보안 로그 조사
5. J5 접근 거부 recovery

각 Journey 종료:

- snapshot
- screenshot
- Console
- Network
- trace checkpoint

P0 FAIL 시 다음 Journey를 시작하지 않고 재현/분류한다.

### Gate 5 — Screen Matrix

실행 순서:

1. A01
2. A03
3. A04
4. A05 상태별 4개 fixture
5. A21
6. A22 event type 대표 4개 + unknown
7. A24 reason 5개 + invalid
8. AdminShell

복합 경우는 pairwise가 아니라 문서의 P0 조합을 전부 실행한다.

### Gate 6 — Visual/Accessibility

화면마다:

1. default desktop
2. error/empty
3. dialog
4. 1280
5. 1024
6. 768
7. 375
8. keyboard-only

사용자 승인:

- default 7장
- password redaction
- dialog copy
- security masking
- narrow viewport

### Gate 7 — Regression

AdminShell을 사용하는 기존 route를 순회한다. 신규 menu가 기존 active, vertical space, sticky header, route prefetch에 영향을 주지 않는지 본다.

### Gate 8 — Fix/Retest

수정 단위:

- validation helper 수정 → 해당 unit + A01/A04/A05
- account mock/helper 수정 → A03/A04/A05
- security mock/helper 수정 → A21/A22
- AdminShell 수정 → 모든 보호 화면
- shared style 수정 → 모든 viewport visual

### Gate 9 — Final Report

보고서 필수:

- scope/SHA/environment
- 실행/미실행/blocked 항목 수
- P0/P1/P2/P3
- evidence 링크
- user approvals
- deferred real-connect
- final verdict

## 6. 위험과 완화

### 날짜 의존 A21

위험: `Date.now()`와 local midnight를 직접 사용해 실행 날짜에 따라 결과가 바뀐다.

완화:

- E2E 실행 시 실제 시각을 manifest에 기록
- 정식 test에서는 fake clock/now injection
- timezone을 명시

### Dialog 접근성

위험: 현재 구현은 semantics가 있으나 focus trap/Escape/focus restore가 보장되지 않는다.

완화:

- 별도 P2가 아니라 keyboard 사용 불가 수준이면 P1
- 수동 keyboard evidence 포함

### Mock submit notice

위험: A04 완료 notice 설정 직후 route push되어 notice가 실제로 보이지 않을 수 있다.

완화:

- 성공 기준을 route 이동 + 불변 목록으로 판정
- 문서 스펙상 notice 노출이 필수인지 사용자 확인

### AdminShell 좁은 viewport

위험: `min-w-[980px]`로 tablet/mobile horizontal scroll이 발생한다.

완화:

- 데스크톱 지원과 모바일 사용성을 분리
- 사용자 지원 정책 승인
- scroll로 핵심 action 도달 불가면 P1

### Prefix active 판정

위험: `startsWith`가 `/admin/admins-malicious` 같은 유사 route도 active로 볼 수 있다.

완화:

- unit edge case와 unknown route E2E 포함
- 실제 route가 없더라도 helper 정책으로 검증

### Windows Playwright CLI 종료 assertion

위험: 일부 help/version 명령 종료 시 `UV_HANDLE_CLOSING` assertion noise가 관찰됨.

완화:

- 실제 command exit/result와 브라우저 동작을 분리
- test 결과와 도구 noise를 구분
- 브라우저 세션 누수는 `playwright-cli list`로 확인

### 레거시 404 링크

위험: 기존 mappings/products/rewards 화면에 아직 구현되지 않은 `/admin/treasures/[id]`, `/admin/users/[id]`, `/admin/products/[id]/edit` 링크가 있다.

완화:

- 이번 7PR로 새로 생긴 404와 known baseline을 분리
- 회귀 결과에는 WARNING으로 기록
- 별도 수정 여부는 사용자 결정

### Inquiries 조건부 Network

위험: 대부분의 관리자 화면은 mock-only지만 inquiries는 인증 상태에 따라 Supabase를 사용할 수 있어 Network 기대가 다르다.

완화:

- 비인증 mock fallback과 인증 Supabase 경로를 별도 scenario로 분리
- 실제 인증 환경을 제공하지 않으면 mock fallback만 판정
- Supabase 오류를 신규 7PR mock 화면의 side effect와 혼동하지 않음

### A24 reason code 노출

위험: whitelist로 정규화되더라도 `reason: <code>`가 화면에 보이며 사용자용 스펙과 충돌할 수 있다.

완화:

- injection 위험과 정보 노출 정책을 분리
- raw unknown query가 아닌 정규화 값만 표시되는지 확인
- 코드 표시 유지 여부를 사용자에게 승인받음

## 7. Rollback·복구

- QA 실행 자체는 production data를 변경하지 않는다.
- 기능 수정 전 diff를 저장한다.
- 자동 수정은 하나의 결함 단위로 제한한다.
- 수정이 회귀를 만들면 해당 수정만 되돌리고 FAIL을 유지한다.
- destructive git command, force push, amend를 사용하지 않는다.
- package/test framework 도입을 철회할 경우 별도 automation 변경만 revert한다.
- 브라우저 문제가 발생하면 named session을 닫고 새 session으로 재현한다.
- artifact는 gitignored 상태에서 보존하며 사용자가 요청한 경우에만 정리한다.

## 8. 실행 승인 요청 시 사용자에게 물을 항목

실제 QA를 시작할 때 다음 항목을 먼저 확정한다.

1. **환경**: local production build / Vercel Preview / 둘 다
2. **화면 지원**: 1280px 이상 필수인지, tablet/mobile도 필수인지
3. **테스트 코드**: unit/component/Playwright Test dependency 추가 승인 여부
4. **자동 수정**: P0/P1 발견 시 최소 수정까지 자동 진행할지
5. **Warning**: favicon 404와 980px 미만 horizontal scroll의 수용 여부
6. **기존 404**: user/treasure/product-edit 미구현 링크를 warning으로 둘지
7. **A24 표시**: `reason:` 코드 문자열을 유지할지
8. **Inquiries**: 실제 인증 Supabase 경로까지 검수할지

## 9. 현재 결론

- 문서·체크리스트: 준비됨
- Playwright CLI 환경: 준비됨
- 실제 QA: 시작하지 않음
- unit/component test runner: 미도입, 사용자 결정 필요
- 정식 CI E2E: 미도입, 사용자 결정 필요
- 다음 상태: **QA EXECUTION COMPLETE (PASS WITH WARNINGS)** — 상세는 `qa-artifacts/2026-08-10-admin-cms-7pr-0bb4d26/reports/WEB_QA_REPORT.md`
