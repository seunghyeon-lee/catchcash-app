# 03. 닉네임 및 약관 동의 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 03. 닉네임 및 약관 동의 화면 정의서 |
| 파일명 | `03_Nickname_Terms_Screen.md` |
| 화면명 | 닉네임 및 약관 동의 화면 |
| 화면 ID | `03_Nickname_Terms_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | 바이브코딩 기반 화면 구현을 위한 단위 화면 명세 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 닉네임 시안 기준 / 입력 박스·CTA 버튼 프레임 벡터 에셋 적용 |

---

## 2. 화면 개요

닉네임 및 약관 동의 화면은 사용자가 소셜 로그인에 성공한 후, 캐치캐쉬 서비스를 처음 이용하기 위해 필요한 최소 정보를 입력하는 온보딩 화면이다.

이 화면에서는 닉네임 입력과 필수 약관 동의를 한 번에 처리한다.  
별도의 회원가입 화면은 없으며, 소셜 로그인 성공 후 이 화면에서 서비스용 프로필을 완성한다.

Stitch AI 시안 기준으로 닉네임 입력 박스와 하단 CTA 버튼은 삐뚤빼뚤한 손그림 외곽선을 가진다.  
이 외곽선은 벡터화한 SVG 프레임 에셋으로 사용하고, 실제 입력 기능과 버튼 기능은 HTML/CSS/React 컴포넌트로 구현한다.

---

## 3. 화면 목적

### 핵심 목적

- 소셜 로그인 후 신규 유저의 서비스 프로필을 완성한다.
- 앱에서 사용할 닉네임을 입력받는다.
- 서비스 이용에 필요한 필수 약관 동의를 받는다.
- 선택 약관 동의 여부를 저장한다.
- 완료 후 메인 홈 화면으로 이동한다.

### 사용자 관점 목적

- 복잡한 가입 절차 없이 닉네임과 약관 동의만으로 앱을 시작한다.
- 자신의 앱 내 표시 이름을 직접 설정한다.
- 필수 동의 항목을 확인하고 서비스를 시작한다.

---

## 4. 기술 구현 기준

### 4.1 앱 구조

캐치캐쉬 앱은 Next.js 기반 모바일 웹앱을 Capacitor WebView로 감싼 하이브리드 앱이다.

```txt
iOS / Android App
→ Capacitor Shell
→ WebView
→ Next.js App
→ Nickname & Terms Screen
```

### 4.2 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js |
| UI 라이브러리 | React |
| 언어 | TypeScript |
| 라우팅 | Next.js App Router |
| 스타일링 | Tailwind CSS |

### 4.3 상태 및 폼 처리

| 항목 | 기술 |
|---|---|
| 입력 폼 | React Hook Form 권장 |
| 유효성 검증 | Zod 권장 |
| 인증 상태 | Supabase Auth Session |
| 전역 상태 | Zustand 또는 Context API |
| 데이터 저장 | Supabase PostgreSQL |

### 4.4 이 화면에서 사용하지 않는 기능

이 화면에서는 아래 기능을 실행하지 않는다.

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

사용자는 아래 상황에서 이 화면으로 진입한다.

| 상황 | 설명 |
|---|---|
| 소셜 로그인 최초 성공 | Supabase Auth 계정은 생성되었지만 서비스 프로필이 없는 경우 |
| 프로필 미완성 | 닉네임이 없거나 약관 동의가 완료되지 않은 경우 |
| 스플래시 세션 확인 후 | 세션은 있으나 온보딩이 완료되지 않은 경우 |
| 로그인 후 분기 | 로그인 성공 후 `profiles` 데이터 확인 결과 온보딩이 필요한 경우 |

### 5.2 진입 경로

| 이전 화면 | 진입 조건 |
|---|---|
| 로그인 화면 | 소셜 로그인 성공 후 신규 유저로 판단 |
| 스플래시 화면 | 기존 세션은 있으나 프로필 미완성 |
| 보호 라우트 | 서비스 이용 전 필수 정보 미완성 |

### 5.3 Route

```txt
/nickname
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/nickname/page.tsx
```

---

## 6. 종료 및 이동 규칙

| 조건 | 이동 화면 |
|---|---|
| 닉네임 입력 완료 + 필수 약관 동의 완료 + 저장 성공 | 메인 홈 화면 |
| 닉네임 미입력 | 현재 화면 유지 |
| 닉네임 유효성 실패 | 현재 화면 유지 + 오류 표시 |
| 필수 약관 미동의 | 현재 화면 유지 + 오류 표시 |
| 저장 실패 | 현재 화면 유지 + 오류 표시 |
| 닫기 클릭 | 로그인 화면 또는 로그아웃 처리 후 로그인 화면 |
| 그만두기 클릭 | 로그인 화면 또는 로그아웃 처리 후 로그인 화면 |

### 6.1 이동 화면 ID

| 화면 | 화면 ID | Route |
|---|---|---|
| 메인 홈 | `05_Main_Home_Screen` | `/home` |
| 로그인 | `02_Login_Screen` | `/login` |

### 6.2 완료 후 이동 기준

```txt
profiles.nickname 저장 완료
profiles.terms_agreed_at 저장 완료
필수 약관 동의 저장 완료
→ /home 이동
```

---

## 7. 화면 레이아웃

### 7.1 전체 구조

```txt
┌──────────────────────────────┐
│ ←                            │
├──────────────────────────────┤
│                              │
│ 널 뭐라 부르냐?               │
│ 별명 하나는 있어야지.          │
│                              │
│ 별명                          │
│ [거친 외곽선 입력 프레임]       │
│ 2~12자. 이상한 건 알아서 걸러낸다. │
│                              │
│ CATCHCASH RULES              │
│ [ ] 이용약관 동의        >     │
│ [ ] 개인정보 수집 동의    >     │
│ [ ] 마케팅 수신 동의      >     │
│                              │
│                              │
│ [거친 검은 CTA 버튼 프레임]     │
│          관둬                 │
│                              │
└──────────────────────────────┘
```

### 7.2 레이아웃 원칙

- 모바일 세로 화면 기준으로 설계한다.
- 상단에는 뒤로가기 버튼을 배치한다.
- 본문은 타이틀, 닉네임 입력 영역, 약관 동의 영역으로 구성한다.
- 닉네임 입력 필드는 벡터 프레임 에셋 위에 실제 input을 올리는 구조로 구현한다.
- CTA 버튼은 벡터 프레임 에셋을 배경처럼 사용하고, 실제 button과 텍스트는 코드로 구현한다.
- CTA 버튼은 화면 하단에 고정 또는 하단 근처에 배치한다.
- 하단 네비게이션은 표시하지 않는다.
- 사용자가 한 화면에서 닉네임과 약관 동의를 모두 완료할 수 있어야 한다.

---

## 8. 디자인 시스템 적용

### 8.1 디자인 방향

이 화면은 소셜 로그인 후 첫 사용자 설정 화면이다.  
앱 시작 전 마지막 진입 단계이므로 부담 없이 빠르게 완료할 수 있는 간결한 온보딩 UI로 구성한다.

디자인 키워드:

```txt
Black and White
Hand-drawn Wireframe
Sketch-style Mobile UI
Paper-like Background
Rough Outline
Uneven Vector Frame
Sarcastic Brand Tone
Onboarding
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
| Success | `success` | `#000000` |

