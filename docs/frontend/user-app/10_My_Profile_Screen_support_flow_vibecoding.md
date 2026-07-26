# 10. 내프로필 화면 정의서
## 디자인 시안 기준 최종 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 10. 내프로필 화면 정의서 |
| 파일명 | `10_My_Profile_Screen_v4_design_based.md` |
| 화면명 | 내프로필 |
| 화면 ID | `10_My_Profile_Screen` |
| 서비스 | 캐치캐쉬 |
| 기준 디자인 | 디자인 시안 내프로필 Grug 시안 |
| 작성 목적 | 실제 디자인 시안 기준으로 화면 구성, 에셋명, 코드 구현 요소를 명확히 정리 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |

---

## 2. 화면 개요

내프로필 화면은 사용자가 자신의 캐릭터 프로필, 사냥 기록, 보유 쿠폰, 현재 순위, 보관함, 문의, 로그아웃 기능에 접근하는 마이페이지 화면이다.

이번 디자인 시안은 아래 구성을 따른다.

```txt
상단 헤더
→ 프로필 메인 카드
→ 통계 카드 3개
→ 보상 보관함 버튼
→ 문의하기 버튼
→ 로그아웃 버튼
→ 하단 탭바
```

---

## 3. 최종 화면 구성

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | 상단 헤더 | 뒤로가기, 화면명, 알림/도움말/설정 아이콘 |
| 2 | 프로필 메인 카드 | 캐릭터 아바타, 닉네임, 소개 문구, 프로필 수정 버튼 |
| 3 | 통계 카드 3개 | 찾은 보물, 보유 쿠폰, 현재 순위 |
| 4 | 보상 보관함 버튼 | 보관함 화면으로 이동 |
| 5 | 문의하기 버튼 | 문의 내역 리스트 화면으로 이동 |
| 6 | 로그아웃 버튼 | 로그아웃 확인 팝업 호출 |
| 7 | 하단 탭바 | Map, Hunt, Ranking, My Info |

---

## 4. 최종 에셋 전체 목록

이번 화면에서 사용하는 에셋은 아래 목록으로 확정한다.

| 구분 | 화면 요소 | 에셋명 | 비고 |
|---|---|---|---|
| 프레임 | 프로필 메인 카드 | `ui_frame_profile_main_card_rough_default.svg` | 상단 큰 카드 |
| 프레임 | 아바타 원형 프레임 | `ui_frame_profile_avatar_circle_rough_default.svg` | 캐릭터 외곽 원형 |
| 이미지 | 상자 캐릭터 이미지 | `img_profile_avatar_chest_rough_default.svg` | 프로필 대표 이미지 |
| 프레임 | 프로필 수정 검정 버튼 | `ui_frame_profile_edit_button_black_rough_default.svg` | 프로필 카드 내부 버튼 |
| 프레임 | 통계 카드 | `ui_frame_profile_stat_card_rough_default.svg` | 3개 카드 공통 |
| 프레임 | 보상 보관함 검정 버튼 | `ui_frame_profile_inventory_button_black_rough_default.svg` | 보관함 이동 버튼 |
| 프레임 | 문의하기 흰색 버튼 | `ui_frame_profile_inquiry_button_white_rough_default.svg` | 문의하기 이동 버튼 |
| 프레임 | 로그아웃 흰색 버튼 | `ui_frame_profile_logout_button_white_rough_default.svg` | 로그아웃 확인 팝업 버튼 |
| 아이콘 | 보상 보관함 아이콘 | `icon_profile_inventory_rough_default_24.svg` | 보관함 버튼 좌측 |
| 아이콘 | 문의하기 아이콘 | `icon_profile_inquiry_rough_default_24.svg` | 문의하기 버튼 좌측 |
| 아이콘 | 로그아웃 아이콘 | `icon_profile_logout_red_rough_default_24.svg` | 로그아웃 버튼 좌측 |
| 아이콘 | 일반 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` | 프로필 수정/보관함/문의 |
| 아이콘 | 빨간 우측 화살표 | `icon_action_arrow_right_red_rough_default_20.svg` | 로그아웃 버튼 우측 |
| 공통 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 전역 공통 |

---

# 5. 영역별 상세 정의

---

## 5.1 상단 헤더

### 화면 구성

```txt
좌측: 뒤로가기 아이콘
중앙: 내프로필
우측: 알림 아이콘 / 도움말 아이콘 / 설정 아이콘
```

### 헤더 아이콘

헤더 아이콘은 내프로필 전용으로 새로 만들지 않고 공통 GNB 아이콘을 재사용한다.

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` | 좌측 뒤로가기 |
| 알림 | `icon_gnb_notification_rough_default_24.svg` | 우측 알림 |
| 도움말 | `icon_gnb_help_rough_default_24.svg` | 우측 도움말 |
| 설정 | `icon_gnb_setting_rough_default_24.svg` | 우측 설정 |

