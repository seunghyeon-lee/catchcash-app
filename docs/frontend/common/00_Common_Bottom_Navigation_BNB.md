# 00. Common Bottom Navigation - BNB

## 1. 문서 목적

캐치캐쉬 앱 전역에서 사용하는 하단 바텀 네비게이션, 이하 BNB의 공통 디자인, 에셋, 라우팅, active 상태, 구현 기준을 정의한다.

BNB는 각 화면에서 개별로 새로 구현하지 않고, 공통 컴포넌트로 재사용한다.  
화면별로 동일한 이동 구조와 동일한 디자인을 유지하기 위해 본 문서를 기준으로 개발한다.

---

## 2. 적용 범위

### 2.1 BNB 사용 화면

BNB는 로그인 이후 사용자가 주요 메뉴를 이동하는 화면에서 사용한다.

| 메뉴 | 연결 화면 MD | 라우트 | 설명 |
|---|---|---|---|
| 홈 | `04_Main_Home_Screen` | `/home` | 메인 홈 화면 |
| 지도 | `05_Map_Detail_Screen` | `/map` | 보물 지도 화면 |
| 사냥하기 | `07_AR_Hunt_Screen` | `/ar-hunt` | AR 사냥 화면 |
| 명예의 전당 | `09_Hall_Of_Fame_Screen` | `/hall-of-fame` | 랭킹/명예의 전당 화면 |
| 내정보 | `10_My_Profile_Screen` | `/profile` | 내 프로필 화면 |

### 2.2 BNB 미사용 화면

아래 화면에는 BNB를 표시하지 않는다.

| 화면 MD | 라우트 | 제외 사유 |
|---|---|---|
| `01_Splash_Screen` | `/` | 앱 진입 스플래시 화면 |
| `02_Login_Screen` | `/login` | 로그인 전 화면 |
| `03_Nickname_Terms_Screen` | `/nickname` | 최초 설정/약관 화면 |
| `12_Reward_Detail_Popup` | 팝업 | BNB와 별도 레이어 |
| `14_Logout_Confirm_Popup` | 팝업 | BNB와 별도 레이어 |

---

## 3. BNB 메뉴 구성

BNB는 총 5개 탭으로 구성한다.

| 순서 | 탭 라벨 | 라우트 | 연결 화면 | 아이콘 의미 |
|---|---|---|---|---|
| 1 | 홈 | `/home` | `04_Main_Home_Screen` | 집 모양 아이콘 |
| 2 | 지도 | `/map` | `05_Map_Detail_Screen` | 접힌 지도 아이콘 |
| 3 | 사냥하기 | `/ar-hunt` | `07_AR_Hunt_Screen` | 보물/타겟 형태 아이콘 |
| 4 | 명예의 전당 | `/hall-of-fame` | `09_Hall_Of_Fame_Screen` | 트로피 아이콘 |
| 5 | 내정보 | `/profile` | `10_My_Profile_Screen` | 사용자 프로필 아이콘 |

---

## 4. 라우팅 동작 정의

### 4.1 홈 탭

- 탭 라벨: `홈`
- 클릭 시 이동 라우트: `/home`
- 연결 화면: `04_Main_Home_Screen`
- active 조건:
  - 현재 pathname이 `/home`일 때 active 처리한다.

### 4.2 지도 탭

- 탭 라벨: `지도`
- 클릭 시 이동 라우트: `/map`
- 연결 화면: `05_Map_Detail_Screen`
- active 조건:
  - 현재 pathname이 `/map`일 때 active 처리한다.

### 4.3 사냥하기 탭

- 탭 라벨: `사냥하기`
- 클릭 시 이동 라우트: `/ar-hunt`
- 연결 화면: `07_AR_Hunt_Screen`
- active 조건:
  - 현재 pathname이 `/ar-hunt`일 때 active 처리한다.

### 4.4 명예의 전당 탭

- 탭 라벨: `명예의 전당`
- 클릭 시 이동 라우트: `/hall-of-fame`
- 연결 화면: `09_Hall_Of_Fame_Screen`
- active 조건:
  - 현재 pathname이 `/hall-of-fame`일 때 active 처리한다.

### 4.5 내정보 탭