### 8.4 Shape Token

| 요소 | Radius |
|---|---|
| CTA 버튼 | 벡터 프레임 에셋 기반 rough box |
| 닉네임 입력 박스 | 벡터 프레임 에셋 기반 rough input |
| 체크박스 | 손그림 네모 박스 |
| 약관 row 터치 영역 | 사각 row, 별도 둥근 카드 사용 안 함 |
| 오류 토스트 | `rounded-md` |
| 모달 사용 시 | `rounded-xl` |

### 8.5 Spacing 기준

| 영역 | 기준 |
|---|---|
| 화면 좌우 여백 | 24px |
| 헤더 높이 | 56px~64px |
| 본문 상단 여백 | 24px |
| 입력 영역 간격 | 12px |
| 약관 row 높이 | 48px~56px |
| 약관 row 간격 | 8px |
| CTA 버튼 높이 | 56px |
| CTA 하단 여백 | Safe Area 포함 24px 이상 |

---

## 9. UI 구성 요소

### 9.1 상단 헤더

| 항목 | 정의 |
|---|---|
| 위치 | 화면 최상단 |
| 높이 | 56px~64px |
| 좌측 | 뒤로가기 버튼 |
| 중앙 | 없음 |
| 우측 | 없음 |

#### 뒤로가기 버튼

| 항목 | 정의 |
|---|---|
| 아이콘 | Arrow Left |
| 위치 | 좌측 |
| 크기 | 24px 터치 아이콘 |
| 터치 영역 | 최소 44px |
| 동작 | 온보딩 중단 확인 또는 로그인 화면 이동 |

---

### 9.2 페이지 타이틀

| 항목 | 정의 |
|---|---|
| 텍스트 | `널 뭐라 부르냐?` |
| 위치 | 헤더 아래 본문 상단 |
| Font | Plus Jakarta Sans |
| Weight | 700 |
| Size | 22px~26px |
| Color | `primary` |

### 표시 규칙

- 사용자가 닉네임 설정 화면임을 바로 이해할 수 있어야 한다.
- 캐치캐쉬의 도발적인 말투를 적용한다.
- 타이틀 아래에는 손그림 느낌의 밑줄을 CSS로 구현한다.
- 보조 문구 `별명 하나는 있어야지.`를 타이틀 아래에 표시한다.

---

### 9.3 닉네임 입력 영역

#### 라벨

| 항목 | 정의 |
|---|---|
| 텍스트 | `별명` |
| Font | Space Grotesk |
| Weight | 600 |
| Size | 12px |
| Letter spacing | 0.08em |
| Color | `neutral` |

#### 입력 필드

