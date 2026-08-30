# 04-2. 캐치캐쉬 안내 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 04-2. 캐치캐쉬 안내 화면 정의서 |
| 파일명 | `04_2_CatchCash_Guide_Screen.md` |
| 적용 위치 | 메인 홈 상단 GNB 안내 아이콘 |
| 관련 화면 ID | `04_Main_Home_Screen` |
| 화면 ID | `04_2_CatchCash_Guide_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 캐치캐쉬 서비스 안내 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 안내 화면 시안 기준 / guide 전용 frame 에셋 적용 / STEP 홀수·짝수 프레임 분리 |

---

## 2. 화면 개요

캐치캐쉬 안내 화면은 메인 홈 상단 GNB의 안내 아이콘을 눌렀을 때 진입하는 서비스 이용 가이드 화면이다.

사용자에게 캐치캐쉬의 기본 이용 방식, 보물 탐색 흐름, AR 사냥 방식, 보상 수령 방식을 간단하게 설명한다.

Stitch AI 시안 기준으로 안내 카드, STEP 카드, 중요 안내 카드, 권한 안내 카드, 하단 CTA는 손그림 rough frame 에셋을 사용한다. 단, 모든 텍스트와 실제 클릭 영역은 코드로 구현한다.

이 화면은 실제 AR 사냥 화면으로 진입하기 전의 필수 단계가 아니라, 사용자가 언제든지 확인할 수 있는 도움말 성격의 안내 화면이다.

---

## 3. 화면 목적

### 핵심 목적

- 캐치캐쉬가 어떤 서비스인지 설명한다.
- 사용자가 보물을 찾는 기본 흐름을 이해하게 한다.
- 지도 탐색, AR 사냥, 보관함 쿠폰 수령의 관계를 설명한다.
- 신규 사용자의 혼란을 줄인다.
- GNB 안내 아이콘의 목적지를 제공한다.

### 사용자 관점 목적

- 캐치캐쉬 이용 방법을 빠르게 확인한다.
- 보물을 찾으려면 무엇을 해야 하는지 이해한다.
- 보상을 어디서 받을 수 있는지 확인한다.
- 카메라와 위치 권한이 왜 필요한지 이해한다.

---

## 4. 메인 홈 GNB와의 관계

메인 홈 화면 상단 GNB에는 우측에 총 3개의 아이콘이 존재한다.

| 순서 | 아이콘 | 기능 |
|---:|---|---|
| 1 | 알림 아이콘 | 알림 레이어 팝업 열기 |
| 2 | 캐치캐쉬 안내 아이콘 | 캐치캐쉬 안내 화면 열기 |
| 3 | 설정 이동 아이콘 | 설정 또는 내정보 화면 이동 |

캐치캐쉬 안내 아이콘을 클릭하면 이 화면으로 이동한다.

```txt
메인 홈
→ GNB 안내 아이콘 클릭
→ 캐치캐쉬 안내 화면 진입
```

---

## 5. 기술 구현 기준

### 5.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ CatchCash Guide Screen
```

### 5.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |

### 5.3 데이터 및 상태

| 항목 | 기준 |
|---|---|
| 인증 | Supabase Auth 세션 필요 |
| 데이터 조회 | 정적 콘텐츠 중심 |
| 서버 상태 | 기본적으로 필요 없음 |
| 전역 상태 | route 이동 및 UI 상태만 사용 |
| 권한 요청 | 이 화면에서는 직접 요청하지 않음 |

### 5.4 이 화면에서 사용하지 않는 기능

- GPS 위치 권한 요청
- 카메라 권한 요청
- WebAR 실행
- R3F 3D 렌더링
- 네이버 지도 로드
- 기프티쇼비즈 API 호출
- 쿠폰 코드 표시
- 쿠폰 발급
- 관리자 기능

---

## 6. 진입 조건

### 6.1 진입 시점

사용자는 아래 상황에서 이 화면으로 진입한다.

| 상황 | 설명 |
|---|---|
| 메인 홈 GNB 안내 아이콘 클릭 | 가장 기본 진입 경로 |
| 도움말 링크 클릭 | 다른 화면에서 안내가 필요한 경우 |
| 온보딩 후 가이드 확인 | 사용자가 서비스 설명을 다시 보고 싶은 경우 |

### 6.2 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| 메인 홈 화면 | 안내 아이콘 클릭 |
| 지도 상세 화면 | 도움말 또는 안내 아이콘 클릭 시 가능 |
| AR 가이드 화면 | 상세 설명 링크 클릭 시 가능 |
| 내정보/설정 화면 | 서비스 안내 메뉴 클릭 시 가능 |

### 6.3 Route

```txt
/guide
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/guide/page.tsx
```

---

## 7. 종료 및 이동 규칙

