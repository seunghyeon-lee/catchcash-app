# 06. 보물 힌트 팝업 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 06. 보물 힌트 팝업 화면 정의서 |
| 파일명 | `06_Treasure_Hint_Bottom_Sheet.md` |
| 화면명 | 보물 힌트 팝업 화면 |
| 화면 ID | `06_Treasure_Hint_Bottom_Sheet` |
| 연결 화면 | `05_Map_Detail_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 지도 상세 화면에서 보물상자 마커 선택 시 노출되는 힌트 팝업 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 지도 기준 | Naver Maps JavaScript API |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 힌트 팝업 최종 시안 기준 / 거리 계산 프레임 분리 / 게이지 프레임 분리 / 하단 문구는 버튼 아님 |
| 주요 기능 | 보물 정보 표시, 거리 표시, 힌트 제공, 사냥 가능 여부 판단, AR 가이드 진입 |

---

## 2. 화면 개요

보물 힌트 팝업 화면은 지도 상세 화면에서 사용자가 보물상자 마커를 선택했을 때 노출되는 레이어형 바텀시트 또는 팝업이다.

Stitch AI 시안 기준으로 이 화면은 맵 상세 화면 위에 뜨는 **중앙 카드형 오버레이 팝업**으로 구성한다.  
팝업 본체, 거리 게이지, CTA 버튼은 rough frame SVG 에셋을 사용하고, 모든 텍스트와 실제 클릭/입력 동작은 코드로 구현한다.

이 팝업은 선택한 보물상자의 이름, 위치 힌트, 현재 거리, 사냥 가능 여부를 표시한다.  
사용자가 보물상자 근처로 이동해 사냥 가능 반경에 들어오면 `사냥하기` 버튼을 통해 AR 가이드 화면으로 이동할 수 있다.

이 화면은 실제 보상을 지급하거나 쿠폰을 발급하는 화면이 아니다.  
보상 획득 전, 사용자가 보물상자 위치를 찾도록 돕는 탐색 보조 화면이다.

---

## 3. 화면 목적

### 핵심 목적

- 선택한 보물상자의 상세 정보를 보여준다.
- 현재 위치와 보물상자 간 거리를 표시한다.
- 보물상자 힌트를 제공한다.
- 사용자가 사냥 가능 반경에 들어왔는지 알려준다.
- 사냥 가능 조건 충족 시 AR 가이드 화면으로 이동할 수 있게 한다.

### 사용자 관점 목적

- 내가 선택한 보물이 어떤 보물인지 확인한다.
- 보물까지 얼마나 떨어져 있는지 확인한다.
- 힌트를 보고 실제 위치를 추리한다.
- 가까이 도착했을 때 사냥을 시작한다.

---

## 4. 기술 구현 기준

### 4.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ Map Detail Screen
→ Treasure Hint Bottom Sheet
```

### 4.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 지도 | Naver Maps JavaScript API |
| 위치 | Capacitor Geolocation |

### 4.3 데이터 및 상태

| 항목 | 기술 |
|---|---|
| 인증 | Supabase Auth |
| 보물상자 데이터 | Supabase PostgreSQL `treasure_boxes` |
| 보물-상품 연결 | Supabase PostgreSQL `treasure_rewards` |
| 상품 표시 정보 | Supabase PostgreSQL `giftishow_products` |
| 현재 위치 | Capacitor Geolocation |
| 서버 상태 캐싱 | TanStack Query 권장 |
| 선택 보물 상태 | Zustand 또는 local component state |
| 실시간 상태 반영 | Supabase Realtime 선택 적용 |

### 4.4 외부 연동

| 항목 | 사용 여부 | 설명 |
|---|---:|---|
| Naver Maps JavaScript API | 간접 사용 | 지도 상세 화면 위에 오버레이로 표시 |
| Capacitor Geolocation | 사용 | 현재 위치 재확인 및 거리 계산 |
| Supabase | 사용 | 선택 보물 정보 조회 |
| Supabase Realtime | 선택 | 마감/삭제 상태 실시간 반영 |
| 기프티쇼비즈 API | 미사용 | 이 화면에서는 쿠폰 발급하지 않음 |

### 4.5 이 화면에서 사용하지 않는 기능

- 카메라 권한 요청
- WebAR 실행
- R3F 3D 렌더링
- 보물 획득 RPC 호출
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 보관함 쿠폰 받기
- 관리자 보물상자 생성/수정

---

## 5. 지도 상세 화면과의 관계

이 팝업은 독립 페이지가 아니라 지도 상세 화면 위에 표시되는 레이어 컴포넌트다.

```txt
지도 상세 화면
→ 보물상자 마커 클릭
→ selectedTreasureId 저장
→ 보물 힌트 팝업 오픈
```

### 전달받는 데이터

```txt
treasure_box_id
current_user_location
distance_m
treasure_status
```

### 반환 또는 변경하는 상태

```txt
isBottomSheetOpen
selectedTreasureId
selectedTreasureDistance
isHuntable
```

---

## 6. 진입 조건

### 6.1 진입 시점

사용자는 아래 상황에서 보물 힌트 팝업을 보게 된다.

| 상황 | 설명 |
|---|---|
| 지도 상세 화면에서 보물 마커 클릭 | 기본 진입 |
| 메인 홈 보물 카드의 정보 보기 클릭 | 특정 보물 선택 후 팝업 오픈 |
| 알림에서 보물 관련 항목 클릭 | 특정 보물 위치로 이동 후 팝업 오픈 |
| `/map?treasureId=` 진입 | 특정 보물 선택 상태로 지도 진입 |

### 6.2 필수 조건

```txt
Supabase session 존재
profiles.status = active
treasure_box_id 존재
선택한 보물상자 status = active
deleted_at is null
```

### 6.3 Route

팝업 자체는 별도 route를 가지지 않는다.

기본 화면:

```txt
/map
```

특정 보물 선택 진입:

```txt
/map?treasureId={treasure_box_id}
```

---

## 7. 종료 및 이동 규칙

