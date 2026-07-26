# 04. 메인 홈 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 04. 메인 홈 화면 정의서 |
| 파일명 | `04_Main_Home_Screen.md` |
| 화면명 | 메인 홈 화면 |
| 화면 ID | `04_Main_Home_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 바이브코딩 기반 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 메인 홈 시안 기준 / 스케치 미니맵 / rough frame 에셋 적용 |
| 주요 기능 | 주변 보물 탐색, 지도 진입, 사냥 진입, 탐험 로그 확인 |

---

## 2. 화면 개요

메인 홈 화면은 사용자가 로그인 및 온보딩을 완료한 후 처음 진입하는 캐치캐쉬의 핵심 대시보드 화면이다.

사용자는 이 화면에서 오늘의 보물 탐색 상태를 확인하고, 주변 보물상자 목록을 확인하며, 지도 상세 또는 사냥 플로우로 이동할 수 있다.

메인 홈은 실제 정밀 지도 화면이 아니라, 사용자가 보물찾기를 시작하도록 유도하는 **탐색 허브 화면**이다.

---

## 3. 화면 목적

### 핵심 목적

- 로그인한 사용자의 홈 대시보드를 제공한다.
- 사용자에게 주변 보물상자 존재 여부를 알려준다.
- 대표 보물 탐색 CTA를 제공한다.
- 주변 보물상자 목록을 제공한다.
- 최근 탐험 로그를 요약해서 보여준다.
- 하단 탭을 통해 주요 화면으로 이동할 수 있게 한다.

### 사용자 관점 목적

- 앱을 켜자마자 오늘 찾을 수 있는 보물이 있는지 확인한다.
- 가까운 보물상자를 빠르게 확인한다.
- 사냥하기 버튼을 통해 보물찾기 플로우로 진입한다.
- 내 최근 획득 기록을 간단히 확인한다.

---

## 4. 기술 구현 기준

### 4.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ Main Home Screen
```

### 4.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |

### 4.3 데이터 및 상태

| 항목 | 기술 |
|---|---|
| 인증 세션 | Supabase Auth |
| 유저 프로필 | Supabase PostgreSQL `profiles` |
| 주변 보물상자 | Supabase PostgreSQL `treasure_boxes` |
| 탐험 로그 | Supabase PostgreSQL `treasure_claims` |
| 서버 상태 캐싱 | TanStack Query 권장 |
| 전역 상태 | Zustand 또는 Context API |
| 현재 위치 | Capacitor Geolocation 권장 |

### 4.4 외부 연동

| 항목 | 사용 여부 | 설명 |
|---|---:|---|
| Naver Maps JavaScript API | 선택 | 홈 화면의 일러스트형 맵이 아니라 실제 지도 미리보기를 사용할 경우 |
| Capacitor Geolocation | 사용 | 주변 보물 거리 계산을 위한 현재 위치 확인 |
| Supabase Realtime | 선택 | 보물 마감 상태 실시간 반영 |
| 기프티쇼비즈 API | 미사용 | 이 화면에서는 쿠폰 발급하지 않음 |

### 4.5 이 화면에서 사용하지 않는 기능

메인 홈 화면에서는 아래 기능을 실행하지 않는다.

- 카메라 권한 요청
- WebAR 실행
- R3F 보물상자 렌더링
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 관리자 기능
- 보물상자 생성/수정
- 보상 사용 처리

---

## 5. 진입 조건

### 5.1 진입 시점

사용자는 아래 상황에서 메인 홈 화면으로 진입한다.

| 상황 | 설명 |
|---|---|
| 스플래시 세션 확인 성공 | 기존 로그인 세션이 유효하고 프로필이 완료된 경우 |
| 로그인 성공 | 기존 유저가 소셜 로그인에 성공한 경우 |
| 온보딩 완료 | 닉네임 및 약관 동의가 완료된 경우 |
| 하단 탭 홈/지도 클릭 | 다른 주요 화면에서 홈으로 돌아오는 경우 |
| 사냥 종료 | AR 또는 지도 플로우 종료 후 홈으로 복귀하는 경우 |

### 5.2 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| 스플래시 화면 | 세션 유효 + 프로필 완료 |
| 로그인 화면 | 기존 유저 로그인 성공 |
| 닉네임 및 약관 동의 화면 | 온보딩 완료 |
| 지도 상세 화면 | 홈 복귀 |
| AR 가이드 화면 | 닫기 또는 뒤로가기 |
| AR 카메라 화면 | 종료 또는 실패 후 복귀 |
| 사냥 성공 화면 | 홈으로 이동 |

### 5.3 Route

```txt
/home
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/home/page.tsx
```

---

## 6. 접근 제한

메인 홈 화면은 로그인과 프로필 완성이 완료된 사용자만 접근할 수 있다.

### 6.1 접근 가능 조건

```txt
Supabase session 존재
profiles row 존재
profiles.nickname 존재
profiles.terms_agreed_at 존재
profiles.status = active
```

### 6.2 접근 제한 처리

| 조건 | 처리 |
|---|---|
| 세션 없음 | `/login` 이동 |
| 프로필 없음 | `/nickname` 이동 |
| 약관 미동의 | `/nickname` 이동 |
| 정지 계정 | 로그인 차단 안내 후 `/login` 이동 |
| 네트워크 오류 | 홈 화면 오류 상태 표시 또는 재시도 |

---

## 7. 종료 및 이동 규칙

| 사용자 액션 | 이동 화면 |
|---|---|
| 사냥하기 클릭 | 지도 상세 화면 또는 AR 가이드 화면 |
| 가까운 보물 카드 클릭 | 보물 힌트 바텀시트 또는 지도 상세 화면 |
| 정보 보기 클릭 | 보물 힌트 바텀시트 |
| 전체보기 클릭 | 지도 상세 화면 |
| 하단 탭 지도 클릭 | 지도 상세 화면 |
| 하단 탭 사냥하기 클릭 | AR 가이드 화면 또는 지도 상세 화면 |
| 하단 탭 명예전당 클릭 | 명예전당 화면 |
| 하단 탭 내정보 클릭 | 내 프로필 화면 |
| 알림 아이콘 클릭 | 알림 화면 또는 준비중 토스트 |
| 도움말 아이콘 클릭 | 도움말 화면 또는 준비중 토스트 |
| 설정 아이콘 클릭 | 설정/내정보 화면 |