- 탭 라벨: `내정보`
- 클릭 시 이동 라우트: `/profile`
- 연결 화면: `10_My_Profile_Screen`
- active 조건:
  - 현재 pathname이 `/profile`일 때 active 처리한다.
  - `/profile/edit` 같은 내정보 하위 화면에서도 필요 시 내정보 탭을 active 처리할 수 있다.

---

## 5. Active 상태 기준

BNB는 현재 경로를 기준으로 active 탭을 표시한다.

| 현재 pathname | active 탭 |
|---|---|
| `/home` | 홈 |
| `/map` | 지도 |
| `/ar-hunt` | 사냥하기 |
| `/hall-of-fame` | 명예의 전당 |
| `/profile` | 내정보 |
| `/profile/edit` | 내정보 |

### 5.1 하위 경로 active 정책

하위 경로는 상위 메뉴 기준으로 active 처리한다.

예시:

| 하위 경로 | active 탭 | 기준 |
|---|---|---|
| `/profile/edit` | 내정보 | 프로필 하위 화면 |
| `/support` | 내정보 | 내정보에서 진입하는 문의 화면일 경우 |
| `/support/new` | 내정보 | 문의 작성 화면일 경우 |
| `/support/[inquiryId]` | 내정보 | 문의 상세 화면일 경우 |

단, 팝업 성격의 화면은 BNB active 상태를 별도로 변경하지 않는다.

---

## 6. 디자인 기준

### 6.1 전체 구조

- BNB는 모바일 화면 하단에 배치한다.
- 모바일 WebView 기준 max-width 390~480px 안에서 정렬한다.
- 전체 BNB는 5개 탭이 동일한 너비를 가진다.
- 높이는 Figma BottomNavBar 기준에 맞춰 구성한다.
- BNB 상단에는 검정 구분선을 표시한다.
- 전체 배경은 흰색을 기본으로 한다.

### 6.2 탭 구조

각 탭은 아래 구조를 가진다.

1. 아이콘
2. 텍스트 라벨

아이콘은 위, 텍스트는 아래에 세로 정렬한다.

### 6.3 Active 탭 디자인

선택된 탭은 active 상태로 표시한다.

- 배경: 검정색
- 아이콘: 흰색 active 아이콘 사용
- 텍스트: 흰색
- 탭 전체 높이와 너비는 다른 탭과 동일한 기준 유지

### 6.4 Default 탭 디자인

선택되지 않은 탭은 default 상태로 표시한다.

- 배경: 흰색
- 아이콘: 검정색 default 아이콘 사용
- 텍스트: 검정색

### 6.5 텍스트 구현 기준

- 탭 라벨은 이미지로 처리하지 않는다.
- `홈`, `지도`, `사냥하기`, `명예의 전당`, `내정보`는 코드 텍스트로 구현한다.
- 텍스트는 active 상태에 따라 색상만 변경한다.

---

## 7. 에셋 정의

### 7.1 에셋 저장 경로

BNB 아이콘은 기존 화면별 에셋과 충돌하지 않도록 공통 네비게이션 전용 폴더에 저장한다.

```txt
public/assets/icons/navigation/bottom/
```

코드에서 사용할 때는 `public`을 제외하고 아래 경로 형식을 사용한다.

```txt
/assets/icons/navigation/bottom/파일명.svg
```

---

## 8. 아이콘 에셋 목록

BNB 아이콘은 active/default 상태를 분리한다.

### 8.1 홈 아이콘

| 상태 | 파일명 | 코드 경로 | 설명 |
|---|---|---|---|
| active | `icon_bnb_home_active.svg` | `/assets/icons/navigation/bottom/icon_bnb_home_active.svg` | 홈 선택 상태, 흰색 아이콘 |
| default | `icon_bnb_home_default.svg` | `/assets/icons/navigation/bottom/icon_bnb_home_default.svg` | 홈 비선택 상태, 검정 아이콘 |

### 8.2 지도 아이콘

| 상태 | 파일명 | 코드 경로 | 설명 |
|---|---|---|---|
| active | `icon_bnb_map_active.svg` | `/assets/icons/navigation/bottom/icon_bnb_map_active.svg` | 지도 선택 상태, 흰색 아이콘 |
| default | `icon_bnb_map_default.svg` | `/assets/icons/navigation/bottom/icon_bnb_map_default.svg` | 지도 비선택 상태, 검정 아이콘 |

