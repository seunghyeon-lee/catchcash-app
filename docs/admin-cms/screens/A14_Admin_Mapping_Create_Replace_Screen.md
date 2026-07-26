# A14. 매칭 등록·교체 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A14. 매칭 등록·교체 화면 정의서 |
| 파일명 | `A14_Admin_Mapping_Create_Replace_Screen.md` |
| 화면명 | 매칭 등록·교체 |
| 화면 ID | `A14_Admin_Mapping_Create_Replace_Screen` |
| 서비스 | 캐치캐쉬 관리자 CMS |
| 작성 목적 | 바이브코딩을 위한 관리자 CMS 화면 단위 구현 명세 |
| 기준 화면 | 매칭 등록·교체 와이어프레임 / 매칭 교체 확인 팝업 |
| 관련 화면 | A06 보물상자 목록, A08 보물상자 상세, A10 상품 목록, A12 상품 상세, A13 매칭 목록 |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |

---

## 2. 화면 개요

매칭 등록·교체 화면은 하나의 보물상자에 하나의 활성 상품을 연결하는 관리자 화면이다.

캐치캐쉬 MVP에서는 보물상자 하나에 동시에 활성 상품을 여러 개 연결하지 않는다.  
따라서 이 화면의 핵심 역할은 아래 두 가지다.

```txt
1. 아직 활성 매칭이 없는 보물상자에 active 상품을 신규 연결한다.
2. 이미 활성 매칭이 있는 보물상자의 기존 매칭을 inactive 처리하고 새 상품으로 교체한다.
```

이 화면은 실제 기프티쇼비즈 쿠폰을 발급하지 않는다.  
CMS는 상품 연결만 관리하며, 실제 쿠폰 발급은 사용자 앱에서 보상 수령 시 서버 발급 함수가 수행한다.

---

## 3. 화면 목적

### 3.1 관리자 관점 목적

- 보물상자에 지급할 상품을 연결한다.
- 현재 보물의 상태와 획득 수량을 확인한 뒤 매칭 가능 여부를 판단한다.
- active 상품만 연결 대상으로 선택한다.
- 기존 활성 매칭이 있을 경우 교체 이력을 남기고 새 매칭을 생성한다.
- 교체 사유를 필수로 입력받아 운영 로그와 추적성을 확보한다.

### 3.2 시스템 관점 목적

- 보물상자당 active 매칭은 1개만 유지한다.
- 기존 매칭은 물리 삭제하지 않고 inactive 이력으로 남긴다.
- 매칭 변경은 사용자 앱 지도 노출 조건과 보상 생성 로직에 영향을 준다.
- 쿠폰 번호, 바코드, 외부 API Secret은 절대 노출하지 않는다.

---

## 4. 진입 조건

| 진입 경로 | 설명 |
|---|---|
| A13 매칭 목록 | `매칭 등록·교체` 버튼 클릭 |
| A08 보물상자 상세 | `매칭 관리` 클릭 |
| A12 상품 상세 | 연관 매칭 영역에서 매칭 관리 진입 가능 |

---

## 5. Route

권장 Route는 아래와 같다.

```txt
/admin/mappings/new
```

특정 보물 기준으로 진입하는 경우:

```txt
/admin/mappings/new?treasureId={treasure_box_id}
```

특정 상품 기준으로 진입하는 경우:

```txt
/admin/mappings/new?productId={product_id}
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/mappings/new/page.tsx
```

---

## 6. 권한 정책

| 역할 | 접근 | 생성 | 교체 | 비고 |
|---|---:|---:|---:|---|
| super_admin | O | O | O | 전체 가능 |
| operator | O | O | O | 일반 운영 가능 |
| viewer | X | X | X | 접근 불가, A24 접근 제한 화면 이동 |

### 6.1 권한 처리 기준

```txt
viewer가 직접 URL로 접근하면 A24 접근 권한 부족 화면으로 이동한다.
super_admin/operator만 저장 버튼을 볼 수 있다.
서버에서도 role을 재검증한다.
```

---

## 7. 화면 구조

와이어프레임 기준 화면은 아래 구조를 따른다.

