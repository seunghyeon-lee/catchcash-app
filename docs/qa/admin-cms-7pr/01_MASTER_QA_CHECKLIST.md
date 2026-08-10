# 관리자 CMS 7PR 마스터 QA 체크리스트

> 상태: **NOT_RUN**
>
> 목적: 화면별 시나리오에 들어가기 전에 공통 품질 게이트를 고정하고, 화면 검수 후 빠뜨리기 쉬운 보안·접근성·회귀·증거 항목을 최종 차단한다.

## 1. 실행 전 기준선

### 저장소·범위

- [ ] `QA-BASE-101` 현재 브랜치가 검수 대상으로 합의된 브랜치인지 확인한다.
- [ ] `QA-BASE-102` 검수 SHA를 결과 보고서에 고정한다.
- [ ] `QA-BASE-103` `git status --short`를 실행 전 evidence에 저장한다.
- [ ] `QA-BASE-104` 기존 untracked 파일을 목록화하고 QA 실행 중 삭제·수정·stage하지 않는다.
- [ ] `QA-BASE-105` 이번 7PR 변경 파일이 아래 허용 집합을 벗어나지 않는지 확인한다.
  - `app/admin/admins/**`
  - `app/admin/security-logs/**`
  - `app/admin/access-denied/page.tsx`
  - `app/admin/login/page.tsx`
  - `components/admin/admin-shell.tsx`
  - `lib/admin/mock-admin-accounts.ts`
  - `lib/admin/mock-security-logs.ts`
- [ ] `QA-BASE-106` `package.json`, lockfile, `supabase/**`, 사용자 앱 route에 7PR 유래 diff가 없는지 확인한다.
- [ ] `QA-BASE-107` QA 문서와 runtime evidence가 비즈니스 코드 변경과 분리되어 있는지 확인한다.
- [ ] `QA-BASE-108` 테스트 Base URL, 서버 명령, 포트, 브라우저 채널을 기록한다.
- [ ] `QA-BASE-109` Preview와 로컬 중 어느 환경을 최종 판정 기준으로 사용할지 기록한다.
- [ ] `QA-BASE-110` 검수 도중 실제 external API/DB write를 수행하지 않는다는 점을 확인한다.

### 도구

- [ ] `QA-TOOL-101` Node.js 20 이상이다.
- [ ] `QA-TOOL-102` npm/npx가 실행된다.
- [ ] `QA-TOOL-103` `playwright-cli --version`이 실행된다.
- [ ] `QA-TOOL-104` `.agents/skills/playwright-cli/SKILL.md`가 존재한다.
- [ ] `QA-TOOL-105` `.cursor/skills/web-qa/SKILL.md`가 존재한다.
- [ ] `QA-TOOL-106` `qa-artifacts/`와 `.playwright-cli/`가 gitignored 상태다.
- [ ] `QA-TOOL-107` 이전 브라우저 세션과 현재 세션 이름이 충돌하지 않는다.
- [ ] `QA-TOOL-108` evidence 디렉터리가 실행 ID별로 분리된다.

## 2. 정적 품질 게이트

- [ ] `QA-STATIC-101` `git diff --check`가 통과한다.
- [ ] `QA-STATIC-102` `npm run lint`가 경고·오류 없이 통과한다.
- [ ] `QA-STATIC-103` `npm run build`가 통과한다.
- [ ] `QA-STATIC-104` 빌드 route 표에 A01/A03/A04/A05/A21/A22/A24 route가 모두 나타난다.
- [ ] `QA-STATIC-105` dynamic route `/admin/admins/[id]`와 `/admin/security-logs/[id]`가 서버 렌더 route로 생성된다.
- [ ] `QA-STATIC-106` import alias와 TypeScript type check 오류가 없다.
- [ ] `QA-STATIC-107` React list key 경고 가능성이 있는 중복 ID가 mock 데이터에 없다.
- [ ] `QA-STATIC-108` 모든 `Link` href가 현재 route 정책과 일치한다.
- [ ] `QA-STATIC-109` 존재하지 않는 `/admin/users/*`, `/admin/treasures/*` 링크를 A22가 생성하지 않는다.
- [ ] `QA-STATIC-110` A03/A04/A05 route가 `/admin/accounts` 또는 `/create`를 사용하지 않는다.
- [ ] `QA-STATIC-111` A24 route가 `/admin/forbidden` 등 다른 경로로 중복 구현되지 않았다.
- [ ] `QA-STATIC-112` console/network 검사를 오염시킬 명시적 `console.*`가 대상 파일에 없다.

