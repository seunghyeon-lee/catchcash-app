# 관리자 CMS 7PR 단위·컴포넌트 테스트 설계 체크리스트

> 상태: **DESIGNED / NOT_IMPLEMENTED / NOT_RUN**
>
> 현재 `package.json`에는 unit test runner, DOM test environment, React Testing Library가 없다. 이 문서는 테스트 대상과 기대값을 고정할 뿐 dependency 추가·함수 추출·테스트 코드 작성은 수행하지 않는다.

## 1. 구현 전 승인 게이트

- [ ] `UNIT-GATE-001` unit test framework 도입 여부를 사용자가 승인한다.
- [ ] `UNIT-GATE-002` 권장안 `Vitest + jsdom + @testing-library/react + @testing-library/user-event`를 승인하거나 대안을 정한다.
- [ ] `UNIT-GATE-003` `package.json`/lockfile 변경을 별도 QA automation PR로 허용한다.
- [ ] `UNIT-GATE-004` component 내부 함수의 pure module 추출을 최소 리팩터링으로 허용한다.
- [ ] `UNIT-GATE-005` test naming/location 규칙을 결정한다.
- [ ] `UNIT-GATE-006` timezone을 `Asia/Seoul`로 고정할지 UTC snapshot 기준으로 할지 결정한다.
- [ ] `UNIT-GATE-007` fake timer 기준 시각을 고정한다.
- [ ] `UNIT-GATE-008` coverage threshold를 결정한다.

### 권장 threshold

- statements: 90% 이상
- branches: 90% 이상
- functions: 95% 이상
- lines: 90% 이상
- P0 pure logic module branches: 100%

## 2. 권장 테스트 구조

```text
tests/
  unit/
    admin/
      admin-accounts-data.test.ts
      admin-account-validation.test.ts
      security-logs-data.test.ts
      security-log-filter-sort.test.ts
      access-denied-reason.test.ts
      admin-login-validation.test.ts
  components/
    admin/
      admin-shell.test.tsx
      admin-accounts-list.test.tsx
      admin-account-create.test.tsx
      admin-account-detail.test.tsx
      security-logs-list.test.tsx
      security-log-detail.test.tsx
      access-denied.test.tsx
      admin-login.test.tsx
```

구조는 승인 전 생성하지 않는다.

## 3. `mock-admin-accounts.ts` 순수 함수·데이터

### Enum·label map

- [ ] `UNIT-ACC-001` `AdminRole`의 런타임 fixture가 super_admin/operator/viewer만 포함한다.
- [ ] `UNIT-ACC-002` 모든 role에 label이 정확히 하나 있다.
- [ ] `UNIT-ACC-003` `AdminStatus` fixture가 active/inactive/locked만 포함한다.
- [ ] `UNIT-ACC-004` 모든 status에 label이 정확히 하나 있다.
- [ ] `UNIT-ACC-005` 모든 activity action에 label이 있다.
- [ ] `UNIT-ACC-006` severity와 달리 role/status label은 raw enum 정책과 일치한다.

### Mock record invariant

- [ ] `UNIT-ACC-010` 계정 수는 24개다.
- [ ] `UNIT-ACC-011` ID가 모두 non-empty·unique다.
- [ ] `UNIT-ACC-012` 이메일이 모두 non-empty·unique다.
- [ ] `UNIT-ACC-013` 이메일이 모두 `/@example\.invalid$/`를 만족한다.
- [ ] `UNIT-ACC-014` 이름 trim 길이가 2 이상이다.
- [ ] `UNIT-ACC-015` role이 허용 enum에 속한다.
- [ ] `UNIT-ACC-016` status가 허용 enum에 속한다.
- [ ] `UNIT-ACC-017` createdAt이 유효한 ISO datetime이다.
- [ ] `UNIT-ACC-018` lastLoginAt은 null 또는 유효한 ISO datetime이다.
- [ ] `UNIT-ACC-019` 실제 전화번호/token/provider/coupon/barcode field가 없다.
- [ ] `UNIT-ACC-019A` role 분포는 super_admin 1, operator 12, viewer 11이다.
- [ ] `UNIT-ACC-019B` status 분포는 active 17, inactive 4, locked 3이다.
- [ ] `UNIT-ACC-019C` lastLoginAt null 계정은 2개다.

