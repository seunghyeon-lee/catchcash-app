# 05. 지도 상세 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 05. 지도 상세 화면 정의서 |
| 파일명 | `05_Map_Detail_Screen.md` |
| 화면명 | 지도 상세 화면 |
| 화면 ID | `05_Map_Detail_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 바이브코딩 기반 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 지도 기준 | Naver Maps JavaScript API |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 맵 상세 시안 기준 / Naver Maps Grug Dark 스타일 / 마커·컨트롤 에셋 적용 |
| 주요 기능 | 관리자 등록 보물상자 지도 표시, 내 위치 표시, 거리 기반 사냥 가능 여부 판단 |

---

## 2. 화면 개요

지도 상세 화면은 사용자가 실제 위치를 기준으로 주변 보물상자를 탐색하는 핵심 화면이다.

관리자 백오피스에서 등록한 보물상자의 위도/경도 데이터를 Naver Maps JavaScript API 지도 위에 마커로 표시한다.  
사용자는 자신의 현재 위치와 보물상자 위치를 확인하고, 보물상자에 가까이 이동한 뒤 사냥 가능 반경에 들어오면 AR 사냥 플로우로 진입할 수 있다.

이 화면은 캐치캐쉬의 위치 기반 보물찾기 경험에서 가장 중요한 탐색 화면이다.

---

## 3. 화면 목적

### 핵심 목적

- 사용자의 현재 위치를 지도 위에 표시한다.
- 관리자에서 등록한 활성 보물상자를 지도 위에 표시한다.
- 보물상자의 위치, 거리, 상태를 사용자가 확인할 수 있게 한다.
- 보물상자 마커 클릭 시 힌트 바텀시트를 표시한다.
- 보물상자와 사용자 사이의 거리를 계산한다.
- 사냥 가능 반경 진입 여부를 판단한다.
- AR 사냥 화면으로 진입하기 전의 위치 검증 기반 화면 역할을 한다.

### 사용자 관점 목적

- 내 주변에 어떤 보물상자가 있는지 지도에서 확인한다.
- 보물상자까지 얼마나 떨어져 있는지 확인한다.
- 가까운 보물상자를 선택해 힌트를 본다.
- 충분히 가까워지면 사냥하기를 눌러 AR 사냥을 시작한다.

---

## 4. 기술 구현 기준

### 4.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ Naver Maps JavaScript API
→ Map Detail Screen
```

### 4.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |
| 지도 | Naver Maps JavaScript API |

### 4.3 데이터 및 상태

| 항목 | 기술 |
|---|---|
| 인증 | Supabase Auth |
| 보물상자 데이터 | Supabase PostgreSQL `treasure_boxes` |
| 보물-상품 연결 | Supabase PostgreSQL `treasure_rewards` |
| 상품 표시 정보 | Supabase PostgreSQL `giftishow_products` |
| 현재 위치 | Capacitor Geolocation |
| 서버 상태 캐싱 | TanStack Query 권장 |
| 전역 상태 | Zustand 또는 Context API |
| 실시간 상태 반영 | Supabase Realtime 선택 적용 |

### 4.4 외부 연동

| 항목 | 사용 여부 | 설명 |
|---|---:|---|
| Naver Maps JavaScript API | 사용 | 지도 렌더링 및 마커 표시 |
| Capacitor Geolocation | 사용 | 현재 위치 추적 |
| Supabase | 사용 | 보물상자 데이터 조회 |
| Supabase Realtime | 선택 | 보물 마감/삭제 상태 실시간 반영 |
| 기프티쇼비즈 API | 미사용 | 이 화면에서는 쿠폰 발급하지 않음 |

### 4.5 이 화면에서 사용하지 않는 기능

- 카메라 권한 요청
- WebAR 실행
- R3F 3D 렌더링
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 보관함 쿠폰 받기
- 관리자 보물상자 생성/수정
- 관리자 상품 연결
- 실제 보상 지급 처리

---

## 5. 관리자 데이터와의 관계

지도 상세 화면의 보물상자는 관리자 백오피스에서 등록한 데이터만 표시한다.

### 5.1 관리자 등록 흐름

```txt
관리자 로그인
→ 보물상자 등록 화면
→ Naver 지도에서 위치 지정
→ 위도/경도 저장
→ 기프티쇼비즈 상품 선택
→ 보물상자 활성화
→ 유저 앱 지도 상세 화면에 마커 노출
```

### 5.2 유저 앱 표시 흐름

```txt
유저 지도 상세 화면 진입
→ 현재 위치 확인
→ active 상태 보물상자 조회
→ Naver 지도에 보물상자 마커 표시
→ 마커 클릭 시 힌트 바텀시트 표시
```

### 5.3 관리자 데이터 필수 조건

지도에 표시되는 보물상자는 아래 조건을 만족해야 한다.

```txt
treasure_boxes.status = active
treasure_boxes.deleted_at is null
treasure_boxes.starts_at <= now
treasure_boxes.ends_at >= now
treasure_boxes.current_claim_count < treasure_boxes.max_claim_count
treasure_boxes.latitude 존재
treasure_boxes.longitude 존재
```

---

## 6. 진입 조건

### 6.1 진입 시점

사용자는 아래 상황에서 지도 상세 화면으로 진입한다.

| 상황 | 설명 |
|---|---|
| 메인 홈 `사냥하기` 클릭 | 기본 탐색 진입 |
| 메인 홈 `전체보기` 클릭 | 주변 보물 전체 확인 |
| 가까운 보물 카드 클릭 | 특정 보물 위치 확인 |
| 하단 탭 `지도` 클릭 | 지도 화면 진입 |
| 하단 탭 `사냥하기` 클릭 | 탐색 시작 |
| 알림 클릭 | 특정 보물 또는 주변 보물 안내 |
| 사냥 실패 후 복귀 | 지도에서 다시 탐색 |

### 6.2 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| 메인 홈 화면 | 사냥하기 / 전체보기 / 보물 카드 클릭 |
| 캐치캐쉬 안내 화면 | 탐색 시작하기 클릭 |
| 알림 레이어 | 보물 관련 알림 클릭 |
| AR 가이드 화면 | 닫기 또는 뒤로가기 |
| AR 카메라 화면 | 종료 또는 실패 후 복귀 |
| 사냥 성공 화면 | 다시 탐색 클릭 |

### 6.3 Route

```txt
/map
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/map/page.tsx
```

### 6.4 Query Parameter

특정 보물상자를 선택한 상태로 지도에 진입할 수 있다.

```txt
/map?treasureId={treasure_box_id}
```

처리 정책:

```txt
treasureId 있음
→ 해당 보물상자 마커 중심으로 지도 이동
→ 해당 보물상자 힌트 바텀시트 자동 오픈 가능

treasureId 없음
→ 현재 위치 중심으로 지도 표시
```

