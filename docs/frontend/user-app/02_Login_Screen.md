# 02. 로그인 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 02. 로그인 화면 정의서 |
| 파일명 | `02_Login_Screen.md` |
| 화면명 | 로그인 화면 |
| 화면 ID | `02_Login_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 바이브코딩 기반 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 로그인 시안 기준 / 이미지만 에셋 분리 / 나머지는 CSS·텍스트 구현 |

---

## 2. 화면 개요

로그인 화면은 사용자가 캐치캐쉬 앱에 접근하기 위해 소셜 계정으로 인증하는 화면이다.

캐치캐쉬는 별도의 이메일 회원가입과 비밀번호 로그인을 제공하지 않는다.  
사용자는 Kakao, Google, Apple 중 하나의 소셜 로그인 방식으로만 앱에 진입한다.

Stitch AI 시안 기준으로 화면은 흑백 손그림 스케치 스타일을 사용하며, 중앙 로고 심볼과 소셜 아이콘 등 **이미지로 필요한 요소만 에셋으로 분리**한다.  
텍스트, 버튼, 배경, 지도 라인 장식, 레이아웃은 CSS와 React 컴포넌트로 구현한다.

로그인 성공 후에는 Supabase Auth 세션을 생성하고, 사용자 프로필 완성 여부에 따라 다음 화면으로 분기한다.

---

## 3. 화면 목적

### 핵심 목적

- 사용자가 소셜 계정으로 캐치캐쉬에 로그인할 수 있게 한다.
- Supabase Auth 기반 인증 세션을 생성한다.
- 신규 유저와 기존 유저를 구분해 적절한 화면으로 이동시킨다.
- 앱 진입 전 필수 프로필 정보와 약관 동의 여부를 확인한다.

### 사용자 관점 목적

- 복잡한 회원가입 없이 소셜 계정으로 빠르게 앱을 시작한다.
- 로그인 후 바로 보물찾기 경험으로 진입한다.
- 최초 로그인 사용자는 닉네임과 약관 동의만 완료하면 된다.

---

## 4. 기술 구현 기준

### 4.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ Login Screen
```

### 4.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |

### 4.3 인증

| 항목 | 기술 |
|---|---|
| 인증 백엔드 | Supabase Auth |
| 로그인 방식 | OAuth 기반 소셜 로그인 |
| 지원 Provider | Google, Kakao, Apple |
| 세션 관리 | Supabase Session |
| 전역 상태 | Zustand 또는 Context API |

### 4.4 네이티브 브릿지

| 항목 | 기준 |
|---|---|
| 앱 패키징 | Capacitor |
| Apple 로그인 | iOS WebView 환경을 고려해 Supabase OAuth를 우선 사용 |
| 대체 방식 | Apple OAuth 문제가 있을 경우 Capacitor Apple Sign In 플러그인 검토 |

### 4.5 이 화면에서 사용하지 않는 기능

로그인 화면에서는 아래 기능을 실행하지 않는다.

- GPS 위치 권한 요청
- 카메라 권한 요청
- Haptics 진동
- WebAR 실행
- 네이버 지도 로드
- 기프티쇼비즈 API 호출
- 기프티콘 쿠폰 발급
- 보물상자 데이터 조회
- 보관함 데이터 조회

---

## 5. 진입 조건

### 5.1 진입 시점

사용자는 아래 상황에서 로그인 화면으로 진입한다.

| 상황 | 설명 |
|---|---|
| 최초 앱 실행 | Supabase 세션이 없는 경우 |
| 로그아웃 후 | 사용자가 로그아웃한 경우 |
| 세션 만료 | 기존 세션이 만료된 경우 |
| 인증 오류 | 세션 검증에 실패한 경우 |
| 접근 제한 | 로그인 필요 화면에 비로그인 상태로 접근한 경우 |

### 5.2 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| 스플래시 화면 | 세션 없음 / 세션 만료 / 세션 검증 실패 |
| 로그아웃 확인 팝업 | 로그아웃 완료 |
| 보호 라우트 | 인증이 필요한 화면 접근 시 세션 없음 |

### 5.3 Route

```txt
/login
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/login/page.tsx
```

---

## 6. 종료 및 이동 규칙

로그인 화면은 소셜 로그인 성공 결과와 사용자 프로필 상태에 따라 다음 화면으로 이동한다.

| 조건 | 이동 화면 |
|---|---|
| 로그인 성공 + 프로필 완료 + 약관 동의 완료 | 메인 홈 화면 |
| 로그인 성공 + 신규 유저 | 닉네임 및 약관 동의 화면 |
| 로그인 성공 + 프로필 미완성 | 닉네임 및 약관 동의 화면 |
| 로그인 실패 | 로그인 화면 유지 |
| 사용자가 뒤로가기 | 앱 종료 또는 이전 화면 정책에 따름 |

### 6.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 메인 홈 | `05_Main_Home_Screen` | `/home` |
| 닉네임 및 약관 동의 | `03_Nickname_Terms_Screen` | `/nickname` |