### Formatter

- [ ] `UNIT-ACC-020` `formatAdminAccountDateTime(null)`은 `-`다.
- [ ] `UNIT-ACC-021` 유효 ISO datetime이 ko-KR year/month/day/hour/minute로 변환된다.
- [ ] `UNIT-ACC-022` formatter는 second를 표시하지 않는다.
- [ ] `UNIT-ACC-023` `hour12: false`로 오전/오후 문자열을 사용하지 않는다.
- [ ] `UNIT-ACC-024` timezone 차이로 날짜 rollover가 발생할 수 있는 입력을 고정 timezone에서 검증한다.
- [ ] `UNIT-ACC-025` `formatAdminAccountDate`는 날짜만 표시한다.
- [ ] `UNIT-ACC-026` invalid date 입력의 정책(throw/Invalid Date)을 명시하고 test한다.

### Find·activity helper

- [ ] `UNIT-ACC-030` `findAdminAccount("admin-kim-ops")`가 정확한 record를 반환한다.
- [ ] `UNIT-ACC-031` unknown ID는 null을 반환한다.
- [ ] `UNIT-ACC-032` empty ID는 null을 반환한다.
- [ ] `UNIT-ACC-033` ID lookup은 대소문자를 임의로 정규화하지 않는다.
- [ ] `UNIT-ACC-034` `getAdminAccountActivities`가 해당 adminId record만 반환한다.
- [ ] `UNIT-ACC-035` 활동은 occurredAt 내림차순이다.
- [ ] `UNIT-ACC-036` 활동 없는 계정은 빈 배열이다.
- [ ] `UNIT-ACC-037` unknown/empty ID는 빈 배열이다.
- [ ] `UNIT-ACC-038` helper 호출이 원본 배열 순서를 mutate하지 않는다.
- [ ] `UNIT-ACC-039` 모든 activity의 adminId가 실제 계정 또는 의도된 fixture를 참조한다.
- [ ] `UNIT-ACC-040` 모든 IP가 마스킹 패턴을 만족한다.

### Role menu matrix

- [ ] `UNIT-ACC-050` super_admin 허용 메뉴는 8개, 제한 메뉴는 0개다.
- [ ] `UNIT-ACC-051` operator 허용 메뉴는 5개다.
- [ ] `UNIT-ACC-052` operator 제한 메뉴는 관리자 계정/보안 로그다.
- [ ] `UNIT-ACC-053` viewer 허용 메뉴는 4개다.
- [ ] `UNIT-ACC-054` viewer 제한 메뉴는 관리자 계정/보상 재처리/보안 로그다.
- [ ] `UNIT-ACC-055` 동일 role의 허용·제한 메뉴가 중복되지 않는다.
- [ ] `UNIT-ACC-056` 메뉴 문자열이 AdminShell 실제 label과 동기화된다.

## 4. A03 목록 filtering·pagination

현재 filtering/pagination이 page component 내부에 있으므로 정식 unit test 전 pure selector 추출이 필요하다.

권장 signature:

```ts
filterAndSortAdminAccounts(records, { query, role, status })
paginate(records, page, pageSize)
```

- [ ] `UNIT-A03-001` 빈 query/all/all은 24개를 반환한다.
- [ ] `UNIT-A03-002` query trim 후 이름 부분 일치가 된다.
- [ ] `UNIT-A03-003` query trim 후 이메일 부분 일치가 된다.
- [ ] `UNIT-A03-004` query 검색은 ASCII 대소문자를 무시한다.
- [ ] `UNIT-A03-005` 일치 없음은 빈 배열이다.
- [ ] `UNIT-A03-006` role 단일 필터가 정확하다.
- [ ] `UNIT-A03-007` status 단일 필터가 정확하다.
- [ ] `UNIT-A03-008` query+role+status는 AND 조건이다.
- [ ] `UNIT-A03-009` 반환값은 createdAt 내림차순이다.
- [ ] `UNIT-A03-010` filter/sort가 원본 배열을 mutate하지 않는다.
- [ ] `UNIT-A03-011` pageSize 20에서 총 page는 2다.
- [ ] `UNIT-A03-012` page 1은 20개, page 2는 4개다.
- [ ] `UNIT-A03-013` page가 total을 초과하면 safePage가 total이다.
- [ ] `UNIT-A03-014` empty 결과의 totalPages는 UI 정책상 1이고 pageItems는 빈 배열이다.
- [ ] `UNIT-A03-015` filter 변경 reducer/action은 page를 1로 초기화한다.

