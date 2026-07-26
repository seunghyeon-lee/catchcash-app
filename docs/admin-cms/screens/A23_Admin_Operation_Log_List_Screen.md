# A23. 운영 로그 목록 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A23. 운영 로그 목록 화면 정의서 |
| 파일명 | `A23_Admin_Operation_Log_List_Screen.md` |
| 화면명 | 운영 로그 목록 |
| 화면 ID | `A23_Admin_Operation_Log_List_Screen` |
| 상위 도메인 | 운영 로그 관리 |
| 관련 화면 | `A02_Admin_Dashboard_Screen`, `A19_Admin_Inquiry_List_Screen`, `A20_Admin_Inquiry_Detail_Screen`, `A21_Admin_Security_Log_List_Screen`, `A24_Admin_Access_Denied_Screen` |
| 작성 목적 | 관리자 CMS에서 일반 운영 로그와 민감 운영 로그를 조회하고, 권한에 따라 접근 범위를 분리하기 위한 화면 구현 기준 정의 |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |
| 권한 기준 | super_admin / operator |
| MVP 기준 | 운영 로그는 조회 전용, 로그 수정·삭제 불가 |

---

## 2. 화면 개요

운영 로그 목록 화면은 관리자 CMS에서 발생한 주요 운영 행위를 조회하는 화면이다.

이 화면에서는 상품 등록, 보물 수정, 매칭 교체, 문의 답변, 유저 메모 저장, CSV 내보내기 같은 관리자 액션 이력을 확인한다.

운영 로그는 크게 두 종류로 구분한다.

```txt
일반 로그
민감 로그
```

중요:

```txt
운영 로그는 조회 전용이다.
운영 로그는 수정하거나 삭제하지 않는다.
일반 로그는 super_admin과 operator가 조회할 수 있다.
민감 로그는 super_admin만 조회할 수 있다.
viewer는 운영 로그 메뉴에 접근할 수 없다.
사용자 이메일, 쿠폰 번호, 바코드는 표시하지 않는다.
```

---

## 3. 화면 목적

### 3.1 관리자 목적

- 관리자 CMS에서 발생한 주요 운영 액션을 확인한다.
- 누가, 언제, 어떤 리소스에 어떤 변경을 했는지 추적한다.
- 민감 액션과 일반 액션을 구분해서 조회한다.
- CSV 내보내기, 유저 정지, 보안 로그 조회 같은 민감 행위를 추적한다.
- 운영 이슈 발생 시 변경 이력을 확인한다.

### 3.2 시스템 목적

- 관리자 액션에 대한 감사 추적성을 확보한다.
- 보안 로그와 운영 로그를 분리한다.
- 민감 로그 접근 권한을 super_admin으로 제한한다.
- 로그 데이터의 무결성을 유지한다.

---

## 4. 운영 로그와 보안 로그의 차이

| 구분 | 운영 로그 | 보안 로그 |
|---|---|---|
| 목적 | 관리자 운영 행위 추적 | 부정 사용·보안 이벤트 조사 |
| 예시 | 상품 등록, 문의 답변, 상태 변경 | 위치 검증 실패, 비정상 접근 |
| 접근 권한 | 일반: super_admin/operator, 민감: super_admin | super_admin 전용 |
| 화면 | A23 | A21/A22 |
| 직접 액션 | 없음 | 없음 |

---

## 5. 진입 조건

### 5.1 진입 경로

| 이전 화면 | 진입 액션 |
|---|---|
| AdminLayout 사이드바 | `운영 로그` 메뉴 클릭 |
| A02 운영 대시보드 | 운영 로그 빠른 링크 클릭 가능 |
| 각 상세 화면 | 처리 이력 확인 목적의 링크로 이동 가능 |
| A24 접근 권한 부족 | 권한 부족 후 대시보드 이동 가능 |

### 5.2 Route

```txt
/admin/operation-logs
```

로그 유형 탭을 query로 받을 수 있다.

```txt
/admin/operation-logs?logType=normal
/admin/operation-logs?logType=sensitive
```

특정 리소스 기준 조회:

```txt
/admin/operation-logs?resourceType=inquiry&resourceId=INQ-1024
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/operation-logs/page.tsx
```

---

## 6. 접근 권한

### 6.1 접근 가능 조건

```txt
관리자 세션 존재
admin.status = active
admin.role in ('super_admin', 'operator')
```

viewer는 운영 로그 화면에 접근할 수 없다.

