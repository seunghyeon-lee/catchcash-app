# 01. 스플래시 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 01. 스플래시 화면 정의서 |
| 파일명 | `01_Splash_Screen.md` |
| 디자인 반영 버전 | Stitch AI 스플래시 시안 기준 / 이미지만 에셋 분리 / 로고 심볼은 임시 에셋 사용 |
| 서비스명 | 캐치캐쉬 CatchCash |
| 화면 유형 | 사용자 앱 / 모바일 WebView |
| 작성 목적 | 바이브코딩을 위한 화면 단위 구현 명세 |
| 기준 기술 | Next.js + TypeScript + Capacitor WebView + Supabase Auth + Tailwind CSS |

---

## 2. 화면 개요

### 2.1 화면명

스플래시 화면

### 2.2 화면 ID

`01_Splash_Screen`

### 2.3 화면 목적

앱 실행 직후 가장 먼저 노출되는 진입 화면이다.  
브랜드 로고와 짧은 로딩 경험을 제공하면서, 백그라운드에서 Supabase Auth 세션을 확인하고 다음 화면으로 자동 이동한다.

### 2.4 핵심 역할

- 앱 최초 진입 화면 제공
- 캐치캐쉬 브랜드 인지 제공
- Supabase Auth 세션 확인
- 전역 인증 상태 초기화
- 세션 상태에 따른 자동 라우팅 처리

---

## 3. 서비스 구조 기준

캐치캐쉬 사용자 앱은 네이티브 앱처럼 배포되지만 실제 화면은 WebView에서 실행된다.

```txt
App Store / Google Play 배포 앱
→ Capacitor Shell
→ WebView
→ Next.js App
→ React 화면 렌더링
```

### 3.1 스플래시 화면의 위치

스플래시 화면은 Capacitor 네이티브 스플래시가 아니라, WebView 내부에서 실행되는 Next.js 화면이다.

단, 앱 실행 직후 흰 화면이 보이지 않도록 네이티브 스플래시와 WebView 스플래시의 전환은 자연스럽게 처리한다.

### 3.2 이 화면에서 하지 않는 것

스플래시 화면에서는 아래 기능을 실행하지 않는다.

- GPS 권한 요청
- 카메라 권한 요청
- Haptics 실행
- 네이버 지도 로딩
- 기프티쇼비즈 API 호출
- 보물상자 데이터 조회
- 보관함 데이터 조회
- 사용자에게 별도 입력 요구

---

## 4. 진입 조건

### 4.1 진입 시점

사용자가 앱을 실행했을 때 최초로 진입한다.

### 4.2 진입 경로

- 앱 아이콘 실행
- 앱 재실행
- WebView 최초 로딩
- 루트 URL 접근
- 새로고침 후 앱 초기화

### 4.3 Route

권장 라우트는 아래 중 하나로 통일한다.

```txt
/
```

또는

```txt
/splash
```

MVP에서는 `app/page.tsx`에서 스플래시를 먼저 렌더링한 뒤, 세션 검증 결과에 따라 이동시키는 방식을 권장한다.

---

## 5. 종료 및 이동 규칙

스플래시 화면은 사용자가 직접 조작해서 종료하는 화면이 아니다.  
세션 확인 결과에 따라 자동 이동한다.

| 조건 | 이동 화면 | Route 예시 |
|---|---|---|
| Supabase 세션 유효 | 메인 홈 화면 | `/home` |
| Supabase 세션 없음 | 로그인 화면 | `/login` |
| 세션 만료 | 로그인 화면 | `/login` |
| 세션 확인 오류 | 로그인 화면 | `/login` |
| 세션 확인 3초 초과 | 로그인 화면 | `/login` |

### 5.1 신규 유저 분기 정책

스플래시 화면에서는 신규 유저 여부를 깊게 판단하지 않는다.

기본 정책은 다음과 같다.

```txt
Supabase Auth 세션 있음
→ profiles 조회
→ 프로필/약관 완료 여부 확인
→ 완료: 메인 홈
→ 미완료: 닉네임 및 약관 동의 화면
```