## 5. A04 등록 validation

현재 `EMAIL_PATTERN`, `PASSWORD_PATTERN`, `validate`, `initialForm`이 component 내부에 있으므로 최소 추출이 필요하다.

권장 signature:

```ts
validateAdminCreateForm(form): AdminCreateErrors
isAdminCreateFormDirty(form, initial): boolean
```

### 이름

- [ ] `UNIT-A04-001` empty 이름은 오류다.
- [ ] `UNIT-A04-002` 공백만 이름은 오류다.
- [ ] `UNIT-A04-003` trim 기준 1자는 오류다.
- [ ] `UNIT-A04-004` trim 기준 2자는 통과한다.
- [ ] `UNIT-A04-005` 한글 2자는 통과한다.
- [ ] `UNIT-A04-006` emoji/combining character 길이 정책을 명시하고 고정한다.

### 이메일

- [ ] `UNIT-A04-010` empty 이메일은 필수 오류다.
- [ ] `UNIT-A04-011` `admin`은 형식 오류다.
- [ ] `UNIT-A04-012` `admin@`은 형식 오류다.
- [ ] `UNIT-A04-013` `@example.invalid`은 형식 오류다.
- [ ] `UNIT-A04-014` `admin@example.invalid`는 통과한다.
- [ ] `UNIT-A04-015` 앞뒤 공백은 trim 후 통과한다.
- [ ] `UNIT-A04-016` 내부 공백은 오류다.
- [ ] `UNIT-A04-017` 다중 `@`는 오류다.

### 비밀번호

- [ ] `UNIT-A04-020` empty는 필수 오류다.
- [ ] `UNIT-A04-021` 7자는 오류다.
- [ ] `UNIT-A04-022` 정확히 8자 + 영문/숫자/특수문자는 통과한다.
- [ ] `UNIT-A04-023` 영문 없음은 오류다.
- [ ] `UNIT-A04-024` 숫자 없음은 오류다.
- [ ] `UNIT-A04-025` 특수문자 없음은 오류다.
- [ ] `UNIT-A04-026` 공백을 특수문자로 인정하는 현재 regex 동작을 검출하고 정책을 결정한다.
- [ ] `UNIT-A04-027` Unicode 문자를 포함하는 비밀번호 정책을 명시한다.
- [ ] `UNIT-A04-028` 매우 긴 문자열에서 validation이 결정적으로 종료된다.
- [ ] `UNIT-A04-029` 확인 empty는 필수 오류다.
- [ ] `UNIT-A04-030` 확인 불일치는 오류다.
- [ ] `UNIT-A04-031` 정확한 일치는 통과한다.

### Role/status/dirty

- [ ] `UNIT-A04-040` empty role은 오류다.
- [ ] `UNIT-A04-041` 3개 role은 통과한다.
- [ ] `UNIT-A04-042` runtime invalid role을 방어할지 정책을 고정한다.
- [ ] `UNIT-A04-043` active/inactive status는 통과한다.
- [ ] `UNIT-A04-044` locked/unknown status는 오류다.
- [ ] `UNIT-A04-045` initial form은 dirty가 아니다.
- [ ] `UNIT-A04-046` 각 필드 하나의 변경이 dirty다.
- [ ] `UNIT-A04-047` status를 변경 후 active로 되돌리면 dirty가 아니다.
- [ ] `UNIT-A04-048` field update가 해당 field error만 제거한다.
- [ ] `UNIT-A04-049` valid form errors는 빈 객체다.

## 6. A05 reason validation·action state

`validateReason`을 pure module로 추출한 후 검증한다.

