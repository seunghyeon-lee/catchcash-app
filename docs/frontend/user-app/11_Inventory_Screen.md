# 11. 나의 보관함 화면 정의서
## 디자인 시안 기준 최종 에셋 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 11. 나의 보관함 화면 정의서 |
| 파일명 | `11_Inventory_Screen_v2_design_based.md` |
| 화면명 | 나의 보관함 |
| 화면 ID | `11_Inventory_Screen` |
| 서비스 | 캐치캐쉬 |
| 기준 디자인 | Stitch AI 나의 보관함 Grug 시안 |
| 작성 목적 | 실제 디자인 시안 기준으로 화면 구성, 에셋명, 코드 구현 요소를 명확히 정리 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |

---

## 2. 화면 개요

나의 보관함 화면은 사용자가 보물 사냥을 통해 얻은 보상 수령권과 쿠폰 상태를 목록으로 확인하는 화면이다.

이 화면에서는 보상 목록과 상태만 보여준다.

중요:

```txt
쿠폰 코드와 바코드는 이 화면에서 보여주지 않는다.
쿠폰 받기 버튼도 이 화면에 넣지 않는다.
보상 카드를 누르면 보상 상세 팝업으로 진입한다.
기프티쇼비즈 API는 이 목록 화면에서 호출하지 않는다.
```

---

## 3. 최종 화면 구성

디자인 시안 기준 화면 구성은 아래 순서로 확정한다.

```txt
상단 헤더
→ 보관함 타이틀 영역
→ 필터 버튼
→ 보상 카드 리스트
→ 하단 탭바
```

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | 상단 헤더 | 뒤로가기, 화면명, 알림/도움말/설정 아이콘 |
| 2 | 타이틀 영역 | 보관함 아이콘, 나의 보관함 제목, 설명 문구 |
| 3 | 필터 버튼 | 전체, 사용 가능, 사용됨, 만료됨 |
| 4 | 사용 가능 카드 | 정상 사용 가능한 보상 |
| 5 | 발급 실패 카드 | 발급 실패 또는 오류 상태 보상 |
| 6 | 사용 완료 카드 | 이미 사용한 보상 |
| 7 | 하단 탭바 | Map, Hunt, Ranking, My Info |

---

## 4. 최종 에셋 전체 목록

이번 화면에서 사용하는 에셋은 아래 목록으로 확정한다.

| 구분 | 화면 요소 | 에셋명 | 비고 |
|---|---|---|---|
| 공통 아이콘 | 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` | 헤더 좌측 |
| 공통 아이콘 | 알림 | `icon_gnb_notification_rough_default_24.svg` | 헤더 우측 |
| 공통 아이콘 | 도움말 | `icon_gnb_help_rough_default_24.svg` | 헤더 우측 |
| 공통 아이콘 | 설정 | `icon_gnb_setting_rough_default_24.svg` | 헤더 우측 |
| 아이콘 | 보관함 타이틀 아이콘 | `icon_inventory_title_box_rough_default_32.svg` | 타이틀 영역 |
| 프레임 | 활성 필터 버튼 | `ui_frame_inventory_filter_active_rough_default.svg` | 선택된 필터 |
| 프레임 | 비활성 필터 버튼 | `ui_frame_inventory_filter_inactive_rough_default.svg` | 미선택 필터 |
| 프레임 | 사용 가능 보상 카드 | `ui_frame_inventory_reward_card_available_rough_default.svg` | 정상 카드 |
| 프레임 | 발급 실패 보상 카드 | `ui_frame_inventory_reward_card_failed_rough_default.svg` | 오류 카드 |
| 프레임 | 사용 완료 보상 카드 | `ui_frame_inventory_reward_card_used_rough_default.svg` | 점선 카드 |
| 프레임 | 상품 이미지 박스 | `ui_frame_inventory_reward_image_box_rough_default.svg` | 카드 좌측 |
| 이미지 | 상품 fallback 이미지 | `img_inventory_reward_fallback_rough_default.svg` | 상품 이미지 없을 때 |
| 프레임 | 사용 가능 상태 배지 | `ui_frame_inventory_status_badge_available_rough_default.svg` | 카드 내부 |
| 프레임 | 발급 실패 상태 배지 | `ui_frame_inventory_status_badge_failed_rough_default.svg` | 카드 내부 |
| 프레임 | 사용 완료 상태 배지 | `ui_frame_inventory_status_badge_used_rough_default.svg` | 카드 내부 |
| 아이콘 | 발급 실패 아이콘 | `icon_inventory_error_rough_default_24.svg` | 실패 카드 좌측 |
| 아이콘 | 재시도 아이콘 | `icon_inventory_retry_red_rough_default_20.svg` | 실패 카드 우측 |
| 아이콘 | 사용 완료 체크 아이콘 | `icon_inventory_used_check_rough_default_20.svg` | 사용 완료 카드 우측 |
| 공통 아이콘 | 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` | 사용 가능 카드 우측 |
| 공통 프레임 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 화면 하단 |