## 3. Mock-only·보안 계약

### 금지 호출

- [ ] `QA-SEC-101` 대상 파일에 `fetch(`가 없다.
- [ ] `QA-SEC-102` 대상 파일에 Supabase `createClient`가 없다.
- [ ] `QA-SEC-103` 대상 파일에 `signInWithPassword`가 없다.
- [ ] `QA-SEC-104` 대상 파일에 `localStorage` 사용이 없다.
- [ ] `QA-SEC-105` 대상 파일에 `sessionStorage` 사용이 없다.
- [ ] `QA-SEC-106` 대상 파일에 cookie write가 없다.
- [ ] `QA-SEC-107` 대상 파일에 외부 URL 호출이 없다.
- [ ] `QA-SEC-108` mock submit 전후 Network에 API mutation이 없다.
- [ ] `QA-SEC-109` 페이지 reload 후 mock action 결과가 원본 데이터에 남지 않는다.

### 비밀·민감정보

- [ ] `QA-SEC-110` `service_role`, access token, refresh token, OAuth token, API key, secret이 없다.
- [ ] `QA-SEC-111` provider 식별자·실제 사용자 UUID·실제 관리자 ID가 없다.
- [ ] `QA-SEC-112` 관리자 mock 이메일은 모두 `@example.invalid`다.
- [ ] `QA-SEC-113` 전화번호, 사용자 이메일, 쿠폰 번호, 바코드 원문이 없다.
- [ ] `QA-SEC-114` A04 비밀번호는 확인 dialog에 표시되지 않는다.
- [ ] `QA-SEC-115` A04 비밀번호는 screenshot, snapshot, Console, Network, storage evidence에 평문으로 남지 않는다.
- [ ] `QA-SEC-116` A05 비밀번호 재설정은 임시 비밀번호를 생성·표시·복사하지 않는다.
- [ ] `QA-SEC-117` A05 활동 IP는 문서용 마스킹 형식(`***`)만 사용한다.
- [ ] `QA-SEC-118` A21 목록에는 IP/UA/좌표/payload가 없다.
- [ ] `QA-SEC-119` A22 좌표는 synthetic·반올림 안내와 함께 표시된다.
- [ ] `QA-SEC-120` A22 IP는 마스킹되고 UA/OS/버전은 일반화된다.
- [ ] `QA-SEC-121` query injection 문자열이 raw HTML/스크립트로 렌더되지 않는다.
- [ ] `QA-SEC-122` A24 unknown reason이 raw query를 출력하지 않고 기본 reason으로 정규화된다.
- [ ] `QA-SEC-122A` A24의 정규화된 `reason: <code>` 화면 노출을 개발용 정보로 허용할지 사용자에게 확인한다.
- [ ] `QA-SEC-122B` reason code 비노출 정책이면 화면의 `reason:` 문자열을 P2 결함으로 등록한다.

### 의도된 미구현

- [ ] `QA-SEC-123` 실제 Auth 부재를 `DEFERRED_REAL_CONNECT`로 기록한다.
- [ ] `QA-SEC-124` 실제 route guard·middleware 부재를 `DEFERRED_REAL_CONNECT`로 기록한다.
- [ ] `QA-SEC-125` 실제 RLS/API 권한 검증 부재를 `DEFERRED_REAL_CONNECT`로 기록한다.
- [ ] `QA-SEC-126` 위 항목을 현재 shell의 PASS로 오인하거나 production-ready로 표현하지 않는다.

## 4. 데이터 무결성

### 관리자 계정 mock

- [ ] `QA-DATA-101` 관리자 ID 24개가 모두 고유하다.
- [ ] `QA-DATA-102` 관리자 이메일 24개가 모두 고유하다.
- [ ] `QA-DATA-103` role은 `super_admin/operator/viewer`만 사용한다.
- [ ] `QA-DATA-104` status는 `active/inactive/locked`만 사용한다.
- [ ] `QA-DATA-105` `createdAt`, `lastLoginAt`, 활동 시각이 parse 가능한 ISO 문자열이다.
- [ ] `QA-DATA-106` `lastLoginAt: null`은 화면에서 `-`로 표시된다.
- [ ] `QA-DATA-107` 활동 record가 존재하지 않는 계정에서 빈 활동 상태가 표시된다.
- [ ] `QA-DATA-108` 활동 record는 해당 `adminId`에만 연결된다.
- [ ] `QA-DATA-109` 활동 record가 최신순으로 정렬된다.
- [ ] `QA-DATA-110` 역할별 허용/제한 메뉴가 상호 모순되지 않는다.

