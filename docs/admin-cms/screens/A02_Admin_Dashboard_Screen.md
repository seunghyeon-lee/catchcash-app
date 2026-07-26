# A02. 운영 대시보드 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A02. 운영 대시보드 화면 정의서 |
| 파일명 | `A02_Admin_Dashboard_Screen.md` |
| 화면명 | 운영 대시보드 |
| 화면 ID | `A02_Admin_Dashboard_Screen` |
| 관련 Route | `/admin` 또는 `/admin/dashboard` |
| 서비스 | 캐치캐쉬 CatchCash |
| 대상 | 관리자 CMS MVP |
| 작성 목적 | 와이어프레임 기준 바이브코딩을 위한 화면 단위 구현 명세 |
| 기준 문서 | `CatchCash_Admin_CMS_Final_Functional_Spec_v1.0_2026-07-26.md` / `CatchCash_Admin_CMS_Final_User_Flow_v1.0_2026-07-26.md` |
| 기준 화면 | 운영 대시보드 와이어프레임 |

---

## 2. 화면 개요

운영 대시보드는 관리자 로그인 후 가장 먼저 진입하는 CMS 메인 화면이다.

관리자는 이 화면에서 현재 서비스 운영 상태를 빠르게 확인하고, 주요 업무 화면으로 이동할 수 있다.

이 화면은 상세 통계 분석 화면이 아니라 MVP 운영 현황을 요약하는 화면이다.

```txt
관리자 로그인
→ 권한 검증
→ 운영 대시보드 진입
→ 핵심 운영 지표 확인
→ 최근 현황 확인
→ 보물상자 / 보상 / 문의 / 로그 등 상세 화면으로 이동
```

---

## 3. 화면 목적

### 3.1 핵심 목적

- 현재 노출 가능한 보물 수를 확인한다.
- 오늘 획득 성공한 보상 수를 확인한다.
- 오늘 쿠폰 발급 실패 건수를 확인한다.
- 미처리 문의 수를 확인한다.
- 최근 보물 획득 / 발급 실패 / 문의 흐름을 한 화면에서 확인한다.
- 관리자 역할에 맞는 메뉴와 빠른 이동 링크를 제공한다.

### 3.2 관리자 관점 목적

- 오늘 운영상 문제가 있는지 빠르게 확인한다.
- 실패한 발급 건과 미처리 문의를 우선 처리한다.
- 보물, 상품, 보상, 문의, 로그 화면으로 빠르게 이동한다.

---

## 4. 접근 권한

## 4.1 접근 가능 역할

| 역할 | 접근 가능 여부 | 비고 |
|---|---:|---|
| super_admin | O | 전체 메뉴 접근 가능 |
| operator | O | 일반 운영 메뉴 접근 가능 |
| viewer | O | 조회 전용 접근 가능 |

운영 대시보드는 모든 관리자 역할이 조회할 수 있다.

단, 대시보드에서 표시되는 사이드바 메뉴와 빠른 링크는 현재 로그인한 관리자의 역할에 따라 달라진다.

---

## 4.2 역할별 메뉴 노출

### super_admin

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

### operator

```txt
대시보드
보물상자
상품
매칭
보상
유저
문의
운영 로그
```

### viewer

```txt
대시보드
보물상자
상품
매칭
보상
유저
문의
```

### 메뉴 노출 원칙

```txt
권한 없는 메뉴는 사이드바에서 숨긴다.
직접 URL 접근으로 권한 없는 화면에 접근한 경우 A24 접근 권한 부족 화면을 표시한다.
```

---

## 5. 진입 조건

### 5.1 진입 시점

사용자는 아래 상황에서 운영 대시보드에 진입한다.

| 상황 | 설명 |
|---|---|
| 관리자 로그인 성공 | 이메일·비밀번호 로그인 성공 후 기본 이동 |
| `/admin` 직접 접근 | 관리자 세션이 있고 계정이 active인 경우 |
| 사이드바 대시보드 클릭 | CMS 내부 이동 |
| 접근 거부 화면에서 대시보드로 이동 클릭 | 접근 가능한 기본 화면으로 복귀 |

### 5.2 필수 접근 조건

```txt
Supabase 관리자 세션 존재
admin_profiles row 존재
admin_profiles.status = active
admin_profiles.role in ('super_admin', 'operator', 'viewer')
```

