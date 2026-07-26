# A16. 보상 상세 화면 정의서

> 문서 버전: `v1.0`  
> 작성일: `2026-07-26`  
> 화면 ID: `A16_Admin_Reward_Detail_Screen`  
> 화면명: 보상 상세  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 작성 목적: 바이브코딩을 위한 관리자 보상 상세 화면 단위 구현 명세  
> 관련 화면: `A15_Admin_Reward_List_Screen`, `A18_Admin_User_Detail_Screen`, `A08_Admin_Treasure_Detail_Screen`, `A12_Admin_Product_Detail_Screen`, `A20_Admin_Inquiry_Detail_Screen`

---

# 1. 화면 개요

보상 상세 화면은 사용자 앱에서 생성된 보상 단건의 상태, 발급 요청 정보, 실패 사유, 재처리 요청 현황, 관련 유저·보물상자·상품 정보를 확인하는 관리자 CMS 화면이다.

이 화면에서는 보상 상태를 직접 임의 변경하지 않는다.  
`failed` 상태 보상에 대해서만 관리자 재처리 요청을 생성할 수 있다.

중요 정책:

```txt
CMS는 쿠폰 번호와 바코드 원문 또는 마스킹 값을 표시하지 않는다.
CMS 화면은 기프티쇼비즈 API를 직접 호출하지 않는다.
재처리 요청은 failed 상태를 유지한 채 별도 요청 이력으로 관리한다.
processing은 보상 상태로 사용하지 않는다.
```

---

# 2. 화면 목적

## 2.1 핵심 목적

- 보상 단건의 현재 상태를 확인한다.
- 발급 요청·발급 완료·실패 발생 시각을 확인한다.
- 외부 발급 요청 ID를 확인한다.
- 실패 코드와 실패 사유를 확인한다.
- 재처리 요청 가능 여부를 판단한다.
- 재처리 요청을 생성한다.
- 재처리 요청 이력을 확인한다.
- 관련 유저, 보물상자, 상품 상세로 이동한다.
- 운영자가 내부 메모를 남긴다.

## 2.2 관리자 관점 목적

- 실패한 보상에 대해 운영 후속 처리를 할 수 있다.
- 사용자의 문의 대응 전에 보상 상태를 확인할 수 있다.
- 어떤 보물과 상품에서 발생한 보상인지 추적할 수 있다.
- 재처리 요청이 중복으로 생성되지 않게 확인할 수 있다.

---

# 3. 진입 조건

## 3.1 진입 경로

| 이전 화면 | 진입 액션 |
|---|---|
| A15 보상 목록 | `상세` 클릭 |
| A02 대시보드 | 최근 발급 실패 또는 최근 보물 획득 클릭 |
| A02-1 최근 현황 테이블 | 보상 row 클릭 |
| A18 유저 상세 | 유저의 보상 내역 row 클릭 |
| A20 문의 상세 | 관련 보상 링크 클릭 |
| A21/A22 보안 로그 | 연관 보상 링크 클릭 |

## 3.2 Route

```txt
/admin/rewards/[rewardId]
```

Next.js App Router 권장 경로:

```txt
app/admin/(protected)/rewards/[rewardId]/page.tsx
```

## 3.3 접근 가능 Role

| Role | 접근 | 비고 |
|---|---:|---|
| super_admin | O | 조회, 내부 메모, 재처리 요청 가능 |
| operator | O | 조회, 내부 메모, 재처리 요청 가능 |
| viewer | O | 조회만 가능 |

viewer는 아래 기능이 불가능하다.

```txt
내부 메모 저장
재처리 요청 생성
재처리 요청 관련 액션
```

---

# 4. 화면 레이아웃

## 4.1 기본 구조

```txt
AdminLayout
→ 상단 헤더
→ 페이지 타이틀: 보상 상세
→ 우측 액션 버튼
   - 재처리 요청 이력
   - 재처리 요청 생성
→ 기본 정보 카드
→ 실패 사유 및 재시도 현황 카드
→ 연관 정보 카드
→ 내부 메모 카드
→ 재처리 요청 생성 모달
```

## 4.2 와이어프레임 기준 구성

