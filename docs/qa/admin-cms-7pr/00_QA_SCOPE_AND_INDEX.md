# 관리자 CMS 7PR QA 문서 인덱스

> 상태: **Round 1~14 QA 및 Phase7 수정 완료 — PASS WITH WARNINGS**
>
> 팀장 검토 시작점: [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)
> 누적 실행 결과: [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)
> 수정·후속 모음: [`06_FIX_AND_FOLLOWUP_BACKLOG.md`](./06_FIX_AND_FOLLOWUP_BACKLOG.md)

## 1. 검수 대상

| 화면 ID | Route | 구현 파일 | 핵심 목적 |
|---|---|---|---|
| A01 | `/admin/login` | `app/admin/login/page.tsx` | mock 로그인, 클라이언트 검증, 대시보드 이동 |
| A03 | `/admin/admins` | `app/admin/admins/page.tsx` | 관리자 목록, 검색, 필터, 페이지네이션 |
| A04 | `/admin/admins/new` | `app/admin/admins/new/page.tsx` | 등록 폼, validation, 확인 dialog, mock submit |
| A05 | `/admin/admins/[id]` | `app/admin/admins/[id]/page.tsx` | 상세, 역할/상태/비밀번호 mock action |
| A21 | `/admin/security-logs` | `app/admin/security-logs/page.tsx` | 보안 로그 검색, 복합 필터, 정렬, 페이지네이션 |
| A22 | `/admin/security-logs/[id]` | `app/admin/security-logs/[id]/page.tsx` | 보안 로그 상세, 마스킹 정보, 연관 로그 |
| A24 | `/admin/access-denied` | `app/admin/access-denied/page.tsx` | 접근 차단 사유 whitelist, 안전한 이동 |
| 공통 | 위 보호 화면 | `components/admin/admin-shell.tsx` | 메뉴, active 상태, 공통 header/sidebar |

### 지원 데이터·로직

- `lib/admin/mock-admin-accounts.ts`
- `lib/admin/mock-security-logs.ts`

### 직접 회귀 대상

- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/mappings`
- `/admin/mappings/new`
- `/admin/reward-requests`
- `/admin/reward-requests/history`
- `/admin/rewards/[id]`
- `/admin/inquiries`
- `/admin/inquiries/[id]`

### 명시적 비대상

- 실제 Supabase Auth
- 실제 role guard / middleware / RLS / API
- 실제 관리자 생성·수정·비밀번호 재설정
- 실제 보안 로그 상태 변경·제재
- 사용자 앱 기능의 전체 회귀
- 성능 부하·침투 테스트
- 배포 또는 production 데이터 변경

## 2. 문서 구성

1. [`01_MASTER_QA_CHECKLIST.md`](./01_MASTER_QA_CHECKLIST.md)
   - 품질 게이트, 범위, 정적 검증, 보안·민감정보, 접근성, 시각·반응형, 회귀, 종료 기준
2. [`02_E2E_SCREEN_AND_JOURNEY_CHECKLIST.md`](./02_E2E_SCREEN_AND_JOURNEY_CHECKLIST.md)
   - Playwright CLI 기반 화면별·기능별·사용자 Journey E2E 체크리스트
3. [`03_UNIT_AND_COMPONENT_TEST_CHECKLIST.md`](./03_UNIT_AND_COMPONENT_TEST_CHECKLIST.md)
   - 순수 함수, validation, formatter, helper, 컴포넌트 상태 단위 테스트 설계
4. [`04_AUTOMATION_EVIDENCE_AND_HUMAN_CHECKLIST.md`](./04_AUTOMATION_EVIDENCE_AND_HUMAN_CHECKLIST.md)
   - 자동화 범위, evidence 정책, 사용자 협업·결정·수동 확인 항목
5. [`05_QA_EXECUTION_PLAN.md`](./05_QA_EXECUTION_PLAN.md)
   - 실제 실행 전 단계별 계획, TODO, 중단·수정·재검증·완료 기준
6. [`06_FIX_AND_FOLLOWUP_BACKLOG.md`](./06_FIX_AND_FOLLOWUP_BACKLOG.md)
   - 검수에서 나온 수정 후보·제품 결정·후속 검수 항목 통합 추적
7. [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)
   - Round 1~14에서 실제 실행한 핵심 시나리오와 최종 PASS/WARNING/DEFERRED 결과
8. [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)
   - 팀장 검토용 범위·결과·수정 내역·잔여 리스크·PR 검토 순서 요약

## 3. 요구사항 기준 우선순위

충돌 시 아래 순서를 적용한다.

1. 팀장/사용자 확정 요구사항
2. 이번 7PR 실행 계획의 mock-only 및 파일 경계
3. 해당 Axx 화면 정의서
4. `docs/admin-cms/CMS_Coding_Rules_And_Component_Guide.md`
5. 현재 구현 코드
6. 기존 관리자 CMS 패턴

화면 정의서에는 실제 Auth/API/서버 권한 검증 요구가 포함되어 있으나 이번 7PR은 **의도적으로 mock-only shell**이다. 따라서 실제 인증·권한·저장 부재는 이번 QA에서 FAIL이 아니라 `DEFERRED_REAL_CONNECT`로 분류한다. 반대로 mock-only 계약을 깨는 API/Supabase/storage 호출은 P0 FAIL이다.

### 확정 계획이 화면 정의서보다 우선하는 항목

아래는 코드 누락이 아니라 팀장 확정 범위이므로 현재 QA에서 결함으로 등록하지 않는다.

- 관리자 등록 route는 `/admin/admins/create`가 아니라 `/admin/admins/new`다.
- A03 목록에는 역할 변경·비밀번호 재설정 inline action을 두지 않는다.
- A04는 이메일 중복 API 확인 없이 client validation + mock submit만 검수한다.
- A05는 현재 사용자/마지막 super_admin 보호, locked 해제, 실제 상태 변경을 검수하지 않는다.
- A21/A22는 실제 권한 guard, API 실패, 상태 변경, 제재, CSV export를 검수하지 않는다.
- A22는 아직 없는 user/treasure/reward 상세 route로 이동하지 않는다.
- A24는 실제 role/session 검사와 자동 redirect를 검수하지 않는다.
- A01은 credential/status/role 판별 없이 mock dashboard 이동만 검수한다.

위 항목을 production 준비 완료로 해석하지 않으며, 후속 real-connect acceptance criteria로 별도 이관한다.

## 4. 심각도

| 등급 | 정의 | 예시 | 처리 |
|---|---|---|---|
| P0 Blocker | 보안·민감정보·핵심 flow·빌드 차단 | 비밀번호 노출, 실제 API 호출, route crash, build 실패 | 즉시 중단, 수정 전 다음 단계 금지 |
| P1 Critical | 주요 기능 사용 불가 또는 잘못된 결과 | 필터 오동작, 잘못된 상세 연결, dialog 제출 불가 | 해당 화면 FAIL, 수정 후 전체 연관 회귀 |
| P2 Major | 기능은 가능하나 접근성·반응형·상태 문제 | focus 미복귀, 긴 텍스트 잘림, 잘못된 badge | 수정 권고, 출시 기준에 따라 차단 |
| P3 Minor | 비차단 polish·noise | favicon 404, 미세한 간격 | PASS WITH WARNINGS 가능 |

## 5. 판정 규칙

### PASS

- 모든 P0/P1 항목 통과
- 필수 Journey 통과
- blocking Console Error 없음
- 핵심 Network 4xx/5xx 없음
- 민감정보·실데이터·금지 호출 없음
- 데스크톱 기준 사용 가능
- 증거 파일과 결과 로그가 매핑됨

### PASS WITH WARNINGS

- P0/P1 없음
- P2/P3만 존재하고 사용자 승인 기록이 있음
- 예: Admin CMS의 의도된 `min-w-[980px]`로 작은 viewport에서 가로 스크롤

### FAIL

- P0 또는 미해결 P1 하나 이상
- 핵심 flow 실패
- JavaScript runtime/hydration error
- 핵심 route 또는 RSC 요청 실패
- 비밀번호·token·secret·실데이터 노출
- 실제 mock 원본이 변경되거나 외부 side effect 발생

### BLOCKED

- 개발 서버/브라우저 실행 불가
- 검수 기준 또는 테스트 데이터에 대한 사용자 결정이 없음
- 추가 dependency가 필요한 테스트에 대한 승인 없음
- 외부 CI/Preview 접근 권한 없음

## 6. 추적성 규칙

- 각 항목 ID는 결과 보고서에서도 그대로 사용한다.
- `QA-*`: 공통 품질 게이트
- `E2E-Axx-*`: 화면별 브라우저 시나리오
- `E2E-J-*`: 화면 간 Journey
- `UNIT-*`: 단위 테스트
- `AUTO-*`: 자동화 및 evidence
- `HUMAN-*`: 사용자 협업·수동 승인
- 결과는 `PASS / PASS_WITH_WARNING / FAIL / BLOCKED / NOT_RUN / DEFERRED_REAL_CONNECT` 중 하나로 기록한다.

## 7. 실행 기준선 체크 항목(계획 당시)

아래 체크박스는 QA 설계 당시의 기준선 목록이다. 실제 실행 결과와 최종 판정은 [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md)에 기록했다.

- [ ] `QA-BASE-001` 실행 시작 시 브랜치와 SHA를 기록한다.
- [ ] `QA-BASE-002` 실행 시작 시 `git status --short`를 저장한다.
- [ ] `QA-BASE-003` 기존 untracked 파일과 이번 QA 산출물을 구분한다.
- [ ] `QA-BASE-004` Base URL과 실행 명령을 기록한다.
- [ ] `QA-BASE-005` Node/npm/Playwright CLI 버전을 기록한다.
- [ ] `QA-BASE-006` 테스트 시작·종료 시각과 timezone을 기록한다.
- [ ] `QA-BASE-007` 검증 대상 viewport와 브라우저 채널을 기록한다.
- [ ] `QA-BASE-008` 사용자 승인/결정 항목을 먼저 닫는다.

## 8. 실행 전 금지 상태(승인 후 해제됨)

아래 Gate는 최초 문서 작성 시 적용했으며, 이후 사용자 승인으로 해제되어 Round 1~14 검수·Phase7 수정·PR 준비를 진행했다.

- Playwright 브라우저 세션 시작
- lint/build/test 실행
- screenshot/trace/video 생성
- 테스트 dependency 설치
- 테스트 코드 작성
- 기능 코드 수정
- PR/commit/push

실행 이력과 최종 결과는 [`05_QA_EXECUTION_PLAN.md`](./05_QA_EXECUTION_PLAN.md), [`07_EXECUTED_CHECKLIST_RESULTS.md`](./07_EXECUTED_CHECKLIST_RESULTS.md), [`08_TEAM_REVIEW_REPORT.md`](./08_TEAM_REVIEW_REPORT.md)를 따른다.
