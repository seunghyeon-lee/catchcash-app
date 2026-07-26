# A15. 보상 목록 화면 정의서

> 문서 버전: `v1.0`  
> 작성일: `2026-07-26`  
> 화면 ID: `A15_Admin_Reward_List_Screen`  
> 화면명: 보상 목록  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 작성 목적: 바이브코딩을 위한 화면 단위 구현 명세  
> 기준 문서: `CatchCash_Admin_CMS_Final_Functional_Spec_v1.0`, `CatchCash_Admin_CMS_Final_User_Flow_v1.0`

---

# 1. 화면 개요

보상 목록 화면은 사용자 앱에서 생성된 보상 수령권과 쿠폰 발급 상태를 관리자 CMS에서 조회하는 화면이다.

관리자는 이 화면에서 보상 상태, 발급 실패 여부, 재처리 요청 여부, 보물명, 상품명, 외부 발급 요청 ID 등을 확인하고 보상 상세 화면으로 이동할 수 있다.

이 화면은 쿠폰을 직접 발급하거나 쿠폰 번호와 바코드를 조회하는 화면이 아니다.

```txt
보상 목록 조회
→ 상태/재처리/기간 필터 적용
→ failed 우선 또는 최신 획득순 정렬
→ 보상 상세 진입
→ 필요 시 A16 보상 상세에서 재처리 요청
```

---

# 2. 화면 목적

## 2.1 관리자 관점 목적

- 전체 보상 발급 현황을 확인한다.
- 실패한 보상을 우선적으로 확인한다.
- 재처리 요청이 필요한 보상을 찾는다.
- 특정 유저 닉네임, 보물명, 발급 요청 ID로 보상을 검색한다.
- 보상 상세 화면으로 이동해 실패 사유와 처리 이력을 확인한다.
- 운영 이슈 대응을 위해 CSV로 목록을 내보낸다.

## 2.2 시스템 관점 목적

- 보상 상태를 관리자에게 안전하게 노출한다.
- 쿠폰 번호, 바코드, 사용자 이메일 등 민감 정보를 숨긴다.
- 발급 실패 후속 처리를 A16 보상 상세 화면으로 연결한다.
- 기프티쇼비즈 API 직접 호출을 방지한다.

---

# 3. Route

```txt
/admin/rewards
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/rewards/page.tsx
```

---

# 4. 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| A02 운영 대시보드 | 오늘 획득 성공, 오늘 발급 실패 카드 클릭 |
| A02-1 최근 현황 테이블 | 최근 보물 획득 또는 최근 발급 실패 항목 확인 |
| 좌측 사이드바 | `보상` 메뉴 클릭 |
| A18 유저 상세 | 특정 유저 보상 목록 이동 |
| A08 보물상자 상세 | 특정 보물 관련 보상 목록 이동 |
| A12 상품 상세 | 특정 상품 관련 보상 목록 이동 |

---

# 5. 권한 정책

| 역할 | 접근 | 조회 | CSV 내보내기 | 상세 이동 | 재처리 요청 |
|---|---:|---:|---:|---:|---:|
| super_admin | O | O | O | O | A16에서 가능 |
| operator | O | O | O | O | A16에서 가능 |
| viewer | O | O | X | O | X |

## 5.1 버튼 노출 기준

```txt
CSV 내보내기 버튼 = super_admin, operator만 노출
상세 링크 = 모든 role 노출
재처리 요청 버튼 = 이 화면에 노출하지 않음, A16 상세에서 처리
```

## 5.2 권한 없음 처리

- 보상 메뉴는 viewer에게도 노출한다.
- 로그아웃 상태는 `/admin/login`으로 이동한다.
- 관리자 role이 없거나 비정상 role이면 `/admin/access-denied`로 이동한다.
- CSV 내보내기 권한이 없는 viewer에게는 버튼을 숨긴다.

---

# 6. 화면 구조

와이어프레임 기준 화면 구성은 아래 순서로 확정한다.

```txt
AdminLayout
→ 상단 헤더
→ 페이지 타이틀: 보상 목록
→ CSV 내보내기 버튼
→ 검색/필터 영역
→ 정렬/표시 수 영역
→ 보상 목록 테이블
→ 페이지네이션
→ 빈 목록/오류/권한 없음 상태 카드
```

---

# 7. UI 구성 요소

## 7.1 상단 AdminLayout

| 영역 | 내용 |
|---|---|
| 좌측 사이드바 | role 기준 허용 메뉴 |
| 상단 우측 | 검색 입력, 권한 표시, 관리자 아바타 |
| 본문 | 보상 목록 콘텐츠 |

사이드바 메뉴 순서는 공통 AdminLayout 기준을 따른다.

```txt
대시보드
보물상자
상품
매칭
보상
유저
문의
운영 로그
보안 로그
관리자
```