---

## 6.2 권한 매트릭스

| 기능 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 일반 로그 조회 | O | O | X |
| 민감 로그 조회 | O | X | X |
| 검색·필터 | O | O | X |
| CSV 내보내기 | O | O, 일반 로그만 | X |
| 민감 로그 CSV 내보내기 | O | X | X |
| 로그 상세 이동 | P1 | P1 | X |
| 로그 수정 | X | X | X |
| 로그 삭제 | X | X | X |

---

## 7. 접근 제한 처리

operator가 민감 로그 탭을 선택하면 접근 권한 없음 팝업을 표시한다.

### 팝업 문구

```txt
접근 권한 없음
민감 운영 로그는 super_admin만 조회할 수 있습니다.
현재 계정의 역할로는 이 메뉴에 접근할 수 없습니다.
권한이 필요하면 super_admin에게 문의하세요.
```

### 버튼

| 버튼 | 동작 |
|---|---|
| 닫기 | 팝업 닫기 |
| 대시보드로 | `/admin` 이동, 선택 사항 |

viewer가 직접 URL로 접근하면 A24 접근 권한 부족 화면으로 이동한다.

---

## 8. 화면 구조

와이어프레임 기준 화면 구성은 아래 순서로 확정한다.

```txt
AdminLayout
→ 상단 헤더
→ 화면 타이틀
→ 로그 유형 탭
→ 검색 및 필터 영역
→ 운영 로그 테이블
→ 페이지네이션
→ CSV 내보내기 버튼
→ 접근 권한 없음 팝업
```

---

## 9. UI 구성 요소

## 9.1 AdminLayout

### 구성

```txt
좌측 사이드바
상단 헤더
본문 콘텐츠 영역
```

### 사이드바 메뉴 노출

| 역할 | 운영 로그 메뉴 |
|---|---|
| super_admin | 노출 |
| operator | 노출 |
| viewer | 미노출 |

---

## 9.2 화면 타이틀

| 요소 | 문구 |
|---|---|
| 타이틀 | `운영 로그` |

---

## 9.3 로그 유형 탭

### 탭 구성

| 탭 | 값 | 접근 권한 |
|---|---|---|
| 일반 로그 | `normal` | super_admin, operator |
| 민감 로그 | `sensitive` | super_admin |

### 탭 정책

```txt
super_admin은 일반 로그와 민감 로그 탭 모두 볼 수 있다.
operator는 일반 로그 탭만 볼 수 있다.
operator에게 민감 로그 탭을 보여줄 경우 클릭 시 접근 권한 없음 팝업을 표시한다.
viewer는 화면 자체에 접근할 수 없다.
```

MVP 권장:

```txt
operator에게는 민감 로그 탭을 숨긴다.
직접 URL 접근 시 접근 권한 없음 팝업 또는 A24를 표시한다.
```

---

## 9.4 CSV 내보내기 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `CSV 내보내기` |
| super_admin | 일반/민감 로그 모두 가능 |
| operator | 일반 로그만 가능 |
| viewer | 미노출 |
| 동작 | 현재 필터 조건 기준 CSV 다운로드 확인 팝업 표시 |
| 포함 금지 | 사용자 이메일, 쿠폰 번호, 바코드, API Secret, 토큰 |

CSV 내보내기 자체도 운영 로그로 기록한다.

---

## 10. 검색 및 필터 영역

## 10.1 필터 구성

| 필터 | 타입 | 설명 |
|---|---|---|
| 검색어 | text input | 로그 ID, 관리자 ID, 대상 리소스 ID 검색 |
| 기간 | date/select | 발생 시각 기준 |
| 이벤트 유형 | select | 액션 유형 |
| 실행자 | select/text | 관리자 ID 또는 이름 |
| 대상 리소스 | select | 리소스 유형 |
| 정렬 | select | 정렬 기준 |

### 검색 placeholder

```txt
로그 ID, 관리자 ID, 대상 리소스 ID 검색
```

---

## 10.2 기간 필터

| 옵션 | 값 |
|---|---|
| 전체 | `all` |
| 오늘 | `today` |
| 최근 7일 | `last_7_days` |
| 최근 30일 | `last_30_days` |
| 직접 선택 | `custom` |

기준은 로그 발생 시각 `created_at`이다.

---

## 10.3 이벤트 유형 필터