### 보안 로그 mock

- [ ] `QA-DATA-111` 보안 로그 42개의 ID가 모두 고유하다.
- [ ] `QA-DATA-112` event type은 정의된 7개 enum만 사용한다.
- [ ] `QA-DATA-113` severity는 `low/medium/high/critical`만 사용한다.
- [ ] `QA-DATA-114` status는 `open/reviewing/resolved/false_positive`만 사용한다.
- [ ] `QA-DATA-115` severity rank가 low 1 → critical 4 순서다.
- [ ] `QA-DATA-116` 요청/기기/수신 시각이 parse 가능한 ISO 문자열이다.
- [ ] `QA-DATA-117` admin security event에는 user/device 정보가 의도대로 null 처리된다.
- [ ] `QA-DATA-118` 위치 관련 event만 treasure/좌표/거리 값을 가진다.
- [ ] `QA-DATA-119` reward suspicious event만 reward ID/status를 가진다.
- [ ] `QA-DATA-120` 연관 로그 helper가 현재 로그를 제외한다.
- [ ] `QA-DATA-121` 연관 로그 helper가 최대 5개와 최신순을 보장한다.
- [ ] `QA-DATA-122` 상세 synthetic 값이 요청마다 결정적이며 reload해도 동일하다.
- [ ] `QA-DATA-123` 위치 없는 로그의 좌표·거리·정확도는 `-`로 표시된다.

## 5. 공통 UI·Navigation

- [ ] `QA-UI-101` AdminShell 로고가 `/admin/dashboard`로 이동한다.
- [ ] `QA-UI-102` 전역 검색 준비 입력은 disabled다.
- [ ] `QA-UI-103` 현재 role badge와 관리자 avatar label이 표시된다.
- [ ] `QA-UI-104` 준비 중 메뉴는 링크가 아니라 비활성 텍스트다.
- [ ] `QA-UI-105` 관리자 계정 메뉴가 `/admin/admins`로 이동한다.
- [ ] `QA-UI-106` 보안 로그 메뉴가 `/admin/security-logs`로 이동한다.
- [ ] `QA-UI-107` 각 root route에서 정확한 메뉴 하나만 `aria-current="page"`다.
- [ ] `QA-UI-108` `/admin/admins/new`에서 관리자 계정 메뉴가 active다.
- [ ] `QA-UI-109` `/admin/admins/[id]`에서 관리자 계정 메뉴가 active다.
- [ ] `QA-UI-110` `/admin/security-logs/[id]`에서 보안 로그 메뉴가 active다.
- [ ] `QA-UI-111` 기존 products/mappings/reward/inquiries 하위 route의 active 처리가 유지된다.
- [ ] `QA-UI-112` `/admin/login`은 AdminShell 없이 독립 full-screen이다.
- [ ] `QA-UI-113` Back/Forward/Reload 후 URL과 active 메뉴가 동기화된다.
- [ ] `QA-UI-114` 모든 상세·목록 Link가 keyboard로 focus·Enter 이동 가능하다.
- [ ] `QA-UI-115` 브라우저 새로고침 후 route가 404 또는 hydration error 없이 복원된다.

## 6. 접근성·키보드

### 공통

- [ ] `QA-A11Y-101` 각 화면에 의미 있는 `h1`이 정확히 하나 있다.
- [ ] `QA-A11Y-102` heading level이 논리적으로 증가한다.
- [ ] `QA-A11Y-103` icon/색상만으로 역할·상태·위험도를 전달하지 않는다.
- [ ] `QA-A11Y-104` 모든 form control에 accessible name이 있다.
- [ ] `QA-A11Y-105` 모든 button이 의미 있는 accessible name을 가진다.
- [ ] `QA-A11Y-106` disabled control이 keyboard focus/실행되지 않는다.
- [ ] `QA-A11Y-107` focus indicator가 화면에서 식별 가능하다.
- [ ] `QA-A11Y-108` Tab 순서가 시각적·논리적 순서와 일치한다.
- [ ] `QA-A11Y-109` Enter/Space로 button과 radio를 조작할 수 있다.
- [ ] `QA-A11Y-110` status/error 메시지가 적절한 live semantics를 가진다.
- [ ] `QA-A11Y-111` table header가 데이터 column과 일치한다.
- [ ] `QA-A11Y-112` 페이지네이션의 현재 페이지가 `aria-current="page"`다.

