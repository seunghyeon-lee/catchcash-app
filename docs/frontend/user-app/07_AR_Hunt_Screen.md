# 07. AR 사냥 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 07. AR 사냥 화면 정의서 |
| 파일명 | `07_AR_Hunt_Screen.md` |
| 화면명 | AR 사냥 화면 |
| 화면 ID | `07_AR_Hunt_Screen` |
| 진입 화면 | 지도 상세 화면 / 보물 힌트 팝업 |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 바이브코딩 기반 AR 사냥 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| AR 방식 | WebView 기반 WebAR Lite |
| 카메라 방식 | WebRTC `navigator.mediaDevices.getUserMedia` |
| 3D 렌더링 | React Three Fiber |
| 3D 에셋 | `.glb` |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI AR 사냥 시안 기준 / Dark camera preview / AR chest frame / tap pointer / tracking status 적용 |

---

## 2. 화면 개요

AR 사냥 화면은 사용자가 지도 상세 화면 또는 보물 힌트 팝업에서 `사냥하기`를 누른 뒤 진입하는 보물 획득 액션 화면이다.

이 화면에서는 기기의 후면 카메라 스트림을 WebView 배경에 표시하고, 그 위에 React Three Fiber 기반 3D 보물상자를 오버레이한다.  
사용자는 화면 중앙의 보물상자를 터치하여 보물 획득을 시도한다.

캐치캐쉬의 AR은 네이티브 ARKit/ARCore 기반 공간 인식 AR이 아니라, WebView 내부에서 카메라 스트림 위에 3D 오브젝트를 고정 렌더링하는 **WebAR Lite 방식**이다.

---

## 3. 화면 목적

### 핵심 목적

- 카메라 화면 위에 3D 보물상자를 표시한다.
- 사용자가 보물상자를 터치하여 획득 액션을 실행할 수 있게 한다.
- 터치 시 진동/시각/사운드 피드백을 제공한다.
- Supabase RPC를 통해 보물 획득 최종 검증을 수행한다.
- 획득 성공 시 보상 수령권을 생성하고 성공 화면으로 이동한다.
- 실패 시 사유에 맞는 안내를 제공하고 지도 화면으로 복귀시킨다.

### 사용자 관점 목적

- 실제 주변 공간에서 보물상자를 발견한 듯한 경험을 한다.
- 보물상자를 직접 터치해 보상을 획득한다.
- 성공 또는 실패 결과를 명확하게 확인한다.

---

## 4. AR 구현 범위

### 4.1 MVP에서 구현하는 AR

```txt
후면 카메라 스트림 표시
화면 중앙 3D 보물상자 고정 렌더링
보물상자 터치 이벤트
상자 열림 애니메이션
진동/사운드/시각 피드백
획득 RPC 호출
성공/실패 분기
```

### 4.2 MVP에서 제외하는 AR

```txt
ARKit
ARCore
SLAM
공간 좌표 추적
평면 인식
바닥/벽 고정 배치
실시간 조명 추정
실시간 그림자
복잡한 후처리 셰이더
```

### 4.3 AR 정책 문구

```txt
캐치캐쉬의 AR은 WebView 기반 WebAR Lite 방식이다.
카메라 피드를 배경으로 표시하고, 3D 보물상자를 화면 중앙에 고정 렌더링한다.
MVP에서는 월드 트래킹, 평면 인식, 공간 고정 배치를 제공하지 않는다.
```

---

## 5. 기술 구현 기준

