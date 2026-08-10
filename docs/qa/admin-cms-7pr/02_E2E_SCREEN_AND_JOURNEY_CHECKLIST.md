# 관리자 CMS 7PR E2E·화면별 검증 체크리스트

> 상태: **NOT_RUN**
>
> 기본 도구: 전역 `playwright-cli`, 세션 `-s=webqa-admin-cms`
>
> 원칙: 요소 존재만으로 PASS하지 않는다. 입력 → action → URL/화면 상태 → Console/Network → screenshot까지 확인한다.

## 0. E2E 공통 준비

- [ ] `E2E-PREP-001` 검수 SHA와 Base URL을 기록한다.
- [ ] `E2E-PREP-002` headed Chrome 세션을 고유 이름으로 연다.
- [ ] `E2E-PREP-003` 첫 action 전에 snapshot을 새로 생성하고 stale ref를 사용하지 않는다.
- [ ] `E2E-PREP-004` P0 Journey 시작 전 tracing을 시작한다.
- [ ] `E2E-PREP-005` screenshot 경로를 `qa-artifacts/<run-id>/screenshots/`로 고정한다.
- [ ] `E2E-PREP-006` test 값은 `@example.invalid`와 가상 문자열만 사용한다.
- [ ] `E2E-PREP-007` 실제 이메일·비밀번호·token·사용자 데이터는 입력하지 않는다.
- [ ] `E2E-PREP-008` 각 화면 default/empty/error/dialog 상태를 별도 evidence로 남긴다.
- [ ] `E2E-PREP-009` 각 화면 종료 시 Console과 Network를 수집한다.
- [ ] `E2E-PREP-010` 각 action의 기대 URL과 실제 URL을 비교한다.

## 1. 고정 테스트 데이터

### 관리자 계정

| 목적 | ID | 기대 |
|---|---|---|
| super_admin + active + 활동 있음 | `admin-kim-ops` | 역할 변경 기본 선택 `operator`, 비활성화 action |
| operator + active + 활동 있음 | `admin-lee-ops` | 역할 변경 기본 선택 `operator`, 비활성화 action |
| viewer + active + 활동 있음 | `admin-park-view` | viewer 허용/제한 메뉴 |
| operator + inactive | `admin-choi-ops` | 활성화 action |
| viewer + locked | `admin-jung-view` | locked 해제 disabled |
| 최근 로그인 null | `admin-yoon-view` | 최근 로그인 `-` |
| 활동 없음 | `admin-han-ops` 등 | 빈 활동 상태 |
| unknown | `not-a-real-admin` | 찾을 수 없음 |

### 보안 로그

| 목적 | ID | 기대 |
|---|---|---|
| 위치+유저+보물 | `SEC-1001` | 좌표/거리/정확도, 관련 user/treasure |
| 일반 event + resolved | `SEC-1002` | 위치 없음, 조치 완료 결과 문구 |
| false positive | `SEC-1003` | 오탐 결과 문구 |
| reward suspicious | `SEC-1005` | reward ID/status 존재 |
| admin security event | `SEC-1006` | user/treasure/device null, 위치 `-` |
| unknown | `SEC-9999` | 찾을 수 없음 |

## 2. A01 관리자 로그인 (`/admin/login`)

### 초기 렌더링

- [ ] `E2E-A01-001` [P0] route가 HTTP 200으로 열린다.
- [ ] `E2E-A01-002` [P1] AdminShell 없이 독립 full-screen 카드다.
- [ ] `E2E-A01-003` [P1] `캐치캐쉬`, `관리자 CMS`, `신뢰 가능한 운영 콘솔`, `로그인`이 보인다.
- [ ] `E2E-A01-004` [P1] 이메일 label이 실제 email input과 연결된다.
- [ ] `E2E-A01-005` [P1] 비밀번호 label이 실제 password input과 연결된다.
- [ ] `E2E-A01-006` [P1] input name/type/autocomplete/required 속성이 기대와 일치한다.
- [ ] `E2E-A01-007` [P1] 초기 error alert가 없다.
- [ ] `E2E-A01-008` [P2] Tab 순서가 이메일 → 비밀번호 → 로그인이다.

### Validation

