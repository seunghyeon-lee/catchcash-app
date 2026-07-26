# A09. 관리자 보물상자 수정 화면 정의서

> 문서 버전: `v1.0`  
> 작성 기준: 캐치캐쉬 관리자 CMS MVP / 보물상자 수정 폼 와이어프레임 기준  
> 화면 ID: `A09_Admin_Treasure_Edit_Screen`  
> 관련 화면: `A06_Admin_Treasure_List_Screen`, `A07_Admin_Treasure_Create_Screen`, `A08_Admin_Treasure_Detail_Screen`, `A14_Admin_Treasure_Product_Mapping_Edit_Screen`  
> 작성 목적: 바이브코딩을 위한 관리자 CMS 화면 단위 구현 명세

---

# 1. 화면 개요

## 1.1 화면명

보물상자 수정 화면

## 1.2 화면 목적

보물상자 수정 화면은 이미 등록된 보물상자의 기본 정보, 위치 정보, 운영 조건, 저장 상태를 수정하는 관리자 화면이다.

이 화면은 신규 등록 화면과 유사한 폼 구조를 사용하지만, 기존 데이터가 입력된 상태로 진입하며 저장 시 수정 정책과 active 전환 조건을 함께 검증한다.

```txt
보물상자 상세
→ 수정 버튼 클릭
→ 보물상자 수정 화면 진입
→ 정보 수정
→ 저장
→ 검증 통과 시 상세 화면 복귀
```

## 1.3 핵심 역할

- 기존 보물상자 정보 수정
- 지도 기반 위치·반경 수정
- 운영 기간·최대 획득 수량 수정
- 저장 상태 inactive/active 변경
- active 전환 가능 조건 안내
- active 전환 불가 시 사유 팝업 표시
- 수정 저장 후 보물상자 상세 화면으로 이동

---

# 2. 진입 조건

## 2.1 진입 경로

| 이전 화면 | 진입 액션 |
|---|---|
| A08 보물상자 상세 | `수정` 버튼 클릭 |
| A06 보물상자 목록 | 액션 영역의 `수정` 또는 상세 진입 후 수정 |
| A14 매칭 관리 | 매칭 후 보물상자 상태 수정 필요 시 상세를 거쳐 진입 |

## 2.2 Route

```txt
/admin/treasures/[treasureId]/edit
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/treasures/[treasureId]/edit/page.tsx
```

## 2.3 접근 가능 권한

| 역할 | 접근 | 비고 |
|---|---:|---|
| super_admin | O | 전체 수정 가능 |
| operator | O | 일반 수정 가능, 삭제·복구 불가 |
| viewer | X | 조회 전용, 접근 시 A24 접근 권한 부족 화면 |

viewer는 수정 화면에 직접 접근할 수 없다.

```txt
viewer가 URL 직접 접근
→ /admin/access-denied
```

---

# 3. 화면 구조

와이어프레임 기준 화면 구성은 아래 순서로 확정한다.

```txt
AdminLayout
→ 상단 헤더
→ 보물상자 수정 폼
  → 기본 정보
  → 위치 정보
  → 운영 조건
→ 우측 안내 패널
  → active 전환 조건 검사
  → 수정 정책 안내
→ 하단 액션
  → 취소
  → 저장
→ active 전환 불가 팝업
```

## 3.1 레이아웃 구성

| 영역 | 설명 |
|---|---|
| 좌측 사이드바 | 관리자 메뉴 영역 |
| 상단 바 | 검색, 권한 표시, 계정 아바타 |
| 본문 좌측 | 수정 입력 폼 |
| 본문 우측 | active 전환 조건 및 수정 정책 안내 |
| 하단 우측 | 취소 / 저장 버튼 |

## 3.2 화면 와이어프레임

```txt
┌──────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                         검색 권한│
├───────────────┬──────────────────────────────┤
│ 메뉴          │ 보물상자 수정        상세로 돌아가기│
│ 대시보드       │                              │
│ 보물상자       │ ┌ 기본 정보 ┐  ┌ active 전환 조건 검사 ┐ │
│ 상품          │ │ 제목      │  │ 선택 보물 정보 존재     │ │
│ 매칭          │ │ 설명      │  │ 운영 기간 유효          │ │
│ 보상          │ │ 위치 문구  │  │ 위도·경도 좌표 존재      │ │
│ 유저          │ │ 힌트      │  │ 잔여 수량 조건          │ │
│ 문의          │ │ 저장 상태  │  │ 활성 매칭 1개 존재       │ │
│ 로그          │ └──────────┘  └ 수정 정책 안내 ┘       │
│ 관리자        │ ┌ 위치 정보 ┐                         │
│              │ │ 위도/경도/반경                       │
│              │ │ 지도 미리보기                         │
│              │ └──────────┘                         │
│              │ ┌ 운영 조건 ┐                         │
│              │ │ 운영 시작일/종료일                    │
│              │ │ 최대 획득 수                          │
│              │ └──────────┘                         │
│              │                         [취소] [저장] │
└───────────────┴──────────────────────────────┘
```

