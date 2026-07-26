# 08. 사냥 결과 화면 에셋 정의서
## 보기 편한 요약본

---

## 1. 이 화면에서 필요한 에셋 한눈에 보기

| 구분 | 요소 | 에셋명 | 사용 위치 |
|---|---|---|---|
| 공통 | 뒤로가기 아이콘 | `icon_nav_back_circle_rough_default_24.svg` | 상단 좌측 |
| 공통 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 화면 하단 |
| 공통 | 검정 1차 버튼 프레임 | `ui_frame_result_button_primary_black_rough_default.svg` | 메인 CTA |
| 공통 | 흰색 2차 버튼 프레임 | `ui_frame_result_button_secondary_white_rough_default.svg` | 보조 CTA |
| 공통 | HUNT LOG 카드 프레임 | `ui_frame_result_hunt_log_card_dashed_rough_default.svg` | 하단 기록 카드 |
| 성공 | 성공 배지 프레임 | `ui_frame_result_badge_success_rough_default.svg` | `건졌다` 배지 |
| 성공 | 성공 보상 카드 프레임 | `ui_frame_result_success_reward_card_rough_default.svg` | 보상 카드 |
| 성공 | 보상 이미지 박스 프레임 | `ui_frame_result_reward_image_box_rough_default.svg` | 상품 이미지 영역 |
| 성공 | 보상 fallback 이미지 | `img_result_reward_fallback_rough_default.svg` | 상품 이미지 없을 때 |
| 꽝 | 꽝 배지 프레임 | `ui_frame_result_badge_fail_rough_default.svg` | `꽝` 배지 |
| 꽝 | 꽝 결과 카드 프레임 | `ui_frame_result_fail_empty_card_rough_default.svg` | 꽝 카드 |
| 꽝 | 꽝/빈 상자 아이콘 | `icon_result_fail_empty_box_rough_default.svg` | 꽝 카드 내부 |

---

## 2. 성공 화면 에셋

### 2.1 성공 화면 구조

```txt
뒤로가기
→ 성공 배지
→ 성공 타이틀
→ 성공 보상 카드
→ 보관함으로 가기 버튼
→ 지도에서 더 찾기 버튼
→ HUNT LOG 카드
→ 하단 탭바
```

### 2.2 성공 화면 에셋 목록

| 순서 | 화면 요소 | 에셋명 | 텍스트 포함 여부 |
|---:|---|---|---|
| 1 | 뒤로가기 아이콘 | `icon_nav_back_circle_rough_default_24.svg` | 없음 |
| 2 | `건졌다` 배지 프레임 | `ui_frame_result_badge_success_rough_default.svg` | 텍스트는 코드 |
| 3 | 보상 카드 큰 프레임 | `ui_frame_result_success_reward_card_rough_default.svg` | 텍스트는 코드 |
| 4 | 상품 이미지 박스 | `ui_frame_result_reward_image_box_rough_default.svg` | 없음 |
| 5 | 상품 fallback 이미지 | `img_result_reward_fallback_rough_default.svg` | 없음 |
| 6 | 검정 버튼 프레임 | `ui_frame_result_button_primary_black_rough_default.svg` | 텍스트는 코드 |
| 7 | 흰색 버튼 프레임 | `ui_frame_result_button_secondary_white_rough_default.svg` | 텍스트는 코드 |
| 8 | HUNT LOG 카드 프레임 | `ui_frame_result_hunt_log_card_dashed_rough_default.svg` | 텍스트는 코드 |
| 9 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 텍스트는 코드 |

### 2.3 성공 화면 카피

| 요소 | 문구 |
|---|---|
| 배지 | `건졌다` |
| 타이틀 | `잘했네.` / `하나 건졌다.` |
| 설명 | `전리품은 보관함에 넣어뒀다.` |
| 상품명 예시 | `아메리카노 기프티콘` |
| 브랜드 예시 | `STARBUCKS` |
| 안내 문구 | `실물은 보관함에서 확인할 수 있습니다.` |
| 1차 버튼 | `보관함으로 가기` |
| 2차 버튼 | `지도에서 더 찾기` |

---

