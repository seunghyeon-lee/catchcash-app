# A08. 보물상자 상세 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A08. 보물상자 상세 화면 정의서 |
| 파일명 | `A08_Admin_Treasure_Detail_Screen.md` |
| 화면명 | 보물상자 상세 |
| 화면 ID | `A08_Admin_Treasure_Detail_Screen` |
| 관련 상위 화면 | `A06_Admin_Treasure_List_Screen` |
| 관련 후속 화면 | `A09_Admin_Treasure_Edit_Screen`, `A14_Admin_Treasure_Product_Mapping_Edit_Screen` |
| 서비스 | 캐치캐쉬 관리자 CMS |
| 작성 목적 | 보물상자 단건 조회, 운영 상태 확인, 삭제·복구·수정·매칭 관리 기준을 개발 가능한 MD로 정의 |
| 기준 문서 | `CatchCash_Admin_CMS_Final_Functional_Spec_v1.0`, `CatchCash_Admin_CMS_Final_User_Flow_v1.0` |
| 대상 환경 | Web Admin / Desktop 우선 |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |

---

## 2. 화면 개요

보물상자 상세 화면은 관리자가 특정 보물상자의 기본 정보, 위치, 운영 조건, 연결 상품, visible 조건, 삭제·복구 이력, 등록 정보를 확인하는 화면이다.

이 화면은 보물상자를 수정하거나 삭제·복구하거나 상품 매칭 화면으로 이동하기 전, 현재 설정값과 사용자 앱 노출 가능 여부를 검증하는 기준 화면이다.

```txt
보물상자 목록
→ 보물상자 상세
→ 수정 / 삭제 / inactive로 복구 / 매칭 관리
```

---

## 3. 화면 목적

### 3.1 핵심 목적

- 보물상자 단건 정보를 조회한다.
- 사용자 앱 지도에 노출 가능한 상태인지 확인한다.
- 위치, 반경, 운영 기간, 최대 획득 수량을 확인한다.
- 연결 상품 및 현재 매칭 상태를 확인한다.
- visible 조건 체크 결과를 표시한다.
- super_admin에게 위험 액션을 제공한다.
- 삭제·복구 이력을 확인한다.
- 등록자와 최근 수정 정보를 확인한다.

### 3.2 운영자 관점 목적

- 현재 보물상자가 정상 노출 가능한지 빠르게 판단한다.
- 노출되지 않는 경우 어떤 조건이 부족한지 확인한다.
- 잘못 등록된 위치, 기간, 반경, 수량, 상품 매칭을 수정할 수 있다.
- 삭제 또는 복구가 필요한 경우 안전하게 처리할 수 있다.

---

## 4. 진입 조건

### 4.1 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| A06 보물상자 목록 | 테이블 행의 `상세` 클릭 |
| A02 대시보드 | visible 보물 카드 또는 최근 현황에서 보물상자 이동 |
| A14 매칭 등록·교체 | 매칭 저장 후 보물 상세로 복귀 |
| A21/A22 보안 로그 | 관련 보물상자 링크 클릭 |
| A23 운영 로그 | 관련 보물상자 링크 클릭 |

### 4.2 Route

```txt
/admin/treasures/[treasureId]
```

Next.js App Router 권장 파일 경로:

```txt
app/admin/(protected)/treasures/[treasureId]/page.tsx
```

### 4.3 접근 가능 role

| Role | 접근 | 설명 |
|---|---:|---|
| super_admin | O | 전체 조회 및 위험 액션 가능 |
| operator | O | 조회, 수정, 매칭 관리 가능 |
| viewer | O | 조회만 가능 |

---

## 5. 권한 정책

### 5.1 role별 액션

| 액션 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 상세 조회 | O | O | O |
| 목록으로 이동 | O | O | O |
| 수정 화면 이동 | O | O | X |
| 매칭 관리 이동 | O | O | X |
| 삭제 | O | X | X |
| inactive로 복구 | O | X | X |
| 삭제·복구 이력 조회 | O | O | O |
| 등록 정보 조회 | O | O | O |

### 5.2 버튼 노출 기준

```txt
viewer:
- 수정 버튼 숨김
- 매칭 관리 버튼 숨김
- 위험 액션 영역 숨김 또는 읽기 전용 안내 표시

operator:
- 수정 버튼 노출
- 매칭 관리 버튼 노출
- 삭제 / 복구 버튼 숨김

super_admin:
- 수정 버튼 노출
- 매칭 관리 버튼 노출
- 삭제 / 복구 버튼 노출
```