---

# 4. UI 구성 요소

## 4.1 상단 헤더

| 요소 | 내용 | 처리 |
|---|---|---|
| 브랜드 | `캐치캐쉬 CMS` | 코드 텍스트 |
| 검색 입력 | 공통 관리자 검색 | 선택 구현 |
| 권한 표시 | `권한` 라벨 | 현재 관리자 role 표시 가능 |
| 아바타 | `Aa` 원형 | CSS |

## 4.2 화면 제목 영역

| 요소 | 문구 | 설명 |
|---|---|---|
| 화면 제목 | `보물상자 수정` | 본문 상단 좌측 |
| 보조 액션 | `상세로 돌아가기` | A08 상세 화면으로 이동 |

동작:

```txt
상세로 돌아가기 클릭
→ /admin/treasures/[treasureId]
```

---

# 5. 입력 폼 상세

## 5.1 기본 정보 섹션

### 구성

```txt
제목
설명
위치 문구
힌트
저장 상태
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| 제목 | text input | O | 보물상자 이름 |
| 설명 | textarea | 선택 | 운영자용 또는 사용자 표시용 설명 |
| 위치 문구 | text input | O | 사용자 앱에 표시되는 위치 요약 |
| 힌트 | text input 또는 textarea | O | 사용자 힌트 팝업에 표시되는 힌트 |
| 저장 상태 | select | O | `inactive`, `active` |

### 저장 상태 옵션

```ts
export type TreasureStatus = 'inactive' | 'active';
```

| 상태 | 의미 |
|---|---|
| inactive | 관리자 등록은 완료됐지만 사용자 앱 지도에는 노출하지 않음 |
| active | visible 조건을 만족할 경우 사용자 앱 지도에 노출 가능 |

중요:

```txt
active는 저장 상태다.
visible은 저장값이 아니라 계산 결과다.
```

## 5.2 위치 정보 섹션

### 구성

```txt
위도
경도
반경
지도 위치 선택 영역
```

| 필드 | 타입 | 필수 | 검증 |
|---|---|---:|---|
| 위도 | number input | O | -90 이상 90 이하 |
| 경도 | number input | O | -180 이상 180 이하 |
| 반경 | number input | O | 1 이상 정수, meter 기준 |
| 지도 위치 선택 | Naver Map 영역 | O | 마커 드래그 또는 지도 클릭 |

### 지도 영역

와이어프레임에서는 이미지 placeholder로 표시되어 있으나, 실제 구현에서는 Naver Maps JavaScript API를 사용한다.

```txt
지도 로드 성공
→ 기존 좌표 중심 표시
→ 보물 위치 마커 표시
→ 지도 클릭 또는 마커 이동 시 위도/경도 갱신

지도 로드 실패
→ 지도 오류 상태 표시
→ 위도/경도 직접 입력은 허용
```

## 5.3 운영 조건 섹션

### 구성

```txt
운영 시작일
운영 종료일
최대 획득 수
현재 획득 수 안내
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| 운영 시작일 | datetime input | O | 보물 노출 가능 시작 시각 |
| 운영 종료일 | datetime input | O | 보물 노출 가능 종료 시각 |
| 최대 획득 수 | number input | O | 전체 획득 가능 수량 |
| 현재 획득 수 | read only text | O | 이미 획득된 수량 |

### 수정 제한 정책

현재 획득 수보다 작은 최대 획득 수는 저장할 수 없다.

```txt
max_claim_count < current_claim_count
→ 저장 차단
→ 필드 오류 표시
```

예시 문구:

```txt
현재 획득 수 34건보다 작게 설정할 수 없습니다.
```

---

# 6. 우측 안내 패널

## 6.1 active 전환 조건 검사

보물상자를 active로 저장하려면 아래 조건을 만족해야 한다.

```txt
선택 보물 정보 존재
운영 기간 유효
위도·경도 좌표 존재
잔여 수량 조건 만족
활성 매칭 1개 존재
삭제 상태가 아님
```

