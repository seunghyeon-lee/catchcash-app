# A07. 보물상자 등록 화면 정의서

> 문서 버전: `v1.0`  
> 작성일: `2026-07-26`  
> 화면 ID: `A07_Admin_Treasure_Create_Screen`  
> 화면명: 보물상자 등록  
> 적용 범위: 캐치캐쉬 관리자 CMS MVP  
> 작성 목적: 바이브코딩을 위한 관리자 CMS 화면 단위 구현 명세  
> 기준 문서: `CatchCash_Admin_CMS_Final_Functional_Spec_v1.0`, `CatchCash_Admin_CMS_Final_User_Flow_v1.0`

---

# 1. 화면 개요

## 1.1 화면 정의

보물상자 등록 화면은 운영자가 사용자 앱 지도에 노출될 보물상자의 기본 정보, 위치, 반경, 운영 기간, 최대 획득 수량, 초기 상태를 입력하여 신규 보물상자를 생성하는 화면이다.

이 화면에서 생성된 보물상자는 기본적으로 `inactive` 상태로 저장하는 것을 권장한다.  
보물상자가 사용자 앱 지도에 실제로 노출되려면 등록 이후 상품 매칭과 visible 조건을 모두 만족해야 한다.

```txt
보물상자 목록
→ 보물상자 등록
→ 필수 정보 입력
→ inactive 상태로 저장
→ 보물상자 상세
→ 매칭 등록·교체
→ active 전환
→ 사용자 앱 지도 노출 가능
```

---

# 2. 화면 목적

## 2.1 관리자 목적

- 신규 보물상자를 등록한다.
- 보물상자의 이름, 설명, 위치 문구, 힌트를 입력한다.
- 위도, 경도, 반경을 입력하거나 지도에서 선택한다.
- 운영 시작일시와 종료일시를 설정한다.
- 최대 획득 수량을 설정한다.
- 초기 상태를 `inactive` 또는 `active`로 지정한다.

## 2.2 시스템 목적

- 사용자 앱 지도 노출에 필요한 보물상자 기본 데이터를 생성한다.
- 보물상자 좌표와 사냥 가능 반경을 저장한다.
- 보물상자 운영 기간과 최대 획득 수량을 저장한다.
- 등록 직후 visible 여부를 계산할 수 있는 최소 데이터를 확보한다.

---

# 3. 진입 조건

## 3.1 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| `A06_Admin_Treasure_List_Screen` | `보물상자 등록` 버튼 클릭 |
| `A02_Admin_Dashboard_Screen` | 빠른 링크 또는 보물상자 관리 진입 후 등록 |

## 3.2 접근 가능 권한

| 역할 | 접근 | 설명 |
|---|---:|---|
| super_admin | O | 등록 가능 |
| operator | O | 등록 가능 |
| viewer | X | 조회 전용이므로 접근 불가 |

viewer가 직접 URL로 접근하면 `A24_Admin_Access_Denied_Screen`으로 이동한다.

---

# 4. Route

## 4.1 권장 Route

```txt
/admin/treasures/new
```

## 4.2 권장 파일 경로

```txt
app/admin/(protected)/treasures/new/page.tsx
```

## 4.3 관련 화면

| 화면 | Route | 관계 |
|---|---|---|
| 보물상자 목록 | `/admin/treasures` | 취소 또는 목록으로 이동 |
| 보물상자 상세 | `/admin/treasures/[treasureId]` | 저장 성공 후 이동 |
| 보물상자 수정 | `/admin/treasures/[treasureId]/edit` | 등록 후 수정 가능 |
| 매칭 등록·교체 | `/admin/mappings/edit?treasureId={id}` | 등록 후 상품 연결 |

---

# 5. 화면 구조

## 5.1 와이어프레임 기준 구조

```txt
AdminLayout
→ Topbar
→ Sidebar
→ Page Header
   → 보물상자 등록
   → 목록으로
→ Form Container
   → 기본 정보
   → 위치 및 반경
   → 운영 조건
   → 초기 상태
→ Bottom Action
   → 취소
   → 저장
```

## 5.2 화면 레이아웃