### 6.2 신규 유저 판단 기준

로그인 성공 후 Supabase Auth 계정은 존재하지만, 앱 서비스용 `profiles` 데이터가 없거나 필수 값이 비어 있으면 신규 유저 또는 온보딩 미완료 유저로 판단한다.

필수 확인값:

```txt
profiles.nickname
profiles.terms_agreed_at
profiles.status
```

분기 기준:

```txt
profiles row 없음
→ 닉네임 및 약관 동의 화면

profiles.nickname 없음
→ 닉네임 및 약관 동의 화면

profiles.terms_agreed_at 없음
→ 닉네임 및 약관 동의 화면

profiles.status = suspended
→ 로그인 차단 안내

profiles 정상
→ 메인 홈 화면
```

---

## 7. 화면 레이아웃

### 7.1 전체 구조

```txt
┌──────────────────────────────┐
│                              │
│        [로고 심볼]             │
│          catchcash           │
│ 현실에 숨겨둔 보물, 찾을 자신 있냐? │
│                              │
│     [카카오로 기어들어오기]      │
│     [구글로 기어들어오기]        │
│     [애플로 기어들어오기]        │
│                              │
│      [흐린 지도 라인 장식]       │
│                              │
└──────────────────────────────┘
```

### 7.2 레이아웃 원칙

- 모바일 세로 화면 기준으로 설계한다.
- 전체 화면은 중앙 정렬 구조를 사용한다.
- 화면 중앙 상단에는 로고 심볼, 브랜드명, 도발적인 서브 카피를 배치한다.
- 로그인 버튼 3개는 중앙 하단 CTA 영역에 세로로 배치한다.
- 배경에는 흐린 지도 라인 장식을 CSS로 표현할 수 있다.
- 사용자가 가장 먼저 브랜드명과 로그인 선택지를 인지할 수 있어야 한다.
- 불필요한 입력 필드, 텍스트 링크, 회원가입 CTA는 배치하지 않는다.
- 하단 네비게이션은 표시하지 않는다.

---

## 8. 디자인 시스템 적용

### 8.1 디자인 방향

로그인 화면은 캐치캐쉬의 첫 인증 화면으로, 공통 디자인 지시문 기준의 흑백 손그림 스케치 스타일을 적용한다.

디자인 키워드:

```txt
Black and White
Hand-drawn Wireframe
Sketch-style Mobile UI
Paper-like Background
Thick Outline
Minimal
Sarcastic Brand Tone
```

### 8.2 Font Token

| 용도 | 폰트 |
|---|---|
| Headline | Plus Jakarta Sans |
| Body | Plus Jakarta Sans |
| Label | Space Grotesk |

### 8.3 Color Token

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

### 8.4 Shape Token

| 요소 | Radius |
|---|---|
| 소셜 로그인 버튼 | `rounded-none` 또는 `rounded-sm` 수준의 손그림 박스 |
| 브랜드 심볼 컨테이너 | 이미지 자체 노출 또는 `rounded-sm` |
| 안내 카드 사용 시 | `rounded-md` |
| 토스트 / 알림 | `rounded-md` |

### 8.5 Spacing 기준

| 영역 | 기준 |
|---|---|
| 화면 좌우 여백 | 24px |
| 브랜드 영역 상단 여백 | 72px 이상 |
| 버튼 간격 | 12px |
| 로그인 버튼 높이 | 56px |
| 하단 약관 문구 여백 | 24px 이상 |

### 8.6 UI 컴포넌트 특징

- 버튼은 흰 배경과 검은 테두리의 손그림 박스 스타일을 사용한다.
- 전체적으로 블랙, 그레이, 종이색 중심의 흑백 UI를 사용한다.
- 그림자는 사용하지 않고 여백과 선으로 구분한다.
- 아이콘은 흑백 라인 아이콘을 사용한다.
- 버튼 안의 텍스트는 짧고 캐치캐쉬 톤에 맞게 작성한다.

---

## 9. UI 구성 요소

### 9.1 앱 배경

| 항목 | 정의 |
|---|---|
| 배경색 | `background` |
| 값 | `#F7F5EF` |
| 배경 장식 | 흐린 지도 라인 장식을 CSS로 구현 |
| 스크롤 | 기본적으로 없음 |
| Safe Area | iOS 상단/하단 Safe Area 고려 |

구현 기준:

```txt
min-h-screen
bg-[#F7F5EF]
px-6
safe-area-inset
relative
overflow-hidden
```

---

### 9.2 브랜드 헤더

| 항목 | 정의 |
|---|---|
| 위치 | 화면 상단 중앙 |
| 정렬 | 중앙 정렬 |
| 구성 | 로고 심볼, 앱명, 서브 카피 |
| 앱명 | `catchcash` |
| 서브 카피 | `현실에 숨겨둔 보물, 찾을 자신 있냐?` |

#### 앱명 스타일