## 3. 꽝 화면 에셋

### 3.1 꽝 화면 구조

```txt
뒤로가기
→ 꽝 배지
→ 꽝 타이틀
→ 꽝 결과 카드
→ 지도에서 더 찾기 버튼
→ 문의하기 링크
→ HUNT LOG 카드
→ 하단 탭바
```

### 3.2 꽝 화면 에셋 목록

| 순서 | 화면 요소 | 에셋명 | 텍스트 포함 여부 |
|---:|---|---|---|
| 1 | 뒤로가기 아이콘 | `icon_nav_back_circle_rough_default_24.svg` | 없음 |
| 2 | `꽝` 배지 프레임 | `ui_frame_result_badge_fail_rough_default.svg` | 텍스트는 코드 |
| 3 | 꽝 카드 큰 프레임 | `ui_frame_result_fail_empty_card_rough_default.svg` | 텍스트는 코드 |
| 4 | 꽝/빈 상자 아이콘 | `icon_result_fail_empty_box_rough_default.svg` | 없음 |
| 5 | 검정 버튼 프레임 | `ui_frame_result_button_primary_black_rough_default.svg` | 텍스트는 코드 |
| 6 | HUNT LOG 카드 프레임 | `ui_frame_result_hunt_log_card_dashed_rough_default.svg` | 텍스트는 코드 |
| 7 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 텍스트는 코드 |

### 3.3 꽝 화면 카피

| 요소 | 문구 |
|---|---|
| 배지 | `꽝` |
| 타이틀 | `아쉽네. 빈 상자다.` |
| 설명 | `다른 상자나 뒤져봐.` |
| 꽝 카드 문구 | `상자 안이 텅 비었다.` / `아쉽네 ㅋ` |
| 1차 버튼 | `지도에서 더 찾기` |
| 텍스트 링크 | `문의하기` |

---

## 4. 공통 버튼 에셋

### 4.1 검정 1차 버튼

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_result_button_primary_black_rough_default.svg` |
| 성공 화면 문구 | `보관함으로 가기` |
| 꽝 화면 문구 | `지도에서 더 찾기` |
| 구현 | 프레임은 SVG, 텍스트는 코드 |
| 클릭 | 실제 `button` 또는 `Link` |

### 4.2 흰색 2차 버튼

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_result_button_secondary_white_rough_default.svg` |
| 성공 화면 문구 | `지도에서 더 찾기` |
| 꽝 화면 사용 여부 | 사용 안 함 |
| 구현 | 프레임은 SVG, 텍스트는 코드 |
| 클릭 | 실제 `button` 또는 `Link` |

### 4.3 문의하기

| 항목 | 내용 |
|---|---|
| 에셋명 | 없음 |
| 구현 | 텍스트 링크 |
| 사용 화면 | 꽝 화면 |
| 문구 | `문의하기` |

---

## 5. HUNT LOG 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_result_hunt_log_card_dashed_rough_default.svg` |
| 형태 | 점선 rough card |
| 사용 화면 | 성공 화면, 꽝 화면 |
| 텍스트 | 코드 텍스트 |
| 리스트 | 코드 배열 렌더링 |

### 성공 HUNT LOG 예시

```txt
HUNT LOG
- 보물 상자 접근
- 상자 열기 성공
- 보상 발견
```

### 꽝 HUNT LOG 예시

```txt
HUNT LOG
- 보물 상자 접근
- 상자 열기 시도
- 보상 없음
```

---

## 6. 하단 탭바 에셋

