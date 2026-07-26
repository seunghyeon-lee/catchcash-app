# 캐치캐쉬(CatchCash) 사용자 앱
# 프론트엔드 디자인 가이드

> 문서 버전: `v1.0`  
> 적용 대상: 캐치캐쉬 사용자 앱 프론트엔드 전체  
> 플랫폼: iOS / Android Capacitor WebView  
> 구현 기준: Next.js App Router + React + TypeScript + Tailwind CSS  
> 연계 문서: `CatchCash_Frontend_PRD_Final_v1.0.md`

---

# 0. 문서 목적

이 문서는 캐치캐쉬 사용자 앱의 디자인을 프론트엔드에서 일관되게 구현하기 위한 기준이다.

다음 항목을 통합 정의한다.

```txt
디자인 콘셉트
컬러와 타이포그래피
간격과 레이아웃
SVG rough frame 사용 방식
버튼/카드/입력/필터/모달 규칙
지도 및 AR 오버레이 규칙
상태별 UI
접근성
Tailwind/CSS 구현 기준
에셋 폴더와 네이밍 규칙
화면 검수 체크리스트
```

---

# 1. 문서 우선순위

디자인 구현 내용이 서로 충돌할 경우 아래 순서로 판단한다.

1. 각 화면의 최신 `design_based`, `final_assets`, `min_assets` MD
2. 본 프론트엔드 디자인 가이드
3. `CatchCash_Frontend_PRD_Final_v1.0.md`
4. `00_CatchCash_Common_Design_Prompt_Guide`
5. 초기 화면 명세 및 폐기된 디자인 시안 시안

---

# 2. 핵심 디자인 철학

## 2.1 핵심 문장

```txt
구조는 정갈하게, 선은 거칠게.
```

화면 구조와 정보 위계는 실제 서비스 앱처럼 정확하고 정돈되어야 한다.  
카드와 버튼의 외곽선만 손으로 그린 것처럼 불규칙하게 표현한다.

## 2.2 디자인 키워드

```txt
black and white
hand-drawn wireframe
rough outline
paper-like background
slightly crooked linework
minimal
playful but readable
sarcastic brand tone
```

## 2.3 지켜야 할 균형

| 유지할 것 | 피할 것 |
|---|---|
| 명확한 정보 위계 | 실제 스케치처럼 지나치게 지저분한 UI |
| 충분한 여백 | 요소를 촘촘하게 배치하는 것 |
| 제한된 색상 | 컬러풀한 게임 UI |
| 코드 텍스트 | 텍스트가 들어간 이미지 에셋 |
| 실제 버튼/입력 요소 | 이미지 전체를 클릭 영역으로 사용하는 것 |
| 일관된 rough frame | 화면마다 다른 선 두께와 스타일 |
| 장난스러운 말투 | 사용자를 비난하거나 모욕하는 표현 |

---

# 3. 기본 화면 환경

## 3.1 기준 뷰포트

디자인 기준 너비는 모바일 `390px`로 한다.

```txt
Minimum supported width: 320px
Primary design width: 390px
Large mobile width: 430px
Desktop preview max width: 480px
```

Capacitor 앱에서는 전체 화면을 사용하며, 웹 미리보기에서는 중앙 모바일 셸로 제한할 수 있다.

```tsx
<div className="mx-auto min-h-dvh w-full max-w-[480px] bg-app-bg">
  {children}
</div>
```

## 3.2 Safe Area

iOS 노치와 하단 홈 인디케이터를 반드시 고려한다.

```css
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

권장 레이아웃:

```css
padding-top: max(0px, env(safe-area-inset-top));
padding-bottom: max(0px, env(safe-area-inset-bottom));
```

## 3.3 높이 단위

`100vh`보다 `100dvh`를 우선한다.

```css
min-height: 100dvh;
```

카메라 및 지도 화면은 다음처럼 처리한다.

```css
position: fixed;
inset: 0;
width: 100%;
height: 100dvh;
```

---

# 4. 디자인 토큰

## 4.1 컬러 토큰

캐치캐쉬는 흑백을 기본으로 하고 상태 표현에만 제한적으로 색상을 사용한다.

| 토큰 | 값 | 용도 |
|---|---:|---|
| `--color-bg` | `#F7F5EF` | 앱 전체 종이색 배경 |
| `--color-surface` | `#FFFFFF` | 카드, 입력, 모달 |
| `--color-black` | `#000000` | 주요 텍스트, 라인, CTA |
| `--color-text-primary` | `#111111` | 기본 본문 |
| `--color-text-secondary` | `#777777` | 설명, 보조 정보 |
| `--color-line-muted` | `#D9D6CE` | 흐린 구분선 |
| `--color-disabled` | `#C9C9C9` | 비활성 상태 |
| `--color-danger` | `#FF4D4F` | 로그아웃, 발급 실패, 오류 |
| `--color-available` | `#FFD83D` | 사용 가능 상태 배지 |
| `--color-overlay` | `rgba(0,0,0,.55)` | 모달 딤드 |
| `--color-camera-overlay` | `rgba(0,0,0,.28)` | AR 가독성 보조 |

### 사용 제한