### 7.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 지도 상세 | `05_Map_Detail_Screen` | `/map` |
| 보물 힌트 바텀시트 | `06_Treasure_Hint_Bottom_Sheet` | 현재 화면 또는 `/map` 위 overlay |
| AR 가이드 | `07_AR_Guide_Screen` | `/ar-guide` |
| 명예전당 | `10_Hall_Of_Fame_Screen` | `/hall-of-fame` |
| 내 프로필 | `11_My_Profile_Screen` | `/profile` |

---

## 8. 화면 레이아웃

### 8.1 전체 구조

```txt
┌──────────────────────────────┐
│ Logo                 Icons   │
├──────────────────────────────┤
│ [인사말 카드]                  │
│                              │
│ [보물 탐색 히어로 / 맵 카드]     │
│        [사냥하기 CTA]          │
│                              │
│ 가까운 보물 상자       전체보기 │
│ [필터 칩] [필터 칩] [필터 칩]   │
│                              │
│ [보물 카드 1]                  │
│ [보물 카드 2]                  │
│                              │
│ [탐험 로그 카드]                │
│                              │
├──────────────────────────────┤
│ Bottom Navigation            │
└──────────────────────────────┘
```

### 8.2 레이아웃 원칙

- 모바일 세로 화면 기준으로 설계한다.
- 홈 화면은 세로 스크롤 가능하다.
- 상단 헤더는 고정 또는 일반 스크롤 중 하나로 선택 가능하다.
- 하단 네비게이션은 화면 하단에 고정한다.
- 콘텐츠는 하단 네비게이션과 겹치지 않도록 safe area padding을 둔다.
- 사용자는 화면 진입 후 1초 안에 `사냥하기` CTA를 인지할 수 있어야 한다.

---

## 9. 디자인 시스템 적용

### 9.1 디자인 방향

메인 홈 화면은 캐치캐쉬의 탐색 시작점이다.  
예시 화면의 구성 흐름은 참고하되, 색상과 일러스트 스타일은 글로벌 디자인 토큰을 따른다.

디자인 키워드:

```txt
Monotone
Minimal
Rounded
Clean
Modern
Exploration Hub
Mobile Dashboard
```

### 9.2 Font Token

| 용도 | 폰트 |
|---|---|
| Headline | Plus Jakarta Sans |
| Body | Plus Jakarta Sans |
| Label | Space Grotesk |

### 9.3 Color Token

| 용도 | 토큰 | 값 |
|---|---|---|
| Primary | `primary` | `#000000` |
| Tertiary | `tertiary` | `#000000` |
| Secondary | `secondary` | `#5D5F5F` |
| Neutral | `neutral` | `#777777` |
| Background | `background` | `#FFFFFF` |
| Surface | `surface` | `#FFFFFF` |
| Border | `border` | `#E5E5E5` |
| Disabled | `disabled` | `#C9C9C9` |
| Error | `error` | `#E5484D` |
| Success | `success` | `#000000` |

### 9.4 Shape Token

| 요소 | Radius |
|---|---|
| 인사말 카드 | `rounded-3xl` |
| 히어로 맵 카드 | `rounded-3xl` |
| 사냥하기 CTA | `rounded-full` |
| 필터 칩 | `rounded-full` |
| 보물 카드 | `rounded-2xl` |
| 탐험 로그 카드 | `rounded-2xl` |
| 하단 네비게이션 | `rounded-t-3xl` 또는 고정 바 |

### 9.5 Spacing 기준

| 영역 | 기준 |
|---|---|
| 화면 좌우 여백 | 16px~24px |
| 헤더 높이 | 56px~64px |
| 카드 간격 | 12px~16px |
| 섹션 간격 | 24px |
| 히어로 카드 높이 | 180px~240px 권장 |
| 하단 네비게이션 높이 | 64px~80px |
| 하단 safe area | 필수 적용 |

---

---

## 9.10 Stitch AI 디자인 결과 반영

### 9.10.1 확정된 화면 카피

| 요소 | 확정 문구 | 구현 방식 |
|---|---|---|
| 상단 로고 텍스트 | `catch cash` | 코드 텍스트 |
| 메인 타이틀 | `근처에 뭐 좀 숨겨놨다.` | 코드 텍스트 |
| 보조 문구 | `지도 열고 근처 보물부터 뒤져봐.` | 코드 텍스트 |
| 미니맵 CTA | `지도 뒤지러 가기 →` | 코드 텍스트 |
| 보물 리스트 섹션 | `근처 보물상자` | 코드 텍스트 |
| 보물 카드 버튼 | `정보보기` | 코드 텍스트 |
| 최근 기록 섹션 | `최근 탐색 기록` | 코드 텍스트 |
| 하단 CTA | `사냥 합류하기 →` | 코드 텍스트 |

### 9.10.2 화면 시각 구조

```txt
상단 GNB
→ 메인 타이틀 / 보조 문구
→ 스케치형 미니맵 카드
→ 근처 보물상자 카드 2개
→ 최근 탐색 기록 타임라인
→ 사냥 합류하기 CTA
→ 하단 네비게이션
```

### 9.10.3 홈 미니맵 정책

메인 홈의 미니맵은 실제 Naver Maps API를 렌더링하지 않는다.

```txt
홈 미니맵 = 스케치형 미리보기 카드
실제 네이버 지도 = /map 화면에서 렌더링
```

이유:

- 홈 화면 로딩 속도를 가볍게 유지한다.
- 흑백 손그림 디자인 톤과 정합성을 유지한다.
- 실제 지도 기능은 지도 상세 화면에서 집중해서 제공한다.
- 홈에서는 주변 보물이 있다는 탐색 유도 역할만 수행한다.