| 사용자 액션 | 처리 |
|---|---|
| 닫기 버튼 클릭 | 이전 화면으로 복귀 |
| 뒤로가기 | 이전 화면으로 복귀 |
| 지도 뒤지러 가기 클릭 | 지도 상세 화면으로 이동 |
| 보관함 안내 CTA 클릭 | 보관함 화면으로 이동 |
| 약관/문의 링크 클릭 | 해당 화면 또는 외부 링크 열기 |

### 7.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 메인 홈 | `04_Main_Home_Screen` | `/home` |
| 지도 상세 | `05_Map_Detail_Screen` | `/map` |
| 보관함 | `09_Inventory_Screen` | `/inventory` |
| 문의하기 | `Support_Inquiry_Screen` | `/support` |

---

## 8. 화면 레이아웃

### 8.1 전체 구조

```txt
┌──────────────────────────────┐
│ ←        캐치캐쉬 안내        │
├──────────────────────────────┤
│                              │
│ 뭐 하는 앱인지 알려줄게.       │
│ 지도 보고, 가까이 가고, 열면 끝. │
│                              │
│ [소개 카드 rough frame]        │
│ 캐치캐쉬가 뭐냐면              │
│                              │
│ [STEP 1 odd frame] 지도 열어라 │
│ [STEP 2 even frame] 가까이 가라│
│ [STEP 3 odd frame] AR로 찾아라 │
│ [STEP 4 even frame] 전리품 챙겨라│
│                              │
│ [검은 안내 카드 rough frame]    │
│ [권한 안내 카드 rough frame]    │
│                              │
│ [공통 CTA frame] 지도 뒤지러 가기│
│                              │
└──────────────────────────────┘
```

### 8.2 레이아웃 원칙

- 모바일 세로 화면 기준으로 설계한다.
- 화면은 세로 스크롤 가능하게 구성한다.
- 상단에는 뒤로가기 버튼과 화면명 `캐치캐쉬 안내`를 배치한다.
- 본문에는 타이틀, 소개 카드, STEP 카드 4개, 보상 안내 카드, 권한 안내 카드, CTA를 배치한다.
- 하단 네비게이션은 표시하지 않는다.
- 사용자가 1분 안에 서비스 흐름을 이해할 수 있도록 문구를 짧게 구성한다.

---

## 9. 디자인 시스템 적용

### 9.1 디자인 방향

캐치캐쉬 안내 화면은 서비스 사용법을 설명하는 화면이므로, 정보 전달을 우선한다.  
첨부 예시 화면의 구조는 참고하되, 색상과 디자인 스타일은 글로벌 모노톤 디자인 토큰을 따른다.

디자인 키워드:

