# A16-2. 재처리 요청 이력 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A16-2. 재처리 요청 이력 화면 정의서 |
| 파일명 | `A16_2_Admin_Reward_Retry_Request_History_Screen.md` |
| 화면명 | 재처리 요청 이력 |
| 화면 ID | `A16_2_Admin_Reward_Retry_Request_History_Screen` |
| 상위 도메인 | 보상 관리 |
| 관련 화면 | `A15_Admin_Reward_List_Screen`, `A16_Admin_Reward_Detail_Screen`, `A16_1_Admin_Reward_Retry_Request_Create_Popup` |
| 작성 목적 | 보상 발급 실패 후 생성된 재처리 요청 이력을 조회하고, 요청별 처리 결과를 확인하기 위한 관리자 CMS 화면 구현 기준 정의 |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |
| 권한 기준 | super_admin / operator 조회 가능, viewer 접근 불가 권장 |
| MVP 기준 | 재처리 요청 생성과 처리 이력 조회만 제공, CMS에서 기프티쇼비즈 API 직접 호출 금지 |

---

## 2. 화면 개요

재처리 요청 이력 화면은 `failed` 상태 보상에 대해 관리자가 생성한 재처리 요청의 전체 이력을 조회하는 화면이다.

이 화면에서는 재처리 요청의 상태, 대상 보상, 요청 사유, 처리 결과, 실패 코드, 요청자, 처리 시각 등을 확인한다.

중요한 기준은 다음과 같다.

```txt
보상 상태 reward.status는 failed를 유지한다.
재처리 진행 상태는 reward_retry_requests.status로 별도 관리한다.
processing은 보상 상태가 아니라 재처리 요청 상태에서만 사용한다.
CMS 화면은 기프티쇼비즈 API를 직접 호출하지 않는다.
재처리 Worker가 비동기로 외부 API를 호출하고 결과를 저장한다.
쿠폰 번호와 바코드는 화면에 표시하지 않는다.
사용자 이메일은 표시하지 않는다.
```

---

## 3. 화면 목적

### 3.1 관리자 관점 목적

- 실패 보상에 대해 생성된 재처리 요청 이력을 확인한다.
- 어떤 관리자가 어떤 사유로 재처리를 요청했는지 확인한다.
- Worker 처리 결과와 실패 원인을 확인한다.
- 동일 보상에 대한 중복 재처리 요청 여부를 파악한다.
- 운영 감사 및 고객 문의 대응에 필요한 근거를 확인한다.

### 3.2 시스템 관점 목적

- `reward_retry_requests` 테이블의 상태와 처리 결과를 조회한다.
- 보상 상태와 재처리 요청 상태를 분리해서 보여준다.
- 민감 정보 노출 없이 운영 판단에 필요한 정보만 제공한다.
- 처리 실패 시 재요청 가능 여부 판단 근거를 제공한다.

---

## 4. 진입 조건

### 4.1 진입 경로

| 이전 화면 | 진입 액션 |
|---|---|
| A16 보상 상세 | `재처리 요청 이력` 버튼 클릭 |
| A15 보상 목록 | 실패 보상 행의 이력 링크 클릭 가능 |
| A02-1 최근 발급 실패 | 발급 실패 항목 클릭 후 보상 상세 또는 이력으로 이동 가능 |

### 4.2 Route

권장 Route는 아래와 같다.

```txt
/admin/rewards/retry-requests
```

특정 보상 기준으로 진입할 경우 query parameter를 사용한다.

```txt
/admin/rewards/retry-requests?rewardId={reward_id}
```

특정 재처리 요청 상세를 바로 열 경우 query parameter를 사용한다.

```txt
/admin/rewards/retry-requests?retryRequestId={retry_request_id}
```

### 4.3 접근 가능 조건

```txt
관리자 세션 존재
admin.status = active
admin.role in ('super_admin', 'operator')
```

### 4.4 접근 제한 조건

| 조건 | 처리 |
|---|---|
| 세션 없음 | `/admin/login` 이동 |
| inactive 관리자 | 세션 무효화 후 `/admin/login` 이동 |
| viewer 접근 | A24 접근 권한 부족 화면 표시 |
| 권한 정보 없음 | A24 접근 권한 부족 화면 표시 |