| 항목 | 정의 |
|---|---|
| Placeholder | 없음 또는 빈 값
| 입력 타입 | text |
| 최대 길이 | 12자 권장 |
| 최소 길이 | 2자 |
| 스타일 | 벡터 rough input frame + 투명 input
| Border | `ui_frame_input_nickname_rough_default.svg` 프레임 사용
| Focus | `ui_frame_input_nickname_rough_focus.svg` 프레임으로 교체 또는 CSS outline
| 우측 아이콘 | 선택 사항 |

#### 헬퍼 텍스트

| 항목 | 정의 |
|---|---|
| 기본 문구 | `2~12자. 이상한 건 알아서 걸러낸다.` |
| 오류 문구 | 유효성 오류 발생 시 표시 |
| Font | Plus Jakarta Sans |
| Size | 13px |
| Color | 기본 `neutral`, 오류 `error` |

### 닉네임 입력 규칙

| 조건 | 규칙 |
|---|---|
| 필수 여부 | 필수 |
| 최소 길이 | 2자 |
| 최대 길이 | 12자 |
| 공백만 입력 | 불가 |
| 앞뒤 공백 | 저장 전 trim 처리 |
| 이모지 | MVP에서는 허용하지 않는 것을 권장 |
| 특수문자 | `_`, `-` 정도만 허용 권장 |
| 중복 확인 | MVP에서는 선택. 운영 정책에 따라 적용 가능 |

### 권장 유효성 메시지

| 상황 | 메시지 |
|---|---|
| 미입력 | 별명은 있어야지. |
| 2자 미만 | 그건 너무 짧다. |
| 12자 초과 | 그건 너무 길다. |
| 형식 오류 | 이상한 건 걸러낸다. |
| 중복 | 이미 누가 쓰고 있다. |

---

## 10. 약관 동의 영역

### 10.1 섹션 라벨

| 항목 | 정의 |
|---|---|
| 텍스트 | `CATCHCASH RULES` |
| Font | Space Grotesk |
| Weight | 600 |
| Size | 12px |
| Letter spacing | 0.08em |
| Color | `neutral` |

---

### 10.2 약관 항목

약관 항목은 체크박스 + 약관명 + 상세보기 화살표로 구성한다.

| 항목 | 필수 여부 | 저장 필드 | 설명 |
|---|---:|---|---|
| 이용약관 동의 | 필수 | `terms_of_service_agreed_at` | 서비스 이용 필수 약관 |
| 개인정보 수집 동의 | 필수 | `privacy_policy_agreed_at` | 개인정보 수집 및 처리 필수 동의 |
| 마케팅 수신 동의 | 선택 | `marketing_agreed_at` | 이벤트/혜택 알림 수신 동의 |

### 10.3 약관 row 구조

```txt
[체크박스] 약관명                         [>]
```

| 요소 | 정의 |
|---|---|
| 체크박스 | 좌측 배치 |
| 약관명 | 중앙 텍스트 |
| 화살표 | 우측 배치 |
| row 높이 | 48px~56px |
| row 클릭 | 약관 상세 열기 또는 체크 토글 정책 중 하나 선택 |

### 권장 인터랙션

- 체크박스 영역 클릭 시 동의 상태를 토글한다.
- 약관명 또는 화살표 클릭 시 약관 상세 화면/모달을 연다.
- 필수 약관은 상세 확인 없이 체크만으로 동의 가능하되, 상세보기 접근은 제공한다.

---

## 11. CTA 영역

### 11.1 메인 CTA 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `사냥 합류하기` |
| 우측 아이콘 | 화살표 `→` |
| 위치 | 화면 하단 |
| Height | 56px |
| Width | 100% |
| Radius | 벡터 프레임 형태를 따름
| Background | `#000000` + `ui_frame_button_hunt_join_rough_default.svg`
| Text color | `#FFFFFF` |
| Disabled Background | `#C9C9C9` 또는 disabled 프레임
| Font | Plus Jakarta Sans |
| Weight | 700 |

### 활성화 조건

메인 CTA는 아래 조건을 모두 만족하면 활성화된다.

```txt
닉네임 유효성 통과
이용약관 동의 체크
개인정보 수집 동의 체크
저장 요청 중 아님
```

마케팅 수신 동의는 선택 항목이므로 CTA 활성화 조건에 포함하지 않는다.

### 클릭 시 동작

```txt
사냥 합류하기 클릭
→ 닉네임 trim
→ 유효성 검증
→ 필수 약관 동의 여부 확인
→ profiles 저장 또는 업데이트
→ terms agreement 저장
→ auth store profile 갱신
→ /home 이동
```

---

### 11.2 그만두기 버튼

| 항목 | 정의 |
|---|---|
| 텍스트 | `관둬` |
| 위치 | 메인 CTA 아래 |
| 스타일 | 텍스트 버튼 |
| Color | `neutral` |
| 동작 | 온보딩 중단 |

### 그만두기 처리 정책

MVP 권장 정책:

```txt
관둬 클릭
→ 확인 모달 노출
→ 확인 시 Supabase 로그아웃
→ 로그인 화면으로 이동
```

확인 모달 문구:

```txt
지금 그만두면 캐치캐쉬를 시작할 수 없어요. 로그아웃할까요?
```

---

---

## 11.3 Stitch AI 디자인 결과 반영

### 11.3.1 확정된 화면 카피