- [ ] `E2E-A01-010` [P0] 이메일·비밀번호가 모두 비어 있을 때 submit하면 `이메일을 입력하세요.` 하나만 표시된다.
- [ ] `E2E-A01-011` [P1] 공백 이메일은 빈 값 오류로 처리된다.
- [ ] `E2E-A01-012` [P0] `admin` 입력 시 `올바른 이메일 형식이 아닙니다.`가 표시된다.
- [ ] `E2E-A01-013` [P1] `admin@` 입력 시 이메일 형식 오류다.
- [ ] `E2E-A01-014` [P1] `@example.invalid` 입력 시 이메일 형식 오류다.
- [ ] `E2E-A01-015` [P1] 유효 이메일 + 빈 비밀번호에서 `비밀번호를 입력하세요.`가 표시된다.
- [ ] `E2E-A01-016` [P1] 오류 메시지에 `role="alert"`가 있다.
- [ ] `E2E-A01-017` [P1] 입력을 변경하면 기존 오류가 지워진다.
- [ ] `E2E-A01-018` [P2] 오류는 우선순위에 따라 한 번에 하나만 표시된다.

### 성공·중복 방지

- [ ] `E2E-A01-020` [P0] 유효 이메일 + 비밀번호에서 `/admin/dashboard`로 이동한다.
- [ ] `E2E-A01-021` [P0] 실제 credential 판별 없이 mock flow임을 확인한다.
- [ ] `E2E-A01-022` [P0] submit 순간 이메일/비밀번호/button이 disabled다.
- [ ] `E2E-A01-023` [P0] button 문구가 `로그인 중...`으로 바뀐다.
- [ ] `E2E-A01-024` [P0] 빠른 더블클릭·Enter 연타가 navigation을 중복 발생시키지 않는다.
- [ ] `E2E-A01-025` [P1] 비밀번호 input에서 Enter를 누르면 form submit된다.
- [ ] `E2E-A01-026` [P0] 로그인 action이 API/network mutation을 발생시키지 않는다.
- [ ] `E2E-A01-027` [P0] email/password가 storage/cookie에 남지 않는다.
- [ ] `E2E-A01-028` [P0] Console/Network evidence에 password가 노출되지 않는다.
- [ ] `E2E-A01-029` [P1] Back으로 돌아왔을 때 runtime error가 없다.

### 시각·반응형

- [ ] `E2E-A01-030` [P1] 1440×900에서 카드가 중앙 정렬된다.
- [ ] `E2E-A01-031` [P1] 375×812에서 horizontal overflow가 없다.
- [ ] `E2E-A01-032` [P1] 모바일 키보드 영역을 가정해도 submit button에 스크롤 접근 가능하다.
- [ ] `E2E-A01-033` [P2] validation error가 카드 width를 밀어내지 않는다.

## 3. A03 관리자 계정 목록 (`/admin/admins`)

### 초기·데이터

- [ ] `E2E-A03-001` [P0] route가 HTTP 200으로 열린다.
- [ ] `E2E-A03-002` [P0] 총 `24명`이 표시된다.
- [ ] `E2E-A03-003` [P0] 첫 페이지에 20행이 표시된다.
- [ ] `E2E-A03-004` [P0] 2페이지에 4행이 표시된다.
- [ ] `E2E-A03-005` [P1] 기본 정렬이 등록일 최신순이다.
- [ ] `E2E-A03-006` [P1] 이름/이메일/역할/상태/최근 로그인/등록일/액션 column이 일치한다.
- [ ] `E2E-A03-007` [P0] 모든 이메일이 `@example.invalid`다.
- [ ] `E2E-A03-008` [P1] null 최근 로그인은 `-`다.
- [ ] `E2E-A03-009` [P1] role/status badge가 텍스트와 색상을 함께 제공한다.
- [ ] `E2E-A03-010` [P1] page 1에서 이전 disabled, page 2에서 다음 disabled다.
- [ ] `E2E-A03-011` [P1] 현재 page에 `aria-current="page"`가 있다.

### 검색

- [ ] `E2E-A03-020` [P0] 전체 이름 검색이 일치 계정만 반환한다.
- [ ] `E2E-A03-021` [P0] 이메일 일부 검색이 일치 계정만 반환한다.
- [ ] `E2E-A03-022` [P1] 이메일 검색이 대소문자를 무시한다.
- [ ] `E2E-A03-023` [P1] 검색어 앞뒤 공백을 무시한다.
- [ ] `E2E-A03-024` [P1] 한글 부분 문자열을 찾는다.
- [ ] `E2E-A03-025` [P1] 검색 시 page가 1로 복귀한다.
- [ ] `E2E-A03-026` [P1] 특수문자 입력으로 crash/XSS가 발생하지 않는다.
- [ ] `E2E-A03-027` [P1] 매우 긴 검색어가 layout을 깨지 않고 빈 결과를 표시한다.

### 필터·조합