```txt
Black and White
Hand-drawn Wireframe
Sketch-style Mobile UI
Paper-like Background
Rough Frame
Guide
Readable
Sarcastic Brand Tone
Mobile Onboarding
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

### 9.4 Shape Token

| 요소 | Radius |
|---|---|
| 소개 카드 | `ui_frame_guide_intro_card_rough_lg.svg` 프레임 형태 |
| STEP 1/3 카드 | `ui_frame_guide_step_card_odd_rough_default.svg` 프레임 형태 |
| STEP 2/4 카드 | `ui_frame_guide_step_card_even_rough_default.svg` 프레임 형태 |
| 중요 안내 카드 | `ui_frame_guide_notice_black_rough_lg.svg` 프레임 형태 |
| 권한 안내 카드 | `ui_frame_guide_permission_card_rough_lg.svg` 프레임 형태 |
| CTA 버튼 | `ui_frame_button_hunt_join_rough_default.svg` 프레임 형태 |
| 뒤로가기 버튼 터치 영역 | 최소 44px |

### 9.5 Spacing 기준

| 영역 | 기준 |
|---|---|
| 화면 좌우 여백 | 20px~24px |
| 헤더 높이 | 56px~64px |
| 본문 상단 여백 | 24px |
| 가이드 이미지 높이 | 140px~180px |
| 카드 간격 | 12px |
| CTA 버튼 높이 | 56px |
| 하단 safe area | 필수 적용 |

---

## 10. UI 구성 요소

## 10.1 상단 헤더

### 구성

| 영역 | 요소 |
|---|---|
| 좌측 | 뒤로가기 버튼 |
| 중앙 | `캐치캐쉬 안내` |
| 우측 | 없음 |

### 뒤로가기 버튼

| 항목 | 정의 |
|---|---|
| 아이콘 | `icon_nav_back_circle_rough_default_32.svg` |
| 터치 영역 | 최소 44px |
| 동작 | 이전 화면으로 복귀 |
| 접근성 라벨 | `캐치캐쉬 안내 화면 뒤로가기` |

### 브랜드 텍스트

| 항목 | 값 |
|---|---|
| Font | Plus Jakarta Sans |
| Weight | 700 |
| Size | 16px~18px |
| Color | `primary` |
| Align | left |

---

## 10.2 페이지 타이틀

| 항목 | 정의 |
|---|---|
| 텍스트 | `뭐 하는 앱인지 알려줄게.` |
| 보조 문구 | `지도 보고, 가까이 가고, 열면 끝.` |
| Font | Plus Jakarta Sans |
| Weight | 700 |
| Size | 22px~26px |
| Color | `primary` |
| Align | center |

### 문구 정책

이 화면은 단순 AR 안내가 아니라 서비스 전체 안내 화면이다.  
따라서 기본 타이틀은 `캐치캐쉬 이용 안내`를 권장한다.

---

## 10.3 캐치캐쉬 소개 카드

### 목적

캐치캐쉬가 어떤 서비스인지 한 번에 설명하는 소개 카드이다.

### 구성

| 요소 | 설명 |
|---|---|
| 프레임 | `ui_frame_guide_intro_card_rough_lg.svg` |
| 아이콘 | 작은 보물상자 또는 지도 아이콘 |
| 타이틀 | `캐치캐쉬가 뭐냐면` |
| 본문 | `현실 곳곳에 숨겨진 보물을 지도에서 찾고, 가까이 가서 사냥하면 보상을 얻는 앱이다.` |

### 구현 방식

```txt
카드 프레임 = SVG 에셋
아이콘 = SVG 에셋
텍스트 = 코드 텍스트
카드 레이아웃 = HTML/CSS
```

### 정책

- 소개 카드 텍스트를 이미지에 포함하지 않는다.
- 프레임 SVG는 `aria-hidden="true"`로 처리한다.
- AR 카메라를 이 영역에서 실행하지 않는다.

---

## 10.4 STEP 안내 영역

| 항목 | 정의 |
|---|---|
STEP 1~4 카드로 이용 방법을 안내한다.

| STEP | 제목 | 설명 | 프레임 |
|---|---|---|---|
| STEP 1 | `지도 열어라` | `근처에 뭐가 숨었는지 먼저 봐.` | odd |
| STEP 2 | `가까이 가라` | `보물 근처까지 움직여야 열린다.` | even |
| STEP 3 | `AR로 찾아라` | `화면 속 상자를 눌러 사냥해라.` | odd |
| STEP 4 | `전리품 챙겨라` | `보상은 보관함에서 확인한다.` | even |

### STEP 카드 프레임 매핑

```txt
STEP 1, STEP 3 = ui_frame_guide_step_card_odd_rough_default.svg
STEP 2, STEP 4 = ui_frame_guide_step_card_even_rough_default.svg
```

확장형이 필요한 경우:

```txt
STEP 1, STEP 3 = ui_frame_guide_step_card_odd_rough_lg.svg
STEP 2, STEP 4 = ui_frame_guide_step_card_even_rough_lg.svg
```

---

## 10.5 가이드 카드 리스트

### 목적

캐치캐쉬 이용 방법을 단계별로 설명한다.

### 카드 공통 스타일

| 항목 | 값 |
|---|---|
| Shape | rough frame 에셋 형태 |
| Background | frame 에셋 기준 |
| Border | frame 에셋 기준 |
| Padding | 12px~16px |
| Layout | 아이콘 + STEP 라벨 + 제목 + 설명 |
| Icon 위치 | 좌측 |
| Text 위치 | 우측 |
| Text 처리 | 코드 텍스트 |

### 카드 구성

```txt
[아이콘]  제목
        설명
```

---

## 11. 가이드 카드 상세

## 11.1 위치 기반 탐색 카드

| 항목 | 내용 |
|---|---|
| 제목 | `지도 열어라` |
| 설명 | `근처에 뭐가 숨었는지 먼저 봐.` |
| 아이콘 | 위치 핀 또는 레이더 아이콘 |

### 정책

- 위치 권한은 이 화면에서 요청하지 않는다.
- 실제 위치 권한 요청은 지도 상세 또는 사냥 시작 시점에 처리한다.

---

## 11.2 지도 이동 카드

| 항목 | 내용 |
|---|---|
| 제목 | `가까이 가라` |
| 설명 | `보물 근처까지 움직여야 열린다.` |
| 아이콘 | 지도 또는 나침반 아이콘 |

### 정책

- 정밀 위치 탐색은 지도 상세 화면에서 수행한다.
- 홈 화면과 안내 화면은 지도 탐색을 설명만 한다.

---

## 11.3 AR 사냥 카드

| 항목 | 내용 |
|---|---|
| 제목 | `AR로 찾아라` |
| 설명 | `화면 속 상자를 눌러 사냥해라.` |
| 아이콘 | 카메라 또는 큐브 아이콘 |

### 정책

- AR은 WebView 기반 WebAR Lite 방식이다.
- 네이티브 ARKit/ARCore 기반 공간 인식은 MVP 범위가 아니다.
- 실제 카메라 권한은 AR 가이드 또는 AR 카메라 진입 시 요청한다.

---

## 11.4 보상 수령 카드

| 항목 | 내용 |
|---|---|
| 제목 | `전리품 챙겨라` |
| 설명 | `보상은 보관함에서 확인한다.` |
| 아이콘 | 선물 또는 쿠폰 아이콘 |

### 기프티쇼비즈 정책 반영

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
보물 획득 성공
→ 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

중요:

```txt
이 안내 화면에서는 쿠폰을 발급하지 않는다.
이 안내 화면에서는 기프티쇼비즈 API를 호출하지 않는다.
```

---

## 12. 메인 CTA

### 12.1 지도 뒤지러 가기 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `지도 뒤지러 가기` |
| 위치 | 화면 하단 |
| Shape | `rounded-full` |
| Height | 56px |
| Width | 100% |
| Background | `primary` |
| Text Color | `#FFFFFF` |
| Font | Plus Jakarta Sans |
| Weight | 700 |