단, 실제 노출 메뉴는 role 기준으로 필터링한다.

---

## 7.2 페이지 헤더

| 요소 | 문구/기능 | 노출 조건 |
|---|---|---|
| 페이지 타이틀 | `보상 목록` | 전체 |
| CSV 내보내기 | 현재 필터 조건 기준 CSV 다운로드 | super_admin/operator |

### CSV 내보내기 정책

CSV에는 현재 검색어, 필터, 정렬, 기간 조건이 적용된 결과를 내보낸다.

CSV에 포함 가능한 정보:

```txt
reward_id
claimed_at
user_nickname
user_display_id
reward_status
treasure_box_id
treasure_title
product_id
product_name
provider_request_id
last_failure_code
retry_requested
created_at
updated_at
```

CSV에 절대 포함하지 않는 정보:

```txt
사용자 이메일
전화번호
쿠폰 번호
바코드 원문
쿠폰 마스킹 값
기프티쇼비즈 API Secret
Supabase service role key
```

---

# 8. 검색/필터 영역

## 8.1 검색 입력

와이어프레임 문구:

```txt
보물명·상품명·유저 ID·닉네임·발급 요청 ID
```

권장 placeholder:

```txt
보물명·상품명·유저 ID·닉네임·발급 요청 ID 검색
```

검색 대상:

| 대상 | 필드 예시 |
|---|---|
| 보상 ID | `rewards.id` |
| 유저 표시 ID | `profiles.display_id` |
| 닉네임 | `profiles.nickname` |
| 보물명 | `treasure_boxes.title` |
| 상품명 | `products.name` |
| 외부 발급 요청 ID | `rewards.provider_request_id` |

사용자 이메일은 검색 대상이 아니다.

---

## 8.2 상태 필터

| 라벨 | 값 |
|---|---|
| 전체 | `all` |
| ready | `ready` |
| issued | `issued` |
| failed | `failed` |
| used | `used` |
| expired | `expired` |
| canceled | `canceled` |

`processing`은 보상 상태로 사용하지 않는다.

---

## 8.3 재처리 요청 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 모든 보상 |
| 요청 없음 | `none` | 재처리 요청 이력 없음 |
| 요청됨 | `requested` | 재처리 요청 생성됨 |
| 처리 중 | `in_progress` | Worker 처리 대기 또는 처리 중 |
| 성공 | `succeeded` | 재처리 성공 |
| 실패 | `failed` | 재처리 실패 |

재처리 요청은 보상 상태를 `processing`으로 바꾸지 않는다.  
failed 상태는 유지한 채 별도 요청 이력으로 관리한다.

---

## 8.4 기간 기준 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 획득일 | `claimed_at` | 사용자가 보상을 획득한 시점 |
| 발급 요청일 | `issue_requested_at` | 쿠폰 발급 요청 시점 |
| 발급 완료일 | `issued_at` | 쿠폰 발급 성공 시점 |
| 실패 발생일 | `failed_at` | 마지막 발급 실패 시점 |
| 만료일 | `expires_at` | 쿠폰 또는 보상 만료일 |

---

## 8.5 시작일/종료일

| 필드 | 설명 |
|---|---|
| 시작일 | 기간 기준의 시작 날짜 |
| 종료일 | 기간 기준의 종료 날짜 |

검증 규칙:

```txt
시작일은 종료일보다 늦을 수 없다.
종료일만 입력한 경우 해당 날짜까지 조회한다.
시작일만 입력한 경우 해당 날짜부터 조회한다.
시간 기준은 Asia/Seoul(KST)로 표시한다.
서버 저장은 UTC를 권장한다.
```

---

## 8.6 초기화 버튼

| 액션 | 처리 |
|---|---|
| 초기화 클릭 | 검색어, 상태, 재처리 요청, 기간 기준, 시작일, 종료일, 정렬, 표시 수를 기본값으로 복원 |

기본값:

```txt
검색어: empty
상태: all
재처리 요청: all
기간 기준: claimed_at
시작일: empty
종료일: empty
정렬: failed 우선
표시 수: 50
페이지: 1
```

---

# 9. 정렬/표시 수 영역

## 9.1 정렬 버튼

와이어프레임 기준 정렬 버튼:

```txt
failed 우선
최신 획득순
```

권장 정렬 옵션:

| 라벨 | 값 | 설명 |
|---|---|---|
| failed 우선 | `failed_first` | failed 상태를 상단 노출 후 최신순 |
| 최신 획득순 | `claimed_desc` | claimed_at 내림차순 |
| 오래된 획득순 | `claimed_asc` | claimed_at 오름차순 |
| 최근 실패순 | `failed_desc` | failed_at 내림차순 |
| 최근 재처리 요청순 | `retry_requested_desc` | 재처리 요청일 내림차순 |

