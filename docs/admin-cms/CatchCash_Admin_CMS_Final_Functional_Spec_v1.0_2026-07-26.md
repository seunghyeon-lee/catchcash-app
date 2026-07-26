# 캐치캐쉬 관리자 CMS 최종 기능명세서

> 문서 버전: `v1.0`  
> 확정일: `2026-07-26`  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 사용 목적: 화면별 와이어프레임 제작, UI 설계, 프론트엔드·백엔드 개발, QA 기준  
> 연계 제품: 캐치캐쉬 사용자 앱, Supabase 백엔드, 기프티쇼비즈 발급 시스템

---

# 0. 문서 사용 원칙

이 문서는 캐치캐쉬 관리자 CMS의 최종 기능·화면·권한·상태·데이터 연동 기준을 정의한다.

와이어프레임 제작 시 다음 순서로 사용한다.

```txt
본 최종 기능명세서
→ 최종 유저플로우
→ 화면 목록과 Route
→ 화면별 와이어프레임
→ 화면별 상세 MD
→ 디자인 시안
→ 개발
```

문서 간 내용이 충돌할 경우 본 문서를 우선한다.

## 0.1 최종 확정 정책

```txt
관리자 계정은 super_admin이 직접 생성한다.
관리자 계정 초대 메일과 초대 링크는 사용하지 않는다.

관리자 CMS 역할은 super_admin, operator, viewer 3개다.
viewer는 별도 기능이 아니라 조회 전용 권한 역할이다.

사용자 앱은 Google, Kakao, Apple 소셜 로그인을 사용한다.
MVP 관리자 CMS에서는 사용자 이메일을 수집·조회·표시하지 않는다.

보물상자당 활성 상품은 1개만 연결한다.
MVP 지급 방식은 확정 지급만 사용한다.

실제 쿠폰 발급은 사용자 앱과 서버 발급 함수가 수행한다.
CMS는 쿠폰 번호와 바코드 원문 또는 마스킹 값을 표시하지 않는다.

보상 상태는 ready, issued, failed, used, expired, canceled로 관리한다.
processing은 보상 상태로 사용하지 않는다.

관리자 재처리 요청은 failed 상태를 유지한 채 별도 요청 이력으로 관리한다.
CMS 화면이 기프티쇼비즈 API를 직접 호출하지 않는다.

보물 삭제는 소프트 삭제이며, 복구 시 항상 inactive가 된다.

보안 로그와 민감 운영 로그는 super_admin만 조회한다.
일반 운영 로그는 super_admin과 operator가 조회한다.
viewer는 로그를 조회하지 않는다.
```

---

# 1. 제품 개요

## 1.1 한 줄 정의

위치 기반 AR 보물찾기 서비스 캐치캐쉬를 운영하기 위한 웹 기반 관리자 CMS.

## 1.2 제품 목표

운영자가 Supabase 콘솔이나 SQL을 직접 사용하지 않고 다음 업무를 수행할 수 있게 한다.

- 관리자 계정과 권한 관리
- 현재 운영 현황 확인
- 보물상자 위치·기간·수량·힌트 관리
- 상품 등록과 보물상자 연결
- 사용자 보상 발급 상태 확인
- 발급 실패 후속 처리
- 사용자와 문의 관리
- 치팅 의심 로그 확인과 유저 제재
- 주요 관리자 작업의 감사 로그 확인

## 1.3 대상 사용자

### super_admin

전체 기능과 위험 액션을 수행하는 최고 관리자다.

주요 업무:

- 관리자 계정 생성·역할 변경·비활성화
- 보물상자 삭제·복구
- 유저 정지·해제
- 보안 로그와 민감 운영 로그 조회
- 일반 운영 업무 전체 수행

### operator

일반 운영 업무를 수행하는 운영 담당자다.

주요 업무:

- 보물상자 등록·수정
- 상품 등록·수정
- 보물-상품 매칭
- 보상 상태 확인과 재처리 요청
- 문의 답변과 상태 변경
- 일반 운영 로그 확인

### viewer

조회 전용 관리자 역할이다.

주요 업무:

- 대시보드 현황 조회
- 보물·상품·보상·유저·문의 목록과 상세 조회

제한:

- 모든 생성·수정·삭제·상태 변경 불가
- 관리자 메모 작성 불가
- 로그 조회 불가
- 민감 정보 조회 불가

---

# 2. MVP 범위

## 2.1 MVP 포함

- 관리자 이메일·비밀번호 로그인
- super_admin의 관리자 계정 직접 생성
- 관리자 역할 변경·비활성화·비밀번호 재설정
- 역할 기반 접근 제어
- 운영 대시보드
- 보물상자 목록·등록·상세·수정
- 보물상자 소프트 삭제·inactive 복구
- 상품 목록·등록·상세·수정
- 보물상자당 활성 상품 1개 연결
- 보상 목록·상세·상태 조회
- 발급 실패 사유와 재처리 요청 이력
- 사용자 목록·상세·정지·해제
- 문의 목록·상세·답변·상태 변경·내부 메모
- 보안 로그 목록·상세·연관 로그
- 일반 운영 로그와 민감 운영 로그
- CSV 내보내기
- 공통 로딩·빈 상태·조회 실패·저장 실패 처리

## 2.2 MVP 제외

- 관리자 초대 메일·초대 링크
- 관리자 계정 물리 삭제
- 2단계 인증
- 사용자 이메일 수집·조회
- 보물상자당 다중 활성 상품
- 랜덤 지급·확률 지급·대체 상품
- 상품별 별도 지급 수량
- 쿠폰 번호·바코드 관리자 조회
- 쿠폰 언마스킹
- CMS 브라우저에서 기프티쇼 API 직접 호출
- 자동 치팅 확정 및 자동 제재
- 실시간 상담 채팅
- 문의 첨부파일
- Excel 전용 내보내기
- 고급 BI 차트와 통계 분석
- 관리자 간 업무 배정
- 관리자 계정 셀프 비밀번호 찾기
- 상품 API 자동 동기화

## 2.3 P1 이후 확장

