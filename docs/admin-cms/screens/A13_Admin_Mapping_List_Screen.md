# A13. 보물-상품 매칭 목록 화면 정의서

> 문서 버전: `v1.0`  
> 작성일: `2026-07-26`  
> 화면 ID: `A13_Admin_Mapping_List_Screen`  
> 화면명: 보물-상품 매칭 목록  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 관련 화면: `A06_Admin_Treasure_List_Screen`, `A08_Admin_Treasure_Detail_Screen`, `A10_Admin_Product_List_Screen`, `A12_Admin_Product_Detail_Screen`, `A14_Admin_Mapping_Edit_Screen`  
> 작성 목적: 바이브코딩을 위한 화면 단위 구현 명세

---

# 1. 화면 개요

보물-상품 매칭 목록 화면은 관리자 CMS에서 보물상자와 상품의 연결 상태를 조회하고 관리 진입점을 제공하는 화면이다.

이 화면은 보물상자별로 어떤 상품이 연결되어 있는지, 현재 매칭이 active인지 inactive인지, 보물과 상품 상태가 운영 가능한 조합인지 확인하는 목록 화면이다.

중요:

```txt
보물상자당 활성 매칭은 1개만 허용한다.
과거 비활성 매칭 이력은 삭제하지 않고 유지한다.
매칭 생성·교체·비활성화 실행은 A14 매칭 등록·교체 화면 또는 확인 팝업에서 처리한다.
CMS는 쿠폰 번호와 바코드를 표시하지 않는다.
```

---

# 2. 화면 목적

## 2.1 관리자 관점 목적

- 현재 보물상자와 상품의 연결 현황을 확인한다.
- 보물 상태, 상품 상태, 매칭 상태를 함께 확인한다.
- 매칭이 없는 보물이나 inactive 상품이 연결된 매칭을 찾아낸다.
- 보물 또는 상품 기준으로 매칭을 검색한다.
- 신규 매칭 등록 또는 기존 매칭 교체 화면으로 이동한다.
- active 매칭을 비활성화할 때 영향 범위를 확인한다.

## 2.2 시스템 관점 목적

- `treasure_product_mappings` 목록을 조회한다.
- 보물당 active 매칭 1개 정책을 UI와 서버에서 모두 보장한다.
- 매칭 생성·교체·비활성화 액션에 대해 운영 로그를 남긴다.
- 사용자 앱 지도 visible 조건에 영향을 주는 매칭 상태를 운영자가 파악할 수 있게 한다.

---

# 3. 진입 조건

## 3.1 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| A02 운영 대시보드 | 사이드바 `매칭` 클릭 |
| A06 보물상자 목록 | 보물 관련 매칭 확인 |
| A08 보물상자 상세 | `매칭 관리` 클릭 후 목록 복귀 |
| A10 상품 목록 | 상품 연결 현황 확인 |
| A12 상품 상세 | 연관 매칭 현황에서 전체 매칭 이동 |
| A14 매칭 등록·교체 | 저장 또는 취소 후 목록 이동 |

## 3.2 접근 가능 권한

| 역할 | 접근 | 설명 |
|---|---:|---|
| super_admin | O | 조회, 등록·교체, 비활성화 가능 |
| operator | O | 조회, 등록·교체, 비활성화 가능 |
| viewer | O | 조회만 가능 |

viewer는 목록 조회와 상세 이동만 가능하다. `매칭 등록·교체` 버튼, 비활성화 액션은 노출하지 않는다.

---

# 4. Route

## 4.1 권장 Route

```txt
/admin/mappings
```

## 4.2 권장 파일 경로

```txt
app/admin/(protected)/mappings/page.tsx
```

## 4.3 관련 Route

| 화면 | Route | 관계 |
|---|---|---|
| 보물상자 상세 | `/admin/treasures/[treasureId]` | 보물명 클릭 시 이동 |
| 상품 상세 | `/admin/products/[productId]` | 상품명 클릭 시 이동 |
| 매칭 등록·교체 | `/admin/mappings/[treasureId]` | 등록·교체 버튼 클릭 시 이동 |

---

# 5. 화면 구조

## 5.1 와이어프레임 기준 구조

```txt
AdminLayout
→ Topbar
→ Sidebar
→ Page Header
   → 매칭 목록
   → 매칭 등록·교체 버튼
→ Filter Bar
   → 검색어
   → 매칭 상태
   → 보물 상태
   → 상품 상태
   → 등록 기간
   → 초기화
   → 정렬
→ Result Count
→ Mapping Table
→ Pagination
→ Dialog
   → 매칭 비활성화 확인
```

## 5.2 화면 레이아웃