### Dialog

- [ ] `QA-A11Y-113` dialog에 `role="dialog"`와 `aria-modal="true"`가 있다.
- [ ] `QA-A11Y-114` dialog title이 `aria-labelledby`와 연결된다.
- [ ] `QA-A11Y-115` dialog open 시 focus가 dialog 내부로 이동한다.
- [ ] `QA-A11Y-116` dialog open 중 background interactive element로 Tab이 빠져나가지 않는다.
- [ ] `QA-A11Y-117` Escape로 dialog를 닫을 수 있거나 미지원 근거가 기록된다.
- [ ] `QA-A11Y-118` dialog close 후 trigger로 focus가 복귀한다.
- [ ] `QA-A11Y-119` submitting 중 dialog close/중복 submit이 차단된다.
- [ ] `QA-A11Y-120` validation error 발생 시 error가 screen reader에 전달된다.

## 7. 반응형·시각 QA

### 필수 viewport

- [ ] `QA-VIS-101` 1440×900 desktop screenshot을 모든 대상 화면에 남긴다.
- [ ] `QA-VIS-102` 1280×720 desktop screenshot을 모든 대상 화면에 남긴다.
- [ ] `QA-VIS-103` 1024×768 small desktop에서 핵심 action 접근성을 확인한다.
- [ ] `QA-VIS-104` 768×1024 tablet에서 의도된 horizontal scroll과 콘텐츠 도달 가능성을 확인한다.
- [ ] `QA-VIS-105` 375×812 mobile에서 CMS의 `min-w-[980px]` 제약을 기록하고 핵심 UI가 영구적으로 가려지지 않는지 확인한다.

### 화면 상태

- [ ] `QA-VIS-106` default 상태 screenshot이 있다.
- [ ] `QA-VIS-107` empty/unknown 상태 screenshot이 있다.
- [ ] `QA-VIS-108` 주요 dialog open 상태 screenshot이 있다.
- [ ] `QA-VIS-109` validation error 상태 screenshot이 있다.
- [ ] `QA-VIS-110` submitting/disabled 상태 screenshot 또는 video가 있다.
- [ ] `QA-VIS-111` 긴 이름·이메일·reason·summary에서 겹침/잘림이 없다.
- [ ] `QA-VIS-112` table이 header와 row 정렬을 유지한다.
- [ ] `QA-VIS-113` badge 텍스트가 잘리지 않는다.
- [ ] `QA-VIS-114` sticky header가 content를 덮지 않는다.
- [ ] `QA-VIS-115` modal이 viewport를 벗어나도 내용·button에 접근 가능하다.
- [ ] `QA-VIS-116` hover/focus/disabled/current 상태가 시각적으로 구분된다.
- [ ] `QA-VIS-117` 색상 대비 문제 후보를 기록한다.
- [ ] `QA-VIS-118` screenshot을 실제로 육안 판독하고 DOM 존재만으로 PASS하지 않는다.

## 8. Console·Network

- [ ] `QA-RUNTIME-101` 각 P0 Journey 시작 전에 Console 기준선을 비운다.
- [ ] `QA-RUNTIME-102` 각 route 진입 후 Console error/warning을 수집한다.
- [ ] `QA-RUNTIME-103` uncaught exception이 없다.
- [ ] `QA-RUNTIME-104` React hydration warning이 없다.
- [ ] `QA-RUNTIME-105` TypeError/ReferenceError가 없다.
- [ ] `QA-RUNTIME-106` 반복되는 심각한 warning이 없다.
- [ ] `QA-RUNTIME-107` favicon 404 등 알려진 noise는 핵심 오류와 분리한다.
- [ ] `QA-RUNTIME-108` 각 route 문서/RSC 요청이 2xx다.
- [ ] `QA-RUNTIME-109` 핵심 JS/CSS/static asset 요청이 2xx다.
- [ ] `QA-RUNTIME-110` 4xx/5xx 목록을 전부 저장하고 소유자를 분류한다.
- [ ] `QA-RUNTIME-111` CORS/timeout/aborted 핵심 요청이 없다.
- [ ] `QA-RUNTIME-112` 동일 action에 예상하지 못한 duplicate request가 없다.
- [ ] `QA-RUNTIME-113` 무한 반복 request가 없다.
- [ ] `QA-RUNTIME-114` mock form/action이 mutation request를 발생시키지 않는다.
- [ ] `QA-RUNTIME-115` password/token/secret이 request URL/header/body에 없다.