---

## 7. 접근 제한

지도 상세 화면은 로그인과 온보딩이 완료된 사용자만 접근할 수 있다.

### 7.1 접근 가능 조건

```txt
Supabase session 존재
profiles row 존재
profiles.nickname 존재
profiles.terms_agreed_at 존재
profiles.status = active
```

### 7.2 접근 제한 처리

| 조건 | 처리 |
|---|---|
| 세션 없음 | `/login` 이동 |
| 프로필 없음 | `/nickname` 이동 |
| 약관 미동의 | `/nickname` 이동 |
| 정지 계정 | 로그인 차단 안내 후 `/login` 이동 |
| 위치 권한 없음 | 지도 기본 표시 + 위치 권한 안내 |
| 네이버 지도 로드 실패 | 지도 오류 상태 표시 |

---

## 8. 종료 및 이동 규칙

| 사용자 액션 | 이동/처리 |
|---|---|
| 뒤로가기 | 이전 화면 또는 메인 홈 |
| 홈/지도 탭 클릭 | 현재 화면 유지 또는 `/home` |
| 사냥하기 탭 클릭 | 현재 화면에서 탐색 유지 |
| 명예전당 탭 클릭 | `/hall-of-fame` 이동 |
| 내정보 탭 클릭 | `/profile` 이동 |
| 보물 마커 클릭 | 힌트 바텀시트 오픈 |
| 내 위치 버튼 클릭 | 현재 위치 중심으로 지도 이동 |
| 새로고침 버튼 클릭 | 위치/보물 데이터 재조회 |
| 힌트 바텀시트 사냥하기 클릭 | AR 가이드 화면 이동 |
| 힌트 바텀시트 닫기 | 지도 화면 유지 |

### 8.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 메인 홈 | `04_Main_Home_Screen` | `/home` |
| 힌트 바텀시트 | `06_Treasure_Hint_Bottom_Sheet` | 현재 화면 overlay |
| AR 가이드 | `07_AR_Guide_Screen` | `/ar-guide` |
| 명예전당 | `10_Hall_Of_Fame_Screen` | `/hall-of-fame` |
| 내 프로필 | `11_My_Profile_Screen` | `/profile` |

---

## 9. 화면 레이아웃

### 9.1 전체 구조

```txt
┌──────────────────────────────┐
│ CATCHCASH        [알림][?][설정] │
├──────────────────────────────┤
│ [근처 보물 안내 토스트]          │
│                              │
│          Naver Map           │
│                              │
│   [보물 마커]       [보물 마커] │
│                              │
│              [내 위치]         │
│                              │
│   [보물 마커]       [보물 마커] │
│                              │
│                    [내위치]    │
│                    [새로고침]  │
├──────────────────────────────┤
│ Bottom Navigation            │
└──────────────────────────────┘
```

### 9.2 레이아웃 원칙

- 지도는 화면의 대부분을 차지한다.
- 상단 GNB는 지도 위 또는 지도 위 고정 레이어로 표시할 수 있다.
- 하단 네비게이션은 화면 하단 고정이다.
- 지도 컨트롤 버튼은 우측 하단에 플로팅 배치한다.
- 보물상자 마커는 지도 위에 직접 표시한다.
- 보물상자 마커 클릭 시 하단에서 힌트 바텀시트가 올라온다.

---

---

## 9.10 Stitch AI 디자인 결과 반영

### 9.10.1 확정된 화면 구조

Stitch AI 시안 기준 맵 상세 화면은 아래 구조를 따른다.

```txt
상단 헤더
→ 지도 상태 알림 배너
→ Naver Maps Grug Dark 지도 영역
→ 보물 마커
→ 내 위치 마커
→ 지도 컨트롤 버튼
→ 하단 네비게이션
```

### 9.10.2 확정된 화면 카피

| 요소 | 문구 | 구현 방식 |
|---|---|---|
| 헤더 브랜드 | `catch cash` | 코드 텍스트 |
| 상태 배너 | `근처에 열린 보물이 있어요!` | 코드 텍스트 |
| 보물 마커 라벨 | `황금 보물상자`, `보라 선물상자` | 코드 텍스트 또는 마커 label |
| 하단 탭 | `지도`, `사냥하기`, `랭킹`, `내정보` | 코드 텍스트 |

### 9.10.3 지도 스타일 정책

이 화면의 지도는 이미지 에셋이 아니라 실제 Naver Maps JavaScript API로 렌더링한다.

```txt
지도 = Naver Maps JavaScript API
지도 색상 = Naver Maps 스타일 에디터 적용
스타일 방향 = Grug Dark / grayscale / low saturation
```

디자인 시안에 표시된 지도 스타일명은 아래처럼 관리한다.

```txt
지도 홈 - 보물 탐색 (Grug Dark)
```

운영/개발에서는 해당 스타일을 Naver Cloud 스타일 에디터에서 생성한 뒤 지도 초기화 시 styleId 또는 style 설정값으로 연결한다.

### 9.10.4 홈 미니맵과의 차이

| 화면 | 지도 처리 |
|---|---|
| 메인 홈 | 스케치형 미니맵 이미지 에셋 |
| 맵 상세 | 실제 Naver Maps API + 흑백 스타일 에디터 |

---

## 9.11 맵 상세 화면 에셋 분리 기준

이 화면에서는 지도 자체를 이미지로 분리하지 않는다.  
단, 지도 위에 올라가는 마커, 컨트롤, 하단 네비게이션 아이콘은 이미지 에셋으로 분리한다.

### 9.11.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 뒤로가기 아이콘 | 필수 | 상단 헤더 공통 아이콘 |
| 헤더 우측 신호/위치 아이콘 | 선택 | 시안상 우측 작은 상태 아이콘 |
| 보물 마커 기본 상태 | 필수 | 지도 위 보물 위치 표시 |
| 보물 마커 | 필수 | 지도 위 보물 위치 표시 |
| 보물 마커 상태 구분 | 없음 | 활성/비활성/선택 상태를 별도 마커 에셋으로 나누지 않음 |
| 현재 위치 마커 | 필수 | 사용자 현재 위치 표시 |
| 지도 컨트롤 아이콘 | 필수 | 현재 위치/새로고침 등 |
| 지도 컨트롤 버튼 프레임 | 제외 | CSS로 구현 |
| 마커 라벨 프레임 | 제외 | CSS/HTML overlay로 구현 |
| 하단 네비게이션 아이콘 | 필수 | 전역 탭바 |

### 9.11.2 이미지 에셋으로 만들지 않는 요소