### 5.3 접근 제한 처리

| 조건 | 처리 |
|---|---|
| 세션 없음 | `/admin/login` 이동 |
| 계정 inactive | 세션 무효화 후 `/admin/login` 이동 |
| role 없음 | `/admin/access-denied` 이동 |
| role 불일치 | `/admin/access-denied` 이동 |
| 데이터 조회 실패 | 대시보드 오류 상태 표시 |

---

## 6. Route

### 6.1 권장 Route

```txt
/admin
```

또는 명시형 Route를 사용할 경우 다음을 허용한다.

```txt
/admin/dashboard
```

### 6.2 Next.js App Router 기준 파일 경로

```txt
app/admin/(protected)/page.tsx
```

또는

```txt
app/admin/(protected)/dashboard/page.tsx
```

---

## 7. 화면 레이아웃

## 7.1 와이어프레임 기준 구조

```txt
┌────────────────────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                         [검색]  권한  [Avatar] │
├───────────────┬────────────────────────────────────────────┤
│ 메뉴           │ 운영 대시보드                         시간 │
│ 대시보드        │                                            │
│ 보물상자        │ [Visible 보물] [오늘 획득 성공] [오늘 발급 실패] [미처리 문의] │
│ 상품           │                                            │
│ 매칭           │ 최근 현황                                    │
│ 보상           │ ┌────────────────────────────────────────┐ │
│ 유저           │ │ 구분 │ 항목 │ 유저 │ 상태 │ 일시        │ │
│ 문의           │ │ skeleton rows                           │ │
│ 운영 로그       │ └────────────────────────────────────────┘ │
│ 보안 로그       │                                            │
│ 관리자         │ 대시보드 집계 안내 문구                       │
│               │                                  빠른 링크  │
└───────────────┴────────────────────────────────────────────┘
```

---

## 7.2 레이아웃 원칙

- 관리자 CMS는 데스크톱 웹 기준으로 구성한다.
- 좌측 사이드바와 상단 헤더를 가진 AdminLayout을 사용한다.
- 본문 영역은 카드형 지표와 최근 현황 테이블로 구성한다.
- 대시보드는 읽기 전용 화면이다.
- 대시보드에서는 관리자 작업 이력 전체를 직접 노출하지 않는다.
- 구체적인 처리 업무는 각 상세 화면에서 수행한다.

---

## 8. 화면 구성 요소

## 8.1 Admin Header

### 구성

| 위치 | 요소 | 설명 |
|---|---|---|
| 좌측 | `캐치캐쉬 CMS` | 서비스 관리자 CMS 로고 텍스트 |
| 우측 | 검색 입력 | MVP에서는 선택 기능 |
| 우측 | 권한 표시 | 현재 관리자 role 표시 |
| 우측 | 프로필 아바타 | 관리자 계정 메뉴 진입 또는 표시용 |

### 구현 기준

| 요소 | 구현 |
|---|---|
| CMS 로고 | 코드 텍스트 |
| 검색 입력 | input 또는 disabled placeholder |
| 권한 표시 | 현재 role 텍스트 표시 |
| 아바타 | CSS 원형 또는 이니셜 표시 |

### 검색 입력 정책

MVP에서는 전역 검색 기능을 필수 구현하지 않는다.

```txt
검색 기능 미구현 시 input은 disabled 처리하거나 placeholder만 표시한다.
동작하지 않는 검색창을 활성 상태로 두지 않는다.
```

---

## 8.2 Sidebar Menu

### 메뉴 구성

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

### 메뉴 동작

| 상태 | 처리 |
|---|---|
| 현재 메뉴 | active 스타일 표시 |
| 권한 있는 메뉴 | 클릭 시 해당 Route 이동 |
| 권한 없는 메뉴 | 사이드바에 표시하지 않음 |
| 직접 URL 접근 | A24 접근 권한 부족 화면 표시 |

---

## 8.3 Page Title 영역

### 구성

```txt
운영 대시보드
Asia/Seoul 기준 · 오늘 00:00~현재
```

### 표시 기준

| 요소 | 설명 |
|---|---|
| 페이지 타이틀 | `운영 대시보드` |
| 시간 기준 | `Asia/Seoul 기준 · 오늘 00:00~현재` |