- 다중 상품과 랜덤 지급
- 상품별 재고와 확률
- 관리자 초대·비밀번호 찾기
- 외부 상품 카탈로그 자동 동기화
- 실제 쿠폰 사용 상태 연동
- 문의 담당자 배정
- 로그 장기 아카이빙 화면
- 이벤트 캠페인 단위 관리
- 통계 대시보드
- 관리자 2단계 인증

---

# 3. 기술 스택

## 3.1 전체 구조

MVP는 기존 캐치캐쉬 Next.js 프로젝트 안에 `/admin` Route Group을 추가하는 방식으로 구성한다.

```txt
사용자 앱:
Next.js + React + TypeScript + Tailwind CSS
Capacitor WebView로 iOS/Android 앱 제공

관리자 CMS:
같은 Next.js 프로젝트의 /admin 영역
독립 AdminLayout과 Admin Component Namespace 사용

공통 백엔드:
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Supabase Row Level Security
Supabase RPC
Supabase Edge Functions
```

## 3.2 관리자 CMS 프론트엔드

| 구분 | 기술 | 용도 |
|---|---|---|
| Framework | Next.js App Router | 라우팅, 서버 컴포넌트, 서버 액션 |
| UI | React | 관리자 화면 컴포넌트 |
| Language | TypeScript | 강타입 및 상태 모델 |
| Styling | Tailwind CSS | 관리자 SaaS 레이아웃 |
| UI Components | shadcn/ui 또는 공통 Headless UI | Dialog, Select, Tabs, Dropdown |
| Form | React Hook Form | 입력 폼 관리 |
| Validation | Zod | 클라이언트·서버 공통 검증 |
| Server State | TanStack Query | 목록·상세·재조회·캐시 |
| Table | TanStack Table | 정렬·필터·페이지네이션 |
| Date | date-fns | 기간과 날짜 표시 |
| Map | Naver Maps JavaScript API | 좌표 선택과 위치 미리보기 |
| Barcode | 사용자 앱 전용 | 관리자 CMS에서는 사용하지 않음 |

## 3.3 백엔드

| 구분 | 기술 | 용도 |
|---|---|---|
| Authentication | Supabase Auth | 사용자·관리자 인증 |
| Database | Supabase PostgreSQL | 운영 데이터 |
| Authorization | RLS + 서버 권한 검사 | 역할별 접근 차단 |
| Server API | Next.js Route Handler / Server Action | 관리자 CRUD |
| External API | Supabase Edge Function | 기프티쇼비즈 서버 호출 |
| Queue | `reward_retry_requests` + Edge Function Worker | 재처리 요청 비동기 처리 |
| File Storage | Supabase Storage | 상품 이미지 |
| Scheduled Job | Supabase Cron 또는 외부 Scheduler | 만료 처리·로그 정리·재처리 Worker |
| Deployment | Vercel | Next.js 배포 |
| Error Tracking | Sentry 권장 | 운영 오류 추적 |

## 3.4 보안 원칙

```txt
SUPABASE_SERVICE_ROLE_KEY는 브라우저에 노출하지 않는다.
기프티쇼비즈 Client Secret은 브라우저에 노출하지 않는다.
관리자 계정 생성은 서버 전용 Admin API에서 수행한다.
쿠폰 번호와 바코드는 관리자용 API 응답에 포함하지 않는다.
UI에서 버튼을 숨기는 것과 별개로 서버에서도 역할을 검증한다.
사용자 이메일은 관리자 조회용 테이블과 API에 포함하지 않는다.
모든 위험 액션은 서버에서 최종 권한을 재검증한다.
```

## 3.5 권장 디렉터리

```txt
app/
  (user)/
    ...

  admin/
    login/
      page.tsx

    (protected)/
      layout.tsx
      page.tsx

      admins/
      treasures/
      products/
      mappings/
      rewards/
      users/
      inquiries/
      security-logs/
      operation-logs/

components/
  admin/
    layout/
    dashboard/
    tables/
    forms/
    dialogs/
    status/
    empty/
    errors/

lib/
  admin/
    permissions.ts
    schemas.ts
    routes.ts
    queries.ts
    mutations.ts

server/
  admin/
    auth/
    treasures/
    products/
    rewards/
    users/
    inquiries/
    logs/

supabase/
  functions/
    issue-reward-coupon/
    process-reward-retry/
```

---

# 4. 시스템 연계 구조

## 4.1 사용자 앱과 CMS의 역할 분리

| 업무 | 사용자 앱 | 관리자 CMS | 서버 |
|---|---:|---:|---:|
| 소셜 로그인 | 수행 | 해당 없음 | 인증 처리 |
| 지도에서 보물 조회 | 수행 | 보물 설정 | 노출 조건 조회 |
| AR 사냥 | 수행 | 해당 없음 | 위치·수량 검증 |
| ready 보상 생성 | 결과 표시 | 상태 조회 | 생성 |
| 쿠폰 받기 | 요청 버튼 | 수행하지 않음 | 외부 API 호출 |
| 쿠폰 번호·바코드 | 사용자 본인만 조회 | 조회 불가 | 암호화 저장/재조회 |
| 발급 실패 다시 시도 | 사용자 요청 | 요청 이력 조회 | 외부 API 호출 |
| 관리자 재처리 요청 | 해당 없음 | 요청 레코드 생성 | Worker 처리 |
| 문의 등록 | 수행 | 조회·답변 | 저장·알림 생성 |
| 문의 답변 확인 | 수행 | 답변 작성 | 사용자 알림 전달 |
| 유저 정지 | 차단 결과 반영 | super_admin 실행 | 상태 변경 |
| 보안 로그 | 해당 없음 | super_admin 조회 | 생성 |

## 4.2 사용자 앱 필수 연계 변경

관리자 CMS와 정합성을 맞추기 위해 사용자 앱에 다음 기능이 필요하다.

### 보상 상세 상태 분기

```txt
ready:
쿠폰 받기 버튼

issued:
쿠폰 번호와 바코드 표시

failed:
다시 시도 버튼
문의하기 버튼

used:
사용 완료 읽기 전용

expired:
만료 읽기 전용

canceled:
지급 취소 읽기 전용
```