- [ ] `UNIT-A05-001` empty는 `2자 이상` 오류다.
- [ ] `UNIT-A05-002` 공백만 입력은 오류다.
- [ ] `UNIT-A05-003` trim 기준 1자는 오류다.
- [ ] `UNIT-A05-004` trim 기준 정확히 2자는 null이다.
- [ ] `UNIT-A05-005` trim 기준 200자는 null이다.
- [ ] `UNIT-A05-006` trim 기준 201자는 `200자 이하` 오류다.
- [ ] `UNIT-A05-007` 앞뒤 공백은 count에서 제외된다.
- [ ] `UNIT-A05-008` newline/tab only는 오류다.
- [ ] `UNIT-A05-009` Korean/emoji 문자 count 정책을 확인한다.
- [ ] `UNIT-A05-010` dialog kind별 완료 message가 정확히 매핑된다.
- [ ] `UNIT-A05-011` super_admin role dialog 기본값은 operator다.
- [ ] `UNIT-A05-012` non-super role dialog 기본값은 현재 role이다.
- [ ] `UNIT-A05-013` active는 deactivate action이다.
- [ ] `UNIT-A05-014` inactive는 activate action이다.
- [ ] `UNIT-A05-015` locked는 mutation action 대신 disabled 안내다.
- [ ] `UNIT-A05-016` action 완료 후 dialog/reason/error가 초기화된다.
- [ ] `UNIT-A05-017` action 완료가 원본 account object를 mutate하지 않는다.

## 7. `mock-security-logs.ts` 순수 함수·데이터

### Fixture invariant

- [ ] `UNIT-SECLOG-001` mock 로그 수는 42개다.
- [ ] `UNIT-SECLOG-002` ID가 `SEC-1001`~`SEC-1042`이고 모두 고유하다.
- [ ] `UNIT-SECLOG-003` event type 7종이 모두 최소 1회 등장한다.
- [ ] `UNIT-SECLOG-004` severity 4종이 모두 등장한다.
- [ ] `UNIT-SECLOG-005` status 4종이 모두 등장한다.
- [ ] `UNIT-SECLOG-006` 모든 timestamp가 유효한 ISO다.
- [ ] `UNIT-SECLOG-007` admin security event의 user/nickname/deviceAt은 null이다.
- [ ] `UNIT-SECLOG-008` 위치 관련 event만 treasureId를 가진다.
- [ ] `UNIT-SECLOG-009` summary가 label 및 ID index와 일치한다.
- [ ] `UNIT-SECLOG-009A` event type 7종은 각각 6건이다.
- [ ] `UNIT-SECLOG-009B` severity 분포는 low 10, medium 11, high 11, critical 10이다.
- [ ] `UNIT-SECLOG-009C` status 분포는 open 10, reviewing 11, resolved 11, false_positive 10이다.

### Label·rank·formatter

- [ ] `UNIT-SECLOG-010` 모든 event type에 label이 있다.
- [ ] `UNIT-SECLOG-011` 모든 severity에 label과 rank가 있다.
- [ ] `UNIT-SECLOG-012` rank는 low<medium<high<critical이다.
- [ ] `UNIT-SECLOG-013` 모든 status에 label이 있다.
- [ ] `UNIT-SECLOG-014` formatter null은 `-`다.
- [ ] `UNIT-SECLOG-015` formatter는 ko-KR minute 단위다.
- [ ] `UNIT-SECLOG-016` invalid date 정책을 명시한다.

### Find/detail

