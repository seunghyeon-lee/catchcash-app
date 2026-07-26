# A16-1. 재처리 요청 생성 팝업 화면 정의서

> 문서 버전: `v1.0`  
> 작성일: `2026-07-26`  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 화면 ID: `A16_1_Admin_Reward_Retry_Request_Create_Popup`  
> 연결 화면: `A16_Admin_Reward_Detail_Screen`  
> 화면 유형: Modal / Dialog  
> 작성 목적: 바이브코딩을 위한 관리자 보상 재처리 요청 생성 팝업 구현 명세

---

# 1. 화면 개요

재처리 요청 생성 팝업은 `A16 보상 상세 화면`에서 관리자가 `재처리 요청 생성` 버튼을 클릭했을 때 노출되는 확인 및 입력 모달이다.

이 팝업은 `failed` 상태의 보상에 대해 재처리 요청 레코드를 생성하는 역할만 수행한다.

중요:

```txt
이 팝업은 기프티쇼비즈 API를 직접 호출하지 않는다.
이 팝업은 쿠폰 번호 또는 바코드를 표시하지 않는다.
이 팝업은 reward.status를 processing으로 변경하지 않는다.
재처리 요청 생성 후에도 reward.status는 failed 상태를 유지한다.
실제 재처리는 별도 Worker 또는 Edge Function에서 비동기로 처리한다.
```

---

# 2. 호출 위치

| 항목 | 내용 |
|---|---|
| 호출 화면 | `A16_Admin_Reward_Detail_Screen` |
| 호출 버튼 | `재처리 요청 생성` |
| 호출 가능 상태 | `reward.status = failed` |
| 호출 가능 권한 | `super_admin`, `operator` |
| 호출 불가 권한 | `viewer` |

---

# 3. 진입 조건

이 팝업은 아래 조건을 모두 만족할 때만 열 수 있다.

```txt
관리자 로그인 세션 존재
관리자 role = super_admin 또는 operator
reward.status = failed
reward.deleted_at 없음
동일 보상에 pending 또는 processing 상태의 재처리 요청이 없음
```

조건을 만족하지 않으면 팝업을 열지 않고 버튼을 비활성화하거나 안내 메시지를 표시한다.

---

# 4. 화면 목적

## 4.1 운영 목적

- 실패한 보상의 재처리 요청을 생성한다.
- 관리자가 재처리 사유를 명확히 남기도록 한다.
- 중복 재처리 요청 생성을 방지한다.
- 실제 쿠폰 재발급 또는 재시도 처리는 비동기 Worker로 분리한다.

## 4.2 사용자 영향

재처리 요청 생성은 사용자에게 즉시 쿠폰을 발급하는 액션이 아니다.

```txt
관리자 요청 생성
→ retry request pending 생성
→ Worker가 외부 발급 시스템 재시도
→ 성공 또는 실패 결과 저장
→ 사용자 앱 보상 상태 또는 알림에 반영
```

---

# 5. 화면 레이아웃

```txt
Dimmed Overlay
→ Center Modal
   → 타이틀: 재처리 요청 생성
   → 설명 문구
   → 재처리 사유 라벨
   → 재처리 사유 Select
   → 내부 메모 라벨
   → 내부 메모 Textarea
   → 하단 버튼 영역
      → 취소
      → 재처리 요청 생성
```

---

# 6. UI 구성 요소

## 6.1 Dimmed Overlay

| 항목 | 정의 |
|---|---|
| 배경 | `rgba(0, 0, 0, 0.55)` 또는 디자인 시안 기준 회색 dim |
| 위치 | 화면 전체 fixed |
| 역할 | 현재 화면 조작 차단 |
| 클릭 동작 | MVP에서는 배경 클릭 시 닫기 허용하지 않음 권장 |

배경 클릭으로 닫히면 입력 중인 사유가 사라질 수 있으므로, `취소` 버튼을 통해 닫는 방식을 권장한다.

---

## 6.2 모달 컨테이너

| 항목 | 정의 |
|---|---|
| 너비 | 360px ~ 420px |
| 배경 | white |
| Radius | 12px ~ 16px |
| Padding | 24px |
| 정렬 | 화면 중앙 |
| Shadow | 약한 그림자 허용 |

---

## 6.3 타이틀

| 항목 | 내용 |
|---|---|
| 문구 | `재처리 요청 생성` |
| 타입 | 코드 텍스트 |
| 스타일 | bold / 16px ~ 18px |