| 항목 | 값 |
|---|---|
| Font | Plus Jakarta Sans |
| Weight | 700 이상 |
| Size | 13px~16px 권장 |
| Color | `primary` |
| Letter spacing | -0.02em |

#### 서브 카피 스타일

| 항목 | 값 |
|---|---|
| Font | Plus Jakarta Sans |
| Weight | 400 |
| Size | 15px~16px |
| Color | `secondary` |
| Align | center |

---

### 9.3 브랜드 심볼 영역

| 항목 | 정의 |
|---|---|
| 목적 | 캐치캐쉬 브랜드 인지 |
| 위치 | 브랜드명 위 |
| 형태 | 캐치캐쉬 로고 심볼 |
| 스타일 | 흑백 손그림 라인 로고 |
| 크기 | 64px~96px 권장 |

구현 기준:

- 로고 심볼은 중앙 배치한다.
- 최종 로고는 다른 팀원이 제작하는 공식 로고로 교체한다.
- 현재 Stitch AI 시안의 보물상자 이미지는 임시 로고로 사용한다.
- 로고 심볼만 이미지 에셋으로 분리한다.
- 지나치게 복잡한 3D 그래픽은 사용하지 않는다.
- 스플래시와 동일한 브랜드 상징을 유지한다.

---

### 9.4 소셜 로그인 버튼 공통 규칙

로그인 화면에는 3개의 소셜 로그인 버튼만 제공한다.

```txt
Google
Kakao
Apple
```

#### 공통 버튼 스타일

| 항목 | 값 |
|---|---|
| Height | 48px~56px |
| Width | 100% |
| Radius | `rounded-sm` 또는 0에 가까운 박스형 |
| Border | 1.5px~2px solid `#000000` |
| Background | `#FFFFFF` |
| Font | Space Grotesk 또는 Plus Jakarta Sans |
| Weight | 600 |
| Icon 위치 | 좌측 |
| Text 위치 | 중앙 기준 |
| Disabled | opacity 40% |
| Loading | 버튼 내부 텍스트 변경 또는 작은 CSS 스피너 |

#### 공통 인터랙션

| 상태 | 처리 |
|---|---|
| 기본 | 버튼 표시 |
| Pressed | 살짝 축소 또는 배경 톤 변경 |
| Loading | 클릭한 버튼만 로딩 표시 |
| Disabled | 로그인 처리 중 다른 버튼 비활성화 |
| Error | 버튼 복구 후 오류 안내 |

---

### 9.5 Google 로그인 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `구글로 기어들어오기` |
| 아이콘 | Google 로고 |
| Provider | `google` |
| 액션 | Supabase Google OAuth 시작 |

#### 클릭 시 동작

```txt
Google 버튼 클릭
→ loginStatus = loading_google
→ 다른 로그인 버튼 비활성화
→ Supabase OAuth Google 로그인 실행
→ 성공 시 세션 생성
→ profiles 조회
→ 분기 처리
```

---

### 9.6 Kakao 로그인 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `카카오로 기어들어오기` |
| 아이콘 | Kakao 로고 |
| Provider | `kakao` |
| 액션 | Supabase Kakao OAuth 시작 |

#### 클릭 시 동작

```txt
Kakao 버튼 클릭
→ loginStatus = loading_kakao
→ 다른 로그인 버튼 비활성화
→ Supabase OAuth Kakao 로그인 실행
→ 성공 시 세션 생성
→ profiles 조회
→ 분기 처리
```

---

### 9.7 Apple 로그인 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `애플로 기어들어오기` |
| 아이콘 | Apple 로고 |
| Provider | `apple` |
| 액션 | Supabase Apple OAuth 또는 iOS 대응 로그인 |

#### 클릭 시 동작

```txt
Apple 버튼 클릭
→ loginStatus = loading_apple
→ 다른 로그인 버튼 비활성화
→ Supabase OAuth Apple 로그인 실행
→ 성공 시 세션 생성
→ profiles 조회
→ 분기 처리
```

#### iOS WebView 대응

- 기본 구현은 Supabase OAuth 기반 Apple 로그인을 사용한다.
- iOS WebView 정책 또는 리다이렉트 이슈가 발생할 경우 Capacitor Apple Sign In 플러그인 연동을 검토한다.
- Apple 로그인은 iOS 앱 심사와 사용자 경험을 고려해 항상 노출한다.

---

### 9.8 약관 안내 문구

Stitch AI 시안 기준으로 로그인 화면에는 약관 안내 문구를 노출하지 않는다.

#### 정책

- 실제 필수 약관 동의는 닉네임 및 약관 동의 화면에서 처리한다.
- 로그인 화면에서는 소셜 로그인 선택지만 명확히 제공한다.
- 약관 링크 또는 체크박스는 이 화면에 배치하지 않는다.

---

---

## 9.9 Stitch AI 디자인 결과 반영

### 9.9.1 확정된 화면 카피