- [ ] `E2E-A03-030` [P0] role `super_admin` 결과가 해당 role 1건만 포함한다.
- [ ] `E2E-A03-031` [P0] role `operator` 결과가 해당 role 12건만 포함한다.
- [ ] `E2E-A03-032` [P0] role `viewer` 결과가 해당 role 11건만 포함한다.
- [ ] `E2E-A03-033` [P0] status `active` 결과가 active 17건만 포함한다.
- [ ] `E2E-A03-034` [P0] status `inactive` 결과가 inactive 4건만 포함한다.
- [ ] `E2E-A03-035` [P0] status `locked` 결과가 locked 3건만 포함한다.
- [ ] `E2E-A03-036` [P0] role + status + search AND 조합이 정확하다.
- [ ] `E2E-A03-037` [P1] 각 필터 변경 시 page가 1로 복귀한다.
- [ ] `E2E-A03-038` [P1] `필터 초기화`가 query/role/status/page를 모두 초기화한다.
- [ ] `E2E-A03-039` [P1] 빈 결과에서 table/page navigation이 숨고 empty state가 보인다.
- [ ] `E2E-A03-040` [P1] empty state의 초기화 button으로 24명 목록이 복원된다.

### Link·navigation

- [ ] `E2E-A03-050` [P0] 등록 CTA가 `/admin/admins/new`로 이동한다.
- [ ] `E2E-A03-051` [P0] 첫 행 상세가 정확한 `/admin/admins/<id>`로 이동한다.
- [ ] `E2E-A03-052` [P1] 목록 복귀 후 화면이 crash 없이 초기 상태로 렌더된다.
- [ ] `E2E-A03-053` [P1] `/admin/admins` 메뉴가 active다.
- [ ] `E2E-A03-054` [P1] Back/Forward 시 URL과 화면이 일치한다.

## 4. A04 관리자 계정 등록 (`/admin/admins/new`)

### 초기 상태

- [ ] `E2E-A04-001` [P0] route가 HTTP 200으로 열린다.
- [ ] `E2E-A04-002` [P1] 이름/이메일/비밀번호/확인/역할/상태가 표시된다.
- [ ] `E2E-A04-003` [P0] 역할은 기본 선택이 없다.
- [ ] `E2E-A04-004` [P0] 상태 기본값은 `active`다.
- [ ] `E2E-A04-005` [P1] role option 3개와 status option 2개가 정확하다.
- [ ] `E2E-A04-006` [P1] input autocomplete 정책이 기대와 일치한다.
- [ ] `E2E-A04-007` [P1] AdminShell 관리자 계정 메뉴가 active다.

### 이름·이메일 validation

- [ ] `E2E-A04-010` [P0] 빈 제출 시 이름 오류부터 포함한 필수 오류가 표시된다.
- [ ] `E2E-A04-011` [P0] 이름 1자는 `2자 이상` 오류다.
- [ ] `E2E-A04-012` [P1] 이름 앞뒤 공백 제외 1자는 오류다.
- [ ] `E2E-A04-013` [P1] 이름 정확히 2자는 통과한다.
- [ ] `E2E-A04-014` [P1] 긴 이름에서 dialog/layout overflow가 없다.
- [ ] `E2E-A04-015` [P0] 빈 이메일은 필수 오류다.
- [ ] `E2E-A04-016` [P0] 잘못된 이메일 형식은 형식 오류다.
- [ ] `E2E-A04-017` [P1] 유효한 `name@example.invalid`는 통과한다.
- [ ] `E2E-A04-018` [P1] 필드 수정 시 해당 필드 오류만 지워진다.

### 비밀번호 validation

- [ ] `E2E-A04-020` [P0] 빈 비밀번호는 필수 오류다.
- [ ] `E2E-A04-021` [P0] 7자 이하는 오류다.
- [ ] `E2E-A04-022` [P0] 8자 이상이어도 영문이 없으면 오류다.
- [ ] `E2E-A04-023` [P0] 8자 이상이어도 숫자가 없으면 오류다.
- [ ] `E2E-A04-024` [P0] 8자 이상이어도 특수문자가 없으면 오류다.
- [ ] `E2E-A04-025` [P0] `Abcd123!`는 정책을 통과한다.
- [ ] `E2E-A04-026` [P0] 빈 비밀번호 확인은 필수 오류다.
- [ ] `E2E-A04-027` [P0] 확인 불일치는 일치 오류다.
- [ ] `E2E-A04-028` [P1] 일치하도록 수정하면 오류가 지워진다.
- [ ] `E2E-A04-029` [P1] 매우 긴 비밀번호 입력 시 UI가 멈추거나 노출되지 않는다.

### 역할·상태

- [ ] `E2E-A04-030` [P0] 역할 미선택은 오류다.
- [ ] `E2E-A04-031` [P1] keyboard로 role radio를 전환할 수 있다.
- [ ] `E2E-A04-032` [P1] role은 동시에 하나만 선택된다.
- [ ] `E2E-A04-033` [P1] status는 동시에 하나만 선택된다.
- [ ] `E2E-A04-034` [P1] `locked`는 생성 option에 없다.