### 5.1 앱 구조

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ AR Hunt Screen
→ getUserMedia Camera Stream
→ React Three Fiber Canvas
→ Supabase RPC
```

### 5.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |
| 3D 렌더링 | React Three Fiber |
| 3D 엔진 기반 | Three.js |
| 카메라 스트림 | WebRTC `getUserMedia` |

### 5.3 네이티브 브릿지

| 기능 | 기술 |
|---|---|
| 앱 패키징 | Capacitor |
| 위치 확인 | Capacitor Geolocation |
| 진동 피드백 | Capacitor Haptics 또는 `navigator.vibrate` |
| 앱 라이프사이클 | Capacitor App |
| 카메라 권한 설정 | iOS / Android 권한 설정 필요 |

### 5.4 백엔드

| 항목 | 기술 |
|---|---|
| 인증 | Supabase Auth |
| 데이터베이스 | Supabase PostgreSQL |
| 보물 획득 검증 | Supabase RPC |
| 동시성 제어 | PostgreSQL Row Lock |
| 보상 수령권 생성 | `inventory_items` |
| 보상 발급 | 이 화면에서 하지 않음 |

### 5.5 이 화면에서 사용하지 않는 기능

- Naver 지도 렌더링
- 힌트 표시
- 기프티쇼비즈 API 직접 호출
- 쿠폰 코드 표시
- 보관함 쿠폰 받기
- 관리자 기능

---

## 6. 진입 조건

### 6.1 진입 시점

사용자는 아래 상황에서 AR 사냥 화면으로 진입한다.

| 이전 화면 | 진입 조건 |
|---|---|
| 지도 상세 화면 | 보물 선택 후 사냥 가능 상태 |
| 보물 힌트 팝업 | `distance_m <= radius_m` 상태에서 사냥하기 클릭 |
| AR 가이드 화면 | 탐색 시작하기 클릭 후 카메라 권한 허용 |

### 6.2 필수 진입 조건

```txt
Supabase session 존재
profiles.status = active
treasure_box_id 존재
선택한 보물상자 status = active
사용자 현재 위치 존재
지도/힌트 단계에서 distance_m <= radius_m
카메라 사용 가능
```

### 6.3 Route

```txt
/ar-hunt
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/ar-hunt/page.tsx
```

### 6.4 Query Parameter

```txt
/ar-hunt?treasureId={treasure_box_id}
```

필수 파라미터:

| 파라미터 | 필수 | 설명 |
|---|---:|---|
| `treasureId` | 필수 | 사냥할 보물상자 ID |

### 6.5 전달 데이터

AR 사냥 화면은 아래 데이터를 필요로 한다.

```txt
treasure_box_id
current_user_id
current_latitude
current_longitude
distance_m
```

단, 현재 위치와 거리 정보는 AR 화면 진입 후 다시 조회/검증한다.

---

## 7. 종료 및 이동 규칙

| 사용자 액션/상태 | 처리 |
|---|---|
| 닫기 버튼 클릭 | 카메라 스트림 정리 후 지도 상세 화면 복귀 |
| 종료하기 클릭 | 카메라 스트림 정리 후 지도 상세 화면 복귀 |
| Android 뒤로가기 | 카메라 스트림 정리 후 지도 상세 화면 복귀 |
| 앱 백그라운드 전환 | 카메라 스트림 정리 |
| 상자 터치 성공 | 획득 RPC 호출 |
| 획득 성공 | 사냥 성공 화면 이동 |
| 이미 마감 | 실패 안내 후 지도 상세 화면 이동 |
| 거리 검증 실패 | 실패 안내 후 지도 상세 화면 이동 |
| 카메라 오류 | 폴백 UI 표시 후 지도 상세 화면 이동 가능 |

### 7.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 지도 상세 | `05_Map_Detail_Screen` | `/map` |
| 보물 힌트 팝업 | `06_Treasure_Hint_Bottom_Sheet` | `/map?treasureId=` |
| 사냥 성공 | `08_Hunt_Success_Screen` | `/hunt-success` |
| 보관함 | `09_Inventory_Screen` | `/inventory` |

---

## 8. 화면 레이아웃

### 8.1 전체 구조

```txt
┌──────────────────────────────┐
│ [카메라 비디오 스트림 배경]      │
│                              │
│ ┌──────────────────────────┐ │
│ │ 상자를 터치하여 열어보세요 │ X │
│ │ (진동 피드백 포함)          │ │
│ └──────────────────────────┘ │
│                              │
│          [3D 보물상자]         │
│              TAP             │
│                              │
│      LIVE AR TRACKING ACTIVE │
│                              │
│          [ 종료하기 ]          │
└──────────────────────────────┘
```

### 8.2 레이어 구조

```txt
Layer 1: Camera Video Stream
Layer 2: R3F Transparent Canvas
Layer 3: AR UI Overlay
Layer 4: Loading / Error / Result Overlay
```

### 8.3 레이아웃 원칙

- 카메라 스트림은 화면 전체를 덮는다.
- 3D 보물상자는 화면 중앙에 고정 표시한다.
- 안내 카드는 상단에 배치한다.
- 닫기 버튼은 상단 우측에 배치한다.
- 상태 배지는 하단 CTA 위에 배치한다.
- 종료하기 버튼은 하단 safe area 위에 배치한다.
- 하단 네비게이션은 표시하지 않는다.

---

## 9. 디자인 시스템 적용

### 9.1 디자인 방향

AR 사냥 화면은 몰입감을 주는 전체 화면 경험이다.  
카메라 화면 위에 UI가 겹치므로 정보는 최소화하고, 상자 터치 행동이 가장 눈에 띄어야 한다.

첨부 예시 화면은 구조 참고용이며, 색상과 상세 스타일은 글로벌 모노톤 디자인 토큰을 따른다.

디자인 키워드:

```txt
Fullscreen
Camera Overlay
Minimal
Focused
Rounded
Game-like
WebAR Lite
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
| Secondary | `secondary` | `#5D5F5F` |
| Neutral | `neutral` | `#777777` |
| Background | `background` | `#FFFFFF` |
| Surface | `surface` | `#FFFFFF` |
| Border | `border` | `#E5E5E5` |
| Error | `error` | `#E5484D` |
| Success | `success` | `#000000` |

### 9.4 Shape Token

| 요소 | Radius |
|---|---|
| 안내 카드 | `rounded-2xl` |
| 닫기 버튼 | `rounded-full` |
| 상태 배지 | `rounded-full` |
| 종료하기 버튼 | `rounded-full` |
| 에러 모달 | `rounded-3xl` |

---

---

## 9.10 Stitch AI 디자인 결과 반영

### 9.10.1 확정된 화면 구조

Stitch AI 시안 기준 AR 사냥 화면은 아래 구조를 따른다.

```txt
Dark 카메라 프리뷰 배경
→ 우측 상단 닫기 버튼
→ 상단 안내 말풍선
→ 중앙 AR 보물상자 오브젝트
→ 보물상자 위 tap pointer
→ 하단 tracking status badge
```

### 9.10.2 확정된 화면 카피

| 요소 | 문구 | 구현 방식 |
|---|---|---|
| 상단 안내 문구 | `상자를 터치해 열어보거라` | 코드 텍스트 |
| 보물상자 내부 탭 문구 | `GRUG TAP HERE` | 코드 텍스트 |
| 하단 tracking 상태 | `LIVE AR TRACKING ACTIVE` | 코드 텍스트 |

### 9.10.3 화면 성격

이 화면은 지도 화면이나 결과 화면이 아니다.  
실제 카메라 프리뷰 위에서 보물상자를 터치하는 **WebAR Lite 사냥 화면**이다.

```txt
힌트 팝업
→ AR 사냥 화면
→ 보물상자 터치
→ 클레임 처리
→ 결과 화면
```

---

## 9.11 AR 구현 정책

### 9.11.1 AR 방식

캐치캐쉬 AR 화면은 WebView 기반 **WebAR Lite** 방식으로 구현한다.

```txt
카메라 = navigator.mediaDevices.getUserMedia
3D/오브젝트 = React Three Fiber 또는 WebGL/R3F
앱 브릿지 = Capacitor
권한 = Capacitor + browser permission
```

네이티브 ARKit/ARCore 기반 공간 인식은 MVP 범위가 아니다.