```txt
┌────────────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                         검색 권한 계정 │
├──────────────┬─────────────────────────────────────┤
│ Sidebar      │ 매칭 목록                  [등록·교체] │
│              │                                     │
│              │ [검색][매칭상태][보물상태][상품상태]   │
│              │ [등록기간][초기화]          [정렬]     │
│              │                                     │
│              │ 총 128건                             │
│              │ ┌───────────────────────────────┐   │
│              │ │ 매칭 ID | 보물명 | 상품명 | 액션 │   │
│              │ │ ...                           │   │
│              │ └───────────────────────────────┘   │
│              │                           pagination │
└──────────────┴─────────────────────────────────────┘
```

---

# 6. UI 구성 요소

## 6.1 Page Header

| 요소 | 문구/값 | 처리 |
|---|---|---|
| 화면 제목 | `매칭 목록` | 코드 텍스트 |
| 주요 버튼 | `매칭 등록·교체` | 버튼 |

### 버튼 노출 조건

```txt
role in (super_admin, operator) → 매칭 등록·교체 버튼 노출
role = viewer → 매칭 등록·교체 버튼 숨김
```

### 버튼 동작

| 액션 | 처리 |
|---|---|
| 매칭 등록·교체 클릭 | `/admin/mappings/new` 또는 보물 선택 단계가 있는 A14로 이동 |

권장 구현은 A14에서 먼저 대상 보물을 선택하거나, 쿼리 파라미터로 보물을 받은 경우 바로 해당 보물의 매칭 관리로 진입하는 방식이다.

```txt
/admin/mappings/new
/admin/mappings/[treasureId]
```

---

# 7. 필터 영역

## 7.1 검색어 입력

| 항목 | 정의 |
|---|---|
| placeholder | `보물명 또는 상품명 검색` |
| 검색 대상 | 보물 ID, 보물명, 상품 ID, 상품명 |
| 입력 방식 | text input |
| 동작 | Enter 또는 debounce 검색 |

## 7.2 매칭 상태 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 전체 매칭 |
| active | `active` | 현재 활성 매칭 |
| inactive | `inactive` | 과거 또는 비활성 매칭 |

## 7.3 보물 상태 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 전체 보물 |
| active | `active` | 운영 활성 보물 |
| inactive | `inactive` | 운영 비활성 보물 |
| deleted | `deleted` | 소프트 삭제된 보물 |

## 7.4 상품 상태 필터

| 라벨 | 값 | 설명 |
|---|---|---|
| 전체 | `all` | 전체 상품 |
| active | `active` | 매칭 가능 상품 |
| inactive | `inactive` | 신규 매칭 불가 상품 |

## 7.5 등록 기간 필터

| 항목 | 정의 |
|---|---|
| 필터명 | 등록 기간 |
| 값 | 시작일, 종료일 |
| 기준 필드 | `created_at` |
| 기본값 | 전체 |

## 7.6 정렬

| 라벨 | 값 |
|---|---|
| 최근 등록순 | `created_at_desc` |
| 최근 변경순 | `updated_at_desc` |
| 보물명순 | `treasure_title_asc` |
| 상품명순 | `product_name_asc` |
| active 우선 | `active_first` |

## 7.7 초기화 버튼

| 액션 | 처리 |
|---|---|
| 초기화 클릭 | 검색어, 필터, 정렬을 기본값으로 복원 |

---

# 8. 결과 건수

| 요소 | 정의 |
|---|---|
| 문구 | `총 {count}건` |
| 기준 | 현재 검색·필터 조건에 맞는 전체 건수 |
| 위치 | 필터 아래, 테이블 위 |

---

# 9. 테이블 정의

## 9.1 컬럼

| 컬럼 | 표시 내용 | 설명 |
|---|---|---|
| 매칭 ID | `M-0001` | 매칭 고유 ID |
| 보물명 | 보물 ID + 보물명 | 클릭 시 보물 상세 이동 |
| 보물 상태 | active/inactive/deleted + 계산 상태 | 보물 운영 상태 |
| 상품명 | 상품 ID + 상품명 | 클릭 시 상품 상세 이동 |
| 상품 상태 | active/inactive | 상품 운영 상태 |
| 매칭 상태 | active/inactive | 현재 매칭 활성 여부 |
| 등록일 | `YYYY.MM.DD HH:mm` | 매칭 최초 생성일 |
| 변경일 | `YYYY.MM.DD HH:mm` | 마지막 수정일 |
| 액션 | 상세/교체/비활성화 | 권한별 노출 |

## 9.2 행 예시

```txt
M-1042 | B-1042 광화문 광장 보물 | active / visible | 스타벅스 아메리카노 Tall | active | active | 2025.06.20 | 2025.06.20 | 상세 / 교체 / 비활성화
```

## 9.3 상태 배지

### 매칭 상태

| 상태 | 배지 | 의미 |
|---|---|---|
| active | `active` | 현재 보물에 연결된 활성 상품 |
| inactive | `inactive` | 과거 이력 또는 비활성 연결 |