### 시간 기준 정책

```txt
모든 대시보드 집계는 Asia/Seoul(KST)을 기준으로 계산한다.
오늘 기준은 00:00:00부터 현재 시각까지다.
```

---

## 8.4 Summary Metric Cards

대시보드 상단에는 4개의 핵심 지표 카드를 표시한다.

```txt
Visible 보물
오늘 획득 성공
오늘 발급 실패
미처리 문의
```

### 8.4.1 카드 공통 구조

```txt
카드 제목
숫자 값
보조 설명
```

### 8.4.2 카드 정의

| 순서 | 카드명 | 데이터 기준 | 클릭 시 이동 |
|---:|---|---|---|
| 1 | Visible 보물 | 현재 사용자 앱에 노출 가능한 보물 수 | `/admin/treasures?visibility=visible` |
| 2 | 오늘 획득 성공 | 오늘 생성된 성공 보상 또는 claim 수 | `/admin/rewards?date=today&status=ready,issued,used` |
| 3 | 오늘 발급 실패 | 오늘 failed 상태가 된 보상 수 | `/admin/rewards?date=today&status=failed` |
| 4 | 미처리 문의 | `open`, `in_progress` 문의 합산 | `/admin/inquiries?status=open,in_progress` |

### 8.4.3 Visible 보물 계산 기준

```txt
treasure_boxes.deleted_at is null
treasure_boxes.status = active
treasure_boxes.starts_at <= now
treasure_boxes.ends_at >= now
treasure_boxes.current_claim_count < treasure_boxes.max_claim_count
treasure_boxes.latitude is not null
treasure_boxes.longitude is not null
활성 상품 매칭 1개 존재
```

### 8.4.4 오늘 획득 성공 계산 기준

```txt
기준 시간: Asia/Seoul 오늘 00:00~현재
대상: 오늘 생성된 보상 또는 오늘 획득 성공 claim
상태 기준: ready, issued, used 중 정책에 맞는 성공 상태
```

주의:

```txt
오늘 획득 성공은 쿠폰 발급 성공만 의미하지 않는다.
AR 사냥 성공 후 보상 수령권이 생성된 건을 기준으로 한다.
```

### 8.4.5 오늘 발급 실패 계산 기준

```txt
기준 시간: Asia/Seoul 오늘 00:00~현재
대상: rewards.status = failed
설명: 기프티쇼비즈 발급 실패 또는 서버 발급 실패
```

### 8.4.6 미처리 문의 계산 기준

```txt
inquiries.status in ('open', 'in_progress')
```

### 8.4.7 로딩 상태

데이터 조회 중에는 카드 숫자 위치에 skeleton bar를 표시한다.

```txt
카드 제목은 즉시 표시
숫자 값은 skeleton 표시
보조 설명은 skeleton 또는 고정 문구 표시
```

---

## 8.5 최근 현황 테이블

### 8.5.1 화면 목적

최근 현황 테이블은 운영자가 가장 최근에 발생한 주요 운영 이벤트를 한 번에 확인하는 영역이다.

와이어프레임 기준 컬럼은 다음과 같다.

```txt
구분 / 항목 / 유저 / 상태 / 일시
```

### 8.5.2 컬럼 정의

| 컬럼 | 설명 | 예시 |
|---|---|---|
| 구분 | 이벤트 유형 | 보물 획득 / 발급 실패 / 문의 |
| 항목 | 보물명, 상품명, 문의 제목 등 | 강남역 보물상자 / 아메리카노 / 쿠폰 오류 문의 |
| 유저 | 사용자 식별용 표시명 | 닉네임 또는 user_id 축약 |
| 상태 | 현재 상태 | ready / issued / failed / open / in_progress |
| 일시 | 발생 시각 | 2026-07-26 14:22 |

### 8.5.3 사용자 표시 정책

MVP 관리자 CMS에서는 사용자 이메일을 수집·조회·표시하지 않는다.

따라서 최근 현황의 유저 컬럼은 아래 중 하나만 사용한다.

```txt
profiles.nickname
user_id 축약값
익명 사용자 표기
```

금지:

```txt
사용자 이메일
쿠폰 번호
바코드 원문
전화번호
민감 개인정보
```

### 8.5.4 포함 이벤트