### 이탈 확인

- [ ] `E2E-A04-040` [P1] pristine 상태에서 목록으로 이동 시 confirm이 없다.
- [ ] `E2E-A04-041` [P1] 이름 변경 후 목록 이동 시 browser confirm이 나타난다.
- [ ] `E2E-A04-042` [P1] 이메일/비밀번호/role/status 중 어느 하나 변경해도 dirty로 판단된다.
- [ ] `E2E-A04-043` [P1] confirm 취소 시 입력값과 현재 route가 유지된다.
- [ ] `E2E-A04-044` [P1] confirm 승인 시 `/admin/admins`로 이동한다.
- [ ] `E2E-A04-045` [P2] 브라우저 Back 또는 reload의 dirty 보호가 미지원이면 명시적으로 기록한다.

### 등록 확인 dialog

- [ ] `E2E-A04-050` [P0] 유효한 입력만 dialog를 연다.
- [ ] `E2E-A04-051` [P0] invalid 상태에서는 dialog가 열리지 않는다.
- [ ] `E2E-A04-052` [P0] dialog에 trim된 이름·이메일·역할·상태만 표시된다.
- [ ] `E2E-A04-053` [P0] 비밀번호와 확인 값이 dialog text/snapshot에 없다.
- [ ] `E2E-A04-054` [P0] dialog 취소 후 모든 입력값이 유지된다.
- [ ] `E2E-A04-055` [P1] dialog 취소 후 재제출이 가능하다.
- [ ] `E2E-A04-056` [P1] dialog semantics/title 연결이 정확하다.
- [ ] `E2E-A04-057` [P2] focus trap/초기 focus/Escape/focus restore를 확인한다.

### Mock submit

- [ ] `E2E-A04-060` [P0] 등록 click 시 button이 `등록 중...`으로 바뀐다.
- [ ] `E2E-A04-061` [P0] 처리 중 취소/등록 button이 disabled다.
- [ ] `E2E-A04-062` [P0] 연속 click이 처리를 중복 실행하지 않는다.
- [ ] `E2E-A04-063` [P0] 완료 후 `/admin/admins`로 이동한다.
- [ ] `E2E-A04-064` [P0] 목록 row 수가 24명으로 유지된다.
- [ ] `E2E-A04-065` [P0] reload 후 새 계정이 존재하지 않는다.
- [ ] `E2E-A04-066` [P0] Console/Network/storage에 비밀번호가 없다.
- [ ] `E2E-A04-067` [P0] API/Supabase mutation이 없다.
- [ ] `E2E-A04-068` [P2] 완료 안내가 route 이동 전에 사용자에게 실질적으로 인지 가능한지 기록한다.

## 5. A05 관리자 계정 상세/수정 (`/admin/admins/[id]`)

### 계정 상태별 표시

- [ ] `E2E-A05-001` [P0] `admin-kim-ops` 상세가 열린다.
- [ ] `E2E-A05-002` [P1] 기본 정보 7항목이 mock과 일치한다.
- [ ] `E2E-A05-003` [P1] role/status badge가 목록과 일치한다.
- [ ] `E2E-A05-004` [P1] super_admin 허용 메뉴와 제한 `없음`이 정확하다.
- [ ] `E2E-A05-005` [P1] operator 허용/제한 메뉴가 정확하다.
- [ ] `E2E-A05-006` [P1] viewer 허용/제한 메뉴가 정확하다.
- [ ] `E2E-A05-007` [P1] 활동이 최신순이고 IP가 마스킹된다.
- [ ] `E2E-A05-008` [P1] 활동 없는 계정에서 빈 상태가 보인다.
- [ ] `E2E-A05-009` [P0] active 계정에는 비활성화 action이 보인다.
- [ ] `E2E-A05-010` [P0] inactive 계정에는 활성화 action이 보인다.
- [ ] `E2E-A05-011` [P0] locked 계정에는 disabled 해제 안내가 보인다.
- [ ] `E2E-A05-012` [P1] active/inactive/locked 로그인 가능 요약이 각각 가능/불가/잠김이다.
- [ ] `E2E-A05-013` [P0] unknown ID는 찾을 수 없음과 목록 Link를 표시한다.

### 역할 변경 dialog