---

## 5. 권한 정책

| 기능 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 재처리 요청 이력 목록 조회 | O | O | X |
| 재처리 요청 상세 팝업 조회 | O | O | X |
| CSV 내보내기 | O | O | X |
| 보상 상세 이동 | O | O | X |
| 유저 상세 이동 | O | O | X |
| 재처리 요청 생성 | O | O | X |
| Worker 직접 실행 | X | X | X |
| 쿠폰 번호·바코드 조회 | X | X | X |

viewer는 보상 목록과 상세 조회는 가능할 수 있으나, 재처리 요청 이력은 운영 로그 성격이 강하므로 MVP에서는 접근 불가로 둔다.

---

## 6. 화면 구조

와이어프레임 기준 화면 구성은 아래 순서로 확정한다.

```txt
AdminLayout
→ 상단 헤더
→ 화면 타이틀
→ 우측 CSV 내보내기 버튼
→ 필터 영역
→ 재처리 요청 이력 테이블
→ 페이지네이션
→ 재처리 요청 상세 팝업
```

---

## 7. UI 구성 요소

## 7.1 AdminLayout

### 구성

```txt
좌측 사이드바
상단 헤더
본문 콘텐츠 영역
```

### 사이드바 메뉴

현재 로그인한 관리자 role 기준으로 허용된 메뉴만 표시한다.

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

operator는 보안 로그와 관리자 메뉴를 보지 않는다.  
viewer는 이 화면에 접근할 수 없다.

---

## 7.2 상단 헤더

| 요소 | 설명 |
|---|---|
| 검색 입력 | 전역 검색 또는 현재 화면 검색 |
| 권한 표시 | 현재 관리자 role 표시 |
| 프로필 원형 | 관리자 이니셜 또는 기본 아바타 |

관리자 이메일은 상단에 필수로 노출하지 않는다.

---

## 7.3 화면 타이틀

| 요소 | 문구 |
|---|---|
| 타이틀 | `재처리 요청 이력` |
| 보조 설명 | `실패 보상에 대한 재처리 요청과 Worker 처리 결과를 확인합니다.` |

보조 설명은 화면 공간이 부족하면 생략 가능하다.

---

## 7.4 CSV 내보내기 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `CSV 내보내기` |
| 노출 권한 | super_admin, operator |
| viewer | 미노출 |
| 동작 | 현재 필터 조건 기준 CSV 다운로드 확인 팝업 표시 |
| 포함 금지 | 사용자 이메일, 쿠폰 번호, 바코드, 기프티쇼비즈 Secret |

CSV 내보내기 시 현재 검색어, 상태, 기간, 보상 ID 조건을 그대로 반영한다.

---

## 7.5 필터 영역

### 필터 구성

| 필터 | 타입 | 설명 |
|---|---|---|
| 검색어 | text input | 요청 ID, 대상 보상 ID, 외부 발급 요청 ID 검색 |
| 상태 | select | 재처리 요청 상태 |
| 기간 | date range | 요청 생성일 기준 |
| 보상 ID 검색 | text input | 특정 보상 ID 검색 |
| 초기화 | button | 전체 필터 초기화 |

### 검색 placeholder

```txt
요청 ID / 보상 ID / 외부 발급 요청 ID 검색
```

### 상태 옵션

```txt
전체
pending
processing
success
failed
canceled
```

### 기간 기준

```txt
created_at 기준
```

필요 시 P1 이후에는 `processed_at 기준`을 추가할 수 있다.

---

## 8. 테이블 정의

## 8.1 테이블 컬럼

| 순서 | 컬럼 | 표시 예시 | 설명 |
|---:|---|---|---|
| 1 | 요청 ID | `REQ-0041` | 재처리 요청 ID |
| 2 | 대상 보상 | `RWD-1023` | reward_id |
| 3 | 보물 | `강남역 보물` | 연결된 보물명 |
| 4 | 상품 | `스타벅스 아메리카노` | 연결된 상품명 |
| 5 | 상태 | `pending` | 재처리 요청 상태 |
| 6 | 생성 사유 | `사용자 재시도 실패` | 관리자가 선택/입력한 사유 |
| 7 | 처리 결과 | `success` / `failed` | Worker 처리 결과 |
| 8 | 생성자 | `admin01` | 요청 생성 관리자 |
| 9 | 생성 시각 | `2025-07-01 14:35` | 요청 생성 시각 |
| 10 | 상세 | `상세` | 상세 팝업 열기 |