### 클릭 시 동작

```txt
지도 뒤지러 가기 클릭
→ 지도 상세 화면으로 이동
```

권장 route:

```txt
/map
```

### 정책

- 이 버튼은 바로 AR 카메라를 실행하지 않는다.
- 먼저 지도 상세 화면에서 보물 위치와 힌트를 확인한다.
- AR 진입은 지도 상세 또는 힌트 바텀시트의 `사냥하기` 액션으로 진행한다. 실제 거리 제한은 AR 화면에서 다시 확인한다.

---

---

## 12.2 Stitch AI 디자인 결과 반영

### 12.2.1 확정된 화면 카피

| 요소 | 확정 문구 | 구현 방식 |
|---|---|---|
| 헤더 | `캐치캐쉬 안내` | 코드 텍스트 |
| 메인 타이틀 | `뭐 하는 앱인지 알려줄게.` | 코드 텍스트 |
| 보조 문구 | `지도 보고, 가까이 가고, 열면 끝.` | 코드 텍스트 |
| 소개 카드 타이틀 | `캐치캐쉬가 뭐냐면` | 코드 텍스트 |
| STEP 1 | `지도 열어라` | 코드 텍스트 |
| STEP 2 | `가까이 가라` | 코드 텍스트 |
| STEP 3 | `AR로 찾아라` | 코드 텍스트 |
| STEP 4 | `전리품 챙겨라` | 코드 텍스트 |
| 중요 안내 카드 | `보상은 바로 코드가 아니다.` | 코드 텍스트 |
| 권한 안내 카드 | `위치랑 카메라는 왜 필요하냐` | 코드 텍스트 |
| CTA | `지도 뒤지러 가기 →` | 코드 텍스트 |

### 12.2.2 화면 시각 구조

```txt
뒤로가기 + 캐치캐쉬 안내
→ 타이틀/보조 문구
→ 소개 카드
→ STEP 1~4 카드
→ 보상 안내 검은 카드
→ 위치/카메라 권한 안내 카드
→ 지도 뒤지러 가기 CTA
```

---

## 12.3 이미지 에셋 분리 기준

이 화면은 카드 프레임과 아이콘을 에셋으로 사용한다.  
단, 모든 텍스트와 실제 클릭 영역은 코드로 구현한다.

### 12.3.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 뒤로가기 아이콘 | 필수 | 공통 상세 화면 뒤로가기 |
| 소개 카드 프레임 | 필수 | 큰 rough frame 재현 |
| STEP 홀수 카드 프레임 | 필수 | STEP 1/3 카드 모양 재현 |
| STEP 짝수 카드 프레임 | 필수 | STEP 2/4 카드 모양 재현 |
| 검은 보상 안내 카드 프레임 | 필수 | 중요 안내 강조 |
| 권한 안내 카드 프레임 | 필수 | 권한 안내 카드 모양 재현 |
| STEP 아이콘 4종 | 필수 | 단계별 의미 전달 |
| CTA 버튼 프레임 | 공통 재사용 | 하단 CTA 버튼 |

### 12.3.2 코드/CSS로 구현할 요소

| 요소 | 구현 방식 |
|---|---|
| 모든 텍스트 | 코드 텍스트 |
| 카드 내부 레이아웃 | HTML/CSS |
| STEP 순서/데이터 | TypeScript 상수 |
| CTA 클릭 | HTML button/link |
| 스크롤 구조 | CSS |
| 권한 요청 | 이 화면에서는 실행하지 않음 |

---

## 12.4 에셋 명칭 정의