```txt
AdminLayout
→ 상단 헤더
→ 좌측 사이드바
→ 본문: 매칭 등록·교체
   → 대상 보물 섹션
   → 연결할 활성 상품 섹션
   → 기존 활성 매칭 안내 섹션
   → 하단 액션 영역
→ 매칭 교체 확인 팝업
```

---

## 8. UI 구성 요소

## 8.1 상단 AdminLayout

| 요소 | 설명 |
|---|---|
| 좌측 로고 | `캐치캐쉬 CMS` |
| 좌측 메뉴 | role 기준 허용 메뉴만 표시 |
| 우측 검색 | 관리자 전역 검색 또는 화면 내 검색 보조 |
| 권한 표시 | 현재 관리자 role 표시 |
| 계정 아바타 | 관리자 프로필 축약 표시 |

### 사이드바 메뉴

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

표시 기준은 현재 로그인한 관리자 role을 따른다.

---

## 8.2 화면 제목 영역

| 요소 | 문구 | 설명 |
|---|---|---|
| 화면 제목 | `매칭 등록·교체` | 본문 상단 좌측 |
| 보조 액션 | 없음 또는 `매칭 목록으로` | 우측 상단 링크 가능 |

---

## 8.3 대상 보물 섹션

### 구성

```txt
대상 보물
→ 보물 검색 입력
→ 보물 선택 Select
→ 선택된 보물 요약 카드
```

### 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| 보물 검색 | text input | X | 보물명 또는 ID 검색 |
| 보물 선택 | select/autocomplete | O | 매칭할 대상 보물 선택 |

### 검색 기준

```txt
보물 ID
보물상자명
위치 문구
```

### 선택 가능 보물 조건

```txt
deleted_at is null
status in ('active', 'inactive')
```

단, sold_out, expired, invalid 상태의 보물은 정책에 따라 선택 가능 여부를 제한할 수 있다.  
MVP에서는 매칭 운영 안정성을 위해 `deleted_at is null`이고 복구 가능한 보물만 선택 대상으로 둔다.

### 선택된 보물 요약 카드

| 표시 항목 | 예시 |
|---|---|
| 선택된 보물 | `보물 #1024 — 남산타워 근처` |
| 현재 상태 | `active` |
| 현재 획득 수 / 최대 수량 | `12 / 50` |

### 데이터 매핑

```ts
type SelectedTreasureSummary = {
  treasureId: string;
  title: string;
  status: 'active' | 'inactive' | 'sold_out' | 'expired' | 'invalid';
  currentClaimCount: number;
  maxClaimCount: number;
};
```

---

## 8.4 연결할 활성 상품 섹션

### 구성

```txt
연결할 활성 상품
→ 상품 검색 입력
→ 상품 선택 Select
→ 선택된 상품 요약 카드
```

### 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| 상품 검색 | text input | X | 상품명 또는 ID 검색 |
| 상품 선택 | select/autocomplete | O | 연결할 active 상품 선택 |

### 검색 기준

```txt
상품명
상품 ID
브랜드명
외부 상품 ID(provider_product_id)
```

### 선택 가능 상품 조건

```txt
products.status = active
```

inactive 상품은 연결할 수 없다.  
상품이 inactive 상태라면 상품 수정 화면에서 먼저 active로 변경해야 한다.

### 선택된 상품 요약 카드

| 표시 항목 | 예시 |
|---|---|
| 선택된 상품 | `스타벅스 아메리카노` |
| 상품 상태 | `active` |
| 기프티쇼비즈 상품 ID | `GSB-00412` |

### 데이터 매핑

```ts
type SelectedProductSummary = {
  productId: string;
  productName: string;
  brandName: string;
  status: 'active' | 'inactive';
  providerProductId: string;
};
```

---

## 8.5 기존 활성 매칭 안내 섹션

보물상자에 이미 활성 매칭이 있는 경우에만 표시한다.

### 표시 문구

```txt
현재 이 보물에는 활성 매칭이 1건 존재합니다.
기존 매칭 ID  MATCH-0087
기존 연결 상품  CU 편의점 3,000원
기존 매칭 등록일  2025-06-01 14:22
저장 시 기존 매칭은 비활성으로 전환되고, 선택한 상품으로 신규 활성 매칭이 생성됩니다.
이 작업은 단일 트랜잭션으로 처리됩니다.
```