- [ ] `UNIT-SECLOG-020` known ID lookup은 정확한 record다.
- [ ] `UNIT-SECLOG-021` unknown/empty lookup은 null이다.
- [ ] `UNIT-SECLOG-022` 위치 record detail에 좌표·거리·정확도·반경이 있다.
- [ ] `UNIT-SECLOG-023` 위치 없는 detail의 위치 필드는 null이다.
- [ ] `UNIT-SECLOG-024` distance는 `180 + numericId % 200`이다.
- [ ] `UNIT-SECLOG-025` accuracy는 `20 + numericId % 40`이다.
- [ ] `UNIT-SECLOG-026` allowed radius는 위치 record에서 30이다.
- [ ] `UNIT-SECLOG-027` status resolved는 조치 완료 note다.
- [ ] `UNIT-SECLOG-028` false_positive는 오탐 note다.
- [ ] `UNIT-SECLOG-029` open/reviewing은 추가 확인 note다.
- [ ] `UNIT-SECLOG-030` even/odd numeric ID가 OS/network mapping과 일치한다.
- [ ] `UNIT-SECLOG-031` reward suspicious만 reward ID/status를 가진다.
- [ ] `UNIT-SECLOG-032` user/treasure status는 해당 ID 존재 여부와 일치한다.
- [ ] `UNIT-SECLOG-033` IP/UA/version/coordinate note가 민감정보 정책을 만족한다.
- [ ] `UNIT-SECLOG-034` detail builder가 원본 list record를 mutate하지 않는다.

### Related helper

- [ ] `UNIT-SECLOG-040` null user/treasure는 빈 배열이다.
- [ ] `UNIT-SECLOG-041` 동일 user/treasure만 반환한다.
- [ ] `UNIT-SECLOG-042` exclude ID가 결과에 없다.
- [ ] `UNIT-SECLOG-043` 결과가 requestedAt 내림차순이다.
- [ ] `UNIT-SECLOG-044` 결과가 최대 5개다.
- [ ] `UNIT-SECLOG-045` unknown user/treasure는 빈 배열이다.
- [ ] `UNIT-SECLOG-046` helper 호출이 원본 배열을 mutate하지 않는다.

## 8. A21 filtering·period·sorting·pagination

component 내부 `matchesPeriod`와 filter/sort 계산을 pure module로 추출하고 `Date.now()`를 주입 가능하게 만든다.

권장 signature:

```ts
matchesSecurityLogPeriod(requestedAt, period, now)
filterSortSecurityLogs(records, filters, now)
paginate(records, page, pageSize)
```

### Period

- [ ] `UNIT-A21-001` `all`은 과거/미래 timestamp 모두 true다.
- [ ] `UNIT-A21-002` today는 local midnight 정확히 경계 포함이다.
- [ ] `UNIT-A21-003` midnight 직전은 today false다.
- [ ] `UNIT-A21-004` last 7 days 정확한 경계값은 true다.
- [ ] `UNIT-A21-005` 경계 1ms 이전은 false다.
- [ ] `UNIT-A21-006` last 30 days 경계도 동일하다.
- [ ] `UNIT-A21-007` DST/timezone 영향이 없도록 timezone을 고정한다.
- [ ] `UNIT-A21-008` invalid period runtime fallback 정책을 test한다.
- [ ] `UNIT-A21-009` invalid timestamp 정책을 명시한다.

### Filter/search

- [ ] `UNIT-A21-010` 빈 query/all filters는 42개다.
- [ ] `UNIT-A21-011` ID/user/nickname/treasure 각각을 검색한다.
- [ ] `UNIT-A21-012` query는 trim·lowercase 처리된다.
- [ ] `UNIT-A21-013` null searchable field를 안전하게 처리한다.
- [ ] `UNIT-A21-014` event filter 7개를 table-driven test한다.
- [ ] `UNIT-A21-015` severity filter 4개를 table-driven test한다.
- [ ] `UNIT-A21-016` status filter 4개를 table-driven test한다.
- [ ] `UNIT-A21-017` 모든 filter는 AND 결합이다.
- [ ] `UNIT-A21-018` 일치 없음은 빈 배열이다.

### Sort

- [ ] `UNIT-A21-020` created_desc는 최신순이다.
- [ ] `UNIT-A21-021` created_asc는 오래된순이다.
- [ ] `UNIT-A21-022` risk_desc는 rank 내림차순이다.
- [ ] `UNIT-A21-023` risk_desc tie-breaker는 최신순이다.
- [ ] `UNIT-A21-024` open_first는 open을 우선한다.
- [ ] `UNIT-A21-025` open_first group tie-breaker는 최신순이다.
- [ ] `UNIT-A21-026` sort가 원본 배열을 mutate하지 않는다.
- [ ] `UNIT-A21-027` invalid sort runtime fallback 정책을 test한다.

### Page/query state