### 9.11.2 카메라 프리뷰

| 항목 | 정책 |
|---|---|
| 배경 | 실제 카메라 프리뷰 |
| 시각 톤 | Dark / 흑백 / 저채도 overlay |
| 지도 사용 | 없음 |
| 하단 탭바 | 없음 |
| 화면 방식 | 풀스크린 |

### 9.11.3 보물상자 오브젝트

Stitch AI 시안에서는 보물상자가 평면 일러스트처럼 보이지만, 개발 기준은 아래 둘 중 하나다.

| 방식 | 설명 |
|---|---|
| 1순위 | `.glb` 3D 모델 사용 |
| 2순위 | SVG/PNG 보물상자 sprite 사용 |

MVP 기준 최종 권장 방식은 `.glb` 3D 모델이다.

```txt
model_treasure_chest_ar_default.glb
```

단, Stitch AI/Figma 시안에서 추출한 보물상자 프레임이 있다면 개발 전 임시 sprite로 사용할 수 있다.

---

## 9.12 이미지 / 모델 에셋 분리 기준

### 9.12.1 모델 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| AR 보물상자 모델 | 필수 | 화면 중앙 터치 대상 |

### 9.12.2 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 닫기 아이콘 | 필수 | AR 화면 종료 |
| 상단 안내 프레임 | 필수 | 손그림 말풍선 UI 재현 |
| AR 보물상자 sprite fallback | 선택 | `.glb` 로딩 전 임시 표시 |
| tap pointer 아이콘 | 필수 | 사용자가 눌러야 하는 위치 안내 |
| 하단 tracking status 프레임 | 필수 | AR tracking 상태 표시 |

### 9.12.3 코드/CSS로 구현할 요소

| 요소 | 구현 방식 |
|---|---|
| 카메라 프리뷰 | WebRTC getUserMedia |
| 배경 dark overlay | CSS |
| 안내 문구 | 코드 텍스트 |
| `GRUG TAP HERE` | 코드 텍스트 |
| tracking status 텍스트 | 코드 텍스트 |
| tracking status 빨간 점 | CSS |
| 보물상자 터치 이벤트 | React event / R3F pointer event |
| 상자 흔들림/스케일 애니메이션 | CSS 또는 R3F animation |
| 처리 중 dim | CSS |

중요:

```txt
카메라 배경은 이미지가 아니다.
텍스트는 이미지에 포함하지 않는다.
보물상자는 터치 가능한 오브젝트다.
```

---

## 9.13 에셋 명칭 정의

### 9.13.1 필수 모델 / 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `model_treasure_chest_ar_default.glb` | 3D model | glb | AR hunt | - | AR 화면 중앙에 표시되는 보물상자 3D 모델 |
| `icon_action_close_circle_rough_default_24.svg` | action icon | svg | AR hunt | 24x24 | 우측 상단 닫기 아이콘 |
| `ui_frame_ar_instruction_bubble_rough_default.svg` | UI frame | svg | AR hunt | 280x72 | 상단 안내 말풍선 프레임 |
| `icon_ar_tap_pointer_red_default_32.svg` | AR pointer icon | svg | AR hunt | 32x32 | 보물상자 위에 표시되는 빨간 tap pointer |
| `ui_frame_ar_tracking_status_rough_default.svg` | UI frame | svg | AR hunt | 220x36 | 하단 tracking status badge 프레임 |

### 9.13.2 선택 / fallback 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `sprite_treasure_chest_ar_fallback_default.svg` | AR sprite | svg | AR hunt | 160x160 | `.glb` 모델 로딩 전 임시 보물상자 sprite |
| `effect_ar_chest_open_rough_default.svg` | effect | svg | AR hunt | 160x160 | 상자 열림 전환 효과. MVP에서는 생략 가능 |
| `effect_ar_tap_ring_red_default.svg` | effect | svg | AR hunt | 56x56 | tap pointer 주변 강조 ring. 필요 시 사용 |

### 9.13.3 사용하지 않는 에셋

아래 에셋은 이번 최종 시안 기준으로 사용하지 않는다.

```txt
ui_frame_ar_target_ring_rough_default.svg
ui_frame_ar_bottom_notice_rough_default.svg
ui_frame_ar_status_message_rough_default.svg
```

상단 안내 말풍선과 하단 tracking badge가 이미 존재하므로 별도 하단 안내 프레임은 만들지 않는다.

---

## 9.14 에셋 저장 위치

```txt
public/
  assets/
    models/
      ar/
        model_treasure_chest_ar_default.glb

    icons/
      action/
        icon_action_close_circle_rough_default_24.svg

      ar/
        icon_ar_tap_pointer_red_default_32.svg

    sprites/
      ar/
        sprite_treasure_chest_ar_fallback_default.svg

    ui/
      frames/
        ar/
          ui_frame_ar_instruction_bubble_rough_default.svg
          ui_frame_ar_tracking_status_rough_default.svg
```

---

## 9.15 코드 상수

### 9.15.1 에셋 상수

```ts
export const AR_HUNT_ASSETS = {
  chestModel: '/assets/models/ar/model_treasure_chest_ar_default.glb',
  chestFallbackSprite: '/assets/sprites/ar/sprite_treasure_chest_ar_fallback_default.svg',
  closeIcon: '/assets/icons/action/icon_action_close_circle_rough_default_24.svg',
  instructionBubbleFrame: '/assets/ui/frames/ar/ui_frame_ar_instruction_bubble_rough_default.svg',
  tapPointer: '/assets/icons/ar/icon_ar_tap_pointer_red_default_32.svg',
  trackingStatusFrame: '/assets/ui/frames/ar/ui_frame_ar_tracking_status_rough_default.svg',
} as const;
```

### 9.15.2 문구 상수