중요:

```txt
버튼을 숨기더라도 서버에서 role을 반드시 재검증한다.
```

---

## 6. 화면 레이아웃

### 6.1 전체 구조

```txt
AdminLayout
├─ TopBar
│  ├─ 검색
│  ├─ 권한 표시
│  └─ 관리자 아바타
├─ Sidebar
│  └─ role 기준 메뉴
└─ Content
   ├─ Header
   │  ├─ 보물상자 상세
   │  ├─ 보물상자 설명
   │  ├─ 목록으로
   │  └─ 수정
   ├─ Main Column
   │  ├─ 기본 정보 카드
   │  ├─ 위치 및 반경 카드
   │  ├─ 운영 조건 카드
   │  ├─ 연결 상품 및 매칭 카드
   │  └─ visible 조건 체크 카드
   └─ Side Column
      ├─ 위험 액션 카드
      ├─ 삭제·복구 이력 카드
      └─ 등록 정보 카드
```

### 6.2 와이어프레임 구조

```txt
┌──────────────────────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                         [검색] 권한 [Aa]        │
├───────────────┬──────────────────────────────────────────────┤
│ 사이드바       │ 보물상자 상세                    목록으로 수정 │
│               │ 보물상자-해운 상인                            │
│               │                                              │
│               │ [기본 정보]                         [위험 액션] │
│               │ [위치 및 반경]                     [삭제·복구] │
│               │ [운영 조건]                         [등록 정보] │
│               │ [연결 상품 및 매칭]                            │
│               │ [visible 조건 체크]                            │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 7. UI 구성 요소

## 7.1 화면 헤더

| 요소 | 내용 | 처리 |
|---|---|---|
| 제목 | `보물상자 상세` | 코드 텍스트 |
| 설명 | `{보물상자명}` 또는 `{보물상자명} 운영` | 코드 텍스트 |
| 목록으로 | A06 목록으로 이동 | Link/Button |
| 수정 | A09 수정 화면 이동 | Button, role 조건 |

### 동작

| 액션 | 처리 |
|---|---|
| 목록으로 클릭 | `/admin/treasures` 이동 |
| 수정 클릭 | `/admin/treasures/{treasureId}/edit` 이동 |

---

## 7.2 기본 정보 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 보물상자 ID | `B-1042` | 내부 식별자 |
| 제목 | `봄 나들이 보물상자` | 관리자 등록명 |
| 저장 상태 | `active` | DB 저장 상태 |
| 계산 상태 | `visible` | 사용자 앱 노출 가능 계산 결과 |
| 표시 상태 | `visible` | 지도 노출 상태 요약 |
| 설명 | `봄 시즌 이벤트 보물` | 관리자 입력 설명 |
| 위치 문구 | `서울 종로구 광화문광장 서쪽 담장` | 사용자/관리자 표시용 위치 설명 |
| 힌트 | `큰 건물 앞쪽을 봐라` | 사용자 앱 힌트 팝업에 사용 |

### 상태 배지

| 상태 유형 | 값 | 표시 |
|---|---|---|
| 저장 상태 | `active` | 활성 |
| 저장 상태 | `inactive` | 비활성 |
| 계산 상태 | `visible` | 노출 가능 |
| 계산 상태 | `scheduled` | 예정 |
| 계산 상태 | `expired` | 기간 종료 |
| 계산 상태 | `sold_out` | 수량 소진 |
| 계산 상태 | `invalid` | 조건 부족 |
| 계산 상태 | `deleted` | 삭제됨 |

---

## 7.3 위치 및 반경 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 위도 | `37.578920` | treasure latitude |
| 경도 | `126.977041` | treasure longitude |
| 허용 반경 | `30m` | 사냥 가능 반경 |
| 지도 미리보기 | Naver Map 또는 placeholder | 좌표 위치 확인 |

### 지도 미리보기 기준

```txt
지도는 Naver Maps JavaScript API로 렌더링한다.
좌표가 없거나 API 로드 실패 시 placeholder를 표시한다.
상세 화면에서는 좌표 수정 불가, 수정 화면에서만 변경 가능하다.
```

### 지도 상태

| 상태 | 처리 |
|---|---|
| 좌표 있음 | 지도 중심을 해당 좌표로 설정 |
| 좌표 없음 | `좌표가 등록되지 않았습니다.` 표시 |
| 지도 로딩 | skeleton 또는 loading |
| 지도 오류 | `지도를 불러오지 못했습니다.` 표시 |

---

## 7.4 운영 조건 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 운영 시작일 | `2025-04-01 00:00` | starts_at |
| 운영 종료일 | `2025-06-30 23:59` | ends_at |
| 최대 획득 수 | `100` | max_claim_count |
| 현재 획득 수 | `43` | current_claim_count |

### 수량 정책

```txt
current_claim_count < max_claim_count 이면 수량 조건 충족.
current_claim_count >= max_claim_count 이면 sold_out 상태로 계산한다.
```

### 기간 정책

```txt
현재 시각 < starts_at → scheduled
starts_at <= 현재 시각 <= ends_at → 기간 조건 충족
현재 시각 > ends_at → expired
```

시간 기준:

```txt
Asia/Seoul(KST)
```

---

## 7.5 연결 상품 및 매칭 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 상품명 | `스타벅스 아메리카노 Tall` | 연결된 상품명 |
| 상품 상태 | `active` | 상품 사용 가능 여부 |
| 매칭 상태 | `활성 매칭` | 현재 보물에 연결된 활성 상품 여부 |
| 기프티쇼비즈 상품 ID | `GFT-000001` | 외부 상품 식별자, 쿠폰 원문 아님 |
| 매칭 관리 | `매칭 관리` | A14 이동 링크 |

### 매칭 정책

```txt
보물상자당 활성 상품은 1개만 연결한다.
활성 매칭이 없으면 visible 조건은 불충족 처리한다.
상품 상태가 inactive이면 visible 조건은 불충족 처리한다.
```

### 버튼 동작

| 액션 | 처리 |
|---|---|
| 매칭 관리 클릭 | `/admin/mappings/edit?treasureId={treasureId}` 이동 |

### 버튼 노출

| Role | 매칭 관리 버튼 |
|---|---:|
| super_admin | 노출 |
| operator | 노출 |
| viewer | 숨김 |

---

## 7.6 visible 조건 체크 카드

사용자 앱 지도 노출 여부를 판단하는 조건을 체크리스트로 보여준다.

### 체크 항목

| 조건 | 충족 기준 |
|---|---|
| 삭제되지 않음 | `deleted_at is null` |
| 기간 유효 | `starts_at <= now <= ends_at` |
| 좌표 존재 | `latitude`, `longitude` 존재 |
| 잔여 수량 존재 | `current_claim_count < max_claim_count` |
| 활성 매칭 1개 존재 | 활성 상품 매칭 존재 |
| 연결 상품 active | 상품 상태가 active |

### 표시 방식

| 상태 | 표시 |
|---|---|
| 충족 | `충족` 배지 |
| 불충족 | `불충족` 배지 |
| 확인 불가 | `확인 필요` 배지 |

### 계산 결과

```ts
export type TreasureCalculatedStatus =
  | 'visible'
  | 'scheduled'
  | 'expired'
  | 'sold_out'
  | 'invalid'
  | 'deleted';