| 사용자 액션 | 처리 |
|---|---|
| 닫기 버튼 클릭 | 팝업 닫기, 지도 화면 유지 |
| 바텀시트 아래로 스와이프 | 팝업 닫기 |
| 딤 영역 클릭 | 팝업 닫기 |
| Android 뒤로가기 | 팝업 먼저 닫기 |
| 사냥하기 클릭 + 20m 이내 | AR 가이드 화면 이동 |
| 사냥하기 클릭 + 20m 초과 | 더 가까이 이동 안내 |
| 보물 마감 감지 | 팝업 상태 변경 후 사냥 불가 처리 |

### 7.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 지도 상세 | `05_Map_Detail_Screen` | `/map` |
| AR 가이드 | `07_AR_Guide_Screen` | `/ar-guide` |

### 7.2 AR 가이드 이동 시 전달 데이터

```txt
treasure_box_id
current_latitude
current_longitude
distance_m
```

권장 query 또는 state:

```txt
/ar-guide?treasureId={treasure_box_id}
```

---

## 8. 화면 레이아웃

### 8.1 전체 구조

```txt
┌──────────────────────────────┐
│            지도 화면           │
│                              │
│ ┌──────────────────────────┐ │
│ │        drag handle        │ │
│ │ 골드 보물상자 #1       X  │ │
│ │ 신사역 근처 어딘가... RARE │ │
│ │                          │ │
│ │ [현재 보물과 거리 카드]    │ │
│ │  현재 보물과 700m 떨어짐   │ │
│ │  0m ━━━━━●──── TARGET     │ │
│ │                          │ │
│ │ [힌트 카드]               │ │
│ │ HINT #1                  │ │
│ │ “태극기가 보인다”          │ │
│ │ “시선을 위쪽으로...”       │ │
│ │                          │ │
│ │ [사냥하기 또는 안내 문구]   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### 8.2 레이아웃 원칙

- 지도 상세 화면 위에 오버레이로 표시한다.
- 모바일에서는 하단 바텀시트 형태를 기본으로 한다.
- 화면 높이에 따라 내부 스크롤이 가능해야 한다.
- 닫기 버튼은 우측 상단에 배치한다.
- 보물 정보, 거리 카드, 힌트 카드, CTA 순서로 구성한다.
- 하단 네비게이션과 겹치지 않도록 safe area를 고려한다.

---

## 9. 디자인 시스템 적용

### 9.1 디자인 방향

보물 힌트 팝업은 탐색 중인 사용자가 빠르게 정보를 확인해야 하는 화면이다.  
지도 위에 떠 있는 레이어이므로 명확한 대비, 큰 터치 영역, 읽기 쉬운 카드 구조를 사용한다.

첨부 예시 화면은 구조 참고용이며, 색상과 상세 디자인은 글로벌 모노톤 디자인 토큰을 따른다.

디자인 키워드:

```txt
Monotone
Minimal
Rounded
Readable
Layer
Map Overlay
Hunt Ready
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
| Background | `background` | `#F7F5EF` |
| Surface | `surface` | `#FFFFFF` |
| Border | `border` | `#000000` |
| Disabled | `disabled` | `#C9C9C9` |
| Error | `error` | `#E5484D` |
| Success | `success` | `#000000` |

### 9.4 Shape Token

| 요소 | Radius |
|---|---|
| 바텀시트 컨테이너 | `rounded-t-3xl` |
| 모달형 팝업 사용 시 | `rounded-3xl` |
| 거리 카드 | `rounded-2xl` |
| 힌트 카드 | `rounded-2xl` |
| 상태 배지 | `rounded-full` |
| 사냥하기 버튼 | `rounded-full` |
| 닫기 버튼 | `rounded-full` |

---

---

## 9.10 Stitch AI 디자인 결과 반영

### 9.10.1 확정된 화면 구조

Stitch AI 재정의 시안 기준 힌트 팝업은 아래 구조를 따른다.

```txt
지도 상세 화면 배경
→ 배경 dim 또는 흐림 처리
→ 중앙 힌트 팝업 카드
   → 보물명 / 지역
   → 닫기 버튼
   → 거리 게이지 카드
   → 힌트 카드
   → 하단 안내 문구
   → 하단 강조 문구 영역
```

중요:

```txt
하단 검정색 영역은 버튼이 아니다.
하단 검정색 영역은 현재 거리 상태를 알려주는 강조 문구 영역이다.
```

### 9.10.2 확정된 화면 카피

| 요소 | 문구 | 구현 방식 |
|---|---|---|
| 보물명 | `수상한 보물상자` | 코드 텍스트 |
| 위치 | `반포한강공원 근처` | 코드 텍스트 |
| 거리 상태 | `아직 멀다. 700m 남았다.` | 코드 텍스트 |
| 거리 시작 라벨 | `0M` | 코드 텍스트 |
| 거리 목표 라벨 | `TARGET (20m)` | 코드 텍스트 |
| 힌트 라벨 | `HINT #1` | 코드 텍스트 |
| 힌트 내용 | `큰 트럭에서 보인다. 시선을 위쪽으로 돌려보세요` | 코드 텍스트 |
| 안내 문구 | `20m 안으로 와야 열린다.` | 코드 텍스트 |
| 하단 강조 문구 | `좀 더 가까이 와라` | 코드 텍스트 |
| 사냥 가능 문구 | `이제 열 수 있다.` | 코드 텍스트 |

### 9.10.3 화면 성격

이 화면은 독립 페이지가 아니라 **맵 상세 화면 위에 떠 있는 오버레이형 팝업**이다.

```txt
05_Map_Detail_Screen
→ 보물 마커 클릭
→ 06_Treasure_Hint_Bottom_Sheet 노출
```

팝업이 떠 있어도 배경에는 흑백 스타일의 Naver Maps 화면이 흐리게 보여야 한다.

---

## 9.11 이미지 에셋 분리 기준

이 화면에서는 팝업의 손그림 외곽 프레임과 버튼/게이지 프레임을 에셋으로 사용한다.  
단, 텍스트와 실제 버튼 동작은 코드로 구현한다.