### 사용자 문의 답변 확인

권장 Route:

```txt
/support/inquiries
/support/inquiries/[inquiryId]
```

답변 저장 시 기존 알림함의 공지형 알림을 사용한다.

```txt
notification.type = notice
notification.subtype = inquiry_answer
deep_link = /support/inquiries/{inquiryId}
```

---

# 5. 역할별 권한 매트릭스

| 도메인 | 액션 | super_admin | operator | viewer |
|---|---|---:|---:|---:|
| 대시보드 | 운영 현황 조회 | O | O | O |
| 관리자 계정 | 목록·상세 | O | X | X |
| 관리자 계정 | 생성·역할 변경 | O | X | X |
| 관리자 계정 | 비활성화·비밀번호 재설정 | O | X | X |
| 보물상자 | 목록·상세 | O | O | O |
| 보물상자 | 등록·수정 | O | O | X |
| 보물상자 | 삭제·복구 | O | X | X |
| 상품 | 목록·상세 | O | O | O |
| 상품 | 등록·수정 | O | O | X |
| 매칭 | 조회 | O | O | O |
| 매칭 | 생성·교체·비활성화 | O | O | X |
| 보상 | 목록·상세 | O | O | O |
| 보상 | 내부 메모 | O | O | X |
| 보상 | 재처리 요청 | O | O | X |
| 유저 | 목록·상세 | O | O | O |
| 유저 | 정지·해제 | O | X | X |
| 문의 | 목록·상세 | O | O | O |
| 문의 | 답변·상태 변경·내부 메모 | O | O | X |
| 보안 로그 | 목록·상세 | O | X | X |
| 일반 운영 로그 | 목록 | O | O | X |
| 민감 운영 로그 | 목록 | O | X | X |
| CSV 내보내기 | 운영 목록 | O | O | X |

## 5.1 viewer 처리 원칙

viewer 전용 화면을 따로 만들지 않는다.

같은 화면을 사용하되 다음과 같이 처리한다.

```txt
생성·수정·삭제 버튼 숨김
행 메뉴의 변경 액션 숨김
폼 Route 직접 접근 차단
서버 Mutation 요청 차단
보안·운영 로그 메뉴 미노출
내부 메모 영역 미노출
```

---

# 6. 공통 상태 정의

# 6.1 관리자 계정 상태

| 상태 | 의미 |
|---|---|
| `active` | 로그인과 CMS 사용 가능 |
| `inactive` | 로그인과 기존 세션 접근 차단 |
| `locked` | 로그인 실패 등으로 일시 잠금 |

# 6.2 보물상자 상태

## DB 저장 기준

```txt
status: active | inactive
deleted_at: timestamp | null
```

## CMS 표시 상태

| 표시 상태 | 계산 기준 |
|---|---|
| `deleted` | `deleted_at` 존재 |
| `inactive` | 삭제 아님 + status inactive |
| `scheduled` | status active + 시작 전 |
| `visible` | status active + 기간 유효 + 잔여 수량 + 활성 상품 + 좌표 존재 |
| `expired` | status active + 종료 시각 경과 |
| `sold_out` | status active + 현재 획득 수 ≥ 최대 획득 수 |
| `invalid` | active지만 상품·좌표 등 필수 조건 누락 |

`scheduled`, `visible`, `expired`, `sold_out`, `invalid`는 DB 저장 상태가 아니라 계산 상태다.

# 6.3 상품 상태

| 상태 | 의미 |
|---|---|
| `active` | 매칭·지급에 사용 가능 |
| `inactive` | 신규 지급 대상에서 제외 |

# 6.4 보상 상태

| 상태 | 의미 | 사용자 앱 |
|---|---|---|
| `ready` | AR 획득 성공 후 쿠폰 받기 전 | 쿠폰 받기 |
| `issued` | 쿠폰 발급 완료 | 쿠폰·바코드 확인 |
| `failed` | 발급 실패 | 다시 시도·문의 |
| `used` | 사용자가 사용 완료로 표시 | 읽기 전용 |
| `expired` | 수령 또는 사용 기한 만료 | 읽기 전용 |
| `canceled` | 시스템 또는 운영 정책으로 취소 | 읽기 전용 |

중요:

```txt
processing은 보상 상태로 사용하지 않는다.
재처리 요청 대기는 failed 보상의 보조 이력이다.
used는 사용자 선언 상태이며 외부 발급사의 실제 사용 확인을 의미하지 않는다.
```

# 6.5 문의 상태

| 상태 | 의미 |
|---|---|
| `open` | 신규 접수 |
| `in_progress` | 운영자 확인 또는 처리 중 |
| `resolved` | 답변 또는 해결 완료 |
| `closed` | 최종 종료 |

대시보드 미처리 문의:

```txt
open + in_progress
```

# 6.6 재처리 요청 상태

보상 상태와 별도의 요청 상태다.

| 상태 | 의미 |
|---|---|
| `pending` | Worker 처리 대기 |
| `succeeded` | 재처리 성공 |
| `failed` | 재처리 실패 |
| `ignored` | 이미 사용자 재시도 등으로 issued가 되어 처리 불필요 |

---

# 7. 공통 UI·와이어프레임 원칙

## 7.1 화면 환경

```txt
대상: Desktop Web
기준 해상도: 1440 × 900
최소 지원 너비: 1024px
주요 콘텐츠 최대 너비: 1600px
스타일: 일반 SaaS 관리자 대시보드
```

사용자 앱의 rough 손그림 스타일을 관리자 CMS에 적용하지 않는다.

관리자 CMS는 다음 방향을 사용한다.

```txt
clean
dense but readable
neutral SaaS dashboard
white and gray
status color only
clear tables
clear forms
```

## 7.2 공통 레이아웃

```txt
좌측 사이드바
→ 상단 헤더
→ 페이지 제목/설명
→ 주요 액션
→ 필터 또는 요약
→ 콘텐츠
→ 토스트/확인 팝업
```

### 사이드바 메뉴