### 코드/CSS 처리

| 요소 | 처리 방식 |
|---|---|
| `내프로필` 텍스트 | 코드 텍스트 |
| 헤더 하단 라인 | CSS border-bottom |
| 헤더 배경 | CSS background |
| 아이콘 클릭 영역 | HTML button |

---

## 5.2 프로필 메인 카드

### 화면 구성

```txt
상자 캐릭터 아바타
닉네임
한 줄 소개
프로필 수정 버튼
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 프로필 메인 카드 프레임 | `ui_frame_profile_main_card_rough_default.svg` | 상단 큰 흰색 rough 카드 |
| 아바타 원형 프레임 | `ui_frame_profile_avatar_circle_rough_default.svg` | 캐릭터를 감싸는 원형 프레임 |
| 상자 캐릭터 이미지 | `img_profile_avatar_chest_rough_default.svg` | 프로필 캐릭터 |
| 프로필 수정 버튼 프레임 | `ui_frame_profile_edit_button_black_rough_default.svg` | 검정색 CTA 버튼 |
| 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` | 프로필 수정 버튼 우측 |

### 표시 문구

| 요소 | 문구 예시 | 구현 |
|---|---|---|
| 닉네임 | `최고의 헌터` | 코드 텍스트 |
| 소개 문구 | `상자 냄새는 좀 맡는 편` | 코드 텍스트 |
| 버튼 | `프로필 수정` | 코드 텍스트 |

### 이동

| 액션 | 이동 |
|---|---|
| 프로필 수정 클릭 | `/profile/edit` |

---

## 5.3 통계 카드 3개

### 화면 구성

```txt
찾은 보물 08
보유 쿠폰 03
현재 순위 #458
```

### 사용 에셋

통계 카드 3개는 같은 프레임을 반복 사용한다.

| 요소 | 에셋명 | 사용 횟수 |
|---|---|---:|
| 통계 카드 프레임 | `ui_frame_profile_stat_card_rough_default.svg` | 3회 |

### 표시 데이터

| 카드 | 라벨 | 값 |
|---|---|---|
| 1 | `찾은 보물` | `08` |
| 2 | `보유 쿠폰` | `03` |
| 3 | `현재 순위` | `#458` |

### 구현 기준

```txt
카드 프레임 = SVG 에셋
라벨/숫자 = 코드 텍스트
배치 = CSS grid 3 columns
```

---

## 5.4 보상 보관함 버튼

### 화면 구성

```txt
좌측 보관함 아이콘
보상 보관함 텍스트
우측 화살표
```

### 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 버튼 프레임 | `ui_frame_profile_inventory_button_black_rough_default.svg` |
| 좌측 아이콘 | `icon_profile_inventory_rough_default_24.svg` |
| 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` |

### 표시 문구

```txt
보상 보관함
```

### 이동

| 액션 | 이동 |
|---|---|
| 보상 보관함 클릭 | `/inventory` |

### 주의

```txt
내프로필 화면에서는 쿠폰 코드와 바코드를 보여주지 않는다.
이 버튼은 보관함 화면으로 이동만 한다.
```

---

## 5.5 문의하기 버튼

### 화면 구성

```txt
좌측 문의하기 아이콘
문의하기 텍스트
우측 화살표
```

### 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 버튼 프레임 | `ui_frame_profile_inquiry_button_white_rough_default.svg` |
| 좌측 아이콘 | `icon_profile_inquiry_rough_default_24.svg` |
| 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` |

### 표시 문구

```txt
문의하기
```

### 이동

| 액션 | 이동 |
|---|---|
| 문의하기 클릭 | `/support` |

### 문의 플로우 변경 정책

```txt
내프로필
→ 문의하기 버튼 클릭
→ /support 문의 내역 리스트 화면
→ 하단 문의하기 CTA 클릭
→ /support/new 문의 작성 화면
→ 문의 등록 후 /support 복귀
```