### 표시 항목

| 항목 | 설명 |
|---|---|
| 기존 매칭 ID | 현재 active 상태의 매칭 ID |
| 기존 연결 상품 | 기존 연결 상품명 |
| 기존 매칭 등록일 | 기존 매칭 생성 시각 |
| 교체 정책 안내 | 저장 시 기존 매칭 inactive 전환 안내 |

### 기존 활성 매칭이 없는 경우

```txt
현재 이 보물에는 활성 매칭이 없습니다.
저장 시 선택한 상품으로 신규 활성 매칭이 생성됩니다.
```

---

## 8.6 하단 액션 영역

| 버튼 | 노출 조건 | 동작 |
|---|---|---|
| 매칭 목록으로 | 전체 | A13 매칭 목록 이동 |
| 저장 | super_admin/operator | 신규 등록 또는 교체 확인 팝업 오픈 |

### 저장 버튼 활성 조건

```txt
대상 보물 선택 완료
연결할 활성 상품 선택 완료
선택한 상품 status = active
viewer가 아님
저장 요청 중이 아님
```

---

# 9. 매칭 교체 확인 팝업

기존 active 매칭이 있는 보물을 저장할 때 표시한다.

## 9.1 팝업 목적

기존 활성 매칭이 비활성화되고 새 매칭이 생성되는 위험 작업임을 관리자에게 명확히 안내한다.

## 9.2 팝업 구성

```txt
딤드 배경
→ 중앙 모달
   → 제목: 매칭 교체 확인
   → 대상 보물 정보
   → 신규 연결 상품 정보
   → 기존 매칭 처리 안내
   → 처리 사유 textarea
   → 취소 버튼
   → 저장 버튼
```

## 9.3 표시 문구

```txt
매칭 교체 확인
대상 보물  보물 #1024 — 남산타워 근처
신규 연결 상품  스타벅스 아메리카노
기존 매칭 처리  MATCH-0087 → 비활성 전환
위 내용으로 매칭을 교체하시겠습니까? 이 작업은 되돌릴 수 없습니다.
처리 사유 (필수)
```

## 9.4 입력 필드

| 필드 | 타입 | 필수 | 제한 |
|---|---|---:|---|
| 처리 사유 | textarea | O | 5자 이상 300자 이하 |

## 9.5 버튼 동작

| 버튼 | 동작 |
|---|---|
| 취소 | 팝업 닫기, 입력값 유지 |
| 저장 | 교체 API 호출 |

## 9.6 신규 매칭만 생성하는 경우

기존 활성 매칭이 없는 경우에는 교체 확인 팝업 대신 간단한 저장 확인 팝업을 사용할 수 있다.

```txt
매칭 등록 확인
선택한 보물과 상품으로 신규 활성 매칭을 생성합니다.
```

단, MVP에서는 UX 단순화를 위해 기존 매칭이 없는 경우 저장 즉시 처리해도 된다.

---

# 10. 동작 플로우

## 10.1 신규 매칭 등록 플로우

```txt
A13 매칭 목록
→ 매칭 등록·교체 클릭
→ A14 진입
→ 대상 보물 검색 및 선택
→ active 상품 검색 및 선택
→ 저장 클릭
→ 서버 검증
→ active 매칭 생성
→ 운영 로그 기록
→ A13 매칭 목록 또는 A08 보물상자 상세 이동
```

## 10.2 기존 매칭 교체 플로우

```txt
A14 진입
→ 대상 보물 선택
→ 기존 active 매칭 조회
→ 신규 active 상품 선택
→ 저장 클릭
→ 매칭 교체 확인 팝업 표시
→ 처리 사유 입력
→ 저장 클릭
→ 기존 active 매칭 inactive 전환
→ 신규 active 매칭 생성
→ 운영 로그 기록
→ A13 매칭 목록 또는 A08 보물상자 상세 이동
```

## 10.3 실패 플로우

```txt
저장 요청
→ 서버 검증 실패
→ 오류 팝업 또는 필드 오류 표시
→ 입력값 유지
→ 관리자 재시도 가능
```

---