| 요소 | 처리 방식 |
|---|---|
| 지도 배경 | Naver Maps API |
| 지도 타일 | Naver Maps API |
| 도로/건물/지역 라인 | Naver Maps 스타일 에디터 |
| 상태 배너 박스 | CSS/컴포넌트 |
| 마커 라벨 텍스트 | 코드 텍스트 |
| 하단 탭 텍스트 | 코드 텍스트 |
| 컨트롤 버튼 박스 | CSS |
| 마커 라벨 박스 | CSS/HTML overlay |
| 바텀시트 내부 텍스트 | 코드 텍스트 |

중요:

```txt
지도 전체를 PNG/JPG 이미지로 만들지 않는다.
지도 스타일은 Naver Maps 스타일 에디터로 적용한다.
마커와 아이콘만 SVG 에셋으로 분리한다.
```

---

## 9.12 에셋 명칭 정의

### 9.12.1 헤더 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_nav_back_circle_rough_default_32.svg` | navigation icon | svg | map, detail pages | 32x32 | 상단 좌측 뒤로가기 아이콘 |
| `icon_map_signal_rough_default_20.svg` | map status icon | svg | map header | 20x20 | 시안 우측의 작은 신호/상태 아이콘. 필요 시 사용 |

### 9.12.2 지도 마커 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `marker_user_location_blue_default_24.svg` | map marker | svg | map | 24x24 | 현재 위치 파란 원형 마커. 실제 지도 가독성을 위해 예외적으로 blue 사용 가능 |
| `marker_treasure_box_default_fallback_40.svg` | map marker | svg | map | 40x40 | 관리자 등록 이미지가 없을 때 사용하는 기본 보물상자 fallback 마커 |
| `marker_user_small_status_default_16.svg` | map marker | svg | map | 16x16 | 시안상 작은 주변 상태 마커 |

### 9.12.3 지도 컨트롤 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_map_current_location_rough_default_24.svg` | map control icon | svg | map | 24x24 | 내 위치로 이동 버튼 아이콘 |
| `icon_map_refresh_rough_default_24.svg` | map control icon | svg | map | 24x24 | 지도 새로고침 버튼 아이콘 |
| `icon_map_notification_off_rough_default_24.svg` | map control icon | svg | map | 24x24 | 지도 위 알림/상태 아이콘. 시안상 흐린 흰색 아이콘 |


### 9.12.4 보물 마커 라벨 정책

시안에서는 보물 마커 아래에 작은 라벨 박스가 표시된다.  
하지만 라벨 박스는 별도 이미지 에셋으로 만들지 않는다.

| 요소 | 처리 방식 |
|---|---|
| 라벨 박스 | CSS/HTML |
| 라벨 텍스트 | 코드 텍스트 |
| 라벨 위치 | Naver Maps OverlayView 또는 DOM overlay |
| 라벨 클릭 | 마커 클릭과 동일하게 힌트 팝업 오픈 |

라벨 예시:

```txt
황금 보물상자
보라 선물상자
```

라벨 프레임 에셋은 사용하지 않는다.

```txt
 사용 안 함
```

### 9.12.5 하단 네비게이션 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_nav_map_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 지도 탭 기본 |
| `icon_nav_map_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 지도 탭 활성 |
| `icon_nav_hunt_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 사냥하기 탭 기본 |
| `icon_nav_hunt_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 사냥하기 탭 활성 |
| `icon_nav_rank_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 랭킹 탭 기본 |
| `icon_nav_rank_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 랭킹 탭 활성 |
| `icon_nav_profile_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 내정보 탭 기본 |
| `icon_nav_profile_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 내정보 탭 활성 |

---

## 9.13 에셋 저장 위치

```txt
public/
  assets/
    icons/
      navigation/
        icon_nav_back_circle_rough_default_32.svg
        icon_nav_map_rough_default_24.svg
        icon_nav_map_rough_active_24.svg
        icon_nav_hunt_rough_default_24.svg
        icon_nav_hunt_rough_active_24.svg
        icon_nav_rank_rough_default_24.svg
        icon_nav_rank_rough_active_24.svg
        icon_nav_profile_rough_default_24.svg
        icon_nav_profile_rough_active_24.svg

      map/
        icon_map_signal_rough_default_20.svg
        icon_map_current_location_rough_default_24.svg
        icon_map_refresh_rough_default_24.svg
        icon_map_notification_off_rough_default_24.svg

    markers/
      map/
        marker_user_location_blue_default_24.svg
        marker_user_small_status_default_16.svg
        marker_treasure_box_default_fallback_40.svg

    ui/
      frames/
        map/

```

---

## 9.14 코드 상수

### 9.14.1 지도 스타일 상수

```ts
export const NAVER_MAP_STYLE = {
  name: '지도 홈 - 보물 탐색 (Grug Dark)',
  styleId: process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_ID,
} as const;
```

### 9.14.2 에셋 상수

```ts
export const MAP_DETAIL_ASSETS = {
  backIcon: '/assets/icons/navigation/icon_nav_back_circle_rough_default_32.svg',
  signalIcon: '/assets/icons/map/icon_map_signal_rough_default_20.svg',

  userMarker: '/assets/markers/map/marker_user_location_blue_default_24.svg',
  userSmallStatusMarker: '/assets/markers/map/marker_user_small_status_default_16.svg',

  treasureFallback: '/assets/markers/map/marker_treasure_box_default_fallback_40.svg',

  currentLocationIcon: '/assets/icons/map/icon_map_current_location_rough_default_24.svg',
  refreshIcon: '/assets/icons/map/icon_map_refresh_rough_default_24.svg',
  notificationOffIcon: '/assets/icons/map/icon_map_notification_off_rough_default_24.svg',


} as const;
```

### 9.14.3 문구 상수

```ts
export const MAP_DETAIL_COPY = {
  brand: 'catch cash',
  nearbyBanner: '근처에 열린 보물이 있어요!',
  tabMap: '지도',
  tabHunt: '사냥하기',
  tabRank: '랭킹',
  tabProfile: '내정보',
} as const;
```

---

## 9.15 구현 방식

### 9.15.1 Naver Maps 컨테이너

```tsx
<div id="naver-map" className="h-full w-full" />
```

구현 원칙:

- 지도 컨테이너는 실제 Naver Maps JavaScript API로 렌더링한다.
- 지도 배경 이미지를 직접 넣지 않는다.
- 스타일 에디터의 Grug Dark 스타일을 API 설정으로 적용한다.
- 지도 로딩 전에는 `지도 펼치는 중...` 상태를 표시한다.

### 9.15.2 마커 구현

보물 마커는 Naver Maps Marker의 icon 옵션에 관리자에 등록된 `marker_image_url`을 연결한다.  
등록 이미지가 없으면 fallback 마커를 사용한다.

```ts
const markerImageUrl =
  treasure.marker_image_url ?? MAP_DETAIL_ASSETS.treasureFallback;