- 내프로필 화면의 `문의하기` 버튼은 문의 작성 폼으로 바로 이동하지 않는다.
- 먼저 `15_1_Support_Inquiry_List_Screen`(`/support`)으로 이동한다.
- 사용자는 문의 리스트에서 기존 문의 상태를 확인하거나, 하단 `문의하기` CTA를 통해 신규 문의를 작성한다.
- 문의 카드 클릭 시 `15_2_Support_Inquiry_Detail_Screen`(`/support/[inquiryId]`)으로 이동한다.

---

## 5.6 로그아웃 버튼

### 화면 구성

```txt
좌측 로그아웃 아이콘
로그아웃 텍스트
우측 빨간 화살표
```

### 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 버튼 프레임 | `ui_frame_profile_logout_button_white_rough_default.svg` |
| 좌측 아이콘 | `icon_profile_logout_red_rough_default_24.svg` |
| 우측 화살표 | `icon_action_arrow_right_red_rough_default_20.svg` |

### 표시 문구

```txt
로그아웃
```

### 동작

로그아웃 버튼은 클릭 즉시 로그아웃하지 않는다.

```txt
로그아웃 클릭
→ 로그아웃 확인 팝업 열기
→ 확인 시 로그아웃
```

---

## 5.7 하단 탭바

### 화면 구성

```txt
Map
Hunt
Ranking
My Info
```

현재 활성 탭:

```txt
My Info
```

### 사용 에셋

| 요소 | 에셋명 |
|---|---|
| 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` |

### 탭 아이콘

| 탭 | 기본 아이콘 | 활성 아이콘 |
|---|---|---|
| Map | `icon_nav_map_rough_default_24.svg` | `icon_nav_map_rough_active_24.svg` |
| Hunt | `icon_nav_hunt_rough_default_24.svg` | `icon_nav_hunt_rough_active_24.svg` |
| Ranking | `icon_nav_rank_rough_default_24.svg` | `icon_nav_rank_rough_active_24.svg` |
| My Info | `icon_nav_profile_rough_default_24.svg` | `icon_nav_profile_rough_active_24.svg` |

---

# 6. 아이콘 정의만 따로 보기

| 역할 | 에셋명 | 사용 위치 |
|---|---|---|
| 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` | 헤더 좌측 |
| 알림 | `icon_gnb_notification_rough_default_24.svg` | 헤더 우측 |
| 도움말 | `icon_gnb_help_rough_default_24.svg` | 헤더 우측 |
| 설정 | `icon_gnb_setting_rough_default_24.svg` | 헤더 우측 |
| 보관함 | `icon_profile_inventory_rough_default_24.svg` | 보상 보관함 버튼 좌측 |
| 문의하기 | `icon_profile_inquiry_rough_default_24.svg` | 문의하기 버튼 좌측 |
| 로그아웃 | `icon_profile_logout_red_rough_default_24.svg` | 로그아웃 버튼 좌측 |
| 일반 화살표 | `icon_action_arrow_right_rough_default_20.svg` | 프로필 수정/보관함/문의 |
| 빨간 화살표 | `icon_action_arrow_right_red_rough_default_20.svg` | 로그아웃 버튼 우측 |
| Map 탭 | `icon_nav_map_rough_default_24.svg` / `icon_nav_map_rough_active_24.svg` | 하단 탭바 |
| Hunt 탭 | `icon_nav_hunt_rough_default_24.svg` / `icon_nav_hunt_rough_active_24.svg` | 하단 탭바 |
| Ranking 탭 | `icon_nav_rank_rough_default_24.svg` / `icon_nav_rank_rough_active_24.svg` | 하단 탭바 |
| My Info 탭 | `icon_nav_profile_rough_default_24.svg` / `icon_nav_profile_rough_active_24.svg` | 하단 탭바 |

---

# 7. 프레임 정의만 따로 보기

| 역할 | 에셋명 | 사용 위치 |
|---|---|---|
| 프로필 메인 카드 | `ui_frame_profile_main_card_rough_default.svg` | 상단 프로필 영역 |
| 아바타 원형 프레임 | `ui_frame_profile_avatar_circle_rough_default.svg` | 프로필 카드 내부 |
| 프로필 수정 버튼 | `ui_frame_profile_edit_button_black_rough_default.svg` | 프로필 카드 내부 |
| 통계 카드 | `ui_frame_profile_stat_card_rough_default.svg` | 통계 카드 3개 |
| 보상 보관함 버튼 | `ui_frame_profile_inventory_button_black_rough_default.svg` | 통계 아래 |
| 문의하기 버튼 | `ui_frame_profile_inquiry_button_white_rough_default.svg` | 보관함 아래 |
| 로그아웃 버튼 | `ui_frame_profile_logout_button_white_rough_default.svg` | 문의하기 아래 |
| 하단 탭바 | `ui_frame_bottom_tab_bar_rough_default.svg` | 화면 하단 |