| 요소 | 확정 문구 | 구현 방식 |
|---|---|---|
| 페이지 타이틀 | `널 뭐라 부르냐?` | 코드 텍스트 |
| 보조 문구 | `별명 하나는 있어야지.` | 코드 텍스트 |
| 입력 라벨 | `별명` | 코드 텍스트 |
| 헬퍼 텍스트 | `2~12자. 이상한 건 알아서 걸러낸다.` | 코드 텍스트 |
| 약관 섹션 | `CATCHCASH RULES` | 코드 텍스트 |
| CTA | `사냥 합류하기 →` | 코드 텍스트 |
| 보조 액션 | `관둬` | 코드 텍스트 |

### 11.3.2 화면 시각 구조

```txt
뒤로가기 아이콘
→ 타이틀/보조 문구
→ 닉네임 입력 영역
→ rough input frame
→ 약관 row 3개
→ rough black CTA button frame
→ 관둬
```

### 11.3.3 디자인 스타일

- 흑백 손그림 스케치 스타일을 적용한다.
- 배경은 종이색 오프화이트를 사용한다.
- 닉네임 입력 박스와 CTA 버튼은 벡터화한 rough frame 에셋을 사용한다.
- 실제 입력, 클릭, 텍스트, 상태 처리는 HTML/CSS/React로 구현한다.
- 화면 전체를 하나의 이미지로 사용하지 않는다.

---

## 11.4 이미지 에셋 분리 기준

이 화면에서는 모든 UI를 이미지로 만들지 않는다.  
단, Stitch AI/Figma 시안에서 벡터화한 **닉네임 입력 박스 외곽 프레임**과 **CTA 버튼 외곽 프레임**은 이미지 에셋으로 사용한다.

### 11.4.1 이미지 에셋으로 분리할 요소

| 요소 | 분리 여부 | 이유 |
|---|---|---|
| 뒤로가기 버튼 아이콘 | 필수 | 화면 상단의 손그림 원형 뒤로가기 버튼 스타일 재현 |
| 닉네임 입력 박스 rough frame | 필수 | 손그림 외곽선 재현 |
| CTA 버튼 rough frame | 필수 | 손그림 검은 버튼 형태 재현 |

### 11.4.2 코드/CSS로 구현할 요소

| 요소 | 구현 방식 | 이유 |
|---|---|---|
| 실제 input | HTML input | 텍스트 입력, 포커스, 접근성 필요 |
| input placeholder/텍스트 | 코드 텍스트 | 수정 가능성 및 접근성 |
| CTA button | HTML button | 클릭, disabled, loading 처리 필요 |
| CTA 문구 | 코드 텍스트 | 상태별 문구 변경 가능 |
| 타이틀/보조 문구 | 코드 텍스트 | 접근성 및 수정 용이 |
| 체크박스 | CSS/컴포넌트 | 토글 상태 처리 필요 |
| 약관 row 화살표 아이콘 | 공통 아이콘 컴포넌트 | 재사용 가능. 필요 시 별도 에셋으로 확장 |
| 배경 | CSS | 반응형 대응 |

### 11.4.3 중요 원칙

```txt
프레임만 이미지 에셋으로 사용한다.
입력 텍스트는 이미지에 포함하지 않는다.
버튼 텍스트는 이미지에 포함하지 않는다.
실제 input과 button 기능은 HTML/CSS/React로 구현한다.
스크린샷 crop PNG가 아니라 Figma 벡터 오브젝트를 SVG로 export해서 사용한다.
```

---

## 11.5 닉네임 화면 에셋 명칭 정의

### 11.5.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_nav_back_circle_rough_default_32.svg` | navigation icon | svg | nickname, detail pages | 32x32 | 손그림 원형 테두리 안에 왼쪽 화살표가 있는 뒤로가기 아이콘 |
| `ui_frame_input_nickname_rough_default.svg` | UI frame | svg | nickname | 320x56 | 닉네임 입력 필드용 삐뚤빼뚤한 흰색 rough input frame |
| `ui_frame_button_hunt_join_rough_default.svg` | UI frame | svg | nickname | 320x56 | `사냥 합류하기` CTA 버튼용 검은 rough button frame |

### 11.5.2 선택 상태 에셋