```txt
대시보드
보물상자
상품
보물-상품 매칭
보상
유저
문의
보안 로그     super_admin만
운영 로그     super_admin/operator
관리자 계정   super_admin만
```

### 상단 헤더

```txt
현재 페이지 Breadcrumb
현재 관리자 역할 배지
관리자 이름 또는 관리자 이메일
로그아웃
```

## 7.3 목록 공통 구성

```txt
Page Header
→ 요약 또는 전체 건수
→ 검색
→ 필터
→ 초기화
→ CSV 내보내기
→ Table
→ Pagination
```

목록 화면은 다음 상태를 반드시 가진다.

- 최초 로딩
- 검색 중
- 데이터 없음
- 검색 결과 없음
- 조회 실패
- 다시 시도
- 권한 부족
- 부분 데이터 로딩 실패

## 7.4 폼 공통 구성

```txt
Page Header
→ 기본 정보
→ 운영 설정
→ 연관 데이터
→ 하단 고정 액션 바
```

폼 동작:

```txt
저장 중 버튼 비활성화
중복 저장 차단
저장 실패 시 입력값 유지
취소 시 목록 또는 상세 복귀
미저장 변경이 있으면 이탈 확인
권한 부족 시 폼 Route 접근 차단
```

## 7.5 상세 공통 구성

```txt
Page Header + 상태 배지 + 액션
→ 핵심 정보 Summary
→ 상세 정보
→ 연관 항목
→ 이력
→ 내부 메모
```

## 7.6 위험 액션 팝업

적용 대상:

- 관리자 계정 비활성화
- 관리자 비밀번호 재설정
- 보물상자 삭제·복구
- 유저 정지·해제
- 보상 재처리 요청

팝업 필수 요소:

```txt
액션 제목
대상 식별 정보
영향 설명
사유 입력
취소
확인
```

---

# 8. 전체 화면 목록 및 Route

| ID | 화면명 | Route | 역할 | 와이어프레임 |
|---|---|---|---|---|
| A01 | 관리자 로그인 | `/admin/login` | 전체 관리자 | 필수 |
| A02 | 대시보드 | `/admin` | 전체 관리자 | 필수 |
| A03 | 관리자 계정 목록 | `/admin/admins` | super_admin | 필수 |
| A04 | 관리자 계정 생성 | `/admin/admins/new` | super_admin | 필수 |
| A05 | 관리자 계정 상세 | `/admin/admins/[id]` | super_admin | 필수 |
| A06 | 보물상자 목록 | `/admin/treasures` | 전체 관리자 | 필수 |
| A07 | 보물상자 등록 | `/admin/treasures/new` | super_admin/operator | 필수 |
| A08 | 보물상자 상세 | `/admin/treasures/[id]` | 전체 관리자 | 필수 |
| A09 | 보물상자 수정 | `/admin/treasures/[id]/edit` | super_admin/operator | 필수 |
| A10 | 상품 목록 | `/admin/products` | 전체 관리자 | 필수 |
| A11 | 상품 등록 | `/admin/products/new` | super_admin/operator | 필수 |
| A12 | 상품 상세·수정 | `/admin/products/[id]` | 전체 관리자 | 필수 |
| A13 | 보물-상품 매칭 목록 | `/admin/mappings` | 전체 관리자 | 필수 |
| A14 | 매칭 등록·교체 | `/admin/mappings/[treasureId]` | super_admin/operator | 필수 |
| A15 | 보상 목록 | `/admin/rewards` | 전체 관리자 | 필수 |
| A16 | 보상 상세 | `/admin/rewards/[id]` | 전체 관리자 | 필수 |
| A17 | 유저 목록 | `/admin/users` | 전체 관리자 | 필수 |
| A18 | 유저 상세 | `/admin/users/[id]` | 전체 관리자 | 필수 |
| A19 | 문의 목록 | `/admin/inquiries` | 전체 관리자 | 필수 |
| A20 | 문의 상세 | `/admin/inquiries/[id]` | 전체 관리자 | 필수 |
| A21 | 보안 로그 목록 | `/admin/security-logs` | super_admin | 필수 |
| A22 | 보안 로그 상세 | `/admin/security-logs/[id]` | super_admin | 필수 |
| A23 | 운영 로그 목록 | `/admin/operation-logs` | super_admin/operator | 필수 |
| A24 | 접근 제한 | `/admin/forbidden` | 인증 관리자 | 공통 |
| A25 | 오류 화면 | `/admin/error` | 인증 관리자 | 공통 |

## 8.1 공통 팝업 와이어프레임

| ID | 팝업 |
|---|---|
| P01 | 관리자 계정 비활성화 확인 |
| P02 | 관리자 비밀번호 재설정 |
| P03 | 보물 삭제 확인 |
| P04 | 보물 복구 확인 |
| P05 | 유저 정지 확인 |
| P06 | 유저 정지 해제 확인 |
| P07 | 보상 재처리 요청 |
| P08 | 미저장 변경 이탈 확인 |

---

# 9. 화면별 기능명세

# A01. 관리자 로그인

## 목적

관리자 이메일과 비밀번호로 CMS 세션을 생성한다.

## 화면 구성

```txt
CMS 로고/서비스명
이메일 입력
비밀번호 입력
로그인 버튼
오류 메시지
```

## 입력

| 필드 | 필수 | 검증 |
|---|---:|---|
| 관리자 이메일 | O | 이메일 형식 |
| 비밀번호 | O | 빈 값 차단 |

## 동작

```txt
로그인 성공 → /admin
일반 실패 → 오류 안내 후 화면 유지
inactive 계정 → 접근 불가 안내
locked 계정 → 잠금 안내
이미 로그인 → 역할 확인 후 /admin
```

## 제외

- 회원가입
- 초대 링크
- 비밀번호 찾기
- 소셜 로그인
- 사용자 앱 로그인

---

# A02. 대시보드

## 목적

현재 서비스 운영 상태를 한 화면에서 확인한다.

## 요약 카드

