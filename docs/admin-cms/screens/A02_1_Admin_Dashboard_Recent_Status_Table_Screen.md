# A02-1. 관리자 운영 대시보드 최근 현황 테이블 화면 정의서

> 문서 버전: `v1.0`  
> 작성 기준: 운영 대시보드 하위 최근 현황 테이블 와이어프레임  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 관련 상위 화면: `A02_Admin_Dashboard_Screen`  
> 화면 성격: 대시보드 하위 상세/확장 화면  
> 접근 권한: `super_admin`, `operator`, `viewer` 조회 가능

---

# 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 화면명 | 최근 현황 테이블 |
| 화면 ID | `A02_1_Admin_Dashboard_Recent_Status_Table` |
| 권장 파일명 | `A02_1_Admin_Dashboard_Recent_Status_Table_Screen.md` |
| 화면 유형 | 관리자 CMS / 대시보드 하위 현황 화면 |
| Route | `/admin` 또는 `/admin?section=recent-status` |
| 상위 메뉴 | 대시보드 |
| 작성 목적 | 대시보드의 최근 운영 현황을 테이블 중심으로 확인하기 위한 화면 단위 구현 명세 |
| 기준 기술 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |

---

# 2. 화면 개요

최근 현황 테이블 화면은 운영 대시보드에서 핵심 운영 이벤트를 더 자세히 확인하는 하위 화면이다.

이 화면은 아래 3개 영역으로 구성한다.

```txt
최근 보물 획득
최근 발급 실패
최근 문의
```

각 영역은 상단 요약 카드와 상세 테이블을 함께 제공한다.

```txt
요약 카드 = 현재 상태를 빠르게 파악
상세 테이블 = 실제 운영 대상 확인 및 상세 화면 이동
```

이 화면은 신규 데이터를 생성하거나 수정하는 화면이 아니다.  
관리자가 운영 상황을 빠르게 파악하고 관련 상세 화면으로 이동하기 위한 조회 중심 화면이다.

---

# 3. 상위 대시보드와의 관계

## 3.1 진입 관계

```txt
A02 운영 대시보드
→ 최근 현황 영역 클릭
→ A02-1 최근 현황 테이블 위치로 이동 또는 확장 표시
```

## 3.2 화면 분리 기준

이 화면은 별도 최상위 메뉴가 아니다.  
대시보드 메뉴 안에서 보여지는 하위 현황 섹션이다.

권장 구현 방식은 아래 둘 중 하나다.

| 방식 | 설명 | 권장도 |
|---|---|---:|
| 같은 `/admin` 페이지 내 하단 섹션 | 운영 대시보드 하단에 최근 현황 테이블을 배치 | 높음 |
| `/admin?section=recent-status` | 대시보드 내 특정 섹션으로 스크롤/포커스 이동 | 높음 |
| `/admin/recent-status` | 별도 페이지로 분리 | 낮음 |

MVP에서는 상위 대시보드와 같은 페이지 내 섹션으로 구현하는 것을 권장한다.

---

# 4. 접근 권한

## 4.1 접근 가능 역할

| 역할 | 접근 | 기준 |
|---|---:|---|
| `super_admin` | O | 전체 현황 조회 가능 |
| `operator` | O | 일반 운영 현황 조회 가능 |
| `viewer` | O | 조회 전용으로 접근 가능 |

## 4.2 역할별 제한

| 항목 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 최근 보물 획득 조회 | O | O | O |
| 최근 발급 실패 조회 | O | O | O |
| 최근 문의 조회 | O | O | O |
| 상세 화면 이동 | O | O | O |
| 재처리 요청 | O | O | X |
| 문의 답변 | O | O | X |
| 내부 메모 작성 | O | O | X |
| 유저 정지/해제 | O | X | X |

중요:

```txt
이 화면에서는 viewer도 데이터를 조회할 수 있다.
단, viewer는 상세 화면으로 이동하더라도 수정·답변·재처리·메모 작성 버튼을 볼 수 없다.
```

---

# 5. 화면 레이아웃

## 5.1 전체 구조

