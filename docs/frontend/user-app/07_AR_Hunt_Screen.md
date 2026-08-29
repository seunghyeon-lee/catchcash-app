# 07. AR 사냥 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 07. AR 사냥 화면 정의서 |
| 파일명 | `07_AR_Hunt_Screen.md` |
| 화면명 | AR 사냥 화면 |
| 화면 ID | `07_AR_Hunt_Screen` |
| 서비스 | 캐치캐쉬 CatchCash |
| 대상 환경 | iOS / Android Capacitor WebView |
| Route | `/ar-hunt?treasureId={treasure_box_id}` |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS |
| AR 방식 | WebView 기반 WebAR Lite |
| 카메라 | `navigator.mediaDevices.getUserMedia` |
| 3D | Three.js + React Three Fiber |
| 앱 브릿지 | Capacitor |
| 위치 | Capacitor Geolocation |
| 인증/데이터 | Supabase Auth + PostgreSQL + RPC |
| 3D 공용 컴포넌트 | `TreasureChest3D` |
| 공용 3D 모델 | `/assets/3d/treasure/chest.glb` |

### 1.1 2026-08-29 최신 구현 반영

이번 개정에서 아래 정책을 공식 기준으로 확정한다.

- 팀원2가 제작하는 공용 `TreasureChest3D`를 AR 화면에서 재사용한다.
- Blender 기반 별도 모델 제작은 MVP 범위에서 제외한다.
- 상업 이용 가능한 Low-poly animated GLB 1개를 사용한다.
- Basic / Gold / Mystery 3종은 동일 GLB의 코드 기반 variant로 표현한다.
- AR은 ARKit/ARCore 공간 인식이 아니라 카메라 영상 + R3F 오버레이 방식의 WebAR Lite다.
- AR 화면에서 당첨/꽝 팝업을 새로 만들지 않는다.
- 정상 클레임 결과 수신 후 상자 Open/Effect 연출을 완료하고 기존 `/hunt-result`로 이동한다.
- 팀원2는 3D 상자, 팀원3은 AR 카메라/위치/클레임/화면 전환을 담당한다.

---

## 2. 화면 개요

AR 사냥 화면은 사용자가 지도 또는 보물 힌트 단계에서 사냥 가능한 거리까지 접근한 뒤 진입하는 보물 획득 화면이다.

```txt
지도/힌트
→ 사냥하기
→ /ar-hunt?treasureId=...
→ 후면 카메라 실행
→ 3D 보물상자 표시
→ 사용자가 상자 터치
→ 현재 위치 재확인
→ 서버 클레임 검증
→ 상자 Open/Effect
→ /hunt-result
```

MVP에서는 실제 바닥이나 벽을 인식하지 않는다. 카메라 스트림을 전체 화면 배경으로 사용하고 그 위에 3D 상자를 화면 중앙에 배치한다.

---

## 3. 구현 범위

### 3.1 MVP에서 구현

- 후면 카메라 실시간 프리뷰
- 전체 화면 WebAR Lite 화면
- 투명 R3F Canvas
- 팀원2 `TreasureChest3D` 배치
- 상자 Idle floating
- 상자 터치
- 중복 터치 잠금
- 햅틱/진동 피드백
- 현재 GPS 재조회
- Supabase 클레임 RPC 연결
- 정상 클레임 결과를 3D 상자에 전달
- Shake → Open → Light/Sparkle 연출
- `onOpenComplete()` 수신
- `/hunt-result` 이동
- 카메라/리소스 cleanup
- 권한 거부/카메라 오류/서버 오류 fallback

### 3.2 MVP에서 제외

- ARKit
- ARCore
- SLAM
- 평면 인식
- 월드 트래킹
- 바닥/벽 고정 배치
- 환경광 추정
- 실제 공간 좌표에 3D 상자 anchor
- 복잡한 실시간 그림자
- 고비용 post-processing
- AR 화면 내 기프티쇼비즈 API 호출
- AR 화면 내 쿠폰/바코드 표시
- AR 화면 내 당첨/꽝 팝업