new naver.maps.Marker({
  position,
  map,
  icon: {
    url: markerImageUrl,
    size: new naver.maps.Size(40, 40),
    scaledSize: new naver.maps.Size(40, 40),
  },
});
```

### 9.15.3 마커 라벨 구현

마커 아래 라벨은 별도 DOM overlay 또는 Naver Maps OverlayView로 구현한다.

```txt
라벨 박스 = CSS/HTML
라벨 텍스트 = 코드 텍스트
라벨 프레임 이미지 = 사용하지 않음
```

### 9.15.4 지도 컨트롤 버튼

지도 우측 하단 컨트롤은 실제 button으로 구현한다.

```txt
현재 위치
새로고침
상태/알림
```

컨트롤 버튼의 외곽 프레임은 별도 이미지 에셋을 사용하지 않고 CSS로 구현한다.

---


---

## 9.16 보물 마커 상태 정책 수정

최종 디자인 기준으로 보물 마커는 별도의 활성/비활성 상태 에셋을 만들지 않는다.

### 9.16.1 최종 마커 에셋

| 구분 | 에셋명 |
|---|---|
| 황금 보물상자 | `` |
| 보라 선물상자 | `` |

### 9.16.2 사용하지 않는 에셋

아래 에셋은 사용하지 않는다.

```txt
marker_treasure_box_yellow_active_48.svg
marker_treasure_box_purple_active_48.svg
marker_treasure_box_disabled_40.svg
```

### 9.16.3 선택 상태 표현 방식

마커를 선택했을 때는 마커 이미지를 바꾸지 않는다.  
대신 아래 방식으로 선택 상태를 표현한다.

```txt
마커 라벨 노출
선택된 보물 정보 바텀시트 노출
마커 z-index 상승
필요 시 지도 중심 이동
```

마커 자체는 항상 동일한 default 에셋을 사용한다.

---

## 9.17 보물 마커 이미지 등록 정책

보물상자 마커 이미지는 앱 개발자가 화면별로 임의 등록하지 않는다.  
보물상자 이미지는 **관리자에서 보물 등록 시 선택/등록하는 이미지**를 사용한다.

### 9.17.1 관리자 등록 기준

관리자는 보물 등록 시 아래 정보를 함께 등록한다.

| 항목 | 설명 |
|---|---|
| 보물명 | 예: 황금 보물상자 |
| 위치 | lat/lng |
| 보물 이미지 | 지도 마커에 사용할 보물상자 이미지 |
| 보물 유형 | 일반/이벤트/브랜드 등 |
| 노출 상태 | active / hidden / closed |
| 수량 | 남은 보상 수량 또는 클레임 가능 수량 |

### 9.17.2 앱 표시 기준

앱은 관리자에 등록된 보물 이미지 URL을 받아 지도 마커로 표시한다.

```txt
관리자 보물 등록
→ treasure_boxes.marker_image_url 저장
→ 맵 상세 화면에서 marker_image_url 사용
→ 지도 위 보물 마커 표시
```

따라서 기본 에셋으로는 fallback 마커만 둔다.

| 구분 | 에셋명 |
|---|---|
| 기본 fallback 보물 마커 | `marker_treasure_box_default_fallback_40.svg` |

기존 yellow/purple 마커는 디자인 시안용 예시이며, 운영에서는 관리자 등록 이미지가 우선한다.

```txt
관리자 등록 이미지 우선
없으면 fallback 마커 사용
```

---

## 9.18 마커 클릭 정책

사용자가 지도 위 보물상자 마커를 클릭하면 다음 화면인 **힌트 팝업/힌트 바텀시트**가 열린다.

```txt
맵 상세 화면
→ 보물 마커 클릭
→ 선택한 보물 정보 조회
→ 힌트 팝업/바텀시트 오픈
```

### 9.18.1 클릭 시 처리

| 동작 | 처리 |
|---|---|
| 보물 마커 탭 | 해당 보물 선택 |
| 마커 라벨 탭 | 해당 보물 선택 |
| 선택된 보물 | 힌트 팝업 오픈 |
| 지도 빈 영역 탭 | 선택 해제 또는 팝업 닫기 |

### 9.18.2 이동/노출 화면

| 다음 화면 | 화면 ID | 설명 |
|---|---|---|
| 힌트 팝업/바텀시트 | `06_Treasure_Hint_Bottom_Sheet` | 보물 상세 힌트와 사냥 가능 여부 확인 |

중요:

- 마커 클릭 시 AR 화면으로 바로 가지 않는다.
- 마커 클릭 시 쿠폰 발급을 하지 않는다.
- 마커 클릭 시 기프티쇼비즈 API를 호출하지 않는다.
- 힌트 팝업에서 거리/상태를 확인한 뒤 사냥 흐름으로 이동한다.

---

## 9.19 지도 줌 정책

맵 상세 화면에서는 사용자가 지도를 확대/축소할 수 있다.  
최대 확대 기준은 **네이버 지도 기준 동 단위까지 확인 가능한 수준**으로 제한한다.

### 9.19.1 줌 정책

| 항목 | 정책 |
|---|---|
| 최소 줌 | 서비스 운영 지역이 보이는 수준 |
| 최대 줌 | 네이버 지도 기준 동 단위까지 확인 가능한 수준 |
| 기본 줌 | 현재 위치 주변 보물이 2~5개 보이는 수준 |
| 과도한 확대 | 제한 |
| 과도한 축소 | 필요 시 제한 |

### 9.19.2 정책 이유

- 사용자가 보물 위치를 너무 세밀하게 특정하지 못하도록 한다.
- 위치 기반 탐색의 재미를 유지한다.
- 지도 조작성을 유지하면서도 화면 정보량을 통제한다.
- 동 단위 탐색까지는 가능하게 하되, 건물/출입구 수준의 과도한 확대는 제한한다.

### 9.19.3 개발 메모

정확한 zoom level 값은 Naver Maps 스타일/초기 지도 설정에서 테스트 후 확정한다.  
MD에서는 정책 기준만 정의한다.

```txt
최대 확대 = 동 단위 확인 가능 수준
정확한 zoom 값 = 개발 테스트 후 상수화
```

권장 상수 예시:

```ts
export const MAP_ZOOM_POLICY = {
  defaultZoom: 'current-area',
  maxZoomLevel: 'dong-level',
  minZoomLevel: 'service-area',
} as const;
```

## 10. 디자인 시스템 적용

### 10.1 디자인 방향

지도 상세 화면은 실제 탐색 기능을 수행하는 화면이므로, 지도와 보물 마커의 가독성을 최우선으로 한다.

첨부 예시 화면의 배치 흐름은 참고하되, 색상과 디자인 스타일은 글로벌 모노톤 디자인 토큰을 따른다.

디자인 키워드:

```txt
Monotone
Minimal
Map First
Floating UI
Rounded
Clean
Location Based
```

### 10.2 Font Token

| 용도 | 폰트 |
|---|---|
| Headline | Plus Jakarta Sans |
| Body | Plus Jakarta Sans |
| Label | Space Grotesk |

### 10.3 Color Token

| 용도 | 토큰 | 값 |
|---|---|---|
| Primary | `primary` | `#000000` |
| Tertiary | `tertiary` | `#000000` |
| Secondary | `secondary` | `#5D5F5F` |
| Neutral | `neutral` | `#777777` |
| Background | `background` | `#F7F5EF` |
| Surface | `surface` | `#FFFFFF` |
| Border | `border` | `#000000` |
| Disabled | `disabled` | `#C9C9C9` |
| Error | `error` | `#E5484D` |
| Success | `success` | `#000000` |

