# A12. 상품 상세 화면 정의서

> 문서 버전: `v1.0`  
> 화면 ID: `A12_Admin_Product_Detail_Screen`  
> 화면명: 상품 상세  
> Route: `/admin/products/[productId]`  
> 작성 목적: 캐치캐쉬 관리자 CMS 상품 상세 화면의 바이브코딩용 구현 명세  
> 기준 화면: 상품 상세 와이어프레임 / inactive 전환 경고 팝업  
> 연계 화면: `A10_Admin_Product_List_Screen`, `A11_Admin_Product_Create_Screen`, `A13_Admin_Mapping_List_Screen`, `A14_Admin_Mapping_Edit_Screen`

---

# 1. 화면 개요

상품 상세 화면은 관리자 CMS에서 등록된 상품의 기본 정보, 가격, 상태, 외부 상품 ID, 이미지, 보물상자 연결 현황을 조회하는 화면이다.

이 화면은 상품 정보를 확인하고, 필요 시 상품 수정 화면으로 이동하는 역할을 한다.

MVP에서는 상품 상세와 수정 진입을 같은 도메인으로 보되, 실제 값 변경은 별도 수정 모드 또는 수정 화면에서 처리한다.

```txt
상품 목록
→ 상품 상세
→ 상품 수정
→ 저장
→ 상품 상세 복귀
```

---

# 2. 화면 목적

## 2.1 관리자 목적

- 상품명, 브랜드, 가격, 상태 확인
- 외부 상품 ID 확인
- 상품 이미지 미리보기 확인
- 현재 연결된 active 보물 수 확인
- inactive 변경 시 영향 범위 확인
- 연관 매칭 현황 확인
- 상품 수정 화면으로 이동

## 2.2 운영상 중요한 기준

```txt
상품은 보물상자와 연결되어 사용자 보상 발급에 사용된다.
상품 상태 변경은 연결된 보물의 노출 가능 여부에 영향을 줄 수 있다.
현재 active 보물에 연결된 상품을 inactive로 변경할 때는 반드시 경고한다.
```

---

# 3. 진입 조건

| 진입 경로 | 조건 |
|---|---|
| 상품 목록 | 상품 row의 `상세` 클릭 |
| 매칭 목록 | 연결 상품명 또는 상품 ID 클릭 |
| 보물상자 상세 | 연결 상품 영역에서 상품명 클릭 |
| 대시보드/검색 | 상품 관련 빠른 이동 |

---

# 4. 접근 권한

| 역할 | 접근 | 수정 버튼 | 상태 변경 | 비고 |
|---|---:|---:|---:|---|
| super_admin | O | O | O | 전체 조회/수정 가능 |
| operator | O | O | O | 일반 운영 수정 가능 |
| viewer | O | X | X | 조회만 가능 |

## 4.1 접근 제한 처리

```txt
권한 없는 사용자가 직접 수정 route에 접근하면 A24 접근 권한 부족 화면으로 이동한다.
상품 상세 조회 자체는 viewer도 가능하다.
```

---

# 5. Route

## 5.1 권장 Route

```txt
/admin/products/[productId]
```

## 5.2 수정 Route

```txt
/admin/products/[productId]/edit
```

또는 같은 화면 내 edit mode로 처리할 수 있다.

```txt
/admin/products/[productId]?mode=edit
```

MVP에서는 구현 단순화를 위해 별도 edit route를 권장한다.

---

# 6. 화면 레이아웃

```txt
┌────────────────────────────────────────────────────────────┐
│ Admin Header                                                │
├───────────────┬────────────────────────────────────────────┤
│ Sidebar       │ 상품 상세                         [상품 수정] │
│               │                                            │
│               │ [기본 정보 카드]       [운영 상태 요약 카드]  │
│               │                                            │
│               │ [가격 및 상태 카드]    [이미지 미리보기 카드] │
│               │                                            │
│               │ [연관 매칭 현황 테이블]                     │
└───────────────┴────────────────────────────────────────────┘
```

## 6.1 화면 구성 순서

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | Admin Header | 검색, 권한, 계정 아바타 |
| 2 | Sidebar | role 기준 메뉴 |
| 3 | 페이지 타이틀 | `상품 상세` |
| 4 | 상품 수정 버튼 | super_admin/operator만 노출 |
| 5 | 기본 정보 카드 | 이미지, 상품명, 브랜드, 상태, 등록일, 수정일 |
| 6 | 가격 및 상태 카드 | 판매 가격, 상태, 외부 상품 ID |
| 7 | 연관 매칭 현황 | 연결된 보물 목록 |
| 8 | 운영 상태 요약 | 현재 연결 상태와 영향 안내 |
| 9 | 이미지 미리보기 | Storage 이미지 경로 및 이미지 |
| 10 | inactive 전환 경고 팝업 | 수정 과정에서 상태 변경 시 노출 |