## 9.2 표시 수

| 라벨 | 값 |
|---|---:|
| 20개씩 | 20 |
| 50개씩 | 50 |
| 100개씩 | 100 |

기본값은 50개다.

---

# 10. 보상 목록 테이블

와이어프레임 기준 컬럼:

```txt
획득일
유저
보물명
상품명
상태
외부 발급 요청 ID
최근 실패 코드
재처리 요청
상세
```

## 10.1 컬럼 정의

| 컬럼 | 필드 예시 | 설명 |
|---|---|---|
| 획득일 | `claimed_at` | 보상 획득 시각 |
| 유저 | `user_display_id`, `nickname` | 이메일 제외 |
| 보물명 | `treasure_title` | 연결 보물명 |
| 상품명 | `product_name` | 연결 상품명 |
| 상태 | `reward_status` | ready/issued/failed/used/expired/canceled |
| 외부 발급 요청 ID | `provider_request_id` | 외부 API 요청 추적용 ID |
| 최근 실패 코드 | `last_failure_code` | failed 상태일 때 표시 |
| 재처리 요청 | `retry_request_status` | 요청 없음/요청됨/처리중/성공/실패 |
| 상세 | 링크 | A16 보상 상세 이동 |

## 10.2 행 클릭/상세 이동

| 액션 | 이동 |
|---|---|
| 상세 클릭 | `/admin/rewards/{rewardId}` |
| 행 더블 클릭 | 선택 적용 가능, 기본은 상세 이동 권장 |

## 10.3 상태 배지

| 상태 | 배지 문구 | 색상/톤 |
|---|---|---|
| ready | `ready` | 기본 |
| issued | `issued` | 성공/정상 |
| failed | `failed` | 위험 강조 |
| used | `used` | 중립 |
| expired | `expired` | 비활성 |
| canceled | `canceled` | 취소/중립 |

## 10.4 민감 정보 비노출

보상 목록에서는 아래 값을 절대 보여주지 않는다.

```txt
쿠폰 번호
바코드 원문
쿠폰 마스킹 값
사용자 이메일
사용자 전화번호
외부 API Secret
```

---

# 11. 페이지네이션

와이어프레임 기준:

```txt
1-50 / 238건
1 2 3 4 5 다음
```

정책:

| 요소 | 설명 |
|---|---|
| 총 건수 | 필터 적용 후 전체 건수 |
| 현재 범위 | 현재 페이지의 시작~끝 번호 |
| 페이지 버튼 | 최대 5개 노출 |
| 다음 버튼 | 다음 페이지가 있을 때 활성 |
| 이전 버튼 | 2페이지 이상일 때 노출 또는 활성 |

---

# 12. 빈 목록 / 오류 상태

와이어프레임 하단에는 상태 카드 3개가 함께 정의되어 있다.  
실제 화면에서는 상황별로 하나만 노출하는 것을 권장한다.

## 12.1 검색 결과 없음

문구:

```txt
검색 결과 없음
입력한 조건과 일치하는 보상이 없습니다. 필터를 조정해 주세요.
```

버튼:

```txt
필터 초기화
```

노출 조건:

```txt
API 조회 성공
총 결과 0건
필터 또는 검색어가 적용된 상태
```

---

## 12.2 데이터 조회 실패

문구:

```txt
데이터 조회 실패
보상 목록을 불러오는 중 오류가 발생했습니다.
```

버튼:

```txt
다시 시도
```

노출 조건:

```txt
API 요청 실패
서버 오류
네트워크 오류
```

---

## 12.3 권한 없음

문구:

```txt
권한 없음
이 목록에 접근할 권한이 없습니다. 관리자에게 문의하세요.
```

노출 조건:

```txt
role 없음
비정상 role
서버 권한 검사 실패
```

권장 처리:

```txt
보상 메뉴 접근 자체가 불가능한 경우 /admin/access-denied 이동
화면 내 일부 액션 권한만 없는 경우 버튼 숨김 또는 disabled 처리
```

---

# 13. 로딩 상태

## 13.1 최초 로딩

- 테이블 스켈레톤을 표시한다.
- 필터 영역은 disabled 처리한다.
- CSV 버튼은 disabled 처리한다.

## 13.2 필터 변경 로딩

- 기존 테이블을 유지한 채 opacity를 낮추거나 row skeleton으로 교체한다.
- 페이지 번호는 1로 초기화한다.

---

# 14. API 연동 기준

## 14.1 목록 조회 API

권장 endpoint:

```txt
GET /api/admin/rewards
```

Query parameters:

```txt
q
status
retryStatus
dateField
startDate
endDate
sort
page
pageSize
```

응답 예시:

