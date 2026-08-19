# 관리자 CMS 7PR 자동화·Evidence·사용자 협업 체크리스트

> 상태: **PLANNED / NOT_RUN**
>
> 목표: 자동화 가능한 항목은 반복 가능하게 실행하고, 사람의 판단이 필요한 항목은 사용자 확인으로 분리한다. 자동화 로그가 있다고 시각·정책 검수를 완료한 것으로 간주하지 않는다.

## 1. 도구 역할

### Cursor Native / Glass

- URL 빠른 열람용
- 구현 파일과 screenshot을 함께 보는 보조 수단
- 현재 환경에서는 Agent click/Console/Network automation 도구로 사용하지 않음

### Playwright CLI

- headed Chrome 실제 브라우저
- navigation / click / fill / keyboard
- snapshot / screenshot
- viewport resize / mobile device profile
- Console / Network
- trace / video
- named session

### 정적 command

- git 범위·diff
- forbidden pattern 검색
- lint / build
- route build 결과
- mock data invariant 검사(추후 script 또는 unit test)

### 정식 Test Runner(별도 승인)

- 반복 가능한 unit/component test
- CI-friendly Playwright Test E2E spec
- coverage
- clock/timezone 고정
- cross-browser project matrix

## 2. 자동화 매트릭스

| 검증 영역 | 지금 자동화 가능 | 추가 승인 필요 | 사람 판단 필요 |
|---|---:|---:|---:|
| git 범위·금지 파일 | O | X | 결과 해석 |
| lint/build | O | X | X |
| route HTTP/RSC 2xx | O | X | X |
| Playwright CLI Journey | O | X | 실패 원인 해석 |
| click/fill/dialog/URL | O | X | X |
| Console/Network 수집 | O | X | noise 분류 |
| screenshot 생성 | O | X | 시각 판정 |
| responsive resize | O | X | 지원 정책 판정 |
| trace/video | O | X | 필요 구간 결정 |
| mock-only side effect 부재 | O | X | X |
| unit/component 자동화 | X | dependency 승인 | coverage 기준 |
| CI E2E spec | X | dependency/CI 승인 | merge gate 정책 |
| 실제 Auth/role/RLS | X | real-connect 환경 | 테스트 계정·권한 |
| 디자인 pixel-level 승인 | 부분 | 기준 이미지 | 최종 승인 |
| WCAG 정밀 audit | 부분 | axe 등 승인 | 키보드/스크린리더 |

## 3. 즉시 자동화 가능한 정적 검사

- [ ] `AUTO-STATIC-001` SHA/branch/status 수집
- [ ] `AUTO-STATIC-002` 허용 변경 파일 목록 검사
- [ ] `AUTO-STATIC-003` package/lock/supabase/user-app diff 0 검사
- [ ] `AUTO-STATIC-004` `git diff --check`
- [ ] `AUTO-STATIC-005` `npm run lint`
- [ ] `AUTO-STATIC-006` `npm run build`
- [ ] `AUTO-STATIC-007` build route 표 저장
- [ ] `AUTO-STATIC-008` `fetch(`/Supabase/Auth/storage/console 금지 패턴 검사
- [ ] `AUTO-STATIC-009` token/secret/provider/phone/coupon/barcode 패턴 검사
- [ ] `AUTO-STATIC-010` 관리자 이메일 domain 검사
- [ ] `AUTO-STATIC-011` href route 정책 검사
- [ ] `AUTO-STATIC-012` mock ID/email uniqueness 검사
- [ ] `AUTO-STATIC-013` ISO datetime parse 검사
- [ ] `AUTO-STATIC-014` IP mask/synthetic coordinate 계약 검사

정적 invariant 중 source를 직접 import해야 하는 항목은 테스트 runner 승인 전 임시 script를 만들지 않는다. 필요하면 읽기 전용 one-off Node command 또는 수동 코드 검토로 분류한다.

## 4. Playwright CLI 실행 템플릿

실제 실행 시 `<run-id>`와 `<base-url>`을 확정한 뒤 사용한다.

```powershell
playwright-cli -s=webqa-admin-cms open <base-url>/admin/login --headed
playwright-cli -s=webqa-admin-cms tracing-start
playwright-cli -s=webqa-admin-cms snapshot
```

### Action