---

# 5. 영역별 상세 정의

---

## 5.1 상단 헤더

### 화면 구성

```txt
좌측: 뒤로가기 아이콘
중앙: 나의 보관함
우측: 알림 / 도움말 / 설정 아이콘
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` | 이전 화면 이동 |
| 알림 | `icon_gnb_notification_rough_default_24.svg` | 알림 화면 또는 팝업 |
| 도움말 | `icon_gnb_help_rough_default_24.svg` | 캐치캐쉬 안내 |
| 설정 | `icon_gnb_setting_rough_default_24.svg` | 설정 화면 |

### 코드/CSS 처리

| 요소 | 처리 방식 |
|---|---|
| `나의 보관함` 텍스트 | 코드 텍스트 |
| 헤더 하단 라인 | CSS border-bottom |
| 헤더 배경 | CSS background |
| 아이콘 클릭 영역 | HTML button |

---

## 5.2 보관함 타이틀 영역

### 화면 구성

```txt
좌측 보관함 아이콘
나의 보관함
전리품 안 잃어버리게 모아뒀다.
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 보관함 타이틀 아이콘 | `icon_inventory_title_box_rough_default_32.svg` | 타이틀 좌측 상자/보관함 아이콘 |

### 표시 문구

| 요소 | 문구 | 처리 |
|---|---|---|
| 타이틀 | `나의 보관함` | 코드 텍스트 |
| 설명 | `전리품 안 잃어버리게 모아뒀다.` | 코드 텍스트 |

---

## 5.3 필터 버튼

### 화면 구성

```txt
전체
사용 가능
사용됨
만료됨
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 활성 필터 버튼 | `ui_frame_inventory_filter_active_rough_default.svg` | 검정 배경 필터 |
| 비활성 필터 버튼 | `ui_frame_inventory_filter_inactive_rough_default.svg` | 흰색 배경 필터 |

### 필터 상태

| 필터 | 상태값 |
|---|---|
| 전체 | `all` |
| 사용 가능 | `available` |
| 사용됨 | `used` |
| 만료됨 | `expired` |

### 구현 기준

```txt
필터 버튼 프레임 = SVG 에셋
필터 문구 = 코드 텍스트
활성 상태 = React state
필터 영역 = 가로 스크롤 가능
```

---

## 5.4 사용 가능 보상 카드

### 화면 구성

```txt
좌측 상품 이미지
상태 배지: 사용 가능
상품명
브랜드명 / 만료일
우측 화살표
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 카드 프레임 | `ui_frame_inventory_reward_card_available_rough_default.svg` | 사용 가능 상태 카드 |
| 상품 이미지 박스 | `ui_frame_inventory_reward_image_box_rough_default.svg` | 좌측 이미지 영역 |
| 상품 fallback 이미지 | `img_inventory_reward_fallback_rough_default.svg` | 상품 이미지 없을 때 |
| 상태 배지 | `ui_frame_inventory_status_badge_available_rough_default.svg` | 사용 가능 배지 |
| 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` | 상세 팝업 진입 표시 |

### 표시 예시