| 조건 | 충족 기준 |
|---|---|
| 선택 보물 정보 존재 | 제목, 위치 문구, 힌트 등 필수 정보 존재 |
| 운영 기간 유효 | `starts_at < ends_at` |
| 좌표 존재 | latitude, longitude 존재 |
| 잔여 수량 조건 | `current_claim_count < max_claim_count` |
| 활성 매칭 존재 | active 상태의 상품 매칭 1개 존재 |
| 삭제 상태 아님 | `deleted_at is null` |

화면에서는 각 조건을 체크 리스트 형태로 표시한다.

```txt
✓ 선택 보물 정보 존재
✓ 운영 기간 유효
✓ 위도·경도 좌표 존재
✓ 잔여 수량 조건
✕ 활성 매칭 1개 존재
```

## 6.2 수정 정책 안내

와이어프레임 기준 우측 안내 카드 문구는 아래 정책을 포함한다.

```txt
max_claim_count는 current_claim_count 미만으로 설정할 수 없습니다.
active 전환을 위해 조건 체크를 서버에서 최종 검증합니다.
저장 실패 시 변경값은 유지됩니다.
```

추가 권장 문구:

```txt
이미 획득이 발생한 보물은 운영 기간과 최대 획득 수 변경에 주의하세요.
상품 연결은 이 화면이 아니라 매칭 관리 화면에서 수정합니다.
```

---

# 7. 버튼 정의

## 7.1 취소 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `취소` |
| 위치 | 화면 하단 우측 |
| 스타일 | 보조 버튼 |
| 동작 | 변경사항 폐기 후 상세 화면 이동 |

동작:

```txt
취소 클릭
→ 변경사항 있음
  → 이탈 확인 팝업 표시 권장
→ 변경사항 없음
  → /admin/treasures/[treasureId]
```

## 7.2 저장 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `저장` |
| 위치 | 화면 하단 우측 |
| 스타일 | Primary 버튼 |
| 권한 | super_admin, operator |
| 동작 | 입력값 검증 후 저장 |

저장 처리:

```txt
저장 클릭
→ 클라이언트 기본 검증
→ 서버 검증
→ 저장 성공
→ A08 보물상자 상세 화면 이동
```

---

# 8. active 전환 불가 팝업

## 8.1 표시 조건

아래 상황에서 active 전환 불가 팝업을 표시한다.

```txt
관리자가 저장 상태를 active로 선택
→ 필수 active 조건 중 하나 이상 미충족
→ 저장 차단
→ active 전환 불가 팝업 표시
```

## 8.2 팝업 구조

```txt
Modal Overlay
→ 중앙 모달
→ 타이틀
→ 설명 문구
→ 미충족 조건 목록
→ 확인 버튼
```

## 8.3 팝업 문구

| 요소 | 문구 |
|---|---|
| 타이틀 | `active 전환 불가` |
| 설명 | `아래 조건이 충족되지 않아 active로 저장할 수 없습니다.` |
| 버튼 | `확인` |

미충족 조건 예시:

```txt
- 잔여 수량 없음 (현재 획득 수 ≥ 최대 획득 수)
- 연결 상품이 inactive 상태
- 활성 매칭 상품이 없습니다.
```

## 8.4 팝업 동작

| 액션 | 동작 |
|---|---|
| 확인 클릭 | 팝업 닫기, 수정 화면 유지 |
| 바깥 영역 클릭 | 팝업 닫기 여부는 공통 Modal 정책 따름 |
| ESC | 팝업 닫기 |

중요:

```txt
팝업이 뜬 경우 저장 요청은 완료 처리하지 않는다.
사용자가 입력한 값은 유지한다.
```

---

# 9. 상태 및 데이터 모델

## 9.1 화면 상태

```ts
export type TreasureEditPageState =
  | 'loading'
  | 'ready'
  | 'submitting'
  | 'submit_success'
  | 'submit_error'
  | 'not_found'
  | 'permission_denied';
```

## 9.2 폼 타입

```ts
export type TreasureEditFormValues = {
  title: string;
  description?: string | null;
  location_text: string;
  hint_text: string;
  status: 'inactive' | 'active';
  latitude: number;
  longitude: number;
  radius_m: number;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
};
```

## 9.3 active 검증 타입

```ts
export type TreasureActiveCheck = {
  has_required_info: boolean;
  has_valid_period: boolean;
  has_coordinates: boolean;
  has_remaining_claim_count: boolean;
  has_active_product_mapping: boolean;
  is_not_deleted: boolean;
};
```

## 9.4 저장 API 요청 예시