단, 이 분기 로직은 `authStore` 또는 공통 인증 가드에서 처리하는 것을 권장한다.

---

## 6. 화면 레이아웃

### 6.1 기본 레이아웃

```txt
┌──────────────────────────────┐
│                              │
│                              │
│                              │
│          [보물상자 심볼]       │
│          catchcash           │
│   현실에서 빛나는 상자를 찾아라 │
│                              │
│          생각 중...           │
│        [Sketch Progress Bar] │
│                              │
│                              │
└──────────────────────────────┘
```

### 6.2 레이아웃 원칙

- 모바일 세로 화면 기준으로 구성한다.
- 전체 화면 높이 `100dvh`를 사용한다.
- 주요 요소는 수평/수직 중앙 정렬한다.
- Safe Area를 고려한다.
- 스크롤은 발생하지 않는다.
- 하단 탭바는 노출하지 않는다.
- 버튼과 입력 필드는 노출하지 않는다.

---

## 7. UI 구성 요소

## 7.1 전체 배경

| 항목 | 정의 |
|---|---|
| 배경색 | `#F7F5EF` 또는 매우 연한 종이색 배경 |
| 텍스트 기본색 | `#000000` |
| 디자인 톤 | 흑백 손그림 / 스케치형 모바일 UI / 종이 질감 |
| 구현 방식 | Tailwind CSS 클래스 사용 |

### 구현 기준

- 공통 디자인 지시문 기준의 흑백 손그림 UI를 따른다.
- 과도한 색상 사용을 피한다.
- 배경은 종이 질감의 오프화이트 톤을 사용한다.
- 화면 전체는 아주 단순해야 하며, 중앙 심볼과 브랜드명에 집중한다.

---

## 7.2 브랜드 로고 영역

| 항목 | 정의 |
|---|---|
| 구성 | 보물상자 심볼 + 텍스트 로고 |
| 위치 | 화면 중앙보다 약간 위 |
| 정렬 | 중앙 정렬 |
| 애니메이션 | 부드러운 fade-in 또는 scale-in |

### 표시 기준

- 브랜드명은 디자인 시안 기준으로 `catchcash` 소문자 워드마크를 사용한다.
- 중앙에는 손그림 스타일의 보물상자 심볼을 표시한다.
- 보물상자 심볼은 재사용 가능성이 높으므로 SVG 에셋으로 분리한다.
- 워드마크는 코드 텍스트 구현을 기본으로 하되, 로고 고정이 필요하면 SVG 에셋으로 분리할 수 있다.
- 로고는 앱의 첫인상이므로 흐릿하거나 깨지지 않게 렌더링한다.

### 권장 스타일

```txt
Font: Plus Jakarta Sans
Weight: 700
Color: #000000
Letter spacing: -0.02em
```

---

## 7.3 서브 카피

| 항목 | 정의 |
|---|---|
| 텍스트 | `현실에서 빛나는 상자를 찾아라` |
| 위치 | 브랜드명 하단 |
| 색상 | `#5D5F5F` |
| 폰트 | Plus Jakarta Sans |

### 대체 문구 후보

MVP에서는 Stitch AI 시안에 맞춰 아래 문구를 고정 사용한다.

```txt
현실에서 빛나는 상자를 찾아라
```

이 문구는 코드 텍스트로 구현하며 이미지 에셋으로 분리하지 않는다.

---

## 7.4 로딩 텍스트

| 항목 | 정의 |
|---|---|
| 텍스트 | `생각 중...` |
| 폰트 | Space Grotesk |
| 색상 | `#777777` |
| 대소문자 | 대문자 |
| 자간 | 넓게 적용 |

### 구현 기준

- 로딩 텍스트는 프로그레스 바 위에 배치한다.
- 공통 브랜드 톤에 맞춰 `생각 중...` 문구를 사용한다.
- 세션 검증 중이라는 직접 설명은 노출하지 않는다.
- 사용자에게 오류나 내부 상태를 보여주지 않는다.
- 로딩 텍스트는 이미지가 아니라 코드 텍스트로 구현한다.