---

## 6.4 설명 문구

| 항목 | 내용 |
|---|---|
| 문구 | `현재 발급 실패 상태의 보상을 다시 처리하도록 요청합니다.` |
| 보조 문구 | `동일 보상에 pending 요청이 있으면 중복 생성이 차단됩니다.` |
| 타입 | 코드 텍스트 |

권장 문구:

```txt
현재 발급 실패 상태의 보상을 다시 처리하도록 요청합니다.
동일 보상에 진행 중인 요청이 있으면 중복 생성이 차단됩니다.
```

---

## 6.5 재처리 사유 Select

| 항목 | 정의 |
|---|---|
| 라벨 | `재처리 사유` |
| placeholder | `재처리 사유를 선택하세요` 또는 `Select...` |
| 필수 여부 | 필수 |
| 입력 방식 | Select / Dropdown |

### 재처리 사유 옵션

```ts
type RewardRetryReason =
  | 'provider_timeout'
  | 'provider_temporary_error'
  | 'manual_operator_request'
  | 'user_reported_issue'
  | 'data_correction'
  | 'other';
```

| 값 | 화면 표시 문구 | 설명 |
|---|---|---|
| `provider_timeout` | 외부 발급 시스템 응답 지연 | 기프티쇼비즈 또는 발급 함수 타임아웃 |
| `provider_temporary_error` | 외부 발급 시스템 일시 오류 | 일시적인 발급 실패로 판단되는 경우 |
| `manual_operator_request` | 운영자 수동 재처리 | 운영자가 직접 재처리가 필요하다고 판단한 경우 |
| `user_reported_issue` | 사용자 문의 기반 재처리 | 사용자 문의 또는 신고를 근거로 재처리하는 경우 |
| `data_correction` | 데이터 보정 후 재처리 | 상품/매칭/보상 데이터 수정 후 재처리하는 경우 |
| `other` | 기타 | 위 사유에 해당하지 않는 경우 |

---

## 6.6 내부 메모 Textarea

| 항목 | 정의 |
|---|---|
| 라벨 | `내부 메모` |
| 보조 라벨 | `추가 설명 또는 메모` |
| 필수 여부 | 선택 |
| 최소 길이 | 0자 |
| 최대 길이 | 500자 권장 |
| 노출 범위 | CMS 내부 관리자 전용 |

내부 메모는 사용자 앱에 노출하지 않는다.

---

# 7. 버튼 정책

## 7.1 취소 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `취소` |
| 스타일 | secondary / white |
| 동작 | 팝업 닫기 |
| 저장 여부 | 저장하지 않음 |

---

## 7.2 재처리 요청 생성 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `재처리 요청 생성` |
| 스타일 | primary / dark |
| 동작 | 재처리 요청 생성 API 호출 |
| 활성 조건 | 재처리 사유 선택 완료 |
| 로딩 상태 | 버튼 disabled + loading text |

### 버튼 상태

| 상태 | 처리 |
|---|---|
| 기본 | 활성 |
| 사유 미선택 | 비활성 |
| 요청 중 | disabled + `생성 중...` |
| 성공 | 팝업 닫기 + A16 재조회 |
| 실패 | 오류 메시지 표시 |

---

# 8. 처리 플로우

```txt
A16 보상 상세
→ 재처리 요청 생성 버튼 클릭
→ A16-1 팝업 오픈
→ 재처리 사유 선택
→ 내부 메모 선택 입력
→ 재처리 요청 생성 클릭
→ 서버 권한 재검증
→ reward.status = failed 검증
→ pending/processing 중복 요청 검증
→ reward_retry_requests row 생성
→ operation log 기록
→ 팝업 닫기
→ A16 보상 상세 재조회
```

---

# 9. 서버 처리 기준

## 9.1 생성 대상 테이블

```txt
reward_retry_requests
```

## 9.2 생성 필드 예시

```ts
type RewardRetryRequestCreateInput = {
  reward_id: string;
  reason: RewardRetryReason;
  admin_note?: string;
};
```

## 9.3 저장 데이터 예시

```ts
type RewardRetryRequest = {
  id: string;
  reward_id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  reason: RewardRetryReason;
  admin_note: string | null;
  requested_by_admin_id: string;
  requested_at: string;
  processed_at: string | null;
  result_message: string | null;
};
```

중요:

```txt
retry request의 status에는 processing을 사용할 수 있다.
reward.status에는 processing을 사용하지 않는다.
```