### 9.11.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 힌트 팝업 본체 프레임 | 필수 | 중앙 카드형 rough popup 재현 |
| 닫기 아이콘 | 필수 | 팝업 닫기 액션 |
| 거리 게이지 프레임 | 필수 | 손그림 거리 progress 영역 재현 |
| 힌트 카드 프레임 | 필수 | 힌트 영역의 꾸불꾸불한 박스 재현 |
| 하단 강조 문구 프레임 | 필수 | 검정 rough 박스 문구 영역 재현 |

### 9.11.2 코드/CSS로 구현할 요소

| 요소 | 구현 방식 |
|---|---|
| 배경 지도 | Naver Maps API |
| 배경 dim/blur | CSS |
| 보물명/위치 텍스트 | 코드 텍스트 |
| 거리 숫자 | 코드 텍스트 |
| progress 채움 | CSS width |
| 0M / TARGET 라벨 | 코드 텍스트 |
| 힌트 문구 | 코드 텍스트 |
| 하단 강조 문구 텍스트 | 코드 텍스트 |
| AR 이동 버튼 | 이 화면에 없음. 사냥 가능 시 별도 정책에 따라 후속 화면/버튼 제공 가능 |
| 사냥 가능 상태 판단 | 로직/RPC 전 단계 validation |

### 9.11.3 중요 원칙

```txt
팝업 전체를 통이미지로 만들지 않는다.
프레임만 SVG 에셋으로 사용한다.
거리/힌트/하단 문구 텍스트는 이미지에 넣지 않는다.
하단 검정색 영역은 button이 아니라 상태 문구 영역이다.
지도 배경은 이미지가 아니라 맵 상세 화면이다.
```

---

## 9.12 에셋 명칭 정의

### 9.12.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `ui_frame_treasure_hint_popup_rough_default.svg` | popup frame | svg | treasure hint popup | 340x460 | 중앙 힌트 팝업 본체 rough frame |
| `icon_action_close_circle_rough_default_24.svg` | action icon | svg | treasure hint popup | 24x24 | 팝업 닫기 원형 X 아이콘 |
| `ui_frame_treasure_distance_info_rough_default.svg` | distance info frame | svg | treasure hint popup | 280x110 | 거리 문구, 게이지, 0M/TARGET 라벨을 감싸는 전체 거리 계산 프레임 |
| `ui_frame_treasure_distance_gauge_rough_default.svg` | distance gauge frame | svg | treasure hint popup | 180x24 | 거리 계산 프레임 내부의 게이지 바 외곽 프레임 |
| `ui_frame_treasure_hint_card_rough_default.svg` | hint card frame | svg | treasure hint popup | 280x96 | 힌트 텍스트 영역 rough frame |
| `ui_frame_treasure_status_message_black_rough_default.svg` | status message frame | svg | treasure hint popup | 300x64 | 하단 검정색 상태 문구 영역 rough frame. 버튼 아님 |


### 9.12.2 선택 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `ui_frame_treasure_hint_card_rough_default.svg` | hint card frame | svg | treasure hint popup | 280x96 | 힌트 텍스트 영역 rough frame |
| `ui_frame_treasure_hint_popup_rough_lg.svg` | popup frame | svg | treasure hint popup | 340x520 | 힌트가 길거나 추가 정보가 많을 때 사용하는 확장 팝업 프레임 |
| `ui_frame_button_hunt_join_rough_disabled.svg` | CTA frame | svg | treasure hint popup | 320x56 | 거리 부족/비활성 CTA 프레임. MVP에서는 default 프레임 + opacity 처리 가능 |

### 9.12.3 하단 검정 영역 정책

하단 검정색 영역은 버튼이 아니므로 기존 공통 CTA 프레임을 재사용하지 않는다.

사용하지 않는 에셋:

```txt
ui_frame_button_hunt_join_rough_default.svg
ui_frame_button_hunt_join_rough_disabled.svg
```

사용하는 에셋:

```txt
ui_frame_treasure_status_message_black_rough_default.svg
```

이 영역은 현재 거리 상태를 강조해서 보여주는 문구 영역이다.  
클릭 기능을 제공하지 않는다.

---

## 9.13 에셋 저장 위치

```txt
public/
  assets/
    icons/
      action/
        icon_action_close_circle_rough_default_24.svg

    ui/
      frames/
        treasure/
          ui_frame_treasure_hint_popup_rough_default.svg
          ui_frame_treasure_distance_info_rough_default.svg
          ui_frame_treasure_distance_gauge_rough_default.svg
          ui_frame_treasure_hint_card_rough_default.svg
          ui_frame_treasure_status_message_black_rough_default.svg
```

---

## 9.14 코드 상수

### 9.14.1 에셋 상수

```ts
export const TREASURE_HINT_ASSETS = {
  popupFrame: '/assets/ui/frames/treasure/ui_frame_treasure_hint_popup_rough_default.svg',
  closeIcon: '/assets/icons/action/icon_action_close_circle_rough_default_24.svg',
  distanceInfoFrame: '/assets/ui/frames/treasure/ui_frame_treasure_distance_info_rough_default.svg',
  distanceGaugeFrame: '/assets/ui/frames/treasure/ui_frame_treasure_distance_gauge_rough_default.svg',
  hintCardFrame: '/assets/ui/frames/treasure/ui_frame_treasure_hint_card_rough_default.svg',
  statusMessageFrame: '/assets/ui/frames/treasure/ui_frame_treasure_status_message_black_rough_default.svg',
} as const;
```

### 9.14.2 문구 상수

```ts
export const TREASURE_HINT_COPY = {
  distanceFar: '아직 멀다.',
  distanceFarMessage: '좀 더 가까이 와라',
  huntReady: '이제 열 수 있다.',
  huntReadyMessage: '이제 열 수 있다.',
  targetLabel: 'TARGET (20m)',
  startLabel: '0M',
  activeGuide: '20m 안으로 와야 열린다.',
  loading: '힌트 뒤지는 중...',
  error: '힌트가 어디 갔다. 다시 눌러봐.',
} as const;
```

---

## 9.15 구현 방식

### 9.15.1 팝업 프레임 구현