### 12.4.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_nav_back_circle_rough_default_32.svg` | navigation icon | svg | guide, detail pages | 32x32 | 손그림 원형 뒤로가기 아이콘 |
| `ui_frame_guide_intro_card_rough_lg.svg` | guide frame | svg | guide | 320x150 | 캐치캐쉬 소개 카드용 큰 rough frame |
| `ui_frame_guide_step_card_odd_rough_default.svg` | guide step frame | svg | guide | 320x64 | STEP 1, STEP 3에 사용하는 rough frame |
| `ui_frame_guide_step_card_even_rough_default.svg` | guide step frame | svg | guide | 320x64 | STEP 2, STEP 4에 사용하는 rough frame |
| `ui_frame_guide_notice_black_rough_lg.svg` | guide notice frame | svg | guide | 320x120 | `보상은 바로 코드가 아니다.` 검은 안내 카드 프레임 |
| `ui_frame_guide_permission_card_rough_lg.svg` | guide permission frame | svg | guide | 320x110 | 위치/카메라 권한 안내 카드 프레임 |
| `ui_frame_button_hunt_join_rough_default.svg` | common CTA frame | svg | guide, nickname, home | 320x56 | 공통 검은 CTA 버튼 프레임 |
| `icon_guide_step_map_rough_default_32.svg` | guide step icon | svg | guide | 32x32 | STEP 1 지도 아이콘 |
| `icon_guide_step_location_rough_default_32.svg` | guide step icon | svg | guide | 32x32 | STEP 2 위치 아이콘 |
| `icon_guide_step_ar_rough_default_32.svg` | guide step icon | svg | guide | 32x32 | STEP 3 AR 아이콘 |
| `icon_guide_step_inventory_rough_default_32.svg` | guide step icon | svg | guide | 32x32 | STEP 4 보관함/전리품 아이콘 |
| `icon_guide_reward_ticket_rough_default_32.svg` | guide icon | svg | guide | 32x32 | 보상 수령권 안내 아이콘 |
| `icon_guide_permission_camera_location_rough_default_32.svg` | guide icon | svg | guide | 32x32 | 위치/카메라 권한 안내 아이콘 |

### 12.4.2 선택/확장 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `ui_frame_guide_step_card_odd_rough_lg.svg` | guide step frame | svg | guide | 320x80 | STEP 1/3 설명이 길어질 때 |
| `ui_frame_guide_step_card_even_rough_lg.svg` | guide step frame | svg | guide | 320x80 | STEP 2/4 설명이 길어질 때 |
| `illust_error_guide_rough_default.svg` | error illustration | svg | guide error state | 160x120 | 안내 불러오기 실패 일러스트 |

### 12.4.3 기존 프레임 재사용 금지 정책

이번 안내 화면 프레임은 기존 알림 프레임을 늘려서 만들었더라도, 파일명은 안내 화면 기준으로 새로 정의한다.

금지 예시:

```txt
ui_frame_notification_coupon_standard_rough_lg.svg
ui_frame_notification_notice_round_rough_lg.svg
ui_frame_filter_chip_inactive_sm_rough_pressed.svg
```

사용 예시:

```txt
ui_frame_guide_intro_card_rough_lg.svg
ui_frame_guide_notice_black_rough_lg.svg
ui_frame_guide_permission_card_rough_lg.svg
```

이유:

- 개발자가 guide 화면에서 notification 에셋을 쓰는 이유를 이해하기 어렵다.
- 알림 화면 수정이 안내 화면에 영향을 줄 수 있다.
- 화면별 에셋 추적과 유지보수가 어려워진다.

---

## 12.5 에셋 저장 위치

```txt
public/
  assets/
    icons/
      navigation/
        icon_nav_back_circle_rough_default_32.svg

      guide/
        icon_guide_step_map_rough_default_32.svg
        icon_guide_step_location_rough_default_32.svg
        icon_guide_step_ar_rough_default_32.svg
        icon_guide_step_inventory_rough_default_32.svg
        icon_guide_reward_ticket_rough_default_32.svg
        icon_guide_permission_camera_location_rough_default_32.svg

    ui/
      frames/
        guide/
          ui_frame_guide_intro_card_rough_lg.svg
          ui_frame_guide_step_card_odd_rough_default.svg
          ui_frame_guide_step_card_odd_rough_lg.svg
          ui_frame_guide_step_card_even_rough_default.svg
          ui_frame_guide_step_card_even_rough_lg.svg
          ui_frame_guide_notice_black_rough_lg.svg
          ui_frame_guide_permission_card_rough_lg.svg

        button/
          ui_frame_button_hunt_join_rough_default.svg
```

---

## 12.6 코드 상수

### 12.6.1 에셋 상수