```

### visible 판단식

```txt
deleted_at 없음
AND status = active
AND starts_at <= now
AND ends_at >= now
AND latitude 존재
AND longitude 존재
AND current_claim_count < max_claim_count
AND active mapping 1개 존재
AND mapped product status = active
→ visible
```

---

## 7.7 위험 액션 카드

위험 액션은 보물상자 상태를 크게 변경하는 작업이다.

### 표시 액션

| 현재 상태 | 버튼 | 설명 |
|---|---|---|
| 삭제되지 않음 | 삭제 | 보물상자 소프트 삭제 |
| 삭제됨 | inactive로 복구 | 삭제된 보물상자를 inactive 상태로 복구 |

### 권한

```txt
위험 액션은 super_admin만 가능하다.
operator와 viewer에게는 버튼을 노출하지 않는다.
```

### 삭제 정책

```txt
보물상자 삭제는 물리 삭제가 아니라 soft delete다.
삭제 시 deleted_at을 기록한다.
삭제된 보물은 사용자 앱 지도에 노출하지 않는다.
삭제된 보물은 수정 및 매칭 관리가 제한된다.
```

### 복구 정책

```txt
복구 시 항상 inactive 상태가 된다.
복구 후 자동으로 active 또는 visible이 되면 안 된다.
복구 후 운영자가 직접 검수하고 수정 화면에서 active 전환해야 한다.
```

### 확인 팝업

삭제 또는 복구 버튼 클릭 시 확인 팝업을 표시한다.

```txt
삭제 확인 팝업
- 제목: 보물상자를 삭제할까요?
- 설명: 삭제된 보물상자는 사용자 앱 지도에 노출되지 않습니다.
- 필수 입력: 삭제 사유
- 버튼: 취소 / 삭제