---

# 10. 권한 정책

| 역할 | 팝업 열기 | 요청 생성 | 메모 입력 | 조회 |
|---|---:|---:|---:|---:|
| super_admin | O | O | O | O |
| operator | O | O | O | O |
| viewer | X | X | X | O |

viewer는 A16 보상 상세 조회는 가능하지만, 재처리 요청 생성 버튼을 볼 수 없거나 비활성 상태로 본다.

권장:

```txt
viewer에게는 재처리 요청 생성 버튼을 노출하지 않는다.
직접 API 호출 시 서버에서 403을 반환한다.
```

---

# 11. 검증 규칙

## 11.1 클라이언트 검증

| 항목 | 검증 |
|---|---|
| 재처리 사유 | 필수 선택 |
| 내부 메모 | 500자 이하 |
| 중복 클릭 | 요청 중 버튼 disabled |

## 11.2 서버 검증

| 항목 | 검증 |
|---|---|
| 관리자 세션 | 필수 |
| 관리자 role | super_admin/operator만 허용 |
| 보상 상태 | failed만 허용 |
| 중복 요청 | pending/processing 존재 시 차단 |
| reward_id | 존재하는 보상만 허용 |

---

# 12. 오류 상태

| 상황 | 메시지 | 처리 |
|---|---|---|
| 사유 미선택 | `재처리 사유를 선택하세요.` | 필드 오류 |
| 권한 없음 | `재처리 요청을 생성할 권한이 없습니다.` | 팝업 닫기 또는 A24 이동 |
| 보상 상태 불일치 | `failed 상태의 보상만 재처리 요청을 생성할 수 있습니다.` | 생성 차단 |
| 중복 요청 존재 | `이미 진행 중인 재처리 요청이 있습니다.` | 생성 차단 |
| 서버 오류 | `재처리 요청 생성 중 오류가 발생했습니다.` | 팝업 유지 + 재시도 가능 |

---

# 13. 성공 후 처리

재처리 요청 생성 성공 시 다음 처리를 수행한다.

```txt
팝업 닫기
A16 보상 상세 데이터 재조회
최근 재처리 요청 상태를 pending으로 표시
재처리 요청 이력 영역 갱신
성공 토스트 표시
```

권장 토스트 문구:

```txt
재처리 요청을 생성했습니다.
```

---

# 14. 운영 로그

재처리 요청 생성 시 일반 운영 로그를 남긴다.

```ts
type OperationLogAction = 'reward_retry_requested';
```

기록 항목:

```txt
admin_id
reward_id
retry_request_id
reason
created_at
ip_address
user_agent
```

민감 정보는 기록하지 않는다.

금지:

```txt
쿠폰 번호
바코드 원문
사용자 이메일
기프티쇼비즈 secret
```

---

# 15. 접근성 기준

| 항목 | 기준 |
|---|---|
| Dialog role | `role="dialog"` |
| Modal 속성 | `aria-modal="true"` |
| 제목 연결 | `aria-labelledby` |
| 설명 연결 | `aria-describedby` |
| ESC 키 | 팝업 닫기 허용 가능 |
| Focus trap | 모달 내부 포커스 고정 |
| 초기 포커스 | 재처리 사유 select |

---

# 16. 개발 컴포넌트 권장 구조

```txt
components/admin/rewards/
  RewardRetryRequestDialog.tsx
  RewardRetryReasonSelect.tsx
  RewardRetryRequestForm.tsx
```

권장 Props:

```ts
type RewardRetryRequestDialogProps = {
  rewardId: string;
  rewardStatus: 'failed' | string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
```

---

# 17. QA 체크리스트

| 항목 | 확인 |
|---|---|
| failed 상태 보상에서만 버튼이 노출되는가 |  |
| viewer에게 버튼이 숨김 처리되는가 |  |
| 재처리 사유 미선택 시 생성 버튼이 비활성화되는가 |  |
| 내부 메모 500자 초과 시 저장이 차단되는가 |  |
| pending 요청이 이미 있으면 중복 생성이 차단되는가 |  |
| 요청 생성 후 reward.status가 failed로 유지되는가 |  |
| 요청 생성 후 retry request status가 pending으로 생성되는가 |  |
| 팝업 닫기 후 A16 상세가 재조회되는가 |  |
| 쿠폰 번호·바코드·사용자 이메일이 노출되지 않는가 |  |
| 서버에서도 권한 검증이 이루어지는가 |  |