| 요소 | 확정 문구 | 구현 방식 |
|---|---|---|
| 브랜드명 | `catchcash` | 코드 텍스트 |
| 서브 카피 | `현실에 숨겨둔 보물, 찾을 자신 있냐?` | 코드 텍스트 |
| 카카오 버튼 | `카카오로 기어들어오기` | 코드 텍스트 |
| 구글 버튼 | `구글로 기어들어오기` | 코드 텍스트 |
| 애플 버튼 | `애플로 기어들어오기` | 코드 텍스트 |

### 9.9.2 화면 시각 구조

```txt
흐린 지도 라인 배경
→ 중앙 로고 심볼
→ catchcash 브랜드명
→ 도발적인 서브 카피
→ 소셜 로그인 버튼 3개
```

### 9.9.3 디자인 스타일

- 흑백 손그림 스케치 스타일을 적용한다.
- 배경은 종이색 오프화이트를 사용한다.
- 중앙 로고 심볼은 이미지 에셋으로 분리한다.
- 버튼은 흰 배경 + 검은 테두리 + 흑백 라인 아이콘으로 구성한다.
- 배경의 지도 라인 장식은 CSS pseudo-element 또는 border/linear-gradient로 구현한다.
- 화면 전체를 하나의 이미지로 사용하지 않는다.

---

## 9.10 에셋 분리 기준

로그인 화면에서는 **이미지로 필요한 것만 에셋으로 분리**한다.  
텍스트, 버튼, 배경, 레이아웃, 지도 라인 장식은 CSS/HTML/React로 구현한다.

### 9.10.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 중앙 로고 심볼 | 필수 | 최종 로고로 교체될 핵심 브랜드 이미지 |
| 소셜 로그인 아이콘 | 필수 | 버튼 내 반복 사용되는 Provider 아이콘 |
| 하단/배경 장식 | 제외 권장 | 현재 시안의 지도 라인은 CSS로 구현 가능 |

### 9.10.2 코드/CSS로 구현할 요소

| 요소 | 구현 방식 | 이유 |
|---|---|---|
| 배경색 | CSS/Tailwind | 반응형 대응 용이 |
| 흐린 지도 라인 | CSS pseudo-element | 이미지 없이 충분히 구현 가능 |
| 브랜드명 `catchcash` | 텍스트 | 접근성과 수정 용이 |
| 서브 카피 | 텍스트 | 문구 수정 가능성 있음 |
| 소셜 로그인 버튼 박스 | CSS | 상태/반응형/클릭 처리 용이 |
| 버튼 텍스트 | 텍스트 | Provider별 상태 변경 용이 |
| 오류 문구 | 텍스트 | 상태에 따라 노출 |
| 전체 레이아웃 | React/Tailwind | 화면 전체 이미지 사용 금지 |

### 9.10.3 중요 원칙

```txt
이미지만 에셋으로 분리한다.
텍스트는 이미지로 만들지 않는다.
버튼 박스는 이미지로 만들지 않는다.
배경 지도 라인은 이미지로 만들지 않고 CSS로 구현한다.
화면 전체를 PNG/JPG로 export해서 사용하지 않는다.
```

---

## 9.11 로그인 화면 에셋 명칭 정의

### 9.11.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `brand_logo_catchcash_symbol_default.svg` | brand logo symbol | svg | splash, login | 64x64 | 캐치캐쉬 공식 로고 심볼. 최종 로고 완성 전까지 임시 보물상자 심볼 사용 |
| `icon_social_kakao_default_24.svg` | social icon | svg | login | 24x24 | 카카오 로그인 버튼 아이콘, 흑백 라인 스타일 |
| `icon_social_google_default_24.svg` | social icon | svg | login | 24x24 | 구글 로그인 버튼 아이콘, 흑백 라인 스타일 |
| `icon_social_apple_default_24.svg` | social icon | svg | login | 24x24 | 애플 로그인 버튼 아이콘, 흑백 라인 스타일 |

### 9.11.2 임시 이미지 에셋

최종 로고는 다른 팀원이 제작 중이므로, 현재 Stitch AI 시안의 보물상자 심볼은 임시 로고로 사용한다.

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `brand_logo_catchcash_symbol_temp.svg` | temporary brand logo symbol | svg | splash, login | 64x64 | 최종 로고 적용 전까지 사용하는 임시 보물상자 심볼 |

### 9.11.3 최종 적용 정책

개발 코드는 최종 파일명을 기준으로 바라본다.

```txt
brand_logo_catchcash_symbol_default.svg
```

초기에는 임시 보물상자 심볼을 이 파일명으로 저장하고,  
최종 로고가 나오면 같은 파일명으로 교체한다.

```txt
코드 수정 없이 로고 파일만 교체
```

### 9.11.4 에셋으로 만들지 않는 항목

| 항목 | 처리 |
|---|---|
| `catchcash` 텍스트 | 코드 텍스트 |
| `현실에 숨겨둔 보물, 찾을 자신 있냐?` | 코드 텍스트 |
| 소셜 로그인 버튼 박스 | CSS |
| 버튼 텍스트 | 코드 텍스트 |
| 배경 지도 라인 | CSS |
| 화면 전체 이미지 | 사용 금지 |