---

## 7.5 프로그레스 바

| 항목 | 정의 |
|---|---|
| 형태 | 손그림 느낌의 얇은 pill progress bar |
| 배경색 | `#FFFFFF` 또는 `#E8E5DC` |
| 채움색 | `#000000` |
| Radius | `rounded-full` |
| Border | `#000000`, 1.5px~2px |
| 애니메이션 | 1.5초~3초 사이 자연스럽게 채움 |

### 동작 기준

- 실제 네트워크 진행률과 완전히 동기화하지 않아도 된다.
- 스플래시 체류 시간 동안 자연스럽게 채워지는 느낌을 제공한다.
- 세션 확인이 끝났더라도 최소 노출 시간 전에는 바로 이동하지 않는다.

---

## 8. 디자인 시스템 매핑

### 8.1 Typography

| 용도 | Font | Weight | 비고 |
|---|---|---:|---|
| 브랜드명 | Plus Jakarta Sans | 700 | Headline |
| 서브 카피 | Plus Jakarta Sans | 400~500 | Body |
| 로딩 라벨 | Space Grotesk | 500~600 | Label |

### 8.2 Color Token

| 용도 | 토큰명 | 값 |
|---|---|---|
| Primary | `primary` | `#000000` |
| Tertiary | `tertiary` | `#000000` |
| Secondary | `secondary` | `#5D5F5F` |
| Neutral | `neutral` | `#777777` |
| Background | `background` | `#FFFFFF` |
| Surface | `surface` | `#F7F7F7` |
| Border | `border` | `#E5E5E5` |

### 8.3 Radius

| 요소 | Radius |
|---|---|
| 프로그레스 바 | `rounded-full` |
| 로고 컨테이너가 있을 경우 | `rounded-2xl` 또는 `rounded-full` |

### 8.4 Motion

| 요소 | 모션 |
|---|---|
| 화면 진입 | fade-in |
| 로고 | scale-in 또는 fade-in |
| 프로그레스 바 | width 증가 애니메이션 |
| 화면 종료 | fade-out 후 라우팅 |

---

## 9. 기능 로직

## 9.1 기본 처리 순서

```txt
1. 앱 실행
2. WebView에서 Next.js 앱 로드
3. 스플래시 화면 렌더링
4. 최소 노출 타이머 시작
5. Supabase Auth 세션 확인
6. 전역 authStore 초기화
7. profiles 상태 확인
8. 분기 대상 화면 결정
9. 최소 노출 시간 충족 후 이동
```

---

## 9.2 세션 확인 기준

| 상태 | 판단 기준 | 처리 |
|---|---|---|
| 세션 유효 | Supabase session 존재 | profiles 확인 후 분기 |
| 세션 없음 | session null | 로그인 이동 |
| 세션 만료 | refresh 실패 | 로그인 이동 |
| 오류 | SDK/네트워크 오류 | 로그인 이동 |
| 지연 | 3초 초과 | 로그인 이동 |

---

## 9.3 프로필 완료 여부 기준

Supabase Auth 세션이 존재하더라도 앱 프로필이 완료되지 않았으면 메인 홈으로 보내지 않는다.

| 조건 | 이동 화면 |
|---|---|
| `profiles.nickname` 있음 + 약관 동의 완료 | 메인 홈 |
| `profiles.nickname` 없음 | 닉네임 및 약관 동의 화면 |
| 약관 동의 미완료 | 닉네임 및 약관 동의 화면 |
| profiles 조회 실패 | 로그인 또는 닉네임 화면 정책에 따름 |

권장 정책:

```txt
Auth 세션은 있는데 profiles가 없으면 신규 유저로 판단한다.
신규 유저는 닉네임 및 약관 동의 화면으로 이동한다.
```

---

## 10. 시간 정책

### 10.1 최소 노출 시간

```txt
1.5초
```

세션 확인이 빠르게 끝나도 최소 1.5초 동안 스플래시 화면을 유지한다.

### 10.2 최대 대기 시간

```txt
3초
```

세션 확인이 3초를 초과하면 로그인 화면으로 이동한다.