MVP에서는 default만 사용해도 된다.  
다만 상태 표현이 필요하면 아래 에셋을 추가할 수 있다.

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_nav_back_circle_rough_pressed_32.svg` | navigation icon | svg | nickname, detail pages | 32x32 | 뒤로가기 버튼 pressed 상태 |
| `icon_nav_back_circle_rough_disabled_32.svg` | navigation icon | svg | nickname, detail pages | 32x32 | 뒤로가기 버튼 disabled 상태. 보통 사용하지 않음 |
| `ui_frame_input_nickname_rough_focus.svg` | UI frame | svg | nickname | 320x56 | 포커스 상태 입력 프레임 |
| `ui_frame_input_nickname_rough_error.svg` | UI frame | svg | nickname | 320x56 | 오류 상태 입력 프레임 |
| `ui_frame_button_hunt_join_rough_disabled.svg` | UI frame | svg | nickname | 320x56 | CTA 비활성 상태 버튼 프레임 |

### 11.5.3 최종 MVP 적용 정책

MVP에서는 아래 3개를 필수로 사용한다.

```txt
icon_nav_back_circle_rough_default_32.svg
ui_frame_input_nickname_rough_default.svg
ui_frame_button_hunt_join_rough_default.svg
```

focus/error/disabled는 CSS로 보정하거나 후순위 에셋으로 추가한다.

---

## 11.6 에셋 저장 위치

### 11.6.1 권장 폴더 구조

```txt
public/
  assets/
    icons/
      navigation/
        icon_nav_back_circle_rough_default_32.svg
        icon_nav_back_circle_rough_pressed_32.svg

    ui/
      frames/
        input/
          ui_frame_input_nickname_rough_default.svg
          ui_frame_input_nickname_rough_focus.svg
          ui_frame_input_nickname_rough_error.svg

        button/
          ui_frame_button_hunt_join_rough_default.svg
          ui_frame_button_hunt_join_rough_disabled.svg
```

### 11.6.2 코드에서 사용할 에셋 상수

```ts
export const NICKNAME_TERMS_ASSETS = {
  backIcon: '/assets/icons/navigation/icon_nav_back_circle_rough_default_32.svg',
  nicknameInputFrame: '/assets/ui/frames/input/ui_frame_input_nickname_rough_default.svg',
  huntJoinButtonFrame: '/assets/ui/frames/button/ui_frame_button_hunt_join_rough_default.svg',
} as const;
```

### 11.6.3 텍스트 상수

```ts
export const NICKNAME_TERMS_COPY = {
  title: '널 뭐라 부르냐?',
  subtitle: '별명 하나는 있어야지.',
  nicknameLabel: '별명',
  nicknameHelper: '2~12자. 이상한 건 알아서 걸러낸다.',
  rulesLabel: 'CATCHCASH RULES',
  termsOfService: '[필수] 이용약관 동의',
  privacyPolicy: '[필수] 개인정보 수집 및 이용 동의',
  marketing: '[선택] 새로운 사냥 알림 받기',
  cta: '사냥 합류하기',
  quit: '관둬',
} as const;
```

---

## 11.7 구현 방식

### 11.7.1 뒤로가기 버튼 구현

뒤로가기 버튼은 손그림 원형 아이콘 SVG를 사용한다.  
다만 실제 클릭 영역은 HTML button으로 구현한다.

권장 구조:

```tsx
<button
  type="button"
  className="flex h-11 w-11 items-center justify-center"
  aria-label="뒤로가기"
>
  <img
    src={NICKNAME_TERMS_ASSETS.backIcon}
    alt=""
    aria-hidden="true"
    className="h-8 w-8"
  />