```ts
export const AR_HUNT_COPY = {
  instruction: '상자를 터치해 열어보거라',
  tapHere: 'GRUG TAP HERE',
  trackingActive: 'LIVE AR TRACKING ACTIVE',
  opening: '상자 따는 중...',
  cameraDenied: '카메라 없이는 못 연다.',
  error: '상자가 말을 안 듣는다. 다시 눌러봐.',
} as const;
```

---

## 9.16 구현 방식

### 9.16.1 전체 구조

```tsx
<section className="relative h-screen w-screen overflow-hidden bg-black">
  <video
    ref={cameraRef}
    className="absolute inset-0 h-full w-full object-cover"
    playsInline
    muted
  />

  <div className="absolute inset-0 bg-black/35" />

  <button aria-label="AR 사냥 닫기">
    <img src={AR_HUNT_ASSETS.closeIcon} alt="" aria-hidden="true" />
  </button>

  <ARInstructionBubble />

  <ARTreasureObject />

  <ARTrackingStatus />
</section>
```

### 9.16.2 상단 안내 말풍선

```tsx
<div className="relative">
  <img
    src={AR_HUNT_ASSETS.instructionBubbleFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <p className="relative z-10">
    상자를 터치해 열어보거라
  </p>
</div>
```

### 9.16.3 AR 보물상자

```tsx
<Canvas className="absolute inset-0">
  <Suspense fallback={<ChestFallbackSprite />}>
    <TreasureChestModel
      modelUrl={AR_HUNT_ASSETS.chestModel}
      onClick={handleTreasureTap}
    />
  </Suspense>
</Canvas>
```

fallback sprite를 사용하는 경우:

```tsx
<button className="absolute left-1/2 top-1/2">
  <img src={AR_HUNT_ASSETS.chestFallbackSprite} alt="" />
  <img src={AR_HUNT_ASSETS.tapPointer} alt="" aria-hidden="true" />
  <span>GRUG TAP HERE</span>
</button>
```

### 9.16.4 Tracking status

```tsx
<div className="relative">
  <img
    src={AR_HUNT_ASSETS.trackingStatusFrame}
    alt=""
    aria-hidden="true"
  />
  <div className="relative z-10 flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-red-500" />
    <span>LIVE AR TRACKING ACTIVE</span>
  </div>
</div>
```

---

## 9.17 상태 정책

### 9.17.1 기본 상태

| 요소 | 표시 |
|---|---|
| 카메라 프리뷰 | 표시 |
| 상단 안내 | `상자를 터치해 열어보거라` |
| 보물상자 | 표시 |
| tap pointer | 표시 |
| tracking badge | 표시 |

### 9.17.2 상자 터치 후

| 상태 | 표시 |
|---|---|
| 처리 중 | `상자 따는 중...` |
| 보물상자 | 흔들림/열림 애니메이션 |
| 화면 | dim 또는 미세한 shake |
| 다음 이동 | 결과 화면 |

### 9.17.3 카메라 권한 없음

| 요소 | 표시 |
|---|---|
| 배경 | dark fallback |
| 문구 | `카메라 없이는 못 연다.` |
| 액션 | `카메라 켜기` |

### 9.17.4 오류 상태

| 요소 | 표시 |
|---|---|
| 문구 | `상자가 말을 안 듣는다. 다시 눌러봐.` |
| 액션 | 재시도 |

---

## 9.18 다음 화면 정책

보물상자를 터치하면 클레임 처리를 진행하고 결과 화면으로 이동한다.

```txt
AR 보물상자 터치
→ 현재 위치 재확인
→ Supabase RPC claim_treasure_with_lock 실행
→ 성공/실패 결과 수신
→ 08_Hunt_Result_Screen 이동
```

중요:

- 이 화면에서 쿠폰 코드를 표시하지 않는다.
- 이 화면에서 기프티쇼비즈 API를 호출하지 않는다.
- 성공 시 보관함에 보상 수령권이 생성된다.
- 쿠폰 발급은 보관함 상세에서 사용자가 `쿠폰 받기`를 눌렀을 때 처리한다.

---

## 10. UI 구성 요소

## 10.1 카메라 비디오 배경

### 목적

후면 카메라 스트림을 전체 화면 배경으로 표시한다.

### 구현 기준

```txt
video element
width: 100vw
height: 100vh
object-fit: cover
playsInline
muted
autoplay
```