```tsx
<div className="fixed inset-0 z-50">
  <div className="absolute inset-0 bg-black/30" />

  <section className="relative mx-auto mt-20 w-[340px]">
    <img
      src={TREASURE_HINT_ASSETS.popupFrame}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />

    <div className="relative z-10 p-6">
      {/* 보물명, 거리, 힌트, CTA */}
    </div>
  </section>
</div>
```

### 9.15.2 거리 계산 영역 구현

거리 계산 영역은 **전체 거리 계산 프레임**과 **게이지 프레임**을 분리해서 구현한다.

```txt
거리 계산 전체 박스 = ui_frame_treasure_distance_info_rough_default.svg
게이지바 외곽 = ui_frame_treasure_distance_gauge_rough_default.svg
게이지 채움 = CSS width
거리 문구 = 코드 텍스트
0M / TARGET 라벨 = 코드 텍스트
```

```tsx
<div className="relative h-[110px] w-full">
  <img
    src={TREASURE_HINT_ASSETS.distanceInfoFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />

  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-5">
    <p className="text-sm font-bold">
      아직 멀다. 700m 남았다.
    </p>

    <div className="relative h-6 w-[180px]">
      <img
        src={TREASURE_HINT_ASSETS.distanceGaugeFrame}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        className="relative z-10 h-full bg-black"
        style={{ width: progressPercent }}
      />
    </div>

    <div className="flex w-[180px] justify-between text-[10px] font-bold">
      <span>0M</span>
      <span>TARGET (20m)</span>
    </div>
  </div>
</div>
```

### 9.15.3 하단 상태 문구 구현

하단 검정색 영역은 버튼이 아니라 상태 문구 영역이다.

```tsx
<div className="relative h-16 w-full" role="status">
  <img
    src={TREASURE_HINT_ASSETS.statusMessageFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <p className="relative z-10 flex h-full items-center justify-center text-white">
    좀 더 가까이 와라
  </p>
</div>
```

### 9.15.4 상태별 하단 문구

| 상태 | 하단 문구 | 클릭 가능 여부 |
|---|---|---|
| 거리 부족 | `좀 더 가까이 와라` | 클릭 불가 |
| 사냥 가능 | `이제 열 수 있다.` | 클릭 불가 |
| 로딩 | `힌트 뒤지는 중...` | 클릭 불가 |
| 오류 | `힌트가 어디 갔다.` | 클릭 불가 |

사냥 가능 상태에서 실제 AR 진입 버튼을 별도로 둘지는 후속 AR 진입 정책에서 결정한다.  
현재 디자인 기준에서는 하단 검정 영역을 CTA 버튼으로 사용하지 않는다.

---

## 9.16 정책 정리

### 9.16.1 거리 기준

MVP 기준 사냥 가능 반경은 20m로 둔다.

```txt
distance_m <= 20
→ 사냥 가능
```

거리 계산과 최종 검증은 클라이언트 표시와 별개로 AR 사냥 진입/클레임 RPC에서 다시 확인한다.

### 9.16.2 이 화면에서 하지 않는 것

```txt
AR 카메라 실행
쿠폰 발급
쿠폰 코드 표시
기프티쇼비즈 API 호출
보상 지급
```

### 9.16.3 다음 화면

CTA 클릭 시 상태에 따라 아래처럼 동작한다.

| 상태 | 동작 |
|---|---|
| 거리 부족 | 현재 팝업 유지 |
| 사냥 가능 | 현재 팝업에서 사냥 가능 상태 표시. AR 진입은 별도 액션 정책에서 처리 |
| 오류 | 힌트 데이터 재요청 |

---

---

## 9.17 하단 검정 영역 재정의

최종 Stitch AI 시안 기준으로 하단 검정색 박스는 CTA 버튼이 아니다.  
이 영역은 현재 거리 상태를 강조해서 보여주는 **상태 문구 영역**이다.

### 9.17.1 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 하단 상태 문구 프레임 | `ui_frame_treasure_status_message_black_rough_default.svg` |


### 9.17.2 사용하지 않는 에셋

```txt
ui_frame_button_hunt_join_rough_default.svg
ui_frame_button_hunt_join_rough_disabled.svg
```

### 9.17.3 구현 기준

```txt
검정 프레임 = SVG 에셋
문구 = 코드 텍스트
클릭 = 없음
역할 = 상태 안내
```

문구 예시:

```txt
좀 더 가까이 와라
이제 열 수 있다.
```

### 9.17.4 접근성

하단 상태 문구 영역은 button이 아니므로 `button` 태그를 사용하지 않는다.  
권장 구현은 아래 중 하나다.

```txt
div role="status"
p
section aria-live="polite"
```

---

## 9.18 확장 프레임 및 힌트 아이콘 제외 정책

최종 시안 기준으로 힌트 팝업 화면은 기본 프레임만 사용한다.  
확장 프레임과 힌트 아이콘은 에셋으로 정의하지 않는다.

### 9.18.1 최종 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 힌트 팝업 본체 프레임 | `ui_frame_treasure_hint_popup_rough_default.svg` |
| 닫기 아이콘 | `icon_action_close_circle_rough_default_24.svg` |
| 거리 게이지 프레임 | `ui_frame_treasure_distance_gauge_rough_default.svg` |
| 힌트 카드 프레임 | `ui_frame_treasure_hint_card_rough_default.svg` |
| 하단 상태 문구 프레임 | `ui_frame_treasure_status_message_black_rough_default.svg` |

### 9.18.2 사용하지 않는 에셋

```txt
icon_hint_bulb_rough_default_20.svg
ui_frame_treasure_hint_popup_rough_lg.svg
ui_frame_treasure_distance_gauge_rough_lg.svg
ui_frame_treasure_distance_info_rough_default.svg
ui_frame_treasure_status_message_black_rough_lg.svg
```

### 9.18.3 문구 길이 정책

확장 프레임을 사용하지 않으므로 문구 길이를 제한한다.