| 카드 | 집계 기준 | 클릭 이동 |
|---|---|---|
| 현재 노출 가능 보물 | `visible` 계산 상태 | 보물 목록 `visible` 조건 |
| 오늘 획득 성공 | 오늘 생성된 보상 획득 | 보상 목록 오늘 획득 |
| 쿠폰 발급 실패 | 보상 `failed` | 보상 목록 `failed` |
| 미처리 문의 | `open + in_progress` | 문의 목록 미처리 |

서비스 표준 타임존:

```txt
Asia/Seoul
```

## 최근 운영 현황

- 최근 보물 획득
- 최근 발급 실패
- 최근 문의

감사 로그가 아니라 서비스 활동 정보다.

viewer도 볼 수 있다.

## 와이어프레임 구성

```txt
페이지 제목
→ 4개 요약 카드
→ 최근 보물 획득
→ 최근 발급 실패
→ 최근 문의
```

---

# A03. 관리자 계정 목록

## 역할

super_admin 전용.

## 컬럼

- 관리자 ID
- 관리자 이메일
- 역할
- 상태
- 마지막 로그인
- 생성일
- 생성자
- 행 메뉴

## 검색·필터

```txt
이메일 검색
역할 필터
상태 필터
```

## 액션

- 관리자 계정 생성
- 역할 변경
- 비활성화
- 비밀번호 재설정
- 잠금 해제

---

# A04. 관리자 계정 생성

## 역할

super_admin 전용.

## 입력

| 필드 | 필수 | 기준 |
|---|---:|---|
| 관리자 이메일 | O | 중복 불가 |
| 초기 비밀번호 | O | 최소 10자 권장 |
| 역할 | O | super_admin/operator/viewer |
| 상태 | O | 기본 active |

## 동작

```txt
서버 전용 Supabase Admin API 호출
→ Auth 계정 생성
→ admin_profiles 생성
→ 운영 로그 기록
```

초대 메일은 발송하지 않는다.

---

# A05. 관리자 계정 상세

## 표시

- 관리자 이메일
- 관리자 ID
- 역할
- 상태
- 잠금 상태
- 생성일
- 마지막 로그인
- 최근 계정 관련 이력

## 액션

- 역할 변경
- 계정 비활성화
- 잠금 해제
- 비밀번호 재설정

보호 규칙:

```txt
본인 계정 비활성화 차단
마지막 active super_admin 비활성화 차단
마지막 active super_admin 역할 하향 차단
```

---

# A06. 보물상자 목록

## 표시 컬럼

- 보물 ID
- 제목
- 위치 표시 문구
- 저장 상태
- 계산 상태
- 노출 시작·종료
- 최대 획득 수
- 현재 획득 수
- 남은 수량
- 활성 상품
- 수정일

## 필터

### 저장 상태

```txt
전체
active
inactive
deleted
```

### 계산 상태

```txt
전체
scheduled
visible
expired
sold_out
invalid
```

### 기타

- 지역/위치 검색
- 노출 기간
- 상품 연결 여부

## 기본 동작

```txt
기본 목록은 deleted 제외
deleted 필터 선택 시 삭제 항목 표시
상세 복귀 시 조건 유지
```

---

# A07. 보물상자 등록

## 섹션 1 — 기본 정보

| 필드 | 필수 |
|---|---:|
| 보물 제목 | O |
| 운영 설명 | X |
| 사용자 표시 위치 문구 | O |
| 기본 힌트 | O |
| 추가 힌트 | X |

## 섹션 2 — 위치

| 필드 | 필수 |
|---|---:|
| 위도 | O |
| 경도 | O |
| 사냥 가능 반경(m) | O |

Naver Map에서 핀을 이동해 좌표를 선택할 수 있다.

## 섹션 3 — 운영 조건

| 필드 | 필수 |
|---|---:|
| 노출 시작 시각 | O |
| 노출 종료 시각 | O |
| 최대 획득 가능 수량 | O |
| 초기 상태 | O |

기본 초기 상태:

```txt
inactive
```

## 검증

```txt
위도 -90~90
경도 -180~180
반경 1 이상
종료 시각 > 시작 시각
최대 수량 1 이상의 정수
```

---

# A08. 보물상자 상세

## 상단

- 제목
- 저장 상태
- 계산 상태
- 수정 버튼
- 삭제 또는 복구 버튼

viewer는 수정·삭제·복구 버튼이 없다.

## 정보 영역

- 기본 정보
- 지도 위치 미리보기
- 힌트
- 운영 기간
- 반경
- 수량
- 현재 활성 상품
- 최근 획득 내역
- 관련 보안 로그 요약: super_admin만
- 최근 운영 이력: super_admin/operator

## 삭제 항목

deleted 상태는 다음을 추가 표시한다.

- 삭제 시각
- 삭제자
- 삭제 사유
- 복구 버튼: super_admin

---

# A09. 보물상자 수정

등록 폼과 같은 구조를 사용한다.

추가 정책:

```txt
현재 획득 수는 수정 불가
최대 획득 수는 현재 획득 수보다 작게 변경 불가
active 전환 시 visible 필수 조건 검사
상품이 없거나 inactive면 active 저장 차단
```

---

# A10. 상품 목록

## 컬럼

- 상품 ID
- 이미지
- 브랜드
- 상품명
- 기프티쇼비즈 상품 ID
- 가격
- 상태
- 연결 보물 수
- 수정일

## 필터

- 상태
- 브랜드명/상품명 검색
- 연결 여부

---

# A11. 상품 등록

## 입력

| 필드 | 필수 |
|---|---:|
| 브랜드명 | O |
| 상품명 | O |
| 상품 설명 | X |
| 가격 | O |
| 상품 이미지 | O |
| 기프티쇼비즈 상품 ID | active 전환 시 O |
| 상태 | O |

상품 이미지는 Supabase Storage에 업로드한다.

---

# A12. 상품 상세·수정

## 표시

- 상품 기본 정보
- 이미지
- 외부 상품 ID
- 상태
- 연결 보물 목록
- 수정 이력 요약

## 정책

```txt
연결된 active 보물이 있는 상품을 inactive로 변경하면 경고 표시
inactive 변경 후 해당 보물은 visible 조건을 만족하지 않음
```

