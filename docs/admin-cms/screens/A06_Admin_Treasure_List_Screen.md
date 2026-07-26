# A06. 보물상자 목록 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A06. 보물상자 목록 화면 정의서 |
| 파일명 | `A06_Admin_Treasure_List_Screen.md` |
| 화면명 | 보물상자 목록 |
| 화면 ID | `A06_Admin_Treasure_List_Screen` |
| 관련 Route | `/admin/treasures` |
| 상위 메뉴 | 보물상자 |
| 서비스 | 캐치캐쉬 CatchCash |
| 대상 | 관리자 CMS MVP |
| 작성 목적 | 와이어프레임 기준 바이브코딩을 위한 화면 단위 구현 명세 |
| 기준 문서 | `CatchCash_Admin_CMS_Final_Functional_Spec_v1.0_2026-07-26.md` / `CatchCash_Admin_CMS_Final_User_Flow_v1.0_2026-07-26.md` |
| 기준 화면 | 보물상자 목록 와이어프레임 / CSV 내보내기 확인 팝업 |

---

## 2. 화면 개요

보물상자 목록 화면은 관리자 CMS에서 등록된 보물상자를 조회하고, 상태·기간·지역·검색어 기준으로 필터링하는 운영 화면이다.

관리자는 이 화면에서 보물상자의 저장 상태, 계산 상태, 노출 기간, 획득 수량을 확인하고 상세 화면으로 이동할 수 있다.

이 화면은 보물상자를 직접 수정하는 화면이 아니다. 보물상자 수정, 삭제, 복구, 매칭 변경은 상세 화면 또는 수정 화면에서 수행한다.

```txt
관리자 로그인
→ 운영 대시보드
→ 보물상자 목록
→ 필터/검색으로 보물 조회
→ 상세 클릭
→ 보물상자 상세 또는 등록 화면 이동
```

---

## 3. 화면 목적

### 3.1 핵심 목적

- 등록된 보물상자 목록을 테이블로 조회한다.
- 보물상자명 또는 ID로 검색한다.
- 저장 상태, 계산 상태, 기간 시작, 정렬 기준으로 필터링한다.
- 보물의 운영 상태를 빠르게 확인한다.
- 보물상자 상세 화면으로 이동한다.
- 권한이 있는 관리자에게 보물상자 등록 진입점을 제공한다.
- 권한이 있는 관리자에게 CSV 내보내기 기능을 제공한다.

### 3.2 관리자 관점 목적

- 현재 운영 중인 보물이 정상적으로 노출 가능한지 확인한다.
- 예정, 만료, 매진, 조건 오류 상태의 보물을 빠르게 찾는다.
- 특정 지역이나 특정 이벤트 보물을 검색한다.
- 운영 리포트나 점검용으로 현재 필터 조건의 보물 목록을 CSV로 내려받는다.

---

## 4. 접근 권한

## 4.1 접근 가능 역할

| 역할 | 목록 조회 | 상세 이동 | 보물상자 등록 | CSV 내보내기 |
|---|---:|---:|---:|---:|
| super_admin | O | O | O | O |
| operator | O | O | O | O |
| viewer | O | O | X | X |

viewer는 같은 화면을 사용하되 조회 전용으로 동작한다.

```txt
viewer:
- 보물상자 목록 조회 가능
- 보물상자 상세 이동 가능
- 보물상자 등록 버튼 숨김
- CSV 내보내기 버튼 숨김
- 수정/삭제/복구/상태 변경 불가
```

---

## 5. 진입 조건

### 5.1 진입 시점

사용자는 아래 상황에서 보물상자 목록 화면으로 진입한다.

| 진입 경로 | 조건 |
|---|---|
| 사이드바 `보물상자` 클릭 | 관리자 세션 및 보물상자 조회 권한 보유 |
| 대시보드 Visible 보물 카드 클릭 | `calculatedStatus=visible` 필터 적용 가능 |
| 보물 등록 완료 후 | 신규 보물 저장 후 목록으로 복귀할 경우 |
| 보물 상세에서 목록 클릭 | 기존 필터 유지 후 복귀 |
| 직접 URL 접근 | 권한 검증 후 진입 또는 접근 제한 화면 이동 |

### 5.2 접근 제한 처리