---

## 4. 기술 스택

| 영역 | 기술 |
|---|---|
| Framework | Next.js App Router |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Camera | WebRTC `getUserMedia` |
| 3D Engine | Three.js |
| React 3D | `@react-three/fiber` |
| 3D Helper | `@react-three/drei` |
| App Shell | Capacitor |
| Location | Capacitor Geolocation |
| Haptics | Capacitor Haptics / `navigator.vibrate` fallback |
| Auth | Supabase Auth |
| DB | Supabase PostgreSQL |
| Claim | Supabase RPC 연결 대상 |

### 4.1 WebAR Lite 구조

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js /ar-hunt
→ <video> Camera Stream
→ Transparent R3F Canvas
→ TreasureChest3D
→ Supabase Claim
→ /hunt-result
```

---

## 5. 진입 조건

### 5.1 필수 조건

- Supabase session 존재
- 사용자 profile 사용 가능 상태
- `treasureId` 존재
- 선택한 보물상자 사용 가능 상태
- 현재 위치 조회 가능
- 지도/힌트 단계에서 사냥 가능 거리로 판정
- 카메라 사용 가능

### 5.2 Query Parameter

```txt
/ar-hunt?treasureId={treasure_box_id}
```

| 파라미터 | 필수 | 설명 |
|---|---:|---|
| `treasureId` | O | 사냥 대상 `treasure_boxes.id` |

`treasureId`가 없으면 AR 화면을 진행하지 않고 지도 화면으로 복귀한다.

### 5.3 위치 정책

지도 화면에서 계산한 거리는 진입 안내용이다.

최종 획득 판단에는 AR 화면에서 위치를 다시 조회하여 서버 검증 요청에 포함한다.

```txt
지도 거리 확인
→ AR 진입
→ 상자 터치
→ GPS 재조회
→ 서버 거리 검증
```

클라이언트에서 계산한 거리만으로 획득을 확정하지 않는다.

---

## 6. 화면 레이어

```txt
Layer 1  CameraVideoBackground
Layer 2  Dark Overlay
Layer 3  Transparent R3F Canvas
         └─ TreasureChest3D
Layer 4  AR UI Overlay
         ├─ Close Button
         ├─ Instruction Bubble
         ├─ Tap Indicator
         ├─ Status Badge
         └─ End Button
Layer 5  Loading / Claiming / Error Overlay
```

### 6.1 레이아웃 원칙

- 카메라 프리뷰는 화면 전체를 채운다.
- `object-fit: cover`를 사용한다.
- 3D 상자는 화면 중앙에 배치한다.
- 하단 앱 GNB는 표시하지 않는다.
- 닫기 버튼은 safe area를 고려한다.
- AR UI는 상자 터치를 방해하지 않도록 pointer event 범위를 분리한다.

---

## 7. 카메라 구현

### 7.1 기본 요청

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
});
```

### 7.2 Video Element

```txt
playsInline
muted
autoPlay
width: 100vw
height: 100vh
object-fit: cover
```

### 7.3 주의

실시간 카메라 피드는 `@capacitor/camera`로 구현하지 않는다.

`@capacitor/camera`는 사진 촬영 중심이므로 AR 사냥의 실시간 배경은 `getUserMedia`를 사용한다.

### 7.4 카메라 정리

화면을 벗어날 때 모든 track을 종료한다.

```ts
stream?.getTracks().forEach((track) => track.stop());
```

정리 대상:

- 닫기 클릭
- 종료하기 클릭
- route 변경
- Android back
- 앱 background 전환
- component unmount

---

## 8. 3D 보물상자 연동

### 8.1 공용 컴포넌트

AR 화면에서는 팀원2의 다음 컴포넌트를 사용한다.

```txt
components/hunt/TreasureChest3D.tsx
```

3D 파일:

```txt
public/assets/3d/treasure/chest.glb
```