---

# 7. UI 구성 요소

## 7.1 페이지 헤더

| 요소 | 문구/값 | 처리 |
|---|---|---|
| 제목 | `상품 상세` | 코드 텍스트 |
| 상품 수정 버튼 | `상품 수정` | 버튼 |

### 버튼 노출 조건

```txt
role in (super_admin, operator) → 상품 수정 버튼 노출
role = viewer → 상품 수정 버튼 숨김
```

---

## 7.2 기본 정보 카드

### 표시 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| 상품 이미지 | 상품 대표 이미지 | image placeholder |
| 상품명 | 관리자 등록 상품명 | 스타벅스 아메리카노 T |
| 브랜드 | 상품 브랜드 | 스타벅스 |
| 상태 | active/inactive | active |
| 등록일 | 상품 최초 등록 일시 | 2024-11-03 14:22 |
| 최종 수정일 | 마지막 수정 일시 | 2025-01-15 09:41 |

### 구현 기준

```txt
상품 이미지는 Supabase Storage 경로를 사용한다.
이미지 로드 실패 시 fallback placeholder를 표시한다.
텍스트 정보는 이미지 안에 포함하지 않는다.
```

---

## 7.3 가격 및 상태 카드

### 표시 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| 판매 가격 | 상품 정가 또는 운영 표시 가격 | 4,500원 |
| 상태 | 상품 운영 상태 | active |
| 외부 상품 ID | 기프티쇼비즈 상품 ID | GS-00293847 |

### 상태 배지

| 상태 | 표시 | 의미 |
|---|---|---|
| active | `active` | 매칭 가능, 운영 사용 가능 |
| inactive | `inactive` | 신규 매칭 불가, 운영 중단 |

---

## 7.4 연관 매칭 현황 테이블

### 목적

현재 상품이 어떤 보물상자에 연결되어 있는지 확인한다.

### 컬럼

| 컬럼 | 설명 |
|---|---|
| 보물 ID | 연결된 보물상자 ID |
| 보물명 | 연결된 보물상자명 |
| 매칭 상태 | active/inactive |
| 매칭 등록일 | 상품이 보물에 연결된 일자 |

### row 클릭

| 액션 | 이동 |
|---|---|
| 보물 ID 클릭 | `/admin/treasures/[treasureId]` |
| 보물명 클릭 | `/admin/treasures/[treasureId]` |

### 데이터 없을 때

```txt
아직 연결된 보물상자가 없습니다.
```

---

## 7.5 운영 상태 요약 카드

### 표시 항목

| 항목 | 설명 |
|---|---|
| 현재 활성 수 | 이 상품이 active 상태로 연결된 보물 수 |
| 연결된 active 보물 | active 보물 연결 수 |
| inactive 전환 영향 | inactive 변경 시 영향 안내 |

### 문구 예시

```txt
이 상품을 inactive로 변경하면 연결된 active 보물의 운영 상태에 영향을 줄 수 있습니다.
```

---

## 7.6 이미지 미리보기 카드

### 표시 항목

| 항목 | 설명 |
|---|---|
| 이미지 미리보기 | 실제 상품 이미지 |
| 이미지 경로 | Supabase Storage path |

### 경로 예시

```txt
storage/products/gs-00293847.jpg
```

### 이미지 오류 처리

```txt
이미지 로드 실패 시 placeholder 표시
Storage path가 없으면 '등록된 이미지 없음' 표시
```

---

# 8. inactive 전환 경고 팝업

## 8.1 팝업 노출 조건

상품 수정 과정에서 아래 조건을 만족하면 경고 팝업을 표시한다.

```txt
기존 상태 = active
변경 상태 = inactive
연결된 active 보물 수 > 0
```

## 8.2 팝업 문구

```txt
inactive 전환 경고
현재 이 상품에 연결된 active 보물이 2개 있습니다.
inactive로 변경하면 해당 보물의 운영에 영향을 줄 수 있습니다.
```

## 8.3 버튼

| 버튼 | 동작 |
|---|---|
| 닫기 | 팝업 닫기, 수정 화면 유지 |
| 수정 화면으로 이동 | 상품 수정 화면으로 이동 |