```ts
type AdminRewardListResponse = {
  items: AdminRewardListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
};
```

## 14.2 목록 아이템 타입

```ts
type RewardStatus =
  | 'ready'
  | 'issued'
  | 'failed'
  | 'used'
  | 'expired'
  | 'canceled';

type RetryRequestStatus =
  | 'none'
  | 'requested'
  | 'in_progress'
  | 'succeeded'
  | 'failed';

type AdminRewardListItem = {
  rewardId: string;
  claimedAt: string;
  userDisplayId: string;
  userNickname: string;
  treasureBoxId: string;
  treasureTitle: string;
  productId: string | null;
  productName: string | null;
  status: RewardStatus;
  providerRequestId: string | null;
  lastFailureCode: string | null;
  retryRequestStatus: RetryRequestStatus;
  latestRetryRequestedAt: string | null;
};
```

---

# 15. CSV 내보내기 API

권장 endpoint:

```txt
GET /api/admin/rewards/export.csv
```

정책:

```txt
현재 검색/필터/정렬 조건을 동일하게 적용한다.
CSV 다운로드 작업은 운영 로그에 기록한다.
viewer는 요청할 수 없다.
서버에서도 role을 재검증한다.
```

---

# 16. 보안 정책

- 브라우저에 Supabase service role key를 노출하지 않는다.
- 기프티쇼비즈 API Secret을 노출하지 않는다.
- 쿠폰 번호와 바코드는 목록 API 응답에 포함하지 않는다.
- 사용자 이메일은 목록 API 응답에 포함하지 않는다.
- CSV 내보내기에서도 민감 정보를 제외한다.
- 모든 권한 검사는 UI와 서버에서 이중으로 수행한다.

---

# 17. 다른 화면과의 연결

| 화면 | 연결 방식 |
|---|---|
| A02 대시보드 | 지표 카드 클릭 시 필터 적용 목록으로 진입 |
| A02-1 최근 현황 | 최근 보상 항목 클릭 시 A16 상세 이동 |
| A16 보상 상세 | 상세 링크 클릭 시 이동 |
| A18 유저 상세 | 특정 유저 보상 필터 진입 |
| A08 보물상자 상세 | 특정 보물 보상 필터 진입 |
| A12 상품 상세 | 특정 상품 보상 필터 진입 |

---

# 18. QA 체크리스트

## 18.1 기본 조회

- [ ] 보상 목록이 정상 조회된다.
- [ ] 기본 정렬은 failed 우선 또는 최신 획득순 정책대로 동작한다.
- [ ] 페이지네이션이 정상 동작한다.
- [ ] 표시 수 변경 시 목록이 재조회된다.

## 18.2 검색/필터

- [ ] 보물명 검색이 동작한다.
- [ ] 상품명 검색이 동작한다.
- [ ] 유저 표시 ID 검색이 동작한다.
- [ ] 닉네임 검색이 동작한다.
- [ ] 외부 발급 요청 ID 검색이 동작한다.
- [ ] 상태 필터가 정상 동작한다.
- [ ] 재처리 요청 필터가 정상 동작한다.
- [ ] 기간 기준과 시작일/종료일 필터가 정상 동작한다.
- [ ] 초기화 버튼이 모든 조건을 기본값으로 되돌린다.

## 18.3 권한

- [ ] super_admin은 목록 조회와 CSV 내보내기가 가능하다.
- [ ] operator는 목록 조회와 CSV 내보내기가 가능하다.
- [ ] viewer는 목록 조회와 상세 이동만 가능하다.
- [ ] viewer에게 CSV 내보내기 버튼이 보이지 않는다.
- [ ] 서버에서 viewer의 CSV 요청을 차단한다.

## 18.4 민감 정보

- [ ] 사용자 이메일이 노출되지 않는다.
- [ ] 쿠폰 번호가 노출되지 않는다.
- [ ] 바코드가 노출되지 않는다.
- [ ] CSV에도 민감 정보가 포함되지 않는다.

## 18.5 상태 화면

- [ ] 검색 결과 없음 상태가 정상 표시된다.
- [ ] 데이터 조회 실패 상태가 정상 표시된다.
- [ ] 권한 없음 상태 또는 접근 제한 이동이 정상 동작한다.
- [ ] 다시 시도 버튼이 목록을 재조회한다.

---

# 19. 구현 메모

```txt
이 화면에서는 보상 재처리 요청을 직접 실행하지 않는다.
재처리 요청은 A16 보상 상세 화면에서 내부 메모와 함께 처리한다.

보상 상태 processing은 사용하지 않는다.
failed 상태를 유지한 채 reward_retry_requests 테이블로 별도 관리한다.

목록/CSV/API 응답에는 쿠폰 번호와 바코드를 포함하지 않는다.
```