### 8.2 팀원2 컴포넌트의 역할

`TreasureChest3D`가 담당한다.

- GLB 로딩
- `basic / gold / mystery` variant
- Idle floating
- Tap interaction
- Shake
- Open animation
- Light/Sparkle effect
- `onOpenStart()`
- `onOpenComplete()`

### 8.3 AR 화면의 역할

AR 담당자는 다음만 담당한다.

- 카메라
- R3F Canvas
- 상자 화면 배치
- AR 상태 관리
- GPS 재조회
- 클레임 호출
- 정상 결과 전달
- 결과 화면 이동
- cleanup

AR 담당자는 별도의 3D 상자 모델이나 상자 애니메이션을 새로 구현하지 않는다.

### 8.4 권장 사용 형태

```tsx
<Canvas className="absolute inset-0" gl={{ alpha: true }}>
  <Suspense fallback={<ChestFallbackSprite />}>
    <TreasureChest3D
      variant={chestVariant}
      result={claimResult}
      disabled={status !== 'ready'}
      onOpenStart={handleOpenStart}
      onOpenComplete={handleOpenComplete}
    />
  </Suspense>
</Canvas>
```

### 8.5 중요한 금지 사항

`TreasureChest3D` 내부에서 아래를 처리하지 않는다.

- GPS 조회
- Supabase claim
- 당첨/꽝 랜덤 결정
- Naver Map
- Giftishow
- `/hunt-result` 라우팅

### 8.6 팀원2 작업이 아직 미병합인 경우

팀원3은 임시 fallback으로 개발할 수 있다.

```txt
2D treasure sprite
또는
단순 R3F placeholder box
```

최종 PR 전에는 main을 최신화한 뒤 `TreasureChest3D`로 교체한다.

---

## 9. 상자 Variant

MVP의 상자 3종은 모델 파일을 3개 만들지 않는다.

하나의 `chest.glb`를 사용한다.

| Variant | 표현 |
|---|---|
| `basic` | 기본 나무/은색 계열 |
| `gold` | 금색 포인트 + 조금 더 강한 효과 |
| `mystery` | 보라/청록 계열 + 신비로운 효과 |

Variant 선택 기준은 보물/보상 정책과 연결 가능하도록 외부 prop으로 전달한다.

AR 담당자가 material을 직접 변경하지 않는다.

---

## 10. 사용자 액션 핵심 플로우

### 10.1 기본 상태

```txt
Camera Ready
+ TreasureChest3D Idle Floating
+ 안내 문구
+ TAP Indicator
```

### 10.2 상자 터치

최종 MVP 플로우:

```txt
사용자가 상자 터치
→ 추가 터치 즉시 잠금
→ 햅틱/진동
→ 현재 GPS 재조회
→ claim_treasure_with_lock RPC 요청
→ 서버 결과 수신
```

정상적인 게임 결과를 받은 경우:

```txt
보상 획득 또는 빈 상자
→ claim 결과를 TreasureChest3D에 전달
→ Shake
→ Open
→ Light / Sparkle Effect
→ onOpenComplete()
→ 카메라/AR 리소스 정리
→ /hunt-result 이동
```

운영/검증 실패인 경우:

```txt
거리 초과 / 마감 / 중복 획득 / 정지 / 서버 오류
→ 상자를 당첨/꽝처럼 열지 않음
→ 오류 안내
→ 정책에 따라 재시도 또는 지도/로그인으로 이동
```

### 10.3 왜 claim 후 Open인가

상자가 먼저 열리고 서버가 실패하면 사용자 경험과 서버 결과가 충돌할 수 있다.

따라서 정상 결과가 확인된 뒤 Open 연출을 실행한다.

네트워크 대기 중에는 짧은 loading/claiming 상태를 표시한다.

---

## 11. 결과 화면 정책

AR 화면에서는 당첨/꽝 팝업을 별도로 만들지 않는다.

기존 화면을 사용한다.

```txt
08_Hunt_Result_Screen
/hunt-result
```