- [ ] `E2E-A05-020` [P0] 역할 변경 button이 dialog를 연다.
- [ ] `E2E-A05-021` [P1] super_admin 대상의 기본 변경 role은 operator다.
- [ ] `E2E-A05-022` [P1] operator/viewer 대상의 기본 선택은 현재 role이다.
- [ ] `E2E-A05-023` [P1] role 3개를 keyboard로 전환할 수 있다.
- [ ] `E2E-A05-024` [P0] 빈 reason 제출은 `2자 이상` 오류다.
- [ ] `E2E-A05-025` [P0] 공백만 reason은 오류다.
- [ ] `E2E-A05-026` [P0] trim 기준 1자는 오류다.
- [ ] `E2E-A05-027` [P0] 정확히 2자는 통과한다.
- [ ] `E2E-A05-028` [P1] maxLength 200으로 추가 입력이 제한된다.
- [ ] `E2E-A05-029` [P1] 표시 count가 trim된 길이와 일치한다.
- [ ] `E2E-A05-030` [P0] 성공 후 mock 완료 notice가 표시된다.
- [ ] `E2E-A05-031` [P0] 성공 후 원본 role과 메뉴가 변하지 않는다.
- [ ] `E2E-A05-032` [P0] reload 후 원본 role이 유지된다.

### 상태·비밀번호 dialog

- [ ] `E2E-A05-040` [P0] active 계정 비활성화 dialog의 문구·label·button이 정확하다.
- [ ] `E2E-A05-041` [P0] inactive 계정 활성화 dialog의 문구·label·button이 정확하다.
- [ ] `E2E-A05-042` [P0] password dialog의 문구·label·button이 정확하다.
- [ ] `E2E-A05-043` [P0] 각 dialog에서 reason 2~200 규칙이 동일하다.
- [ ] `E2E-A05-044` [P0] 각 성공 notice가 action 종류와 일치한다.
- [ ] `E2E-A05-045` [P0] 상태 action 후 원본 status가 변하지 않는다.
- [ ] `E2E-A05-046` [P0] password action 후 임시 비밀번호가 어디에도 나타나지 않는다.
- [ ] `E2E-A05-047` [P0] 각 action이 Network mutation을 발생시키지 않는다.
- [ ] `E2E-A05-048` [P1] dialog 취소가 reason/error를 초기화한다.
- [ ] `E2E-A05-049` [P1] 재오픈 시 stale reason/error가 없다.
- [ ] `E2E-A05-050` [P1] submitting 중 더블클릭/취소가 차단된다.
- [ ] `E2E-A05-051` [P2] focus trap/Escape/focus restore를 확인한다.

## 6. A21 보안 로그 목록 (`/admin/security-logs`)

### 초기·데이터·페이지

- [ ] `E2E-A21-001` [P0] route가 HTTP 200으로 열린다.
- [ ] `E2E-A21-002` [P0] 총 `42건`이 표시된다.
- [ ] `E2E-A21-003` [P0] 20개 page size에서 20/20/2행으로 3페이지다.
- [ ] `E2E-A21-004` [P1] 기본 정렬은 최근 발생순이다.
- [ ] `E2E-A21-005` [P1] table 8개 column이 데이터와 일치한다.
- [ ] `E2E-A21-006` [P0] 목록에 IP/UA/좌표/payload가 없다.
- [ ] `E2E-A21-007` [P1] severity는 텍스트+점+색상으로 표시된다.
- [ ] `E2E-A21-008` [P1] status badge가 텍스트를 포함한다.
- [ ] `E2E-A21-009` [P1] user/treasure null은 `-`다.
- [ ] `E2E-A21-010` [P1] 이전/다음/current page 상태가 정확하다.

### 검색

- [ ] `E2E-A21-020` [P0] 정확한 로그 ID 검색이 1건을 반환한다.
- [ ] `E2E-A21-021` [P0] user public ID 검색이 해당 user 로그만 반환한다.
- [ ] `E2E-A21-022` [P0] nickname 검색이 해당 nickname 로그만 반환한다.
- [ ] `E2E-A21-023` [P0] treasure ID 검색이 해당 treasure 로그만 반환한다.
- [ ] `E2E-A21-024` [P1] 검색은 대소문자와 앞뒤 공백을 무시한다.
- [ ] `E2E-A21-025` [P1] 검색 변경 시 page 1로 복귀한다.
- [ ] `E2E-A21-026` [P1] 특수문자·긴 query가 crash/XSS를 일으키지 않는다.

### 필터