```txt
┌──────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                    검색 권한 계정 │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ 보상 상세        [이력] [생성] │
│              │                               │
│              │ [기본 정보]                    │
│              │ 보상 ID / 상태 / 획득일시       │
│              │ 발급 요청일시 / 발급 완료일시   │
│              │ 외부 발급 요청 ID / 기한        │
│              │                               │
│              │ [실패 사유 및 재시도 현황]      │
│              │ 실패 코드 / 실패 사유           │
│              │ 실패 발생일시 / 사용자 재시도 횟수│
│              │ 최근 재처리 요청 상태 / 대기 시간│
│              │                               │
│              │ [연관 정보]                    │
│              │ 유저 / 보물상자 / 상품          │
│              │                               │
│              │ [내부 메모]                    │
│              │ textarea              [저장]    │
└──────────────┴───────────────────────────────┘
```

---

# 5. UI 구성 요소

## 5.1 상단 액션 영역

| 요소 | 노출 조건 | 동작 |
|---|---|---|
| 재처리 요청 이력 | 모든 role | 재처리 요청 이력 영역 또는 모달 표시 |
| 재처리 요청 생성 | super_admin, operator + `failed` 상태 | 재처리 요청 생성 모달 오픈 |

### 버튼 노출 규칙

```txt
reward.status = failed
AND latest_retry_request.status NOT IN pending, processing
AND role IN super_admin, operator
→ 재처리 요청 생성 버튼 노출
```

아래 조건에서는 버튼을 숨기거나 disabled 처리한다.

```txt
viewer role
reward.status != failed
이미 pending 재처리 요청 존재
이미 processing 재처리 요청 존재
reward.status = issued/used/expired/canceled/ready
```

---

## 5.2 기본 정보 카드

### 표시 항목

| 필드 | 설명 | 예시 |
|---|---|---|
| 보상 ID | 내부 보상 식별자 | `R-10042` |
| 상태 | 보상 상태 | `failed` |
| 획득일시 | 사용자가 보물을 획득한 시각 | `2026-07-26 14:20` |
| 발급 요청일시 | 쿠폰 발급 요청 시각 | `2026-07-26 14:21` |
| 발급 완료일시 | 발급 성공 시각 | 실패 상태는 `-` |
| 외부 발급 요청 ID | 기프티쇼비즈 발급 요청 추적 ID | `REQ-...` |
| 기한 | 보상 또는 쿠폰 유효 기한 | `2026-08-25 23:59` |

### 상태 배지

| 상태 | 표시 문구 | 설명 |
|---|---|---|
| ready | ready | 보상 수령권 생성, 쿠폰 발급 전 |
| issued | issued | 쿠폰 발급 완료 |
| failed | failed | 쿠폰 발급 실패 |
| used | used | 사용 완료 |
| expired | expired | 만료 |
| canceled | canceled | 지급 취소 |

중요:

```txt
processing은 보상 상태로 표시하지 않는다.
pending/processing은 reward_retry_requests의 요청 상태로만 표시한다.
```

---

## 5.3 실패 사유 및 재시도 현황 카드

이 영역은 `failed` 상태에서 가장 중요하게 노출한다.  
다른 상태에서도 조회는 가능하지만 실패 관련 필드가 없으면 `-`로 표시한다.

### 표시 항목

| 필드 | 설명 | 예시 |
|---|---|---|
| 실패 코드 | 서버 또는 외부 API 실패 코드 | `ERR_PROVIDER_TIMEOUT` |
| 실패 사유 | 사람이 읽을 수 있는 실패 설명 | `기프티쇼비즈 응답 시간 초과` |
| 실패 발생일시 | 실패 기록 시각 | `2026-07-26 14:22` |
| 사용자 재시도 횟수 | 사용자 앱에서 다시 시도한 횟수 | `2` |
| 최근 재처리 요청 상태 | 관리자 재처리 요청의 최신 상태 | `pending` |
| 대기 경과 시간 | 최근 요청 후 지난 시간 | `12분` |

### 실패 코드 예시

```txt
ERR_PROVIDER_TIMEOUT
ERR_PROVIDER_BALANCE_LOW
ERR_PROVIDER_INVALID_PRODUCT
ERR_PROVIDER_DUPLICATED_REQUEST
ERR_INTERNAL_SERVER
ERR_UNKNOWN
```