### 11.1 보상 획득

`/hunt-result`에서 기존 당첨 디자인을 표시한다.

### 11.2 빈 상자

`/hunt-result`에서 기존 빈 상자 디자인을 표시한다.

### 11.3 AR에서 하지 않는 것

- 상품 상세 카드 결과 UI 생성
- 빈 상자 결과 화면 생성
- 보관함 CTA 복제
- Hunt Log 복제

위 결과 UX는 모두 `08_Hunt_Result_Screen`이 담당한다.

---

## 12. 상태 정의

```ts
export type ARHuntStatus =
  | 'initial'
  | 'checking_permission'
  | 'camera_loading'
  | 'asset_loading'
  | 'ready'
  | 'touching'
  | 'claiming'
  | 'opening'
  | 'claimed'
  | 'failed'
  | 'camera_error'
  | 'permission_denied'
  | 'unsupported';
```

| 상태 | 의미 |
|---|---|
| `initial` | 초기화 |
| `checking_permission` | 권한 확인 |
| `camera_loading` | 카메라 로딩 |
| `asset_loading` | 3D 로딩 |
| `ready` | 사냥 가능 |
| `touching` | 최초 터치 직후 |
| `claiming` | 위치 조회/서버 검증 중 |
| `opening` | 정상 결과 후 Open 연출 중 |
| `claimed` | 결과 화면 이동 준비 |
| `failed` | 운영/검증 실패 |
| `camera_error` | 카메라 오류 |
| `permission_denied` | 권한 거부 |
| `unsupported` | 기능 미지원 |

### 12.1 중복 터치 방지

`ready` 상태에서만 터치를 받는다.

```ts
if (status !== 'ready') return;
```

첫 터치 이후 결과 처리와 화면 전환이 끝날 때까지 추가 탭을 무시한다.

---

## 13. Claim 연결 정책

### 13.1 기본 원칙

획득 여부는 클라이언트가 확정하지 않는다.

최종 검증은 Supabase 서버 측 로직에서 처리한다.

현재 AR 명세에서는 다음 RPC 계약을 구현/연결 대상으로 사용한다.

```txt
claim_treasure_with_lock
```

> 실제 DB에 함수가 아직 없는 경우 팀원3이 임의의 클라이언트 확정 로직으로 대체하지 않는다. 서버 RPC 구현 상태를 확인한 뒤 연결한다.

### 13.2 요청 예시

```ts
type ClaimTreasureRequest = {
  treasure_box_id: string;
  user_latitude: number;
  user_longitude: number;
};
```

### 13.3 서버 검증 대상

- 인증 사용자
- 계정 사용 가능 상태
- 대상 보물 존재
- 보물 활성/기간 상태
- 남은 획득 가능 수량
- 중복 획득 여부
- 현재 GPS와 보물 좌표 거리
- 동시 획득 경쟁 상태

### 13.4 중요한 보안 정책

- 클라이언트 거리만 신뢰하지 않는다.
- 클라이언트에서 `Math.random()`으로 당첨 여부를 확정하지 않는다.
- 보상/빈 상자 판정은 서버 결과를 사용한다.
- API Secret을 브라우저에 넣지 않는다.

---

## 14. 기프티콘 API와의 관계

기프티콘 API는 이번 AR 구현 범위가 아니다.

```txt
AR 사냥
→ 보물 획득 결과
→ 보관함 보상 상태 생성/표시
→ 추후 쿠폰 발급 플로우
```

AR 화면에서는 다음을 하지 않는다.

- Giftishow API 호출
- 쿠폰 코드 표시
- 바코드 표시
- API Secret 사용
- 쿠폰 재발송/취소

---

## 15. 카메라 권한/오류

### 15.1 권한 거부

표시 예:

```txt
카메라 권한을 허용해야 사냥에 참여할 수 있어요.
```

액션:

- 다시 시도
- 지도로 돌아가기
- 영구 거부 상태에서는 OS 설정 안내 가능