</button>
```

구현 원칙:

- 아이콘 SVG는 장식 이미지이므로 `aria-hidden="true"` 처리한다.
- 실제 접근성 라벨은 button의 `aria-label="뒤로가기"`로 제공한다.
- 터치 영역은 최소 44px 이상 확보한다.
- 뒤로가기 아이콘 SVG 안에 텍스트를 포함하지 않는다.

### 11.7.2 닉네임 입력 필드 구현

닉네임 입력 필드는 아래 구조로 구현한다.

```txt
wrapper div
→ rough input frame SVG
→ 실제 input
```

권장 구조:

```tsx
<div className="relative h-14 w-full">
  <img
    src={NICKNAME_TERMS_ASSETS.nicknameInputFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <input
    className="relative z-10 h-full w-full bg-transparent px-4 text-black outline-none"
    aria-label="별명"
  />
</div>
```

### 11.7.3 CTA 버튼 구현

CTA 버튼은 아래 구조로 구현한다.

```txt
button
→ rough button frame SVG
→ CTA 텍스트
```

권장 구조:

```tsx
<button className="relative h-14 w-full disabled:opacity-40">
  <img
    src={NICKNAME_TERMS_ASSETS.huntJoinButtonFrame}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <span className="relative z-10 text-white">
    사냥 합류하기 →
  </span>
</button>
```

### 11.7.4 에셋 사용 주의

- SVG 프레임은 `aria-hidden="true"`로 처리한다.
- 실제 input과 button에는 접근성 label을 제공한다.
- 프레임 SVG는 텍스트를 포함하지 않는다.
- 버튼 문구와 입력 텍스트는 반드시 코드 텍스트로 처리한다.
- SVG는 가능하면 `preserveAspectRatio="none"` 또는 CSS object-fit 기준으로 화면 폭에 맞춘다.

---

## 12. 화면 상태

### 12.1 상태 목록

```ts
type NicknameTermsStatus =
  | 'idle'
  | 'validating'
  | 'saving'
  | 'success'
  | 'error';
```

### 12.2 상태별 UI

| 상태 | UI 처리 |
|---|---|
| `idle` | 입력 가능 |
| `validating` | 유효성 확인 중 |
| `saving` | CTA 로딩, 입력/체크 비활성화 |
| `success` | 메인 홈으로 이동 |
| `error` | 오류 메시지 표시 후 입력 가능 상태 복구 |

### 12.3 CTA 상태

| 조건 | CTA 상태 |
|---|---|
| 닉네임 미입력 | Disabled |
| 닉네임 형식 오류 | Disabled 또는 클릭 시 오류 |
| 필수 약관 미동의 | Disabled |
| 저장 중 | Loading |
| 모든 조건 충족 | Enabled |

---

## 13. 데이터 저장 정책

### 13.1 저장 대상 테이블

이 화면에서 저장 또는 업데이트하는 주요 데이터는 아래와 같다.

```txt
profiles
user_terms_agreements
```

MVP에서 약관 동의 이력을 별도 테이블로 분리하지 않는다면 `profiles`에 동의 시각 필드를 저장할 수 있다.

---

### 13.2 profiles 저장 필드

```txt
auth_user_id
nickname
provider
status
terms_agreed_at
privacy_agreed_at
marketing_agreed_at
created_at
updated_at
```

권장 기본값:

```txt
status = active
provider = Supabase Auth provider
```

### 13.3 user_terms_agreements 테이블 사용 시

약관 버전 관리가 필요한 경우 아래 테이블을 사용한다.

```txt
user_terms_agreements

- id
- user_id
- terms_type
- terms_version
- agreed
- agreed_at
- created_at
```

권장 terms_type:

```txt
terms_of_service
privacy_policy
marketing
```

### 13.4 저장 방식

```txt
1. 현재 Supabase Auth user 확인
2. nickname 유효성 검증
3. 필수 약관 동의 여부 확인
4. profiles upsert
5. 약관 동의 이력 저장
6. 저장 성공 시 auth store profile 갱신
7. 메인 홈 이동
```

---

## 14. 유효성 검증

### 14.1 닉네임 검증

권장 Zod Schema 기준:

```ts
const nicknameSchema = z
  .string()
  .trim()
  .min(2, '닉네임은 2자 이상 입력해주세요.')
  .max(12, '닉네임은 12자 이하로 입력해주세요.')
  .regex(/^[가-힣a-zA-Z0-9_-]+$/, '사용할 수 없는 문자가 포함되어 있어요.');
```

### 14.2 약관 검증

```ts
const termsSchema = z.object({
  termsOfService: z.literal(true),
  privacyPolicy: z.literal(true),
  marketing: z.boolean().optional(),
});
```

### 14.3 저장 전 최종 검증

```txt
nickname valid
termsOfService = true
privacyPolicy = true
```

---

## 15. 예외 처리

### 15.1 인증 세션 없음

| 상황 | 처리 |
|---|---|
| Auth session 없음 | 로그인 화면으로 이동 |
| 메시지 | 다시 로그인해주세요. |

### 15.2 닉네임 저장 실패

| 상황 | 처리 |
|---|---|
| 네트워크 오류 | 오류 토스트 표시 |
| Supabase 오류 | 오류 토스트 표시 |
| 중복 닉네임 | 입력 필드 오류 표시 |

권장 문구:

```txt
닉네임 저장에 실패했어요. 잠시 후 다시 시도해주세요.
```

### 15.3 약관 저장 실패

| 상황 | 처리 |
|---|---|
| 약관 저장 실패 | 저장 전체 실패 처리 |
| 화면 | 현재 화면 유지 |
| 재시도 | CTA 재클릭 가능 |

권장 문구:

```txt
약관 동의 저장에 실패했어요. 다시 시도해주세요.
```

### 15.4 필수 약관 미동의

| 상황 | 처리 |
|---|---|
| 이용약관 미동의 | CTA 비활성 또는 오류 표시 |
| 개인정보 수집 미동의 | CTA 비활성 또는 오류 표시 |

권장 문구:

```txt
필수 약관에 동의해야 시작할 수 있어요.
```

### 15.5 중복 클릭

| 상황 | 처리 |
|---|---|
| 저장 중 CTA 재클릭 | 무시 |
| 저장 중 체크박스 클릭 | 비활성화 |
| 저장 중 닉네임 수정 | 비활성화 |

---

## 16. 약관 상세 보기 정책

### 16.1 상세 보기 방식

약관 상세는 아래 방식 중 하나로 구현할 수 있다.

| 방식 | 설명 |
|---|---|
| Bottom Sheet | 모바일 앱 느낌에 적합 |
| Modal | 간단한 구현에 적합 |
| 별도 WebView 페이지 | 긴 약관 문서에 적합 |

MVP 권장:

```txt
약관명 또는 화살표 클릭
→ 약관 상세 Bottom Sheet 열기
→ 확인 버튼 클릭 시 닫기
```

### 16.2 약관 상세에서 체크 처리

권장 정책:

```txt
상세 보기에서 확인 버튼을 눌러도 자동 동의 처리하지 않는다.
동의 여부는 체크박스에서 명시적으로 선택한다.
```

---

## 17. 보안 및 개인정보 정책

- 닉네임 외 추가 개인정보를 이 화면에서 입력받지 않는다.
- 휴대폰 번호를 입력받지 않는다.
- 위치 정보 권한을 요청하지 않는다.
- 쿠폰 코드 또는 기프티쇼비즈 발급 정보를 조회하지 않는다.
- 약관 동의 시각은 서버 기준 시간으로 저장한다.
- 사용자의 동의 이력은 추후 분쟁 대응을 위해 저장 가능해야 한다.

---

## 18. 기프티쇼비즈 정책과의 관계

이 화면은 기프티쇼비즈 API와 직접 연결되지 않는다.

캐치캐쉬의 보상 구조는 아래 정책을 따른다.

```txt
보물 획득 성공
→ 유저 보관함에 보상 수령권 생성
→ 유저가 보관함에서 쿠폰 받기 실행
→ 기프티쇼비즈 API 호출
→ 쿠폰 코드 표시
```

따라서 이 화면에서는 아래 작업을 하지 않는다.

- 기프티쇼비즈 상품 조회
- 기프티쇼비즈 쿠폰 발급
- 쿠폰 코드 표시
- 쿠폰 보관함 생성
- 보상 지급 처리

---

## 19. 접근성

### 19.1 입력 필드

- 닉네임 입력 필드는 명확한 label을 가진다.
- Placeholder만으로 의미를 전달하지 않는다.
- 오류 메시지는 입력 필드 아래에 표시한다.

### 19.2 체크박스

- 각 체크박스는 텍스트 라벨과 연결한다.
- 터치 영역은 최소 44px 이상 확보한다.
- 체크 상태는 시각적으로 명확해야 한다.

### 19.3 CTA 버튼

- 비활성 상태는 색상뿐 아니라 클릭 불가 상태로 처리한다.
- 로딩 상태에서는 스피너 또는 텍스트 변경으로 처리 중임을 표시한다.

---

## 20. 구현 컴포넌트 제안

### 20.1 화면 컴포넌트

```txt
NicknameTermsPage
```

### 20.2 하위 컴포넌트

```txt
OnboardingHeader
RoughBackButton
NicknameInput
RoughInputFrame
TermsAgreementList
TermsAgreementRow
TermsDetailBottomSheet
RoughCTAButton
QuitOnboardingButton
QuitConfirmModal
```

### 20.3 훅

```txt
useNicknameTermsForm
useTermsAgreement
useCompleteOnboarding
useProfileUpsert
```

### 20.4 유틸

```txt
validateNickname
checkRequiredTerms
mapOnboardingErrorMessage
```

---

## 21. 권장 파일 구조

```txt
app/
  nickname/
    page.tsx

features/
  onboarding/
    components/
      OnboardingHeader.tsx
      NicknameInput.tsx
      TermsAgreementList.tsx
      TermsAgreementRow.tsx
      TermsDetailBottomSheet.tsx
      QuitConfirmModal.tsx
    hooks/
      useNicknameTermsForm.ts
      useCompleteOnboarding.ts
    services/
      onboarding.service.ts
    schemas/
      nicknameTerms.schema.ts
    types/
      onboarding.types.ts

stores/
  auth.store.ts

constants/
  routes.ts
  terms.ts
  nicknameTermsAssets.ts
  nicknameTermsCopy.ts

public/
  assets/
    icons/
      navigation/
        icon_nav_back_circle_rough_default_32.svg
    ui/
      frames/
        input/
          ui_frame_input_nickname_rough_default.svg
        button/
          ui_frame_button_hunt_join_rough_default.svg

lib/
  supabase/
    client.ts
```

---

## 22. TypeScript 타입 제안

### 22.1 화면 상태

```ts
export type NicknameTermsStatus =
  | 'idle'
  | 'validating'
  | 'saving'
  | 'success'
  | 'error';
```

### 22.2 약관 타입

```ts
export type TermsType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'marketing';
```

### 22.3 폼 값 타입

```ts
export type NicknameTermsFormValues = {
  nickname: string;
  termsOfService: boolean;
  privacyPolicy: boolean;
  marketing: boolean;
};
```

### 22.4 저장 요청 타입

```ts
export type CompleteOnboardingRequest = {
  authUserId: string;
  nickname: string;
  termsOfServiceAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
};
```

---

## 23. 완료 기준

### 23.1 UI 완료 기준

- [ ] `/nickname` route에서 화면이 렌더링된다.
- [ ] 상단 뒤로가기 버튼이 표시된다.
- [ ] `icon_nav_back_circle_rough_default_32.svg` 뒤로가기 아이콘 에셋이 적용된다.
- [ ] 페이지 타이틀 `널 뭐라 부르냐?`가 표시된다.
- [ ] 닉네임 입력 필드가 표시된다.
- [ ] `ui_frame_input_nickname_rough_default.svg` 프레임 에셋이 적용된다.
- [ ] 닉네임 헬퍼 텍스트가 표시된다.
- [ ] 이용약관 동의 항목이 표시된다.
- [ ] 개인정보 수집 동의 항목이 표시된다.
- [ ] 마케팅 수신 동의 항목이 표시된다.
- [ ] 각 약관 항목에 체크박스가 표시된다.
- [ ] 각 약관 항목에 상세보기 화살표가 표시된다.
- [ ] 메인 CTA `사냥 합류하기`가 표시된다.
- [ ] `ui_frame_button_hunt_join_rough_default.svg` 프레임 에셋이 적용된다.
- [ ] 보조 액션 `그만두기`가 표시된다.
- [ ] 하단 네비게이션이 표시되지 않는다.
- [ ] 전체 화면이 흑백 손그림 디자인 기준을 따른다.

### 23.2 기능 완료 기준

- [ ] 닉네임을 입력할 수 있다.
- [ ] 닉네임 유효성 검증이 동작한다.
- [ ] 필수 약관 동의 여부를 체크할 수 있다.
- [ ] 선택 약관 동의 여부를 체크할 수 있다.
- [ ] 약관 상세를 열 수 있다.
- [ ] 필수 조건 미충족 시 CTA가 비활성화된다.
- [ ] 필수 조건 충족 시 CTA가 활성화된다.
- [ ] CTA 클릭 시 profiles 데이터가 저장된다.
- [ ] 약관 동의 정보가 저장된다.
- [ ] 저장 성공 시 메인 홈으로 이동한다.
- [ ] 저장 실패 시 현재 화면에 머무르며 오류를 표시한다.
- [ ] 그만두기 클릭 시 온보딩 중단 플로우가 실행된다.

### 23.3 기술 완료 기준

- [ ] Next.js App Router 기준으로 구현되어 있다.
- [ ] TypeScript 타입이 정의되어 있다.
- [ ] React Hook Form 또는 동등한 폼 상태 관리가 적용되어 있다.
- [ ] Zod 또는 동등한 유효성 검증이 적용되어 있다.
- [ ] Tailwind CSS 디자인 토큰을 사용한다.
- [ ] 뒤로가기 버튼은 SVG 아이콘 에셋 + 실제 HTML button 조합으로 구현한다.
- [ ] 입력 박스와 CTA 버튼은 SVG 프레임 에셋 + 실제 HTML input/button 조합으로 구현한다.
- [ ] 입력 텍스트와 버튼 텍스트는 이미지에 포함하지 않는다.
- [ ] Supabase Auth session을 확인한다.
- [ ] Supabase profiles 저장 로직이 구현되어 있다.
- [ ] 저장 후 Auth Store 또는 Context가 갱신된다.
- [ ] 민감 정보를 클라이언트에 저장하지 않는다.

### 23.4 제외 기능 확인

- [ ] 이메일 회원가입 필드가 없다.
- [ ] 비밀번호 입력 필드가 없다.
- [ ] 휴대폰 번호 입력 필드가 없다.
- [ ] GPS 권한 요청이 없다.
- [ ] 카메라 권한 요청이 없다.
- [ ] 기프티쇼비즈 API 호출이 없다.
- [ ] 쿠폰 발급 로직이 없다.
- [ ] 보관함 데이터 조회가 없다.

---

## 24. 제외 범위

이 화면에서는 아래 기능을 구현하지 않는다.

- 이메일 회원가입
- 비밀번호 설정
- 휴대폰 인증
- 본인인증
- 프로필 이미지 등록
- 화면 전체 이미지 사용
- 입력 텍스트가 포함된 이미지 사용
- 버튼 텍스트가 포함된 이미지 사용
- 위치 권한 요청
- 카메라 권한 요청
- 보물상자 조회
- AR 화면 진입
- 보관함 조회
- 기프티콘 발급
- 기프티쇼비즈 API 호출
- 관리자 기능
- 관리자 권한 분기

---

## 25. 개발자 주의사항

- 이 화면은 소셜 로그인 후 최초 1회 프로필 완성을 담당한다.
- 회원가입이라는 표현보다 온보딩 완료 화면으로 이해한다.
- 닉네임과 필수 약관 동의가 완료되기 전에는 메인 홈에 진입할 수 없다.
- 마케팅 수신 동의는 선택 항목이며 CTA 활성화 조건에 포함하지 않는다.
- 약관 동의 시각은 저장해야 한다.
- 약관 버전 관리가 필요하면 별도 테이블을 사용한다.
- 기프티쇼비즈 API는 이 화면에서 절대 호출하지 않는다.
- 쿠폰 발급은 보관함에서 사용자가 쿠폰 받기를 실행하는 시점에 처리한다.
- GPS와 카메라 권한은 이 화면에서 요청하지 않는다.
- 온보딩 중단 시 로그인 상태를 유지할지 로그아웃할지 정책을 명확히 선택해야 한다.
- MVP에서는 그만두기 클릭 시 로그아웃 후 로그인 화면으로 이동하는 정책을 권장한다.
- 뒤로가기 버튼은 `icon_nav_back_circle_rough_default_32.svg` 에셋을 사용한다.
- 닉네임 입력 박스와 CTA 버튼은 벡터화한 rough frame SVG를 사용한다.
- 단, 실제 뒤로가기/입력/클릭은 HTML button/input/button으로 구현한다.
- SVG 프레임에는 텍스트를 포함하지 않는다.
- 스크린샷 crop PNG가 아니라 Figma에서 추출한 벡터 SVG를 사용한다.
- `ui_frame_input_nickname_rough_default.svg`와 `ui_frame_button_hunt_join_rough_default.svg`는 공통 에셋명 규칙에 따라 관리한다.