운영 로그 이벤트 유형은 도메인별로 관리한다.

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 전체 이벤트 |
| 보물 생성 | `treasure_created` | 보물상자 생성 |
| 보물 수정 | `treasure_updated` | 보물상자 수정 |
| 보물 삭제 | `treasure_deleted` | 보물상자 삭제 |
| 보물 복구 | `treasure_restored` | 보물상자 복구 |
| 상품 생성 | `product_created` | 상품 생성 |
| 상품 수정 | `product_updated` | 상품 수정 |
| 상품 상태 변경 | `product_status_changed` | active/inactive 변경 |
| 매칭 생성 | `mapping_created` | 보물-상품 매칭 생성 |
| 매칭 교체 | `mapping_replaced` | 기존 매칭 비활성 + 신규 매칭 |
| 매칭 비활성화 | `mapping_deactivated` | 매칭 비활성화 |
| 보상 재처리 요청 | `reward_retry_requested` | 재처리 요청 생성 |
| 문의 답변 저장 | `inquiry_answer_saved` | 문의 답변 저장 |
| 문의 상태 변경 | `inquiry_status_changed` | 문의 상태 변경 |
| 내부 메모 저장 | `internal_memo_saved` | 내부 메모 저장 |
| 유저 정지 | `user_suspended` | 유저 정지 |
| 유저 정지 해제 | `user_unsuspended` | 유저 정지 해제 |
| CSV 내보내기 | `csv_exported` | 데이터 내보내기 |
| 관리자 로그인 | `admin_login` | 관리자 로그인 성공 |
| 관리자 로그인 실패 | `admin_login_failed` | 관리자 로그인 실패 |

---

## 10.4 실행자 필터

관리자 계정을 기준으로 필터링한다.

```txt
admin_id
admin_name
```

실행자가 삭제된 관리자일 경우에도 로그에는 당시 관리자 식별자를 유지한다.

---

## 10.5 대상 리소스 필터

| 라벨 | 값 |
|---|---|
| 전체 | `all` |
| 보물상자 | `treasure` |
| 상품 | `product` |
| 매칭 | `mapping` |
| 보상 | `reward` |
| 유저 | `user` |
| 문의 | `inquiry` |
| 관리자 | `admin` |
| CSV | `csv_export` |
| 시스템 | `system` |

---

## 10.6 정렬 옵션

| 라벨 | 값 |
|---|---|
| 최근 발생순 | `created_desc` |
| 오래된 발생순 | `created_asc` |
| 민감도 높은 순 | `sensitivity_desc` |
| 이벤트 유형순 | `event_type_asc` |

기본 정렬은 `created_desc`를 권장한다.

---

## 11. 테이블 정의

## 11.1 테이블 컬럼

| 순서 | 컬럼 | 예시 | 설명 |
|---:|---|---|---|
| 1 | 발생 시각 | `2025-07-26 14:22` | 로그 발생 시각 |
| 2 | 이벤트 유형 | `inquiry_answer_saved` | 운영 액션 유형 |
| 3 | 민감도 | `normal` / `sensitive` | 로그 민감도 |
| 4 | 실행자 | `admin_02` | 액션 수행 관리자 |
| 5 | 대상 리소스 | `INQ-1024` | 대상 리소스 유형/ID |
| 6 | 변경 요약 | `문의 답변 저장` | 변경 내용 요약 |
| 7 | 결과 | `success` / `failed` | 처리 결과 |

### 표시 금지 컬럼

```txt
사용자 이메일
쿠폰 번호
바코드 원문
바코드 마스킹 값
기프티쇼비즈 Secret
Supabase service role key
OAuth token
```

---

## 11.2 민감도 분류

| 민감도 | 설명 | 예시 |
|---|---|---|
| normal | 일반 운영 행위 | 상품 수정, 문의 답변, 메모 저장 |
| sensitive | 민감 운영 행위 | 유저 정지, CSV 내보내기, 보안 로그 조회, 관리자 권한 변경 |

---

## 11.3 결과 표시

| 결과 | 의미 |
|---|---|
| success | 액션 성공 |
| failed | 액션 실패 |
| blocked | 권한 또는 정책으로 차단 |
| pending | 비동기 처리 대기, 필요 시 |

---

## 11.4 행 클릭 동작

MVP에서는 운영 로그 상세 화면을 별도로 두지 않는다.

| 액션 | 동작 |
|---|---|
| 대상 리소스 클릭 | 관련 상세 화면으로 이동 |
| 행 클릭 | P1에서 상세 팝업 또는 상세 페이지 검토 |
| 변경 요약 클릭 | P1에서 상세 팝업 검토 |