### 보물 계산 상태

| 상태 | 배지 | 의미 |
|---|---|---|
| visible | `visible` | 사용자 앱 지도 노출 가능 |
| scheduled | `scheduled` | 운영 시작 전 |
| expired | `expired` | 운영 기간 종료 |
| sold_out | `sold_out` | 최대 획득 수량 도달 |
| invalid | `invalid` | 노출 조건 불충족 |

### 상품 상태

| 상태 | 배지 | 의미 |
|---|---|---|
| active | `active` | 신규 매칭 가능 |
| inactive | `inactive` | 신규 매칭 불가 |

---

# 10. 액션 정책

## 10.1 권한별 액션

| 액션 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 목록 조회 | O | O | O |
| 보물 상세 이동 | O | O | O |
| 상품 상세 이동 | O | O | O |
| 매칭 등록·교체 | O | O | X |
| 매칭 비활성화 | O | O | X |
| 비활성화 사유 입력 | O | O | X |

## 10.2 행 액션

| 액션 | 노출 조건 | 처리 |
|---|---|---|
| 상세 | 전체 role | 보물 또는 상품 상세로 이동 |
| 교체 | super_admin/operator + 매칭 active | A14 매칭 등록·교체 화면 이동 |
| 비활성화 | super_admin/operator + 매칭 active | 비활성화 확인 팝업 표시 |

중요:

```txt
inactive 매칭에는 다시 비활성화 액션을 노출하지 않는다.
viewer에게는 변경 액션을 노출하지 않는다.
```

---

# 11. 매칭 비활성화 확인 팝업

## 11.1 표시 조건

active 매칭 행에서 `비활성화` 액션을 클릭하면 팝업을 표시한다.

## 11.2 팝업 구성

```txt
Modal Overlay
→ 매칭 비활성화 확인 팝업
→ 안내 문구
→ 비활성화 사유 textarea
→ 취소 버튼
→ 비활성화 버튼
```

## 11.3 팝업 문구

| 요소 | 문구 |
|---|---|
| 제목 | `매칭 비활성화 확인` |
| 설명 | `해당 매칭을 비활성화하면 보물에 연결된 활성 상품이 없어질 수 있습니다. 계속하시겠습니까?` |
| 라벨 | `비활성화 사유` |
| 취소 버튼 | `취소` |
| 실행 버튼 | `비활성화` |

## 11.4 입력 기준

| 필드 | 필수 | 검증 |
|---|---:|---|
| 비활성화 사유 | O | 2자 이상 300자 이하 |

## 11.5 실행 결과

| 조건 | 처리 |
|---|---|
| 성공 | 매칭 상태 inactive 변경, 목록 재조회, 성공 토스트 표시 |
| 실패 | 입력값 유지, 실패 메시지 표시 |
| 권한 부족 | A24 접근 제한 또는 403 안내 |

## 11.6 영향 안내

비활성화 대상이 보물의 유일한 active 매칭이면 다음 문구를 추가 표시한다.

```txt
이 매칭을 비활성화하면 해당 보물은 활성 상품이 없어 사용자 앱 지도에 노출되지 않을 수 있습니다.
```

---

# 12. 데이터 모델 기준

## 12.1 조회 데이터

```ts
type AdminMappingListItem = {
  mapping_id: string;
  treasure_id: string;
  treasure_title: string;
  treasure_status: 'active' | 'inactive' | 'deleted';
  treasure_calculated_status: 'visible' | 'scheduled' | 'expired' | 'sold_out' | 'invalid';
  product_id: string;
  product_name: string;
  product_brand: string;
  product_status: 'active' | 'inactive';
  mapping_status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  inactive_reason?: string | null;
};
```

## 12.2 필터 상태

```ts
type MappingListFilters = {
  keyword: string;
  mappingStatus: 'all' | 'active' | 'inactive';
  treasureStatus: 'all' | 'active' | 'inactive' | 'deleted';
  productStatus: 'all' | 'active' | 'inactive';
  createdFrom?: string;
  createdTo?: string;
  sort: 'created_at_desc' | 'updated_at_desc' | 'treasure_title_asc' | 'product_name_asc' | 'active_first';
  page: number;
  pageSize: number;
};
```

---

# 13. 서버 정책

## 13.1 보물당 active 매칭 1개

```txt
같은 treasure_id에 대해 mapping_status = active인 레코드는 최대 1개만 허용한다.
이 제한은 UI가 아니라 DB 또는 서버 트랜잭션에서 최종 보장한다.
```

## 13.2 비활성화 정책

```txt
active 매칭 비활성화 시 mapping_status를 inactive로 변경한다.
비활성화 사유와 처리자를 기록한다.
기존 매칭 레코드는 삭제하지 않는다.
```