### 카메라 요청 기준

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
});
```

### 종료 시 정리

AR 화면을 벗어날 때 반드시 모든 track을 종료한다.

```ts
stream.getTracks().forEach((track) => track.stop());
```

---

## 10.2 R3F 투명 캔버스

### 목적

카메라 스트림 위에 3D 보물상자를 렌더링한다.

### 구현 기준

```txt
React Three Fiber Canvas
transparent background
position absolute
full screen
pointer events enabled for treasure mesh
```

### 렌더링 정책

- 3D 보물상자는 화면 중앙에 고정한다.
- 카메라 피드와 실제 공간 좌표를 매칭하지 않는다.
- 월드 트래킹은 하지 않는다.
- 불필요한 실시간 조명/그림자는 사용하지 않는다.
- `.glb` 단일 에셋을 사용한다.
- 모바일 성능을 위해 에셋 용량은 경량화한다.

---

## 10.3 3D 보물상자

### 구성

| 요소 | 설명 |
|---|---|
| 모델 | 보물상자 `.glb` |
| 위치 | 화면 중앙 고정 |
| 인터랙션 | 터치 가능 |
| 애니메이션 | 흔들림, 열림 |
| 상태 | idle, pressed, opening, claimed, failed |

### 터치 영역

- 3D mesh에 `onPointerDown`을 바인딩한다.
- 터치 영역은 모바일에서 충분히 크게 느껴지도록 모델 scale을 조정한다.
- UI 버튼과 터치 이벤트가 충돌하지 않도록 레이어 z-index를 관리한다.

---

## 10.4 상단 안내 카드

### 구성

| 요소 | 설명 |
|---|---|
| 메인 문구 | `상자를 터치하여 열어보세요` |
| 보조 문구 | `(진동 피드백 포함)` |
| 닫기 버튼 | 우측 상단 또는 카드 외부 |

### 스타일

| 항목 | 값 |
|---|---|
| Background | `surface` |
| Border | 1px solid `border` |
| Radius | `rounded-2xl` |
| Text align | center |
| Position | top center |

---

## 10.5 닫기 버튼

| 항목 | 정의 |
|---|---|
| 아이콘 | X |
| 위치 | 상단 우측 |
| Shape | `rounded-full` |
| 동작 | AR 종료 후 지도 상세 화면 복귀 |
| 접근성 라벨 | `AR 사냥 종료` |

닫기 클릭 시 반드시 카메라 스트림과 R3F 리소스를 정리한다.

---

## 10.6 TAP 인디케이터

### 목적

사용자가 보물상자를 터치해야 한다는 것을 명확히 안내한다.

### 구성

| 요소 | 설명 |
|---|---|
| 텍스트 | `TAP` |
| 위치 | 3D 보물상자 아래 |
| 애니메이션 | pulse 또는 fade |
| Color | 카메라 배경 위에서 잘 보이는 색상 |

---

## 10.7 상태 배지

### 기본 문구

```txt
LIVE AR TRACKING ACTIVE
```

단, 실제 월드 트래킹을 하지 않으므로 내부 문서에서는 아래처럼 해석한다.

```txt
카메라 기반 AR 사냥 모드가 활성화된 상태를 나타내는 시각적 배지
```

### 대체 권장 문구

MVP 정책과 정확히 맞추려면 아래 문구를 권장한다.

```txt
AR HUNT MODE ACTIVE
```

또는 한국어:

```txt
AR 사냥 모드 활성화
```

### 상태별 문구

| 상태 | 문구 |
|---|---|
| 카메라 준비 중 | `카메라를 준비하고 있어요` |
| 사냥 가능 | `AR 사냥 모드 활성화` |
| 터치 처리 중 | `상자를 열고 있어요` |
| 획득 요청 중 | `보상 확인 중` |
| 실패 | `사냥에 실패했어요` |

---

## 10.8 종료하기 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `종료하기` |
| 위치 | 하단 |
| Shape | `rounded-full` |
| Height | 52px~56px |
| Width | 화면 좌우 여백 기준 100% |
| 동작 | 카메라 스트림 정리 후 지도 상세 복귀 |

---

## 11. 화면 상태

### 11.1 상태 타입

```ts
export type ARHuntStatus =
  | 'initial'
  | 'checking_permission'
  | 'camera_loading'
  | 'asset_loading'
  | 'ready'
  | 'touching'
  | 'opening'
  | 'claiming'
  | 'claimed'
  | 'failed'
  | 'camera_error'
  | 'permission_denied'
  | 'unsupported';
```

### 11.2 상태별 UI

| 상태 | UI |
|---|---|
| `initial` | 화면 초기화 |
| `checking_permission` | 카메라 권한 확인 |
| `camera_loading` | 카메라 스트림 로딩 |
| `asset_loading` | 3D 에셋 로딩 |
| `ready` | 카메라 + 상자 표시 |
| `touching` | 터치 피드백 |
| `opening` | 상자 열림 애니메이션 |
| `claiming` | 획득 RPC 요청 중 |
| `claimed` | 성공 화면 이동 준비 |
| `failed` | 실패 안내 |
| `camera_error` | 카메라 오류 폴백 |
| `permission_denied` | 권한 거부 안내 |
| `unsupported` | 미지원 안내 |

---

## 12. 데이터 요구사항

### 12.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| Supabase Auth Session | 현재 사용자 확인 |
| profiles | 계정 상태 확인 |
| treasure_boxes | 선택한 보물상자 상태 및 좌표 |
| treasure_rewards | 보물과 연결된 상품 정보 |
| current location | 최종 거리 검증 요청용 |
| treasure_claims | 중복 획득 검증은 서버 RPC에서 처리 |

### 12.2 쓰는 데이터

이 화면에서 직접 DB를 조작하지 않고, Supabase RPC를 통해 처리한다.

RPC 성공 시 서버에서 처리하는 데이터:

```txt
treasure_claims 생성
treasure_boxes.current_claim_count 증가
inventory_items 생성
security_logs 선택 생성
```

### 12.3 생성하지 않는 데이터

AR 화면에서 직접 생성하지 않는 데이터:

```txt
giftishow_issues
coupon_code
barcode_url
giftishow API response
```

기프티쇼비즈 쿠폰 발급은 보관함에서 `쿠폰 받기` 실행 시 처리한다.

---

## 13. 보물 획득 RPC 정책

### 13.1 RPC 이름

권장 함수명:

```txt
claim_treasure_with_lock
```

### 13.2 요청 데이터

```ts
export type ClaimTreasureRequest = {
  treasure_box_id: string;
  user_latitude: number;
  user_longitude: number;
};
```

### 13.3 서버 검증 항목

RPC는 아래 항목을 서버에서 검증한다.

```txt
사용자 인증 여부
사용자 status = active
보물상자 status = active
deleted_at is null
starts_at <= now
ends_at >= now
current_claim_count < max_claim_count
동일 유저 중복 획득 여부
사용자 좌표와 보물 좌표 거리 검증
row lock 기반 선착순 동시성 제어
```

### 13.4 거리 검증

기본 사냥 반경:

```txt
20m
```

서버 오차 허용 정책:

```txt
treasure_boxes.radius_m 기준 검증
필요 시 GPS 오차를 고려해 서버 허용 마진을 별도 설정 가능
```

### 13.5 성공 시 서버 처리

```txt
1. treasure_boxes row lock
2. 보물 상태 및 수량 검증
3. 거리 검증
4. treasure_claims success 생성
5. treasure_boxes.current_claim_count 증가
6. inventory_items 생성
   - issue_status = ready
   - giftishow_product_id 연결