viewer는 조회만 가능하다.

---

# A13. 보물-상품 매칭 목록

## 컬럼

- 매칭 ID
- 보물 ID·제목
- 보물 계산 상태
- 상품 ID·상품명
- 상품 상태
- 매칭 활성 상태
- 수정일

## 정책

```txt
보물당 활성 매칭은 1개
과거 비활성 매칭 이력은 유지
```

## 필터

- 매칭 활성 여부
- 보물 검색
- 상품 검색
- 상품 상태

---

# A14. 매칭 등록·교체

## 표시

- 대상 보물 정보
- 현재 활성 상품
- 선택 가능한 active 상품 목록
- 교체 영향 안내

## 액션

```txt
활성 상품 연결
활성 상품 교체
매칭 비활성화
```

교체 시:

```txt
기존 매칭 inactive
신규 매칭 active
동일 트랜잭션
운영 로그 기록
```

---

# A15. 보상 목록

## 컬럼

- 보상 ID
- 외부 발급 요청 ID
- 유저 ID
- 닉네임
- 보물명
- 상품명
- 상태
- 획득일
- 발급 요청 시각
- 발급 완료 시각
- 최근 실패 코드
- 재처리 요청 여부

쿠폰 번호와 바코드는 표시하지 않는다.

## 필터

- 상태
- 재처리 요청 여부
- 획득 기간
- 발급 요청 기간
- 보물
- 상품
- 유저 ID/닉네임

## 기본 정렬

```txt
failed 우선
같은 우선순위는 최신 획득일 순
```

## 내보내기

MVP는 CSV만 제공한다.

viewer는 내보낼 수 없다.

---

# A16. 보상 상세

## 상단

- 보상 ID
- 보상 상태
- 재처리 요청 배지
- 재처리 요청 버튼: super_admin/operator
- 내부 메모 작성: super_admin/operator

## 기본 정보

- 유저
- 보물
- 상품
- 획득일
- 발급 요청·완료 시각
- 외부 발급 요청 ID
- 발급 전 수령 기한
- 발급 후 쿠폰 사용 기한

## 실패 정보

failed 상태일 때:

- 실패 코드
- 실패 사유
- 실패 시각
- 사용자 재시도 횟수
- 최근 재처리 요청
- 요청 대기 경과 시간

## 연관 항목

- 관련 문의
- 유저 상세
- 같은 유저의 다른 보상
- 보안 로그: super_admin만

## 쿠폰 정보

```txt
쿠폰 번호 표시 안 함
마스킹 쿠폰 번호 표시 안 함
바코드 표시 안 함
원문 조회 버튼 없음
```

---

# A17. 유저 목록

## 컬럼

- 유저 ID
- 닉네임
- 로그인 제공자
- 상태
- 가입일
- 최근 활동일
- 획득 수
- 문의 수

## 표시하지 않는 정보

- 사용자 이메일
- 전화번호
- 소셜 인증 토큰

## 필터

- 닉네임
- 유저 ID
- 로그인 제공자
- 상태
- 가입 기간
- 최근 활동 기간

---

# A18. 유저 상세

## 표시

- 유저 ID
- 닉네임
- 로그인 제공자
- 상태
- 가입일
- 최근 활동일
- 보상 목록
- 문의 목록
- 내부 관리자 메모: super_admin/operator
- 보안 로그: super_admin만

## 액션

super_admin:

- 유저 정지
- 정지 해제

operator/viewer:

- 상태 변경 불가

## 정지 효과

```txt
사용자 앱 보호 Route 접근 차단
AR 획득 요청 차단
쿠폰 발급 요청 차단
기존 문의와 보상 조회 정책은 별도 서버 기준에 따름
```

MVP 권장:

```txt
정지 유저는 로그인 세션은 유지할 수 있으나 핵심 서비스 액션을 차단하고 안내 화면을 표시한다.
```

---

# A19. 문의 목록

## 컬럼

- 문의 ID
- 카테고리
- 제목
- 유저 닉네임
- 관련 보상 ID
- 관련 상품명
- 보상 상태
- 문의 상태
- 답변 여부
- 등록일

## 필터

- 카테고리
- 문의 상태
- 답변 여부
- 등록 기간
- 유저 ID/닉네임
- 관련 보상 ID

## 기본 정렬

```txt
open
→ in_progress
→ resolved
→ closed
각 상태 안에서 최신 등록일
```

담당자 컬럼과 배정 기능은 제공하지 않는다.

---

# A20. 문의 상세

## viewer 조회 영역

- 문의 제목
- 문의 내용
- 카테고리
- 유저 정보
- 등록일
- 문의 상태
- 관련 보상
- 기존 답변

## super_admin/operator 추가 영역

- 답변 작성
- 상태 변경
- 내부 관리자 메모
- 저장 이력

## 답변 저장

```txt
답변 저장
→ inquiry.answer 저장
→ answer_delivered_at 기록
→ notice 타입 알림 생성
→ 사용자 문의 상세 Deep Link
→ 운영 로그 기록
```

운영 로그에는 답변 본문과 메모 본문을 기록하지 않는다.

---

# A21. 보안 로그 목록

## 역할

super_admin 전용.

## 로그 유형

- 허용 반경 초과
- GPS 정확도 부족
- 비정상 이동 속도
- 반복 획득 시도
- 동일 보물 중복 획득 시도
- 권한 없는 요청
- 관리자 로그인 반복 실패

## 컬럼

- 로그 ID
- 유저
- 로그 유형
- 위험도
- 보물
- 측정 거리
- 허용 반경
- GPS 정확도
- 발생 시각

## 필터

- 위험도
- 로그 유형
- 유저
- 보물
- 발생 기간

---

# A22. 보안 로그 상세

## 표시

- 유저
- 요청 위치
- 기준 좌표
- 측정 거리
- 허용 반경
- 초과 거리
- GPS 정확도
- 기기 시각
- 서버 수신 시각
- 이동 속도
- 관련 보물
- 관련 보상
- 같은 유저 연관 로그
- 같은 보물 연관 로그