### 10.3 권장 상수

```ts
const MIN_SPLASH_TIME = 1500;
const MAX_SPLASH_TIME = 3000;
```

---

## 11. 상태 정의

### 11.1 화면 상태

```ts
type SplashStatus =
  | 'initial'
  | 'checking_session'
  | 'checking_profile'
  | 'ready_to_route'
  | 'timeout'
  | 'error';
```

### 11.2 상태별 설명

| 상태 | 설명 |
|---|---|
| `initial` | 화면 최초 렌더링 |
| `checking_session` | Supabase Auth 세션 확인 중 |
| `checking_profile` | profiles 테이블에서 앱 프로필 확인 중 |
| `ready_to_route` | 이동 대상 화면 결정 완료 |
| `timeout` | 최대 대기 시간 초과 |
| `error` | 세션 확인 또는 프로필 확인 중 오류 발생 |

---

## 12. 데이터 요구사항

## 12.1 읽는 데이터

| 데이터 | 출처 | 목적 |
|---|---|---|
| Supabase session | Supabase Auth | 로그인 여부 확인 |
| auth user id | Supabase Auth | profiles 조회 키 |
| profile | `profiles` table | 닉네임/약관 완료 여부 확인 |

## 12.2 쓰는 데이터

스플래시 화면에서 직접 생성하는 비즈니스 데이터는 없다.

단, 클라이언트 전역 상태에는 아래 값을 저장할 수 있다.

| 상태 | 저장 위치 | 설명 |
|---|---|---|
| session | `authStore` | Supabase 세션 |
| user | `authStore` | 인증 유저 정보 |
| profile | `authStore` | 앱 프로필 정보 |
| isOnboardingCompleted | `authStore` | 온보딩 완료 여부 |

---

## 13. 기술 구현 기준

## 13.1 프론트엔드

| 항목 | 기준 |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Runtime | Capacitor WebView |

## 13.2 인증

| 항목 | 기준 |
|---|---|
| 인증 서비스 | Supabase Auth |
| 세션 확인 | `supabase.auth.getSession()` 또는 공통 auth 유틸 사용 |
| 신규 유저 판단 | `profiles` 테이블 조회 |
| 라우팅 | Next.js router 사용 |

## 13.3 상태 관리

| 항목 | 기준 |
|---|---|
| 전역 인증 상태 | Zustand 권장 |
| 서버 데이터 조회 | TanStack Query 사용 가능 |
| 화면 내부 상태 | React state |

## 13.4 Capacitor

스플래시 화면에서 Capacitor 플러그인을 직접 호출하지 않는다.

단, 앱이 백그라운드에서 복귀했을 때 세션 재검증이 필요한 경우 공통 앱 라이프사이클 로직에서 처리한다.

---

## 14. 라우팅 정책

### 14.1 Route Constant

```ts
export const ROUTES = {
  SPLASH: '/',
  LOGIN: '/login',
  NICKNAME_TERMS: '/nickname-terms',
  HOME: '/home',
} as const;
```

### 14.2 이동 로직 예시

```ts
if (!session) {
  router.replace(ROUTES.LOGIN);
  return;
}

if (!profile || !profile.nickname || !profile.terms_agreed_at) {
  router.replace(ROUTES.NICKNAME_TERMS);
  return;
}

router.replace(ROUTES.HOME);
```

### 14.3 히스토리 정책

스플래시 화면에서 다음 화면으로 이동할 때는 `push`가 아니라 `replace`를 사용한다.

이유:

```txt
뒤로가기 시 스플래시 화면으로 되돌아오는 것을 방지하기 위함
```

---

## 15. 예외 처리

### 15.1 세션 확인 실패

| 상황 | 처리 |
|---|---|
| Supabase 오류 | 로그인 화면 이동 |
| 네트워크 오류 | 로그인 화면 이동 |
| 세션 파싱 오류 | 로그인 화면 이동 |
| refresh 실패 | 로그인 화면 이동 |

### 15.2 프로필 조회 실패