```txt
┌──────────────────────────────────────────────┐
│ 캐치캐쉬 CMS                    검색 권한 계정 │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ 보물상자 등록              목록으로 │
│              │                               │
│              │ [기본 정보]                    │
│              │ 제목                           │
│              │ 설명                           │
│              │ 위치 문구                       │
│              │ 힌트                           │
│              │                               │
│              │ [위치 및 반경]                  │
│              │ 위도 / 경도 / 반경              │
│              │ 지도에서 위치 선택              │
│              │                               │
│              │ [운영 조건]                    │
│              │ 운영 시작일시 / 종료일시         │
│              │ 최대 획득 수량                  │
│              │                               │
│              │ [초기 상태]                    │
│              │ inactive / active               │
│              │                               │
│              │                         취소 저장 │
└──────────────┴───────────────────────────────┘
```

---

# 6. UI 구성 요소

## 6.1 Page Header

| 요소 | 내용 | 처리 방식 |
|---|---|---|
| 페이지 제목 | `보물상자 등록` | 코드 텍스트 |
| 보조 액션 | `목록으로` | 링크 버튼 |

### 동작

| 액션 | 동작 |
|---|---|
| 목록으로 클릭 | `/admin/treasures` 이동 |
| 작성 중 목록으로 클릭 | 변경사항이 있으면 이탈 확인 팝업 노출 |

---

# 7. 입력 폼 정의

## 7.1 기본 정보 섹션

### 구성

| 필드 | 키 | 필수 | 입력 방식 | 검증 기준 |
|---|---|---:|---|---|
| 제목 | `title` | O | text input | 2자 이상 60자 이하 |
| 설명 | `description` | O | textarea | 5자 이상 500자 이하 |
| 위치 문구 | `location_text` | O | text input | 2자 이상 100자 이하 |
| 힌트 | `hint_text` | O | textarea | 2자 이상 500자 이하 |

### 표시 기준

```txt
제목: 사용자 앱과 CMS에서 보물상자를 구분하는 이름
설명: CMS 운영자 확인용 설명 및 사용자 안내 보조 정보
위치 문구: 사용자 앱 힌트 팝업에 표시될 지역/장소 문구
힌트: 사용자 앱 힌트 팝업에 표시될 탐색 힌트
```

### 주의

- 제목과 위치 문구는 사용자 앱에 노출될 수 있으므로 운영자가 이해 가능한 문구로 입력한다.
- 힌트에는 개인정보, 출입 제한 장소, 위험 지역 유도 문구를 넣지 않는다.

---

## 7.2 위치 및 반경 섹션

### 구성

| 필드 | 키 | 필수 | 입력 방식 | 검증 기준 |
|---|---|---:|---|---|
| 위도 | `latitude` | O | number input | -90 이상 90 이하 |
| 경도 | `longitude` | O | number input | -180 이상 180 이하 |
| 반경 | `radius_m` | O | number input | 1 이상 정수, 단위 meter |
| 지도 위치 선택 | - | 선택 | Naver Map picker | 좌표 입력 보조 |

### 반경 정책

```txt
반경은 사용자가 AR 사냥을 시작할 수 있는 거리 기준이다.
사용자 앱 힌트 팝업의 TARGET 값은 고정 20m가 아니라 radius_m 값을 사용한다.
```

### 지도 선택 영역

와이어프레임의 `지도에서 위치 선택` 박스는 실제 구현에서 Naver Maps JavaScript API를 사용한다.

```txt
지도 클릭
→ latitude / longitude 자동 입력
→ 지도 중앙 또는 마커 위치 갱신
```

### 지도 로드 실패

| 상태 | 처리 |
|---|---|
| Naver Map 로드 실패 | 좌표 직접 입력은 가능하게 유지 |
| 위치 선택 실패 | 오류 메시지 표시 |
| API Key 누락 | 관리자 오류 메시지 표시 |

---

## 7.3 운영 조건 섹션

### 구성

| 필드 | 키 | 필수 | 입력 방식 | 검증 기준 |
|---|---|---:|---|---|
| 운영 시작일시 | `starts_at` | O | datetime input | 현재 또는 미래 권장 |
| 운영 종료일시 | `ends_at` | O | datetime input | 시작일시보다 이후 |
| 최대 획득 수량 | `max_claim_count` | O | number input | 1 이상 정수 |

### 계산 필드

등록 시점의 현재 획득 수량은 항상 `0`으로 시작한다.

```txt
current_claim_count = 0
```

### 날짜 기준

```txt
입력/표시 기준: Asia/Seoul(KST)
저장 기준: UTC timestamp 권장
```

---

## 7.4 초기 상태 섹션

### 구성

| 옵션 | 저장값 | 기본값 | 설명 |
|---|---|---:|---|
| inactive | `inactive` | O | 저장만 하고 사용자 앱에는 노출하지 않음 |
| active | `active` | X | 조건 충족 시 사용자 앱 지도 노출 가능 |