- [ ] `UNIT-A21-030` pageSize 20 → 3 pages, 20/20/2 items다.
- [ ] `UNIT-A21-031` pageSize 50/100 → 1 page, 42 items다.
- [ ] `UNIT-A21-032` safePage가 totalPages를 초과하지 않는다.
- [ ] `UNIT-A21-033` filter/sort/pageSize/query 변경이 page 1로 초기화된다.
- [ ] `UNIT-A21-034` userId query가 initial query가 된다.
- [ ] `UNIT-A21-035` treasureId query가 initial query가 된다.
- [ ] `UNIT-A21-036` 둘 다 있으면 userId가 우선한다.
- [ ] `UNIT-A21-037` query parameter 제거 시 state 정책을 명시하고 test한다.

## 9. A24 reason whitelist

`ACCESS_DENIED_REASONS`, `REASON_COPY`, `resolveReason`을 pure module로 추출한다.

- [ ] `UNIT-A24-001` 허용 reason 5개가 각각 자기 자신으로 resolve된다.
- [ ] `UNIT-A24-002` null은 permission_denied다.
- [ ] `UNIT-A24-003` empty string은 permission_denied다.
- [ ] `UNIT-A24-004` unknown string은 permission_denied다.
- [ ] `UNIT-A24-005` 대소문자 변형은 허용하지 않고 fallback한다.
- [ ] `UNIT-A24-006` 앞뒤 공백 변형은 허용하지 않고 fallback한다.
- [ ] `UNIT-A24-007` script/HTML/URL encoded 입력은 fallback한다.
- [ ] `UNIT-A24-008` 각 whitelist reason에 title/description이 있다.
- [ ] `UNIT-A24-009` copy map key와 whitelist가 정확히 일치한다.
- [ ] `UNIT-A24-010` raw unknown value가 copy/result에 포함되지 않는다.

## 10. A01 로그인 validation

EMAIL_PATTERN과 validate 순서를 pure function으로 추출한다.

권장 signature:

```ts
validateAdminLogin(email, password): string | null
```

- [ ] `UNIT-A01-001` empty email은 이메일 필수 오류다.
- [ ] `UNIT-A01-002` whitespace email은 이메일 필수 오류다.
- [ ] `UNIT-A01-003` invalid email은 형식 오류다.
- [ ] `UNIT-A01-004` valid email + empty password는 password 필수 오류다.
- [ ] `UNIT-A01-005` valid email + non-empty password는 null이다.
- [ ] `UNIT-A01-006` email error가 password error보다 우선한다.
- [ ] `UNIT-A01-007` email 앞뒤 공백은 trim 후 통과한다.
- [ ] `UNIT-A01-008` 내부 공백·다중 @는 오류다.
- [ ] `UNIT-A01-009` submitting true이면 handler가 재진입하지 않는다.
- [ ] `UNIT-A01-010` 성공 timer 350ms 전에는 navigation하지 않는다.
- [ ] `UNIT-A01-011` 350ms 후 dashboard로 한 번만 navigate한다.
- [ ] `UNIT-A01-012` component unmount 전 pending timer 정책을 test한다.

## 11. AdminShell active route

active 계산을 pure helper로 추출하는 것을 권장한다.

- [ ] `UNIT-SHELL-001` exact dashboard route만 dashboard active다.
- [ ] `UNIT-SHELL-002` products root/detail/new에서 products active다.
- [ ] `UNIT-SHELL-003` mappings root/new에서 mappings active다.
- [ ] `UNIT-SHELL-004` reward requests root/history에서 reward active다.
- [ ] `UNIT-SHELL-005` inquiries root/detail에서 inquiries active다.
- [ ] `UNIT-SHELL-006` admins root/new/detail에서 admins active다.
- [ ] `UNIT-SHELL-007` security logs root/detail에서 security logs active다.
- [ ] `UNIT-SHELL-008` `/admin/admins-malicious` 같은 prefix collision 정책을 검출한다.
- [ ] `UNIT-SHELL-009` `/admin/security-logs-extra` 같은 prefix collision 정책을 검출한다.
- [ ] `UNIT-SHELL-010` unknown route에서는 active menu가 없다.
- [ ] `UNIT-SHELL-011` href 없는 준비 중 item은 Link가 아니다.