| 상황 | 처리 |
|---|---|
| profiles 없음 | 닉네임 및 약관 동의 화면 이동 |
| profiles 조회 오류 | 로그인 화면 또는 오류 정책에 따름 |
| auth user id 없음 | 로그인 화면 이동 |

MVP 권장 정책:

```txt
세션은 있는데 프로필이 없으면 신규 유저로 보고 닉네임 및 약관 동의 화면으로 이동한다.
```

### 15.3 최대 대기 시간 초과

```txt
3초 초과 시 로그인 화면으로 이동한다.
```

스플래시 화면에 오류 메시지나 재시도 버튼은 표시하지 않는다.

---

## 16. 접근성 및 사용성

- 로고 텍스트는 스크린리더에서 `CatchCash`로 읽힐 수 있어야 한다.
- 로딩 상태는 시각적으로만 과도하게 의존하지 않는다.
- 움직임이 과한 애니메이션은 사용하지 않는다.
- 화면 전환 시 깜빡임을 최소화한다.
- 작은 화면에서도 로고와 로딩 영역이 잘리지 않아야 한다.

---

## 17. 보안 기준

- 스플래시 화면에서 민감 정보를 화면에 표시하지 않는다.
- access token, refresh token을 console에 출력하지 않는다.
- 세션 오류 사유를 사용자에게 상세 노출하지 않는다.
- 인증 상태 확인은 공통 auth 유틸에서 처리한다.
- 관리자 권한 여부는 사용자 앱 스플래시에서 판단하지 않는다.

---

## 18. 제외 범위

스플래시 화면에서는 아래 기능을 구현하지 않는다.

- 이메일 로그인
- 소셜 로그인 버튼
- 회원가입 버튼
- 닉네임 입력
- 약관 동의
- 위치 권한 요청
- 카메라 권한 요청
- 지도 표시
- 보물상자 조회
- 기프티쇼비즈 API 호출
- 쿠폰 발급
- 보관함 조회
- 관리자 기능

---

## 19. 구현 컴포넌트 가이드

### 19.1 권장 컴포넌트

```txt
SplashScreen
SplashLogo
SplashProgressBar
```

### 19.2 권장 훅 / 유틸

```txt
useAuthStore
checkAuthSession
checkProfileStatus
useSplashTimer
```

### 19.3 권장 파일 구조

```txt
app/
  page.tsx

features/
  splash/
    components/
      SplashLogo.tsx
      SplashProgressBar.tsx
    hooks/
      useSplashTimer.ts
    SplashScreen.tsx

stores/
  authStore.ts

lib/
  supabase/
    client.ts
  routes.ts
```

---

---

## 20. Stitch AI 디자인 결과 반영

### 20.1 확정된 화면 카피

Stitch AI 스플래시 시안 기준으로 화면 카피를 아래처럼 고정한다.

| 요소 | 확정 문구 | 구현 방식 |
|---|---|---|
| 브랜드명 | `catchcash` | 코드 텍스트 또는 선택 SVG |
| 서브 카피 | `현실에서 빛나는 상자를 찾아라` | 코드 텍스트 |
| 로딩 문구 | `생각 중...` | 코드 텍스트 |

### 20.2 화면 시각 구조

```txt
상단 여백
→ 중앙 보물상자 심볼
→ catchcash 워드마크
→ 서브 카피
→ 하단 로딩 문구
→ 손그림 progress bar
```

### 20.3 디자인 스타일

- 흑백 손그림 스케치 스타일을 적용한다.
- 배경은 종이색 오프화이트를 사용한다.
- 중앙 심볼은 보물상자 손그림 라인 아이콘이다.
- 로딩 바는 완전한 기계식 UI보다 손으로 그린 듯한 얇은 bar 느낌을 사용한다.
- 화면 전체를 하나의 PNG로 사용하지 않는다.

---

## 21. 에셋 분리 기준

스플래시 화면에서는 **이미지로 필요한 것만 에셋으로 분리**한다.  
텍스트, 배경, 레이아웃, 로딩 바는 모두 CSS/HTML/React로 구현한다.