```ts
export const GUIDE_ASSETS = {
  backIcon: '/assets/icons/navigation/icon_nav_back_circle_rough_default_32.svg',
  introFrame: '/assets/ui/frames/guide/ui_frame_guide_intro_card_rough_lg.svg',
  stepOddFrame: '/assets/ui/frames/guide/ui_frame_guide_step_card_odd_rough_default.svg',
  stepEvenFrame: '/assets/ui/frames/guide/ui_frame_guide_step_card_even_rough_default.svg',
  noticeBlackFrame: '/assets/ui/frames/guide/ui_frame_guide_notice_black_rough_lg.svg',
  permissionFrame: '/assets/ui/frames/guide/ui_frame_guide_permission_card_rough_lg.svg',
  ctaFrame: '/assets/ui/frames/button/ui_frame_button_hunt_join_rough_default.svg',
  stepMapIcon: '/assets/icons/guide/icon_guide_step_map_rough_default_32.svg',
  stepLocationIcon: '/assets/icons/guide/icon_guide_step_location_rough_default_32.svg',
  stepArIcon: '/assets/icons/guide/icon_guide_step_ar_rough_default_32.svg',
  stepInventoryIcon: '/assets/icons/guide/icon_guide_step_inventory_rough_default_32.svg',
} as const;
```

### 12.6.2 STEP 프레임 매핑

```ts
export const GUIDE_STEP_FRAME_BY_INDEX = {
  1: GUIDE_ASSETS.stepOddFrame,
  2: GUIDE_ASSETS.stepEvenFrame,
  3: GUIDE_ASSETS.stepOddFrame,
  4: GUIDE_ASSETS.stepEvenFrame,
} as const;
```

### 12.6.3 문구 상수

```ts
export const GUIDE_COPY = {
  title: '뭐 하는 앱인지 알려줄게.',
  subtitle: '지도 보고, 가까이 가고, 열면 끝.',
  introTitle: '캐치캐쉬가 뭐냐면',
  cta: '지도 뒤지러 가기',
} as const;
```

---

## 12.7 구현 방식

### 12.7.1 카드 프레임 구현

```tsx
<div className="relative w-full">
  <img
    src={frameAsset}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <div className="relative z-10">
    {/* 카드 텍스트와 아이콘 */}
  </div>
</div>
```

구현 원칙:

- 프레임 SVG는 `aria-hidden="true"` 처리한다.
- 텍스트는 이미지에 포함하지 않는다.
- 실제 클릭 영역은 HTML button/link로 구현한다.
- 프레임 SVG는 화면 폭에 맞춰 늘어나도 깨지지 않도록 제작한다.
- STEP 1/3은 odd 프레임, STEP 2/4는 even 프레임을 사용한다.

---

## 13. 화면 상태

### 13.1 상태 타입

```ts
export type CatchCashGuideStatus =
  | 'ready'
  | 'image_loading'
  | 'image_error';
```

### 13.2 상태별 UI

| 상태 | UI |
|---|---|
| `ready` | 전체 안내 화면 표시 |
| `image_loading` | 이미지 영역 skeleton 또는 placeholder 표시 |
| `image_error` | placeholder 이미지 표시 |

---

## 14. 사용자 액션

### 14.1 닫기 클릭

```txt
닫기 클릭
→ 이전 화면으로 복귀
```

### 14.2 지도 뒤지러 가기 클릭

```txt
지도 뒤지러 가기 클릭
→ /map 이동
```

### 14.3 뒤로가기

```txt
뒤로가기
→ 이전 화면으로 복귀
```

### 14.4 약관/문의 링크가 있을 경우

```txt
링크 클릭
→ 해당 화면 또는 외부 링크 열기
```

---

## 15. 데이터 요구사항

### 15.1 읽는 데이터

기본적으로 정적 콘텐츠로 구성되므로 필수 서버 데이터는 없다.

선택적으로 아래 데이터를 사용할 수 있다.

| 데이터 | 설명 |
|---|---|
| guide image url | 원격 이미지 사용 시 |
| app guide content | 운영자가 수정 가능한 안내 문구 사용 시 |
| notice link | 공지 또는 도움말 링크 사용 시 |

### 15.2 쓰는 데이터

이 화면에서는 원칙적으로 데이터를 생성하거나 수정하지 않는다.

선택적으로 아래 로그만 남길 수 있다.

| 데이터 | 설명 |
|---|---|
| guide_viewed_at | 사용자가 안내 화면을 본 시간 |
| guide_cta_clicked_at | 지도 뒤지러 가기 클릭 로그 |

### 15.3 생성하지 않는 데이터

- treasure_claims
- inventory_items
- giftishow_issues
- notifications
- security_logs

---

## 16. 예외 처리

### 16.1 이미지 로딩 실패

| 상황 | 처리 |
|---|---|
| 이미지 URL 오류 | placeholder 표시 |
| 네트워크 오류 | placeholder 표시 |
| 이미지 미등록 | placeholder 표시 |