### 10.4 Shape Token

| 요소 | Radius |
|---|---|
| 상단 안내 토스트 | `rounded-full` |
| 지도 컨트롤 버튼 | `rounded-full` |
| 내 위치 마커 | `rounded-full` |
| 힌트 바텀시트 | `rounded-t-3xl` |
| 보물 상태 배지 | `rounded-full` |
| 하단 네비게이션 | `rounded-t-3xl` |

---

## 11. UI 구성 요소

## 11.1 Top GNB

### 구성

| 영역 | 요소 |
|---|---|
| 좌측 | CATCHCASH 로고 |
| 우측 | 알림 아이콘, 캐치캐쉬 안내 아이콘, 설정 이동 아이콘 |

### 아이콘 동작

| 아이콘 | 동작 |
|---|---|
| 알림 | 알림 레이어 팝업 열기 |
| 안내 | 캐치캐쉬 안내 화면 이동 |
| 설정 | 설정 또는 내정보 화면 이동 |

### 정책

- GNB는 지도 화면에서도 동일하게 유지한다.
- 지도와 겹칠 경우 배경 surface 또는 반투명 blur 처리를 적용할 수 있다.
- 알림 아이콘은 unread count 배지를 표시할 수 있다.

---

## 11.2 지도 영역

### 지도 기술

```txt
Naver Maps JavaScript API
```

### 지도 표시 기준

| 항목 | 기준 |
|---|---|
| 초기 중심 | 사용자 현재 위치 |
| 위치 없음 | 기본 지역 또는 마지막 저장 위치 |
| Zoom | 보물 마커가 인지될 수 있는 수준 |
| POI | 필요 시 최소화 또는 숨김 |
| 지도 스타일 | 모노톤에 맞게 최대한 간결한 스타일 권장 |
| 지도 높이 | GNB와 Bottom Nav를 제외한 전체 영역 |

### 지도 로딩 상태

- 지도 스크립트 로딩 중에는 전체 지도 영역에 로딩 UI를 표시한다.
- 지도 로드 실패 시 오류 상태를 표시한다.

---

## 11.3 내 위치 마커

### 목적

현재 사용자의 위치를 지도 위에 표시한다.

### 구성

| 요소 | 설명 |
|---|---|
| 중심 마커 | 현재 위치 |
| 정확도 원 | 선택 사항 |
| 방향 표시 | 선택 사항 |

### 데이터

```txt
Capacitor Geolocation으로 수집한 latitude, longitude
```

### 권한 없음 상태

현재 위치 권한이 없으면 내 위치 마커를 표시하지 않는다.  
대신 위치 권한 안내 토스트 또는 버튼을 표시한다.

---

## 11.4 보물상자 마커

### 목적

관리자에서 등록한 활성 보물상자를 지도 위에 표시한다.

### 마커 데이터

| 데이터 | 설명 |
|---|---|
| id | 보물상자 ID |
| latitude | 위도 |
| longitude | 경도 |
| title | 보물상자 이름 |
| status | 보물 상태 |
| distance_m | 현재 위치 기준 거리 |
| reward_name | 연결된 상품명 선택 표시 |

### 마커 상태

| 상태 | 표시 |
|---|---|
| active | 정상 보물 마커 |
| closed | 비노출 또는 비활성 마커 |
| expired | 비노출 |
| draft | 비노출 |
| deleted | 비노출 |

### 마커 클릭

```txt
보물상자 마커 클릭
→ selectedTreasureId 저장
→ 힌트 바텀시트 열기
```

---

## 11.5 상단 안내 토스트

### 목적

주변 보물 상태를 간단히 안내한다.

### 노출 조건

| 조건 | 문구 |
|---|---|
| 주변 활성 보물 있음 | `근처에 열린 보물이 있어요!` |
| 위치 권한 없음 | `주변 보물을 찾으려면 위치 권한이 필요해요.` |
| 보물 없음 | `지금 주변에는 열린 보물이 없어요.` |
| 지도 로딩 중 | 표시하지 않거나 skeleton |

### 구성

| 요소 | 설명 |
|---|---|
| 아이콘 | 알림/보물/위치 |
| 텍스트 | 안내 문구 |
| 닫기 버튼 | 선택 사항 |

### 닫기 정책

사용자가 X를 누르면 현재 세션 동안 숨김 처리 가능하다.

---

## 11.6 지도 컨트롤 버튼

지도 우측 하단에 플로팅 컨트롤 버튼을 배치한다.

### 버튼 목록

| 버튼 | 기능 |
|---|---|
| 내 위치 이동 | 현재 위치 중심으로 지도 이동 |
| 새로고침 | 현재 위치와 보물상자 데이터 재조회 |

### 공통 스타일

| 항목 | 값 |
|---|---|
| Shape | `rounded-full` |
| Size | 48px~56px |
| Background | `surface` |
| Border | 1px solid `border` |
| Icon color | `primary` |

### 내 위치 이동 버튼

```txt
클릭
→ 현재 위치 재조회
→ 지도 중심을 현재 위치로 이동
```

### 새로고침 버튼

```txt
클릭
→ 현재 위치 재조회
→ 활성 보물 목록 재조회
→ 거리 재계산
→ 마커 갱신
```

---

## 11.7 힌트 바텀시트 연결

지도 상세 화면에서 보물상자 마커를 클릭하면 힌트 바텀시트가 열린다.

힌트 바텀시트는 별도 화면/컴포넌트 문서에서 상세 정의한다.

### 전달 데이터

```txt
treasure_box_id
current_user_location
distance_m
treasure_status
```

### 바텀시트 역할