대상 리소스별 이동 예시:

```txt
treasure → /admin/treasures/{treasureId}
product → /admin/products/{productId}
mapping → /admin/mappings?mappingId={mappingId}
reward → /admin/rewards/{rewardId}
user → /admin/users/{userId}
inquiry → /admin/inquiries/{inquiryId}
```

---

## 12. 페이지네이션

| 항목 | 기준 |
|---|---|
| 기본 pageSize | 20 |
| 선택 가능 | 20 / 50 / 100 |
| 페이지 번호 | 1부터 시작 |
| 기본 정렬 | 최근 발생순 |

와이어프레임 기준 페이지네이션은 아래 형태를 따른다.

```txt
총 284건 1 2 3 4 5 다음
```

---

## 13. 상태별 화면

## 13.1 로딩 상태

```txt
필터 영역 유지
테이블 skeleton 표시
CSV 버튼 disabled
```

---

## 13.2 검색 결과 없음

문구:

```txt
검색 결과 없음
조건과 일치하는 운영 로그가 없습니다. 필터를 조정해 주세요.
```

버튼:

```txt
필터 초기화
```

---

## 13.3 데이터 조회 실패

문구:

```txt
데이터 조회 실패
운영 로그를 불러오는 중 오류가 발생했습니다.
```

버튼:

```txt
다시 시도
```

---

## 13.4 접근 권한 없음

### operator가 민감 로그 접근 시

```txt
접근 권한 없음
민감 운영 로그는 super_admin만 조회할 수 있습니다.
현재 계정의 역할로는 이 메뉴에 접근할 수 없습니다.
권한이 필요하면 super_admin에게 문의하세요.
```

### viewer가 운영 로그 접근 시

```txt
A24 접근 권한 부족 화면으로 이동
```

---

## 14. 데이터 모델

## 14.1 Operation Log Type

```ts
type OperationLogSensitivity = 'normal' | 'sensitive';

type OperationLogResult =
  | 'success'
  | 'failed'
  | 'blocked'
  | 'pending';

type OperationLogResourceType =
  | 'treasure'
  | 'product'
  | 'mapping'
  | 'reward'
  | 'user'
  | 'inquiry'
  | 'admin'
  | 'csv_export'
  | 'system';
```

---

## 14.2 Operation Log List Item

```ts
type AdminOperationLogListItem = {
  id: string;
  public_id: string;
  created_at: string;
  event_type: string;
  sensitivity: OperationLogSensitivity;
  actor_admin_id: string;
  actor_admin_name: string;
  resource_type: OperationLogResourceType;
  resource_id: string | null;
  change_summary: string;
  result: OperationLogResult;
};
```

---

## 14.3 민감 로그 예시

```ts
const sensitiveEventTypes = [
  'user_suspended',
  'user_unsuspended',
  'csv_exported',
  'admin_role_changed',
  'security_log_viewed',
  'reward_retry_requested',
];
```

---

## 15. API 연동 기준

## 15.1 목록 조회

```txt
GET /api/admin/operation-logs
```

### Query Parameters

| 파라미터 | 설명 |
|---|---|
| `logType` | normal / sensitive |
| `q` | 로그 ID, 관리자 ID, 대상 리소스 ID 검색 |
| `from` | 발생일 시작 |
| `to` | 발생일 종료 |
| `eventType` | 이벤트 유형 |
| `actorAdminId` | 실행자 |
| `resourceType` | 대상 리소스 |
| `sort` | 정렬 |
| `page` | 페이지 |
| `pageSize` | 페이지당 개수 |

권한:

```txt
normal: super_admin / operator
sensitive: super_admin only
```

---

## 15.2 CSV 내보내기

```txt
GET /api/admin/operation-logs/export.csv
```

권한:

```txt
normal: super_admin / operator
sensitive: super_admin only
```

CSV 내보내기 요청 자체도 `csv_exported` 로그로 기록한다.

---

## 16. 보안 정책

```txt
운영 로그 API는 서버에서 role을 재검증한다.
민감 로그는 super_admin만 조회할 수 있다.
operator에게는 민감 로그 데이터가 API 응답으로 내려가지 않아야 한다.
viewer는 운영 로그 API 호출 자체가 차단된다.
로그는 수정·삭제할 수 없다.
로그 payload 원문에는 민감 정보를 저장하지 않는다.
CSV에도 사용자 이메일, 쿠폰 번호, 바코드, API Secret, 토큰을 포함하지 않는다.
CSV 내보내기 자체를 운영 로그로 기록한다.
```