## 9. 회귀 Smoke

- [ ] `QA-REG-101` `/admin/dashboard` HTTP 200 및 주요 지표가 표시된다.
- [ ] `QA-REG-102` `/admin/products` HTTP 200, 목록과 active menu가 정상이다.
- [ ] `QA-REG-103` `/admin/products/new` HTTP 200, AdminShell이 정상이다.
- [ ] `QA-REG-104` 유효한 `/admin/products/[id]`가 열린다.
- [ ] `QA-REG-105` `/admin/mappings` HTTP 200, active menu가 정상이다.
- [ ] `QA-REG-106` `/admin/mappings/new` HTTP 200이다.
- [ ] `QA-REG-107` `/admin/reward-requests` HTTP 200, active menu가 정상이다.
- [ ] `QA-REG-108` `/admin/reward-requests/history` HTTP 200이다.
- [ ] `QA-REG-109` 유효한 `/admin/rewards/[id]`가 열린다.
- [ ] `QA-REG-110` `/admin/inquiries` HTTP 200, active menu가 정상이다.
- [ ] `QA-REG-111` 유효한 `/admin/inquiries/[id]`가 열린다.
- [ ] `QA-REG-112` 기존 sidebar 항목 순서와 준비 중 상태가 의도대로 유지된다.
- [ ] `QA-REG-113` AdminShell 추가 메뉴 때문에 900px 높이에서 하단 메뉴 접근이 막히지 않는다.
- [ ] `QA-REG-114` 기존 화면의 Console/Network에 신규 오류가 없다.
- [ ] `QA-REG-115` 사용자 앱 root·login·home의 직접 회귀가 이번 변경으로 깨지지 않았음을 최소 HTTP smoke로 확인한다.
- [ ] `QA-REG-116` inquiries의 비인증 mock fallback 경로와 조건부 Supabase 경로를 다른 Network 기대값으로 분리한다.
- [ ] `QA-REG-117` 인증 정보가 없는 환경에서 inquiries가 mock fallback과 안내를 유지한다.
- [ ] `QA-REG-118` 레거시 `/admin/treasures/[id]`, `/admin/users/[id]`, `/admin/products/[id]/edit` 링크의 현재 404를 신규 회귀와 구분한다.
- [ ] `QA-REG-119` 위 레거시 404를 known warning으로 수용할지 또는 별도 결함으로 추적할지 사용자 결정을 기록한다.

## 10. Evidence 완결성

- [ ] `QA-EVID-101` run ID와 SHA가 report에 기록된다.
- [ ] `QA-EVID-102` screenshot 파일명이 화면·상태·viewport를 나타낸다.
- [ ] `QA-EVID-103` P0/P1 Journey별 trace가 있다.
- [ ] `QA-EVID-104` 실패 재현에는 video 또는 연속 screenshot이 있다.
- [ ] `QA-EVID-105` Console raw output이 저장된다.
- [ ] `QA-EVID-106` Network raw output이 저장된다.
- [ ] `QA-EVID-107` static gate 출력(lint/build/diff)이 저장된다.
- [ ] `QA-EVID-108` FAIL 항목에 재현 단계·실제 결과·기대 결과·심각도·코드 위치가 있다.
- [ ] `QA-EVID-109` 수정 후 동일 ID의 before/after evidence가 있다.
- [ ] `QA-EVID-110` evidence가 gitignored이고 secret을 포함하지 않는다.

## 11. 최종 Release Gate

- [ ] `QA-GATE-101` 모든 P0가 PASS다.
- [ ] `QA-GATE-102` 모든 P1가 PASS다.
- [ ] `QA-GATE-103` P2/P3 warning의 사용자 수용 여부가 기록된다.
- [ ] `QA-GATE-104` 모든 필수 screen/Journey가 실행되었다.
- [ ] `QA-GATE-105` 자동화 불가 항목을 사용자가 수동 확인했다.
- [ ] `QA-GATE-106` lint/build를 수정 후 최종 한 번 더 통과했다.
- [ ] `QA-GATE-107` 최종 Console/Network 회귀가 통과했다.
- [ ] `QA-GATE-108` mock-only 계약과 deferred real-connect 항목이 구분되어 있다.
- [ ] `QA-GATE-109` 실제 테스트 실행 중 생성된 기능 코드 변경을 diff로 재검토했다.
- [ ] `QA-GATE-110` 최종 verdict가 `PASS / PASS WITH WARNINGS / FAIL / BLOCKED` 중 하나로 명시되었다.