### 9.10.4 미니맵 카드 구성

미니맵 카드는 아래 요소로 구성한다.

```txt
rough minimap frame
스케치 지도 라인
내 위치 마커
보물 위치 마커 2~3개
지도 뒤지러 가기 버튼
```

운영 데이터가 없거나 로딩 전이어도, 홈 미니맵은 분위기용 스케치 프리뷰로 표시할 수 있다.  
실제 보물 데이터는 근처 보물상자 카드와 지도 화면에서 정확히 표시한다.

---

## 9.11 이미지 에셋 분리 기준

메인 홈 화면에서는 **이미지로 필요한 것만 에셋으로 분리**한다.  
텍스트, 카드 레이아웃, 리스트, 타임라인, 버튼 문구는 코드/CSS/React 컴포넌트로 구현한다.

### 9.11.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 스케치 미니맵 카드 이미지 | 필수 | 홈 미니맵의 손그림 지도 분위기 재현 |
| 근처 보물상자 아이콘 | 필수 | 보물 카드 좌측 아이콘 |
| 나무/장소 아이콘 | 선택 | 보물 카드 유형 표시 |
| 하단 CTA rough frame | 공통 재사용 | 닉네임 화면과 동일한 CTA frame 사용 |
| GNB 아이콘 | 필수 또는 공통 아이콘 | 알림/도움말/설정 |
| 하단 탭 아이콘 | 필수 또는 공통 아이콘 | 전역 네비게이션 |
| 보물/내 위치 마커 | 미니맵 이미지에 포함 가능 | 홈 미니맵은 정적 스케치 이미지로 처리 가능 |

### 9.11.2 코드/CSS로 구현할 요소

| 요소 | 구현 방식 | 이유 |
|---|---|---|
| 상단 GNB 레이아웃 | React/CSS | 아이콘 클릭 처리 필요 |
| 메인 타이틀/보조 문구 | 코드 텍스트 | 수정 및 접근성 |
| 미니맵 CTA 텍스트 | 코드 텍스트 또는 버튼 | 클릭 처리 필요 |
| 근처 보물 카드 박스 | CSS/컴포넌트 | 데이터 바인딩 필요 |
| 보물명/위치/거리 | 코드 텍스트 | Supabase 데이터 표시 |
| 정보보기 버튼 | HTML button/link | 이동 처리 필요 |
| 최근 탐색 타임라인 | CSS/컴포넌트 | 데이터 바인딩 필요 |
| 하단 CTA 텍스트 | 코드 텍스트 | 공통 CTA 문구 관리 |
| 하단 네비게이션 구조 | React/CSS | 라우팅 처리 필요 |

### 9.11.3 중요 원칙

```txt
텍스트가 포함된 이미지를 만들지 않는다.
카드 전체를 이미지로 만들지 않는다.
미니맵은 스케치 이미지 에셋으로 사용 가능하다.
근처 보물 카드와 최근 기록은 실제 데이터가 들어가야 하므로 코드로 구현한다.
하단 CTA 프레임은 기존 공통 에셋 ui_frame_button_hunt_join_rough_default.svg를 재사용한다.
```

---

## 9.12 메인 홈 에셋 명칭 정의

### 9.12.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `illust_map_home_minimap_rough_default.svg` | sketch map illustration | svg | home | 320x160 | 홈 미니맵 카드 내부에 들어가는 흑백 스케치 지도 이미지 |
| `icon_treasure_chest_rough_default_32.svg` | treasure icon | svg | home, treasure card | 32x32 | 근처 보물상자 카드 좌측 보물 아이콘 |
| `icon_gnb_notification_rough_default_24.svg` | GNB icon | svg | global GNB | 24x24 | 상단 알림 아이콘 |
| `icon_gnb_help_rough_default_24.svg` | GNB icon | svg | global GNB | 24x24 | 상단 도움말 아이콘 |
| `icon_gnb_setting_rough_default_24.svg` | GNB icon | svg | global GNB | 24x24 | 상단 설정 아이콘 |
| `icon_nav_map_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 지도 탭 기본 아이콘 |
| `icon_nav_map_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 지도 탭 활성 아이콘 |
| `icon_nav_hunt_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 사냥하기 탭 기본 아이콘 |
| `icon_nav_hunt_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 사냥하기 탭 활성 아이콘 |
| `icon_nav_rank_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 랭킹/명예전당 탭 기본 아이콘 |
| `icon_nav_rank_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 랭킹/명예전당 탭 활성 아이콘 |
| `icon_nav_profile_rough_default_24.svg` | bottom nav icon | svg | global nav | 24x24 | 내정보 탭 기본 아이콘 |
| `icon_nav_profile_rough_active_24.svg` | bottom nav icon | svg | global nav | 24x24 | 내정보 탭 활성 아이콘 |
| `ui_frame_button_hunt_join_rough_default.svg` | UI frame | svg | nickname, home CTA | 320x56 | 공통 검은 CTA 버튼 rough frame. 닉네임 화면과 동일 에셋 재사용 |

### 9.12.2 선택 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_place_tree_rough_default_32.svg` | place icon | svg | home treasure card | 32x32 | 공원/장소형 보물 카드 아이콘 |
| `marker_user_location_rough_default_32.svg` | map marker | svg | map, optional home | 32x32 | 내 위치 마커. 홈 미니맵 이미지에 포함하면 별도 사용 생략 가능 |
| `marker_treasure_rough_default_32.svg` | map marker | svg | map, optional home | 32x32 | 보물 위치 마커. 홈 미니맵 이미지에 포함하면 별도 사용 생략 가능 |
| `illust_empty_treasure_rough_default.svg` | empty illustration | svg | home empty state | 160x120 | 근처 보물 없음 상태 일러스트 |

### 9.12.3 공통 CTA 에셋 재사용 정책

검정색 `사냥 합류하기` CTA는 닉네임/약관 화면에서 정의한 아래 공통 에셋을 재사용한다.