### 16.2 세션 없음

| 상황 | 처리 |
|---|---|
| 인증 세션 없음 | 로그인 화면 이동 |
| 메시지 | 다시 로그인해주세요. |

단, 이 화면을 비로그인 사용자에게도 공개 안내 페이지로 제공할 경우 세션 검증을 생략할 수 있다.  
MVP 앱 내부 GNB 진입 기준에서는 로그인 사용자 접근을 기본으로 한다.

### 16.3 CTA 이동 실패

| 상황 | 처리 |
|---|---|
| route 이동 실패 | 오류 토스트 표시 |
| 네트워크 오류 | 현재 화면 유지 |

문구:

```txt
이동에 실패했어요. 잠시 후 다시 시도해주세요.
```

---

## 17. 기프티쇼비즈 정책과의 관계

이 화면은 기프티쇼비즈 API와 직접 연결되지 않는다.

기프티쇼비즈 관련 설명은 사용자 이해를 돕기 위한 안내 문구로만 사용한다.

### 이 화면에서 금지되는 작업

- 기프티쇼비즈 상품 조회
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 바코드 표시
- 쿠폰 재발송
- 쿠폰 취소
- 예치금/한도 조회

### 안내 문구 권장

```txt
보물을 획득하면 보관함에 보상 수령권이 생겨요.
쿠폰은 보관함에서 직접 받을 수 있어요.
```

---

## 18. 접근성

### 18.1 헤더

- 닫기 버튼은 명확한 aria-label을 가진다.
- 브랜드 텍스트는 중앙에 표시한다.

권장 aria-label:

```txt
캐치캐쉬 안내 화면 닫기
```

### 18.2 가이드 카드

- 아이콘만으로 의미를 전달하지 않는다.
- 각 카드에는 제목과 설명을 모두 제공한다.
- 카드 텍스트는 2줄 이내로 짧게 유지한다.

### 18.3 CTA 버튼

- 터치 영역은 최소 44px 이상이어야 한다.
- 버튼 텍스트는 명확해야 한다.
- 비활성 상태가 필요한 경우 색상 외에도 disabled 속성을 사용한다.

---

## 19. 구현 컴포넌트 제안

### 19.1 화면 컴포넌트

```txt
CatchCashGuidePage
```

### 19.2 하위 컴포넌트

```txt
GuideHeader
RoughBackButton
GuideIntroCard
GuideStepList
GuideStepCard
GuideNoticeCard
GuidePermissionCard
GuideCTAButton
GuideImagePlaceholder
```

### 19.3 훅

```txt
useGuideNavigation
useGuideViewLog
```

### 19.4 유틸

```txt
getGuideSteps
mapGuideStepIcon
```

---

## 20. 권장 파일 구조

```txt
app/
  guide/
    page.tsx

features/
  guide/
    components/
      GuideHeader.tsx
      GuideHeroImage.tsx
      GuideStepList.tsx
      GuideStepCard.tsx
      GuideCTAButton.tsx
      GuideImagePlaceholder.tsx
    hooks/
      useGuideNavigation.ts
      useGuideViewLog.ts
    constants/
      guideSteps.ts
      guideAssets.ts
      guideCopy.ts
    types/
      guide.types.ts

constants/
  routes.ts

public/
  assets/
    icons/
      guide/
    ui/
      frames/
        guide/
```

---

## 21. TypeScript 타입 제안

### 21.1 화면 상태 타입

```ts
export type CatchCashGuideStatus =
  | 'ready'
  | 'image_loading'
  | 'image_error';
```

### 21.2 가이드 단계 타입

```ts
export type GuideStepType =
  | 'map'
  | 'location'
  | 'ar'
  | 'inventory';
```

### 21.3 가이드 카드 타입

```ts
export type GuideStep = {
  id: string;
  type: GuideStepType;
  title: string;
  description: string;
  iconName: string;
};
```

### 21.4 기본 가이드 데이터 예시

```ts
export const guideSteps: GuideStep[] = [
  {
    id: 'map',
    type: 'map',
    title: '지도 열어라',
    description: '근처에 뭐가 숨었는지 먼저 봐.',
    iconName: 'map',
  },
  {
    id: 'location',
    type: 'location',
    title: '가까이 가라',
    description: '보물 근처까지 움직여야 열린다.',
    iconName: 'location',
  },
  {
    id: 'ar',
    type: 'ar',
    title: 'AR로 찾아라',
    description: '화면 속 상자를 눌러 사냥해라.',
    iconName: 'ar',
  },
  {
    id: 'inventory',
    type: 'inventory',
    title: '전리품 챙겨라',
    description: '보상은 보관함에서 확인한다.',
    iconName: 'inventory',
  },
]
```