### 21.1 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 중앙 로고 심볼 | 필수 분리 | 앱 브랜드 로고로 사용될 핵심 이미지 |
| 로고 심볼 임시 버전 | 임시 사용 | 최종 로고 제작 전 Stitch AI 시안의 보물상자 심볼을 임시로 사용 |
| 장식 이미지 | 원칙적으로 제외 | 스플래시에서는 불필요. 필요 시에도 CSS 또는 생략 우선 |

### 21.2 코드로 구현할 요소

| 요소 | 구현 방식 | 이유 |
|---|---|---|
| 배경색 | CSS / Tailwind | 반응형 및 테마 대응 용이 |
| 브랜드명 `catchcash` | 텍스트 | 로고 심볼과 별개로 접근성과 수정 용이 |
| 서브 카피 | 텍스트 | 문구 수정 가능성 있음 |
| 로딩 문구 | 텍스트 | 상태/문구 수정 가능성 있음 |
| 프로그레스 바 | CSS | 애니메이션과 반응형 대응 용이 |
| 화면 전체 레이아웃 | React/Tailwind | 화면 전체 이미지 사용 금지 |

### 21.3 중요 원칙

```txt
이미지만 에셋으로 분리한다.
텍스트는 이미지로 만들지 않는다.
로딩 바는 이미지로 만들지 않는다.
배경은 이미지로 만들지 않는다.
화면 전체를 PNG/JPG로 export해서 사용하지 않는다.
```

---

## 22. 스플래시 화면 에셋 명칭 정의

### 22.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `brand_logo_catchcash_symbol_default.svg` | brand logo symbol | svg | splash, login, app header 후보 | 64x64 | 캐치캐쉬 공식 로고 심볼. 최종 로고가 완성되면 이 파일명으로 교체 |

### 22.2 임시 이미지 에셋

최종 로고는 다른 팀원이 제작 중이므로, 현재 Stitch AI 시안의 보물상자 심볼은 임시 로고로 사용한다.

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `brand_logo_catchcash_symbol_temp.svg` | temporary brand logo symbol | svg | splash | 64x64 | 최종 로고 적용 전까지 사용하는 임시 보물상자 심볼 |

### 22.3 최종 적용 정책

개발 코드에서는 최종 파일명을 기준으로 바라보게 한다.

```txt
brand_logo_catchcash_symbol_default.svg
```

현재는 임시 심볼을 이 파일명으로 넣어 사용하거나, 별도 temp 파일로 관리한 뒤 최종 로고가 나오면 default 파일로 교체한다.

권장:

```txt
개발 경로는 default 파일명으로 고정
초기에는 임시 보물상자 심볼을 default 파일명으로 저장
최종 로고가 나오면 같은 파일명으로 교체
```

이렇게 하면 코드 수정 없이 로고만 교체할 수 있다.

### 22.4 에셋으로 만들지 않는 항목

| 항목 | 처리 |
|---|---|
| `catchcash` 텍스트 | 코드 텍스트 |
| `현실에서 빛나는 상자를 찾아라` | 코드 텍스트 |
| `생각 중...` | 코드 텍스트 |
| progress bar | CSS |
| 배경 | CSS |
| 화면 전체 이미지 | 사용 금지 |

---

## 23. 에셋 저장 위치

### 23.1 권장 폴더 구조

```txt
public/
  assets/
    brand/
      logo/
        brand_logo_catchcash_symbol_default.svg
        brand_logo_catchcash_symbol_temp.svg
```

### 23.2 실제 MVP 저장 기준

MVP에서는 아래 1개 경로만 코드에서 사용한다.

```txt
public/assets/brand/logo/brand_logo_catchcash_symbol_default.svg
```

임시 로고를 별도 보관할 경우:

```txt
public/assets/brand/logo/brand_logo_catchcash_symbol_temp.svg
```

---

## 24. 개발 적용 기준

### 24.1 코드에서 사용할 에셋 상수

```ts
export const SPLASH_ASSETS = {
  logoSymbol: '/assets/brand/logo/brand_logo_catchcash_symbol_default.svg',
} as const;
```