MVP 최근 현황에는 다음 이벤트를 포함한다.

| 구분 | 데이터 기준 | 클릭 시 이동 |
|---|---|---|
| 보물 획득 | 최근 reward 또는 claim 생성 | `/admin/rewards/{rewardId}` |
| 발급 실패 | 최근 failed reward | `/admin/rewards/{rewardId}` |
| 문의 | 최근 open/in_progress inquiry | `/admin/inquiries/{inquiryId}` |

### 8.5.5 포함하지 않는 이벤트

```txt
관리자 계정 생성/변경 이력
민감 운영 로그
보안 로그
관리자 로그인 로그
쿠폰 번호 조회 이력
```

관리자 작업 이력은 운영 로그 화면에서 확인한다.
대시보드 최근 현황에는 사용자 운영 이벤트만 노출한다.

---

## 8.6 안내 문구

와이어프레임 하단에는 대시보드 집계 기준 안내 문구를 표시한다.

### 문구

```txt
대시보드 집계는 Asia/Seoul(KST) 기준으로 계산되며 최대 1분 지연이 있을 수 있습니다. 쿠폰·이메일 등 민감 정보는 표시되지 않습니다.
```

### 목적

- 집계 시간 기준을 명확히 안내한다.
- 실시간이 아니라 최대 1분 지연될 수 있음을 안내한다.
- 민감 정보 미표시 정책을 안내한다.

---

## 8.7 빠른 링크 영역

### 구성

와이어프레임 우하단에는 다음 빠른 링크가 있다.

```txt
상품 목록
매칭 목록
유저 목록
운영 로그
```

### 권한별 노출

| 링크 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 상품 목록 | O | O | O |
| 매칭 목록 | O | O | O |
| 유저 목록 | O | O | O |
| 운영 로그 | O | O | X |

### 구현 원칙

```txt
빠른 링크도 사이드바와 동일한 권한 필터를 적용한다.
viewer에게 운영 로그 링크를 노출하지 않는다.
```

---

## 9. 데이터 연동 기준

## 9.1 사용 데이터

| 데이터 | 용도 |
|---|---|
| `treasure_boxes` | Visible 보물 수 계산 |
| `treasure_product_mappings` | 활성 상품 매칭 여부 확인 |
| `products` | 보상/상품명 표시 |
| `rewards` | 오늘 획득 성공, 발급 실패, 최근 현황 |
| `profiles` | 유저 닉네임 또는 표시명 |
| `inquiries` | 미처리 문의, 최근 문의 |
| `admin_profiles` | 관리자 role 및 상태 확인 |

---

## 9.2 권장 API

### 대시보드 요약 조회

```txt
GET /api/admin/dashboard/summary
```

### 응답 예시

```json
{
  "timezone": "Asia/Seoul",
  "range": {
    "from": "2026-07-26T00:00:00+09:00",
    "to": "2026-07-26T14:30:00+09:00"
  },
  "metrics": {
    "visibleTreasures": 12,
    "todayClaims": 38,
    "todayFailedRewards": 2,
    "pendingInquiries": 7
  }
}
```

### 최근 현황 조회

```txt
GET /api/admin/dashboard/recent-events
```

### 응답 예시

```json
{
  "items": [
    {
      "id": "event_001",
      "type": "reward_failed",
      "label": "발급 실패",
      "title": "스타벅스 아메리카노",
      "userDisplayName": "헌터123",
      "status": "failed",
      "occurredAt": "2026-07-26T14:22:00+09:00",
      "targetRoute": "/admin/rewards/reward_001"
    }
  ]
}
```

---

## 9.3 서버 보안 기준

```txt
대시보드 API는 서버에서 관리자 세션을 검증한다.
role이 없는 계정은 응답하지 않는다.
inactive 계정은 응답하지 않는다.
브라우저에 SUPABASE_SERVICE_ROLE_KEY를 노출하지 않는다.
쿠폰 번호와 바코드 원문은 어떤 대시보드 API에도 포함하지 않는다.
사용자 이메일은 응답에 포함하지 않는다.
```

---

## 10. 상태 정의

## 10.1 화면 상태

```ts
type AdminDashboardStatus =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'forbidden';
```

### 상태별 처리