### 8.3 사냥하기 아이콘

| 상태 | 파일명 | 코드 경로 | 설명 |
|---|---|---|---|
| active | `icon_bnb_hunt_active.svg` | `/assets/icons/navigation/bottom/icon_bnb_hunt_active.svg` | 사냥하기 선택 상태, 흰색 아이콘 |
| default | `icon_bnb_hunt_default.svg` | `/assets/icons/navigation/bottom/icon_bnb_hunt_default.svg` | 사냥하기 비선택 상태, 검정 아이콘 |

### 8.4 명예의 전당 아이콘

| 상태 | 파일명 | 코드 경로 | 설명 |
|---|---|---|---|
| active | `icon_bnb_fame_active.svg` | `/assets/icons/navigation/bottom/icon_bnb_fame_active.svg` | 명예의 전당 선택 상태, 흰색 아이콘 |
| default | `icon_bnb_fame_default.svg` | `/assets/icons/navigation/bottom/icon_bnb_fame_default.svg` | 명예의 전당 비선택 상태, 검정 아이콘 |

### 8.5 내정보 아이콘

| 상태 | 파일명 | 코드 경로 | 설명 |
|---|---|---|---|
| active | `icon_bnb_profile_active.svg` | `/assets/icons/navigation/bottom/icon_bnb_profile_active.svg` | 내정보 선택 상태, 흰색 아이콘 |
| default | `icon_bnb_profile_default.svg` | `/assets/icons/navigation/bottom/icon_bnb_profile_default.svg` | 내정보 비선택 상태, 검정 아이콘 |

---

## 9. 에셋 네이밍 규칙

### 9.1 네이밍 포맷

```txt
icon_bnb_{menu}_{state}.svg
```

| 구분 | 값 |
|---|---|
| `icon` | 아이콘 에셋 |
| `bnb` | Bottom Navigation Bar |
| `{menu}` | home, map, hunt, fame, profile |
| `{state}` | active, default |

### 9.2 메뉴 키

| 메뉴 | key |
|---|---|
| 홈 | `home` |
| 지도 | `map` |
| 사냥하기 | `hunt` |
| 명예의 전당 | `fame` |
| 내정보 | `profile` |

### 9.3 상태 키

| 상태 | key | 설명 |
|---|---|---|
| 선택됨 | `active` | 검정 배경 위에 표시되는 흰색 아이콘 |
| 선택 안 됨 | `default` | 흰색 배경 위에 표시되는 검정 아이콘 |

---

## 10. 구현 컴포넌트 기준

### 10.1 생성 컴포넌트

공통 BNB는 아래 컴포넌트로 구현한다.

```txt
components/layout/bottom-nav.tsx
```

### 10.2 컴포넌트 역할

`BottomNav` 컴포넌트는 아래 역할을 가진다.

- BNB 전체 UI 렌더링
- 탭 5개 렌더링
- 현재 pathname 기준 active 상태 계산
- active/default 아이콘 선택
- 탭 클릭 시 지정 라우트로 이동

### 10.3 탭 데이터 구조 예시

```ts
const bottomNavItems = [
  {
    key: "home",
    label: "홈",
    href: "/home",
    matchPaths: ["/home"],
    activeIcon: "/assets/icons/navigation/bottom/icon_bnb_home_active.svg",
    defaultIcon: "/assets/icons/navigation/bottom/icon_bnb_home_default.svg",
  },
  {
    key: "map",
    label: "지도",
    href: "/map",
    matchPaths: ["/map"],
    activeIcon: "/assets/icons/navigation/bottom/icon_bnb_map_active.svg",
    defaultIcon: "/assets/icons/navigation/bottom/icon_bnb_map_default.svg",
  },
  {
    key: "hunt",
    label: "사냥하기",
    href: "/ar-hunt",
    matchPaths: ["/ar-hunt"],
    activeIcon: "/assets/icons/navigation/bottom/icon_bnb_hunt_active.svg",
    defaultIcon: "/assets/icons/navigation/bottom/icon_bnb_hunt_default.svg",
  },
  {
    key: "fame",
    label: "명예의 전당",
    href: "/hall-of-fame",
    matchPaths: ["/hall-of-fame"],
    activeIcon: "/assets/icons/navigation/bottom/icon_bnb_fame_active.svg",
    defaultIcon: "/assets/icons/navigation/bottom/icon_bnb_fame_default.svg",
  },
  {
    key: "profile",
    label: "내정보",
    href: "/profile",
    matchPaths: ["/profile", "/profile/edit", "/support", "/support/new"],
    activeIcon: "/assets/icons/navigation/bottom/icon_bnb_profile_active.svg",
    defaultIcon: "/assets/icons/navigation/bottom/icon_bnb_profile_default.svg",
  },
];
```