- `danger`는 오류, 발급 실패, 로그아웃에만 사용한다.
- `available`은 보관함의 사용 가능 배지 등 작은 상태 표현에만 사용한다.
- 주요 CTA는 색상 CTA가 아니라 검정 배경을 사용한다.
- 배경 전체에 status color를 사용하지 않는다.

## 4.2 CSS 변수 예시

```css
:root {
  --color-bg: #f7f5ef;
  --color-surface: #ffffff;
  --color-black: #000000;
  --color-text-primary: #111111;
  --color-text-secondary: #777777;
  --color-line-muted: #d9d6ce;
  --color-disabled: #c9c9c9;
  --color-danger: #ff4d4f;
  --color-available: #ffd83d;
  --color-overlay: rgba(0, 0, 0, 0.55);
}
```

## 4.3 Tailwind Theme 예시

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F7F5EF',
          surface: '#FFFFFF',
          black: '#000000',
          text: '#111111',
          muted: '#777777',
          line: '#D9D6CE',
          disabled: '#C9C9C9',
          danger: '#FF4D4F',
          available: '#FFD83D',
        },
      },
    },
  },
};
```

---

# 5. 타이포그래피

## 5.1 폰트 스택

한국어 가독성을 우선한다.

```css
font-family:
  "Pretendard Variable",
  Pretendard,
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

쿠폰 번호나 보상 ID는 모노스페이스 계열을 사용할 수 있다.