### 15.2 기능 미지원

```txt
이 기기에서는 카메라 사냥을 사용할 수 없어요.
```

확인 대상:

- `navigator.mediaDevices`
- `getUserMedia`
- WebView 카메라 권한

### 15.3 카메라 점유/실패

```txt
카메라를 시작하지 못했어요.
다른 앱에서 카메라를 사용 중인지 확인해주세요.
```

재시도 또는 지도 복귀를 제공한다.

---

## 16. 3D 로드 실패

`TreasureChest3D` 또는 `chest.glb` 로드에 실패하면 앱 전체를 crash시키지 않는다.

MVP fallback:

- 2D 보물상자 sprite
- 간단한 placeholder
- 재시도 UI

단, fallback은 개발/오류 대응용이며 정상 경로는 `TreasureChest3D`다.

---

## 17. 햅틱/사운드/시각 효과

### 17.1 햅틱

우선순위:

```txt
Capacitor Haptics
→ navigator.vibrate
→ 미지원 시 생략
```

### 17.2 사운드

선택 사항.

사용자 터치 이후 Open 효과음을 재생할 수 있다.

iOS WebView의 사용자 제스처/오디오 정책을 실제 기기에서 확인한다.

### 17.3 3D 효과

상자 자체 효과는 팀원2 `TreasureChest3D`가 담당한다.

- Idle floating
- Shake
- Open
- Light
- Sparkle

AR 담당은 동일 효과를 중복 구현하지 않는다.

---

## 18. 화면 UI

### 18.1 확정 구조

```txt
실제 Dark Camera Preview
→ 우측 상단 닫기
→ 상단 안내 말풍선
→ 중앙 TreasureChest3D
→ TAP 안내
→ 하단 AR 상태 배지
→ 종료하기
```

### 18.2 카피

| 요소 | 기본 문구 |
|---|---|
| 안내 | `상자를 터치해 열어보거라` |
| Tap | `GRUG TAP HERE` 또는 확정 디자인 문구 |
| Ready | `AR 사냥 모드 활성화` |
| Claiming | `보상 확인 중...` |
| Camera denied | `카메라 없이는 못 연다.` |
| Error | `상자가 말을 안 듣는다. 다시 눌러봐.` |

`LIVE AR TRACKING ACTIVE`는 디자인 표현으로 유지할 수 있으나 실제 월드 트래킹을 의미하지 않는다.

기술 의미를 정확히 전달하려면 `AR 사냥 모드 활성화` 문구 사용을 권장한다.

---

## 19. 디자인 에셋

### 19.1 공용 3D

```txt
public/assets/3d/treasure/chest.glb
```

목표:

- Low-poly
- Animated Open clip 포함
- 상업 이용 가능 라이선스
- 가능하면 CC0/Public Domain
- 2MB 이하 목표

### 19.2 AR UI 에셋

기존 디자인 에셋이 존재하는 경우 파일명을 유지한다.

```txt
icon_action_close_circle_rough_default_24.svg
ui_frame_ar_instruction_bubble_rough_default.svg
icon_ar_tap_pointer_red_default_32.svg
ui_frame_ar_tracking_status_rough_default.svg
sprite_treasure_chest_ar_fallback_default.svg   # optional
```

텍스트를 이미지에 합치지 않는다.

---

## 20. 권장 컴포넌트 구조

### 화면

```txt
ARHuntPage
```

### AR 담당 컴포넌트

```txt
CameraVideoBackground
ARCanvas
ARInstructionCard
ARCloseButton
TapIndicator
ARStatusBadge
AREndButton
ARLoadingOverlay
ARClaimingOverlay
ARErrorFallback
```

### 팀원2 공용 컴포넌트

```txt
TreasureChest3D
TreasureChestScene (필요 시)
```

### Hook

```txt
useCameraStream
useTreasureClaim
useARLifecycleCleanup
useHapticFeedback
useCurrentLocationForClaim
```

### Utility