```txt
ui_frame_button_hunt_join_rough_default.svg
```

홈 화면에서 새 CTA 버튼 프레임 에셋을 만들지 않는다.  
텍스트만 화면별로 코드에서 변경할 수 있다.

---

## 9.13 에셋 저장 위치

### 9.13.1 권장 폴더 구조

```txt
public/
  assets/
    illustrations/
      map/
        illust_map_home_minimap_rough_default.svg

    icons/
      gnb/
        icon_gnb_notification_rough_default_24.svg
        icon_gnb_help_rough_default_24.svg
        icon_gnb_setting_rough_default_24.svg

      treasure/
        icon_treasure_chest_rough_default_32.svg
        icon_place_tree_rough_default_32.svg

      navigation/
        icon_nav_map_rough_default_24.svg
        icon_nav_map_rough_active_24.svg
        icon_nav_hunt_rough_default_24.svg
        icon_nav_hunt_rough_active_24.svg
        icon_nav_rank_rough_default_24.svg
        icon_nav_rank_rough_active_24.svg
        icon_nav_profile_rough_default_24.svg
        icon_nav_profile_rough_active_24.svg

    ui/
      frames/
        button/
          ui_frame_button_hunt_join_rough_default.svg
```

### 9.13.2 코드에서 사용할 에셋 상수

```ts
export const HOME_ASSETS = {
  minimap: '/assets/illustrations/map/illust_map_home_minimap_rough_default.svg',
  treasureChestIcon: '/assets/icons/treasure/icon_treasure_chest_rough_default_32.svg',
  gnbNotification: '/assets/icons/gnb/icon_gnb_notification_rough_default_24.svg',
  gnbHelp: '/assets/icons/gnb/icon_gnb_help_rough_default_24.svg',
  gnbSetting: '/assets/icons/gnb/icon_gnb_setting_rough_default_24.svg',
  ctaFrame: '/assets/ui/frames/button/ui_frame_button_hunt_join_rough_default.svg',
} as const;
```

하단 네비게이션 아이콘은 전역 nav asset 상수에서 관리해도 된다.

```ts
export const NAV_ASSETS = {
  mapDefault: '/assets/icons/navigation/icon_nav_map_rough_default_24.svg',
  mapActive: '/assets/icons/navigation/icon_nav_map_rough_active_24.svg',
  huntDefault: '/assets/icons/navigation/icon_nav_hunt_rough_default_24.svg',
  huntActive: '/assets/icons/navigation/icon_nav_hunt_rough_active_24.svg',
  rankDefault: '/assets/icons/navigation/icon_nav_rank_rough_default_24.svg',
  rankActive: '/assets/icons/navigation/icon_nav_rank_rough_active_24.svg',
  profileDefault: '/assets/icons/navigation/icon_nav_profile_rough_default_24.svg',
  profileActive: '/assets/icons/navigation/icon_nav_profile_rough_active_24.svg',
} as const;
```

### 9.13.3 텍스트 상수

```ts
export const HOME_COPY = {
  title: '근처에 뭐 좀 숨겨놨다.',
  subtitle: '지도 열고 근처 보물부터 뒤져봐.',
  minimapCta: '지도 뒤지러 가기',
  nearbySectionTitle: '근처 보물상자',
  recentSectionTitle: '최근 탐색 기록',
  huntCta: '사냥 합류하기',
} as const;
```

---

## 9.14 구현 방식

### 9.14.1 미니맵 카드 구현

홈 미니맵은 정적 스케치 이미지 에셋을 사용한다.

```tsx
<div className="relative overflow-hidden rounded-none border-0">
  <img
    src={HOME_ASSETS.minimap}
    alt=""
    aria-hidden="true"
    className="h-full w-full object-cover"
  />

  <button className="absolute bottom-4 right-4">
    지도 뒤지러 가기 →
  </button>
</div>
```

구현 원칙:

- 미니맵 이미지는 분위기용 장식이므로 `aria-hidden="true"` 처리한다.
- 실제 지도 정보는 `/map` 화면에서 제공한다.
- CTA 버튼에는 `aria-label="지도 화면으로 이동"`을 제공한다.
- 미니맵 이미지 안에 텍스트를 포함하지 않는다.
- 미니맵 CTA는 이미지에 포함하지 않고 실제 button/link로 구현한다.

### 9.14.2 하단 CTA 구현

하단 CTA는 공통 rough button frame을 사용한다.

```tsx
<button className="relative h-14 w-full">
  <img
    src={HOME_ASSETS.ctaFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <span className="relative z-10 text-white">
    사냥 합류하기 →
  </span>
</button>
```

### 9.14.3 근처 보물 카드 구현

근처 보물 카드는 이미지가 아니라 CSS 카드로 구현한다.  
좌측 아이콘만 SVG 에셋을 사용한다.

```txt
card = CSS rough border
icon = icon_treasure_chest_rough_default_32.svg
text = code text
button = HTML button/link
```

---


## 10. UI 구성 요소

## 10.1 Top App Bar

### 구성

| 영역 | 요소 |
|---|---|
| 좌측 | 앱 로고 / CATCHCASH 텍스트 |
| 우측 | 알림, 도움말, 설정 아이콘 |

### 로고

| 항목 | 정의 |
|---|---|
| 텍스트 | `CATCHCASH` |
| Font | Plus Jakarta Sans |
| Weight | 700 |
| Color | `primary` |
| 아이콘 | 선택적으로 심볼 사용 |

### 우측 아이콘

| 아이콘 | 액션 |
|---|---|
| 알림 | 알림 화면 또는 준비중 토스트 |
| 도움말 | 도움말 화면 또는 준비중 토스트 |
| 설정 | 프로필/설정 화면 이동 |

### 정책

- Top App Bar는 홈 화면 상단에 항상 노출한다.
- 우측 아이콘은 3개 이하로 유지한다.
- 아이콘 터치 영역은 최소 44px 이상이어야 한다.