```css
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

## 5.2 타입 스케일

| 토큰 | 크기 / 줄높이 | 굵기 | 사용 위치 |
|---|---|---:|---|
| `display-lg` | 32 / 40px | 700 | 결과 화면 큰 제목 |
| `heading-lg` | 28 / 36px | 700 | 주요 화면 제목 |
| `heading-md` | 22 / 30px | 700 | 카드 핵심 제목 |
| `heading-sm` | 18 / 26px | 700 | 섹션 제목 |
| `body-lg` | 16 / 24px | 500 | 주요 본문 |
| `body-md` | 14 / 22px | 500 | 일반 본문 |
| `body-sm` | 12 / 18px | 500 | 보조 설명 |
| `label-md` | 12 / 16px | 600 | 필드 라벨, 상태 배지 |
| `label-sm` | 10 / 14px | 600 | 영문 라벨, 메타 정보 |
| `number-lg` | 28 / 32px | 700 | 통계 숫자 |
| `coupon-code` | 16 / 24px | 600 | 쿠폰 번호 |

## 5.3 Tailwind Utility 예시

```css
.text-display-lg { @apply text-[32px] leading-[40px] font-bold; }
.text-heading-lg { @apply text-[28px] leading-[36px] font-bold; }
.text-heading-md { @apply text-[22px] leading-[30px] font-bold; }
.text-heading-sm { @apply text-[18px] leading-[26px] font-bold; }
.text-body-lg { @apply text-[16px] leading-[24px] font-medium; }
.text-body-md { @apply text-[14px] leading-[22px] font-medium; }
.text-body-sm { @apply text-[12px] leading-[18px] font-medium; }
.text-label-md { @apply text-[12px] leading-[16px] font-semibold; }
.text-label-sm { @apply text-[10px] leading-[14px] font-semibold; }
```

## 5.4 텍스트 원칙

- 화면 제목은 한 줄을 우선한다.
- 설명은 최대 2줄을 기본으로 한다.
- 버튼 문구는 최대 12자 권장.
- 제품명과 브랜드명은 잘릴 경우 `line-clamp`.
- 쿠폰 번호는 임의 줄바꿈하지 않는다.
- 영문 섹션 라벨은 소문자 또는 대문자 중 화면 내 한 방식만 유지한다.
- `HUNT LOG`, `my record`처럼 브랜드에 포함된 영문은 디자인 시안을 따른다.

---

# 6. 간격 시스템

## 6.1 기본 단위

`4px` 단위를 사용한다.

| 토큰 | 값 |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

## 6.2 화면 기본 여백

| 영역 | 권장값 |
|---|---:|
| 화면 좌우 padding | 20px |
| 좁은 화면 좌우 padding | 16px |
| 헤더 좌우 padding | 16~20px |
| 섹션 간격 | 24px |
| 카드 간격 | 12~16px |
| 카드 내부 padding | 16~20px |
| 버튼 간격 | 8~12px |
| 라벨과 입력 간격 | 8px |

## 6.3 그리드

통계 카드 3개:

```css
display: grid;
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 8px;
```

요약 카드 2개:

```css
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 8px;
```

---

# 7. 모서리, 선, 그림자

## 7.1 CSS 요소

SVG 프레임이 아닌 CSS 요소의 기본값이다.

| 요소 | border radius | border |
|---|---:|---:|
| 작은 칩/배지 | 6~10px | 1.5~2px |
| 입력 필드 | 6~10px | 1.5~2px |
| 일반 카드 | 10~16px | 1.5~2px |
| 큰 카드 | 16~24px | 2px |
| 모달 | 24~32px | 프레임 에셋 우선 |

## 7.2 그림자

기본적으로 soft shadow는 사용하지 않는다.

허용:

```css
box-shadow: 2px 3px 0 #000;
```

단, SVG rough frame이 자체 외곽선을 갖는 경우 CSS shadow를 중복 적용하지 않는다.

## 7.3 점선

사용 완료, 안내, HUNT LOG 등에 사용한다.

```css
border: 1.5px dashed #000;
```

점선도 rough frame 에셋이 지정된 화면에서는 해당 에셋을 우선한다.

---

# 8. SVG Rough Frame 구현 규칙

## 8.1 기본 구조

SVG frame은 장식 레이어로만 사용한다.  
콘텐츠와 인터랙션은 HTML로 구현한다.

```tsx
type RoughFrameProps = {
  src: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function RoughFrame({
  src,
  children,
  className,
  contentClassName,
}: RoughFrameProps) {
  return (
    <div className={`relative isolate ${className ?? ''}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      />
      <div className={`relative z-10 ${contentClassName ?? ''}`}>
        {children}
      </div>
    </div>
  );
}
```

## 8.2 반드시 지킬 사항

- SVG frame에 버튼 문구를 포함하지 않는다.
- frame 이미지에 `pointer-events: none`.
- 장식 에셋은 `alt=""`, `aria-hidden="true"`.
- 클릭 영역은 wrapper가 아닌 실제 button/link에 부여한다.
- SVG가 원본 비율과 지나치게 다르게 늘어나지 않게 한다.
- 같은 프레임을 임의 높이에 무한히 늘리지 않는다.
- 긴 콘텐츠용 `lg` variant가 존재하면 해당 에셋을 사용한다.
- simple border로 충분한 요소는 SVG frame을 만들지 않는다.

## 8.3 늘림 기준

| 변화 | 처리 |
|---|---|
| 원본 대비 ±10% | 일반 stretch 허용 |
| ±10~20% | 시각 검수 후 허용 |
| 20% 이상 | 다른 variant 또는 CSS 구현 |
| 텍스트 길이 변화 | content padding 조정 우선 |
| 높이 동적 변화 | 전용 `lg` frame 사용 또는 CSS |

## 8.4 배경 이미지 방식

버튼 같은 단순 fixed-height frame은 background로 사용할 수 있다.

```tsx
<button
  className="relative h-12 w-full bg-[url('/assets/ui/frames/...svg')] bg-[length:100%_100%] bg-no-repeat"
>
  <span className="relative z-10">저장한다</span>
</button>
```

---

# 9. 에셋과 CSS 선택 기준

## 9.1 에셋으로 구현

다음 조건 중 하나에 해당하면 에셋을 사용한다.

- 손그림 형태가 핵심인 프레임
- 아이콘 자체가 브랜드 스타일을 갖는 경우
- 지도/빈 상태/캐릭터 일러스트
- 관리자가 등록한 보물 마커 이미지
- 3D 모델 또는 2D AR fallback
- 동일한 모양을 여러 화면에서 재사용하는 공통 frame

## 9.2 CSS로 구현

- 일반 구분선
- dim overlay
- 입력 error border
- disabled opacity
- 단순 사각형 및 grid
- 기본 list row
- 일반적인 색상 선택 박스
- 단순 원형/정사각형 배경
- 로딩 skeleton
- 하단 탭바가 별도 rough frame을 요구하지 않는 화면

## 9.3 코드로 구현

- 모든 텍스트
- 사용자 닉네임
- 상품명/브랜드명
- 랭킹 숫자
- 날짜/시간
- 상태명
- 쿠폰 번호
- 바코드 데이터
- 거리와 진행률
- 에러 메시지
- 버튼 로딩 문구

---

# 10. 아이콘 시스템

## 10.1 기본 크기

| 용도 | 크기 |
|---|---:|
| 작은 보조 아이콘 | 16px |
| 리스트/상태 아이콘 | 20px |
| 헤더/탭/버튼 아이콘 | 24px |
| 중요 상태 아이콘 | 32px |
| 모달 메인 아이콘 | 48px |

## 10.2 아이콘 스타일

```txt
stroke-width: 1.5~2.5
rounded cap
rounded join
black line
simple fill
rough hand-drawn style
```

## 10.3 색상

| 상태 | 색상 |
|---|---|
| 기본 | black |
| 비활성 | disabled gray |
| danger/error | danger red |
| active tab | white icon on black background |
| 사용 가능 | black icon + yellow badge 가능 |

## 10.4 아이콘 버튼

```tsx
<button
  type="button"
  aria-label="닫기"
  className="grid size-11 place-items-center"
>
  <img src={ASSETS.closeIcon} alt="" aria-hidden="true" className="size-6" />
</button>
```

아이콘 자체가 24px이어도 버튼 터치 영역은 최소 44px이어야 한다.

---

# 11. 헤더

## 11.1 기본 높이

```txt
Header content height: 56px
Safe area: 별도 추가
```

## 11.2 상세형 헤더

```txt
좌측 뒤로가기
중앙 또는 좌측 화면 제목
우측 필요한 액션
```

## 11.3 GNB형 헤더

```txt
좌측 로고/화면 제목
우측 알림, 도움말, 설정
```

## 11.4 구현 예시

```tsx
<header className="safe-top sticky top-0 z-40 bg-app-bg">
  <div className="flex h-14 items-center border-b-2 border-black px-4">
    <button className="grid size-11 place-items-center" aria-label="뒤로가기">
      ...
    </button>
    <h1 className="min-w-0 flex-1 truncate text-center text-[16px] font-semibold">
      나의 보관함
    </h1>
    <div className="flex items-center">
      ...
    </div>
  </div>
</header>
```

## 11.5 규칙

- 제목 영역이 아이콘 때문에 시각적으로 치우치지 않게 한다.
- 오른쪽 액션이 없을 경우 동일 폭 placeholder 또는 좌측 정렬 제목 사용.
- 헤더 라인은 CSS로 처리한다.
- 헤더 rough 프레임은 화면 명세에 따로 정의된 경우만 사용한다.

---

# 12. 하단 탭바

## 12.1 기본 구성

```txt
Map
Hunt
Ranking
My Info
```

## 12.2 크기

```txt
Content height: 64~72px
Safe area bottom: 추가
Icon: 20~24px
Label: 10~11px
```

## 12.3 활성 상태

- 검정 배경 rounded block
- 흰색 아이콘과 텍스트
- 비활성은 투명 배경, 검정 아이콘
- 탭 전체 터치 영역 최소 56×48px

## 12.4 구현

```tsx
<nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t-2 border-black bg-app-bg">
  <div className="grid h-16 grid-cols-4">
    {items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        className="flex flex-col items-center justify-center gap-1"
      >
        <span className={item.active ? 'rounded-md bg-black px-3 py-1 text-white' : ''}>
          ...
        </span>
      </Link>
    ))}
  </div>
</nav>
```

## 12.5 콘텐츠 하단 여백

탭바가 있는 화면은 콘텐츠에 최소 다음 padding을 추가한다.

```css
padding-bottom:
  calc(88px + env(safe-area-inset-bottom));
```

---

# 13. 버튼

## 13.1 공통 높이

| 버튼 | 높이 |
|---|---:|
| 주요 CTA | 48~56px |
| 보조 CTA | 44~52px |
| 작은 버튼 | 32~40px |
| 아이콘 버튼 터치 영역 | 44px 이상 |

## 13.2 Primary

```txt
검정 프레임 또는 검정 CSS 배경
흰색 텍스트
한 화면 1개 우선
```

## 13.3 Secondary

```txt
흰색 배경
검정 outline
검정 텍스트
```

## 13.4 Danger

로그아웃 버튼처럼 디자인 시안에서 흰색 + 빨간 outline을 사용하는 경우 해당 frame을 사용한다.

## 13.5 Disabled

별도 frame이 지정되지 않으면 CSS로 처리한다.

```css
opacity: 0.45;
pointer-events: none;
```

실제 button에 `disabled` 속성도 설정한다.

## 13.6 Loading

```tsx
<button disabled aria-busy="true">
  저장 중...
</button>
```

텍스트 길이 변화로 레이아웃이 움직이지 않게 최소 너비를 유지한다.

## 13.7 버튼 컴포넌트

```ts
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  frameSrc?: string;
  isLoading?: boolean;
}
```

---

# 14. 카드

## 14.1 일반 카드

```txt
surface background
black outline
16~20px padding
12~16px 내부 gap
```

## 14.2 검정 강조 카드

- `my record`
- 보관함 진입 버튼
- 주요 status/command
- 중요한 CTA형 카드

텍스트 대비는 최소 4.5:1을 유지한다.

## 14.3 반복 카드

리스트 card는 동일 상태에서 같은 padding과 정보 순서를 유지한다.

```txt
이미지/아이콘
→ 상태 배지
→ 제목
→ 메타 정보
→ 액션 아이콘
```

## 14.4 카드 클릭

카드 전체가 클릭 가능한 경우:

```tsx
<button className="block w-full text-left">
  <RoughFrame ...>
    ...
  </RoughFrame>
</button>
```

카드 안에 별도 액션이 있으면 중첩 button을 피하고 구조를 분리한다.

---

# 15. 필터 칩과 상태 배지

## 15.1 필터 칩

| 상태 | 스타일 |
|---|---|
| active | black fill + white text |
| inactive | white/transparent + black outline |
| disabled | muted border + gray text |

크기:

```txt
height: 32~36px
horizontal padding: 12~16px
gap: 8px
```

필터가 화면 너비를 넘으면 가로 스크롤을 허용한다.

```css
overflow-x: auto;
scrollbar-width: none;
```

## 15.2 상태 배지

- 높이 20~26px
- 텍스트 10~12px
- 카드 제목보다 먼저 읽히지 않게 작게 배치
- 상태는 텍스트로 명확히 제공

### 보관함 상태

| 상태 | 표현 |
|---|---|
| 사용 가능 | yellow fill 또는 available frame |
| 발급 실패 | danger red |
| 사용 완료 | gray/outline |
| 만료 | gray dashed |
| 발급 중 | neutral + loading |

---

# 16. 입력 필드

## 16.1 공통

```txt
label
input/textarea
helper or error
```

placeholder만으로 의미를 전달하지 않는다.

## 16.2 크기

| 요소 | 권장 높이 |
|---|---:|
| input | 44~52px |
| select | 44~52px |
| textarea | 최소 120px |
| helper text | 18px line-height 이상 |

## 16.3 상태

| 상태 | 표현 |
|---|---|
| default | black/gray outline |
| focus | black 2px outline |
| error | danger outline + error text |
| disabled | muted background + opacity |
| readonly | muted background + cursor default |

## 16.4 실제 폼 요소

frame을 사용하더라도 실제 `<input>`, `<textarea>`, `<select>`를 사용한다.

```tsx
<label>
  <span className="text-label-md">한 줄 요약</span>
  <div className="relative mt-2">
    <img ... />
    <input className="relative z-10 h-12 w-full bg-transparent px-4 outline-none" />
  </div>
</label>
```

## 16.5 자동 완성과 키보드

- 닉네임: `autoComplete="nickname"`
- 문의 제목: `enterKeyHint="next"`
- 문의 내용: `enterKeyHint="send"`는 자동 제출하지 않을 경우 사용하지 않음
- 쿠폰 번호: 읽기 전용
- 키보드가 CTA를 가릴 경우 화면 스크롤 가능

---

# 17. 모달과 팝업

## 17.1 공통 구조

```txt
fixed overlay
→ centered modal
→ close icon
→ content
→ action group
```

## 17.2 Overlay

```css
background: rgba(0, 0, 0, 0.55);
```

AR/카메라 위 모달은 콘텐츠 대비를 위해 더 진하게 할 수 있다.

## 17.3 크기

```txt
width: calc(100% - 40px)
max-width: 400px
max-height: calc(100dvh - 48px)
```

## 17.4 접근성

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby`
- focus trap
- ESC 지원(웹)
- Android back으로 먼저 닫기
- 배경 스크롤 잠금
- 닫힌 후 trigger에 focus 복귀

## 17.5 액션 순서

현재 디자인 시안을 따른다.

- 로그아웃: 위험 버튼 → 닫기
- 쿠폰 상세: 주요 CTA → 닫기
- 확인 팝업: 명확한 primary/secondary

---

# 18. 토스트, 안내, HUNT LOG

## 18.1 Toast

- 화면 상단 또는 하단 safe area 안쪽
- 최대 2줄
- 2~3초 표시
- 중복 toast queue 방지

사용 예:

```txt
복사됐다.
프로필이 바뀌었다.
문의가 접수됐다.
```

## 18.2 상태 메시지

힌트 팝업 검정 영역처럼 버튼이 아닌 경우:

```tsx
<div role="status" aria-live="polite">
  좀 더 가까이 와라.
</div>
```

## 18.3 HUNT LOG

- 점선 frame
- 목록은 코드 데이터
- 마지막 성공/실패 단계만 accent 가능
- 장식 텍스트보다 실제 상태 이해가 우선

---

# 19. 이미지와 아바타

## 19.1 상품 이미지

```txt
object-fit: contain
background: surface
padding: 4~8px
```

URL 이미지 실패 시 fallback 사용.

```tsx
<Image
  src={productImageUrl || fallback}
  alt={productName}
  fill
  className="object-contain"
/>
```

## 19.2 프로필

- 실물 사진 업로드 없음
- 캐릭터/색상 조합
- 아바타 원형 frame 위에 렌더
- 캐릭터 이름과 색상은 코드 데이터로 관리

## 19.3 외부 이미지

Next.js `images.remotePatterns`에 허용 도메인만 추가한다.  
사용자 입력 URL을 직접 렌더링하지 않는다.

---

# 20. 지도 UI

## 20.1 지도 레이어

```txt
Naver Map
→ treasure markers
→ user location
→ controls
→ header/status
→ hint popup
→ bottom navigation
```

## 20.2 지도 스타일

- 저채도/다크 스타일
- 불필요한 POI 최소화
- rough UI는 지도 컨트롤과 팝업에만 적용
- 지도 자체를 rough frame으로 왜곡하지 않는다

## 20.3 마커

- 관리자 등록 `marker_image_url`
- fallback marker만 앱 에셋
- 마커 label은 HTML overlay/CSS
- 마커 터치 영역 최소 44px

## 20.4 거리 UI

- 현재 거리 숫자는 tabular number 권장
- 0~20m 진행률은 CSS width
- 숫자 변화로 레이아웃이 흔들리지 않게 고정 폭

```css
font-variant-numeric: tabular-nums;
```

---

# 21. AR 화면 UI

## 21.1 레이어

```txt
video: z-0
R3F Canvas: z-10
UI Overlay: z-20
```

## 21.2 가독성

카메라 배경에서는 UI 프레임 안에 흰색 surface 또는 반투명 배경을 둔다.

```css
background: rgba(247, 245, 239, 0.92);
```

## 21.3 터치 영역

상자 터치와 닫기 버튼 영역이 충돌하지 않게 한다.

- 상자: 중앙 콘텐츠 영역
- 닫기: 상단 safe area
- 안내 bubble: pointer-events none
- UI 버튼: pointer-events auto

## 21.4 애니메이션

- 상자 흔들림: 250~400ms
- 열림: 400~700ms
- 결과 전환: 애니메이션 완료 또는 서버 응답 후
- reduced motion에서는 shake 최소화

---

# 22. 애니메이션

## 22.1 기본 duration

| 용도 | 시간 |
|---|---:|
| 버튼 눌림 | 80~120ms |
| 필터 선택 | 120~180ms |
| 모달 등장 | 180~240ms |
| 바텀시트 | 220~300ms |
| 카드 상태 변경 | 180~240ms |
| AR 상자 | 400~700ms |

## 22.2 easing

```css
cubic-bezier(0.2, 0.8, 0.2, 1)
```

## 22.3 버튼 눌림

```css
transform: translateY(1px) scale(0.99);
```

SVG frame의 roughness를 망가뜨리는 과한 scale은 피한다.

## 22.4 reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 23. 로딩, 빈 상태, 오류

## 23.1 Skeleton

rough frame 이미지를 skeleton으로 깜빡이지 않는다.  
내부 콘텐츠 영역에 CSS skeleton을 적용한다.

```css
background: linear-gradient(
  90deg,
  #ece9e1 25%,
  #f7f5ef 37%,
  #ece9e1 63%
);
```

## 23.2 빈 상태

```txt
간단한 일러스트
짧은 제목
한 줄 설명
한 개의 CTA
```

## 23.3 오류

- 오류 아이콘 또는 red accent
- 이해 가능한 메시지
- 재시도/문의 행동
- 기술 오류 원문 미노출

---

# 24. 반응형과 작은 화면 대응

## 24.1 320px

- 화면 좌우 padding 16px
- 통계 카드 label을 10~11px로 축소 가능
- 버튼 문구 줄바꿈 금지
- 필터는 가로 스크롤
- 헤더 우측 아이콘 gap 축소
- 주요 카드 padding 최소 12px

## 24.2 430px 이상

- 좌우 padding 최대 24px
- 콘텐츠 폭을 무한히 넓히지 않음
- 카드의 내부 여백만 소폭 증가
- 태블릿에서 모바일 셸 max-width 유지 가능

## 24.3 텍스트 확대

OS 텍스트 확대 시:

- 카드 높이는 고정하지 않는 것을 우선
- 긴 텍스트용 frame variant가 없으면 CSS card로 전환 고려
- 버튼 높이는 min-height로 지정
- 정보가 잘리지 않게 overflow hidden 남용 금지

---

# 25. 접근성

## 25.1 필수

- 텍스트 대비 4.5:1 이상
- 큰 텍스트 3:1 이상
- 터치 영역 44×44px 이상
- 모든 아이콘 버튼 `aria-label`
- 현재 탭 `aria-current="page"`
- 현재 필터 `aria-pressed`
- 입력 error `aria-invalid`, `aria-describedby`
- 모달 focus trap
- 상태 메시지 `aria-live`
- decorative frame `alt=""`

## 25.2 색상 외 상태 표현

상태는 반드시 텍스트 또는 아이콘과 함께 표시한다.

```txt
빨간색만 표시 X
발급 실패 텍스트 + 오류 아이콘 + 빨간색 O
```

## 25.3 바코드

- 쿠폰 번호를 바코드 대체 텍스트로 제공
- 바코드만으로 정보를 전달하지 않음
- 복사 버튼의 완료 상태를 screen reader에 알림

---

# 26. 브랜드 카피 가이드

## 26.1 원칙

- 짧고 직접적
- 장난스럽지만 의미는 명확
- 오류/쿠폰/약관은 정확성 우선
- 버튼은 행동 동사 사용

## 26.2 권장 카피

| 상황 | 카피 |
|---|---|
| 지도 진입 | `지도부터 뒤져봐.` |
| 접근 안내 | `좀 더 가까이 와라.` |
| 성공 | `잘했네. 하나 건졌다.` |
| 꽝 | `아쉽네. 빈 상자다.` |
| 보관함 | `전리품 안 잃어버리게 모아뒀다.` |
| 로그아웃 | `진짜 나가게?` |
| 문의 | `뭐가 문제데?` |
| 재시도 | `다시 해봐.` |

## 26.3 오류 카피

좋은 예:

```txt
네트워크가 끊겼다. 다시 해봐.
결과를 못 불러왔다.
위치가 너무 멀어졌다.
```

피해야 할 예:

```txt
알 수 없는 오류가 발생했습니다. Error 500.
사용자 위치 검증 프로시저 실행 실패.
```

---

# 27. 컴포넌트 구조

## 27.1 공통 컴포넌트

```txt
AppShell
AppHeader
BottomTabBar
IconButton
RoughFrame
RoughButton
FilterChip
StatusBadge
FormField
Modal
Toast
EmptyState
LoadingState
```

## 27.2 기능 컴포넌트

```txt
TreasureMarker
TreasureHintPopup
DistanceGauge
ARInstructionBubble
HuntResultCard
FameTopHunterCard
ProfilePreviewCard
InventoryRewardCard
RewardDetailModal
LogoutConfirmModal
SupportInquiryList
SupportInquiryDetail
SupportInquiryForm
```

## 27.3 Props 설계 원칙

- 에셋 경로를 화면 안에 직접 하드코딩하지 않는다.
- variant를 union type으로 제한한다.
- 상태와 문구를 분리한다.
- server DTO를 UI component에 그대로 전달하지 않고 view model로 변환한다.

예:

```ts
type InventoryCardVariant = 'available' | 'failed' | 'used' | 'expired';

interface InventoryCardViewModel {
  id: string;
  variant: InventoryCardVariant;
  productName: string;
  meta: string;
  imageUrl: string;
  badgeLabel: string;
}
```

---

# 28. Tailwind 및 CSS 작성 규칙

## 28.1 클래스 순서

권장 순서:

```txt
layout
position
size
spacing
typography
background
border
effect
state
```

## 28.2 반복 클래스

`cn()` 유틸과 variant helper를 사용한다.

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 28.3 Variant

`class-variance-authority` 사용 가능.

```ts
const badgeVariants = cva(
  'inline-flex items-center justify-center px-2 text-[10px] font-semibold',
  {
    variants: {
      status: {
        available: 'bg-app-available text-black',
        failed: 'bg-app-danger text-white',
        used: 'border border-black bg-white text-black',
      },
    },
  },
);
```

## 28.4 인라인 스타일

다음 경우만 허용한다.

- 거리 게이지 width
- 사용자 선택 색상
- 지도 좌표/overlay
- AR transform
- safe-area 계산

---

# 29. 에셋 네이밍 규칙

## 29.1 형식

```txt
{type}_{feature}_{element}_{variant}_{state}_{size}.{ext}
```

현재 프로젝트 예시:

```txt
ui_frame_profile_edit_preview_card_rough_default.svg
ui_frame_inventory_reward_card_available_rough_default.svg
icon_action_close_circle_rough_default_24.svg
img_fame_avatar_fallback_rough_default.svg
model_treasure_chest_ar_default.glb
```

## 29.2 Prefix

| Prefix | 용도 |
|---|---|
| `ui_frame_` | rough UI 프레임 |
| `icon_` | 아이콘 |
| `img_` | 이미지 |
| `illust_` | 일러스트 |
| `marker_` | 지도 마커 |
| `sprite_` | 2D fallback |
| `model_` | 3D 모델 |
| `audio_` | 사운드 |

## 29.3 Variant/State

```txt
rough
black
white
red
default
active
inactive
available
failed
used
expired
lg
sm
```

## 29.4 금지

```txt
final.svg
final2.svg
new.svg
frame1.svg
icon_copy_copy.svg
Asset 12.svg
```

---

# 30. 에셋 저장 구조

```txt
public/
  assets/
    icons/
      action/
      gnb/
      nav/
      map/
      ar/
      result/
      fame/
      profile/
      inventory/
      support/
      logout/

    images/
      profile/
      inventory/
      result/
      fame/

    illustrations/
      home/
      guide/
      empty/

    markers/
      treasure/
      user/

    models/
      treasure/

    audio/
      hunt/

    ui/
      frames/
        global/
        auth/
        home/
        notification/
        guide/
        map/
        hint/
        ar/
        result/
        fame/
        profile/
        inventory/
        reward-detail/
        support/
        logout/
```

---

# 31. 에셋 상수

화면 컴포넌트에서 경로 문자열을 직접 작성하지 않는다.

```ts
export const COMMON_ASSETS = {
  closeCircle: '/assets/icons/action/icon_action_close_circle_rough_default_24.svg',
  arrowRight: '/assets/icons/action/icon_action_arrow_right_rough_default_20.svg',
  back: '/assets/icons/nav/icon_nav_back_simple_rough_default_24.svg',
} as const;
```

기능별 상수 파일:

```txt
constants/assets/common.ts
constants/assets/map.ts
constants/assets/hunt.ts
constants/assets/fame.ts
constants/assets/profile.ts
constants/assets/inventory.ts
constants/assets/support.ts
```

---

# 32. 화면별 디자인 핵심

| 화면 | 디자인 핵심 |
|---|---|
| 스플래시 | 로고와 짧은 로딩, 장식 최소 |
| 로그인 | 소셜 버튼과 브랜드 메시지 |
| 닉네임/약관 | 입력과 동의 가독성 |
| 홈 | 스케치 미니맵과 진입 CTA |
| 알림함 | 유형/길이별 카드 프레임 |
| 안내 | 단계별 카드와 주의 박스 |
| 지도 | 실제 지도 위 rough controls |
| 힌트 | 거리와 상태 전달 |
| AR | 카메라 가독성, 상자 터치 집중 |
| 결과 | 성공과 꽝의 명확한 대비 |
| 명예의 전당 | 요약 카드와 랭킹 정보 위계 |
| 내프로필 | 프로필 → 통계 → 메뉴 |
| 보관함 | 상태별 카드 구분 |
| 보상 상세 | 코드/바코드 가독성 |
| 프로필 수정 | 캐릭터·색상·닉네임 |
| 로그아웃 | 작은 확인 모달 |
| 문의하기 | 문의 리스트 → 문의 상세 → 문의 작성 플로우 구분, 입력 폼 가독성 최우선 |

---

# 33. 개발 검수 체크리스트

## 33.1 공통

- [ ] 앱 배경이 `#F7F5EF` 기준이다.
- [ ] 텍스트가 이미지에 포함되지 않았다.
- [ ] frame SVG는 장식 레이어로 사용한다.
- [ ] 실제 버튼과 입력 요소를 사용한다.
- [ ] 주요 터치 영역이 44px 이상이다.
- [ ] safe area를 반영했다.
- [ ] 하단 탭이 콘텐츠를 가리지 않는다.
- [ ] 화면 너비 320px에서 깨지지 않는다.
- [ ] 모달 focus와 scroll lock이 동작한다.
- [ ] loading/error/empty 상태가 존재한다.

## 33.2 SVG

- [ ] 에셋이 과도하게 늘어나지 않았다.
- [ ] `pointer-events: none`이 적용되었다.
- [ ] decorative alt가 비어 있다.
- [ ] SVG의 배경이 의도하지 않게 불투명하지 않다.
- [ ] 동일 목적의 에셋을 중복 생성하지 않았다.

## 33.3 타이포그래피

- [ ] 제목과 본문의 위계가 명확하다.
- [ ] 작은 텍스트가 10px 미만이 아니다.
- [ ] 줄높이가 충분하다.
- [ ] 긴 상품명과 닉네임이 overflow 처리된다.
- [ ] 쿠폰 번호가 가독성 있게 표시된다.

## 33.4 상태

- [ ] active/inactive가 색상 외 방식으로 구분된다.
- [ ] danger 상태에 문구와 아이콘이 함께 있다.
- [ ] disabled button에 실제 `disabled`가 있다.
- [ ] loading 중 중복 클릭이 차단된다.
- [ ] success/error toast가 접근 가능하다.

## 33.5 지도/AR

- [ ] 지도 컨트롤이 44px 이상이다.
- [ ] 마커 터치 영역이 충분하다.
- [ ] 거리 숫자가 흔들리지 않는다.
- [ ] 카메라 위 안내가 읽힌다.
- [ ] 닫기 버튼이 safe area 아래에 있다.
- [ ] AR UI와 3D 터치가 충돌하지 않는다.

---

# 34. 구현 완료 기준

프론트 디자인 구현은 아래 조건을 모두 충족해야 완료로 판단한다.

```txt
모든 최신 화면 MD와 레이아웃 일치
최신 디자인 에셋 이름과 경로 일치
코드 텍스트와 에셋 텍스트 분리
모바일 safe area 대응
상태별 UI 구현
접근성 속성 적용
320~430px 반응형 검수
실제 iOS/Android WebView 검수
```

---

# 35. 최종 요약

```txt
1. 앱 기본 배경은 따뜻한 종이색이다.
2. 주요 외곽선은 검정 rough SVG frame이다.
3. 텍스트와 인터랙션은 반드시 코드로 구현한다.
4. 단순 박스와 상태 변화는 CSS를 우선한다.
5. 검정 CTA를 주요 액션으로 사용한다.
6. 빨간색과 노란색은 상태 강조에만 제한적으로 사용한다.
7. 아이콘은 16/20/24/32/48px 체계로 관리한다.
8. 모바일 터치 영역은 최소 44px다.
9. 모든 모달과 탭은 safe area와 접근성을 고려한다.
10. 화면별 최신 MD가 최종 시각 기준이다.
```


---

# 36. 문의 플로우 업데이트

## 36.1 적용 화면

```txt
10_My_Profile_Screen
15_1_Support_Inquiry_List_Screen
15_2_Support_Inquiry_Detail_Screen
15_3_Support_Inquiry_Write_Screen
04_1_Notification_Inbox_Screen
```

## 36.2 최종 사용자 플로우

```txt
내프로필
→ 문의하기 버튼
→ /support 문의 내역 리스트
→ 문의 카드 클릭
→ /support/[inquiryId] 문의 상세
```

```txt
/support 문의 내역 리스트
→ 하단 문의하기 CTA
→ /support/new 문의 작성
→ 문의 등록
→ /support 문의 내역 리스트로 복귀
```

## 36.3 알림 연계

- 관리자 CMS에서 문의 답변을 등록하면 사용자 알림함에 `문의 답변 도착` 알림을 생성할 수 있다.
- 사용자가 알림을 클릭하면 `/support/[inquiryId]` 문의 상세 화면으로 이동한다.
- 별도의 답변함 화면은 MVP 범위에서 만들지 않는다.

## 36.4 컴포넌트 기준

```txt
SupportInquiryList
SupportInquiryCard
SupportInquiryDetail
SupportInquiryForm
SupportStatusBadge
```

## 36.5 디자인 기준

- 상단 GNB와 하단 탭바는 공통 컴포넌트를 사용한다.
- 문의 리스트/상세/작성 화면의 카드, 배지, 버튼은 화면별 최신 MD의 전용 에셋 정의를 따른다.
- 텍스트는 이미지가 아니라 코드 텍스트로 구현한다.
- 문의 상태는 색상만으로 구분하지 않고 `읽는 중`, `해결됨` 텍스트를 함께 표시한다.