- 보물 이름 표시
- 힌트 표시
- 현재 거리 표시
- 사냥 가능 여부 표시
- 사냥하기 버튼 제공
- 거리 조건 충족 시 AR 가이드 화면으로 이동

---

## 11.8 Bottom Navigation

### 탭 구성

| 탭 | Route | 설명 |
|---|---|---|
| 지도 | `/map` | 지도 상세 화면 |
| 사냥하기 | `/map` 또는 `/ar-guide` | 보물 탐색/사냥 진입 |
| 명예전당 | `/hall-of-fame` | 랭킹 화면 |
| 내정보 | `/profile` | 내 프로필 화면 |

### 현재 활성 탭

지도 상세 화면에서는 `지도` 탭을 활성 상태로 표시한다.

---

## 12. 화면 상태

### 12.1 상태 타입

```ts
export type MapDetailStatus =
  | 'initial'
  | 'loading_map'
  | 'loading_location'
  | 'loading_treasures'
  | 'ready'
  | 'location_permission_required'
  | 'empty_treasures'
  | 'map_error'
  | 'data_error';
```

### 12.2 상태별 UI

| 상태 | UI 처리 |
|---|---|
| `initial` | 초기 진입 |
| `loading_map` | 지도 로딩 UI |
| `loading_location` | 위치 확인 중 |
| `loading_treasures` | 보물 마커 로딩 |
| `ready` | 지도 및 마커 표시 |
| `location_permission_required` | 위치 권한 안내 |
| `empty_treasures` | 보물 없음 안내 |
| `map_error` | 지도 로드 실패 |
| `data_error` | 데이터 조회 실패 |

---

## 13. 데이터 요구사항

### 13.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| Supabase Auth Session | 현재 로그인 사용자 확인 |
| profiles | 사용자 상태 확인 |
| treasure_boxes | 활성 보물상자 위치 데이터 |
| treasure_rewards | 보물과 상품 연결 데이터 |
| giftishow_products | 상품명/브랜드/이미지 표시용 |
| current location | 사용자 현재 위치 |
| treasure_claims | 중복 획득 여부 확인 시 선택 사용 |

### 13.2 쓰는 데이터

지도 상세 화면에서는 기본적으로 보물 획득 데이터를 생성하지 않는다.

선택적으로 아래 상태만 저장한다.

| 데이터 | 설명 |
|---|---|
| selectedTreasureId | 선택한 보물상자 |
| lastKnownLocation | 마지막 위치 캐시 |
| dismissedMapToast | 상단 토스트 닫힘 여부 |

### 13.3 생성하지 않는 데이터

- treasure_claims
- inventory_items
- giftishow_issues
- coupon code
- security_logs

단, 사냥하기 버튼 클릭 후 AR 화면에서 획득 RPC가 실행될 때 별도 데이터가 생성된다.

---

## 14. 데이터 조회 정책

### 14.1 활성 보물상자 조회

조회 조건:

```txt
treasure_boxes.status = active
treasure_boxes.deleted_at is null
treasure_boxes.starts_at <= now
treasure_boxes.ends_at >= now
treasure_boxes.current_claim_count < treasure_boxes.max_claim_count
treasure_boxes.latitude is not null
treasure_boxes.longitude is not null
```

### 14.2 거리 계산

현재 위치와 보물상자 좌표를 기준으로 거리(m)를 계산한다.

```txt
distance_m = calculateDistance(currentLocation, treasureLocation)
```

### 14.3 지도 표시 정렬

지도 위 마커는 정렬 개념이 없지만, 바텀시트나 목록이 필요한 경우 거리 가까운 순으로 정렬한다.

```txt
distance_m ASC
```

### 14.4 Realtime 반영

선택적으로 Supabase Realtime을 통해 보물 상태 변경을 반영한다.

반영 이벤트:

| 이벤트 | 처리 |
|---|---|
| treasure_boxes.status 변경 | 마커 갱신 |
| current_claim_count 증가 | 마커 상태 갱신 |
| closed 처리 | 마커 제거 또는 비활성 표시 |
| deleted_at 설정 | 마커 제거 |

---

## 15. 위치 권한 정책

### 15.1 권한 사용 목적

위치 권한은 아래 목적으로 사용한다.

- 현재 위치 표시
- 보물상자까지의 거리 계산
- 사냥 가능 반경 판단
- 지도 중심 이동

### 15.2 권한 요청 시점

지도 상세 화면 진입 시 위치 권한이 없으면 사용자에게 위치 권한 요청 UI를 표시한다.

MVP 권장:

```txt
지도 상세 진입
→ 위치 권한 상태 확인
→ 권한 없으면 안내 후 요청
→ 허용 시 현재 위치 표시 및 보물 거리 계산
```

### 15.3 권한 거부 처리

| 상황 | 처리 |
|---|---|
| 최초 거부 | 위치 권한 필요 안내 |
| 영구 거부 | OS 설정 이동 안내 |
| 위치 획득 실패 | 재시도 버튼 표시 |
| 정확도 낮음 | 대략 위치 안내 또는 재시도 |

문구:

```txt
보물을 찾으려면 위치 권한이 필요해요.
```

### 15.4 고정밀 위치

캐치캐쉬는 20m 반경 사냥 조건이 있으므로 가능한 고정밀 위치를 사용한다.

권장 옵션:

```txt
enableHighAccuracy = true
timeout = 10000
maximumAge = 5000
```

---

## 16. 사냥 가능 거리 정책

### 16.1 기본 사냥 가능 반경

```txt
20m
```

관리자에서 보물별 radius_m을 다르게 설정할 수 있으나 MVP 기본값은 20m로 한다.

### 16.2 지도 화면에서의 판단

지도 상세 화면은 사냥 가능 여부를 안내한다.  
최종 획득 확정은 AR 화면에서 Supabase RPC로 다시 검증한다.

```txt
지도 화면 거리 계산
→ 사용자 안내용

AR 획득 RPC 거리 계산
→ 최종 서버 검증용
```

### 16.3 거리별 UI

| 거리 | 상태 |
|---:|---|
| 20m 이내 | 사냥 가능 |
| 20m 초과 | 더 가까이 이동 안내 |
| 위치 없음 | 사냥 가능 여부 판단 불가 |

---

## 17. 사용자 액션

### 17.1 지도 진입

```txt
/map 진입
→ 인증 확인
→ Naver 지도 로드
→ 위치 권한 확인
→ 현재 위치 조회
→ 활성 보물상자 조회
→ 마커 렌더링
```

### 17.2 보물 마커 클릭

```txt
보물 마커 클릭
→ selectedTreasureId 저장
→ 현재 위치와 거리 계산
→ 힌트 바텀시트 오픈
```

### 17.3 내 위치 버튼 클릭