7. 결과 반환
```

중요:

```txt
보물 획득 성공 시 실제 쿠폰 코드를 발급하지 않는다.
보관함에 보상 수령권만 생성한다.
```

### 13.6 실패 시 서버 처리

| 실패 사유 | 처리 |
|---|---|
| 거리 초과 | claim 실패, security_logs 선택 기록 |
| 이미 마감 | claim 실패 |
| 중복 획득 | claim 실패 |
| 정지 유저 | claim 실패 |
| 보물 만료 | claim 실패 |
| 서버 오류 | claim 실패 |

---

## 14. 기프티쇼비즈 정책과의 관계

AR 사냥 화면은 기프티쇼비즈 API를 직접 호출하지 않는다.

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
AR에서 보물상자 터치
→ Supabase RPC로 보물 획득 확정
→ 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

### AR 화면에서 하는 것

```txt
보물 획득 검증
보상 수령권 생성 요청
성공 화면 이동
```

### AR 화면에서 하지 않는 것

```txt
기프티쇼비즈 상품 발급
쿠폰 코드 생성
쿠폰 코드 표시
바코드 표시
쿠폰 재발송
쿠폰 취소
예치금 조회
```

---

## 15. 카메라 권한 정책

### 15.1 권한 요청 시점

AR 사냥 화면 진입 시 카메라 권한을 확인한다.

```txt
AR 화면 진입
→ 카메라 권한 확인
→ 권한 없으면 OS 권한 요청
→ 허용 시 카메라 스트림 시작
```

### 15.2 권한 거부

문구:

```txt
카메라 권한을 허용해야 사냥에 참여할 수 있어요.
```

CTA:

```txt
지도로 돌아가기
```

### 15.3 OS 설정

영구 거부 상태에서는 OS 설정으로 이동하는 안내를 제공할 수 있다.

---

## 16. 리소스 생명주기

### 16.1 진입 시

```txt
1. treasureId 확인
2. 인증 상태 확인
3. 카메라 권한 확인
4. getUserMedia 호출
5. video element에 stream 바인딩
6. R3F Canvas 초기화
7. .glb 에셋 로드
8. 화면 ready
```

### 16.2 이탈 시

이탈 경로와 관계없이 반드시 정리한다.

```txt
video stream track.stop()
R3F Canvas unmount
animation frame 정리
audio 정리
pending request 취소 가능 시 취소
```

### 16.3 이탈 트리거

```txt
닫기 클릭
종료하기 클릭
Android 뒤로가기
route change
앱 백그라운드 전환
브라우저 visibility hidden
```

---

## 17. 사용자 액션

### 17.1 상자 터치

```txt
사용자가 3D 보물상자 터치
→ 중복 터치 방지
→ 햅틱/진동 실행
→ 상자 열림 애니메이션 실행
→ 현재 위치 재조회
→ claim_treasure_with_lock RPC 호출
→ 결과에 따라 성공/실패 분기
```

### 17.2 닫기 클릭

```txt
닫기 클릭
→ 종료 확인 없이 즉시 AR 종료
→ 카메라 스트림 정리
→ 지도 상세 화면 복귀
```

### 17.3 종료하기 클릭

```txt
종료하기 클릭
→ 카메라 스트림 정리
→ 지도 상세 화면 복귀
```

### 17.4 뒤로가기

```txt
Android back
→ 카메라 스트림 정리
→ 지도 상세 화면 복귀
```

---

## 18. 중복 터치 방지

### 정책

상자 터치 후 획득 요청이 완료되기 전까지 추가 터치를 무시한다.

```ts
if (status === 'opening' || status === 'claiming') {
  return;
}
```

### 적용 상태

```txt
touching
opening
claiming
claimed
```

이 상태에서는 보물상자 터치 이벤트를 무시한다.

---

## 19. 피드백 정책

### 19.1 햅틱/진동

우선순위:

```txt
Capacitor Haptics
→ navigator.vibrate
→ 미지원 시 무시
```

진동 예시:

```txt
[200, 100, 200]
```

### 19.2 사운드

선택적으로 상자 열림 효과음을 재생할 수 있다.

주의:

```txt
iOS WebView에서는 사용자 제스처 이후에만 오디오 재생이 안정적이다.
```

### 19.3 시각 효과

- 상자 흔들림
- 뚜껑 열림
- 빛 파티클
- 성공 플래시
- 로딩 오버레이

MVP에서는 최소한 상자 흔들림 + 열림 애니메이션만 구현한다.

---

## 20. 성공 처리

### 20.1 성공 조건

RPC가 성공을 반환하면 보물 획득 성공으로 처리한다.

### 20.2 성공 시 이동

```txt
claim success
→ 카메라 스트림 정리
→ /hunt-success?claimId={claim_id} 이동
```

### 20.3 성공 화면 전달 데이터

```txt
claim_id
treasure_box_id
inventory_item_id
giftishow_product_id
```

### 20.4 성공 시 생성되는 보관함 상태

```txt
inventory_items.issue_status = ready
```

의미:

```txt
보상 수령권이 생성되었고,
실제 쿠폰 코드는 아직 발급되지 않은 상태
```

---

## 21. 실패 처리

### 21.1 실패 유형

| 실패 사유 | 사용자 문구 | 이동 |
|---|---|---|
| 거리 초과 | `보물에서 너무 멀어졌어요.` | 지도 상세 |
| 이미 마감 | `앗! 눈앞에서 보물을 놓쳤어요.` | 지도 상세 |
| 중복 획득 | `이미 획득한 보물이에요.` | 보관함 또는 지도 |
| 정지 계정 | `현재 이용이 제한된 계정입니다.` | 로그인 |
| 카메라 오류 | `카메라를 사용할 수 없어요.` | 지도 상세 |
| 서버 오류 | `사냥에 실패했어요. 다시 시도해주세요.` | 지도 상세 |

### 21.2 실패 팝업

실패 시 간단한 모달 또는 토스트를 표시한 뒤 지도 상세 화면으로 이동한다.

권장:

```txt
실패 안내 1.5초 표시
→ 지도 상세 화면 이동
```

---

## 22. 예외 처리

### 22.1 카메라 미지원

| 상황 | 처리 |
|---|---|
| `navigator.mediaDevices` 없음 | 미지원 안내 |
| `getUserMedia` 없음 | 미지원 안내 |
| 후면 카메라 없음 | 일반 카메라 fallback 또는 미지원 안내 |

문구:

```txt
이 기기에서는 카메라 사냥을 사용할 수 없어요.
```

### 22.2 카메라 점유

| 상황 | 처리 |
|---|---|
| 다른 앱이 카메라 사용 중 | 오류 안내 |
| WebView 카메라 초기화 실패 | 재시도 또는 지도 복귀 |

문구:

```txt
카메라를 시작하지 못했어요. 다른 앱에서 카메라를 사용 중인지 확인해주세요.
```

### 22.3 3D 에셋 로드 실패

| 상황 | 처리 |
|---|---|
| `.glb` 로드 실패 | 재시도 안내 |
| 네트워크 오류 | 재시도 또는 지도 복귀 |

MVP fallback:

```txt
3D 보물상자 대신 2D 보물상자 이미지 표시 가능
```

---

## 23. 보안 및 정책

- treasureId가 없으면 AR 화면에 진입할 수 없다.
- 로그인 사용자만 AR 화면에 접근할 수 있다.
- 정지 계정은 AR 화면에 접근할 수 없다.
- 보물 획득은 클라이언트에서 확정하지 않는다.
- 최종 획득 여부는 Supabase RPC에서만 확정한다.
- 클라이언트 거리 계산 결과는 신뢰하지 않는다.
- RPC 요청에는 현재 GPS 좌표를 포함한다.
- 기프티쇼비즈 API Key는 클라이언트에 노출하지 않는다.
- 쿠폰 코드는 AR 화면에서 절대 표시하지 않는다.

---

## 24. 접근성

### 24.1 카메라 화면

- 카메라 화면은 시각 중심 UI이므로 주요 안내 문구를 텍스트로 표시한다.
- 상자 터치 외에도 버튼 라벨을 명확히 제공한다.

### 24.2 닫기/종료 버튼

권장 aria-label:

```txt
AR 사냥 종료
```

### 24.3 보물상자 터치

3D mesh 터치가 접근성에 취약할 수 있으므로, 필요 시 대체 버튼을 제공할 수 있다.

대체 버튼:

```txt
상자 열기
```

MVP에서는 화면 중앙 보물상자 터치와 TAP 문구를 기본으로 한다.

---

## 25. 구현 컴포넌트 제안

### 25.1 화면 컴포넌트

```txt
ARHuntPage
```

### 25.2 하위 컴포넌트

```txt
CameraVideoBackground
ARCanvas
TreasureChestModel
ARInstructionCard
ARCloseButton
TapIndicator
ARStatusBadge
AREndButton
ARLoadingOverlay
ARErrorFallback
ARClaimingOverlay
```

### 25.3 훅

```txt
useCameraStream
useARAssetLoader
useTreasureClaim
useARLifecycleCleanup
useHapticFeedback
useCurrentLocationForClaim
```

### 25.4 유틸

```txt
stopMediaStream
checkCameraSupport
mapCameraErrorMessage
mapClaimErrorMessage
buildClaimPayload
```

---

## 26. 권장 파일 구조

```txt
app/
  ar-hunt/
    page.tsx