---

## 10.2 인사말 카드

### 목적

사용자에게 개인화된 환영 메시지와 오늘의 탐색 유도를 제공한다.

### 구성

| 요소 | 설명 |
|---|---|
| 메인 문구 | `반가워요, {nickname}님!` |
| 서브 문구 | `오늘의 보물은 어디 있을까요?` |
| 우측 아이콘 | 프로필 또는 탐험 아이콘 |

### 데이터

| 데이터 | 출처 |
|---|---|
| nickname | `profiles.nickname` |
| avatar_url | `profiles.avatar_url` 선택 |

### 상태별 문구

| 상태 | 문구 |
|---|---|
| 닉네임 있음 | `반가워요, {nickname}님!` |
| 닉네임 없음 | `/nickname`으로 이동해야 하므로 홈 노출 불가 |
| 보물 있음 | `오늘의 보물은 어디 있을까요?` |
| 보물 없음 | `오늘은 아직 열린 보물이 없어요.` |

---

## 10.3 보물 탐색 히어로 카드

### 목적

메인 홈에서 가장 중요한 탐색 진입 영역이다.  
사용자가 주변 보물을 찾기 위해 `사냥하기`를 누르도록 유도한다.

### 구성

| 요소 | 설명 |
|---|---|
| 배경 | 일러스트형 맵 또는 단순 지도 미리보기 |
| 내 위치 표시 | 현재 위치를 상징하는 마커 |
| 보물 힌트 표시 | 주변 보물 존재 여부 |
| 메인 CTA | `사냥하기` |

### 디자인 정책

- 예시 화면처럼 지도형 일러스트 또는 지도 미리보기 형태를 사용할 수 있다.
- MVP에서는 실제 네이버 지도 대신 정적 일러스트형 히어로를 사용할 수 있다.
- 실제 위치 기반 정밀 탐색은 지도 상세 화면에서 담당한다.
- 홈의 히어로는 탐색 진입용으로만 사용한다.

### 데이터

| 데이터 | 설명 |
|---|---|
| currentLocation | 현재 사용자 좌표 |
| nearestTreasure | 가장 가까운 활성 보물 |
| activeTreasureCount | 현재 활성 보물 수 |

---

## 10.4 사냥하기 CTA

### 버튼 정의

| 항목 | 값 |
|---|---|
| 텍스트 | `사냥하기` |
| 위치 | 히어로 카드 내부 또는 바로 아래 |
| Shape | `rounded-full` |
| Height | 48px~56px |
| Background | `primary` |
| Text Color | `#FFFFFF` |
| Icon | 선택적으로 보물/사냥 아이콘 사용 |

### 클릭 시 정책

사냥하기 버튼은 사용자의 현재 상황에 따라 다른 화면으로 이동한다.

| 조건 | 처리 |
|---|---|
| 위치 권한 없음 | 위치 권한 요청 안내 |
| 위치 확인 중 | 로딩 표시 |
| 주변 보물 있음 | 지도 상세 화면 이동 |
| 선택된 보물 있음 + 거리 조건 충족 | AR 가이드 화면 이동 가능 |
| 주변 보물 없음 | 보물 없음 안내 토스트 또는 지도 화면 이동 |
| 정지 계정 | 앱 이용 제한 안내 |

MVP 권장:

```txt
사냥하기 클릭
→ 위치 권한 확인
→ 현재 위치 확인
→ 지도 상세 화면 이동
```

AR 진입은 지도 상세 또는 힌트 바텀시트에서 거리 조건 확인 후 진행한다.

---

## 10.5 가까운 보물 상자 섹션

### 목적

현재 위치 기준으로 가까운 보물상자를 목록 형태로 보여준다.

### 구성

| 요소 | 설명 |
|---|---|
| 섹션 타이틀 | `가까운 보물 상자` |
| 전체보기 | 지도 상세 화면 이동 |
| 필터 칩 | 거리/전체/내 주변 등 |
| 보물 카드 리스트 | 가까운 보물 2~5개 노출 |

### 필터 칩

권장 필터:

| 칩 | 조건 |
|---|---|
| 내 주변 | 현재 위치 기준 가까운 순 |
| 500m | 500m 이내 보물 |
| 전체 | 활성 보물 전체 |
| 진행중 | status = active |

### 데이터 조회 기준

```txt
treasure_boxes.status = active
starts_at <= now
ends_at >= now
deleted_at is null
current_claim_count < max_claim_count
```

### 정렬 기준

```txt
distance_m ASC
```

---

## 10.6 보물 카드

### 카드 구성

| 요소 | 설명 |
|---|---|
| 아이콘 | 보물상자 또는 등급 아이콘 |
| 보물명 | `title` |
| 거리 | 현재 위치 기준 거리 |
| 정보 보기 버튼 | 힌트 바텀시트 또는 지도 상세 이동 |
| 상태 배지 | 선택 사항 |

### 예시 문구

```txt
Gold Box
약 50m 거리
정보 보기
```

### 카드 클릭 정책

| 액션 | 처리 |
|---|---|
| 카드 전체 클릭 | 지도 상세 화면에서 해당 보물 선택 |
| 정보 보기 클릭 | 힌트 바텀시트 열기 |
| 거리 조건 충족 | 바텀시트에서 사냥하기 활성화 |
| 마감된 보물 | 목록에서 제외 또는 비활성 표시 |

### 상태값

| 상태 | 노출 |
|---|---|
| active | 정상 노출 |
| closed | 비노출 또는 마감 표시 |
| expired | 비노출 |
| draft | 비노출 |
| deleted | 비노출 |

---

## 10.7 탐험 로그 카드

### 목적

사용자의 최근 획득/탐색 기록을 요약해서 보여준다.

### 구성

| 요소 | 설명 |
|---|---|
| 섹션 타이틀 | `탐험 로그` |
| 로그 아이콘 | 획득/실패/이동 등 |
| 시간 | 로그 발생 시간 |
| 내용 | 획득한 보물 또는 상태 |