---

## 9.12 에셋 저장 위치

### 9.12.1 권장 폴더 구조

```txt
public/
  assets/
    brand/
      logo/
        brand_logo_catchcash_symbol_default.svg
        brand_logo_catchcash_symbol_temp.svg

    icons/
      social/
        icon_social_kakao_default_24.svg
        icon_social_google_default_24.svg
        icon_social_apple_default_24.svg
```

### 9.12.2 코드에서 사용할 에셋 상수

```ts
export const LOGIN_ASSETS = {
  logoSymbol: '/assets/brand/logo/brand_logo_catchcash_symbol_default.svg',
  kakaoIcon: '/assets/icons/social/icon_social_kakao_default_24.svg',
  googleIcon: '/assets/icons/social/icon_social_google_default_24.svg',
  appleIcon: '/assets/icons/social/icon_social_apple_default_24.svg',
} as const;
```

### 9.12.3 텍스트 상수

```ts
export const LOGIN_COPY = {
  brand: 'catchcash',
  subtitle: '현실에 숨겨둔 보물, 찾을 자신 있냐?',
  kakaoButton: '카카오로 기어들어오기',
  googleButton: '구글로 기어들어오기',
  appleButton: '애플로 기어들어오기',
  loadingKakao: '카카오 문 여는 중...',
  loadingGoogle: '구글 문 여는 중...',
  loadingApple: '애플 문 여는 중...',
  error: '입장 실패. 다시 해봐.',
} as const;
```

### 9.12.4 CSS 구현 기준

```txt
배경: bg-[#F7F5EF]
브랜드명: text-black
서브 카피: text-[#5D5F5F]
버튼 배경: bg-white
버튼 테두리: border border-black
버튼 텍스트: text-black
버튼 hover/pressed: translate-y 또는 scale로 미세한 반응
배경 지도 라인: absolute pseudo-element + border/linear-gradient + opacity
```

### 9.12.5 CSS 지도 라인 구현 메모

배경의 흐린 지도 라인은 이미지 에셋으로 분리하지 않는다.  
아래 방식 중 하나로 구현한다.

```txt
방법 1: absolute div + border-left / border-right + rotate
방법 2: CSS pseudo-element로 dashed line 생성
방법 3: linear-gradient로 흐린 길 라인 생성
방법 4: SVG가 아닌 CSS border path 느낌으로 단순 구현
```

정확한 실제 지도 이미지는 필요하지 않다.  
로그인 화면에서는 분위기용 장식만 필요하다.


## 10. 화면 상태

### 10.1 상태 목록

```ts
type LoginStatus =
  | 'idle'
  | 'loading_google'
  | 'loading_kakao'
  | 'loading_apple'
  | 'success'
  | 'error'
  | 'blocked';
```

### 10.2 상태별 UI

| 상태 | UI 처리 |
|---|---|
| `idle` | 로그인 버튼 3개 활성화 |
| `loading_google` | Google 버튼 로딩, 나머지 비활성화 |
| `loading_kakao` | Kakao 버튼 로딩, 나머지 비활성화 |
| `loading_apple` | Apple 버튼 로딩, 나머지 비활성화 |
| `success` | 라우팅 처리 |
| `error` | 오류 메시지 표시 후 버튼 복구 |
| `blocked` | 정지 계정 안내 표시 |

---

## 11. 사용자 액션

### 11.1 Google 로그인 클릭

| 항목 | 내용 |
|---|---|
| Trigger | Google 버튼 클릭 |
| Validation | 중복 클릭 여부 확인 |
| Action | Supabase Google OAuth 실행 |
| Success | 세션 생성 후 분기 |
| Fail | 오류 메시지 표시 |

---

### 11.2 Kakao 로그인 클릭

| 항목 | 내용 |
|---|---|
| Trigger | Kakao 버튼 클릭 |
| Validation | 중복 클릭 여부 확인 |
| Action | Supabase Kakao OAuth 실행 |
| Success | 세션 생성 후 분기 |
| Fail | 오류 메시지 표시 |

---

### 11.3 Apple 로그인 클릭

| 항목 | 내용 |
|---|---|
| Trigger | Apple 버튼 클릭 |
| Validation | 중복 클릭 여부 확인 |
| Action | Supabase Apple OAuth 실행 |
| Success | 세션 생성 후 분기 |
| Fail | 오류 메시지 표시 |

---

### 11.4 약관 링크 클릭

| 항목 | 내용 |
|---|---|
| Trigger | 이용약관 또는 개인정보처리방침 링크 클릭 |
| Action | 약관 페이지 열기 |
| Login State | 유지 |
| Return | 로그인 화면으로 복귀 가능 |

---

### 11.5 뒤로가기

| 환경 | 처리 |
|---|---|
| Android | 로그인 화면에서 뒤로가기 시 앱 종료 또는 OS 기본 동작 |
| iOS | 제스처 뒤로가기 비활성 또는 이전 화면 정책 적용 |
| Web | 브라우저 history 기준 처리 |