---

## 11. 레이아웃 구현 기준

### 11.1 위치

- BNB는 화면 하단에 배치한다.
- 앱 화면의 모바일 컨테이너 안에서 하단 고정 또는 하단 배치로 구현한다.
- 본문 콘텐츠가 BNB에 가려지지 않도록 하단 padding을 확보한다.

### 11.2 크기

- 전체 BNB 너비: 모바일 컨테이너 전체 너비
- 탭 너비: 5등분 동일 너비
- 아이콘 크기: Figma 기준 SVG 원본 비율 유지
- 탭 라벨은 한 줄로 표시한다.

### 11.3 Safe Area

모바일 WebView 환경을 고려하여 하단 safe area가 필요한 경우 padding-bottom을 적용한다.

---

## 12. 적용 순서

공통 BNB는 한 번에 전체 화면에 적용하지 않고 순차 적용한다.

### 12.1 1차 적용

우선 아래 화면에만 적용한다.

| 화면 | 라우트 |
|---|---|
| 홈 | `/home` |

### 12.2 2차 적용

1차 검수 후 아래 화면에 순차 적용한다.

| 화면 | 라우트 |
|---|---|
| 지도 | `/map` |
| 사냥하기 | `/ar-hunt` |
| 명예의 전당 | `/hall-of-fame` |
| 내정보 | `/profile` |

---

## 13. 수정 금지 화면

공통 BNB 작업 중 아래 화면은 수정하지 않는다.

| 화면 | 라우트 | 사유 |
|---|---|---|
| 스플래시 | `/` | BNB 미사용 |
| 로그인 | `/login` | BNB 미사용 |
| 닉네임/약관 | `/nickname` | BNB 미사용 |
| 관리자 CMS | `/admin/**` | 사용자 앱 BNB와 무관 |

---

## 14. 구현 제외 범위

아래 작업은 BNB 공통화 범위에 포함하지 않는다.

- Supabase 연결
- Auth 연결
- DB 연결
- Naver Map 실제 API 연결
- AR 카메라 실제 연결
- Giftishow Biz API 연결
- 관리자 CMS 수정
- 기존 화면 기능 변경
- 스플래시/로그인/닉네임 화면 수정
- Figma MCP 임시 URL 사용
- package.json 수정
- package-lock.json 수정

---

## 15. 완료 기준

BNB 공통화 작업은 아래 조건을 만족해야 한다.

- `components/layout/bottom-nav.tsx` 생성
- BNB 아이콘 에셋 10개 연결
- `/home`에서 BNB 정상 표시
- 홈 탭 active 상태 정상 표시
- 탭 클릭 시 지정 라우트로 이동
- 텍스트 라벨은 코드 텍스트로 표시
- active/default 아이콘이 상태에 맞게 전환
- 기존 스플래시/로그인/닉네임 화면 영향 없음
- `npm run lint` 통과
- `npm run build` 통과
- Vercel Preview에서 `/home` 확인 가능

---

## 16. 개발 작업 브랜치 기준

권장 브랜치명:

```txt
feature/common-bottom-navigation
```

PR 제목:

```txt
feat: add common bottom navigation
```

PR 설명에는 아래 내용을 포함한다.

- 공통 BottomNav 컴포넌트 생성
- BNB 아이콘 에셋 추가
- `/home` 우선 적용
- Supabase/Auth/DB 연결 없음
- 스플래시/로그인/닉네임 화면 수정 없음