### 데이터

| 데이터 | 출처 |
|---|---|
| 최근 획득 기록 | `treasure_claims` |
| 보물 제목 | `treasure_boxes.title` |
| 획득 시간 | `treasure_claims.claimed_at` |

### 표시 기준

- 최근 2~3개만 표시한다.
- 데이터가 없으면 빈 상태를 표시한다.

빈 상태 문구:

```txt
아직 탐험 기록이 없어요.
첫 보물을 찾아보세요.
```

---

## 10.8 Bottom Navigation

### 탭 구성

| 탭 | Route | 설명 |
|---|---|---|
| 지도 | `/home` 또는 `/map` | 홈/지도 진입 |
| 사냥하기 | `/map` 또는 `/ar-guide` | 보물 탐색 진입 |
| 명예전당 | `/hall-of-fame` | 랭킹 화면 |
| 내정보 | `/profile` | 프로필 화면 |

### 현재 활성 탭

메인 홈에서는 `지도` 또는 `홈` 탭을 활성 상태로 표시한다.

### 정책

- 하단 네비게이션은 항상 화면 하단에 고정한다.
- 네비게이션 위로 콘텐츠가 가려지지 않도록 padding-bottom을 적용한다.
- 사냥하기 탭은 앱의 핵심 액션으로 시각적 강조가 가능하다.

---

## 11. 화면 상태

### 11.1 상태 목록

```ts
type HomeStatus =
  | 'initial'
  | 'loading'
  | 'ready'
  | 'location_permission_required'
  | 'location_loading'
  | 'empty_treasures'
  | 'error';
```

### 11.2 상태별 UI

| 상태 | UI 처리 |
|---|---|
| `initial` | 화면 초기 진입 |
| `loading` | 프로필/보물 데이터 로딩 |
| `ready` | 정상 화면 표시 |
| `location_permission_required` | 위치 권한 요청 안내 |
| `location_loading` | 현재 위치 확인 중 |
| `empty_treasures` | 주변 보물 없음 상태 |
| `error` | 재시도 가능한 오류 상태 |

---

## 12. 데이터 요구사항

### 12.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| Supabase Auth Session | 현재 로그인 사용자 확인 |
| profiles | 닉네임, 프로필 이미지, 계정 상태 |
| treasure_boxes | 활성화된 보물상자 목록 |
| treasure_rewards | 보물에 연결된 보상 정보 |
| giftishow_products | 상품명/브랜드/이미지 표시용. 쿠폰 발급 아님 |
| treasure_claims | 탐험 로그 표시용 |
| current location | 거리 계산용 현재 위치 |

### 12.2 쓰는 데이터

메인 홈 화면에서는 원칙적으로 주요 데이터를 생성하지 않는다.

단, 아래 데이터는 선택적으로 업데이트할 수 있다.

| 데이터 | 설명 |
|---|---|
| profiles.last_active_at | 앱 활성 시간 업데이트 |
| local UI state | 선택 필터, 임시 선택 보물 |
| locationStore | 현재 위치 캐시 |

### 12.3 생성하지 않는 데이터

메인 홈 화면에서는 아래 데이터를 생성하지 않는다.

- treasure_claims
- inventory_items
- giftishow_issues
- security_logs
- giftishow coupon code

---

## 13. 데이터 조회 정책

### 13.1 프로필 조회

```txt
profiles.auth_user_id = auth.user.id
```

필수 필드:

```txt
id
nickname
avatar_url
status
terms_agreed_at
last_active_at
```

### 13.2 활성 보물상자 조회

조회 조건:

```txt
status = active
starts_at <= now
ends_at >= now
deleted_at is null
current_claim_count < max_claim_count
```

정렬:

```txt
distance_m ASC
```

거리 계산:

```txt
현재 위치와 treasure_boxes latitude/longitude 기준 계산
```

### 13.3 탐험 로그 조회

조회 조건:

```txt
treasure_claims.user_id = currentUser.id
claim_status = success
```

정렬:

```txt
claimed_at DESC
```

표시 개수:

```txt
최근 2~3개
```

---

## 14. 위치 권한 정책

### 14.1 위치 권한 사용 목적

메인 홈에서 위치 정보는 주변 보물상자와의 거리 표시 및 가까운 보물 정렬을 위해 사용한다.

### 14.2 권한 요청 시점

MVP 권장 정책:

```txt
홈 진입 즉시 강제 요청하지 않는다.
사냥하기 클릭 또는 가까운 보물 조회 필요 시 요청한다.
```

권한 요청을 홈 진입 즉시 실행할 경우 사용자 이탈이 발생할 수 있으므로, 명확한 행동 이후 요청하는 방식을 권장한다.

### 14.3 위치 권한 없음 상태

문구 예시:

```txt
주변 보물을 찾으려면 위치 권한이 필요해요.
```

CTA:

```txt
위치 권한 허용하기
```

### 14.4 위치 확인 실패

| 상황 | 처리 |
|---|---|
| 권한 거부 | 권한 안내 표시 |
| 위치 획득 실패 | 재시도 버튼 표시 |
| 고정밀 위치 불가 | 대략 위치 기준 또는 안내 표시 |
| 네트워크 오류 | 재시도 안내 |

---

## 15. 사용자 액션

### 15.1 사냥하기 클릭

```txt
사냥하기 클릭
→ 위치 권한 상태 확인
→ 위치 권한 없으면 안내
→ 위치 권한 있으면 현재 위치 조회
→ 지도 상세 화면 이동
```

### 15.2 가까운 보물 카드 클릭

```txt
보물 카드 클릭
→ 선택한 treasure_box_id 저장
→ 지도 상세 화면으로 이동
→ 해당 보물 핀 또는 힌트 바텀시트 표시
```

### 15.3 정보 보기 클릭

```txt
정보 보기 클릭
→ 선택한 treasure_box_id 저장
→ 힌트 바텀시트 열기
```

### 15.4 전체보기 클릭

```txt
전체보기 클릭
→ 지도 상세 화면 이동
```