## 13.3 운영 로그

다음 액션은 운영 로그를 남긴다.

```txt
매칭 생성
매칭 교체
매칭 비활성화
권한 거부
```

로그에 저장하지 않는 값:

```txt
쿠폰 번호
바코드
사용자 이메일
관리자 비밀번호
```

---

# 14. 사용자 앱 연계 기준

사용자 앱 지도에 보물이 노출되려면 보물 자체 조건뿐 아니라 active 상품 매칭이 필요하다.

```txt
보물 active
삭제되지 않음
운영 기간 안
수량 남음
좌표 존재
active 상품 매칭 존재
연결 상품 active
```

따라서 매칭 비활성화 또는 상품 inactive 변경은 사용자 앱 지도 노출에 영향을 줄 수 있다.

---

# 15. 상태 화면

## 15.1 Loading

| 상황 | 처리 |
|---|---|
| 최초 목록 조회 중 | 테이블 skeleton 표시 |
| 필터 변경 후 조회 중 | 기존 리스트 유지 + 부분 로딩 또는 skeleton |

## 15.2 Empty

검색 전 전체 데이터가 없을 때:

```txt
아직 등록된 매칭이 없습니다.
보물과 상품을 연결해 운영을 시작하세요.
```

## 15.3 Search Empty

검색 또는 필터 결과가 없을 때:

```txt
검색 결과 없음
입력한 조건과 일치하는 매칭이 없습니다. 검색어 또는 필터를 변경한 뒤 다시 시도해 주세요.
```

## 15.4 Error

목록 조회 실패 시:

```txt
목록 조회 실패
매칭 목록을 불러오는 중 오류가 발생했습니다.
[다시 시도]
```

## 15.5 Forbidden

직접 URL 접근 또는 API 권한 오류:

```txt
접근 권한 없음
이 메뉴에 접근할 수 있는 권한이 없습니다.
```

---

# 16. 페이지네이션

| 항목 | 기준 |
|---|---|
| 기본 pageSize | 20 |
| 선택 가능 pageSize | 20, 50, 100 |
| 위치 | 테이블 하단 우측 |
| 표시 | 현재 페이지, 페이지 번호, 다음 |

---

# 17. API 연동 기준

## 17.1 목록 조회

```txt
GET /api/admin/mappings
```

### Query

```txt
keyword
mappingStatus
treasureStatus
productStatus
createdFrom
createdTo
sort
page
pageSize
```

### Response

```ts
type AdminMappingListResponse = {
  items: AdminMappingListItem[];
  total_count: number;
  page: number;
  page_size: number;
};
```

## 17.2 매칭 비활성화

```txt
POST /api/admin/mappings/{mappingId}/deactivate
```

### Body

```ts
type DeactivateMappingRequest = {
  reason: string;
};
```

---

# 18. QA 체크리스트

## 18.1 화면 구조

- [ ] Page Header에 `매칭 목록` 제목이 표시되는가
- [ ] super_admin/operator에게만 `매칭 등록·교체` 버튼이 표시되는가
- [ ] viewer에게 변경 액션이 숨겨지는가
- [ ] 검색, 필터, 정렬, 초기화가 동작하는가
- [ ] 총 건수가 현재 조건 기준으로 표시되는가
- [ ] 테이블 skeleton, empty, error 상태가 있는가
- [ ] pagination이 동작하는가

## 18.2 데이터 정합성

- [ ] 보물당 active 매칭이 1개만 존재하는가
- [ ] inactive 매칭 이력이 삭제되지 않고 표시되는가
- [ ] 상품 inactive 상태가 명확히 표시되는가
- [ ] 보물 visible 여부 판단에 필요한 상태가 표시되는가
- [ ] 비활성화 시 사유가 필수 입력되는가
- [ ] 비활성화 시 운영 로그가 생성되는가

## 18.3 보안

- [ ] viewer가 비활성화 API를 호출하면 서버에서 차단되는가
- [ ] 쿠폰 번호와 바코드가 화면/API/로그에 포함되지 않는가
- [ ] 사용자 이메일이 화면/API/로그에 포함되지 않는가
- [ ] 권한 없는 접근은 A24 접근 제한으로 이동하는가

---

# 19. 바이브코딩 구현 메모

```txt
이 화면은 A13 매칭 목록 화면이다.
보물과 상품의 연결 상태를 조회하고, 등록·교체·비활성화 진입점을 제공한다.
보물당 active 매칭은 1개만 허용한다.
과거 inactive 매칭은 이력으로 유지한다.
매칭 비활성화는 사유 입력 팝업을 거쳐 처리한다.
viewer는 조회만 가능하고 모든 변경 버튼은 숨긴다.
쿠폰 번호, 바코드, 사용자 이메일은 절대 노출하지 않는다.
```