```txt
stopMediaStream
checkCameraSupport
mapCameraErrorMessage
mapClaimErrorMessage
buildClaimPayload
```

---

## 21. 권장 파일 구조

```txt
app/
  ar-hunt/
    page.tsx

features/
  ar/
    components/
      CameraVideoBackground.tsx
      ARCanvas.tsx
      ARInstructionCard.tsx
      ARCloseButton.tsx
      TapIndicator.tsx
      ARStatusBadge.tsx
      AREndButton.tsx
      ARLoadingOverlay.tsx
      ARClaimingOverlay.tsx
      ARErrorFallback.tsx
    hooks/
      useCameraStream.ts
      useTreasureClaim.ts
      useARLifecycleCleanup.ts
      useHapticFeedback.ts
      useCurrentLocationForClaim.ts
    services/
      ar.service.ts
      treasureClaim.service.ts
    types/
      ar.types.ts

components/
  hunt/
    TreasureChest3D.tsx
    TreasureChestScene.tsx

public/
  assets/
    3d/
      treasure/
        chest.glb
```

기존 프로젝트 구조와 충돌하는 경우 무조건 새 폴더를 만들지 말고 현재 구조를 우선 확인한다.

---

## 22. 팀원2 / 팀원3 분업

### 팀원2 — 3D 보물상자

```txt
무료 GLB 선정/라이선스 확인
TreasureChest3D
basic / gold / mystery
Idle
Tap
Shake
Open
Light / Sparkle
onOpenStart
onOpenComplete
```

### 팀원3 — AR

```txt
getUserMedia
카메라 permission
Camera Video
R3F Canvas
TreasureChest3D 배치
AR 상태 관리
현재 GPS 재확인
Claim RPC 연결
정상 결과 전달
Open 완료 대기
/hunt-result 이동
cleanup
error/fallback
```

### 충돌 방지 규칙

- 팀원3은 `TreasureChest3D.tsx` 내부를 임의 수정하지 않는다.
- 팀원2는 AR 카메라 훅과 claim 로직을 수정하지 않는다.
- 동일 GLB를 AR 폴더에 복제하지 않는다.
- 팀원2가 먼저 merge되지 않아도 팀원3은 placeholder로 병렬 작업 가능하다.
- 최종 AR PR 전에 최신 main을 반영하고 `TreasureChest3D`를 연결한다.

---

## 23. 리소스 생명주기

### 진입

```txt
1. treasureId 확인
2. auth/profile 확인
3. 카메라 지원 확인
4. 카메라 권한 확인
5. getUserMedia
6. video stream bind
7. R3F Canvas init
8. TreasureChest3D load
9. ready
```

### 이탈

```txt
camera tracks stop
R3F unmount
animation cleanup
audio cleanup
listener cleanup
pending task cleanup where possible
```

앱 background/foreground 복귀 시 카메라 재시작 정책을 실제 Capacitor 환경에서 검증한다.

---

## 24. 접근성

- 닫기 버튼 `aria-label="AR 사냥 종료"`
- 주요 안내는 코드 텍스트로 제공
- 3D 상자 터치만으로 조작이 어려운 경우 `상자 열기` 대체 버튼 제공 가능
- 버튼과 3D 클릭 영역이 겹치지 않게 구성
- 상태 변경 중에는 필요한 안내 텍스트 표시

---

## 25. 보안 정책

- 로그인 사용자만 사냥 가능
- `treasureId` 없는 요청 차단
- 획득 확정은 클라이언트가 하지 않음
- GPS 최종 검증은 서버 측 정책 사용
- 당첨/꽝을 `Math.random()`으로 구현하지 않음
- Supabase Secret / Service Role을 클라이언트에 넣지 않음
- Giftishow Secret을 클라이언트에 넣지 않음
- 쿠폰 코드/바코드를 AR 화면에 표시하지 않음

---

## 26. QA 시나리오

### QA-01 정상 진입