| 조건 | 처리 |
|---|---|
| 관리자 세션 없음 | `/admin/login` 이동 |
| 관리자 계정 inactive | 세션 무효화 후 `/admin/login` 이동 |
| role 없음 | `/admin/access-denied` 이동 |
| 보물상자 조회 권한 없음 | `/admin/access-denied` 이동 |

---

## 6. Route

```txt
/admin/treasures
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/treasures/page.tsx
```

### 6.1 Query Parameter

목록 필터는 URL query로 유지한다.

```txt
/admin/treasures?q=강남&saveStatus=active&calculatedStatus=visible&period=preset_this_month&sort=created_desc&page=1
```

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `q` | string | 보물상자명 또는 보물 ID 검색어 |
| `saveStatus` | string | 저장 상태 필터 |
| `calculatedStatus` | string | 계산 상태 필터 |
| `period` | string | 기간 필터 |
| `sort` | string | 정렬 기준 |
| `page` | number | 현재 페이지 |
| `pageSize` | number | 페이지당 표시 수 |

---

## 7. 화면 구조

와이어프레임 기준 화면 구조는 아래 순서로 구성한다.

```txt
AdminLayout
→ 좌측 Sidebar
→ 상단 Header
→ Page Header
→ 우측 주요 액션 버튼
→ 검색/필터 바
→ 보물상자 목록 테이블
→ 실제 데이터 row 영역
→ 페이지네이션
→ CSV 내보내기 확인 팝업
```

---

## 8. 레이아웃 정의

### 8.1 전체 레이아웃