---

# 8. 이미지 정의

| 역할 | 에셋명 | 사용 위치 |
|---|---|---|
| 상자 캐릭터 이미지 | `img_profile_avatar_chest_rough_default.svg` | 프로필 카드 내부 |

---

## 9. 코드로 처리하는 요소

아래 요소는 이미지에 넣지 않는다.

| 요소 | 처리 |
|---|---|
| `내프로필` | 코드 텍스트 |
| `최고의 헌터` | 코드 텍스트 |
| `상자 냄새는 좀 맡는 편` | 코드 텍스트 |
| `프로필 수정` | 코드 텍스트 |
| `찾은 보물`, `보유 쿠폰`, `현재 순위` | 코드 텍스트 |
| `08`, `03`, `#458` | 코드 텍스트 |
| `보상 보관함`, `문의하기`, `로그아웃` | 코드 텍스트 |
| 버튼 클릭 영역 | HTML button 또는 Link |
| 헤더 하단 라인 | CSS border |
| 카드 내부 정렬 | CSS flex/grid |
| 로그아웃 팝업 상태 | React state |

---

## 10. 제외하는 에셋

이번 시안 기준으로 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `ui_frame_profile_menu_list_rough_default.svg` | 메뉴 리스트 전체 프레임이 없음 |
| `ui_frame_profile_inventory_card_black_rough_default.svg` | 보관함은 카드가 아니라 검정 버튼 프레임 |
| `icon_profile_setting_rough_default_24.svg` | 설정은 프로필 전용이 아니라 GNB 공통 아이콘 재사용 |
| `img_profile_avatar_fallback_rough_default.svg` | 이번 시안은 상자 캐릭터 이미지로 고정 |
| `ui_frame_profile_stat_card_found_rough_default.svg` | 통계 카드는 공통 프레임 하나만 반복 사용 |
| `ui_frame_profile_stat_card_coupon_rough_default.svg` | 통계 카드는 공통 프레임 하나만 반복 사용 |
| `ui_frame_profile_stat_card_rank_rough_default.svg` | 통계 카드는 공통 프레임 하나만 반복 사용 |

---

## 11. 저장 경로

```txt
public/
  assets/
    icons/
      gnb/
        icon_gnb_notification_rough_default_24.svg
        icon_gnb_help_rough_default_24.svg
        icon_gnb_setting_rough_default_24.svg

      nav/
        icon_nav_back_simple_rough_default_24.svg
        icon_nav_map_rough_default_24.svg
        icon_nav_map_rough_active_24.svg
        icon_nav_hunt_rough_default_24.svg
        icon_nav_hunt_rough_active_24.svg
        icon_nav_rank_rough_default_24.svg
        icon_nav_rank_rough_active_24.svg
        icon_nav_profile_rough_default_24.svg
        icon_nav_profile_rough_active_24.svg

      profile/
        icon_profile_inventory_rough_default_24.svg
        icon_profile_inquiry_rough_default_24.svg
        icon_profile_logout_red_rough_default_24.svg

      action/
        icon_action_arrow_right_rough_default_20.svg
        icon_action_arrow_right_red_rough_default_20.svg

    images/
      profile/
        img_profile_avatar_chest_rough_default.svg

    ui/
      frames/
        profile/
          ui_frame_profile_main_card_rough_default.svg
          ui_frame_profile_avatar_circle_rough_default.svg
          ui_frame_profile_edit_button_black_rough_default.svg
          ui_frame_profile_stat_card_rough_default.svg
          ui_frame_profile_inventory_button_black_rough_default.svg
          ui_frame_profile_inquiry_button_white_rough_default.svg
          ui_frame_profile_logout_button_white_rough_default.svg

        global/
          ui_frame_bottom_tab_bar_rough_default.svg
```

---

## 12. 코드 상수