### 표시 금지 컬럼

```txt
사용자 이메일
쿠폰 번호
바코드 원문
바코드 마스킹 값
기프티쇼비즈 Secret
외부 API 인증키
```

---

## 8.2 상태 배지

| 상태 | 의미 | UI |
|---|---|---|
| pending | 요청 생성 후 처리 대기 | 회색 배지 |
| processing | Worker 처리 중 | 파란색 또는 중립 배지 |
| success | 재처리 성공 | 성공 배지 |
| failed | 재처리 실패 | 오류 배지 |
| canceled | 요청 취소 | 비활성 배지 |

주의:

```txt
processing은 reward.status가 아니라 reward_retry_requests.status에서만 사용한다.
```

---

## 8.3 행 클릭 동작

| 액션 | 동작 |
|---|---|
| 행 클릭 | 재처리 요청 상세 팝업 열기 |
| 상세 링크 클릭 | 재처리 요청 상세 팝업 열기 |
| 대상 보상 클릭 | A16 보상 상세 화면 이동 |
| 유저 상세 보기 클릭 | A18 유저 상세 화면 이동 |
| 바깥 영역 클릭 | 팝업 닫기 여부는 정책에 따라 결정 |

---

## 9. 재처리 요청 상세 팝업

## 9.1 팝업 목적

재처리 요청 1건의 상세 정보를 확인하는 모달이다.

이 팝업은 조회 전용이며, 재처리 요청의 상태를 직접 변경하지 않는다.

---

## 9.2 팝업 레이아웃

```txt
딤드 배경
→ 중앙 상세 모달
   → 타이틀: 재처리 요청 상세
   → 기본 정보
   → 대상 보상 정보
   → 처리 결과
   → 생성 사유 및 메모
   → 닫기 버튼
```

---

## 9.3 팝업 기본 정보

| 항목 | 예시 |
|---|---|
| 요청 ID | `REQ-0034` |
| 상태 | `success` |
| 요청 시각 | `2025-07-01 14:22` |
| 처리 시각 | `2025-07-01 14:35` |
| 요청자 | `admin@catchcash.io` 또는 관리자명 |
| 처리 방식 | `worker` |

관리자 이메일 노출은 내부 운영 정책에 따라 관리자 계정 식별자로 대체 가능하다.

---

## 9.4 대상 보상 정보

| 항목 | 예시 |
|---|---|
| 보상 ID | `RWD-1023` |
| 유저 | `USR-202` |
| 보물 | `강남역 보물` |
| 상품 | `스타벅스 아메리카노` |
| 현재 보상 상태 | `failed` |
| 외부 발급 요청 ID | `EXT-REQ-9903` |

사용자 이메일은 표시하지 않는다.  
쿠폰 번호와 바코드는 표시하지 않는다.

---

## 9.5 처리 결과 영역

| 항목 | 예시 |
|---|---|
| 처리 결과 | `Worker 처리 결과` |
| success 상태 | `재처리 성공` |
| failed 상태 | `재처리 실패` |
| 실패 코드 | `ERR_PROVIDER_TIMEOUT` |
| 실패 사유 | `기프티쇼비즈 응답 지연` |
| 처리 소요 시간 | `약 13분` |
| 외부 발급 요청 ID | `EXT-REQ-9903` |

---

## 9.6 생성 사유 및 메모

| 항목 | 설명 |
|---|---|
| 생성 사유 | 재처리 요청 생성 시 입력한 필수 사유 |
| 내부 메모 | 선택 입력한 관리자 메모 |
| 비고 | viewer에게는 화면 자체가 노출되지 않음 |

---

## 9.7 팝업 버튼

| 버튼 | 동작 |
|---|---|
| 닫기 | 상세 팝업 닫기 |

수정, 삭제, 상태 변경 버튼은 제공하지 않는다.