---

## 12. 인증 로직

### 12.1 로그인 기본 흐름

```txt
1. 사용자가 소셜 로그인 버튼 클릭
2. 현재 로그인 진행 상태인지 확인
3. 선택한 Provider로 Supabase OAuth 시작
4. OAuth 인증 완료
5. Supabase Auth 세션 생성
6. auth store에 세션 저장
7. profiles 테이블 조회
8. 유저 상태 및 프로필 완성 여부 확인
9. 조건에 따라 다음 화면으로 이동
```

---

### 12.2 Provider 처리

```ts
type SocialProvider = 'google' | 'kakao' | 'apple';
```

로그인 함수 예시 기준:

```ts
signInWithOAuth(provider: SocialProvider)
```

---

### 12.3 Redirect 처리

OAuth 완료 후 앱으로 돌아오기 위한 redirect URL은 환경별로 분리한다.

| 환경 | Redirect 기준 |
|---|---|
| Local Web | `http://localhost:3000/auth/callback` |
| Vercel Preview | Preview URL 기반 callback |
| Production Web | 운영 도메인 기반 callback |
| Capacitor App | 앱 딥링크 또는 WebView callback 정책 |

권장 callback route:

```txt
/auth/callback
```

Next.js App Router 파일 경로:

```txt
app/auth/callback/route.ts
```

또는 클라이언트 페이지 처리 시:

```txt
app/auth/callback/page.tsx
```

---

### 12.4 로그인 성공 후 프로필 조회

로그인 성공 후 아래 데이터를 조회한다.

```txt
profiles
```

조회 기준:

```txt
profiles.auth_user_id = auth.user.id
```

필수 필드:

```txt
id
auth_user_id
nickname
avatar_url
provider
status
terms_agreed_at
created_at
updated_at
```

---

### 12.5 계정 상태 처리

| 상태 | 처리 |
|---|---|
| `active` | 정상 분기 |
| `suspended` | 로그인 차단 안내 |
| `deleted` | 로그인 차단 또는 고객센터 문의 안내 |
| row 없음 | 닉네임 및 약관 동의 화면으로 이동 |

정지 계정 안내 문구:

```txt
현재 이용이 제한된 계정입니다. 자세한 내용은 문의하기를 통해 확인해주세요.
```

---

## 13. 데이터 요구사항

### 13.1 읽는 데이터

| 데이터 | 설명 |
|---|---|
| Supabase Auth Session | 로그인 성공 후 생성되는 인증 세션 |
| Supabase User | 소셜 계정 기본 정보 |
| profiles | 서비스용 유저 프로필 |
| admin flag | 사용하지 않음. 유저 앱 로그인 화면에서는 관리자 권한을 처리하지 않음 |

### 13.2 쓰는 데이터

로그인 화면 자체에서는 서비스 프로필을 직접 완성하지 않는다.

단, OAuth 성공 후 필요한 경우 최소 인증 정보 기반으로 프로필 row를 생성할 수 있다.  
실제 닉네임과 약관 동의는 닉네임 및 약관 동의 화면에서 저장한다.

임시 생성 가능 필드:

```txt
auth_user_id
provider
status = active
created_at
updated_at
```

### 13.3 생성하지 않는 데이터

로그인 화면에서는 아래 데이터를 생성하지 않는다.

- treasure_boxes
- treasure_claims
- inventory_items
- giftishow_products
- giftishow_issues
- security_logs

---

## 14. 전역 상태 연동

### 14.1 Auth Store

로그인 성공 시 전역 auth store에 아래 값을 저장한다.

```ts
type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isProfileCompleted: boolean;
};
```

### 14.2 UI Store

로그인 중 공통 토스트 또는 모달을 사용한다면 UI store에 연결할 수 있다.

```ts
type UiState = {
  toastMessage: string | null;
  modalType: string | null;
};
```

### 14.3 저장 기준

- Supabase 세션은 Supabase 클라이언트의 세션 관리 정책을 따른다.
- 앱 전역 상태는 화면 렌더링과 분기 판단을 위한 캐시로 사용한다.
- 민감 정보는 localStorage에 직접 저장하지 않는다.

---

## 15. 예외 처리

### 15.1 OAuth 취소

| 상황 | 처리 |
|---|---|
| 사용자가 OAuth 화면에서 취소 | 로그인 화면으로 복귀 |
| 메시지 | `로그인이 취소되었습니다.` |
| 상태 | `idle`로 복구 |

---

### 15.2 OAuth 실패

| 상황 | 처리 |
|---|---|
| Provider 인증 실패 | 오류 토스트 표시 |
| 네트워크 오류 | 재시도 안내 |
| Supabase 오류 | 일반 오류 메시지 표시 |
| Callback 오류 | 로그인 화면으로 이동 |

권장 문구:

```txt
로그인에 실패했어요. 잠시 후 다시 시도해주세요.
```

---

### 15.3 Provider 설정 오류