```txt
┌──────────────────────────────────────────────┐
│ Admin Topbar                                 │
│ - 검색 입력                                  │
│ - 권한 표시                                  │
│ - 관리자 아바타                              │
├───────────────┬──────────────────────────────┤
│ Sidebar       │ 최근 현황                     │
│               │ Asia/Seoul 기준               │
│               │                              │
│               │ [최근 보물 획득]               │
│               │ [요약 카드 3개]                │
│               │ [보물 획득 테이블]             │
│               │                              │
│               │ [최근 발급 실패]               │
│               │ [요약 카드 3개]                │
│               │ [발급 실패 테이블]             │
│               │                              │
│               │ [최근 문의]                    │
│               │ [요약 카드 3개]                │
│               │ [문의 테이블]                  │
└───────────────┴──────────────────────────────┘
```

## 5.2 레이아웃 원칙

- 좌측 사이드바와 상단바는 `AdminLayout`을 재사용한다.
- 본문 영역은 대시보드 하위 콘텐츠로 구성한다.
- 세로 스크롤을 허용한다.
- 각 섹션은 카드 형태의 컨테이너로 구분한다.
- 테이블은 가로 스크롤이 발생하지 않도록 컬럼 폭을 조정한다.
- 데이터가 많아질 경우 각 테이블은 최대 8~10개 행만 보여준다.
- 전체 목록 확인은 각 도메인 목록 화면에서 수행한다.

---

# 6. 공통 UI 구성 요소

## 6.1 AdminLayout

| 요소 | 정의 |
|---|---|
| 상단 로고 | `캐치캐쉬 CMS` |
| 좌측 메뉴 | role 기준 허용 메뉴만 노출 |
| 상단 검색 | 관리자 CMS 전역 검색 또는 MVP placeholder |
| 권한 표시 | 현재 관리자 role 표시 |
| 아바타 | 관리자 이니셜 또는 기본 원형 아바타 |

## 6.2 사이드바 메뉴

| 메뉴 | Route | super_admin | operator | viewer |
|---|---|---:|---:|---:|
| 대시보드 | `/admin` | O | O | O |
| 보물상자 | `/admin/treasures` | O | O | O |
| 상품 | `/admin/products` | O | O | O |
| 매칭 | `/admin/mappings` | O | O | O |
| 보상 | `/admin/rewards` | O | O | O |
| 유저 | `/admin/users` | O | O | O |
| 문의 | `/admin/inquiries` | O | O | O |
| 운영 로그 | `/admin/operation-logs` | O | O | X |
| 보안 로그 | `/admin/security-logs` | O | X | X |
| 관리자 | `/admin/admins` | O | X | X |

## 6.3 페이지 헤더

| 요소 | 문구/정의 |
|---|---|
| 타이틀 | `최근 현황` |
| 보조 정보 | `Asia/Seoul 기준` |
| 화면 설명 | 선택 사항. MVP에서는 생략 가능 |

---

# 7. 섹션 1: 최근 보물 획득

## 7.1 목적

최근 사용자가 보물상자를 획득한 내역을 확인한다.

이 영역은 운영자가 아래를 빠르게 파악하기 위한 것이다.

```txt
오늘 보물 획득이 정상적으로 발생하고 있는지
어떤 보물이 자주 획득되고 있는지
최근 어떤 유저가 보상을 획득했는지
획득 이후 보상 상태가 정상인지
```

## 7.2 요약 카드

| 카드 | 데이터 기준 | 설명 |
|---|---|---|
| 오늘 획득 성공 | `claimed_at` 오늘 + claim 성공 | 오늘 발생한 획득 성공 건수 |
| 오늘 보상 | 오늘 생성된 `ready` 또는 `issued` 보상 수 | 획득 후 보상 생성 현황 |
| 최근 4시간 획득 | 최근 4시간 claim 성공 수 | 최근 운영 흐름 확인 |

와이어프레임에는 요약 카드 3개가 배치되어 있으나, 정확한 지표명은 개발 시 아래와 같이 확정한다.

```txt
오늘 획득 성공
오늘 보상 생성
최근 4시간 획득
```

## 7.3 테이블 컬럼

| 컬럼 | 키 | 설명 | 표시 예시 |
|---|---|---|---|
| 획득 ID | `claim_id` | 보물 획득 이력 ID | `clm_1234` |
| 보물명 | `treasure_title` | 획득된 보물상자 이름 | `강남역 상자` |
| 유저 닉네임 | `user_nickname` | 사용자 닉네임 | `상자헌터` |
| 보상 상태 | `reward_status` | 연결 보상 상태 | `ready`, `issued` |
| 획득 시각 | `claimed_at` | 획득 발생 시각 | `2026-07-26 14:22` |

## 7.4 행 클릭 동작