실패 코드는 DB/API 값 그대로 노출하되, 실패 사유는 관리자용으로 이해 가능한 문구를 함께 표시한다.

---

## 5.4 연관 정보 카드

### 표시 항목

| 영역 | 표시 정보 | 이동 |
|---|---|---|
| 유저 | 유저 ID, 닉네임, 상태, 아바타 fallback | `/admin/users/[userId]` |
| 보물상자 | 보물상자 ID, 보물명 | `/admin/treasures/[treasureId]` |
| 상품 | 상품 ID, 상품명, 브랜드 | `/admin/products/[productId]` |

### 유저 정보 노출 제한

```txt
사용자 이메일은 표시하지 않는다.
전화번호를 표시하지 않는다.
소셜 provider 식별자는 표시하지 않는다.
관리자 운영에 필요한 user_id, nickname, status만 표시한다.
```

---

## 5.5 내부 메모 카드

### 기능

운영자가 보상 처리 과정에서 참고할 내부 메모를 작성한다.

| 요소 | 설명 |
|---|---|
| textarea | 내부 메모 입력 |
| 메모 저장 버튼 | 입력한 메모 저장 |
| 기존 메모 | 있으면 textarea에 표시 |

### 권한

| Role | 메모 조회 | 메모 저장 |
|---|---:|---:|
| super_admin | O | O |
| operator | O | O |
| viewer | O | X |

### 검증

```txt
최대 1,000자
빈 값 저장 가능 여부는 정책 선택
저장 성공 시 toast 표시
저장 실패 시 오류 메시지 표시
```

---

# 6. 재처리 요청 생성 모달

## 6.1 모달 개요

`failed` 상태 보상에 대해 관리자 재처리 요청을 생성하는 확인 모달이다.

이 모달은 기프티쇼비즈 API를 직접 호출하지 않는다.  
저장 시 `reward_retry_requests` 레코드를 생성하고, 이후 Worker가 비동기로 처리한다.

## 6.2 모달 레이아웃

```txt
딤드 배경
→ 중앙 모달
   → 타이틀: 재처리 요청 생성
   → 안내 문구
   → 재처리 사유 input
   → 내부 메모 textarea
   → 취소 버튼
   → 요청 생성 버튼
```

## 6.3 안내 문구

```txt
failed 상태의 보상에 대해 재처리 요청을 생성합니다.
동일 보상에 pending 요청이 있으면 중복 생성이 차단됩니다.
```

## 6.4 입력 필드

| 필드 | 필수 | 검증 | 설명 |
|---|---:|---|---|
| 재처리 사유 | O | 2~100자 | 요청 생성 사유 |
| 내부 메모 | X | 최대 1,000자 | 추가 운영 메모 |

## 6.5 버튼

| 버튼 | 동작 |
|---|---|
| 취소 | 모달 닫기 |
| 요청 생성 | 검증 후 재처리 요청 생성 |

## 6.6 생성 가능 조건

```txt
reward.status = failed
latest_retry_request.status NOT IN pending, processing
role IN super_admin, operator
```

## 6.7 생성 차단 조건

| 조건 | 처리 |
|---|---|
| reward.status != failed | 요청 생성 불가 안내 |
| pending 요청 존재 | 중복 요청 불가 안내 |
| processing 요청 존재 | 처리 중 안내 |
| 권한 없음 | 버튼 숨김 또는 A24 접근 제한 |
| 서버 오류 | 입력값 유지 + 오류 표시 |

---

# 7. 재처리 요청 이력

## 7.1 노출 방식

와이어프레임 기준 상단의 `재처리 요청 이력` 버튼으로 접근한다.

MVP에서는 아래 중 하나로 구현한다.

```txt
옵션 A: 현재 화면 하단에 이력 테이블 확장
옵션 B: 우측 drawer
옵션 C: 모달
```

개발 난이도를 고려하면 MVP는 `모달` 또는 `현재 화면 하단 확장`을 권장한다.

## 7.2 이력 테이블 컬럼