- [ ] `E2E-A21-030` [P0] event type 7개 각각이 해당 type만 반환한다.
- [ ] `E2E-A21-030A` [P1] 현재 fixture에서 event type별 결과는 각각 6건이다.
- [ ] `E2E-A21-031` [P0] severity 4개 각각이 해당 severity만 반환한다.
- [ ] `E2E-A21-031A` [P1] severity 결과는 low 10건, medium 11건, high 11건, critical 10건이다.
- [ ] `E2E-A21-032` [P0] status 4개 각각이 해당 status만 반환한다.
- [ ] `E2E-A21-032A` [P1] status 결과는 open 10건, reviewing 11건, resolved 11건, false_positive 10건이다.
- [ ] `E2E-A21-033` [P0] event + severity + status + search AND 조합이 정확하다.
- [ ] `E2E-A21-034` [P0] `오늘`은 실행일 자정 이후 데이터만 반환한다.
- [ ] `E2E-A21-035` [P0] `최근 7일` 경계값이 포함된다.
- [ ] `E2E-A21-036` [P0] `최근 30일` 경계값이 포함된다.
- [ ] `E2E-A21-037` [P0] 날짜 의존 테스트는 clock을 고정하거나 실행 시각을 evidence에 기록한다.
- [ ] `E2E-A21-038` [P1] 각 필터 변경 시 page 1로 복귀한다.
- [ ] `E2E-A21-039` [P1] 빈 결과에서 empty state가 표시되고 pagination이 숨는다.
- [ ] `E2E-A21-040` [P1] empty 초기화로 42건 default가 복원된다.

### 정렬

- [ ] `E2E-A21-050` [P0] 최근 발생순이 timestamp 내림차순이다.
- [ ] `E2E-A21-051` [P0] 오래된 발생순이 timestamp 오름차순이다.
- [ ] `E2E-A21-052` [P0] 위험도 높은 순은 critical→high→medium→low다.
- [ ] `E2E-A21-053` [P1] 동일 severity는 최근 발생순이다.
- [ ] `E2E-A21-054` [P0] 미확인 우선은 모든 open이 비-open보다 앞선다.
- [ ] `E2E-A21-055` [P1] 동일 open group은 최근 발생순이다.

### page size·query link

- [ ] `E2E-A21-060` [P0] page size 20은 3페이지다.
- [ ] `E2E-A21-061` [P0] page size 50/100은 한 페이지에 42행이다.
- [ ] `E2E-A21-062` [P1] page size 변경 시 page 1로 복귀한다.
- [ ] `E2E-A21-063` [P0] `?userId=USR-1002`가 검색 input과 결과를 초기화한다.
- [ ] `E2E-A21-064` [P0] `?treasureId=TRS-8002`가 검색 input과 결과를 초기화한다.
- [ ] `E2E-A21-065` [P1] userId와 treasureId가 함께 있으면 userId 우선 정책을 기록한다.
- [ ] `E2E-A21-066` [P1] query URL에서 no-query URL로 client navigation 시 이전 검색 잔존 여부를 확인한다.
- [ ] `E2E-A21-067` [P0] 상세 Link가 정확한 `/admin/security-logs/<id>`로 이동한다.
- [ ] `E2E-A21-068` [P2] 8페이지 초과 fixture에서 page number가 8개로 잘리는 확장성 위험을 component test로 재현한다.

## 7. A22 보안 로그 상세 (`/admin/security-logs/[id]`)

### 공통 상세

- [ ] `E2E-A22-001` [P0] `SEC-1001`이 HTTP 200으로 열린다.
- [ ] `E2E-A22-002` [P1] 이벤트 요약 필드가 목록 record와 일치한다.
- [ ] `E2E-A22-003` [P1] 요청/기기/수신 시각 formatter가 일관된다.
- [ ] `E2E-A22-004` [P1] result note가 status에 맞다.
- [ ] `E2E-A22-005` [P0] 원본 payload와 위험 action button이 없다.
- [ ] `E2E-A22-006` [P0] status 변경 control이 없다.
- [ ] `E2E-A22-007` [P1] 목록 Link가 `/admin/security-logs`로 이동한다.
- [ ] `E2E-A22-008` [P0] unknown ID는 찾을 수 없음과 목록 Link를 표시한다.

### 위치·기기·민감정보

- [ ] `E2E-A22-020` [P0] 위치 event에 synthetic·반올림 안내가 보인다.
- [ ] `E2E-A22-021` [P0] 요청/기준 좌표는 제한된 소수점 값만 표시된다.
- [ ] `E2E-A22-022` [P0] 실제 거리/허용 반경/GPS 정확도가 계산값과 일치한다.
- [ ] `E2E-A22-023` [P0] 초과 거리 = 실제 거리 - 허용 반경이다.
- [ ] `E2E-A22-024` [P1] 위치 없는 `SEC-1006`은 위치 관련 값이 모두 `-`다.
- [ ] `E2E-A22-025` [P0] IP는 `***`로 마스킹된다.
- [ ] `E2E-A22-026` [P0] UA/OS/app version/network가 일반화된 값이다.
- [ ] `E2E-A22-027` [P0] 실제 이메일/전화/token/coupon/barcode가 없다.

### 연관 엔티티·로그