```powershell
playwright-cli -s=webqa-admin-cms fill <ref> "safe@example.invalid"
playwright-cli -s=webqa-admin-cms click <ref>
playwright-cli -s=webqa-admin-cms press Enter
playwright-cli -s=webqa-admin-cms go-back
playwright-cli -s=webqa-admin-cms go-forward
playwright-cli -s=webqa-admin-cms reload
```

### Runtime

```powershell
playwright-cli -s=webqa-admin-cms console
playwright-cli -s=webqa-admin-cms requests
playwright-cli -s=webqa-admin-cms request <index>
```

### Viewport/evidence

```powershell
playwright-cli -s=webqa-admin-cms resize 1440 900
playwright-cli -s=webqa-admin-cms screenshot --filename=qa-artifacts/<run-id>/screenshots/<screen>-desktop-1440x900.png
playwright-cli -s=webqa-admin-cms resize 1280 720
playwright-cli -s=webqa-admin-cms resize 1024 768
playwright-cli -s=webqa-admin-cms resize 768 1024
playwright-cli -s=webqa-admin-cms resize 375 812
```

### 종료

```powershell
playwright-cli -s=webqa-admin-cms tracing-stop
playwright-cli -s=webqa-admin-cms close
playwright-cli list
```

## 5. Evidence 디렉터리·명명

```text
qa-artifacts/
  <yyyy-mm-dd>-admin-cms-7pr-<short-sha>/
    manifest.md
    screenshots/
      A01-default-desktop-1440x900.png
      A01-validation-email-mobile-375x812.png
      A03-filter-empty-desktop-1440x900.png
      A04-confirm-password-redaction-desktop-1440x900.png
      A05-role-dialog-error-desktop-1440x900.png
      A21-risk-sort-desktop-1440x900.png
      A22-location-masked-desktop-1440x900.png
      A24-invalid-reason-desktop-1440x900.png
    traces/
      J1-login-account-list.zip-or-trace
      J2-admin-create-mock.zip-or-trace
      J3-admin-actions.zip-or-trace
      J4-security-investigation.zip-or-trace
    videos/
      FAIL-<issue-id>-<scenario>.webm
    reports/
      static-gates.txt
      console.txt
      network.txt
      e2e-results.md
      issues.md
```

### Evidence 체크

- [ ] `AUTO-EVID-001` run root에 SHA/Base URL/timezone/browser가 있다.
- [ ] `AUTO-EVID-002` screenshot 이름이 screen/state/viewport를 포함한다.
- [ ] `AUTO-EVID-003` 모든 P0 화면에 default screenshot이 있다.
- [ ] `AUTO-EVID-004` validation/dialog/empty/unknown 상태 증거가 있다.
- [ ] `AUTO-EVID-005` P0 Journey trace가 있다.
- [ ] `AUTO-EVID-006` 재현이 어려운 FAIL은 video가 있다.
- [ ] `AUTO-EVID-007` Console raw output과 분류가 함께 있다.
- [ ] `AUTO-EVID-008` Network raw output과 4xx/5xx 분류가 함께 있다.
- [ ] `AUTO-EVID-009` static gate command와 exit code가 있다.
- [ ] `AUTO-EVID-010` password/secret/token이 artifact에 없다.
- [ ] `AUTO-EVID-011` artifact가 gitignore되는지 `git check-ignore`로 확인한다.
- [ ] `AUTO-EVID-012` artifact를 commit/stage하지 않는다.

## 6. 자동화 우선순위

### Tier 0 — 매 변경 필수

- lint/build
- 금지 패턴·민감정보
- A01 로그인 Journey
- A03 목록 검색/필터/페이지
- A04 validation/dialog/password redaction/mock submit
- A05 4개 action dialog/mock 불변
- A21 search/filter/sort/page/query
- A22 location/non-location/unknown
- A24 5개 reason + invalid fallback
- AdminShell active 회귀
- Console/Network

### Tier 1 — PR/릴리스 필수

- 7화면 desktop visual
- small desktop/tablet/mobile behavior
- keyboard navigation
- dirty confirm
- duplicate click
- Back/Forward/Reload
- unknown ID/empty state
- 기존 admin route smoke

### Tier 2 — 프레임워크 승인 후

- unit/component suite
- stable E2E spec
- coverage
- fake clock/timezone
- CI artifact upload
- cross-browser Chromium/Firefox/WebKit
- automated accessibility scanner

## 7. 정식 E2E 자동화 도입 체크리스트(별도 작업)