```txt
아메리카노 Tall
스타벅스 | 2024.12.31까지
사용 가능
```

### 동작

| 액션 | 동작 |
|---|---|
| 카드 클릭 | 보상 상세 팝업 열기 |

---

## 5.5 발급 실패 보상 카드

### 화면 구성

```txt
좌측 실패 아이콘
상태 배지: 발급 실패
상품명
오류 사유
우측 재시도 아이콘
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 카드 프레임 | `ui_frame_inventory_reward_card_failed_rough_default.svg` | 발급 실패 카드 |
| 실패 아이콘 | `icon_inventory_error_rough_default_24.svg` | 좌측 느낌표 아이콘 |
| 상태 배지 | `ui_frame_inventory_status_badge_failed_rough_default.svg` | 발급 실패 배지 |
| 재시도 아이콘 | `icon_inventory_retry_red_rough_default_20.svg` | 우측 재시도 아이콘 |

### 표시 예시

```txt
비타500 100ml
네트워크 오류로 중단됨
발급 실패
```

### 동작

| 액션 | 동작 |
|---|---|
| 카드 클릭 | 보상 상세 팝업 열기 |
| 재시도 아이콘 클릭 | 상세 팝업 또는 재시도 안내로 연결 |

중요:

```txt
목록 화면에서 직접 기프티쇼비즈 API를 호출하지 않는다.
재시도 처리는 상세 팝업 또는 별도 확인 흐름에서 처리한다.
```

---

## 5.6 사용 완료 보상 카드

### 화면 구성

```txt
좌측 상품 이미지
상태 배지: 사용 완료
상품명
사용일
우측 체크 아이콘
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 카드 프레임 | `ui_frame_inventory_reward_card_used_rough_default.svg` | 사용 완료 점선 카드 |
| 상품 이미지 박스 | `ui_frame_inventory_reward_image_box_rough_default.svg` | 좌측 이미지 영역 |
| 상품 fallback 이미지 | `img_inventory_reward_fallback_rough_default.svg` | 상품 이미지 없을 때 |
| 상태 배지 | `ui_frame_inventory_status_badge_used_rough_default.svg` | 사용 완료 배지 |
| 체크 아이콘 | `icon_inventory_used_check_rough_default_20.svg` | 우측 완료 아이콘 |

### 표시 예시

```txt
에그 드랍 샌드위치
2023.10.15 사용됨
사용 완료
```

### 동작

| 액션 | 동작 |
|---|---|
| 카드 클릭 | 보상 상세 팝업 열기 또는 읽기 전용 상세 열기 |

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

# 6. 프레임 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 활성 필터 | `ui_frame_inventory_filter_active_rough_default.svg` |
| 비활성 필터 | `ui_frame_inventory_filter_inactive_rough_default.svg` |
| 사용 가능 카드 | `ui_frame_inventory_reward_card_available_rough_default.svg` |
| 발급 실패 카드 | `ui_frame_inventory_reward_card_failed_rough_default.svg` |
| 사용 완료 카드 | `ui_frame_inventory_reward_card_used_rough_default.svg` |
| 상품 이미지 박스 | `ui_frame_inventory_reward_image_box_rough_default.svg` |
| 사용 가능 배지 | `ui_frame_inventory_status_badge_available_rough_default.svg` |
| 발급 실패 배지 | `ui_frame_inventory_status_badge_failed_rough_default.svg` |
| 사용 완료 배지 | `ui_frame_inventory_status_badge_used_rough_default.svg` |
| 하단 탭바 | `ui_frame_bottom_tab_bar_rough_default.svg` |

---

# 7. 아이콘 / 이미지 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` |
| 알림 | `icon_gnb_notification_rough_default_24.svg` |
| 도움말 | `icon_gnb_help_rough_default_24.svg` |
| 설정 | `icon_gnb_setting_rough_default_24.svg` |
| 타이틀 보관함 아이콘 | `icon_inventory_title_box_rough_default_32.svg` |
| 상품 fallback 이미지 | `img_inventory_reward_fallback_rough_default.svg` |
| 발급 실패 아이콘 | `icon_inventory_error_rough_default_24.svg` |
| 재시도 아이콘 | `icon_inventory_retry_red_rough_default_20.svg` |
| 사용 완료 체크 아이콘 | `icon_inventory_used_check_rough_default_20.svg` |
| 우측 화살표 | `icon_action_arrow_right_rough_default_20.svg` |