- [ ] `E2E-A22-030` [P1] user가 있으면 public ID/nickname/status가 표시된다.
- [ ] `E2E-A22-031` [P1] treasure가 있으면 ID/status가 표시된다.
- [ ] `E2E-A22-032` [P1] `SEC-1005`에 reward ID/status가 표시된다.
- [ ] `E2E-A22-033` [P1] reward가 없는 event는 `-`다.
- [ ] `E2E-A22-034` [P0] user/treasure 상세의 존재하지 않는 route 링크가 없다.
- [ ] `E2E-A22-035` [P0] 같은 유저 Link가 A21 `userId` query로 이동한다.
- [ ] `E2E-A22-036` [P0] 같은 보물 Link가 A21 `treasureId` query로 이동한다.
- [ ] `E2E-A22-037` [P1] user 없는 event에는 같은 유저 Link가 없다.
- [ ] `E2E-A22-038` [P1] treasure 없는 event에는 같은 보물 Link가 없다.
- [ ] `E2E-A22-039` [P1] 연관 로그 목록에서 현재 ID가 제외된다.
- [ ] `E2E-A22-040` [P1] 연관 로그가 최신순이고 최대 5개다.
- [ ] `E2E-A22-041` [P1] 연관 로그 ID click이 다른 A22 상세로 이동한다.
- [ ] `E2E-A22-042` [P1] 연관 로그가 없으면 빈 상태가 표시된다.

## 8. A24 접근 권한 부족 (`/admin/access-denied`)

- [ ] `E2E-A24-001` [P0] reason 없음은 `permission_denied`로 정규화된다.
- [ ] `E2E-A24-002` [P0] `permission_denied` title/description/reason이 정확하다.
- [ ] `E2E-A24-003` [P0] `role_missing` title/description/reason이 정확하다.
- [ ] `E2E-A24-004` [P0] `sensitive_log_forbidden` title/description/reason이 정확하다.
- [ ] `E2E-A24-005` [P0] `direct_url_forbidden` title/description/reason이 정확하다.
- [ ] `E2E-A24-006` [P0] `invalid_admin_profile` title/description/reason이 정확하다.
- [ ] `E2E-A24-007` [P0] unknown reason은 `permission_denied`로 fallback한다.
- [ ] `E2E-A24-008` [P0] 빈 reason도 fallback한다.
- [ ] `E2E-A24-009` [P0] URL encoded script/query가 raw 렌더·실행되지 않는다.
- [ ] `E2E-A24-010` [P1] 다음 행동 3개와 대시보드 button이 표시된다.
- [ ] `E2E-A24-011` [P0] 대시보드 button이 `/admin/dashboard`로 이동한다.
- [ ] `E2E-A24-012` [P0] 실제 role/session 검사나 redirect request가 없다.
- [ ] `E2E-A24-013` [P1] 문의 button·내부 정책·오류 상세가 없다.
- [ ] `E2E-A24-014` [P2] reason 변경 Back/Forward가 화면 copy와 동기화된다.
- [ ] `E2E-A24-015` [P2] `reason: <code>` 화면 노출이 승인된 개발 정보인지 확인하고, 미승인 시 결함으로 기록한다.

## 9. AdminShell 공통

- [ ] `E2E-SHELL-001` [P0] 모든 보호 화면에서 header/sidebar가 한 번만 렌더된다.
- [ ] `E2E-SHELL-002` [P1] 로고 → dashboard 이동이 정상이다.
- [ ] `E2E-SHELL-003` [P1] 준비 중 전역 검색은 disabled다.
- [ ] `E2E-SHELL-004` [P1] role badge와 avatar label이 보인다.
- [ ] `E2E-SHELL-005` [P0] 관리자 계정 root/new/detail active 상태가 정확하다.
- [ ] `E2E-SHELL-006` [P0] 보안 로그 root/detail active 상태가 정확하다.
- [ ] `E2E-SHELL-007` [P0] 기존 products/mappings/rewards/inquiries active 상태가 정확하다.
- [ ] `E2E-SHELL-008` [P1] 준비 중 메뉴는 클릭 불가다.
- [ ] `E2E-SHELL-009` [P1] 1440×900에서 모든 메뉴가 보이거나 스크롤 접근 가능하다.
- [ ] `E2E-SHELL-010` [P1] sticky header가 vertical scroll 중 유지된다.
- [ ] `E2E-SHELL-011` [P1] horizontal scroll에서도 중요한 UI 접근이 가능하다.
- [ ] `E2E-SHELL-012` [P2] 좁은 viewport의 `min-w-[980px]` 정책을 예상 동작과 비교한다.

## 10. P0 사용자 Journey

### J1 로그인 → 관리자 계정 조회