# 11. 서버 검증 기준

프론트에서 검증하더라도 서버에서 반드시 재검증한다.

## 11.1 권한 검증

```txt
현재 관리자 role in ('super_admin', 'operator')
```

## 11.2 보물 검증

```txt
treasure_boxes.id 존재
treasure_boxes.deleted_at is null
```

## 11.3 상품 검증

```txt
products.id 존재
products.status = active
```

## 11.4 매칭 검증

```txt
선택한 보물의 active 매칭은 최종적으로 1개만 존재해야 한다.
기존 active 매칭이 있으면 inactive로 변경한 뒤 신규 active 매칭을 생성한다.
전체 처리는 단일 트랜잭션으로 처리한다.
```

## 11.5 자기 자신 교체 방지

기존 매칭과 동일한 상품을 다시 선택한 경우 저장을 차단한다.

```txt
이미 같은 상품이 활성 매칭으로 연결되어 있습니다.
다른 상품을 선택하세요.
```

---

# 12. 데이터 모델 기준

## 12.1 Form State

```ts
type MappingCreateReplaceForm = {
  treasureId: string;
  productId: string;
  reason?: string;
};
```

## 12.2 화면 상태

```ts
type MappingCreateReplaceStatus =
  | 'idle'
  | 'loading_treasure'
  | 'loading_product'
  | 'ready'
  | 'confirm_replace'
  | 'submitting'
  | 'success'
  | 'validation_error'
  | 'permission_denied'
  | 'server_error';
```

## 12.3 기존 활성 매칭

```ts
type ActiveMappingSummary = {
  mappingId: string;
  treasureId: string;
  productId: string;
  productName: string;
  status: 'active';
  createdAt: string;
};
```

---

# 13. API 연동 기준

## 13.1 보물 검색

```txt
GET /api/admin/treasures/search?q={query}
```

응답 예시:

```ts
type TreasureSearchItem = {
  id: string;
  title: string;
  status: string;
  currentClaimCount: number;
  maxClaimCount: number;
};
```

## 13.2 상품 검색

```txt
GET /api/admin/products/search?q={query}&status=active
```

응답 예시:

```ts
type ProductSearchItem = {
  id: string;
  productName: string;
  brandName: string;
  status: 'active';
  providerProductId: string;
};
```

## 13.3 기존 활성 매칭 조회

```txt
GET /api/admin/mappings/active?treasureId={treasureId}
```

## 13.4 매칭 등록·교체

```txt
POST /api/admin/mappings/replace
```

요청 예시:

```ts
type ReplaceMappingRequest = {
  treasureId: string;
  productId: string;
  reason?: string;
};
```

서버 처리:

```txt
1. 관리자 권한 확인
2. 보물 존재 및 deleted_at 확인
3. 상품 active 확인
4. 기존 active 매칭 조회
5. 기존 active 매칭이 있으면 inactive 처리
6. 신규 active 매칭 생성
7. operation_logs 기록
8. 결과 반환
```

---

# 14. 상태별 UI

## 14.1 로딩 상태

| 상황 | 처리 |
|---|---|
| 보물 검색 중 | Select 하단 또는 입력창 내부 로딩 표시 |
| 상품 검색 중 | Select 하단 또는 입력창 내부 로딩 표시 |
| 기존 매칭 조회 중 | 기존 활성 매칭 안내 영역 skeleton 표시 |
| 저장 중 | 저장 버튼 disabled + loading 표시 |

## 14.2 빈 상태

### 보물 검색 결과 없음

```txt
조건에 맞는 보물이 없습니다.
검색어를 바꾸거나 필터를 확인하세요.
```

### 상품 검색 결과 없음

```txt
연결할 수 있는 active 상품이 없습니다.
상품을 먼저 등록하거나 상태를 active로 변경하세요.
```

## 14.3 오류 상태

| 오류 | 문구 |
|---|---|
| 권한 없음 | `이 화면에 접근할 수 있는 권한이 없습니다.` |
| 보물 조회 실패 | `보물 정보를 불러오지 못했습니다.` |
| 상품 조회 실패 | `상품 정보를 불러오지 못했습니다.` |
| 기존 매칭 조회 실패 | `기존 매칭 정보를 확인하지 못했습니다.` |
| 저장 실패 | `매칭 저장 중 오류가 발생했습니다.` |
| 중복 매칭 | `이미 같은 상품이 활성 매칭으로 연결되어 있습니다.` |