| 영역 | 정책 |
|---|---|
| 보물명 | 1줄 |
| 위치 | 1줄 |
| 거리 문구 | 1줄 |
| 힌트 제목 | 1줄 |
| 힌트 본문 | 최대 2줄 |
| 하단 상태 문구 | 1줄 |

긴 내용은 줄이거나 힌트 상세/후속 화면에서 처리한다.

---

## 9.19 최종 에셋 정의

최종 시안 기준으로 힌트 팝업 화면에서 사용하는 에셋은 아래 6개다.

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 팝업 프레임 | `ui_frame_treasure_hint_popup_rough_default.svg` | 힌트 팝업 전체를 감싸는 흰색 rough frame |
| 거리 계산 프레임 | `ui_frame_treasure_distance_info_rough_default.svg` | 거리 문구, 게이지, 0M/TARGET 라벨을 감싸는 전체 프레임 |
| 힌트 프레임 | `ui_frame_treasure_hint_card_rough_default.svg` | HINT #1과 힌트 본문을 감싸는 프레임 |
| 닫기 버튼 | `icon_action_close_circle_rough_default_24.svg` | 팝업 우측 상단 닫기 아이콘 |
| 게이지 프레임 | `ui_frame_treasure_distance_gauge_rough_default.svg` | 거리 계산 프레임 내부의 게이지바 외곽 |
| 명령/상태 문구 프레임 | `ui_frame_treasure_status_message_black_rough_default.svg` | 하단 검정색 상태 문구 영역. 버튼 아님 |

### 9.19.1 거리 계산 프레임 구성

`ui_frame_treasure_distance_info_rough_default.svg`는 아래 전체 영역을 의미한다.

```txt
아직 멀다. 700m 남았다.
+ 게이지바
+ 0M / TARGET (20m)
```

게이지바 자체의 외곽은 별도 에셋인 `ui_frame_treasure_distance_gauge_rough_default.svg`를 사용한다.

### 9.19.2 제외 에셋

아래 에셋은 사용하지 않는다.

```txt
ui_frame_treasure_hint_card_rough_lg.svg
ui_frame_treasure_hint_popup_rough_lg.svg
ui_frame_treasure_distance_gauge_rough_lg.svg
ui_frame_treasure_status_message_black_rough_lg.svg
icon_hint_bulb_rough_default_20.svg
ui_frame_button_hunt_join_rough_default.svg
```

### 9.19.3 핵심 구현 원칙

```txt
프레임 = SVG 에셋
텍스트 = 코드 텍스트
게이지 채움 = CSS
하단 검정 영역 = 버튼 아님
지도 배경 = 맵 상세 화면 그대로 사용
```

## 10. UI 구성 요소

## 10.1 바텀시트 컨테이너

### 구성

| 요소 | 설명 |
|---|---|
| 드래그 핸들 | 상단 중앙 |
| 닫기 버튼 | 우측 상단 |
| 보물 헤더 | 보물명, 위치 문구, 등급 배지 |
| 거리 카드 | 현재 거리와 사냥 가능 상태 |
| 힌트 카드 | 보물 위치 힌트 |
| CTA 영역 | 사냥하기 또는 거리 안내 |

### 스타일

| 항목 | 값 |
|---|---|
| Background | `surface` |
| Border | 1px solid `border` |
| Radius | `rounded-t-3xl` |
| Max height | 화면 높이의 75% |
| Scroll | 콘텐츠 초과 시 내부 스크롤 |
| Z-index | 지도와 Bottom Nav보다 높음 |

---

## 10.2 보물 헤더

### 구성

| 요소 | 설명 |
|---|---|
| 보물 이름 | 예: `골드 보물상자 #1` |
| 위치 요약 | 예: `신사역 근처 어딘가...` |
| 등급 배지 | 예: `RARE` |
| 닫기 버튼 | 팝업 닫기 |

### 보물 이름

| 항목 | 값 |
|---|---|
| Font | Plus Jakarta Sans |
| Weight | 700 |
| Size | 22px~26px |
| Color | `primary` |

### 위치 요약

| 항목 | 값 |
|---|---|
| Font | Plus Jakarta Sans |
| Size | 13px~14px |
| Color | `secondary` |

### 등급 배지

| 항목 | 값 |
|---|---|
| Shape | `rounded-full` |
| Font | Space Grotesk |
| Size | 11px~12px |
| Text | `COMMON`, `RARE`, `SPECIAL`, `EVENT` |
| Color | 글로벌 토큰 기반 |

---

## 10.3 거리 카드

### 목적

현재 사용자 위치와 선택한 보물상자 사이의 거리를 직관적으로 보여준다.

### 구성

| 요소 | 설명 |
|---|---|
| 아이콘 | 위치 핀 |
| 메인 문구 | 현재 보물과 거리 |
| 거리 숫자 | `700m 떨어져 있어요` |
| 진행 바 | 0m부터 목표 거리까지 |
| 시작 라벨 | `0M` |
| 목표 라벨 | `TARGET` |

### 거리 문구 정책

| 거리 상태 | 문구 |
|---|---|
| 위치 없음 | `현재 위치를 확인할 수 없어요.` |
| 20m 이내 | `보물 근처에 도착했어요!` |
| 20m 초과 | `현재 보물과 {distance} 떨어져 있어요.` |

### 진행 바 정책

- 진행 바는 사용자 이해를 돕는 시각 요소다.
- 정확한 지도 거리 계산 결과는 숫자로 표시한다.
- target은 `radius_m` 기준으로 표시한다.
- 거리 정보가 없으면 진행 바를 skeleton 또는 비활성 상태로 표시한다.

### 사냥 가능 기준

```txt
distance_m <= treasure_boxes.radius_m
```

MVP 기본값:

```txt
radius_m = 20
```

---

## 10.4 힌트 카드

### 목적

사용자가 실제 위치를 추리할 수 있도록 관리자가 입력한 힌트를 보여준다.

### 구성

| 요소 | 설명 |
|---|---|
| 라벨 | `HINT #1` |
| 힌트 본문 | 관리자 입력 힌트 |
| 보조 힌트 | 선택 |
| 아이콘 | 전구 또는 핀 아이콘 |

### 힌트 데이터