features/
  ar/
    components/
      CameraVideoBackground.tsx
      ARCanvas.tsx
      TreasureChestModel.tsx
      ARInstructionCard.tsx
      ARCloseButton.tsx
      TapIndicator.tsx
      ARStatusBadge.tsx
      AREndButton.tsx
      ARLoadingOverlay.tsx
      ARErrorFallback.tsx
    hooks/
      useCameraStream.ts
      useARAssetLoader.ts
      useTreasureClaim.ts
      useARLifecycleCleanup.ts
      useHapticFeedback.ts
    services/
      ar.service.ts
      treasureClaim.service.ts
    types/
      ar.types.ts

assets/
  models/
    treasure-chest.glb

constants/
  routes.ts

lib/
  supabase/
    client.ts
```

---

## 27. TypeScript 타입 제안

### 27.1 AR 상태 타입

```ts
export type ARHuntStatus =
  | 'initial'
  | 'checking_permission'
  | 'camera_loading'
  | 'asset_loading'
  | 'ready'
  | 'touching'
  | 'opening'
  | 'claiming'
  | 'claimed'
  | 'failed'
  | 'camera_error'
  | 'permission_denied'
  | 'unsupported';
```

### 27.2 Claim 요청 타입

```ts
export type ClaimTreasureRequest = {
  treasure_box_id: string;
  user_latitude: number;
  user_longitude: number;
};
```

### 27.3 Claim 응답 타입

```ts
export type ClaimTreasureResponse = {
  success: boolean;
  claim_id?: string;
  inventory_item_id?: string;
  treasure_box_id?: string;
  giftishow_product_id?: string;
  error_code?: ClaimTreasureErrorCode;
  error_message?: string;
};
```

### 27.4 Claim 실패 코드 타입

```ts
export type ClaimTreasureErrorCode =
  | 'TOO_FAR'
  | 'ALREADY_CLOSED'
  | 'ALREADY_CLAIMED'
  | 'SUSPENDED_USER'
  | 'EXPIRED_TREASURE'
  | 'INVALID_TREASURE'
  | 'SERVER_ERROR';