```txt
┌──────────────────────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                                      검색 권한 Aa │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │ 보물상자 목록                     [CSV] [등록] │
│               │                                              │
│ 대시보드       │ [검색] [저장 상태] [계산 상태] [기간] [정렬]    │
│ 보물상자       │                                      [초기화] │
│ 상품          │                                              │
│ 매칭          │ [목록 테이블]                                  │
│ 보상          │                                              │
│ 유저          │ [실제 데이터 row]                              │
│ 문의          │                                              │
│ 운영 로그      │                                  1 / 24 [다음] │
│ 보안 로그      │                                              │
│ 관리자        │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### 8.2 화면 크기 기준

| 항목 | 기준 |
|---|---|
| 기준 해상도 | Desktop 1440px 이상 |
| 최소 지원 폭 | 1280px 권장 |
| Sidebar 폭 | 220px ~ 240px |
| Content padding | 24px |
| Table 최소 폭 | 1040px 이상 |
| 세로 스크롤 | 허용 |
| 가로 스크롤 | 테이블 폭 초과 시 내부 스크롤 허용 |

---

## 9. UI 구성 요소

## 9.1 AdminLayout

보물상자 목록은 로그인 후 보호 영역 화면이므로 `AdminLayout` 안에서 렌더링한다.

### 구성

| 영역 | 설명 |
|---|---|
| Header | 서비스명, 전역 검색, 권한 표시, 관리자 아바타 |
| Sidebar | role 기준 메뉴 |
| Content | 보물상자 목록 본문 |

### Sidebar 메뉴 노출

| 메뉴 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 대시보드 | O | O | O |
| 보물상자 | O | O | O |
| 상품 | O | O | O |
| 매칭 | O | O | O |
| 보상 | O | O | O |
| 유저 | O | O | O |
| 문의 | O | O | O |
| 운영 로그 | O | O | X |
| 보안 로그 | O | X | X |
| 관리자 | O | X | X |

---

## 9.2 Page Header

### 표시 요소

| 요소 | 문구/값 | 처리 |
|---|---|---|
| 화면 제목 | `보물상자 목록` | 코드 텍스트 |
| 주요 액션 1 | `CSV 내보내기` | 버튼 |
| 주요 액션 2 | `보물상자 등록` | 버튼 |

### 버튼 노출 조건

| 버튼 | super_admin | operator | viewer |
|---|---:|---:|---:|
| CSV 내보내기 | 노출 | 노출 | 숨김 |
| 보물상자 등록 | 노출 | 노출 | 숨김 |

### 버튼 동작

| 버튼 | 동작 |
|---|---|
| CSV 내보내기 | CSV 내보내기 확인 팝업 표시 |
| 보물상자 등록 | `/admin/treasures/new` 이동 |

---

## 9.3 검색/필터 영역

### 구성

```txt
[보물상자명·ID 검색] [저장 상태 Select] [계산 상태 Select] [기간 시작 Select] [정렬 Select] [필터 초기화]
```

### 검색 입력

| 항목 | 정의 |
|---|---|
| 라벨 | 없음 |
| placeholder | `보물상자명·ID 검색` |
| 검색 대상 | `id`, `title`, `location_label`, `region_label` |
| 입력 방식 | text input |
| 반영 방식 | Enter 또는 debounce 300ms |
| 초기화 | 검색어 제거 후 page 1로 이동 |

### 필터 목록

#### 저장 상태 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 모든 저장 상태 |
| 활성 | `active` | 관리자가 active로 저장한 보물 |
| 비활성 | `inactive` | 관리자가 inactive로 저장한 보물 |
| 삭제됨 | `deleted` | soft delete 상태 |

#### 계산 상태 필터

계산 상태는 DB에 저장된 단일 상태라기보다, 현재 시각과 보물 조건을 기준으로 계산된 표시 상태다.

| 라벨 | 값 | 계산 기준 |
|---|---|---|
| 전체 | `all` | 모든 계산 상태 |
| 노출 가능 | `visible` | 사용자 앱 지도 노출 가능 |
| 예정 | `scheduled` | 시작일이 아직 오지 않음 |
| 만료 | `expired` | 종료일이 지남 |
| 매진 | `sold_out` | 현재 획득 수량이 최대 수량 이상 |
| 조건 오류 | `invalid` | 좌표 없음, 활성 상품 매칭 없음, 상품 비활성 등 |
| 숨김 | `hidden` | 저장 상태 inactive 또는 삭제 상태 |

#### 기간 시작 필터

| 라벨 | 값 |
|---|---|
| 전체 | `all` |
| 오늘 시작 | `starts_today` |
| 이번 주 시작 | `starts_this_week` |
| 이번 달 시작 | `starts_this_month` |
| 지난 기간 | `past` |
| 예정 기간 | `future` |

#### 정렬 기준

| 라벨 | 값 | 설명 |
|---|---|---|
| 최신 등록순 | `created_desc` | 기본값 |
| 오래된 등록순 | `created_asc` | 등록일 오름차순 |
| 시작일 빠른순 | `starts_asc` | 노출 시작일 오름차순 |
| 종료일 빠른순 | `ends_asc` | 노출 종료일 오름차순 |
| 획득 수량 많은순 | `claim_desc` | 현재 획득 수량 내림차순 |
| 획득 수량 적은순 | `claim_asc` | 현재 획득 수량 오름차순 |

### 필터 초기화

| 항목 | 처리 |
|---|---|
| 버튼 문구 | `필터 초기화` |
| 동작 | 모든 필터와 검색어를 기본값으로 복원 |
| page | 1로 초기화 |
| URL query | 제거 또는 기본값으로 변경 |

---

## 9.4 보물상자 목록 테이블

### Skeleton 테이블

와이어프레임 상단에는 로딩 또는 스켈레톤 상태의 테이블이 포함되어 있다.

```txt
헤더는 먼저 표시한다.
데이터 로딩 중에는 row 내부를 skeleton bar로 표시한다.
```

### 실제 데이터 테이블 컬럼

와이어프레임 하단의 실제 데이터 row 기준으로 아래 컬럼을 사용한다.

| 순서 | 컬럼 | 필드 | 설명 |
|---:|---|---|---|
| 1 | ID | `treasure_id` | 보물상자 ID |
| 2 | 보물상자명 | `title` | 보물 이름 또는 이벤트명 |
| 3 | 위치 문구 | `location_label` | 사용자에게 노출 가능한 지역명 |
| 4 | 저장 상태 | `status` | active / inactive / deleted |
| 5 | 계산 상태 | `calculated_status` | visible / scheduled / sold_out / expired / invalid 등 |
| 6 | 기간 | `starts_at` ~ `ends_at` | 노출 기간 |
| 7 | 최대/현재 수량 | `max_claim_count` / `current_claim_count` | 획득 수량 |
| 8 | 등록일 | `created_at` | 생성일 |
| 9 | 액션 | 상세 링크 | 상세 화면 이동 |

### 컬럼 표시 예시

```txt
B-1042 | 강동문 공장 보물 | 서울 종로구 세종대로 | active | visible | 2025.07.01 ~ 2025.09.30 | 100 / 37 | 2025.06.20 | 상세
```

### 테이블 row 클릭 정책

| 액션 | 처리 |
|---|---|
| row 클릭 | `/admin/treasures/{treasureId}` 이동 |
| 상세 클릭 | `/admin/treasures/{treasureId}` 이동 |
| 체크박스 | MVP에서는 사용하지 않음 |
| row 내 수정 버튼 | 목록에서는 사용하지 않음 |
| row 내 삭제 버튼 | 목록에서는 사용하지 않음 |

목록 화면에서는 상세 이동만 제공한다. 수정, 삭제, 복구는 상세 화면에서 권한 확인 후 제공한다.

---

## 9.5 상태 배지 정의

### 저장 상태 배지

| 상태 | 라벨 | 표시 기준 |
|---|---|---|
| `active` | active | 검정 또는 진한 배지 |
| `inactive` | inactive | 회색 배지 |
| `deleted` | deleted | 위험/삭제 배지 |

### 계산 상태 배지

| 상태 | 라벨 | 설명 |
|---|---|---|
| `visible` | visible | 사용자 앱 지도 노출 가능 |
| `scheduled` | scheduled | 노출 시작 전 |
| `expired` | expired | 노출 종료 |
| `sold_out` | sold_out | 최대 획득 수량 도달 |
| `invalid` | invalid | 노출 조건 미충족 |
| `hidden` | hidden | 저장 상태상 숨김 |

### 계산 상태 우선순위

계산 상태는 아래 순서로 판정한다.

```txt
deleted → hidden
status inactive → hidden
좌표 없음 → invalid
active 상품 매칭 없음 → invalid
연결 상품 inactive → invalid
now < starts_at → scheduled
now > ends_at → expired
current_claim_count >= max_claim_count → sold_out
나머지 → visible
```

---

## 10. CSV 내보내기 확인 팝업

## 10.1 팝업 개요

CSV 내보내기 버튼을 클릭하면 바로 다운로드하지 않고 확인 팝업을 표시한다.

```txt
CSV 내보내기 클릭
→ 확인 팝업 표시
→ 취소 또는 내보내기 선택
```

### 화면 구성

```txt
Dim Overlay
→ 중앙 Dialog
   → 제목: CSV 내보내기
   → 설명 문구
   → 취소 버튼
   → 내보내기 버튼