| 데이터 | 설명 |
|---|---|
| hint_primary | 기본 힌트 |
| hint_secondary | 선택 힌트 |
| hint_level | 힌트 단계 |

### 표시 예시

```txt
HINT #1

“태극기가 보인다”
“시선을 위쪽으로 돌려보세요”
```

### 정책

- 힌트는 지도 상세 화면의 보물 팝업에서 제공한다.
- AR 카메라 화면에서는 힌트를 제공하지 않는다.
- 힌트가 없을 경우 기본 문구를 표시한다.

기본 문구:

```txt
아직 등록된 힌트가 없어요.
주변을 천천히 둘러보세요.
```

---

## 10.5 CTA 영역

### 사냥 가능 상태

조건:

```txt
distance_m <= radius_m
treasure_status = active
current_claim_count < max_claim_count
```

버튼:

```txt
사냥하기
```

클릭 시:

```txt
AR 가이드 화면 이동
```

### 사냥 불가능 상태

조건:

```txt
distance_m > radius_m
```

문구:

```txt
보물 근처 20m 이내에서 활성화됩니다.
```

버튼 정책:

| 방식 | 설명 |
|---|---|
| Disabled 버튼 | `더 가까이 이동해주세요` |
| 안내 문구만 표시 | MVP 간단 구현 |
| 지도 유지 | 사용자가 계속 이동하도록 지도 화면 유지 |

### 위치 없음 상태

문구:

```txt
현재 위치를 확인해야 사냥할 수 있어요.
```

CTA:

```txt
위치 다시 확인하기
```

---

## 10.6 닫기 버튼

| 항목 | 정의 |
|---|---|
| 위치 | 팝업 우측 상단 |
| 아이콘 | X |
| 터치 영역 | 최소 44px |
| 동작 | 팝업 닫기 |
| 접근성 라벨 | `보물 힌트 닫기` |

---

## 11. 화면 상태

### 11.1 상태 타입

```ts
export type TreasureHintSheetStatus =
  | 'closed'
  | 'opening'
  | 'loading'
  | 'ready'
  | 'huntable'
  | 'too_far'
  | 'location_required'
  | 'closed_treasure'
  | 'error';
```

### 11.2 상태별 UI

| 상태 | UI |
|---|---|
| `closed` | 팝업 미노출 |
| `opening` | 열림 애니메이션 |
| `loading` | 보물 정보 로딩 |
| `ready` | 보물 정보 표시 |
| `huntable` | 사냥하기 버튼 활성 |
| `too_far` | 더 가까이 이동 안내 |
| `location_required` | 위치 확인 필요 |
| `closed_treasure` | 마감된 보물 안내 |
| `error` | 오류 상태 표시 |

---

## 12. 데이터 요구사항

### 12.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| treasure_boxes | 선택한 보물상자 정보 |
| treasure_rewards | 연결된 보상 정보 |
| giftishow_products | 상품명/브랜드 표시용 |
| current location | 사용자 현재 위치 |
| profiles | 계정 상태 확인 |
| treasure_claims | 중복 획득 여부 확인 시 선택 |

### 12.2 필요한 보물상자 필드

```txt
id
title
description
hint_primary
hint_secondary
latitude
longitude
radius_m
status
starts_at
ends_at
max_claim_count
current_claim_count
deleted_at
```

### 12.3 쓰는 데이터

이 팝업에서는 원칙적으로 주요 데이터를 생성하지 않는다.

선택적으로 저장 가능한 상태:

```txt
selectedTreasureId
lastOpenedTreasureHintAt
```

### 12.4 생성하지 않는 데이터

- treasure_claims
- inventory_items
- giftishow_issues
- coupon code
- security_logs

---

## 13. 데이터 조회 정책

### 13.1 선택 보물 조회

```txt
treasure_boxes.id = selectedTreasureId
```

필수 조건:

```txt
status = active
deleted_at is null
starts_at <= now
ends_at >= now
```

### 13.2 거리 계산

```txt
distance_m = calculateDistance(currentLocation, treasureLocation)
```

### 13.3 사냥 가능 여부 계산

```txt
isHuntable =
  distance_m <= radius_m
  AND status = active
  AND current_claim_count < max_claim_count
```

### 13.4 Realtime 반영

선택적으로 Supabase Realtime을 사용해 보물 상태 변경을 반영한다.

| 이벤트 | 처리 |
|---|---|
| current_claim_count 증가 | 잔여 상태 갱신 |
| status = closed | 사냥 불가 처리 |
| deleted_at 설정 | 팝업 닫기 또는 마감 안내 |
| ends_at 경과 | expired 처리 |

---

## 14. 위치 정책

### 14.1 현재 위치 사용 목적

- 보물과의 거리 계산
- 사냥 가능 여부 표시
- AR 가이드 진입 가능 여부 판단

### 14.2 위치 재확인

팝업이 열릴 때 현재 위치가 오래된 경우 재조회한다.

권장 기준:

```txt
lastKnownLocation.captured_at이 10초 이상 지났으면 재조회
```

### 14.3 위치 권한 없음

문구:

```txt
보물까지의 거리를 확인하려면 위치 권한이 필요해요.
```

CTA:

```txt
위치 다시 확인하기
```

---

## 15. 사냥 가능 거리 정책

### 15.1 기본값

```txt
20m
```

### 15.2 관리자 설정값

관리자가 보물상자별로 `radius_m`을 설정할 수 있다.

MVP 정책:

```txt
radius_m 값이 없으면 20m로 처리한다.
```

### 15.3 서버 검증과의 관계

이 팝업의 사냥 가능 여부는 사용자 안내용이다.  
최종 보물 획득 가능 여부는 AR 화면에서 Supabase RPC가 서버 기준으로 다시 검증한다.

```txt
힌트 팝업 거리 계산
→ AR 진입 가능 안내

AR 획득 RPC
→ 최종 서버 검증
```

---

## 16. 사용자 액션

### 16.1 팝업 열기

```txt
보물 마커 클릭
→ selectedTreasureId 저장
→ 보물 정보 조회
→ 거리 계산
→ 팝업 오픈
```