| 상태 | 처리 |
|---|---|
| loading | 카드와 테이블에 skeleton 표시 |
| ready | 지표와 최근 현황 표시 |
| empty | 지표는 0, 테이블은 빈 상태 표시 |
| error | 조회 실패 안내와 다시 시도 버튼 표시 |
| forbidden | A24 접근 권한 부족 화면으로 이동 |

---

## 10.2 Metric Card 상태

| 상태 | 처리 |
|---|---|
| loading | 숫자 영역 skeleton |
| ready | 실제 숫자 표시 |
| zero | `0` 표시, 경고 상태 아님 |
| error | `-` 표시 또는 카드 내 오류 표시 |

---

## 10.3 최근 현황 테이블 상태

| 상태 | 처리 |
|---|---|
| loading | skeleton row 8개 표시 |
| empty | `최근 현황이 없습니다.` 표시 |
| ready | 최근 이벤트 목록 표시 |
| error | `최근 현황을 불러오지 못했습니다.` 표시 |

---

## 11. 인터랙션 정의

## 11.1 Metric Card 클릭

| 카드 | 클릭 동작 |
|---|---|
| Visible 보물 | 보물상자 목록으로 이동, visible 필터 적용 |
| 오늘 획득 성공 | 보상 목록으로 이동, 오늘 획득 필터 적용 |
| 오늘 발급 실패 | 보상 목록으로 이동, failed 필터 적용 |
| 미처리 문의 | 문의 목록으로 이동, open+in_progress 필터 적용 |

## 11.2 최근 현황 Row 클릭

| 구분 | 클릭 동작 |
|---|---|
| 보물 획득 | 보상 상세 이동 |
| 발급 실패 | 보상 상세 이동 |
| 문의 | 문의 상세 이동 |

## 11.3 사이드바 클릭

| 조건 | 처리 |
|---|---|
| 권한 있음 | 해당 화면 이동 |
| 권한 없음 | 메뉴 미노출 |
| 현재 화면 | active 표시 |

## 11.4 검색창

MVP에서 전역 검색 미구현 시 검색창은 비활성 상태로 둔다.

```txt
검색창 클릭 시 아무 동작 없음은 금지한다.
미구현이면 disabled 또는 준비중 토스트 처리한다.
```

---

## 12. 문구 정의

## 12.1 페이지 문구

| 위치 | 문구 |
|---|---|
| 페이지 타이틀 | `운영 대시보드` |
| 시간 기준 | `Asia/Seoul 기준 · 오늘 00:00~현재` |
| 안내 문구 | `대시보드 집계는 Asia/Seoul(KST) 기준으로 계산되며 최대 1분 지연이 있을 수 있습니다. 쿠폰·이메일 등 민감 정보는 표시되지 않습니다.` |

## 12.2 Metric Card 문구

| 카드 | 제목 | 보조 문구 |
|---|---|---|
| Visible 보물 | `Visible 보물` | `현재 앱 지도 노출 중` |
| 오늘 획득 성공 | `오늘 획득 성공` | `오늘 claimed_at 기준` |
| 오늘 발급 실패 | `오늘 발급 실패` | `failed 상태 · 오늘 기준` |
| 미처리 문의 | `미처리 문의` | `open + in_progress 합산` |

## 12.3 빈 상태 문구

| 위치 | 문구 |
|---|---|
| 최근 현황 | `최근 현황이 없습니다.` |
| 지표 조회 실패 | `대시보드 정보를 불러오지 못했습니다.` |

---

## 13. 디자인 기준

## 13.1 전체 톤

관리자 CMS는 사용자 앱의 손그림 rough UI와 다르게, 운영 효율 중심의 SaaS형 관리자 화면을 따른다.

```txt
흰색 배경
얇은 회색 border
명확한 카드 구조
데스크톱 중심 레이아웃
차분한 관리자 UI
```

## 13.2 컬러 기준

| 용도 | 값 |
|---|---|
| 페이지 배경 | `#FFFFFF` |
| 외부 캔버스 배경 | `#1F1F1F` 또는 미리보기용 dark frame |
| 카드 배경 | `#FFFFFF` |
| 사이드바 배경 | `#F7F7F8` |
| Border | `#E5E7EB` |
| Primary Text | `#111827` |
| Secondary Text | `#6B7280` |
| Primary Button | `#111827` |