```

---

## 28. 완료 기준

### 28.1 UI 완료 기준

- [ ] `/ar-hunt` route에서 AR 사냥 화면이 렌더링된다.
- [ ] 카메라 비디오 스트림이 전체 화면 배경으로 표시된다.
- [ ] 상단 안내 카드가 표시된다.
- [ ] 닫기 버튼이 표시된다.
- [ ] 3D 보물상자가 화면 중앙에 표시된다.
- [ ] TAP 인디케이터가 표시된다.
- [ ] AR 상태 배지가 표시된다.
- [ ] 종료하기 버튼이 표시된다.
- [ ] 하단 네비게이션이 표시되지 않는다.
- [ ] 하단 tracking status badge가 표시된다.
- [ ] 전체 화면이 글로벌 디자인 토큰을 따른다.

### 28.2 기능 완료 기준

- [ ] treasureId가 없으면 지도 상세 화면으로 복귀한다.
- [ ] 카메라 권한을 확인한다.
- [ ] 카메라 권한 허용 시 getUserMedia로 후면 카메라 스트림을 가져온다.
- [ ] 카메라 스트림을 video element에 바인딩한다.
- [ ] R3F Canvas가 카메라 위에 투명하게 표시된다.
- [ ] `.glb` 보물상자 에셋이 로드된다.
- [ ] 보물상자 터치 이벤트가 동작한다.
- [ ] 터치 중복이 방지된다.
- [ ] 터치 시 진동 또는 대체 피드백이 발생한다.
- [ ] 상자 열림 애니메이션이 실행된다.
- [ ] 현재 위치를 재조회한다.
- [ ] `claim_treasure_with_lock` RPC가 호출된다.
- [ ] 성공 시 사냥 성공 화면으로 이동한다.
- [ ] 실패 시 실패 안내 후 지도 상세 화면으로 이동한다.
- [ ] 화면 이탈 시 카메라 스트림이 반드시 종료된다.
- [ ] 앱 백그라운드 전환 시 카메라 스트림이 종료된다.

### 28.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] `useCameraStream` 훅이 구현되어 있다.
- [ ] `useTreasureClaim` 훅이 구현되어 있다.
- [ ] `useARLifecycleCleanup` 훅이 구현되어 있다.
- [ ] React Three Fiber로 3D 모델이 렌더링된다.
- [ ] `.glb` 에셋 경로가 표준화되어 있다.
- [ ] Supabase RPC 호출 로직이 구현되어 있다.
- [ ] 카메라 스트림 정리 로직이 모든 이탈 경로에 적용되어 있다.
- [ ] 기프티쇼비즈 API를 호출하지 않는다.
- [ ] 쿠폰 코드와 바코드를 표시하지 않는다.
- [ ] 쿠폰 코드를 표시하지 않는다.

### 28.4 제외 기능 확인

- [ ] ARKit/ARCore를 사용하지 않는다.
- [ ] 월드 트래킹을 하지 않는다.
- [ ] 평면 인식을 하지 않는다.
- [ ] 네이버 지도를 표시하지 않는다.
- [ ] 힌트를 표시하지 않는다.
- [ ] 기프티쇼비즈 API를 호출하지 않는다.
- [ ] 쿠폰 코드와 바코드를 표시하지 않는다.
- [ ] 쿠폰 코드 또는 바코드를 표시하지 않는다.

---

## 29. 제외 범위

이 화면에서는 아래 기능을 구현하지 않는다.

- ARKit/ARCore 기반 네이티브 AR
- 공간 인식
- 바닥/벽 인식
- 실시간 환경 조명
- 네이버 지도 표시
- 힌트 표시
- 보물상자 목록 표시
- 보관함 조회
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 바코드 표시
- 쿠폰 사용 완료 처리
- 쿠폰 재발송/취소
- 관리자 기능

---

## 30. 개발자 주의사항

- 이 화면은 WebView 기반 WebAR Lite 화면이다.
- 카메라 스트림은 `@capacitor/camera`가 아니라 `navigator.mediaDevices.getUserMedia`를 사용한다.
- `@capacitor/camera`는 사진 촬영용이므로 AR 실시간 카메라 피드에는 사용하지 않는다.
- 3D 보물상자는 화면 중앙 고정 렌더링을 기본으로 한다.
- 지도 화면에서 계산한 거리는 안내용이며, AR 화면에서 RPC로 최종 검증한다.
- 보물 획득 성공 시 실제 쿠폰 코드를 발급하지 않는다.
- 성공 시 보관함에 `issue_status = ready` 상태의 보상 수령권을 생성한다.
- 기프티쇼비즈 API는 보관함에서 사용자가 `쿠폰 받기`를 실행할 때만 호출한다.
- 화면 이탈 시 카메라 스트림을 반드시 정리한다.
- iOS WebView에서 카메라, 오디오, 진동 정책을 별도 테스트해야 한다.
- Android 뒤로가기와 앱 백그라운드 전환 처리를 반드시 구현한다.


---

## 99. 디자인 반영 개발자 주의사항

- AR 사냥 화면 배경은 실제 카메라 프리뷰다.
- 지도, 하단 탭바, 쿠폰 UI는 이 화면에 표시하지 않는다.
- 보물상자는 `model_treasure_chest_ar_default.glb`를 우선 사용한다.
- `.glb` 로딩 전에는 `sprite_treasure_chest_ar_fallback_default.svg`를 임시 표시할 수 있다.
- 상단 안내 말풍선은 `ui_frame_ar_instruction_bubble_rough_default.svg`를 사용한다.
- 하단 tracking badge는 `ui_frame_ar_tracking_status_rough_default.svg`를 사용한다.
- `GRUG TAP HERE`, `LIVE AR TRACKING ACTIVE`, `상자를 터치해 열어보거라`는 이미지에 포함하지 않고 코드 텍스트로 구현한다.
- 보물상자 터치 후에는 클레임 RPC를 실행하고 결과 화면으로 이동한다.
- 이 화면에서는 기프티쇼비즈 API를 호출하지 않는다.