```txt
내 위치 버튼 클릭
→ 현재 위치 재조회
→ 지도 중심 이동
```

### 17.4 새로고침 버튼 클릭

```txt
새로고침 버튼 클릭
→ 위치 재조회
→ 보물상자 재조회
→ 마커 갱신
```

### 17.5 사냥하기 클릭

힌트 바텀시트 내부의 사냥하기 버튼에서 처리한다.

```txt
사냥하기 클릭
→ 거리 조건 확인
→ 20m 이내이면 AR 가이드 화면 이동
→ 20m 초과이면 더 가까이 이동 안내
```

---

## 18. 예외 처리

### 18.1 Naver 지도 로드 실패

| 상황 | 처리 |
|---|---|
| API Key 오류 | 지도 오류 상태 표시 |
| 스크립트 로드 실패 | 재시도 버튼 표시 |
| 네트워크 오류 | 재시도 안내 |

문구:

```txt
지도를 불러오지 못했어요.
잠시 후 다시 시도해주세요.
```

### 18.2 위치 권한 거부

| 상황 | 처리 |
|---|---|
| 권한 거부 | 안내 UI 표시 |
| 영구 거부 | OS 설정 안내 |
| 위치 없음 | 마커는 표시하되 거리 숨김 가능 |

### 18.3 보물상자 없음

| 상황 | 처리 |
|---|---|
| 활성 보물 없음 | 보물 없음 안내 |
| 주변 보물 없음 | 지도는 표시하고 전체 탐색 유도 |

문구:

```txt
지금 열린 보물이 없어요.
조금 뒤에 다시 확인해보세요.
```

### 18.4 데이터 조회 실패

| 상황 | 처리 |
|---|---|
| Supabase 조회 실패 | 오류 토스트 또는 빈 상태 |
| 인증 오류 | 로그인 화면 이동 |
| RLS 오류 | 로그인 상태 재확인 |

---

## 19. 기프티쇼비즈 정책과의 관계

지도 상세 화면은 기프티쇼비즈 API와 직접 연결되지 않는다.

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
관리자에서 보물상자에 기프티쇼비즈 상품 연결
→ 지도 화면에 보물상자 표시
→ 유저가 AR에서 보물 획득
→ 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

따라서 지도 상세 화면에서는 아래 작업을 하지 않는다.

- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 조회
- 쿠폰 코드 표시
- 쿠폰 사용 처리
- 쿠폰 발급 실패 재시도
- 취소/재발송 처리

단, 보물상자에 연결된 상품명 또는 브랜드명은 `giftishow_products` 데이터를 통해 힌트 바텀시트 또는 보물 정보에 표시할 수 있다.

---

## 20. 보안 및 정책

- 사용자는 active 상태의 보물상자만 볼 수 있다.
- draft, deleted, expired 상태의 보물은 노출하지 않는다.
- 보물상자 좌표는 앱 사용 목적상 노출되지만, 관리자 전용 필드는 노출하지 않는다.
- 정지 계정은 지도 화면에 접근할 수 없다.
- 위치 정보는 사냥 판단 및 거리 계산에만 사용한다.
- 위치 정보는 불필요하게 장기 저장하지 않는다.
- 최종 보상 획득 여부는 지도 화면이 아니라 서버 RPC에서 검증한다.
- 지도 화면의 거리 계산 결과만 믿고 보상을 지급하지 않는다.

---

## 21. 접근성

### 21.1 지도 접근성

- 지도 화면은 시각 중심 UI이므로 주요 액션 버튼에는 명확한 aria-label을 제공한다.
- 내 위치 버튼, 새로고침 버튼, 보물 마커는 스크린리더 라벨을 제공한다.

권장 aria-label:

```txt
내 위치로 이동
주변 보물 새로고침
보물상자 정보 보기
```

### 21.2 마커

- 마커 클릭 가능 영역은 충분히 커야 한다.
- 마커는 상태에 따라 시각적으로 구분 가능해야 한다.
- 색상만으로 상태를 구분하지 않고 텍스트 또는 바텀시트에서 상태를 명확히 전달한다.

### 21.3 위치 권한 안내

- 위치 권한이 필요한 이유를 명확히 설명한다.
- 권한 거부 시 다음 행동을 제공한다.

---

## 22. 구현 컴포넌트 제안

### 22.1 화면 컴포넌트

```txt
MapDetailPage
```

### 22.2 하위 컴포넌트

```txt
MapTopGNB
NaverMapView
UserLocationMarker
TreasureMarker
MapNoticeToast
MapControlButtons
CurrentLocationButton
MapRefreshButton
TreasureHintBottomSheet
MapLoadingState
MapErrorState
LocationPermissionNotice
BottomNavigation
```

### 22.3 훅

```txt
useNaverMap
useCurrentLocation
useTreasureMarkers
useTreasureDistance
useSelectedTreasure
useMapRealtime
useMapNavigation
```

### 22.4 유틸

```txt
loadNaverMapScript
calculateDistanceMeters
formatDistance
filterVisibleTreasures
createTreasureMarkerIcon
moveMapToCurrentLocation
```

---

## 23. 권장 파일 구조

```txt
app/
  map/
    page.tsx

features/
  map/
    components/
      MapTopGNB.tsx
      NaverMapView.tsx
      UserLocationMarker.tsx
      TreasureMarker.tsx
      MapNoticeToast.tsx
      MapControlButtons.tsx
      LocationPermissionNotice.tsx
      MapLoadingState.tsx
      MapErrorState.tsx
    hooks/
      useNaverMap.ts
      useCurrentLocation.ts
      useTreasureMarkers.ts
      useSelectedTreasure.ts
    services/
      map.service.ts
    types/
      map.types.ts

features/
  treasure/
    components/
      TreasureHintBottomSheet.tsx

stores/
  location.store.ts
  treasure.store.ts

constants/
  routes.ts
  treasureStatus.ts

lib/
  naver-map/
    loadNaverMapScript.ts
  supabase/
    client.ts
```

---

## 24. TypeScript 타입 제안

### 24.1 화면 상태 타입

```ts
export type MapDetailStatus =
  | 'initial'
  | 'loading_map'
  | 'loading_location'
  | 'loading_treasures'
  | 'ready'
  | 'location_permission_required'
  | 'empty_treasures'
  | 'map_error'
  | 'data_error';
```

### 24.2 보물상자 타입

```ts
export type TreasureStatus =
  | 'draft'
  | 'active'
  | 'closed'
  | 'expired'
  | 'deleted';

export type TreasureBox = {
  id: string;
  title: string;
  description: string | null;
  hint: string | null;
  latitude: number;
  longitude: number;
  radius_m: number;
  status: TreasureStatus;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  current_claim_count: number;
  deleted_at: string | null;
};
```