```ts
export const PROFILE_ASSETS = {
  // Header
  backIcon: '/assets/icons/nav/icon_nav_back_simple_rough_default_24.svg',
  notificationIcon: '/assets/icons/gnb/icon_gnb_notification_rough_default_24.svg',
  helpIcon: '/assets/icons/gnb/icon_gnb_help_rough_default_24.svg',
  settingIcon: '/assets/icons/gnb/icon_gnb_setting_rough_default_24.svg',

  // Profile Card
  mainCardFrame: '/assets/ui/frames/profile/ui_frame_profile_main_card_rough_default.svg',
  avatarCircleFrame: '/assets/ui/frames/profile/ui_frame_profile_avatar_circle_rough_default.svg',
  avatarImage: '/assets/images/profile/img_profile_avatar_chest_rough_default.svg',
  editButtonFrame: '/assets/ui/frames/profile/ui_frame_profile_edit_button_black_rough_default.svg',

  // Stats
  statCardFrame: '/assets/ui/frames/profile/ui_frame_profile_stat_card_rough_default.svg',

  // Action Buttons
  inventoryButtonFrame: '/assets/ui/frames/profile/ui_frame_profile_inventory_button_black_rough_default.svg',
  inquiryButtonFrame: '/assets/ui/frames/profile/ui_frame_profile_inquiry_button_white_rough_default.svg',
  logoutButtonFrame: '/assets/ui/frames/profile/ui_frame_profile_logout_button_white_rough_default.svg',

  // Icons
  inventoryIcon: '/assets/icons/profile/icon_profile_inventory_rough_default_24.svg',
  inquiryIcon: '/assets/icons/profile/icon_profile_inquiry_rough_default_24.svg',
  logoutIcon: '/assets/icons/profile/icon_profile_logout_red_rough_default_24.svg',
  arrowRightIcon: '/assets/icons/action/icon_action_arrow_right_rough_default_20.svg',
  arrowRightRedIcon: '/assets/icons/action/icon_action_arrow_right_red_rough_default_20.svg',

  // Bottom Nav
  bottomTabBarFrame: '/assets/ui/frames/global/ui_frame_bottom_tab_bar_rough_default.svg',
} as const;
```

---

## 13. 데이터 구조

```ts
export interface MyProfileSummary {
  nickname: string;
  description: string;
  foundTreasureCount: number;
  availableCouponCount: number;
  currentRank: number;
}
```

---

## 14. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 뒤로가기 | 이전 화면 또는 `/map` |
| 알림 아이콘 | 알림 화면 또는 알림 팝업 |
| 도움말 아이콘 | 캐치캐쉬 안내 화면 |
| 설정 아이콘 | 설정 화면 |
| 프로필 수정 | `/profile/edit` |
| 보상 보관함 | `/inventory` |
| 문의하기 | `/support` |
| 로그아웃 | 로그아웃 확인 팝업 |
| Map 탭 | `/map` |
| Hunt 탭 | `/hunt` 또는 사냥 진입 조건 확인 |
| Ranking 탭 | `/fame` |
| My Info 탭 | 현재 화면 유지 |

---


## 14.1 문의 플로우 연결 기준

| 출발 화면 | 액션 | 도착 화면 |
|---|---|---|
| `10_My_Profile_Screen` | 문의하기 버튼 클릭 | `15_1_Support_Inquiry_List_Screen` `/support` |
| `15_1_Support_Inquiry_List_Screen` | 문의하기 CTA 클릭 | `15_Support_Inquiry_Screen` 또는 `15_3_Support_Inquiry_Write_Screen` `/support/new` |
| `15_1_Support_Inquiry_List_Screen` | 문의 카드 클릭 | `15_2_Support_Inquiry_Detail_Screen` `/support/[inquiryId]` |
| `15_2_Support_Inquiry_Detail_Screen` | 알았다 버튼 클릭 | `/support` |

- `문의하기` 버튼의 의미는 "문의 작성"이 아니라 "문의 영역 진입"으로 정의한다.
- 실제 작성은 `/support/new`에서 수행한다.


## 15. QA 체크리스트

- [ ] 화면 구조가 디자인 시안 순서와 일치한다.
- [ ] 프로필 메인 카드는 `ui_frame_profile_main_card_rough_default.svg`를 사용한다.
- [ ] 아바타 원형은 `ui_frame_profile_avatar_circle_rough_default.svg`를 사용한다.
- [ ] 상자 캐릭터는 `img_profile_avatar_chest_rough_default.svg`를 사용한다.
- [ ] 통계 카드 3개는 같은 프레임을 3회 재사용한다.
- [ ] 보상 보관함은 검정 버튼 프레임이다.
- [ ] 문의하기는 흰색 버튼 프레임이다.
- [ ] 로그아웃은 흰색 버튼 프레임 + 빨간 아이콘 + 빨간 화살표다.
- [ ] 모든 텍스트는 이미지가 아니라 코드 텍스트다.
- [ ] 쿠폰 코드와 바코드는 이 화면에 표시하지 않는다.