### 권장 정책

```txt
기본 선택값은 inactive다.
등록 단계에서는 아직 상품 매칭이 없을 수 있으므로 inactive 저장을 권장한다.
```

### active 선택 시 검증

active로 저장하려면 최소한 아래 조건을 만족해야 한다.

```txt
좌표 존재
운영 기간 유효
최대 획득 수량 1 이상
삭제 상태 아님
```

단, 상품 매칭이 아직 없다면 visible 조건은 미충족이므로 사용자 앱 지도에는 노출되지 않는다.

---

# 8. 저장 데이터 모델

## 8.1 생성 요청 Payload

```ts
type CreateTreasurePayload = {
  title: string;
  description: string;
  location_text: string;
  hint_text: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  status: 'inactive' | 'active';
};
```

## 8.2 서버 생성 기본값

```ts
type TreasureServerDefaults = {
  current_claim_count: 0;
  deleted_at: null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};
```

## 8.3 등록 후 visible 계산

```txt
visible =
  deleted_at 없음
  AND status = active
  AND starts_at <= now <= ends_at
  AND latitude 존재
  AND longitude 존재
  AND current_claim_count < max_claim_count
  AND 활성 상품 매칭 존재
```

보물상자 등록 화면은 visible 상태를 직접 저장하지 않는다.  
visible은 목록, 상세, 사용자 앱 조회 API에서 계산한다.

---

# 9. 버튼 정의

## 9.1 취소 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `취소` |
| 노출 권한 | super_admin, operator |
| 동작 | 목록으로 이동 |
| 변경사항 존재 시 | 이탈 확인 팝업 노출 |

## 9.2 저장 버튼

| 항목 | 정의 |
|---|---|
| 문구 | `저장` |
| 노출 권한 | super_admin, operator |
| 기본 상태 | enabled |
| 제출 중 | disabled + loading |
| 성공 시 | 상세 화면 이동 |
| 실패 시 | 현재 화면 유지 + 오류 표시 |

### 저장 성공 후 이동

```txt
/admin/treasures/{createdTreasureId}
```

---

# 10. 상태 정의

## 10.1 화면 상태

```ts
type TreasureCreateScreenState =
  | 'idle'
  | 'dirty'
  | 'submitting'
  | 'success'
  | 'validation_error'
  | 'server_error'
  | 'map_error';
```

## 10.2 저장 상태

| 상태 | 처리 |
|---|---|
| idle | 기본 입력 상태 |
| dirty | 입력값 변경됨 |
| submitting | 저장 버튼 disabled |
| success | 상세 화면 이동 |
| validation_error | 필드별 오류 표시 |
| server_error | 상단 또는 하단 오류 메시지 표시 |
| map_error | 지도 영역 오류 표시, 직접 좌표 입력 허용 |

---

# 11. 유효성 검증

## 11.1 필수 검증

| 필드 | 오류 조건 | 메시지 예시 |
|---|---|---|
| 제목 | 비어 있음 | `보물상자 제목을 입력하세요.` |
| 설명 | 비어 있음 | `설명을 입력하세요.` |
| 위치 문구 | 비어 있음 | `위치 문구를 입력하세요.` |
| 힌트 | 비어 있음 | `힌트를 입력하세요.` |
| 위도 | 범위 초과 | `위도는 -90에서 90 사이여야 합니다.` |
| 경도 | 범위 초과 | `경도는 -180에서 180 사이여야 합니다.` |
| 반경 | 1 미만 | `반경은 1m 이상이어야 합니다.` |
| 운영 시작일시 | 비어 있음 | `운영 시작일시를 입력하세요.` |
| 운영 종료일시 | 시작보다 빠름 | `운영 종료일시는 시작일시보다 이후여야 합니다.` |
| 최대 획득 수량 | 1 미만 | `최대 획득 수량은 1개 이상이어야 합니다.` |

## 11.2 권장 검증

```txt
반경이 과도하게 큰 경우 경고 표시
운영 종료일이 과거인 경우 저장 차단
active 선택 시 운영 기간이 현재 유효하지 않으면 경고 표시
```

---

# 12. 권한 정책

## 12.1 역할별 기능

| 기능 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 화면 접근 | O | O | X |
| 보물상자 등록 | O | O | X |
| active 저장 | O | O | X |
| inactive 저장 | O | O | X |
| 지도에서 위치 선택 | O | O | X |

## 12.2 서버 권한 검증