| 요소 | 에셋명 |
|---|---|
| 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` |
| 지도 기본 아이콘 | `icon_nav_map_rough_default_24.svg` |
| 지도 활성 아이콘 | `icon_nav_map_rough_active_24.svg` |
| 사냥하기 기본 아이콘 | `icon_nav_hunt_rough_default_24.svg` |
| 사냥하기 활성 아이콘 | `icon_nav_hunt_rough_active_24.svg` |
| 랭킹 기본 아이콘 | `icon_nav_rank_rough_default_24.svg` |
| 랭킹 활성 아이콘 | `icon_nav_rank_rough_active_24.svg` |
| 내정보 기본 아이콘 | `icon_nav_profile_rough_default_24.svg` |
| 내정보 활성 아이콘 | `icon_nav_profile_rough_active_24.svg` |

현재 시안 기준 활성 탭:

```txt
내정보
```

---

## 7. 저장 경로

```txt
public/
  assets/
    icons/
      nav/
        icon_nav_back_circle_rough_default_24.svg
        icon_nav_map_rough_default_24.svg
        icon_nav_map_rough_active_24.svg
        icon_nav_hunt_rough_default_24.svg
        icon_nav_hunt_rough_active_24.svg
        icon_nav_rank_rough_default_24.svg
        icon_nav_rank_rough_active_24.svg
        icon_nav_profile_rough_default_24.svg
        icon_nav_profile_rough_active_24.svg

      result/
        icon_result_fail_empty_box_rough_default.svg

    images/
      result/
        img_result_reward_fallback_rough_default.svg

    ui/
      frames/
        result/
          ui_frame_result_badge_success_rough_default.svg
          ui_frame_result_badge_fail_rough_default.svg
          ui_frame_result_success_reward_card_rough_default.svg
          ui_frame_result_reward_image_box_rough_default.svg
          ui_frame_result_fail_empty_card_rough_default.svg
          ui_frame_result_button_primary_black_rough_default.svg
          ui_frame_result_button_secondary_white_rough_default.svg
          ui_frame_result_hunt_log_card_dashed_rough_default.svg
          ui_frame_bottom_tab_bar_rough_default.svg
```

---

## 8. 코드 상수

```ts
export const HUNT_RESULT_ASSETS = {
  backIcon: '/assets/icons/nav/icon_nav_back_circle_rough_default_24.svg',

  successBadgeFrame: '/assets/ui/frames/result/ui_frame_result_badge_success_rough_default.svg',
  failBadgeFrame: '/assets/ui/frames/result/ui_frame_result_badge_fail_rough_default.svg',

  successRewardCardFrame: '/assets/ui/frames/result/ui_frame_result_success_reward_card_rough_default.svg',
  rewardImageBoxFrame: '/assets/ui/frames/result/ui_frame_result_reward_image_box_rough_default.svg',
  rewardFallbackImage: '/assets/images/result/img_result_reward_fallback_rough_default.svg',

  failEmptyCardFrame: '/assets/ui/frames/result/ui_frame_result_fail_empty_card_rough_default.svg',
  failEmptyBoxIcon: '/assets/icons/result/icon_result_fail_empty_box_rough_default.svg',

  primaryButtonFrame: '/assets/ui/frames/result/ui_frame_result_button_primary_black_rough_default.svg',
  secondaryButtonFrame: '/assets/ui/frames/result/ui_frame_result_button_secondary_white_rough_default.svg',

  huntLogCardFrame: '/assets/ui/frames/result/ui_frame_result_hunt_log_card_dashed_rough_default.svg',
  bottomTabBarFrame: '/assets/ui/frames/result/ui_frame_bottom_tab_bar_rough_default.svg',
} as const;
```

---

## 9. 구현 주의사항

```txt
쿠폰 코드는 절대 표시하지 않는다.
바코드는 절대 표시하지 않는다.
기프티쇼비즈 API는 이 화면에서 호출하지 않는다.
성공 화면은 보관함 수령권 안내만 한다.
실제 쿠폰 발급은 보관함 상세에서 처리한다.
```

---

## 10. 최종 체크리스트

- [ ] 성공 배지와 꽝 배지 에셋이 분리되어 있다.
- [ ] 성공 카드와 꽝 카드 에셋이 분리되어 있다.
- [ ] 상품 이미지 박스가 별도 프레임으로 정의되어 있다.
- [ ] 검정 버튼과 흰색 버튼 프레임이 분리되어 있다.
- [ ] HUNT LOG는 점선 프레임 에셋으로 정의되어 있다.
- [ ] 문의하기는 에셋이 아니라 텍스트 링크다.
- [ ] 하단 탭바는 전역 네비게이션 아이콘을 재사용한다.
- [ ] 모든 텍스트는 코드 텍스트다.