### 24.3 지도용 보물 마커 타입

```ts
export type TreasureMarkerData = TreasureBox & {
  distance_m?: number;
  reward_name?: string;
  brand_name?: string;
  is_huntable: boolean;
};
```

### 24.4 현재 위치 타입

```ts
export type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  captured_at: string;
};
```

### 24.5 선택 보물 타입

```ts
export type SelectedTreasureState = {
  treasureId: string | null;
  isBottomSheetOpen: boolean;
};
```

---

## 25. 완료 기준

### 25.1 UI 완료 기준

- [ ] `/map` route에서 지도 상세 화면이 렌더링된다.
- [ ] 상단 GNB가 표시된다.
- [ ] 알림/안내/설정 아이콘이 표시된다.
- [ ] Naver 지도 영역이 표시된다.
- [ ] 현재 위치 마커 `marker_user_location_blue_default_24.svg`가 표시된다.
- [ ] 관리자에서 등록한 활성 보물상자 마커가 표시된다.
- [ ] 상단 안내 토스트가 표시된다.
- [ ] 내 위치 이동 버튼이 표시된다.
- [ ] 새로고침 버튼이 표시된다.
- [ ] 하단 네비게이션이 표시된다.
- [ ] 지도 탭이 활성 상태로 표시된다.
- [ ] 전체 화면이 글로벌 디자인 토큰을 따른다.

### 25.2 기능 완료 기준

- [ ] 인증 세션이 없으면 로그인 화면으로 이동한다.
- [ ] 프로필 미완성 사용자는 닉네임/약관 화면으로 이동한다.
- [ ] Naver Maps JavaScript API가 정상 로드된다.
- [ ] 위치 권한 상태를 확인한다.
- [ ] 현재 위치를 조회한다.
- [ ] 현재 위치를 지도 중심으로 설정한다.
- [ ] 활성 보물상자 목록을 Supabase에서 조회한다.
- [ ] 보물상자 위도/경도 기준으로 마커를 생성한다.
- [ ] 마감/만료/삭제된 보물상자는 지도에 노출하지 않는다.
- [ ] 보물 마커 클릭 시 힌트 바텀시트가 열린다.
- [ ] 현재 위치와 보물상자 거리 계산이 동작한다.
- [ ] 내 위치 버튼 클릭 시 지도 중심이 현재 위치로 이동한다.
- [ ] 새로고침 버튼 클릭 시 위치와 보물상자가 갱신된다.
- [ ] 위치 권한 거부 시 안내 UI가 표시된다.
- [ ] 지도 로드 실패 시 오류 상태가 표시된다.

### 25.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] Naver Maps JavaScript API 로더가 구현되어 있다.
- [ ] Capacitor Geolocation이 적용되어 있다.
- [ ] Supabase `treasure_boxes` 조회 로직이 구현되어 있다.
- [ ] 거리 계산 유틸이 구현되어 있다.
- [ ] selectedTreasure 상태가 관리된다.
- [ ] 힌트 바텀시트와 데이터가 연결된다.
- [ ] Tailwind CSS 디자인 토큰을 사용한다.
- [ ] route constants를 사용한다.
- [ ] 기프티쇼비즈 API를 호출하지 않는다.

### 25.4 제외 기능 확인

- [ ] 카메라 권한 요청이 없다.
- [ ] WebAR이 실행되지 않는다.
- [ ] R3F 3D 렌더링이 없다.
- [ ] 보물 획득 RPC가 실행되지 않는다.
- [ ] 기프티쇼비즈 API 호출이 없다.
- [ ] 쿠폰 코드 표시가 없다.
- [ ] 관리자 생성/수정 기능이 없다.

---

## 26. 제외 범위

이 화면에서는 아래 기능을 구현하지 않는다.

- AR 카메라 실행
- 3D 보물상자 렌더링
- 카메라 권한 요청
- 보물 획득 RPC 호출
- 보상 수령권 생성
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 보관함 상세 보기
- 쿠폰 사용 완료 처리
- 관리자 보물상자 등록/수정
- 관리자 상품 연결
- 관리자 발급 이력 조회
- 쿠폰 취소/재발송

---

## 27. 개발자 주의사항

- 지도 상세 화면은 관리자에서 등록한 보물상자 좌표를 표시하는 화면이다.
- 지도 상세 화면에서 보물 획득을 확정하지 않는다.
- 지도 화면의 거리 계산은 사용자 안내용이며, 최종 검증은 AR 획득 RPC에서 수행한다.
- AR 진입 전 힌트 바텀시트에서 거리 조건을 다시 확인한다.
- 위치 권한이 없더라도 화면이 완전히 깨지면 안 된다.
- Naver Maps API key는 환경변수로 관리한다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
- 쿠폰 발급은 보관함에서 사용자가 `쿠폰 받기`를 실행하는 시점에 처리한다.
- 지도 마커는 active 상태의 보물상자만 표시한다.
- Supabase Realtime은 MVP 이후 적용 가능하지만, 마감 상태 반영을 위해 구조는 고려한다.


---

## 99. 디자인 반영 개발자 주의사항

- 맵 상세 화면은 홈 미니맵과 달리 실제 Naver Maps JavaScript API를 사용한다.
- 지도 전체 이미지를 에셋으로 만들지 않는다.
- 지도 색상은 Naver Maps 스타일 에디터에서 `Grug Dark` 계열 흑백/저채도 스타일을 적용한다.
- 현재 위치 마커는 지도 가독성을 위해 예외적으로 파란색 마커 에셋을 사용할 수 있다.
- 보물 마커 이미지는 관리자에서 등록한 이미지를 우선 사용한다.
- 앱 기본 에셋은 fallback 마커 1개만 둔다.
- 활성/비활성/선택 상태용 마커 에셋은 만들지 않는다.
- 마커 선택 상태는 마커 에셋 교체가 아니라 라벨 노출, 힌트 팝업/바텀시트 노출, z-index 조정 등 UI 상태로 처리한다.
- 보물 마커 클릭 시 다음 화면은 `06_Treasure_Hint_Bottom_Sheet`이다.
- 지도 최대 확대는 네이버 기준 동 단위까지 확인 가능한 수준으로 제한한다.
- 마커 라벨은 이미지가 아니라 DOM overlay + 코드 텍스트로 구현한다.
- 지도 컨트롤 버튼은 실제 button으로 구현하고, 아이콘만 에셋으로 사용한다.
- 하단 네비게이션은 전역 네비게이션 컴포넌트를 재사용한다.
- 이 화면에서는 쿠폰 코드, 바코드, 기프티쇼비즈 발급 UI를 표시하지 않는다.