### 16.2 닫기 클릭

```txt
닫기 클릭
→ 팝업 닫기
→ selectedTreasureId 초기화 또는 유지
```

### 16.3 사냥하기 클릭

```txt
사냥하기 클릭
→ 현재 거리 재확인
→ 20m 이내이면 AR 가이드 화면 이동
→ treasure_box_id 전달
```

### 16.4 위치 다시 확인하기 클릭

```txt
위치 다시 확인하기 클릭
→ Capacitor Geolocation으로 현재 위치 재조회
→ 거리 재계산
→ UI 상태 갱신
```

### 16.5 뒤로가기

```txt
팝업 open 상태
→ Android back
→ 팝업 close
```

---

## 17. 예외 처리

### 17.1 보물상자 조회 실패

| 상황 | 처리 |
|---|---|
| Supabase 조회 실패 | 오류 상태 표시 |
| 보물상자 없음 | 팝업 닫기 또는 오류 표시 |
| RLS 오류 | 로그인 상태 재확인 |

문구:

```txt
보물 정보를 불러오지 못했어요.
잠시 후 다시 시도해주세요.
```

### 17.2 보물 마감

| 상황 | 처리 |
|---|---|
| current_claim_count >= max_claim_count | 마감 안내 |
| status = closed | 사냥 불가 |
| ends_at 경과 | 만료 안내 |

문구:

```txt
이미 마감된 보물이에요.
다른 보물을 찾아보세요.
```

### 17.3 위치 오류

| 상황 | 처리 |
|---|---|
| 위치 권한 없음 | 위치 권한 안내 |
| 위치 획득 실패 | 다시 확인 버튼 |
| 정확도 낮음 | 재시도 안내 |

### 17.4 AR 가이드 이동 실패

| 상황 | 처리 |
|---|---|
| route 이동 실패 | 오류 토스트 |
| treasureId 누락 | 이동 차단 |

문구:

```txt
사냥을 시작할 수 없어요. 다시 시도해주세요.
```

---

## 18. 기프티쇼비즈 정책과의 관계

보물 힌트 팝업은 기프티쇼비즈 API와 직접 연결되지 않는다.

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
관리자에서 보물상자에 기프티쇼비즈 상품 연결
→ 지도에 보물상자 표시
→ 힌트 팝업에서 힌트와 거리 확인
→ AR에서 보물 획득
→ 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

따라서 이 팝업에서는 아래 작업을 하지 않는다.

- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 조회
- 쿠폰 코드 표시
- 바코드 표시
- 쿠폰 받기
- 쿠폰 사용 완료 처리
- 발급 실패 재시도
- 취소/재발송 처리

단, 연결된 상품의 이름이나 브랜드는 사용자 기대감을 위해 표시할 수 있다.

---

## 19. 보안 및 정책

- 선택한 보물이 active 상태인지 반드시 확인한다.
- 삭제/만료/마감된 보물은 사냥하기를 제공하지 않는다.
- 지도 화면의 거리 계산은 사용자 안내용이며 최종 보상 지급 기준이 아니다.
- 최종 획득 검증은 AR 화면의 RPC에서 처리한다.
- 사용자의 위치 정보는 거리 계산에만 사용한다.
- 위치 정보는 불필요하게 저장하지 않는다.
- 쿠폰 코드 및 기프티쇼비즈 응답값은 이 팝업에서 절대 노출하지 않는다.

---

## 20. 접근성

### 20.1 팝업

- 팝업은 `dialog` 역할을 가진다.
- 팝업이 열리면 포커스가 팝업 내부로 이동한다.
- 닫기 버튼에 명확한 aria-label을 제공한다.
- Android 뒤로가기 또는 ESC에 해당하는 동작으로 닫을 수 있어야 한다.

### 20.2 거리 정보

- 거리 정보는 숫자와 텍스트로 표시한다.
- 진행 바만으로 거리 상태를 전달하지 않는다.

### 20.3 CTA

- 사냥하기 버튼은 활성/비활성 상태가 명확해야 한다.
- 비활성 상태에서는 이유를 함께 표시한다.

---

## 21. 구현 컴포넌트 제안

### 21.1 컴포넌트

```txt
TreasureHintBottomSheet
TreasureHintHeader
TreasureDistanceCard
TreasureDistanceProgress
TreasureHintCard
TreasureHuntCTA
TreasureClosedNotice
TreasureHintLoadingState
TreasureHintErrorState
```

### 21.2 훅

```txt
useSelectedTreasure
useTreasureHintSheet
useTreasureDistance
useHuntableStatus
useRefreshCurrentLocation
```

### 21.3 유틸

```txt
calculateDistanceMeters
formatDistance
getTreasureGradeLabel
checkTreasureHuntable
mapTreasureHintErrorMessage
```

---

## 22. 권장 파일 구조

```txt
features/
  treasure/
    components/
      TreasureHintBottomSheet.tsx
      TreasureHintHeader.tsx
      TreasureDistanceCard.tsx
      TreasureHintCard.tsx
      TreasureHuntCTA.tsx
      TreasureHintLoadingState.tsx
      TreasureHintErrorState.tsx
    hooks/
      useSelectedTreasure.ts
      useTreasureDistance.ts
      useHuntableStatus.ts
    services/
      treasure.service.ts
    types/
      treasure.types.ts

stores/
  treasure.store.ts
  location.store.ts

constants/
  routes.ts
  treasureStatus.ts
```

---

## 23. TypeScript 타입 제안

### 23.1 팝업 상태 타입

```ts
export type TreasureHintSheetStatus =
  | 'closed'
  | 'opening'
  | 'loading'
  | 'ready'
  | 'huntable'
  | 'too_far'
  | 'location_required'
  | 'closed_treasure'
  | 'error';
```

### 23.2 선택 보물 타입

```ts
export type SelectedTreasure = {
  id: string;
  title: string;
  description: string | null;
  hint_primary: string | null;
  hint_secondary: string | null;
  latitude: number;
  longitude: number;
  radius_m: number;
  status: 'active' | 'closed' | 'expired' | 'deleted' | 'draft';
  max_claim_count: number;
  current_claim_count: number;
  distance_m?: number;
  reward_name?: string;
  brand_name?: string;
  grade?: 'COMMON' | 'RARE' | 'SPECIAL' | 'EVENT';
};
```