---

## 8. 코드로 처리하는 요소

아래 요소는 이미지에 넣지 않는다.

| 요소 | 처리 |
|---|---|
| 화면 제목 | 코드 텍스트 |
| 설명 문구 | 코드 텍스트 |
| 필터 문구 | 코드 텍스트 |
| 상품명 | 코드 텍스트 |
| 브랜드명 | 코드 텍스트 |
| 날짜 | 코드 텍스트 |
| 상태 문구 | 코드 텍스트 |
| 오류 문구 | 코드 텍스트 |
| 목록 데이터 | API 데이터 |
| 카드 클릭 | HTML button 또는 Link |
| 상세 팝업 호출 | React state |
| 필터 선택 상태 | React state |
| 하단 탭 라벨 | 코드 텍스트 |

---

## 9. 제외하는 에셋

이번 시안 기준으로 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `ui_frame_inventory_reward_card_pending_rough_default.svg` | 발급 중 카드가 시안에 없음 |
| `ui_frame_inventory_reward_card_expired_rough_default.svg` | 만료 카드가 시안에 없음 |
| `ui_frame_inventory_status_badge_pending_rough_default.svg` | 발급 중 배지가 시안에 없음 |
| `ui_frame_inventory_status_badge_expired_rough_default.svg` | 만료 배지가 시안에 없음 |
| `ui_frame_inventory_empty_card_rough_default.svg` | 빈 상태가 시안에 없음 |
| `img_inventory_empty_box_rough_default.svg` | 빈 상태가 시안에 없음 |
| `ui_frame_inventory_empty_cta_black_rough_default.svg` | 빈 상태 CTA가 시안에 없음 |

단, 추후 빈 상태 화면을 별도로 디자인하면 위 에셋은 추가할 수 있다.

---

## 10. 저장 경로

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

      inventory/
        icon_inventory_title_box_rough_default_32.svg
        icon_inventory_error_rough_default_24.svg
        icon_inventory_retry_red_rough_default_20.svg
        icon_inventory_used_check_rough_default_20.svg

      action/
        icon_action_arrow_right_rough_default_20.svg

    images/
      inventory/
        img_inventory_reward_fallback_rough_default.svg

    ui/
      frames/
        inventory/
          ui_frame_inventory_filter_active_rough_default.svg
          ui_frame_inventory_filter_inactive_rough_default.svg
          ui_frame_inventory_reward_card_available_rough_default.svg
          ui_frame_inventory_reward_card_failed_rough_default.svg
          ui_frame_inventory_reward_card_used_rough_default.svg
          ui_frame_inventory_reward_image_box_rough_default.svg
          ui_frame_inventory_status_badge_available_rough_default.svg
          ui_frame_inventory_status_badge_failed_rough_default.svg
          ui_frame_inventory_status_badge_used_rough_default.svg

        global/
          ui_frame_bottom_tab_bar_rough_default.svg