- 유효한 treasureId
- 카메라 허용
- Camera preview 표시
- 3D 상자 표시
- Idle 정상

### QA-02 상자 터치

- 최초 클릭만 처리
- 추가 탭 잠금
- 위치 재조회
- Claim 1회

### QA-03 보상 획득 결과

- 서버 정상 결과
- 3D Open/Effect
- `onOpenComplete()` 1회
- 카메라 stop
- `/hunt-result` 이동

### QA-04 빈 상자 결과

- 서버 정상 빈 상자 결과
- Open/Effect 정상
- `/hunt-result` 빈 상자 상태로 이동

### QA-05 거리 초과

- 빈 상자로 처리하지 않음
- 오류 안내
- 지도 복귀 정책 확인

### QA-06 카메라 거부

- 권한 안내
- 화면 crash 없음
- 지도 복귀 가능

### QA-07 GLB 오류

- 화면 crash 없음
- fallback/오류 안내

### QA-08 다중 탭

- 빠르게 여러 번 눌러도 Claim 1회
- Open 1회

### QA-09 화면 종료

- 카메라 indicator가 계속 켜져 있지 않음
- track stop 확인

### QA-10 실제 모바일 WebView

- Android Capacitor
- iOS Capacitor
- 카메라 방향
- safe area
- 햅틱
- 오디오(사용 시)
- background 복귀

---

## 27. 완료 기준

### UI

- [ ] `/ar-hunt` 정상 렌더
- [ ] 후면 카메라 전체 화면
- [ ] Dark overlay
- [ ] 안내 UI
- [ ] `TreasureChest3D` 중앙 표시
- [ ] TAP 안내
- [ ] 상태 표시
- [ ] 종료 UI
- [ ] 앱 하단 GNB 미표시

### 기능

- [ ] treasureId 검증
- [ ] 카메라 permission
- [ ] getUserMedia
- [ ] 카메라 stream bind
- [ ] `TreasureChest3D` 연결
- [ ] Idle 확인
- [ ] 최초 터치만 허용
- [ ] GPS 재조회
- [ ] Claim RPC 연결
- [ ] 정상 결과 후 Open/Effect
- [ ] `onOpenComplete()` 후 `/hunt-result`
- [ ] 별도 당첨/꽝 팝업 없음
- [ ] 운영 오류 분리 처리
- [ ] 모든 이탈 경로에서 camera cleanup

### 기술

- [ ] TypeScript
- [ ] R3F 투명 Canvas
- [ ] 공용 `/assets/3d/treasure/chest.glb` 사용
- [ ] 팀원2 컴포넌트 중복 구현 없음
- [ ] ARKit/ARCore 미사용
- [ ] Naver Map 미렌더
- [ ] Giftishow 미호출
- [ ] 민감 API key 노출 없음
- [ ] 모바일 WebView QA
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] `npx tsc --noEmit` 통과

---

## 28. 개발자 주의사항

1. 이 화면에서 말하는 AR은 WebAR Lite다.
2. `LIVE AR TRACKING` 디자인 문구가 있어도 실제 공간 tracking을 구현하라는 의미가 아니다.
3. 카메라 프리뷰 위 중앙에 3D 상자를 띄우는 것이 MVP 기준이다.
4. 3D 상자 동작은 팀원2 `TreasureChest3D`를 재사용한다.
5. AR 팀원이 Blender/GLB 수정에 들어가지 않는다.
6. 상자 클릭 즉시 결과를 클라이언트에서 결정하지 않는다.
7. 서버의 정상 게임 결과를 받은 뒤 Open 연출을 한다.
8. AR 내부에서 결과 팝업을 만들지 않는다.
9. 결과는 기존 `08_Hunt_Result_Screen`(`/hunt-result`)에서 보여준다.
10. 화면 이탈 시 카메라 stream cleanup은 필수다.
11. 기프티콘 API는 이번 작업과 분리한다.
12. iOS/Android 실제 Capacitor WebView에서 반드시 카메라를 테스트한다.