---

## 22. 완료 기준

### 22.1 UI 완료 기준

- [ ] `/guide` route에서 안내 화면이 렌더링된다.
- [ ] 상단 뒤로가기 버튼이 표시된다.
- [ ] 헤더에 `캐치캐쉬 안내`가 표시된다.
- [ ] 페이지 타이틀이 표시된다.
- [ ] 소개 카드 rough frame이 표시된다.
- [ ] 이미지가 없을 경우 placeholder가 표시된다.
- [ ] 메인 타이틀과 보조 문구가 표시된다.
- [ ] 가이드 카드 리스트가 표시된다.
- [ ] 위치 기반 탐색 안내 카드가 표시된다.
- [ ] 지도 탐색 안내 카드가 표시된다.
- [ ] AR 사냥 안내 카드가 표시된다.
- [ ] 보상 수령 안내 카드가 표시된다.
- [ ] 하단 CTA `지도 뒤지러 가기`가 표시된다.
- [ ] 하단 네비게이션이 표시되지 않는다.
- [ ] 전체 화면이 흑백 손그림 디자인 기준을 따른다.

### 22.2 기능 완료 기준

- [ ] GNB 안내 아이콘 클릭 시 이 화면으로 이동한다.
- [ ] 닫기 버튼 클릭 시 이전 화면으로 복귀한다.
- [ ] 뒤로가기 시 이전 화면으로 복귀한다.
- [ ] 지도 뒤지러 가기 클릭 시 지도 상세 화면으로 이동한다.
- [ ] 이미지 로딩 실패 시 placeholder가 표시된다.
- [ ] 이 화면에서 위치 권한을 요청하지 않는다.
- [ ] 이 화면에서 카메라 권한을 요청하지 않는다.
- [ ] 이 화면에서 기프티쇼비즈 API를 호출하지 않는다.

### 22.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] Tailwind CSS 디자인 토큰을 사용한다.
- [ ] route constants를 사용한다.
- [ ] 안내 단계 데이터가 상수 또는 설정값으로 분리되어 있다.
- [ ] STEP 1/3은 odd 프레임, STEP 2/4는 even 프레임을 사용한다.
- [ ] 가이드 카드 컴포넌트가 재사용 가능하게 구현되어 있다.
- [ ] 모든 프레임 SVG에는 텍스트가 포함되지 않는다.
- [ ] 닫기/뒤로가기 처리가 WebView 환경에서 안정적으로 동작한다.

---

## 23. 제외 범위

이 화면에서는 아래 기능을 구현하지 않는다.

- AR 카메라 실행
- 카메라 권한 요청
- GPS 위치 권한 요청
- 네이버 지도 표시
- 보물상자 목록 조회
- 보물 힌트 조회
- 보물 획득 RPC 호출
- 기프티쇼비즈 API 호출
- 쿠폰 코드 표시
- 쿠폰 발급
- 보관함 상세 열기
- 관리자 기능
- 푸시 알림 설정

---

## 24. 개발자 주의사항

- 이 화면은 서비스 안내 화면이며, 실제 사냥 실행 화면이 아니다.
- `지도 뒤지러 가기`는 바로 AR 카메라로 보내지 않고 지도 상세 화면으로 이동하는 것을 기본 정책으로 한다.
- AR 진입은 지도 상세 또는 힌트 바텀시트의 `사냥하기` 액션으로 진행한다. 실제 거리 제한은 AR 화면에서 다시 확인한다.
- 위치 권한과 카메라 권한은 이 화면에서 요청하지 않는다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
- 쿠폰 발급은 보관함에서 사용자가 `쿠폰 받기`를 실행하는 시점에 처리한다.
- 안내 문구는 짧고 명확하게 작성한다.
- 이미지가 없어도 화면이 깨지지 않도록 placeholder를 반드시 제공한다.


---

## 25. 디자인 반영 개발자 주의사항

- 안내 화면에서 알림용 프레임 에셋명을 사용하지 않는다.
- 기존 알림 프레임을 복제/변형해서 만들었더라도 guide 전용 에셋명으로 저장한다.
- STEP 카드 프레임은 4개가 아니라 2개를 사용한다.
- STEP 1, STEP 3은 `ui_frame_guide_step_card_odd_rough_default.svg`를 사용한다.
- STEP 2, STEP 4는 `ui_frame_guide_step_card_even_rough_default.svg`를 사용한다.
- 하단 CTA는 공통 `ui_frame_button_hunt_join_rough_default.svg`를 재사용한다.
- 텍스트는 이미지에 포함하지 않고 코드 텍스트로 구현한다.
- 프레임 SVG는 `aria-hidden="true"` 처리한다.
- 위치/카메라 권한 요청은 이 화면에서 실행하지 않는다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