복구 확인 팝업
- 제목: 보물상자를 복구할까요?
- 설명: 복구된 보물상자는 inactive 상태로 저장됩니다.
- 필수 입력: 복구 사유
- 버튼: 취소 / inactive로 복구
```

---

## 7.8 삭제·복구 이력 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 일시 | `2025-03-15 09:22` | 액션 발생 시각 |
| 액션 | `삭제` / `복구` | 작업 유형 |
| 처리자 | `운영자 홍길동` | 관리자명 또는 ID |
| 사유 | `오류로 인한 일시 삭제` | 입력 사유 |

### 정렬

```txt
최신 이력을 위에 표시한다.
최대 5건 우선 표시하고, 더보기는 P1 이후 확장한다.
```

---

## 7.9 등록 정보 카드

### 표시 항목

| 항목 | 예시 | 설명 |
|---|---|---|
| 등록자 | `김운영` | created_by admin |
| 등록일 | `2025-03-10 10:00` | created_at |
| 최근 수정자 | `홍길동` | updated_by admin |
| 최근 수정일 | `2025-04-02 17:33` | updated_at |

### 표시 제한

```txt
관리자 이메일은 노출하지 않는다.
관리자 표시명 또는 내부 ID만 표시한다.
```

---

## 8. 데이터 연동 기준

## 8.1 조회 대상 데이터

```txt
treasure_boxes
treasure_product_mappings
products
treasure_visibility_status_view 또는 서버 계산 결과
treasure_delete_restore_logs
admin_profiles
```

## 8.2 권장 API

| 목적 | Method | Endpoint |
|---|---|---|
| 보물상자 상세 조회 | GET | `/api/admin/treasures/{treasureId}` |
| 보물상자 삭제 | POST | `/api/admin/treasures/{treasureId}/delete` |
| 보물상자 복구 | POST | `/api/admin/treasures/{treasureId}/restore` |
| 삭제·복구 이력 조회 | GET | `/api/admin/treasures/{treasureId}/history` |

## 8.3 상세 응답 예시

```ts
export type AdminTreasureDetail = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  location_text: string | null;
  hint_text: string | null;
  status: 'active' | 'inactive';
  calculated_status: 'visible' | 'scheduled' | 'expired' | 'sold_out' | 'invalid' | 'deleted';
  latitude: number | null;
  longitude: number | null;
  radius_m: number;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  current_claim_count: number;
  deleted_at: string | null;
  mapping: {
    id: string;
    status: 'active' | 'inactive';
    product: {
      id: string;
      giftishow_product_id: string | null;
      name: string;
      brand_name: string | null;
      status: 'active' | 'inactive';
    } | null;
  } | null;
  visible_checks: {
    not_deleted: boolean;
    period_valid: boolean;
    coordinate_exists: boolean;
    remaining_quantity_exists: boolean;
    active_mapping_exists: boolean;
    mapped_product_active: boolean;
  };
  created_by_name: string | null;
  created_at: string;
  updated_by_name: string | null;
  updated_at: string | null;
};
```

---

## 9. 상태 처리

## 9.1 화면 상태

| 상태 | 처리 |
|---|---|
| loading | 전체 skeleton 표시 |
| success | 상세 데이터 표시 |
| not_found | `보물상자를 찾을 수 없습니다.` 표시 |
| forbidden | A24 접근 권한 부족 화면 이동 |
| server_error | 공통 오류 카드 + 다시 시도 버튼 |

## 9.2 버튼 상태

| 버튼 | 조건 | 처리 |
|---|---|---|
| 수정 | 삭제되지 않음 + super_admin/operator | 활성 |
| 수정 | 삭제됨 | 비활성 또는 숨김 |
| 매칭 관리 | 삭제되지 않음 + super_admin/operator | 활성 |
| 매칭 관리 | 삭제됨 | 비활성 또는 숨김 |
| 삭제 | 삭제되지 않음 + super_admin | 활성 |
| inactive로 복구 | 삭제됨 + super_admin | 활성 |

---

## 10. 사용자 앱과의 정합성

### 10.1 지도 노출 정합성

상세 화면의 visible 조건은 사용자 앱 지도 상세 화면에서 보물 마커를 노출하는 조건과 동일해야 한다.

```txt
active
not deleted
period valid
coordinate exists
remaining quantity exists
active product mapping exists
product active
```

### 10.2 힌트 팝업 정합성

보물상자 상세의 아래 정보는 사용자 앱 힌트 팝업에 연결된다.

| 관리자 상세 항목 | 사용자 앱 사용 위치 |
|---|---|
| 제목 | 힌트 팝업 보물명 |
| 위치 문구 | 힌트 팝업 지역/위치 설명 |
| 힌트 | 힌트 카드 |
| 허용 반경 | 사냥 가능 거리 안내 |
| 계산 상태 | 사냥 가능 여부 |

### 10.3 AR 사냥 정합성

AR 사냥 진입 전 서버는 상세 화면의 visible 조건과 같은 기준을 다시 검증한다.

```txt
CMS 화면의 visible 표시는 참고용이다.
최종 획득 가능 여부는 서버 RPC에서 다시 검증한다.
```

---

## 11. 보안 및 민감 정보 정책

이 화면에서는 아래 정보를 표시하지 않는다.

```txt
사용자 이메일
사용자 휴대폰 번호
쿠폰 번호
바코드 원문
기프티쇼비즈 Client Secret
Supabase Service Role Key
```

기프티쇼비즈 상품 ID는 외부 상품 식별자일 뿐, 쿠폰 번호가 아니므로 표시 가능하다.

---

## 12. 컴포넌트 분리 기준

```txt
AdminTreasureDetailPage
AdminTreasureDetailHeader
TreasureBasicInfoCard
TreasureLocationRadiusCard
TreasureOperationConditionCard
TreasureProductMappingCard
TreasureVisibleCheckCard
TreasureDangerActionCard
TreasureDeleteRestoreHistoryCard
TreasureRegistrationInfoCard
DeleteTreasureConfirmDialog
RestoreTreasureConfirmDialog
StatusBadge
VisibleCheckBadge
```

---

## 13. QA 체크리스트

### 13.1 접근 권한

- [ ] super_admin은 상세, 수정, 삭제, 복구, 매칭 관리가 가능하다.
- [ ] operator는 상세, 수정, 매칭 관리가 가능하다.
- [ ] operator는 삭제와 복구를 할 수 없다.
- [ ] viewer는 상세 조회만 가능하다.
- [ ] viewer에게 수정, 매칭 관리, 삭제, 복구 버튼이 노출되지 않는다.
- [ ] 서버 API에서 role을 재검증한다.

### 13.2 데이터 표시

- [ ] 보물상자 ID, 제목, 설명, 위치 문구가 표시된다.
- [ ] 저장 상태와 계산 상태가 분리 표시된다.
- [ ] 위도, 경도, 허용 반경이 표시된다.
- [ ] 운영 기간, 최대 획득 수, 현재 획득 수가 표시된다.
- [ ] 연결 상품과 매칭 상태가 표시된다.
- [ ] visible 조건 체크가 항목별로 표시된다.

### 13.3 상태 처리

- [ ] visible 조건이 모두 충족되면 visible로 표시된다.
- [ ] 기간 전이면 scheduled로 표시된다.
- [ ] 기간 후이면 expired로 표시된다.
- [ ] 수량이 소진되면 sold_out으로 표시된다.
- [ ] 필수 조건이 부족하면 invalid로 표시된다.
- [ ] 삭제된 보물은 deleted로 표시된다.

### 13.4 위험 액션

- [ ] 삭제 시 확인 팝업이 뜬다.
- [ ] 삭제 사유 없이 삭제할 수 없다.
- [ ] 삭제 후 사용자 앱 지도에 노출되지 않는다.
- [ ] 복구 시 확인 팝업이 뜬다.
- [ ] 복구 사유 없이 복구할 수 없다.
- [ ] 복구 후 상태는 항상 inactive다.
- [ ] 삭제·복구 이력이 기록된다.

### 13.5 민감 정보

- [ ] 쿠폰 번호가 표시되지 않는다.
- [ ] 바코드 원문이 표시되지 않는다.
- [ ] 사용자 이메일이 표시되지 않는다.
- [ ] 관리자 이메일 대신 표시명 또는 내부 ID를 사용한다.

---

## 14. 최종 구현 메모

```txt
이 화면은 보물상자 상세 조회 화면이다.
직접 입력 수정은 하지 않는다.
수정은 A09 보물상자 수정 화면에서 처리한다.
삭제와 복구는 super_admin 전용 위험 액션이다.
복구된 보물상자는 반드시 inactive 상태로 돌아간다.
visible 조건 체크는 사용자 앱 지도 노출 조건과 동일해야 한다.
```