### 24.2 텍스트 상수

```ts
export const SPLASH_COPY = {
  brand: 'catchcash',
  subtitle: '현실에서 빛나는 상자를 찾아라',
  loading: '생각 중...',
} as const;
```

### 24.3 Tailwind 구현 기준

```txt
배경: bg-[#F7F5EF]
로고 심볼: img 태그 또는 Next Image
브랜드명: text-black font-bold
서브 카피: text-[#5D5F5F]
로딩 문구: text-[#777777]
progress bar 외곽: border border-black rounded-full
progress bar 채움: bg-black rounded-full
```

---

## 25. 에셋 제작 주의사항

- 로고 심볼은 SVG를 권장한다.
- SVG는 검은색 라인 기반이어야 한다.
- stroke는 `currentColor` 또는 `#000000`을 사용한다.
- 배경색이 포함된 큰 사각형 SVG로 만들지 않는다.
- 심볼 주변 여백을 과하게 포함하지 않는다.
- 최종 로고가 나오기 전까지 Stitch AI 시안의 보물상자 심볼은 임시로 사용한다.
- 최종 로고가 나오면 `brand_logo_catchcash_symbol_default.svg` 파일만 교체한다.
- 화면 전체를 PNG/JPG로 export해서 사용하지 않는다.
- 브랜드명, 서브 카피, 로딩 문구는 이미지로 만들지 않는다.
- 로딩 바는 SVG 에셋으로 만들지 않고 CSS로 구현한다.

## 26. 완료 기준

- [ ] 앱 실행 시 스플래시 화면이 최초로 노출된다.
- [ ] WebView 로딩 후 흰 화면이 길게 노출되지 않는다.
- [ ] 브랜드명 `catchcash`가 중앙에 표시된다.
- [ ] 공통 디자인 지시문 기준의 흑백 손그림 스케치 UI가 적용된다.
- [ ] Plus Jakarta Sans와 Space Grotesk 사용 기준을 따른다.
- [ ] `생각 중...` 텍스트가 표시된다.
- [ ] 손그림 느낌의 Pill 형태 프로그레스 바가 CSS로 표시된다.
- [ ] 최소 1.5초 동안 화면이 유지된다.
- [ ] 세션 확인이 3초를 초과하면 로그인 화면으로 이동한다.
- [ ] Supabase Auth 세션이 없으면 로그인 화면으로 이동한다.
- [ ] Supabase Auth 세션이 있고 프로필이 완료되었으면 메인 홈으로 이동한다.
- [ ] Supabase Auth 세션이 있지만 프로필이 미완료이면 닉네임 및 약관 동의 화면으로 이동한다.
- [ ] 다음 화면 이동 시 `router.replace`를 사용한다.
- [ ] `brand_logo_catchcash_symbol_default.svg` 이미지 에셋이 분리되어 있다.
- [ ] 브랜드명, 서브 카피, 로딩 문구는 이미지가 아니라 코드 텍스트로 구현한다.
- [ ] 화면 전체를 한 장짜리 이미지로 사용하지 않는다.
- [ ] 스플래시에서 GPS, 카메라, 기프티쇼비즈 API를 호출하지 않는다.
- [ ] 사용자가 조작해야 하는 버튼이나 입력 요소가 없다.
- [ ] 콘솔에 인증 토큰이 출력되지 않는다.

---

## 27. 개발 시 주의사항

- 이 화면은 사용자 앱의 첫 화면이므로 안정성이 가장 중요하다.
- 스플래시에서 너무 많은 데이터를 조회하지 않는다.
- 보물상자, 보관함, 기프티콘 데이터는 메인 홈 또는 해당 화면에서 조회한다.
- 기프티쇼비즈 쿠폰 발급은 절대 스플래시에서 실행하지 않는다.
- 앱 권한 요청은 필요 화면에서만 실행한다.
- 화면 전환은 빠르되, 최소 노출 시간은 보장한다.
- 세션 검증 로직은 로그인 화면과 중복 구현하지 않고 공통 유틸로 분리한다.