```

---

## 11. 코드 상수

```ts
export const INVENTORY_ASSETS = {
  // Header
  backIcon: '/assets/icons/nav/icon_nav_back_simple_rough_default_24.svg',
  notificationIcon: '/assets/icons/gnb/icon_gnb_notification_rough_default_24.svg',
  helpIcon: '/assets/icons/gnb/icon_gnb_help_rough_default_24.svg',
  settingIcon: '/assets/icons/gnb/icon_gnb_setting_rough_default_24.svg',

  // Title
  titleBoxIcon: '/assets/icons/inventory/icon_inventory_title_box_rough_default_32.svg',

  // Filters
  filterActiveFrame: '/assets/ui/frames/inventory/ui_frame_inventory_filter_active_rough_default.svg',
  filterInactiveFrame: '/assets/ui/frames/inventory/ui_frame_inventory_filter_inactive_rough_default.svg',

  // Reward Cards
  rewardCardAvailableFrame: '/assets/ui/frames/inventory/ui_frame_inventory_reward_card_available_rough_default.svg',
  rewardCardFailedFrame: '/assets/ui/frames/inventory/ui_frame_inventory_reward_card_failed_rough_default.svg',
  rewardCardUsedFrame: '/assets/ui/frames/inventory/ui_frame_inventory_reward_card_used_rough_default.svg',
  rewardImageBoxFrame: '/assets/ui/frames/inventory/ui_frame_inventory_reward_image_box_rough_default.svg',

  // Badges
  statusBadgeAvailableFrame: '/assets/ui/frames/inventory/ui_frame_inventory_status_badge_available_rough_default.svg',
  statusBadgeFailedFrame: '/assets/ui/frames/inventory/ui_frame_inventory_status_badge_failed_rough_default.svg',
  statusBadgeUsedFrame: '/assets/ui/frames/inventory/ui_frame_inventory_status_badge_used_rough_default.svg',

  // Icons / Images
  rewardFallbackImage: '/assets/images/inventory/img_inventory_reward_fallback_rough_default.svg',
  errorIcon: '/assets/icons/inventory/icon_inventory_error_rough_default_24.svg',
  retryIcon: '/assets/icons/inventory/icon_inventory_retry_red_rough_default_20.svg',
  usedCheckIcon: '/assets/icons/inventory/icon_inventory_used_check_rough_default_20.svg',
  arrowRightIcon: '/assets/icons/action/icon_action_arrow_right_rough_default_20.svg',

  // Bottom Nav
  bottomTabBarFrame: '/assets/ui/frames/global/ui_frame_bottom_tab_bar_rough_default.svg',
} as const;
```

---

## 12. 데이터 구조

```ts
export type InventoryFilter = 'all' | 'available' | 'used' | 'expired';

export type InventoryItemStatus =
  | 'available'
  | 'failed'
  | 'used';

export interface InventoryItem {
  id: string;
  productName: string;
  brandName?: string;
  productImageUrl?: string;
  status: InventoryItemStatus;
  expiredAtLabel?: string;
  usedAtLabel?: string;
  errorMessage?: string;
}
```

---

## 13. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 뒤로가기 | `/profile` 또는 이전 화면 |
| 필터 선택 | 목록 상태 필터링 |
| 사용 가능 카드 클릭 | 보상 상세 팝업 열기 |
| 발급 실패 카드 클릭 | 보상 상세 팝업 열기 |
| 사용 완료 카드 클릭 | 읽기 전용 보상 상세 팝업 열기 |
| 재시도 아이콘 클릭 | 상세 팝업 또는 재시도 안내 |
| Map 탭 | `/map` |
| Hunt 탭 | `/hunt` 또는 사냥 진입 조건 확인 |
| Ranking 탭 | `/fame` |
| My Info 탭 | 현재 화면 유지 또는 `/profile` |

---

## 14. QA 체크리스트

- [ ] 화면 구조가 디자인 시안 순서와 일치한다.
- [ ] 필터는 활성/비활성 프레임을 사용한다.
- [ ] 사용 가능 카드, 발급 실패 카드, 사용 완료 카드가 각각 다른 프레임을 사용한다.
- [ ] 상품 이미지 영역은 `ui_frame_inventory_reward_image_box_rough_default.svg`를 사용한다.
- [ ] 상품 이미지가 없으면 `img_inventory_reward_fallback_rough_default.svg`를 사용한다.
- [ ] 상태 배지는 상태별 프레임을 사용한다.
- [ ] 발급 실패 카드에는 실패 아이콘과 재시도 아이콘을 사용한다.
- [ ] 사용 완료 카드에는 체크 아이콘을 사용한다.
- [ ] 쿠폰 코드와 바코드는 목록 화면에 표시하지 않는다.
- [ ] 쿠폰 받기 버튼은 목록 화면에 표시하지 않는다.
- [ ] 모든 텍스트는 이미지가 아니라 코드 텍스트다.