---

## 17. 운영 로그 기록 기준

A23 화면은 로그를 조회하는 화면이지만, 아래 행위는 다시 로그로 남길 수 있다.

| 액션 | 로그 유형 |
|---|---|
| 일반 로그 조회 | 생략 가능 |
| 민감 로그 조회 | 민감 운영 로그 권장 |
| CSV 내보내기 | 민감 운영 로그 |
| 민감 로그 접근 차단 | 민감 운영 로그 또는 보안 로그 가능 |
| 대상 리소스 이동 | 생략 가능 |

---

## 18. 와이어프레임 반영 기준

| 와이어프레임 요소 | MD 반영 |
|---|---|
| 운영 로그 타이틀 | 유지 |
| 일반 로그 / 민감 로그 탭 | 유지 |
| CSV 내보내기 버튼 | 유지 |
| 검색 필드 | 유지 |
| 기간 필터 | 유지 |
| 이벤트 유형 필터 | 유지 |
| 실행자 필터 | 유지 |
| 대상 리소스 필터 | 유지 |
| 정렬 필터 | 유지 |
| 운영 로그 테이블 | 유지 |
| 페이지네이션 | 유지 |
| 접근 권한 없음 팝업 | 유지 |
| viewer 접근 제한 | A24 연계 |

---

## 19. QA 체크리스트

## 19.1 권한

- [ ] super_admin은 일반 로그를 조회할 수 있다.
- [ ] super_admin은 민감 로그를 조회할 수 있다.
- [ ] operator는 일반 로그를 조회할 수 있다.
- [ ] operator는 민감 로그를 조회할 수 없다.
- [ ] viewer는 운영 로그 화면에 접근할 수 없다.
- [ ] viewer 직접 URL 접근 시 A24로 이동한다.
- [ ] operator가 민감 로그 URL로 접근하면 접근 권한 없음 팝업이 표시된다.

## 19.2 검색·필터

- [ ] 로그 ID로 검색할 수 있다.
- [ ] 관리자 ID로 검색할 수 있다.
- [ ] 대상 리소스 ID로 검색할 수 있다.
- [ ] 기간 필터가 동작한다.
- [ ] 이벤트 유형 필터가 동작한다.
- [ ] 실행자 필터가 동작한다.
- [ ] 대상 리소스 필터가 동작한다.
- [ ] 정렬 필터가 동작한다.

## 19.3 테이블

- [ ] 발생 시각이 표시된다.
- [ ] 이벤트 유형이 표시된다.
- [ ] 민감도가 표시된다.
- [ ] 실행자가 표시된다.
- [ ] 대상 리소스가 표시된다.
- [ ] 변경 요약이 표시된다.
- [ ] 결과가 표시된다.
- [ ] 사용자 이메일은 표시되지 않는다.
- [ ] 쿠폰 번호와 바코드는 표시되지 않는다.

## 19.4 CSV

- [ ] super_admin은 일반 로그 CSV를 내보낼 수 있다.
- [ ] super_admin은 민감 로그 CSV를 내보낼 수 있다.
- [ ] operator는 일반 로그 CSV만 내보낼 수 있다.
- [ ] viewer는 CSV 버튼을 볼 수 없다.
- [ ] CSV에는 민감 정보가 포함되지 않는다.
- [ ] CSV 내보내기 자체가 운영 로그로 기록된다.

## 19.5 오류 상태

- [ ] 데이터 조회 실패 시 오류 상태가 표시된다.
- [ ] 다시 시도 클릭 시 API를 재호출한다.
- [ ] 검색 결과가 없을 때 빈 상태가 표시된다.
- [ ] 접근 권한 없음 팝업이 정상 표시된다.

---

## 20. 개발 메모

```txt
A23은 일반 운영 로그와 민감 운영 로그를 같은 화면에서 탭으로 분리한다.
민감 로그는 super_admin 전용이다.
operator에게 민감 로그 API 응답이 내려가면 안 된다.
viewer는 메뉴 미노출 + 직접 URL 접근 차단이 필요하다.
운영 로그 상세 화면은 MVP에서는 만들지 않고, 대상 리소스 상세 이동으로 대체한다.
로그 삭제/수정 기능은 제공하지 않는다.
```