## 13.3 레이아웃 크기

| 요소 | 권장값 |
|---|---:|
| 전체 캔버스 최소 너비 | 1200px |
| 사이드바 너비 | 200px ~ 220px |
| 상단 헤더 높이 | 64px |
| 본문 좌우 여백 | 24px |
| 카드 간격 | 16px |
| 카드 높이 | 88px ~ 100px |
| 테이블 row 높이 | 44px ~ 52px |

---

## 14. 컴포넌트 구조

## 14.1 권장 컴포넌트

```txt
AdminLayout
AdminHeader
AdminSidebar
DashboardPageHeader
DashboardMetricCard
DashboardRecentTable
DashboardQuickLinks
DashboardNoticeText
DashboardSkeleton
DashboardEmptyState
DashboardErrorState
```

## 14.2 파일 구조 예시

```txt
app/admin/(protected)/page.tsx
components/admin/layout/AdminLayout.tsx
components/admin/dashboard/DashboardPageHeader.tsx
components/admin/dashboard/DashboardMetricCard.tsx
components/admin/dashboard/DashboardRecentTable.tsx
components/admin/dashboard/DashboardQuickLinks.tsx
components/admin/dashboard/DashboardNoticeText.tsx
server/admin/dashboard/getDashboardSummary.ts
server/admin/dashboard/getDashboardRecentEvents.ts
lib/admin/permissions.ts
lib/admin/routes.ts
```

---

## 15. 접근성 기준

| 항목 | 기준 |
|---|---|
| 페이지 제목 | `h1`으로 제공 |
| 카드 | 클릭 가능하면 `button` 또는 `a` 사용 |
| 테이블 | 실제 `table` 구조 사용 |
| skeleton | `aria-hidden=true` 처리 |
| 로딩 | 필요 시 `aria-busy=true` 적용 |
| 숫자 지표 | 스크린리더가 읽을 수 있는 텍스트 제공 |
| 사이드바 | `nav` 영역으로 구성 |
| 현재 메뉴 | `aria-current="page"` 적용 |

---

## 16. QA 체크리스트

## 16.1 접근/권한

- [ ] 비로그인 상태에서 `/admin` 접근 시 `/admin/login`으로 이동한다.
- [ ] inactive 관리자 계정은 대시보드에 접근할 수 없다.
- [ ] role 없는 계정은 A24 접근 권한 부족 화면으로 이동한다.
- [ ] super_admin은 모든 메뉴를 볼 수 있다.
- [ ] operator는 보안 로그와 관리자 메뉴를 볼 수 없다.
- [ ] viewer는 운영 로그, 보안 로그, 관리자 메뉴를 볼 수 없다.
- [ ] viewer도 대시보드 지표는 조회할 수 있다.

## 16.2 데이터

- [ ] Visible 보물 수가 조건에 맞게 계산된다.
- [ ] 오늘 획득 성공 수가 KST 기준으로 계산된다.
- [ ] 오늘 발급 실패 수가 failed 상태 기준으로 계산된다.
- [ ] 미처리 문의 수가 open + in_progress 기준으로 계산된다.
- [ ] 대시보드에 사용자 이메일이 노출되지 않는다.
- [ ] 대시보드에 쿠폰 번호와 바코드가 노출되지 않는다.
- [ ] 최대 1분 지연 안내 문구가 표시된다.

## 16.3 UI

- [ ] 로딩 중 카드와 테이블에 skeleton이 표시된다.
- [ ] 데이터가 없을 때 최근 현황 빈 상태가 표시된다.
- [ ] 데이터 조회 실패 시 오류 상태와 다시 시도 버튼이 표시된다.
- [ ] Metric Card 클릭 시 해당 목록 화면으로 이동한다.
- [ ] 최근 현황 row 클릭 시 상세 화면으로 이동한다.
- [ ] 전역 검색 미구현 시 검색창이 비활성 처리된다.

---

## 17. 개발 메모

```txt
이 화면은 운영자가 매일 가장 먼저 보는 화면이다.
따라서 숫자 정확성, 권한 필터링, 민감 정보 미노출이 가장 중요하다.

대시보드에서는 문제를 직접 처리하지 않고,
문제가 있는 목록과 상세 화면으로 빠르게 이동시키는 역할에 집중한다.
```
