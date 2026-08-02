# 00. Common Top Navigation - GNB

## 1. 문서 목적

캐치캐쉬 앱 전역에서 사용하는 상단 GNB(Global Navigation Bar)의 공통 디자인, 에셋, 타입, 동작 기준을 정의한다.

상단 GNB는 화면마다 개별로 새로 구현하지 않고, 하나의 공통 `AppHeader` 컴포넌트에서 타입별로 재사용한다.

---

## 2. 공통 원칙

- 상단 GNB는 모바일 WebView 기준 390~480px 폭 안에서 정렬한다.
- GNB 배경은 러프한 종이 프레임 스타일을 사용한다.
- 하단은 찢어진 종이 느낌의 러프 프레임을 사용한다.
- 타이틀 `CATCH CASH` 또는 `CATCHCASH`는 이미지가 아니라 코드 텍스트로 구현한다.
- 타이틀은 CSS `transform`을 사용해 약간 삐딱한 러프 스타일을 표현할 수 있다.
- 아이콘은 SVG 에셋을 사용한다.
- Figma MCP 임시 URL은 코드에 사용하지 않는다.
- `public` 폴더는 코드 경로에 포함하지 않는다.
- 코드에서는 `/assets/...` 형태로 접근한다.
- GNB 타입은 props 또는 variant 값으로 제어한다.

---

## 3. 필수 에셋 정의

### 3-1. 에셋 경로

#### 실제 파일 위치

```txt
public/assets/icons/navigation/top/
public/assets/ui/frames/navigation/top/
```

#### 코드에서 사용하는 경로

```txt
/assets/icons/navigation/top/
/assets/ui/frames/navigation/top/
```

---

### 3-2. 아이콘 에셋

| 에셋명 | 용도 | 동작 |
|---|---|---|
| `icon_gnb_back_rough.svg` | 뒤로가기 아이콘 | 이전 화면으로 이동 |
| `icon_gnb_notification_default.svg` | 알림 아이콘 | 알림함 또는 알림 팝업 호출 |
| `icon_gnb_help_default.svg` | 도움말/가이드 아이콘 | 캐치캐쉬 안내 화면으로 이동 |
| `icon_gnb_setting_default.svg` | 설정 아이콘 | 설정/프로필 수정 화면으로 이동 |

---

### 3-3. 프레임 에셋

| 에셋명 | 용도 |
|---|---|
| `ui_frame_gnb_paper_rough_default.svg` | GNB 전체 종이 프레임 배경 |

프레임은 모든 GNB 타입에서 공통으로 사용한다. 내부 구성은 타입별로 달라지지만, 기본 종이 프레임은 동일 에셋을 사용한다.

---

## 4. 버튼 동작 기준

### 4-1. 뒤로가기 버튼

- 에셋: `icon_gnb_back_rough.svg`
- 기본 동작: 이전 화면으로 이동
- 구현 기준:
  - 기본은 `router.back()` 사용
  - 화면별 지정 경로가 필요한 경우 `backHref`를 props로 전달 가능

---

### 4-2. 알림 버튼

- 에셋: `icon_gnb_notification_default.svg`
- 연결 화면: `04_1_Notification_Inbox_Screen`
- 라우트 기준: `/notification`
- 동작:
  - 버튼 클릭 시 알림함 화면으로 이동하거나 알림 팝업을 호출한다.
  - MVP 기준에서는 `/notification` 이동을 기본으로 한다.

---

### 4-3. 도움말 버튼

- 에셋: `icon_gnb_help_default.svg`
- 연결 화면: `04_2_CatchCash_Guide_Screen`
- 라우트 기준: `/guide`
- 동작:
  - 버튼 클릭 시 캐치캐쉬 안내 화면으로 이동한다.

---

### 4-4. 설정 버튼

- 에셋: `icon_gnb_setting_default.svg`
- 연결 화면: `13_Profile_Edit_Screen`
- 라우트 기준: `/profile/edit`
- 동작:
  - 버튼 클릭 시 설정/프로필 수정 화면으로 이동한다.

---

## 5. 타이틀 텍스트 기준