| 상황 | 처리 |
|---|---|
| Provider 설정 누락 | 오류 메시지 표시 |
| Redirect URL 불일치 | 오류 메시지 표시 |
| 앱 환경 callback 실패 | 로그인 화면으로 복귀 |

사용자에게는 상세 개발 오류를 노출하지 않는다.

---

### 15.4 정지 계정

| 상황 | 처리 |
|---|---|
| `profiles.status = suspended` | 앱 진입 차단 |
| 이동 | 로그인 화면 유지 |
| CTA | 문의하기 |
| 문구 | `현재 이용이 제한된 계정입니다.` |

---

### 15.5 중복 클릭

| 상황 | 처리 |
|---|---|
| 로그인 처리 중 다른 버튼 클릭 | 무시 |
| 같은 버튼 연속 클릭 | 무시 |
| Loading 상태 | 1개 Provider만 진행 |

---

### 15.6 WebView 리다이렉트 이슈

| 상황 | 처리 |
|---|---|
| OAuth 후 앱으로 복귀 실패 | 로그인 화면 복귀 |
| Callback 데이터 없음 | 세션 재확인 |
| 세션 없음 | 오류 안내 후 로그인 유지 |

---

## 16. 보안 정책

### 16.1 클라이언트 보안

- OAuth Secret은 클라이언트에 노출하지 않는다.
- Supabase anon key는 클라이언트에서 사용 가능하지만, RLS 정책을 반드시 적용한다.
- 로그인 화면에서 관리자 권한 처리를 하지 않는다.
- 관리자 백오피스 로그인과 유저 앱 로그인 정책은 분리한다.

### 16.2 Supabase RLS

`profiles` 테이블은 아래 정책을 전제로 한다.

```txt
유저는 자신의 profile만 조회/수정할 수 있다.
관리자는 관리자 권한이 있는 경우에만 전체 유저 목록을 조회할 수 있다.
```

### 16.3 개인정보

로그인 화면에서는 사용자의 휴대폰 번호, 쿠폰 코드, 위치 정보를 요구하지 않는다.

---

## 17. 접근성

### 17.1 버튼 접근성

- 모든 소셜 로그인 버튼은 명확한 텍스트 라벨을 가진다.
- 아이콘만 있는 버튼을 사용하지 않는다.
- 터치 영역은 최소 44px 이상을 보장한다.
- 버튼 간 간격은 오터치를 방지할 수 있어야 한다.

### 17.2 스크린리더 라벨

권장 aria-label:

```txt
Continue with Google
Continue with Kakao
Continue with Apple
```

### 17.3 색 대비

- 버튼 텍스트는 배경과 충분한 대비를 가져야 한다.
- 회색 텍스트는 너무 옅지 않게 사용한다.
- 오류 메시지는 색상뿐 아니라 텍스트로도 명확하게 전달한다.

---

## 18. 구현 컴포넌트 제안

### 18.1 화면 컴포넌트

```txt
LoginPage
```

### 18.2 하위 컴포넌트

```txt
LoginBrandHeader
LoginHeroSymbol
SocialLoginButton
TermsNotice
LoginErrorToast
BlockedAccountNotice
```

### 18.3 훅

```txt
useSocialLogin
useAuthRedirect
useProfileCheck
```

### 18.4 유틸

```txt
getOAuthRedirectUrl
mapAuthErrorMessage
checkProfileCompleted
```

---

## 19. 권장 파일 구조

```txt
app/
  login/
    page.tsx

  auth/
    callback/
      page.tsx

features/
  auth/
    components/
      LoginBrandHeader.tsx
      LoginHeroSymbol.tsx
      SocialLoginButton.tsx
      TermsNotice.tsx
    hooks/
      useSocialLogin.ts
      useProfileCheck.ts
    services/
      auth.service.ts
    types/
      auth.types.ts

stores/
  auth.store.ts

constants/
  routes.ts
  authProviders.ts
  loginAssets.ts
  loginCopy.ts

public/
  assets/
    brand/
      logo/
        brand_logo_catchcash_symbol_default.svg
    icons/
      social/
        icon_social_kakao_default_24.svg
        icon_social_google_default_24.svg
        icon_social_apple_default_24.svg

lib/
  supabase/
    client.ts
```

---

## 20. TypeScript 타입 제안

### 20.1 로그인 상태 타입

```ts
export type LoginStatus =
  | 'idle'
  | 'loading_google'
  | 'loading_kakao'
  | 'loading_apple'
  | 'success'
  | 'error'
  | 'blocked';
```

### 20.2 Provider 타입

```ts
export type SocialProvider = 'google' | 'kakao' | 'apple';
```

### 20.3 Profile 타입