- [ ] `E2E-J-001` 로그인 화면에서 유효 mock form을 제출한다.
- [ ] `E2E-J-002` 대시보드 도착 후 관리자 계정 메뉴를 클릭한다.
- [ ] `E2E-J-003` 목록에서 검색·필터·page 2를 확인한다.
- [ ] `E2E-J-004` 상세로 이동해 role/status/activity를 확인한다.
- [ ] `E2E-J-005` 목록으로 복귀하고 active 메뉴를 확인한다.
- [ ] `E2E-J-006` Journey 전체에 blocking Console/Network 오류가 없다.

### J2 관리자 등록 mock

- [ ] `E2E-J-010` 목록 → 등록 CTA로 이동한다.
- [ ] `E2E-J-011` invalid form을 제출해 validation을 확인한다.
- [ ] `E2E-J-012` valid form을 채우고 confirm dialog를 확인한다.
- [ ] `E2E-J-013` dialog에 password가 없음을 확인한다.
- [ ] `E2E-J-014` mock 등록을 완료해 목록으로 이동한다.
- [ ] `E2E-J-015` 목록/새로고침에서 원본 24명이 유지됨을 확인한다.
- [ ] `E2E-J-016` API/storage side effect가 없음을 확인한다.

### J3 관리자 상세 mock action

- [ ] `E2E-J-020` active 계정에서 역할 변경 reason 오류→성공을 확인한다.
- [ ] `E2E-J-021` 비활성화 reason 오류→성공을 확인한다.
- [ ] `E2E-J-022` password reset reason 오류→성공을 확인한다.
- [ ] `E2E-J-023` inactive 계정에서 활성화를 확인한다.
- [ ] `E2E-J-024` locked 계정에서 해제 action 미제공을 확인한다.
- [ ] `E2E-J-025` reload 후 모든 원본 데이터가 유지됨을 확인한다.

### J4 보안 로그 조사

- [ ] `E2E-J-030` 보안 로그 목록에서 복합 필터·정렬을 적용한다.
- [ ] `E2E-J-031` 위치 event 상세로 이동한다.
- [ ] `E2E-J-032` synthetic 좌표·마스킹 IP·일반화 기기정보를 확인한다.
- [ ] `E2E-J-033` 연관 로그 상세로 이동한다.
- [ ] `E2E-J-034` 같은 user/treasure 목록 query로 돌아간다.
- [ ] `E2E-J-035` 목록 결과가 query ID와 일치한다.
- [ ] `E2E-J-036` 민감정보·위험 action·상태 mutation이 없음을 확인한다.

### J5 접근 거부 recovery

- [ ] `E2E-J-040` 5개 reason URL을 순회한다.
- [ ] `E2E-J-041` 각 사유 copy가 whitelist에 매핑된다.
- [ ] `E2E-J-042` unknown/XSS reason이 기본 사유로 안전하게 fallback한다.
- [ ] `E2E-J-043` 대시보드로 안전하게 복귀한다.

## 11. 회귀 Journey

- [ ] `E2E-R-001` dashboard → products → product detail → back
- [ ] `E2E-R-002` dashboard → mappings → new → back
- [ ] `E2E-R-003` dashboard → reward requests → history → back
- [ ] `E2E-R-004` dashboard → inquiries → inquiry detail → back
- [ ] `E2E-R-005` 각 route에서 sidebar active가 정확하다.
- [ ] `E2E-R-006` 각 route에서 신규 메뉴 추가로 layout이 깨지지 않는다.
- [ ] `E2E-R-007` 기존 화면 Console/Network에 신규 오류가 없다.
- [ ] `E2E-R-008` mappings/products/rewards의 `/admin/treasures/[id]` 링크가 현재 404임을 known baseline으로 기록한다.
- [ ] `E2E-R-009` rewards의 `/admin/users/[id]` 링크가 현재 404임을 known baseline으로 기록한다.
- [ ] `E2E-R-010` product detail의 `/admin/products/[id]/edit` 링크가 현재 404임을 known baseline으로 기록한다.
- [ ] `E2E-R-011` 레거시 404는 이번 7PR 신규 회귀와 분리하되 별도 issue 여부를 사용자에게 확인한다.

## 12. E2E 종료

- [ ] `E2E-END-001` 모든 열린 session을 명시적으로 닫는다.
- [ ] `E2E-END-002` P0 Journey trace를 종료·저장한다.
- [ ] `E2E-END-003` 실패 video를 종료·저장한다.
- [ ] `E2E-END-004` Console/Network/screenshot/trace 경로를 report에 연결한다.
- [ ] `E2E-END-005` 각 항목을 `PASS/FAIL/BLOCKED/NOT_RUN`으로 기록한다.
- [ ] `E2E-END-006` 발견 결함을 severity와 재현 단계로 등록한다.