타이틀은 이미지 에셋으로 분리하지 않고 코드 텍스트로 구현한다.

### 표시 텍스트

```txt
CATCH CASH
```

또는 기존 화면 기준에 따라 붙여쓰기 형태를 사용할 수 있다.

```txt
CATCHCASH
```

단, 하나의 공통 컴포넌트 안에서 화면별 title props로 제어한다.

### 권장 스타일

- 굵은 검정 텍스트
- 러프한 손그림 느낌
- 약간 삐딱한 형태 허용
- CSS transform 사용

권장 CSS 기준:

```txt
font-weight: 900
letter-spacing: -0.04em
transform: rotate(-1.5deg) skewX(-1deg)
line-height: 1
```

Tailwind 예시:

```tsx
<h1 className="-rotate-[1.5deg] skew-x-[-1deg] text-[24px] font-black tracking-[-0.04em] leading-none">
  CATCH CASH
</h1>
```

---

## 6. GNB 타입 정의

상단 GNB는 구성에 따라 3가지 타입으로 구분한다.

---

## 6-1. Type A - Compact Main Header

### 화면 이미지 기준

첫 번째 GNB 타입.

### 구성

```txt
CATCHCASH + 알림 + 도움말 + 설정
```

### 특징

- 뒤로가기 버튼이 없다.
- 타이틀은 좌측 또는 좌측 중앙에 배치한다.
- 우측에 알림, 도움말, 설정 버튼을 표시한다.
- 메인 화면 성격의 화면에서 사용한다.
- 화면 상단을 비교적 얇고 컴팩트하게 구성한다.

### 적용 화면

| 화면 번호 | 화면명 | 라우트 |
|---|---|---|
| 04 | `04_Main_Home_Screen` | `/home` |
| 05 | `05_Map_Detail_Screen` | `/map` |
| 09 | `09_Hall_Of_Fame_Screen` | `/hall-of-fame` |
| 10 | `10_My_Profile_Screen` | `/profile` |

### 필요 에셋

```txt
ui_frame_gnb_paper_rough_default.svg
icon_gnb_notification_default.svg
icon_gnb_help_default.svg
icon_gnb_setting_default.svg
```

### 버튼 동작

| 버튼 | 이동/동작 |
|---|---|
| 알림 | `/notification` 또는 알림 팝업 |
| 도움말 | `/guide` |
| 설정 | `/profile/edit` |

---

## 6-2. Type B - Back + Title + Actions Header

### 화면 이미지 기준

두 번째 GNB 타입.

### 구성

```txt
뒤로가기 + CATCH CASH + 알림 + 도움말 + 설정
```

### 특징

- 좌측에 뒤로가기 버튼이 있다.
- 중앙 또는 좌측 중심에 타이틀을 표시한다.
- 우측에 알림, 도움말, 설정 버튼을 표시한다.
- 서브 화면, 결과 화면, 목록/상세 화면에서 사용한다.

### 적용 화면

| 화면 번호 | 화면명 | 라우트 |
|---|---|---|
| 04_2 | `04_2_CatchCash_Guide_Screen` | `/guide` |
| 08 | `08_Hunt_Result_Screen` 성공 | `/hunt-result?result=success` |
| 08 | `08_Hunt_Result_Screen` 실패 | `/hunt-result?result=fail` |
| 11 | `11_Inventory_Screen` | `/inventory` |
| 13 | `13_Profile_Edit_Screen` | `/profile/edit` |
| 15_1 | `15_1_Support_Inquiry_List_Screen` | `/support` |
| 15_2 | `15_2_Support_Inquiry_Detail_Screen` | `/support/[inquiryId]` |
| 15_3 | `15_3_Support_Inquiry_Screen` | `/support/new` |

### 필요 에셋

```txt
ui_frame_gnb_paper_rough_default.svg
icon_gnb_back_rough.svg
icon_gnb_notification_default.svg
icon_gnb_help_default.svg
icon_gnb_setting_default.svg
```

### 버튼 동작