## 제재

단일 로그로 치팅을 확정하지 않는다.

super_admin은 여러 근거를 확인한 후 유저 상세로 이동해 정지할 수 있다.

---

# A23. 운영 로그 목록

## 로그 등급

### 민감 운영 로그

super_admin만 조회:

- 관리자 계정 생성
- 역할 변경
- 계정 비활성화
- 비밀번호 재설정
- 유저 정지·해제
- 권한 거부

### 일반 운영 로그

super_admin/operator 조회:

- 보물 등록·수정·삭제·복구
- 상품 등록·수정
- 매칭 생성·교체·비활성화
- 보상 내부 메모 작성 이벤트
- 재처리 요청·결과
- 문의 답변·상태 변경·메모 이벤트

## 컬럼

- 로그 ID
- 등급
- 실행자 ID
- 실행자 역할
- 액션
- 대상 종류
- 대상 ID
- 변경 전 값 요약
- 변경 후 값 요약
- 사유
- 결과
- 발생 시각

## 보존

```txt
민감 로그: 3년
일반 로그: 1년
보관 기간 중 수정·삭제 불가
```

---

# 10. 공통 액션 상세

# 10.1 보물 소프트 삭제

```txt
상세 화면 삭제 클릭
→ 확인 팝업
→ 사유 입력
→ deleted_at 기록
→ 사용자 앱 노출 제외
→ 운영 로그
```

# 10.2 보물 복구

```txt
deleted 상세
→ 복구 클릭
→ 확인 팝업
→ 사유 입력
→ deleted_at 제거
→ status inactive
→ 운영 로그
```

# 10.3 유저 정지

```txt
유저 상세
→ 정지 클릭
→ 근거/사유 입력
→ status suspended
→ 운영 로그
→ 사용자 앱 핵심 액션 차단
```

# 10.4 재처리 요청

```txt
failed 보상 상세
→ 재처리 요청
→ 사유·내부 메모
→ 중복 pending 검사
→ reward_retry_requests pending 생성
→ failed 상태 유지
→ Worker 처리
→ 성공 issued / 실패 failed 유지
```

사용자가 먼저 다시 시도해 issued가 되면 pending 요청은 `ignored`로 종료한다.

---

# 11. 주요 데이터 모델

# 11.1 admin_profiles

```ts
type AdminRole = 'super_admin' | 'operator' | 'viewer';
type AdminStatus = 'active' | 'inactive' | 'locked';

interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  failed_login_count: number;
  locked_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}
```

# 11.2 treasure_boxes

```ts
interface TreasureBox {
  id: string;
  title: string;
  description: string | null;
  location_label: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  hint_primary: string;
  hint_secondary: string | null;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  current_claim_count: number;
  status: 'active' | 'inactive';
  deleted_at: string | null;
  deleted_by: string | null;
  deleted_reason: string | null;
  created_at: string;
  updated_at: string;
}
```

# 11.3 products