```

### 문구

| 요소 | 문구 |
|---|---|
| 제목 | `CSV 내보내기` |
| 설명 | `현재 필터 조건이 반영된 목록을 CSV로 내보냅니다. 쿠폰·바코드·이메일 등 민감 정보는 포함되지 않습니다.` |
| 취소 버튼 | `취소` |
| 확인 버튼 | `내보내기` |

### 버튼 동작

| 버튼 | 처리 |
|---|---|
| 취소 | 팝업 닫기, 다운로드 실행 안 함 |
| 내보내기 | 현재 query 조건으로 CSV 다운로드 실행 |

---

## 10.2 CSV 내보내기 권한

| 역할 | CSV 내보내기 |
|---|---:|
| super_admin | O |
| operator | O |
| viewer | X |

viewer가 직접 API를 호출해도 서버에서 차단한다.

---

## 10.3 CSV 포함 컬럼

CSV는 화면 목록과 동일하거나 더 제한된 운영용 컬럼만 포함한다.

| 컬럼 | 포함 여부 |
|---|---:|
| 보물상자 ID | O |
| 보물상자명 | O |
| 위치 문구 | O |
| 위도 | O |
| 경도 | O |
| 저장 상태 | O |
| 계산 상태 | O |
| 노출 시작일 | O |
| 노출 종료일 | O |
| 최대 수량 | O |
| 현재 획득 수량 | O |
| 생성일 | O |
| 수정일 | O |
| 사용자 이메일 | X |
| 쿠폰 번호 | X |
| 바코드 | X |
| 기프티쇼비즈 Secret | X |

---

## 11. 데이터 요구사항

## 11.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| `treasure_boxes` | 보물상자 기본 정보, 위치, 기간, 수량, 상태 |
| `treasure_product_mappings` | 보물상자에 연결된 활성 상품 여부 계산 |
| `products` | 연결 상품의 active 상태 계산 |
| `admin_profiles` 또는 관리자 role 정보 | 권한별 버튼 노출 판단 |

## 11.2 주요 필드

```ts
interface AdminTreasureListItem {
  id: string;
  treasureCode: string;
  title: string;
  locationLabel: string;
  regionLabel?: string;
  latitude: number | null;
  longitude: number | null;
  status: 'active' | 'inactive';
  calculatedStatus: 'visible' | 'scheduled' | 'expired' | 'sold_out' | 'invalid' | 'hidden';
  startsAt: string;
  endsAt: string;
  maxClaimCount: number;
  currentClaimCount: number;
  activeMappingCount: number;
  activeProductCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## 11.3 쓰는 데이터

목록 화면 자체에서는 보물 데이터를 생성·수정·삭제하지 않는다.

| 사용자 액션 | 쓰기 여부 |
|---|---:|
| 검색 | X |
| 필터 변경 | X |
| 정렬 변경 | X |
| 페이지 변경 | X |
| 상세 이동 | X |
| 보물상자 등록 버튼 | X, 등록 화면 이동만 수행 |
| CSV 내보내기 | 다운로드 로그 기록 가능 |

CSV 내보내기 실행 시 운영 로그를 남길 수 있다.

---

## 12. API 연동 기준

## 12.1 목록 조회 API

```txt
GET /api/admin/treasures
```

### Request Query

```ts
interface GetAdminTreasuresQuery {
  q?: string;
  saveStatus?: 'all' | 'active' | 'inactive' | 'deleted';
  calculatedStatus?: 'all' | 'visible' | 'scheduled' | 'expired' | 'sold_out' | 'invalid' | 'hidden';
  period?: 'all' | 'starts_today' | 'starts_this_week' | 'starts_this_month' | 'past' | 'future';
  sort?: 'created_desc' | 'created_asc' | 'starts_asc' | 'ends_asc' | 'claim_desc' | 'claim_asc';
  page?: number;
  pageSize?: number;
}
```

### Response

```ts
interface GetAdminTreasuresResponse {
  items: AdminTreasureListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  serverTime: string;
  timezone: 'Asia/Seoul';
}
```

---

## 12.2 CSV 내보내기 API

```txt
GET /api/admin/treasures/export.csv
```

### 처리 기준

```txt
현재 화면의 검색어와 필터 조건을 그대로 반영한다.
CSV 생성 시 사용자 이메일, 쿠폰 번호, 바코드, 민감 인증 정보는 포함하지 않는다.
viewer 권한은 서버에서 차단한다.
내보내기 성공 또는 실패는 운영 로그에 기록할 수 있다.
```

---

## 13. 상태 관리

## 13.1 화면 상태

```ts
type AdminTreasureListScreenStatus =
  | 'initial'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'export_confirm_open'
  | 'exporting'
  | 'export_error'
  | 'forbidden';
```

### 상태별 처리

| 상태 | UI 처리 |
|---|---|
| `initial` | query 파싱 전 초기 상태 |
| `loading` | 테이블 skeleton 표시 |
| `ready` | 목록 데이터 표시 |
| `empty` | 검색/필터 결과 없음 안내 |
| `error` | 조회 실패 안내 및 재시도 버튼 표시 |
| `export_confirm_open` | CSV 내보내기 확인 팝업 표시 |
| `exporting` | 내보내기 버튼 disabled + 로딩 표시 |
| `export_error` | 팝업 내 오류 문구 또는 토스트 표시 |
| `forbidden` | `/admin/access-denied` 이동 |

---

## 13.2 Empty 상태

### 조건

```txt
조회는 성공했지만 items.length === 0
```

### 문구

| 요소 | 문구 |
|---|---|
| 제목 | `조건에 맞는 보물이 없습니다.` |
| 설명 | `검색어나 필터를 바꿔 다시 확인하세요.` |
| 버튼 | `필터 초기화` |

---

## 13.3 Error 상태

### 조건

```txt
목록 API 호출 실패
권한 검증 실패
네트워크 오류
서버 오류
```

### 문구

| 요소 | 문구 |
|---|---|
| 제목 | `보물상자 목록을 불러오지 못했습니다.` |
| 설명 | `잠시 후 다시 시도하세요.` |
| 버튼 | `다시 시도` |

---

## 14. 페이지네이션

### 표시 기준

와이어프레임 기준으로 우측 하단에 현재 페이지와 총 페이지, 다음 버튼을 표시한다.

```txt
1 / 24 페이지   [다음]
```

### 동작 기준

| 항목 | 처리 |
|---|---|
| 기본 page | 1 |
| 기본 pageSize | 20 |
| 다음 클릭 | page + 1 |
| 이전 클릭 | page - 1 |
| 첫 페이지 | 이전 disabled |
| 마지막 페이지 | 다음 disabled |
| 필터 변경 | page 1로 초기화 |
| 검색어 변경 | page 1로 초기화 |

MVP에서는 간단히 `이전 / 다음` 버튼만 제공해도 된다.

---

## 15. 권한별 UI 처리

## 15.1 super_admin

```txt
목록 조회 가능
상세 이동 가능
보물상자 등록 가능
CSV 내보내기 가능
상세 화면에서 삭제/복구 가능
```

## 15.2 operator

```txt
목록 조회 가능
상세 이동 가능
보물상자 등록 가능
CSV 내보내기 가능
상세 화면에서 수정 가능
삭제/복구 불가
```

## 15.3 viewer

```txt
목록 조회 가능
상세 이동 가능
보물상자 등록 불가
CSV 내보내기 불가
수정/삭제/복구/상태 변경 불가
```

---

## 16. 보안 및 개인정보 정책

```txt
관리자 CMS에서는 사용자 이메일을 표시하지 않는다.
관리자 CMS에서는 쿠폰 번호와 바코드를 표시하지 않는다.
보물상자 목록 API 응답에는 기프티쇼비즈 secret, client secret, coupon code를 포함하지 않는다.
CSV 내보내기 파일에도 민감 정보는 포함하지 않는다.
UI에서 버튼을 숨기더라도 서버에서 role을 재검증한다.
```

---

## 17. 사용자 앱과의 정합성

보물상자 목록의 계산 상태 중 `visible`은 사용자 앱 지도에 노출 가능한 상태와 동일해야 한다.

### visible 조건

```txt
deleted_at 없음
status = active
현재 시각이 starts_at ~ ends_at 사이
latitude 존재
longitude 존재
current_claim_count < max_claim_count
active 상품 매칭 1개 존재
연결 상품 status = active
```

### 사용자 앱 영향

| 관리자 상태 | 사용자 앱 지도 영향 |
|---|---|
| visible | 지도에 보물 마커 노출 가능 |
| scheduled | 아직 노출하지 않음 |
| expired | 노출하지 않음 |
| sold_out | 노출하지 않음 |
| invalid | 노출하지 않음 |
| hidden | 노출하지 않음 |

---

## 18. 와이어프레임 검수 반영 사항

### 18.1 현재 와이어프레임에서 유지할 것

```txt
보물상자 목록 제목
CSV 내보내기 버튼
보물상자 등록 버튼
검색/필터 영역
테이블 구조
실제 데이터 row 예시
상태 배지 구조
페이지네이션
CSV 내보내기 확인 팝업
```

### 18.2 보강할 것

```txt
viewer 권한에서는 CSV 내보내기와 등록 버튼 숨김
계산 상태와 저장 상태의 의미 분리
visible 조건 명확화
필터 변경 시 URL query 유지
CSV 내보내기 서버 권한 차단
CSV에 민감 정보 제외
테이블 loading/empty/error 상태 명확화
```

### 18.3 목록 화면에서 하지 않을 것

```txt
보물상자 직접 수정
보물상자 직접 삭제
보물상자 복구
보물-상품 매칭 변경
기프티쇼비즈 API 호출
쿠폰 번호 또는 바코드 조회
사용자 이메일 조회
```

---

## 19. 컴포넌트 분리 기준

```txt
AdminTreasureListPage
├─ AdminPageHeader
├─ AdminTreasureFilterBar
├─ AdminTreasureTable
├─ AdminStatusBadge
├─ AdminPagination
└─ AdminCsvExportConfirmDialog
```

### 컴포넌트 역할

| 컴포넌트 | 역할 |
|---|---|
| `AdminTreasureListPage` | 페이지 상태, query, API 연동 |
| `AdminPageHeader` | 제목과 주요 액션 표시 |
| `AdminTreasureFilterBar` | 검색/필터/초기화 |
| `AdminTreasureTable` | 목록 테이블, skeleton, empty, error |
| `AdminStatusBadge` | 저장 상태/계산 상태 배지 |
| `AdminPagination` | 페이지 이동 |
| `AdminCsvExportConfirmDialog` | CSV 내보내기 확인 팝업 |

---

## 20. 개발 구현 메모

### 20.1 TanStack Query key

```ts
const queryKey = [
  'admin',
  'treasures',
  {
    q,
    saveStatus,
    calculatedStatus,
    period,
    sort,
    page,
    pageSize,
  },
];
```

### 20.2 URL query 동기화

```txt
필터 상태는 URL query를 단일 출처로 사용한다.
브라우저 뒤로가기 시 이전 필터 상태로 복원되어야 한다.
상세 화면에서 목록으로 돌아오면 기존 필터와 페이지가 유지되어야 한다.
```

### 20.3 날짜 기준

```txt
모든 날짜 계산은 Asia/Seoul(KST) 기준으로 표시한다.
서버 응답에는 serverTime을 포함한다.
클라이언트 시간 오차가 있어도 서버 계산 상태를 우선한다.
```

---

## 21. QA 체크리스트

### 21.1 권한

- [ ] super_admin은 목록 조회, 상세 이동, 등록, CSV 내보내기가 가능하다.
- [ ] operator는 목록 조회, 상세 이동, 등록, CSV 내보내기가 가능하다.
- [ ] viewer는 목록과 상세만 가능하다.
- [ ] viewer에게 등록 버튼이 보이지 않는다.
- [ ] viewer에게 CSV 내보내기 버튼이 보이지 않는다.
- [ ] viewer가 CSV API를 직접 호출하면 서버에서 차단된다.

### 21.2 검색/필터

- [ ] 보물상자명으로 검색된다.
- [ ] 보물상자 ID로 검색된다.
- [ ] 저장 상태 필터가 동작한다.
- [ ] 계산 상태 필터가 동작한다.
- [ ] 기간 시작 필터가 동작한다.
- [ ] 정렬 변경이 동작한다.
- [ ] 필터 초기화가 모든 조건을 기본값으로 되돌린다.
- [ ] 필터 변경 시 page가 1로 초기화된다.

### 21.3 테이블

- [ ] 로딩 중 skeleton row가 표시된다.
- [ ] 데이터 없음 상태가 표시된다.
- [ ] 조회 실패 상태가 표시된다.
- [ ] row 클릭 시 상세 화면으로 이동한다.
- [ ] 기간은 `YYYY.MM.DD ~ YYYY.MM.DD` 형태로 표시된다.
- [ ] 최대/현재 수량은 와이어프레임 기준 `100 / 37` 형태로 표시된다.

### 21.4 상태 계산

- [ ] active + 모든 visible 조건 충족 시 `visible`로 표시된다.
- [ ] 시작일 전이면 `scheduled`로 표시된다.
- [ ] 종료일이 지났으면 `expired`로 표시된다.
- [ ] 현재 획득 수량이 최대 수량 이상이면 `sold_out`으로 표시된다.
- [ ] 좌표 또는 활성 상품 매칭이 없으면 `invalid`로 표시된다.
- [ ] inactive 상태는 사용자 앱 지도에 노출되지 않는다.

### 21.5 CSV 내보내기

- [ ] CSV 내보내기 클릭 시 확인 팝업이 표시된다.
- [ ] 취소 클릭 시 팝업만 닫히고 다운로드하지 않는다.
- [ ] 내보내기 클릭 시 현재 필터 조건이 반영된다.
- [ ] 내보내기 중 버튼이 disabled 처리된다.
- [ ] CSV에 사용자 이메일이 포함되지 않는다.
- [ ] CSV에 쿠폰 번호와 바코드가 포함되지 않는다.
- [ ] CSV 내보내기 실패 시 오류 안내가 표시된다.

---

## 22. 개발 완료 기준

```txt
A06 보물상자 목록 화면은 아래 조건을 만족하면 완료로 본다.

1. role별 목록 조회와 버튼 노출이 정확하다.
2. 검색, 필터, 정렬, 페이지네이션이 URL query와 연동된다.
3. 저장 상태와 계산 상태가 분리되어 표시된다.
4. visible 계산 결과가 사용자 앱 지도 노출 조건과 일치한다.
5. viewer는 CSV 내보내기와 등록을 수행할 수 없다.
6. CSV 파일에 사용자 이메일, 쿠폰 번호, 바코드가 포함되지 않는다.
7. loading, empty, error 상태가 구현되어 있다.
8. CSV 내보내기 확인 팝업이 구현되어 있다.
9. 상세 화면 이동이 정상 동작한다.
```