### 15.5 필터 칩 클릭

```txt
필터 칩 클릭
→ 선택 필터 상태 업데이트
→ 보물 목록 재정렬 또는 재조회
```

### 15.6 하단 탭 클릭

각 탭에 해당하는 route로 이동한다.

---

## 16. 예외 처리

### 16.1 세션 없음

| 상황 | 처리 |
|---|---|
| Supabase session 없음 | 로그인 화면 이동 |
| 메시지 | 다시 로그인해주세요. |

### 16.2 프로필 미완성

| 상황 | 처리 |
|---|---|
| nickname 없음 | 닉네임/약관 화면 이동 |
| terms_agreed_at 없음 | 닉네임/약관 화면 이동 |

### 16.3 위치 권한 거부

| 상황 | 처리 |
|---|---|
| 사용자가 위치 권한 거부 | 권한 안내 UI 표시 |
| 사냥하기 클릭 | 권한 필요 안내 유지 |
| 설정 이동 | OS 설정 안내 가능 |

### 16.4 주변 보물 없음

| 상황 | 처리 |
|---|---|
| 활성 보물 없음 | 빈 상태 표시 |
| 주변 거리 내 보물 없음 | 전체보기 또는 지도 보기 유도 |

문구 예시:

```txt
지금 주변에는 열린 보물이 없어요.
조금 뒤에 다시 확인해보세요.
```

### 16.5 데이터 로딩 실패

| 상황 | 처리 |
|---|---|
| Supabase 조회 실패 | 오류 상태 표시 |
| 지도/거리 계산 실패 | 목록은 표시하되 거리 정보 숨김 가능 |
| Realtime 연결 실패 | 일반 조회 데이터 유지 |

---

## 17. 기프티쇼비즈 정책과의 관계

메인 홈 화면은 기프티쇼비즈 API와 직접 연결되지 않는다.

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
관리자에서 보물상자에 기프티쇼비즈 상품 연결
→ 유저가 보물 획득
→ 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

따라서 메인 홈 화면에서는 아래 작업을 하지 않는다.

- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 조회
- 쿠폰 코드 표시
- 쿠폰 사용 처리
- 발급 실패 재시도
- 취소/재발송 처리

단, 보물 카드에 연결된 상품명 또는 브랜드명은 `giftishow_products` 데이터를 통해 표시할 수 있다.

---

## 18. 보안 및 정책

- 로그인 사용자의 데이터만 조회한다.
- 정지 계정은 홈 화면에 진입할 수 없다.
- 현재 위치는 보물 거리 계산에만 사용한다.
- 위치 정보는 불필요하게 저장하지 않는다.
- 보물상자 좌표는 활성 상태인 항목만 노출한다.
- 관리자용 데이터는 홈 화면에서 조회하지 않는다.
- 기프티콘 코드 및 API 응답값은 절대 홈 화면에서 조회하지 않는다.

---

## 19. 접근성

### 19.1 터치 영역

- 모든 버튼과 탭은 최소 44px 이상의 터치 영역을 가진다.
- 보물 카드와 정보 보기 버튼의 터치 영역이 겹치지 않아야 한다.

### 19.2 텍스트

- 거리, 상태, 버튼명은 텍스트로 명확히 표시한다.
- 아이콘만으로 의미를 전달하지 않는다.

### 19.3 빈 상태

- 보물이 없거나 위치 권한이 없을 때 명확한 안내 문구와 다음 행동을 제공한다.

---

## 20. 구현 컴포넌트 제안

### 20.1 화면 컴포넌트

```txt
MainHomePage
```

### 20.2 하위 컴포넌트

```txt
HomeTopAppBar
GreetingCard
TreasureHeroCard
HuntCTAButton
NearbyTreasureSection
TreasureFilterChips
TreasureListCard
ExplorationLogCard
BottomNavigation
LocationPermissionNotice
HomeEmptyState
HomeErrorState
```

### 20.3 훅

```txt
useHomeProfile
useCurrentLocation
useNearbyTreasures
useTreasureDistance
useExplorationLogs
useHomeNavigation
```

### 20.4 유틸

```txt
calculateDistanceMeters
formatDistance
formatRelativeTime
filterActiveTreasures
sortTreasuresByDistance
```

---

## 21. 권장 파일 구조

```txt
app/
  home/
    page.tsx

features/
  home/
    components/
      HomeTopAppBar.tsx
      GreetingCard.tsx
      TreasureHeroCard.tsx
      NearbyTreasureSection.tsx
      TreasureListCard.tsx
      ExplorationLogCard.tsx
      HomeEmptyState.tsx
      HomeErrorState.tsx
    hooks/
      useHomeProfile.ts
      useNearbyTreasures.ts
      useExplorationLogs.ts
    services/
      home.service.ts
    types/
      home.types.ts

components/
  navigation/
    BottomNavigation.tsx

stores/
  auth.store.ts
  location.store.ts
  treasure.store.ts

constants/
  routes.ts
  homeAssets.ts
  homeCopy.ts
  navAssets.ts
  treasureStatus.ts

lib/
  supabase/
    client.ts
```

---

## 22. TypeScript 타입 제안

### 22.1 화면 상태

```ts
export type HomeStatus =
  | 'initial'
  | 'loading'
  | 'ready'
  | 'location_permission_required'
  | 'location_loading'
  | 'empty_treasures'
  | 'error';
```

### 22.2 보물상자 타입

```ts
export type TreasureStatus =
  | 'draft'
  | 'active'
  | 'closed'
  | 'expired'
  | 'deleted';

export type NearbyTreasure = {
  id: string;
  title: string;
  description?: string | null;
  hint?: string | null;
  latitude: number;
  longitude: number;
  radius_m: number;
  status: TreasureStatus;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  current_claim_count: number;
  distance_m?: number;
  reward_name?: string;
  brand_name?: string;
};
```

### 22.3 탐험 로그 타입