```ts
interface Product {
  id: string;
  brand_name: string;
  product_name: string;
  description: string | null;
  image_url: string;
  price_krw: number;
  provider: 'giftishow_biz';
  provider_product_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

# 11.4 treasure_product_mappings

```ts
interface TreasureProductMapping {
  id: string;
  treasure_id: string;
  product_id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

DB 제약:

```txt
같은 treasure_id에서 is_active = true는 최대 1개
```

# 11.5 rewards

```ts
type RewardStatus =
  | 'ready'
  | 'issued'
  | 'failed'
  | 'used'
  | 'expired'
  | 'canceled';

interface Reward {
  id: string;
  user_id: string;
  treasure_id: string;
  product_id: string;
  status: RewardStatus;
  provider_request_id: string | null;
  claimed_at: string;
  issue_requested_at: string | null;
  issued_at: string | null;
  claim_expires_at: string | null;
  coupon_expires_at: string | null;
  failed_code: string | null;
  failed_reason: string | null;
  failed_at: string | null;
  retry_count: number;
  user_marked_used_at: string | null;
  canceled_at: string | null;
}
```

쿠폰 원문은 별도 보안 저장소 또는 암호화 컬럼에서 관리하며 관리자 Select에 포함하지 않는다.

# 11.6 reward_retry_requests

```ts
type RewardRetryRequestStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'ignored';

interface RewardRetryRequest {
  id: string;
  reward_id: string;
  requested_by_admin_id: string;
  request_reason: string;
  request_memo: string | null;
  status: RewardRetryRequestStatus;
  provider_request_id: string | null;
  result_code: string | null;
  result_message: string | null;
  requested_at: string;
  handled_at: string | null;
}
```

# 11.7 profiles

```ts
interface UserProfile {
  id: string;
  nickname: string;
  auth_provider: 'google' | 'kakao' | 'apple';
  status: 'active' | 'suspended';
  created_at: string;
  last_active_at: string | null;
}
```

사용자 이메일 필드를 CMS 조회 모델에 포함하지 않는다.

# 11.8 inquiries

```ts
type InquiryStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Inquiry {
  id: string;
  user_id: string;
  reward_id: string | null;
  category: string;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
  answer_delivered_at: string | null;
  created_at: string;
  updated_at: string;
}
```

# 11.9 operation_logs

```ts
interface OperationLog {
  id: string;
  sensitivity: 'general' | 'sensitive';
  actor_admin_id: string;
  actor_role: AdminRole;
  action_type: string;
  target_type: string;
  target_id: string;
  before_summary: Record<string, unknown> | null;
  after_summary: Record<string, unknown> | null;
  reason: string | null;
  result: 'success' | 'failure';
  created_at: string;
}
```

---

# 12. API·서버 액션 기준

## 인증

```txt
POST /api/admin/auth/login
POST /api/admin/auth/logout
```

## 관리자 계정

```txt
GET    /api/admin/admins
POST   /api/admin/admins
GET    /api/admin/admins/:id
PATCH  /api/admin/admins/:id/role
PATCH  /api/admin/admins/:id/status
POST   /api/admin/admins/:id/reset-password
```

## 보물

```txt
GET    /api/admin/treasures
POST   /api/admin/treasures
GET    /api/admin/treasures/:id
PATCH  /api/admin/treasures/:id
POST   /api/admin/treasures/:id/delete
POST   /api/admin/treasures/:id/restore
```

## 상품·매칭

```txt
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id

GET    /api/admin/mappings
POST   /api/admin/mappings/:treasureId/activate
POST   /api/admin/mappings/:treasureId/deactivate
```

## 보상

```txt
GET    /api/admin/rewards
GET    /api/admin/rewards/:id
POST   /api/admin/rewards/:id/notes
POST   /api/admin/rewards/:id/retry-requests
```

## 유저·문의

```txt
GET    /api/admin/users
GET    /api/admin/users/:id
POST   /api/admin/users/:id/suspend
POST   /api/admin/users/:id/unsuspend

GET    /api/admin/inquiries
GET    /api/admin/inquiries/:id
POST   /api/admin/inquiries/:id/answer
PATCH  /api/admin/inquiries/:id/status
POST   /api/admin/inquiries/:id/notes
```

## 로그

```txt
GET /api/admin/security-logs
GET /api/admin/security-logs/:id
GET /api/admin/operation-logs
```

---

# 13. 실패·예외 처리

## 13.1 공통 메시지

| 상황 | 메시지 |
|---|---|
| 조회 실패 | 데이터를 불러오지 못했습니다. 다시 시도해 주세요. |
| 빈 목록 | 아직 표시할 데이터가 없습니다. |
| 검색 결과 없음 | 조건에 맞는 결과가 없습니다. |
| 저장 실패 | 저장하지 못했습니다. 입력한 내용은 유지됩니다. |
| 권한 부족 | 이 작업을 수행할 권한이 없습니다. |
| 중복 저장 | 저장 중입니다. 잠시만 기다려 주세요. |
| 세션 만료 | 로그인 세션이 만료되었습니다. 다시 로그인해 주세요. |

## 13.2 도메인 예외

### 보물 active 전환 실패

- 활성 상품 없음
- 상품 inactive
- 좌표 없음
- 기간 오류
- 최대 수량 오류

### 쿠폰 발급 실패

- 외부 API 타임아웃
- 상품 ID 오류
- 예치금 부족
- 중복 발급 요청
- 이미 issued
- 수령 기한 만료

### 재처리 요청 실패

- failed 상태 아님
- pending 요청 존재
- 권한 부족
- 대상 보상 없음

---

# 14. 감사 로그 필수 기록

다음 액션은 반드시 운영 로그를 남긴다.

- 관리자 로그인 성공·실패
- 관리자 계정 생성
- 역할 변경
- 비활성화
- 비밀번호 재설정
- 보물 등록·수정·삭제·복구
- 상품 등록·수정·비활성화
- 매칭 생성·교체·비활성화
- 보상 재처리 요청·결과
- 보상 내부 메모 작성 이벤트
- 문의 답변·상태 변경·메모 작성 이벤트
- 유저 정지·해제
- 권한 거부

로그에 넣지 않는 값:

- 관리자 비밀번호
- 사용자 소셜 토큰
- 쿠폰 번호
- 바코드
- 문의 답변 본문
- 내부 메모 본문

---

# 15. 와이어프레임 제작 체크리스트

## 공통

- [ ] Sidebar가 역할에 따라 달라지는가
- [ ] Page Header에 제목·설명·주요 액션이 있는가
- [ ] 목록 검색·필터·초기화·건수가 있는가
- [ ] Table Loading·Empty·Error 상태가 있는가
- [ ] 상세 화면에 상태 배지와 주요 액션이 있는가
- [ ] viewer에서 변경 버튼이 제거되는가
- [ ] 위험 액션에 확인 팝업과 사유 입력이 있는가
- [ ] 저장 중 버튼 상태가 정의되어 있는가
- [ ] 권한 부족 화면이 있는가
- [ ] 쿠폰 정보가 CMS 어디에도 노출되지 않는가
- [ ] 사용자 이메일이 CMS 어디에도 노출되지 않는가

## 화면별 와이어프레임 완료 순서

```txt
1. Admin Global Layout
2. 관리자 로그인
3. 대시보드
4. 보물상자 목록
5. 보물상자 등록
6. 보물상자 상세
7. 보물상자 수정
8. 상품 목록
9. 상품 등록
10. 상품 상세
11. 보물-상품 매칭
12. 보상 목록
13. 보상 상세
14. 유저 목록
15. 유저 상세
16. 문의 목록
17. 문의 상세
18. 보안 로그 목록
19. 보안 로그 상세
20. 운영 로그 목록
21. 관리자 계정 목록
22. 관리자 계정 생성·상세
23. 위험 액션 팝업
24. 공통 Empty/Error/Forbidden
```

---

# 16. 개발 완료 기준

## 기능

- 역할별 Route·액션 권한이 서버와 UI에서 동일하다.
- 보물 visible 계산 결과가 사용자 앱 지도 결과와 같다.
- 한 보물에 활성 상품이 2개 이상 생성되지 않는다.
- AR 성공 후 ready 보상이 생성된다.
- 사용자 쿠폰 받기 결과가 CMS에 issued 또는 failed로 반영된다.
- CMS 재처리 요청은 failed 상태를 유지한다.
- 쿠폰 번호와 바코드가 관리자 응답에 없다.
- 사용자 이메일이 관리자 응답에 없다.
- 문의 답변이 사용자 알림과 문의 상세에 전달된다.
- 보안 로그 한 건만으로 자동 정지되지 않는다.
- 주요 관리자 액션이 감사 로그에 남는다.

## QA

- super_admin/operator/viewer 각각 테스트
- 화면 버튼 숨김과 서버 권한 차단 테스트
- 목록 조건 유지 테스트
- 보물 active 조건 테스트
- 동시 획득 수량 초과 방지 테스트
- 사용자 쿠폰 받기 다중 클릭 테스트
- 재처리 요청 중복 차단 테스트
- 정지 유저 액션 차단 테스트
- 관리자 세션 만료 테스트