UI에서 버튼을 숨기는 것과 별개로 서버에서도 역할을 검증한다.

```txt
viewer가 API를 직접 호출해도 생성은 실패해야 한다.
```

---

# 13. API 연동 기준

## 13.1 생성 API

```txt
POST /api/admin/treasures
```

### 요청

```json
{
  "title": "강남역 보물상자",
  "description": "강남역 인근 테스트 보물",
  "location_text": "서울 강남구 강남역 근처",
  "hint_text": "사람이 가장 많이 지나가는 출구 근처",
  "latitude": 37.4979,
  "longitude": 127.0276,
  "radius_m": 30,
  "starts_at": "2026-07-01T00:00:00+09:00",
  "ends_at": "2026-09-30T23:59:59+09:00",
  "max_claim_count": 100,
  "status": "inactive"
}
```

### 응답

```json
{
  "treasure_id": "B-1042",
  "status": "inactive"
}
```

## 13.2 지도 연동

```txt
Naver Maps JavaScript API
```

지도에서 선택한 좌표는 form state에 반영한다.

---

# 14. 운영 로그

보물상자 등록 성공 시 일반 운영 로그를 기록한다.

```txt
action = treasure.create
actor_admin_id = 현재 관리자 ID
target_type = treasure_box
target_id = 생성된 treasure_id
before = null
after = 생성된 주요 필드
```

민감 운영 로그 대상은 아니다.

---

# 15. 접근성

| 항목 | 기준 |
|---|---|
| input label | 모든 입력 필드에 명시적 label 연결 |
| 저장 버튼 | 제출 중 `aria-busy=true` 적용 |
| 오류 메시지 | 필드와 연결된 `aria-describedby` 사용 |
| 지도 선택 | 좌표 직접 입력 폴백 제공 |
| 키보드 이동 | 탭 순서가 상단부터 하단까지 자연스러워야 함 |

---

# 16. 빈 상태·오류 상태

## 16.1 지도 오류

```txt
지도를 불러오지 못했습니다.
좌표는 직접 입력할 수 있습니다.
```

## 16.2 저장 실패

```txt
보물상자를 저장하지 못했습니다.
입력값을 확인한 뒤 다시 시도하세요.
```

## 16.3 권한 오류

```txt
보물상자를 등록할 권한이 없습니다.
```

권한 오류는 `A24_Admin_Access_Denied_Screen`으로 이동하는 것을 우선한다.

---

# 17. QA 체크리스트

## 17.1 화면 표시

- [ ] super_admin이 화면에 접근할 수 있다.
- [ ] operator가 화면에 접근할 수 있다.
- [ ] viewer가 직접 접근하면 접근 제한 화면으로 이동한다.
- [ ] 기본 상태는 inactive로 선택되어 있다.
- [ ] 입력 필드 라벨이 와이어프레임 순서대로 표시된다.
- [ ] 지도 영역이 로드된다.
- [ ] 지도 로드 실패 시 좌표 직접 입력이 가능하다.

## 17.2 입력 검증

- [ ] 제목 미입력 시 저장이 차단된다.
- [ ] 위도 범위 초과 시 오류가 표시된다.
- [ ] 경도 범위 초과 시 오류가 표시된다.
- [ ] 반경 0 입력 시 오류가 표시된다.
- [ ] 종료일시가 시작일시보다 빠르면 오류가 표시된다.
- [ ] 최대 획득 수량 0 입력 시 오류가 표시된다.

## 17.3 저장 동작

- [ ] 저장 중 버튼이 비활성화된다.
- [ ] 저장 성공 시 상세 화면으로 이동한다.
- [ ] 저장 실패 시 입력값이 유지된다.
- [ ] 등록 성공 후 current_claim_count는 0이다.
- [ ] 등록 성공 후 운영 로그가 기록된다.

## 17.4 visible 정합성

- [ ] inactive로 저장한 보물은 사용자 앱 지도에 노출되지 않는다.
- [ ] active로 저장해도 활성 상품 매칭이 없으면 visible이 아니다.
- [ ] active + 기간 유효 + 좌표 존재 + 수량 남음 + 활성 매칭 존재일 때만 visible이다.

---

# 18. 개발 메모

```txt
이 화면은 보물상자 생성만 담당한다.
상품 연결은 A14 매칭 등록·교체 화면에서 처리한다.
삭제·복구는 A08 상세 화면의 위험 액션에서 처리한다.
수정은 A09 수정 화면에서 처리한다.
```