- [ ] `AUTO-E2E-001` `@playwright/test` dev dependency 추가를 승인받는다.
- [ ] `AUTO-E2E-002` `playwright.config.ts` 추가를 승인받는다.
- [ ] `AUTO-E2E-003` webServer command/port reuse 정책을 정한다.
- [ ] `AUTO-E2E-004` test output을 `qa-artifacts` 또는 `test-results` 정책과 정렬한다.
- [ ] `AUTO-E2E-005` desktop/small-desktop/tablet/mobile project를 정의한다.
- [ ] `AUTO-E2E-006` time-sensitive A21에 clock 고정 helper를 둔다.
- [ ] `AUTO-E2E-007` deterministic fixture ID를 centralize한다.
- [ ] `AUTO-E2E-008` screenshot expectation을 OS/font에 안전하게 설계한다.
- [ ] `AUTO-E2E-009` Console/Network failure collector fixture를 둔다.
- [ ] `AUTO-E2E-010` trace는 first retry/retain-on-failure 정책을 사용한다.
- [ ] `AUTO-E2E-011` video는 retain-on-failure 정책을 사용한다.
- [ ] `AUTO-E2E-012` CI에서 production build 또는 preview base URL을 사용한다.
- [ ] `AUTO-E2E-013` flaky retry를 PASS 은폐로 사용하지 않는다.
- [ ] `AUTO-E2E-014` P0 spec 실패 시 merge를 차단한다.

## 8. 사용자와 같이 해야 하는 부분

### 실행 전 필수 결정

- [ ] `HUMAN-DEC-001` 최종 검수 환경을 선택한다: local production build / Vercel Preview / 둘 다.
- [ ] `HUMAN-DEC-002` 검수 대상 SHA를 승인한다.
- [ ] `HUMAN-DEC-003` Admin CMS 공식 지원 최소 viewport를 결정한다.
  - 권장: 기능 지원 1280px 이상
  - 980~1279px: 제한 지원
  - 979px 이하: 의도된 horizontal scroll 경고
- [ ] `HUMAN-DEC-004` 작은 viewport의 가로 스크롤을 warning으로 수용할지 결정한다.
- [ ] `HUMAN-DEC-005` favicon 404를 known warning으로 수용할지 결정한다.
- [ ] `HUMAN-DEC-006` unit/component dependency 추가를 허용할지 결정한다.
- [ ] `HUMAN-DEC-007` 정식 Playwright Test E2E 추가를 허용할지 결정한다.
- [ ] `HUMAN-DEC-008` test coverage threshold를 승인한다.
- [ ] `HUMAN-DEC-009` 발견 결함의 자동 최소 수정 권한 범위를 정한다.
- [ ] `HUMAN-DEC-010` P2/P3가 남은 경우 release 승인권자를 정한다.
- [ ] `HUMAN-DEC-011` A24의 정규화된 `reason:` 코드 화면 노출을 유지할지 결정한다.
- [ ] `HUMAN-DEC-012` 레거시 user/treasure/product-edit 404 링크를 known warning으로 둘지 별도 수정할지 결정한다.
- [ ] `HUMAN-DEC-013` inquiries의 조건부 Supabase 경로를 실제 인증 환경에서도 검수할지 결정한다.

### 사용자가 제공해야 할 수 있는 정보

- [ ] `HUMAN-IN-001` Preview URL과 접근 권한
- [ ] `HUMAN-IN-002` private Preview 인증 방법(필요 시)
- [ ] `HUMAN-IN-003` 공식 디자인 기준 이미지/Figma node(시각 비교가 필요할 때)
- [ ] `HUMAN-IN-004` 현재 shell에서 의도된 copy/label 최종 승인
- [ ] `HUMAN-IN-005` 실제 Auth 연결 이후 사용할 안전한 QA 계정(이번 mock 검수에는 불필요)
- [ ] `HUMAN-IN-006` 실제 권한 role별 기대 matrix(후속 real-connect)
- [ ] `HUMAN-IN-007` 배포/브라우저 지원 정책

### 사용자의 육안·정책 검수

- [ ] `HUMAN-REVIEW-001` 7개 default desktop screenshot을 확인한다.
- [ ] `HUMAN-REVIEW-002` A04 password redaction screenshot을 확인한다.
- [ ] `HUMAN-REVIEW-003` A05 4개 dialog의 copy를 승인한다.
- [ ] `HUMAN-REVIEW-004` A21 severity/status 색상·텍스트를 승인한다.
- [ ] `HUMAN-REVIEW-005` A22 synthetic coordinate·마스킹 copy를 승인한다.
- [ ] `HUMAN-REVIEW-006` A24 5개 reason copy를 승인한다.
- [ ] `HUMAN-REVIEW-007` small viewport behavior를 승인한다.
- [ ] `HUMAN-REVIEW-008` PASS WITH WARNINGS 항목을 명시적으로 수용/거절한다.