```ts
export type ProfileStatus = 'active' | 'suspended' | 'deleted';

export type Profile = {
  id: string;
  auth_user_id: string;
  nickname: string | null;
  avatar_url: string | null;
  provider: SocialProvider;
  status: ProfileStatus;
  terms_agreed_at: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 21. 완료 기준

### 21.1 UI 완료 기준

- [ ] 로그인 화면이 `/login` route에서 렌더링된다.
- [ ] 앱명 `catchcash`가 코드 텍스트로 표시된다.
- [ ] 서브 카피 `현실에 숨겨둔 보물, 찾을 자신 있냐?`가 코드 텍스트로 표시된다.
- [ ] `brand_logo_catchcash_symbol_default.svg` 로고 심볼 에셋이 표시된다.
- [ ] Google 로그인 버튼이 표시된다.
- [ ] Kakao 로그인 버튼이 표시된다.
- [ ] Apple 로그인 버튼이 표시된다.
- [ ] 소셜 아이콘 3개가 이미지 에셋으로 분리되어 있다.
- [ ] 배경 지도 라인은 이미지가 아니라 CSS로 구현되어 있다.
- [ ] 화면 전체를 한 장짜리 이미지로 사용하지 않는다.
- [ ] 버튼은 흰 배경 + 검은 테두리의 손그림 박스 스타일로 표시된다.
- [ ] 전체 화면은 흑백 손그림 스케치 디자인 기준을 따른다.
- [ ] 로그인 화면에는 약관 체크박스와 약관 안내 링크를 표시하지 않는다.
- [ ] 하단 네비게이션이 표시되지 않는다.

### 21.2 기능 완료 기준

- [ ] Google 로그인 버튼 클릭 시 Supabase OAuth가 실행된다.
- [ ] Kakao 로그인 버튼 클릭 시 Supabase OAuth가 실행된다.
- [ ] Apple 로그인 버튼 클릭 시 Supabase OAuth가 실행된다.
- [ ] 로그인 진행 중 중복 클릭이 방지된다.
- [ ] 로그인 성공 시 Supabase 세션이 생성된다.
- [ ] 로그인 성공 후 profiles 데이터를 조회한다.
- [ ] 기존 유저는 메인 홈 화면으로 이동한다.
- [ ] 신규 유저는 닉네임 및 약관 동의 화면으로 이동한다.
- [ ] 프로필 미완성 유저는 닉네임 및 약관 동의 화면으로 이동한다.
- [ ] 정지 유저는 앱 진입이 차단된다.
- [ ] 로그인 실패 시 로그인 화면에 머무른다.
- [ ] 로그인 실패 메시지가 사용자에게 표시된다.

### 21.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] Tailwind CSS 토큰을 사용한다.
- [ ] Supabase 클라이언트를 통해 인증을 처리한다.
- [ ] Auth Store 또는 Context에 세션 상태가 반영된다.
- [ ] OAuth callback route가 정의되어 있다.
- [ ] 민감 정보가 클라이언트에 노출되지 않는다.

### 21.4 제외 기능 확인

- [ ] 이메일 로그인 입력 필드가 없다.
- [ ] 비밀번호 입력 필드가 없다.
- [ ] 회원가입 버튼이 없다.
- [ ] GPS 권한 요청이 없다.
- [ ] 카메라 권한 요청이 없다.
- [ ] 기프티쇼비즈 API 호출이 없다.
- [ ] 쿠폰 발급 로직이 없다.

---

## 22. 제외 범위

로그인 화면에서는 아래 기능을 구현하지 않는다.

- 이메일/비밀번호 로그인
- 별도 회원가입 화면 이동
- 비밀번호 찾기
- 휴대폰 번호 인증
- 본인인증
- 위치 권한 요청
- 카메라 권한 요청
- 보물상자 목록 조회
- 보상 보관함 조회
- 기프티쇼비즈 상품 조회
- 기프티쇼비즈 쿠폰 발급
- 관리자 로그인
- 관리자 권한 분기

---

## 23. 개발자 주의사항

- 로그인 화면은 인증만 담당한다.
- 유저 프로필 완성은 닉네임 및 약관 동의 화면에서 처리한다.
- 보상 지급과 기프티콘 발급 로직은 로그인 화면에 포함하지 않는다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
- 쿠폰 발급은 유저가 보관함에서 쿠폰을 열람하거나 `쿠폰 받기`를 실행하는 시점에 별도 처리한다.
- Apple 로그인은 iOS 앱 심사를 고려해 반드시 노출한다.
- WebView 환경에서 OAuth callback이 안정적으로 동작하는지 별도 테스트가 필요하다.
- 로그인 실패 사유는 사용자가 이해할 수 있는 문장으로만 표시한다.
- 개발 오류 메시지나 Provider 내부 에러 코드는 사용자에게 직접 노출하지 않는다.
- 이미지만 에셋으로 분리한다.
- 브랜드명, 서브 카피, 버튼 텍스트는 이미지로 만들지 않는다.
- 배경 지도 라인은 이미지가 아니라 CSS로 구현한다.
- 최종 로고가 나오기 전까지 임시 보물상자 심볼을 `brand_logo_catchcash_symbol_default.svg`로 사용하고, 최종 로고가 나오면 같은 파일명으로 교체한다.