```ts
export type ExplorationLog = {
  id: string;
  treasure_box_id: string;
  treasure_title: string;
  claim_status: 'success';
  claimed_at: string;
};
```

### 22.4 위치 타입

```ts
export type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  captured_at: string;
};
```

---

## 23. 완료 기준

### 23.1 UI 완료 기준

- [ ] `/home` route에서 메인 홈 화면이 렌더링된다.
- [ ] 상단 앱바가 표시된다.
- [ ] 앱 로고 또는 브랜드명이 표시된다.
- [ ] 알림/도움말/설정 아이콘이 표시된다.
- [ ] 인사말 카드가 표시된다.
- [ ] 사용자의 닉네임이 인사말에 반영된다.
- [ ] 보물 탐색 히어로 카드가 표시된다.
- [ ] 사냥하기 CTA가 표시된다.
- [ ] 가까운 보물 상자 섹션이 표시된다.
- [ ] 필터 칩이 표시된다.
- [ ] 보물 카드 리스트가 표시된다.
- [ ] 탐험 로그 카드가 표시된다.
- [ ] 하단 네비게이션이 표시된다.
- [ ] 하단 네비게이션 아이콘 에셋이 정의된 네이밍 규칙을 따른다.
- [ ] 현재 탭이 활성 상태로 표시된다.
- [ ] 전체 화면이 글로벌 디자인 토큰을 따른다.

### 23.2 기능 완료 기준

- [ ] 인증 세션이 없으면 로그인 화면으로 이동한다.
- [ ] 프로필이 미완성이면 닉네임/약관 화면으로 이동한다.
- [ ] 프로필 정보를 조회해 닉네임을 표시한다.
- [ ] 활성 보물상자 목록을 조회한다.
- [ ] 현재 위치를 기준으로 보물 거리 표시가 가능하다.
- [ ] 사냥하기 클릭 시 위치 권한 확인 또는 지도 상세 화면 이동이 동작한다.
- [ ] 정보 보기 클릭 시 선택한 보물 정보가 전달된다.
- [ ] 전체보기 클릭 시 지도 상세 화면으로 이동한다.
- [ ] 필터 칩 클릭 시 목록이 필터링된다.
- [ ] 탐험 로그가 최신순으로 표시된다.
- [ ] 주변 보물이 없을 때 빈 상태가 표시된다.
- [ ] 데이터 조회 실패 시 오류 상태가 표시된다.

### 23.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] Tailwind CSS 디자인 토큰을 사용한다.
- [ ] Supabase Auth session을 확인한다.
- [ ] Supabase에서 profile 데이터를 조회한다.
- [ ] Supabase에서 treasure_boxes 데이터를 조회한다.
- [ ] Capacitor Geolocation 또는 위치 유틸이 적용되어 있다.
- [ ] 전역 location store 또는 query cache가 적용되어 있다.
- [ ] 보물상자 거리 계산 유틸이 구현되어 있다.
- [ ] 하단 네비게이션 route constants를 사용한다.

### 23.4 제외 기능 확인

- [ ] 카메라 권한 요청이 없다.
- [ ] WebAR 화면이 실행되지 않는다.
- [ ] R3F 3D 렌더링이 없다.
- [ ] 기프티쇼비즈 API 호출이 없다.
- [ ] 쿠폰 코드 조회가 없다.
- [ ] 쿠폰 발급 로직이 없다.
- [ ] 관리자 기능이 없다.
- [ ] 보물상자 생성/수정 기능이 없다.

---

## 24. 제외 범위

이 화면에서는 아래 기능을 구현하지 않는다.

- AR 카메라 실행
- 3D 보물상자 렌더링
- 카메라 권한 요청
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 보관함 상세 보기
- 보상 사용 완료 처리
- 관리자 보물상자 등록
- 관리자 상품 연결
- 관리자 발급 이력 조회
- 보물 획득 RPC 호출
- 선착순 획득 처리
- 치팅 로그 생성

---

## 25. 개발자 주의사항

- 메인 홈은 탐색 허브 화면이며, 정밀 탐색은 지도 상세 화면에서 처리한다.
- AR 진입은 홈에서 바로 실행하지 않는 것을 기본 정책으로 한다.
- 사냥하기 클릭 시 우선 지도 상세로 이동해 거리 조건을 확인한다.
- 위치 권한은 홈 진입 즉시 강제 요청하지 않는 것을 권장한다.
- 위치 정보가 없어도 기본 홈 화면은 표시되어야 한다.
- 보물 거리는 위치 권한이 있을 때만 표시한다.
- 마감/만료/삭제된 보물은 홈 목록에 노출하지 않는다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
- 쿠폰 발급은 유저가 보관함에서 쿠폰 받기를 실행하는 시점에 처리한다.
- 관리자에서 연결한 기프티쇼 상품 정보는 상품명/브랜드 표시용으로만 사용할 수 있다.
- 보상 수령권 생성은 AR 획득 성공 이후 별도 흐름에서 처리한다.


---

## 99. 디자인 반영 개발자 주의사항

- 홈 미니맵은 실제 네이버 지도 API가 아니라 스케치형 미리보기 에셋을 사용한다.
- `illust_map_home_minimap_rough_default.svg` 안에는 지도 라인, 내 위치 핀, 보물 핀만 포함한다.
- `지도 뒤지러 가기 →` 텍스트와 버튼 클릭 영역은 이미지에 포함하지 않고 코드로 구현한다.
- 검정색 `사냥 합류하기` CTA는 공통 에셋 `ui_frame_button_hunt_join_rough_default.svg`를 재사용한다.
- 근처 보물상자 카드 전체를 이미지로 만들지 않는다.
- 보물명, 위치, 거리, 남은 수량, 정보보기 버튼은 모두 코드 텍스트/컴포넌트로 구현한다.
- 최근 탐색 기록은 실제 데이터 바인딩이 필요하므로 이미지로 만들지 않는다.
- 하단 탭바 구조는 React 컴포넌트로 구현하고, 아이콘만 SVG 에셋으로 사용한다.