| 컬럼 | 설명 |
|---|---|
| 요청 ID | 재처리 요청 ID |
| 요청 상태 | pending / processing / succeeded / failed / canceled |
| 요청 사유 | 관리자 입력 사유 |
| 요청자 | 관리자명 또는 관리자 ID |
| 요청일시 | 생성 시각 |
| 처리 완료일시 | 완료 시각 |
| 결과 메시지 | 성공/실패 결과 |

## 7.3 재처리 요청 상태

```ts
export type RewardRetryRequestStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';
```

---

# 8. 데이터 모델 기준

## 8.1 rewards

```ts
export type RewardStatus =
  | 'ready'
  | 'issued'
  | 'failed'
  | 'used'
  | 'expired'
  | 'canceled';
```

권장 필드:

```ts
export interface AdminRewardDetail {
  id: string;
  status: RewardStatus;
  user_id: string;
  treasure_id: string;
  product_id: string;
  claimed_at: string | null;
  issue_requested_at: string | null;
  issued_at: string | null;
  expires_at: string | null;
  external_request_id: string | null;
  failure_code: string | null;
  failure_reason: string | null;
  failed_at: string | null;
  user_retry_count: number;
  internal_memo: string | null;
  created_at: string;
  updated_at: string;
}
```

## 8.2 reward_retry_requests

```ts
export interface RewardRetryRequest {
  id: string;
  reward_id: string;
  status: RewardRetryRequestStatus;
  reason: string;
  internal_memo: string | null;
  requested_by_admin_id: string;
  result_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}
```

---

# 9. API 연동 기준

## 9.1 상세 조회

```txt
GET /api/admin/rewards/{rewardId}
```

응답 포함 정보:

```txt
reward detail
user summary
 treasure summary
product summary
latest retry request
retry request count
```

금지 응답:

```txt
coupon_code
barcode
barcode_raw
coupon_pin
masked_coupon_code
user_email
provider_access_token
giftishow_secret
```

## 9.2 내부 메모 저장

```txt
PATCH /api/admin/rewards/{rewardId}/memo
```

요청:

```json
{
  "internal_memo": "사용자 문의 대응 예정"
}
```

## 9.3 재처리 요청 생성

```txt
POST /api/admin/rewards/{rewardId}/retry-requests
```

요청:

```json
{
  "reason": "기프티쇼비즈 타임아웃으로 인한 재처리",
  "internal_memo": "동일 요청 중복 여부 확인 완료"
}
```

서버 처리:

```txt
1. 관리자 role 재검증
2. reward.status = failed 확인
3. pending/processing 요청 중복 확인
4. reward_retry_requests row 생성
5. 운영 로그 기록
6. Worker가 비동기 처리
```

---

# 10. 상태별 화면 처리

| 상태 | 상세 표시 | 재처리 요청 생성 | 비고 |
|---|---|---:|---|
| ready | O | X | 쿠폰 발급 전 |
| issued | O | X | 쿠폰 발급 완료, 코드 미노출 |
| failed | O | O | pending/processing 중복 없을 때 가능 |
| used | O | X | 사용 완료 |
| expired | O | X | 만료 |
| canceled | O | X | 지급 취소 |

---

# 11. 오류 상태

## 11.1 보상 없음

조건:

```txt
rewardId가 존재하지 않음
삭제 또는 접근 불가능한 데이터
```

처리:

```txt
보상 정보를 찾을 수 없습니다.
목록으로 돌아가서 다시 확인해주세요.
[보상 목록으로]
```

## 11.2 조회 실패

처리:

```txt
보상 정보를 불러오는 중 오류가 발생했습니다.
[다시 시도]
```

## 11.3 재처리 요청 생성 실패

처리:

```txt
재처리 요청을 생성하지 못했습니다.
잠시 후 다시 시도해주세요.
```

입력값은 유지한다.

## 11.4 권한 없음

상세 화면 직접 접근 권한이 없을 경우:

```txt
/admin/access-denied
```

단, viewer는 보상 상세 조회가 가능하므로 일반적으로 A16 접근은 허용한다.

---

# 12. 보안 정책