### 자동화 중 사용자 개입이 필요한 경우

- [ ] `HUMAN-ACT-001` 시스템 브라우저 창이 보이는지 확인(headed 증명)
- [ ] `HUMAN-ACT-002` OS font/rendering 차이로 애매한 visual defect 판정
- [ ] `HUMAN-ACT-003` 브라우저 confirm/dialog를 자동화가 안정적으로 제어하지 못할 때 수동 확인
- [ ] `HUMAN-ACT-004` Preview SSO/CAPTCHA/보안 prompt 해제
- [ ] `HUMAN-ACT-005` 사용자 승인 없이는 실제 데이터/계정 action을 수행하지 않음

## 9. 사용자 불필요 영역(자동화 우선)

- [ ] `AUTO-OWN-001` 페이지 HTTP 상태·route 이동
- [ ] `AUTO-OWN-002` input/button interaction
- [ ] `AUTO-OWN-003` validation text·state
- [ ] `AUTO-OWN-004` search/filter/sort/pagination 결과
- [ ] `AUTO-OWN-005` dialog open/cancel/submit
- [ ] `AUTO-OWN-006` duplicate click
- [ ] `AUTO-OWN-007` mock 불변·Network mutation 부재
- [ ] `AUTO-OWN-008` Console/Network 수집
- [ ] `AUTO-OWN-009` screenshot/trace/video 생성
- [ ] `AUTO-OWN-010` static security scan
- [ ] `AUTO-OWN-011` regression route smoke
- [ ] `AUTO-OWN-012` QA report 초안 작성
- [ ] `AUTO-OWN-013` 레거시 404 baseline과 신규 404 회귀를 자동 비교
- [ ] `AUTO-OWN-014` inquiries mock fallback 경로의 Network 기대값 분리

## 10. 실패 자동 수정 루프

실제 QA 실행을 승인받은 이후에만 적용한다.

- [ ] `AUTO-FIX-001` FAIL ID와 severity를 고정한다.
- [ ] `AUTO-FIX-002` 최소 재현 scenario만 반복한다.
- [ ] `AUTO-FIX-003` Console/Network/trace로 원인을 좁힌다.
- [ ] `AUTO-FIX-004` 사용자 승인 범위 내 최소 파일만 수정한다.
- [ ] `AUTO-FIX-005` 무관한 리팩터링을 하지 않는다.
- [ ] `AUTO-FIX-006` 동일 scenario를 before/after로 재검증한다.
- [ ] `AUTO-FIX-007` 해당 화면 전체 smoke를 수행한다.
- [ ] `AUTO-FIX-008` AdminShell 또는 helper 변경이면 모든 연관 화면을 회귀한다.
- [ ] `AUTO-FIX-009` lint/build를 재실행한다.
- [ ] `AUTO-FIX-010` 남은 FAIL을 숨기지 않고 최종 verdict에 반영한다.

## 11. 자동 중단 조건

아래가 발생하면 자동 진행을 중단하고 사용자에게 보고한다.

- 비밀번호/token/secret/실데이터 노출
- 예상하지 못한 외부 API/DB mutation
- production 또는 공유 QA 데이터 변경 가능성
- Auth/SSO/CAPTCHA 등 사용자 입력 필요
- package/lockfile 변경 필요
- 7PR 범위를 벗어난 구조 변경 필요
- 같은 FAIL이 최소 수정 2회 후에도 재현
- Preview/CI 권한 또는 quota 문제
- 기대 동작이 문서와 구현 사이에서 충돌하고 우선순위를 판단할 수 없음

## 12. Chrome DevTools MCP 판단

- [ ] `AUTO-MCP-001` 현재 1차 검수는 Playwright CLI Console/Network/Trace로 수행한다.
- [ ] `AUTO-MCP-002` Chrome DevTools MCP를 설치·설정하지 않는다.
- [ ] `AUTO-MCP-003` Performance profile, computed style, deep DevTools protocol이 실제 blocker일 때만 별도 제안한다.
- [ ] `AUTO-MCP-004` MCP 추가가 필요해도 사용자 승인 전에 설치하지 않는다.