## 12. React 컴포넌트 통합 테스트

### A03

- [ ] `COMP-A03-001` default rows/count/pagination을 렌더한다.
- [ ] `COMP-A03-002` typing/select interaction이 count/table을 갱신한다.
- [ ] `COMP-A03-003` filter change가 page 1로 복귀한다.
- [ ] `COMP-A03-004` empty와 reset을 렌더·복원한다.
- [ ] `COMP-A03-005` Link href가 fixture ID와 일치한다.

### A04

- [ ] `COMP-A04-001` invalid submit 후 field error를 렌더한다.
- [ ] `COMP-A04-002` valid submit 후 dialog를 렌더한다.
- [ ] `COMP-A04-003` dialog에 password가 없다.
- [ ] `COMP-A04-004` dirty Link confirm cancel/accept를 mock한다.
- [ ] `COMP-A04-005` fake timer 후 router.push가 한 번 호출된다.
- [ ] `COMP-A04-006` submitting 중 button이 disabled다.

### A05

- [ ] `COMP-A05-001` active/inactive/locked action branch를 각각 렌더한다.
- [ ] `COMP-A05-002` unknown ID branch를 렌더한다.
- [ ] `COMP-A05-003` dialog kind별 copy/button을 렌더한다.
- [ ] `COMP-A05-004` reason error→수정→성공 state transition을 검증한다.
- [ ] `COMP-A05-005` 완료 notice와 원본 불변을 검증한다.

### A21

- [ ] `COMP-A21-001` Suspense fallback과 content를 렌더한다.
- [ ] `COMP-A21-002` query param initial state를 검증한다.
- [ ] `COMP-A21-003` 복합 filter/sort/page size interaction을 검증한다.
- [ ] `COMP-A21-004` empty/reset을 검증한다.
- [ ] `COMP-A21-005` severity/status badge accessible text를 검증한다.
- [ ] `COMP-A21-006` 8페이지 초과 fixture에서 page 9 이상으로 직접 이동할 수 없는 현재 cap을 검출한다.

### A22

- [ ] `COMP-A22-001` location/non-location/reward/admin event branch를 렌더한다.
- [ ] `COMP-A22-002` unknown ID branch를 렌더한다.
- [ ] `COMP-A22-003` related link visibility를 null/non-null별로 검증한다.
- [ ] `COMP-A22-004` 존재하지 않는 entity detail href가 없음을 검증한다.

### A24

- [ ] `COMP-A24-001` reason 5개 copy를 table-driven render test한다.
- [ ] `COMP-A24-002` invalid reason fallback을 검증한다.
- [ ] `COMP-A24-003` dashboard href를 검증한다.

### A01

- [ ] `COMP-A01-001` label/id/required/autocomplete를 검증한다.
- [ ] `COMP-A01-002` error 우선순위와 `role=alert`를 검증한다.
- [ ] `COMP-A01-003` Enter submit과 disabled state를 검증한다.
- [ ] `COMP-A01-004` fake timer 후 router.push를 검증한다.

## 13. 단위 테스트 품질 게이트

- [ ] `UNIT-END-001` 각 P0 branch가 최소 하나의 실패/성공 test를 가진다.
- [ ] `UNIT-END-002` 날짜 test가 실제 현재 시각에 의존하지 않는다.
- [ ] `UNIT-END-003` locale/timezone 차이로 flake하지 않는다.
- [ ] `UNIT-END-004` test가 실제 network/browser를 호출하지 않는다.
- [ ] `UNIT-END-005` test 간 mock/timer/storage가 reset된다.
- [ ] `UNIT-END-006` snapshot 남용 없이 의미 있는 assertion을 사용한다.
- [ ] `UNIT-END-007` accessibility assertion이 text 존재 확인에 그치지 않는다.
- [ ] `UNIT-END-008` coverage 수치와 미커버 branch가 보고서에 포함된다.
- [ ] `UNIT-END-009` test 도입으로 production bundle/import가 변하지 않는다.
- [ ] `UNIT-END-010` lint/build/unit/component test를 모두 통과한다.