```ts
export type UpdateTreasureRequest = {
  treasure_id: string;
  title: string;
  description?: string | null;
  location_text: string;
  hint_text: string;
  status: 'inactive' | 'active';
  latitude: number;
  longitude: number;
  radius_m: number;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
};
```

## 9.5 저장 API 응답 예시

```ts
export type UpdateTreasureResponse = {
  treasure_id: string;
  status: 'inactive' | 'active';
  visible_status: 'visible' | 'hidden' | 'scheduled' | 'expired' | 'sold_out' | 'invalid';
  updated_at: string;
};
```

---

# 10. 검증 규칙

## 10.1 기본 검증

| 필드 | 검증 |
|---|---|
| 제목 | 필수, 1자 이상 100자 이하 |
| 설명 | 선택, 500자 이하 |
| 위치 문구 | 필수, 1자 이상 100자 이하 |
| 힌트 | 필수, 1자 이상 500자 이하 |
| 위도 | 필수, -90 이상 90 이하 |
| 경도 | 필수, -180 이상 180 이하 |
| 반경 | 필수, 1 이상 정수 |
| 운영 시작일 | 필수 |
| 운영 종료일 | 필수, 시작일보다 이후 |
| 최대 획득 수 | 필수, 1 이상 정수, 현재 획득 수 이상 |
| 저장 상태 | 필수, inactive 또는 active |

## 10.2 active 저장 검증

`status = active`로 저장하려는 경우 서버에서 아래 조건을 최종 검증한다.

```txt
deleted_at is null
starts_at < ends_at
latitude is not null
longitude is not null
current_claim_count < max_claim_count
active product mapping count = 1
```

검증 실패 시:

```txt
저장 차단
active 전환 불가 팝업 표시
폼 입력값 유지
```

---

# 11. 권한 정책

## 11.1 역할별 액션

| 액션 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 수정 화면 접근 | O | O | X |
| 기본 정보 수정 | O | O | X |
| 위치 정보 수정 | O | O | X |
| 운영 조건 수정 | O | O | X |
| inactive 저장 | O | O | X |
| active 저장 | O | O | X |
| 삭제·복구 | A08 상세에서만 O | X | X |

삭제와 복구는 이 화면에서 처리하지 않는다.

```txt
삭제/복구 = A08 상세 화면의 위험 액션 영역에서 처리
```

## 11.2 서버 권한 검증

UI에서 버튼을 숨기더라도 서버에서 반드시 권한을 재검증한다.

```txt
viewer가 update API 호출
→ 403 permission_denied
```

---

# 12. 사용자 앱 연계 기준

보물상자 수정 내용은 사용자 앱 지도·힌트·AR 진입 조건에 영향을 준다.

## 12.1 사용자 앱에 반영되는 값

| 관리자 필드 | 사용자 앱 영향 |
|---|---|
| 제목 | 지도 마커/힌트 팝업 보물명 |
| 위치 문구 | 힌트 팝업 위치 설명 |
| 힌트 | 힌트 팝업 힌트 내용 |
| 위도/경도 | 지도 마커 위치 및 거리 계산 |
| 반경 | 사냥 가능 거리 조건 |
| 운영 기간 | 지도 노출 가능 기간 |
| 최대 획득 수 | sold_out 계산 |
| 저장 상태 | active일 때만 visible 계산 대상 |

## 12.2 visible 계산 기준

보물상자는 아래 조건을 모두 만족할 때 사용자 앱 지도에 노출 가능하다.

```txt
status = active
deleted_at is null
starts_at <= now
ends_at >= now
latitude 존재
longitude 존재
current_claim_count < max_claim_count
active 상품 매칭 1개 존재
```

---

# 13. 로딩·빈 상태·오류 상태

## 13.1 로딩 상태

| 상황 | 처리 |
|---|---|
| 상세 데이터 조회 중 | 폼 skeleton 표시 |
| 저장 중 | 저장 버튼 disabled + loading |
| 지도 로딩 중 | 지도 영역 loading 표시 |

## 13.2 오류 상태

| 오류 | 처리 |
|---|---|
| treasureId 없음 | 목록 화면 이동 또는 not_found 표시 |
| 보물상자 없음 | not_found 상태 표시 |
| 권한 없음 | A24 접근 제한 화면 이동 |
| 저장 실패 | 폼 유지 + 오류 메시지 표시 |
| active 전환 불가 | 전용 팝업 표시 |
| 지도 로드 실패 | 지도 오류 안내 + 좌표 직접 입력 허용 |