| 클릭 대상 | 이동 |
|---|---|
| 행 전체 | `A16 보상 상세` 또는 `A08 보물상자 상세` |
| 획득 ID | `A16 보상 상세` |
| 보물명 | `A08 보물상자 상세` |
| 유저 닉네임 | `A18 유저 상세` |

권장 기본 이동:

```txt
행 클릭 → A16 보상 상세
```

---

# 8. 섹션 2: 최근 발급 실패

## 8.1 목적

기프티쇼비즈 발급 실패 또는 서버 발급 실패로 인해 `failed` 상태가 된 보상을 확인한다.

이 영역은 운영자가 아래를 빠르게 파악하기 위한 것이다.

```txt
오늘 발급 실패가 얼마나 발생했는지
실패 원인이 특정 코드에 집중되는지
재처리 요청이 필요한 건이 있는지
실패 보상의 발생 시각과 사용자 상태가 정상인지
```

## 8.2 요약 카드

| 카드 | 데이터 기준 | 설명 |
|---|---|---|
| 미처리 실패 | `reward_status = failed` + 재처리 완료 전 | 아직 운영자가 확인해야 하는 실패 건 |
| 재처리 대기 | `reward_retry_requests.status = requested/pending` | 재처리 요청 후 대기 중인 건 |
| 최근 실패 사유 | 최근 실패 코드 또는 최다 실패 코드 | 원인 파악용 |

와이어프레임에는 요약 카드 3개가 배치되어 있으므로 다음 명칭을 권장한다.

```txt
미처리 실패
재처리 대기
최근 실패 사유
```

## 8.3 테이블 컬럼

| 컬럼 | 키 | 설명 | 표시 예시 |
|---|---|---|---|
| 보상 ID | `reward_id` | 보상 레코드 ID | `rwd_1234` |
| 보물명 | `treasure_title` | 연결된 보물상자 이름 | `잠실 상자` |
| 유저 닉네임 | `user_nickname` | 사용자 닉네임 | `헌터01` |
| 실패 코드 | `failure_code` | 서버 또는 외부 API 실패 코드 | `GIFTISHOW_TIMEOUT` |
| 실패 시각 | `failed_at` | 실패 발생 시각 | `2026-07-26 15:10` |
| 재처리 요청 | `retry_request_status` | 재처리 요청 여부 | `없음`, `대기`, `완료` |

## 8.4 행 클릭 동작

| 클릭 대상 | 이동 |
|---|---|
| 행 전체 | `A16 보상 상세` |
| 보상 ID | `A16 보상 상세` |
| 보물명 | `A08 보물상자 상세` |
| 유저 닉네임 | `A18 유저 상세` |

## 8.5 주의사항

```txt
CMS는 기프티쇼비즈 API를 직접 호출하지 않는다.
이 화면에서는 재처리 요청 버튼을 직접 노출하지 않는다.
재처리 요청은 A16 보상 상세에서 수행한다.
쿠폰 번호, 바코드 원문, 마스킹 값은 이 화면에 표시하지 않는다.
```

---

# 9. 섹션 3: 최근 문의

## 9.1 목적

최근 등록된 사용자 문의와 미처리 문의를 확인한다.

이 영역은 운영자가 아래를 빠르게 파악하기 위한 것이다.

```txt
오늘 문의가 얼마나 들어왔는지
open 또는 in_progress 상태 문의가 많은지
쿠폰/보상 관련 긴급 문의가 있는지
답변이 필요한 문의를 빠르게 확인할 수 있는지
```

## 9.2 요약 카드

| 카드 | 데이터 기준 | 설명 |
|---|---|---|
| 미처리 문의 | `status in ('open', 'in_progress')` | 아직 처리 중이거나 미답변인 문의 |
| 오늘 접수 | 오늘 생성된 문의 수 | 당일 문의 유입량 |
| 평균 응답 대기 | open 상태 문의의 평균 경과 시간 | 운영 대응 속도 확인 |

와이어프레임에는 요약 카드 3개가 배치되어 있으므로 다음 명칭을 권장한다.

```txt
미처리 문의
오늘 접수
평균 응답 대기
```

## 9.3 테이블 컬럼

| 컬럼 | 키 | 설명 | 표시 예시 |
|---|---|---|---|
| 문의 ID | `inquiry_id` | 문의 레코드 ID | `inq_1234` |
| 카테고리 | `category` | 문의 유형 | `쿠폰 문의` |
| 유저 닉네임 | `user_nickname` | 사용자 닉네임 | `상자헌터` |
| 상태 | `status` | 문의 처리 상태 | `open`, `in_progress`, `answered`, `closed` |
| 접수 시각 | `created_at` | 문의 등록 시각 | `2026-07-26 16:20` |