---

## 10. 데이터 모델

## 10.1 reward_retry_requests

권장 필드는 아래와 같다.

```ts
type RewardRetryRequestStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'canceled';

type RewardRetryRequest = {
  id: string;
  reward_id: string;
  status: RewardRetryRequestStatus;
  reason: string;
  internal_memo?: string | null;

  previous_error_code?: string | null;
  previous_error_message?: string | null;

  worker_result?: 'success' | 'failed' | null;
  worker_error_code?: string | null;
  worker_error_message?: string | null;
  provider_request_id?: string | null;

  requested_by_admin_id: string;
  created_at: string;
  processing_started_at?: string | null;
  processed_at?: string | null;
};
```

---

## 10.2 연관 조회 데이터

테이블과 팝업 표시를 위해 서버에서 조인 또는 view 형태로 내려주는 것을 권장한다.

```ts
type RewardRetryRequestListItem = {
  retry_request_id: string;
  reward_id: string;
  reward_status: 'failed' | 'ready' | 'issued' | 'used' | 'expired' | 'canceled';
  treasure_id: string;
  treasure_title: string;
  product_id: string;
  product_name: string;
  user_public_id: string;
  retry_status: RewardRetryRequestStatus;
  reason: string;
  worker_result: 'success' | 'failed' | null;
  worker_error_code?: string | null;
  provider_request_id?: string | null;
  requested_by_admin_name: string;
  created_at: string;
  processed_at?: string | null;
};
```

---

## 11. API 연동 기준

## 11.1 목록 조회

```txt
GET /api/admin/rewards/retry-requests
```

### Query Parameters

| 파라미터 | 설명 |
|---|---|
| `q` | 요청 ID, 보상 ID, 외부 요청 ID 검색 |
| `status` | pending / processing / success / failed / canceled |
| `rewardId` | 특정 보상 ID |
| `from` | 생성일 시작 |
| `to` | 생성일 종료 |
| `page` | 페이지 |
| `pageSize` | 페이지당 개수 |
| `sort` | 정렬 기준 |

---

## 11.2 상세 조회

```txt
GET /api/admin/rewards/retry-requests/{retryRequestId}
```

---

## 11.3 CSV 내보내기

```txt
GET /api/admin/rewards/retry-requests/export.csv
```

현재 필터 조건을 query parameter로 함께 전달한다.

---

## 12. 정렬 및 페이지네이션

## 12.1 기본 정렬

```txt
created_at desc
```

최근 생성된 재처리 요청을 가장 위에 표시한다.

## 12.2 페이지네이션

| 항목 | 기준 |
|---|---|
| 기본 pageSize | 20 |
| 선택 가능 | 20 / 50 / 100 |
| 페이지 번호 | 1부터 시작 |
| 다음 버튼 | 다음 페이지 존재 시 활성화 |
| 이전 버튼 | 2페이지 이상부터 활성화 |

---

## 13. 상태별 화면

## 13.1 로딩 상태

```txt
테이블 skeleton 표시
필터 영역은 유지
```

## 13.2 검색 결과 없음

문구:

```txt
검색 결과 없음
입력한 조건과 일치하는 재처리 요청이 없습니다. 필터를 조정해 주세요.
```

버튼:

```txt
필터 초기화
```

## 13.3 목록 조회 실패

문구:

```txt
목록 조회 실패
재처리 요청 이력을 불러오는 중 오류가 발생했습니다.
```

버튼:

```txt
다시 시도
```

## 13.4 접근 권한 없음

문구:

```txt
접근 권한 없음
이 화면에 접근할 수 있는 권한이 없습니다. 관리자에게 문의하세요.
```

처리:

```txt
A24 접근 권한 부족 화면으로 이동하거나 현재 화면 내 오류 카드 표시
```

MVP에서는 A24 화면 이동을 권장한다.

---

## 14. 보안 정책

```txt
SUPABASE_SERVICE_ROLE_KEY는 브라우저에 노출하지 않는다.
기프티쇼비즈 Client Secret은 브라우저에 노출하지 않는다.
재처리 Worker는 서버/Edge Function에서만 실행한다.
CMS 화면은 외부 발급 API를 직접 호출하지 않는다.
쿠폰 번호와 바코드는 API 응답에 포함하지 않는다.
사용자 이메일은 조회·표시하지 않는다.
위험 액션은 서버에서 role을 재검증한다.
CSV에도 민감 정보를 포함하지 않는다.
```