## 8.4 주의

```txt
이 팝업은 상세 화면에서 직접 상태를 변경하는 팝업이 아니다.
상태 변경은 수정 화면에서 저장 시 처리한다.
```

---

# 9. 데이터 모델 기준

## 9.1 Product

```ts
type ProductStatus = 'active' | 'inactive';

interface AdminProductDetail {
  id: string;
  product_name: string;
  brand_name: string;
  external_product_id: string;
  price: number;
  status: ProductStatus;
  image_url: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
  active_mapping_count: number;
  total_mapping_count: number;
}
```

## 9.2 ProductMappingSummary

```ts
interface ProductMappingSummary {
  treasure_id: string;
  treasure_name: string;
  mapping_status: 'active' | 'inactive';
  mapped_at: string;
}
```

---

# 10. API 연동 기준

## 10.1 상세 조회

```txt
GET /api/admin/products/{productId}
```

### 응답 포함 데이터

```txt
상품 기본 정보
상품 이미지 경로
상품 상태
가격
외부 상품 ID
연결 매칭 요약
운영 상태 요약
```

## 10.2 권한 검증

```txt
서버에서 관리자 세션과 role을 검증한다.
viewer도 상세 조회는 가능하다.
수정 API는 viewer 접근을 차단한다.
```

---

# 11. 상태별 화면 처리

| 상태 | 화면 처리 |
|---|---|
| loading | 스켈레톤 또는 로딩 표시 |
| success | 상품 상세 정보 표시 |
| not_found | 상품을 찾을 수 없음 안내 |
| forbidden | A24 접근 권한 부족 이동 |
| server_error | 조회 실패 카드 + 다시 시도 버튼 |
| image_error | 이미지 placeholder 표시 |

---

# 12. 보안 및 노출 금지 정보

상품 상세 화면에서는 아래 정보를 노출하지 않는다.

```txt
쿠폰 번호
바코드 원문
바코드 마스킹 값
기프티쇼비즈 Secret
사용자 이메일
Supabase service role key
```

---

# 13. 화면 전환

| 액션 | 이동/처리 |
|---|---|
| 상품 수정 클릭 | `/admin/products/[productId]/edit` |
| 보물 row 클릭 | `/admin/treasures/[treasureId]` |
| 목록 메뉴 클릭 | `/admin/products` |
| 뒤로가기 | 이전 화면 또는 상품 목록 |
| 조회 실패 다시 시도 | 상세 API 재호출 |

---

# 14. QA 체크리스트

## 14.1 권한

- [ ] super_admin은 상품 상세를 볼 수 있다.
- [ ] operator는 상품 상세를 볼 수 있다.
- [ ] viewer는 상품 상세를 볼 수 있다.
- [ ] viewer에게 상품 수정 버튼이 보이지 않는다.
- [ ] viewer가 수정 route에 직접 접근하면 A24로 이동한다.

## 14.2 데이터

- [ ] 상품명, 브랜드, 가격, 상태가 올바르게 표시된다.
- [ ] 외부 상품 ID가 표시된다.
- [ ] 등록일, 최종 수정일이 표시된다.
- [ ] 연결된 보물 목록이 표시된다.
- [ ] 연결된 active 보물 수가 표시된다.

## 14.3 이미지

- [ ] 이미지 URL이 있으면 미리보기가 표시된다.
- [ ] 이미지 URL이 없으면 placeholder가 표시된다.
- [ ] 이미지 로드 실패 시 화면이 깨지지 않는다.

## 14.4 inactive 경고

- [ ] active 상품을 inactive로 변경하려 할 때 연결된 active 보물이 있으면 경고한다.
- [ ] 경고 팝업에서 닫기를 누르면 팝업만 닫힌다.
- [ ] 경고 팝업에서 수정 화면으로 이동을 누르면 수정 화면으로 이동한다.

## 14.5 보안

- [ ] 쿠폰 번호가 노출되지 않는다.
- [ ] 바코드가 노출되지 않는다.
- [ ] 사용자 이메일이 노출되지 않는다.
- [ ] 외부 API Secret이 노출되지 않는다.

---

# 15. 구현 메모

```txt
상품 상세는 운영자가 상품과 보물 연결 영향을 판단하는 화면이다.
상품 상태 변경은 단순 표시값이 아니라 보물 운영 상태에 영향을 줄 수 있으므로 active 보물 연결 수를 반드시 함께 보여준다.
```