## 9.4 행 클릭 동작

| 클릭 대상 | 이동 |
|---|---|
| 행 전체 | `A20 문의 상세` |
| 문의 ID | `A20 문의 상세` |
| 유저 닉네임 | `A18 유저 상세` |

---

# 10. 상태값 정의

## 10.1 보상 상태

| 상태 | 설명 | 화면 표시 |
|---|---|---|
| `ready` | 쿠폰 발급 전 수령권 생성 | 발급 전 |
| `issued` | 쿠폰 발급 완료 | 발급 완료 |
| `failed` | 발급 실패 | 발급 실패 |
| `used` | 사용 완료 | 사용 완료 |
| `expired` | 만료 | 만료 |
| `canceled` | 지급 취소 | 취소 |

## 10.2 재처리 요청 상태

| 상태 | 설명 |
|---|---|
| `none` | 요청 없음 |
| `requested` | 관리자 재처리 요청 생성 |
| `processing` | Worker 처리 중 |
| `succeeded` | 재처리 성공 |
| `failed` | 재처리 실패 |

중요:

```txt
processing은 보상 상태로 사용하지 않는다.
processing은 재처리 요청 상태에서만 사용한다.
```

## 10.3 문의 상태

| 상태 | 설명 |
|---|---|
| `open` | 신규 접수 |
| `in_progress` | 처리 중 |
| `answered` | 답변 완료 |
| `closed` | 종료 |

---

# 11. 데이터 조회 기준

## 11.1 시간 기준

| 항목 | 기준 |
|---|---|
| 날짜 기준 | Asia/Seoul KST |
| 오늘 기준 | KST 00:00:00 ~ 23:59:59 |
| 최근 현황 정렬 | 최신순 |
| 데이터 지연 안내 | 최대 1분 지연 가능 |

화면에는 다음 안내를 표시할 수 있다.

```txt
대시보드 집계는 Asia/Seoul(KST) 기준으로 계산되며 최대 1분 지연이 있을 수 있습니다.
```

## 11.2 조회 개수

| 섹션 | 기본 조회 개수 |
|---|---:|
| 최근 보물 획득 | 8건 |
| 최근 발급 실패 | 8건 |
| 최근 문의 | 8건 |

## 11.3 정렬 기준

| 섹션 | 정렬 |
|---|---|
| 최근 보물 획득 | `claimed_at desc` |
| 최근 발급 실패 | `failed_at desc` |
| 최근 문의 | `created_at desc` |

---

# 12. API 연동 기준

## 12.1 권장 API

```txt
GET /api/admin/dashboard/recent-status
```

## 12.2 Request Query

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `limit` | number | N | 섹션별 조회 개수. 기본 8 |
| `timezone` | string | N | 기본 `Asia/Seoul` |

예시:

```txt
GET /api/admin/dashboard/recent-status?limit=8&timezone=Asia/Seoul
```

## 12.3 Response 예시

```json
{
  "generated_at": "2026-07-26T09:00:00.000Z",
  "timezone": "Asia/Seoul",
  "recent_claims": {
    "summary": {
      "today_claimed_count": 12,
      "today_reward_created_count": 12,
      "last_4h_claimed_count": 3
    },
    "items": [
      {
        "claim_id": "clm_1234",
        "treasure_id": "tr_1234",
        "treasure_title": "강남역 상자",
        "user_id": "usr_1234",
        "user_nickname": "상자헌터",
        "reward_id": "rwd_1234",
        "reward_status": "issued",
        "claimed_at": "2026-07-26T05:22:00.000Z"
      }
    ]
  },
  "recent_failures": {
    "summary": {
      "unresolved_failed_count": 4,
      "retry_pending_count": 2,
      "latest_failure_code": "GIFTISHOW_TIMEOUT"
    },
    "items": [
      {
        "reward_id": "rwd_5678",
        "treasure_id": "tr_1234",
        "treasure_title": "잠실 상자",
        "user_id": "usr_5678",
        "user_nickname": "헌터01",
        "failure_code": "GIFTISHOW_TIMEOUT",
        "failed_at": "2026-07-26T06:10:00.000Z",
        "retry_request_status": "none"
      }
    ]
  },
  "recent_inquiries": {
    "summary": {
      "unresolved_count": 7,
      "today_created_count": 5,
      "average_wait_minutes": 42
    },
    "items": [
      {
        "inquiry_id": "inq_1234",
        "category": "coupon",
        "category_label": "쿠폰 문의",
        "user_id": "usr_1234",
        "user_nickname": "상자헌터",
        "status": "open",
        "created_at": "2026-07-26T07:20:00.000Z"
      }
    ]
  }
}
```