| 버튼 | 이동/동작 |
|---|---|
| 뒤로가기 | `router.back()` 또는 화면별 지정 경로 |
| 알림 | `/notification` 또는 알림 팝업 |
| 도움말 | `/guide` |
| 설정 | `/profile/edit` |

---

## 6-3. Type C - Back + Title Header

### 화면 이미지 기준

세 번째 GNB 타입.

### 구성

```txt
뒤로가기 + CATCHCASH
```

### 특징

- 좌측에 뒤로가기 버튼이 있다.
- 우측 액션 버튼은 없다.
- 닉네임/약관처럼 로그인 직후 진입하는 독립 화면에서 사용한다.
- 하단 버튼/입력 UI와 함께 독립적인 온보딩 화면 분위기를 유지한다.

### 적용 화면

| 화면 번호 | 화면명 | 라우트 |
|---|---|---|
| 03 | `03_Nickname_Terms_Screen` | `/nickname` |

### 필요 에셋

```txt
ui_frame_gnb_paper_rough_default.svg
icon_gnb_back_rough.svg
```

### 버튼 동작

| 버튼 | 이동/동작 |
|---|---|
| 뒤로가기 | `/login` |

---

## 7. 컴포넌트 기준

### 생성 파일

```txt
components/layout/app-header.tsx
```

### 역할

- 상단 GNB 렌더링
- 타입별 구성 제어
- 뒤로가기 버튼 표시 여부 제어
- 우측 액션 버튼 표시 여부 제어
- 버튼 클릭 시 라우팅 처리
- 공통 프레임 에셋 적용

---

## 8. Props 기준

```ts
type AppHeaderVariant =
  | "main-actions"
  | "back-actions"
  | "back-title";

type AppHeaderProps = {
  variant?: AppHeaderVariant;
  title?: string;
  backHref?: string;
  onBack?: () => void;
};
```

---

## 9. Variant 매핑

| variant | 구성 | 적용 타입 |
|---|---|---|
| `main-actions` | 타이틀 + 알림/도움말/설정 | Type A |
| `back-actions` | 뒤로가기 + 타이틀 + 알림/도움말/설정 | Type B |
| `back-title` | 뒤로가기 + 타이틀 | Type C |

---

## 10. 라우팅 기준

| 요소 | 연결 화면 | 라우트 |
|---|---|---|
| 뒤로가기 | 이전 화면 | `router.back()` 또는 `backHref` |
| 알림 | `04_1_Notification_Inbox_Screen` | `/notification` |
| 도움말 | `04_2_CatchCash_Guide_Screen` | `/guide` |
| 설정 | `13_Profile_Edit_Screen` | `/profile/edit` |

---

## 11. 구현 기준

- 상단 GNB는 화면별로 직접 새로 만들지 않는다.
- 공통 `AppHeader` 컴포넌트를 사용한다.
- 화면별 GNB 타입은 `variant`로 제어한다.
- 텍스트는 이미지가 아니라 코드 텍스트로 유지한다.
- 아이콘과 프레임은 public assets 경로를 사용한다.
- 코드에서 `public` 경로를 직접 쓰지 않는다.
- 코드 경로는 `/assets/...` 형태로 사용한다.
- Figma MCP 임시 URL을 코드에 넣지 않는다.
- 기존 스플래시/로그인/닉네임 기능 흐름을 깨지 않는다.

---

## 12. 우선 적용 전략

GNB는 전체 화면 공통 영역이므로 한 번에 모든 화면에 적용하지 않는다.

### 1차 적용 권장

- `/home`

### 2차 적용 권장

- `/map`
- `/profile`
- `/inventory`

### 팀원 PR 충돌 주의

아래 화면은 관련 PR이 열려 있거나 팀원 작업 중이면 해당 PR merge 후 적용한다.

- `/hall-of-fame`
- `/support`
- `/support/[inquiryId]`
- `/support/new`

---

## 13. 구현 제외 범위

- Supabase 연결
- Auth 연결
- DB 연결
- Naver Map 실제 API 연결
- AR 카메라 실제 연결
- Giftishow Biz API 연결
- 관리자 CMS 수정
- 기존 화면 기능 변경
- package.json 수정
- package-lock.json 수정