### 23.3 사냥 가능 상태 타입

```ts
export type HuntableStatus = {
  isHuntable: boolean;
  reason:
    | 'within_range'
    | 'too_far'
    | 'location_required'
    | 'closed'
    | 'expired'
    | 'already_claimed'
    | 'unknown';
  distance_m?: number;
  radius_m: number;
};
```

---

## 24. 완료 기준

### 24.1 UI 완료 기준

- [ ] 지도 상세 화면에서 보물 마커 클릭 시 힌트 팝업이 열린다.
- [ ] 팝업 상단에 드래그 핸들이 표시된다.
- [ ] 보물 이름이 표시된다.
- [ ] 위치 요약 또는 설명이 표시된다.
- [ ] 등급 배지가 표시된다.
- [ ] 닫기 버튼이 표시된다.
- [ ] 거리 카드가 표시된다.
- [ ] 현재 거리 문구가 표시된다.
- [ ] 거리 진행 바가 표시된다.
- [ ] 힌트 카드가 표시된다.
- [ ] 힌트 텍스트가 표시된다.
- [ ] 사냥 가능 상태에 따라 CTA 또는 안내 문구가 표시된다.
- [ ] 전체 화면이 글로벌 디자인 토큰을 따른다.

### 24.2 기능 완료 기준

- [ ] selectedTreasureId 기준으로 보물 정보를 조회한다.
- [ ] 현재 위치와 보물 좌표 간 거리를 계산한다.
- [ ] radius_m 기준으로 사냥 가능 여부를 판단한다.
- [ ] 20m 이내이면 사냥하기 버튼이 활성화된다.
- [ ] 20m 초과이면 더 가까이 이동 안내가 표시된다.
- [ ] 위치 정보가 없으면 위치 확인 안내가 표시된다.
- [ ] 닫기 클릭 시 팝업이 닫힌다.
- [ ] 아래로 스와이프 또는 바깥 클릭 시 팝업이 닫힌다.
- [ ] Android 뒤로가기 시 팝업이 먼저 닫힌다.
- [ ] 사냥하기 클릭 시 AR 가이드 화면으로 이동한다.
- [ ] AR 가이드 화면 이동 시 treasure_box_id가 전달된다.
- [ ] 보물 마감 상태에서는 사냥하기가 비활성화된다.

### 24.3 기술 완료 기준

- [ ] TypeScript 타입이 정의되어 있다.
- [ ] Supabase에서 선택 보물 정보를 조회한다.
- [ ] 거리 계산 유틸이 구현되어 있다.
- [ ] 현재 위치 store와 연결되어 있다.
- [ ] selectedTreasure 상태가 관리된다.
- [ ] Tailwind CSS 디자인 토큰을 사용한다.
- [ ] route constants를 사용한다.
- [ ] 기프티쇼비즈 API를 호출하지 않는다.
- [ ] 쿠폰 코드를 표시하지 않는다.

### 24.4 제외 기능 확인

- [ ] 카메라 권한 요청이 없다.
- [ ] WebAR 실행이 없다.
- [ ] R3F 렌더링이 없다.
- [ ] 보물 획득 RPC 호출이 없다.
- [ ] 보상 수령권 생성이 없다.
- [ ] 기프티쇼비즈 API 호출이 없다.
- [ ] 쿠폰 코드 표시가 없다.

---

## 25. 제외 범위

이 팝업에서는 아래 기능을 구현하지 않는다.

- AR 카메라 실행
- 3D 보물상자 렌더링
- 카메라 권한 요청
- 보물 획득 RPC 호출
- 보상 수령권 생성
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 바코드 표시
- 보관함 상세 열기
- 쿠폰 사용 완료 처리
- 관리자 기능
- 관리자 상품 연결
- 쿠폰 취소/재발송

---

## 26. 개발자 주의사항

- 힌트 팝업은 지도 상세 화면의 오버레이 컴포넌트로 구현한다.
- AR 진입 전 사용자 안내와 거리 확인을 담당한다.
- 이 팝업에서 보물 획득을 확정하지 않는다.
- 이 팝업에서 기프티쇼비즈 API를 호출하지 않는다.
- 쿠폰 발급은 보관함에서 사용자가 `쿠폰 받기`를 실행하는 시점에 처리한다.
- 지도 화면에서 계산한 거리는 사용자 안내용이다.
- 최종 획득 가능 여부는 AR 화면의 Supabase RPC에서 다시 검증한다.
- 보물이 마감되거나 삭제되면 팝업 상태를 즉시 갱신해야 한다.
- 위치 정보가 없는 경우 사냥하기를 활성화하지 않는다.


---

## 99. 디자인 반영 개발자 주의사항

- 힌트 팝업은 맵 상세 화면 위 오버레이로 구현한다.
- 배경 지도는 이미지가 아니라 기존 맵 상세 화면을 그대로 사용한다.
- 팝업 본체는 `ui_frame_treasure_hint_popup_rough_default.svg` 프레임을 사용한다.
- 확장 프레임은 사용하지 않는다.
- 힌트 아이콘은 사용하지 않는다.
- 거리 계산 전체 박스는 `ui_frame_treasure_distance_info_rough_default.svg`를 사용한다.
- 거리 게이지 외곽은 `ui_frame_treasure_distance_gauge_rough_default.svg` 프레임 위에 CSS progress를 올린다.
- 하단 검정색 영역은 버튼이 아니며 `ui_frame_treasure_status_message_black_rough_default.svg`를 사용한다.
- 모든 텍스트는 이미지에 포함하지 않고 코드 텍스트로 구현한다.
- 닫기 버튼은 실제 HTML button으로 구현하고, 아이콘만 SVG 에셋을 사용한다.
- 이 화면에서는 AR 카메라, 쿠폰 코드, 기프티쇼비즈 API를 실행하지 않는다.