---

# 13. 화면 상태

## 13.1 로딩 상태

초기 진입 시 각 섹션에 skeleton row를 표시한다.

```txt
요약 카드 skeleton
테이블 row skeleton
```

로딩 중에는 빈 상태 문구를 표시하지 않는다.

## 13.2 빈 상태

| 섹션 | 빈 상태 문구 |
|---|---|
| 최근 보물 획득 | `최근 보물 획득 내역이 없습니다.` |
| 최근 발급 실패 | `최근 발급 실패 내역이 없습니다.` |
| 최근 문의 | `최근 문의가 없습니다.` |

## 13.3 조회 실패 상태

| 상황 | 처리 |
|---|---|
| 전체 조회 실패 | 상단 오류 배너 + 다시 불러오기 버튼 |
| 일부 섹션 실패 | 해당 섹션 안에 오류 카드 표시 |
| 권한 오류 | `A24 접근 권한 부족` 화면 이동 |
| 세션 만료 | `/admin/login` 이동 |

조회 실패 문구:

```txt
최근 현황을 불러오지 못했습니다.
잠시 후 다시 시도해주세요.
```

## 13.4 부분 실패 처리

각 섹션은 독립적으로 실패할 수 있다.

예시:

```txt
최근 보물 획득 = 정상 표시
최근 발급 실패 = 조회 실패 카드
최근 문의 = 정상 표시
```

---

# 14. 민감 정보 표시 제한

이 화면에는 아래 정보를 절대 표시하지 않는다.

```txt
사용자 이메일
사용자 전화번호
쿠폰 번호
바코드 원문
바코드 마스킹 값
기프티쇼비즈 API secret
Supabase service role key
상세 위치 로그 원문
보안 로그 상세 내용
```

표시 가능한 사용자 정보:

```txt
user_id
닉네임
프로필 상태
정지 여부
```

단, 테이블에서는 가독성을 위해 닉네임만 기본 표시한다.

---

# 15. 필터와 검색 정책

## 15.1 이 화면의 필터

MVP에서는 화면 내 별도 필터를 제공하지 않는다.

```txt
최근 현황 = 고정 기준 요약
상세 필터링 = 각 목록 화면에서 수행
```

## 15.2 빠른 이동 링크

각 섹션 우측 또는 하단에 상세 목록 이동 링크를 제공할 수 있다.

| 링크 | 이동 |
|---|---|
| 보상 목록 | `/admin/rewards` |
| 문의 목록 | `/admin/inquiries` |
| 보물상자 목록 | `/admin/treasures` |

와이어프레임의 하단 링크는 아래와 같이 정리한다.

```txt
상품 목록
매칭 목록
유저 목록
운영 로그
```

단, 화면 목적상 최근 현황에서는 다음 링크가 더 적합하다.

```txt
보상 목록
보물상자 목록
문의 목록
운영 로그
```

최종 권장:

```txt
보상 목록 / 보물상자 목록 / 문의 목록 / 운영 로그
```

---

# 16. 컴포넌트 구조 권장

```txt
AdminRecentStatusPage
├─ AdminLayout
├─ AdminPageHeader
├─ RecentClaimSection
│  ├─ SummaryMetricCards
│  └─ RecentClaimsTable
├─ RecentRewardFailureSection
│  ├─ SummaryMetricCards
│  └─ RecentFailuresTable
└─ RecentInquirySection
   ├─ SummaryMetricCards
   └─ RecentInquiriesTable
```

## 16.1 주요 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `RecentStatusSection` | 공통 섹션 카드 |
| `SummaryMetricCard` | 섹션 요약 카드 |
| `AdminDataTable` | 공통 테이블 |
| `StatusBadge` | 보상/문의 상태 배지 |
| `SkeletonTableRows` | 로딩 테이블 skeleton |
| `SectionErrorState` | 섹션별 오류 상태 |
| `EmptyStateRow` | 빈 상태 row |

---

# 17. TypeScript 타입 예시