---

# 14. 접근성 기준

| 항목 | 기준 |
|---|---|
| input label | 모든 입력 필드에 label 연결 |
| select | 현재 상태를 스크린리더가 읽을 수 있어야 함 |
| 지도 | 좌표 직접 입력 대체 수단 제공 |
| 버튼 | `취소`, `저장`, `확인` 명확한 라벨 사용 |
| 팝업 | role=`dialog`, aria-modal=`true` 적용 |
| 오류 | 필드 하단 오류 메시지 제공 |

---

# 15. QA 체크리스트

## 15.1 기본 진입

- [ ] super_admin은 수정 화면에 접근할 수 있다.
- [ ] operator는 수정 화면에 접근할 수 있다.
- [ ] viewer는 수정 화면에 접근할 수 없다.
- [ ] 존재하지 않는 treasureId 접근 시 not_found 상태가 표시된다.

## 15.2 폼 검증

- [ ] 제목 미입력 시 저장할 수 없다.
- [ ] 위치 문구 미입력 시 저장할 수 없다.
- [ ] 힌트 미입력 시 저장할 수 없다.
- [ ] 위도 범위가 -90~90을 벗어나면 저장할 수 없다.
- [ ] 경도 범위가 -180~180을 벗어나면 저장할 수 없다.
- [ ] 반경이 1 미만이면 저장할 수 없다.
- [ ] 운영 종료일이 시작일보다 빠르면 저장할 수 없다.
- [ ] 최대 획득 수가 현재 획득 수보다 작으면 저장할 수 없다.

## 15.3 active 전환

- [ ] 조건을 모두 만족하면 active 저장이 가능하다.
- [ ] 활성 매칭이 없으면 active 저장이 차단된다.
- [ ] 잔여 수량이 없으면 active 저장이 차단된다.
- [ ] 위도/경도가 없으면 active 저장이 차단된다.
- [ ] 조건 불충족 시 active 전환 불가 팝업이 표시된다.
- [ ] 팝업 확인 후 입력값은 유지된다.

## 15.4 저장 동작

- [ ] 저장 성공 시 A08 상세 화면으로 이동한다.
- [ ] 저장 실패 시 수정 화면에 남고 입력값이 유지된다.
- [ ] 저장 중 저장 버튼은 중복 클릭되지 않는다.
- [ ] 수정 이력이 운영 로그에 기록된다.

## 15.5 사용자 앱 정합성

- [ ] active + visible 조건 만족 시 사용자 지도에 노출 가능하다.
- [ ] inactive 저장 시 사용자 지도에 노출되지 않는다.
- [ ] 반경 수정 값이 힌트 팝업과 AR 사냥 가능 거리 조건에 반영된다.
- [ ] 운영 기간 수정 값이 지도 노출 조건에 반영된다.

---

# 16. 구현 메모

## 16.1 권장 컴포넌트

```txt
AdminLayout
AdminPageHeader
AdminSidebar
TreasureEditForm
TreasureBasicInfoSection
TreasureLocationSection
TreasureOperationConditionSection
TreasureActiveCheckPanel
TreasureEditPolicyPanel
ActiveTransitionBlockedDialog
AdminFormActions
```

## 16.2 권장 훅

```ts
useAdminAuthGuard()
useAdminPermission()
useTreasureDetail(treasureId)
useUpdateTreasure()
useTreasureActiveCheck(formValues)
useNaverMapPicker()
```

## 16.3 개발 주의사항

```txt
1. active 전환 가능 여부는 클라이언트 안내와 서버 검증을 모두 사용한다.
2. visible은 DB 저장값으로 다루지 말고 계산 결과로 표시한다.
3. max_claim_count는 current_claim_count 미만으로 줄일 수 없다.
4. 상품 매칭은 이 화면에서 직접 수정하지 않는다.
5. 삭제/복구는 A08 상세 화면에서만 처리한다.
6. 사용자 이메일, 쿠폰 번호, 바코드는 이 화면에 표시하지 않는다.
```

---

# 17. 최종 확정 요약

```txt
A09 보물상자 수정 화면은 기존 보물상자의 운영 정보를 수정하는 화면이다.
수정 가능 권한은 super_admin과 operator에게만 있다.
viewer는 접근할 수 없다.
상품 매칭, 삭제, 복구는 이 화면에서 처리하지 않는다.
active 전환은 필수 조건을 만족해야 하며, 미충족 시 active 전환 불가 팝업을 표시한다.
저장 성공 후 A08 보물상자 상세 화면으로 이동한다.
```