---

# 15. 보안 및 금지 사항

이 화면에서는 아래 정보를 절대 표시하지 않는다.

```txt
사용자 이메일
쿠폰 번호
바코드 원문
쿠폰 마스킹 값
기프티쇼비즈 Client Secret
기프티쇼비즈 API Key
Supabase Service Role Key
```

또한 이 화면은 기프티쇼비즈 API를 직접 호출하지 않는다.

---

# 16. 운영 로그 기준

매칭 등록 또는 교체 성공 시 운영 로그를 남긴다.

## 16.1 신규 등록 로그

```txt
action = mapping.created
target_type = treasure_product_mapping
target_id = {mappingId}
actor_id = {adminId}
reason = optional
```

## 16.2 교체 로그

```txt
action = mapping.replaced
target_type = treasure_product_mapping
target_id = {newMappingId}
previous_mapping_id = {oldMappingId}
reason = required
```

교체 사유는 민감 운영 로그가 아니라 일반 운영 로그로 관리한다.  
단, 정책상 필요한 경우 super_admin만 볼 수 있는 민감 로그로 확장 가능하다.

---

# 17. 접근성 기준

| 항목 | 기준 |
|---|---|
| 검색 입력 | label 또는 aria-label 제공 |
| Select | 키보드 탐색 가능 |
| 팝업 | focus trap 적용 |
| 팝업 열림 | 첫 번째 입력 필드 또는 제목으로 focus 이동 |
| 팝업 닫힘 | 저장 버튼으로 focus 복귀 |
| textarea | 처리 사유 필수 안내 제공 |
| 오류 메시지 | aria-live 영역 사용 권장 |

---

# 18. QA 체크리스트

## 18.1 권한

- [ ] super_admin은 A14에 접근할 수 있다.
- [ ] operator는 A14에 접근할 수 있다.
- [ ] viewer는 A14 접근 시 A24로 이동한다.
- [ ] 서버에서도 viewer 저장 요청이 차단된다.

## 18.2 보물 선택

- [ ] 보물명으로 검색할 수 있다.
- [ ] 보물 ID로 검색할 수 있다.
- [ ] 선택된 보물 요약이 표시된다.
- [ ] 삭제된 보물은 선택할 수 없다.

## 18.3 상품 선택

- [ ] 상품명으로 검색할 수 있다.
- [ ] 상품 ID로 검색할 수 있다.
- [ ] active 상품만 선택할 수 있다.
- [ ] inactive 상품은 선택 목록에 나오지 않는다.

## 18.4 신규 매칭

- [ ] 기존 active 매칭이 없으면 신규 active 매칭이 생성된다.
- [ ] 저장 후 A13 또는 A08로 이동한다.
- [ ] 운영 로그가 기록된다.

## 18.5 매칭 교체

- [ ] 기존 active 매칭이 있으면 교체 확인 팝업이 열린다.
- [ ] 처리 사유 없이는 저장할 수 없다.
- [ ] 저장 시 기존 매칭은 inactive가 된다.
- [ ] 신규 매칭은 active가 된다.
- [ ] 최종적으로 보물당 active 매칭은 1개만 남는다.
- [ ] 교체 로그가 기록된다.

## 18.6 오류

- [ ] 저장 실패 시 입력값이 유지된다.
- [ ] 서버 오류 시 재시도 가능하다.
- [ ] 동일 상품 재선택 시 저장이 차단된다.
- [ ] 네트워크 오류 시 명확한 오류 메시지를 표시한다.

---

# 19. 최종 구현 메모

```txt
A14는 매칭 생성·교체만 담당한다.
보물 생성/수정은 A07/A09에서 담당한다.
상품 생성/수정은 A11/A12-1에서 담당한다.
매칭 목록 조회와 비활성화는 A13에서 담당한다.
보물당 active 매칭은 반드시 1개만 유지한다.
기존 매칭은 삭제하지 않고 inactive 이력으로 남긴다.
```