```ts
export type RewardStatus =
  | 'ready'
  | 'issued'
  | 'failed'
  | 'used'
  | 'expired'
  | 'canceled';

export type InquiryStatus =
  | 'open'
  | 'in_progress'
  | 'answered'
  | 'closed';

export type RetryRequestStatus =
  | 'none'
  | 'requested'
  | 'processing'
  | 'succeeded'
  | 'failed';

export interface RecentClaimItem {
  claim_id: string;
  treasure_id: string;
  treasure_title: string;
  user_id: string;
  user_nickname: string;
  reward_id: string;
  reward_status: RewardStatus;
  claimed_at: string;
}

export interface RecentRewardFailureItem {
  reward_id: string;
  treasure_id: string;
  treasure_title: string;
  user_id: string;
  user_nickname: string;
  failure_code: string;
  failed_at: string;
  retry_request_status: RetryRequestStatus;
}

export interface RecentInquiryItem {
  inquiry_id: string;
  category: string;
  category_label: string;
  user_id: string;
  user_nickname: string;
  status: InquiryStatus;
  created_at: string;
}
```

---

# 18. QA 체크리스트

## 18.1 기본 표시

| 체크 | 항목 |
|---|---|
|  | 페이지 타이틀이 `최근 현황`으로 표시되는가 |
|  | 상단에 `Asia/Seoul 기준`이 표시되는가 |
|  | 최근 보물 획득 섹션이 표시되는가 |
|  | 최근 발급 실패 섹션이 표시되는가 |
|  | 최근 문의 섹션이 표시되는가 |
|  | 각 섹션에 요약 카드 3개가 표시되는가 |
|  | 각 섹션에 테이블이 표시되는가 |

## 18.2 권한

| 체크 | 항목 |
|---|---|
|  | super_admin이 접근 가능한가 |
|  | operator가 접근 가능한가 |
|  | viewer가 접근 가능한가 |
|  | viewer에게 수정/답변/재처리 액션이 노출되지 않는가 |
|  | 권한 없는 직접 URL 접근 시 A24로 이동하는가 |

## 18.3 데이터

| 체크 | 항목 |
|---|---|
|  | 오늘 기준이 KST로 계산되는가 |
|  | 최근 보물 획득이 최신순으로 표시되는가 |
|  | 최근 발급 실패가 최신순으로 표시되는가 |
|  | 최근 문의가 최신순으로 표시되는가 |
|  | 사용자 이메일이 표시되지 않는가 |
|  | 쿠폰 번호와 바코드가 표시되지 않는가 |

## 18.4 상태 처리

| 체크 | 항목 |
|---|---|
|  | 로딩 시 skeleton이 표시되는가 |
|  | 데이터가 없을 때 빈 상태 문구가 표시되는가 |
|  | 전체 조회 실패 시 오류 상태가 표시되는가 |
|  | 일부 섹션 실패 시 해당 섹션만 오류로 표시되는가 |
|  | 세션 만료 시 로그인 화면으로 이동하는가 |

## 18.5 이동

| 체크 | 항목 |
|---|---|
|  | 최근 보물 획득 행 클릭 시 보상 상세로 이동하는가 |
|  | 최근 발급 실패 행 클릭 시 보상 상세로 이동하는가 |
|  | 최근 문의 행 클릭 시 문의 상세로 이동하는가 |
|  | 보물명 클릭 시 보물 상세로 이동 가능한가 |
|  | 유저 닉네임 클릭 시 유저 상세로 이동 가능한가 |

---

# 19. 개발 메모

```txt
이 화면은 신규 CRUD 화면이 아니다.
대시보드 집계와 최근 운영 이벤트를 조회하는 화면이다.
액션 버튼은 최소화하고 상세 처리는 각 상세 화면에서 수행한다.
보상 발급 실패 재처리 요청은 A16 보상 상세에서만 실행한다.
문의 답변은 A20 문의 상세에서만 실행한다.
사용자 이메일과 쿠폰 번호는 절대 표시하지 않는다.
```

---

# 20. 최종 확정 기준

```txt
A02-1 최근 현황 테이블은 A02 운영 대시보드의 하위 상세 섹션으로 구현한다.
최근 보물 획득, 최근 발급 실패, 최근 문의 3개 영역으로 구성한다.
모든 role이 조회할 수 있으나, viewer는 모든 액션이 제한된다.
테이블 행 클릭은 관련 상세 화면으로 이동한다.
민감 정보와 쿠폰 정보는 표시하지 않는다.
```