---

## 15. 운영 로그 정책

재처리 요청 이력 화면에서 아래 행동은 운영 로그로 남긴다.

| 액션 | 로그 유형 |
|---|---|
| 목록 조회 | 필요 시 생략 가능 |
| 상세 조회 | 일반 운영 로그 |
| CSV 내보내기 | 민감 운영 로그 권장 |
| 보상 상세 이동 | 생략 가능 |
| 재처리 요청 생성 | A16-1에서 기록 |

CSV 내보내기는 운영 데이터 반출이므로 요청자, 필터 조건, 시각을 기록한다.

---

## 16. 와이어프레임 반영 기준

현재 와이어프레임에서 확인된 요소를 아래처럼 반영한다.

| 와이어프레임 요소 | MD 반영 |
|---|---|
| 재처리 요청 이력 타이틀 | 유지 |
| CSV 내보내기 버튼 | 유지 |
| 검색·상태·기간·보상 ID 필터 | 유지 |
| 이력 테이블 | 유지 |
| 페이지네이션 | 유지 |
| 재처리 요청 상세 모달 | 유지 |
| 기본 정보 카드 | 팝업 기본 정보로 정의 |
| 대상 보상 정보 카드 | 팝업 대상 보상 정보로 정의 |
| 처리 결과 카드 | 팝업 처리 결과로 정의 |
| 생성 사유 및 메모 | 유지 |
| 닫기 버튼 | 유지 |

---

## 17. QA 체크리스트

## 17.1 권한

- [ ] super_admin은 재처리 요청 이력 목록을 볼 수 있다.
- [ ] operator는 재처리 요청 이력 목록을 볼 수 있다.
- [ ] viewer는 이 화면에 접근할 수 없다.
- [ ] viewer가 직접 URL 접근 시 A24 접근 제한 화면으로 이동한다.
- [ ] CSV 내보내기는 viewer에게 노출되지 않는다.

## 17.2 목록

- [ ] 기본 정렬은 최신 요청순이다.
- [ ] 검색어로 요청 ID를 검색할 수 있다.
- [ ] 검색어로 보상 ID를 검색할 수 있다.
- [ ] 검색어로 외부 발급 요청 ID를 검색할 수 있다.
- [ ] 상태 필터가 정상 동작한다.
- [ ] 기간 필터가 created_at 기준으로 동작한다.
- [ ] 필터 초기화 시 기본 목록으로 돌아간다.
- [ ] 페이지네이션이 정상 동작한다.

## 17.3 상세 팝업

- [ ] 행 클릭 시 상세 팝업이 열린다.
- [ ] 기본 정보가 표시된다.
- [ ] 대상 보상 정보가 표시된다.
- [ ] 처리 결과가 표시된다.
- [ ] 생성 사유와 내부 메모가 표시된다.
- [ ] 닫기 버튼 클릭 시 팝업이 닫힌다.
- [ ] 팝업에서 쿠폰 번호와 바코드가 표시되지 않는다.
- [ ] 팝업에서 사용자 이메일이 표시되지 않는다.

## 17.4 오류 상태

- [ ] 검색 결과가 없을 때 빈 상태 카드가 표시된다.
- [ ] 목록 조회 실패 시 다시 시도 버튼이 표시된다.
- [ ] 권한 없는 접근 시 접근 제한 화면으로 이동한다.
- [ ] CSV 다운로드 실패 시 오류 토스트 또는 팝업이 표시된다.

---

## 18. 개발 메모

```txt
이 화면은 A16 보상 상세의 보조 화면이지만, 전체 재처리 요청 이력을 조회할 수 있으므로 독립 Route로 구현한다.
A16에서 rewardId를 query로 넘겨 특정 보상 기준 이력만 필터링할 수 있게 한다.
상세는 별도 페이지보다 모달을 우선한다.
재처리 요청 상태와 보상 상태를 반드시 분리한다.
```