```txt
쿠폰 번호와 바코드는 CMS에 절대 노출하지 않는다.
사용자 이메일은 CMS에서 조회·표시하지 않는다.
재처리 요청은 CMS 브라우저에서 외부 API를 직접 호출하지 않는다.
모든 액션은 서버에서 role을 재검증한다.
재처리 요청 생성과 내부 메모 저장은 운영 로그에 기록한다.
실패 코드와 외부 요청 ID는 운영 추적용으로만 사용한다.
```

---

# 13. 권한별 UI 정책

| 요소 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 보상 상세 조회 | O | O | O |
| 재처리 요청 이력 조회 | O | O | O |
| 재처리 요청 생성 | O | O | X |
| 내부 메모 조회 | O | O | O |
| 내부 메모 저장 | O | O | X |
| 유저 상세 이동 | O | O | O |
| 보물 상세 이동 | O | O | O |
| 상품 상세 이동 | O | O | O |

viewer 화면 처리:

```txt
재처리 요청 생성 버튼 숨김
메모 저장 버튼 숨김
textarea는 readOnly 또는 단순 텍스트로 표시
```

---

# 14. 프론트엔드 구현 기준

## 14.1 권장 컴포넌트

```txt
AdminPageHeader
AdminSectionCard
AdminStatusBadge
AdminInfoGrid
AdminRelationCard
AdminTextarea
AdminButton
AdminDialog
RewardRetryRequestDialog
RewardRetryHistoryDialog
```

## 14.2 상태 관리

| 구분 | 권장 방식 |
|---|---|
| 상세 조회 | TanStack Query |
| 메모 저장 | Mutation |
| 재처리 요청 생성 | Mutation |
| 모달 열림 상태 | React state |
| 권한 분기 | 서버 세션 + role context |

## 14.3 로딩 Skeleton

```txt
기본 정보 카드 skeleton
실패 사유 카드 skeleton
연관 정보 카드 skeleton
내부 메모 textarea skeleton
```

---

# 15. QA 체크리스트

## 15.1 조회

- [ ] rewardId로 상세 조회가 된다.
- [ ] 존재하지 않는 rewardId는 오류 상태를 표시한다.
- [ ] ready/issued/failed/used/expired/canceled 상태가 정상 표시된다.
- [ ] processing이 보상 상태로 표시되지 않는다.
- [ ] 쿠폰 번호와 바코드가 표시되지 않는다.
- [ ] 사용자 이메일이 표시되지 않는다.

## 15.2 재처리 요청

- [ ] failed 상태에서만 재처리 요청 버튼이 보인다.
- [ ] viewer에게는 재처리 요청 버튼이 보이지 않는다.
- [ ] pending 요청이 있으면 중복 생성이 차단된다.
- [ ] processing 요청이 있으면 중복 생성이 차단된다.
- [ ] 재처리 사유가 없으면 저장되지 않는다.
- [ ] 요청 생성 후 이력에 pending 상태가 표시된다.
- [ ] 요청 생성 후 reward.status는 failed로 유지된다.

## 15.3 내부 메모

- [ ] super_admin은 메모 저장이 가능하다.
- [ ] operator는 메모 저장이 가능하다.
- [ ] viewer는 메모 저장이 불가능하다.
- [ ] 메모 저장 실패 시 입력값이 유지된다.

## 15.4 연관 이동

- [ ] 유저 상세 링크가 정상 이동한다.
- [ ] 보물상자 상세 링크가 정상 이동한다.
- [ ] 상품 상세 링크가 정상 이동한다.

## 15.5 보안

- [ ] API 응답에 쿠폰 원문이 포함되지 않는다.
- [ ] API 응답에 바코드 값이 포함되지 않는다.
- [ ] API 응답에 사용자 이메일이 포함되지 않는다.
- [ ] 재처리 요청 생성 시 서버에서 role을 재검증한다.

---

# 16. 개발 메모

```txt
A16은 쿠폰 발급을 직접 처리하는 화면이 아니다.
A16은 실패 원인 확인과 재처리 요청 생성 화면이다.
재처리 요청 생성 이후 실제 발급 재시도는 Worker가 처리한다.
failed 보상은 재처리 요청 생성 후에도 failed 상태를 유지한다.
관리자 화면에서는 쿠폰 코드/바코드 조회 기능을 만들지 않는다.
```
