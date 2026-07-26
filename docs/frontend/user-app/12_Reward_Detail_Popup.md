# 12. 보상 상세 팝업 화면 정의서
## 쿠폰 상세 모달 / 디자인 시안 기준 최종 에셋 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 12. 보상 상세 팝업 화면 정의서 |
| 파일명 | `12_Reward_Detail_Popup_v2_design_based.md` |
| 화면명 | 보상 상세 팝업 / 쿠폰 상세 모달 |
| 화면 ID | `12_Reward_Detail_Popup` |
| 서비스 | 캐치캐쉬 |
| 기준 디자인 | Stitch AI 쿠폰 상세 팝업 Grug 시안 |
| 작성 목적 | 실제 디자인 시안 기준으로 화면 구성, 에셋명, 코드 구현 요소를 명확히 정리 |
| 호출 위치 | `11_Inventory_Screen` 보상 카드 클릭 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |

---

## 2. 화면 개요

보상 상세 팝업은 `나의 보관함` 화면에서 쿠폰 카드를 눌렀을 때 화면 중앙에 뜨는 모달 팝업이다.

이번 디자인 시안은 **쿠폰 발급 완료 / 사용 가능 상태**를 기준으로 한다.

이 팝업에서는 사용자가 실제 매장에서 사용할 수 있는 쿠폰 정보를 확인할 수 있다.

```txt
상품명
바코드 영역
쿠폰 번호
복사 버튼
보상 id
유효기간
사용 완료로 표시 버튼
닫기 버튼
```

---

## 3. 현재 시안 기준 상태

이번 시안에서 다루는 상태는 아래 하나로 확정한다.

| 상태 | 설명 |
|---|---|
| `issued` | 쿠폰 코드와 바코드가 발급되어 사용 가능한 상태 |

### 이번 시안에서 제외하는 상태

| 상태 | 제외 이유 |
|---|---|
| `ready` | 쿠폰 받기 전 상태 UI가 시안에 없음 |
| `failed` | 발급 실패 UI가 시안에 없음 |
| `used` | 사용 완료 UI가 시안에 없음 |
| `expired` | 만료 UI가 시안에 없음 |

추후 상태별 팝업을 추가 디자인할 경우 별도 버전으로 확장한다.

---

## 4. 최종 화면 구성

디자인 시안 기준 화면 구성은 아래 순서로 확정한다.

```txt
딤드 배경
→ 팝업 전체 프레임
→ 닫기 버튼
→ 상품명
→ 바코드 영역
→ 쿠폰 번호
→ 복사 버튼
→ 하단 정보 박스
→ 사용 완료로 표시 버튼
→ 닫기 버튼
```

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | 딤드 배경 | 팝업 뒤 어두운 overlay |
| 2 | 팝업 전체 프레임 | 흰색 세로 모달 프레임 |
| 3 | 닫기 아이콘 | 우측 상단 X 버튼 |
| 4 | 상품명 | 쿠폰 상품명 |
| 5 | 바코드 박스 | 바코드와 쿠폰 번호가 들어가는 영역 |
| 6 | 복사 버튼 | 쿠폰 번호 복사 |
| 7 | 하단 정보 박스 | 보상 id, 유효기간 |
| 8 | 검정 CTA | 사용 완료로 표시 |
| 9 | 흰색 CTA | 닫기 |

---

## 5. 최종 에셋 전체 목록

이번 화면에서 사용하는 에셋은 아래 목록으로 확정한다.

| 구분 | 화면 요소 | 에셋명 | 비고 |
|---|---|---|---|
| 프레임 | 팝업 전체 배경 프레임 | `ui_frame_reward_detail_modal_rough_default.svg` | 흰색 세로 모달 |
| 아이콘 | 닫기 아이콘 | `icon_action_close_circle_rough_default_24.svg` | 우측 상단 X |
| 프레임 | 바코드 영역 프레임 | `ui_frame_reward_detail_barcode_box_rough_default.svg` | 바코드/쿠폰 번호 영역 |
| 프레임 | 복사 버튼 프레임 | `ui_frame_reward_detail_copy_button_rough_default.svg` | 쿠폰 번호 복사 버튼 |
| 프레임 | 하단 정보 박스 | `ui_frame_reward_detail_footer_info_box_rough_default.svg` | 보상 id / 유효기간 |
| 프레임 | 검정 1차 버튼 | `ui_frame_reward_detail_button_primary_black_rough_default.svg` | 사용 완료로 표시 |
| 프레임 | 흰색 2차 버튼 | `ui_frame_reward_detail_button_secondary_white_rough_default.svg` | 닫기 |

---

# 6. 영역별 상세 정의

---

## 6.1 딤드 배경

### 화면 구성

```txt
팝업 뒤 전체 화면에 어두운 반투명 배경 표시
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 딤드 배경 | CSS overlay |
| 배경 클릭 | 팝업 닫기 여부는 정책에 따라 결정 |
| 에셋 사용 | 없음 |

딤드 배경은 에셋으로 만들지 않는다.

---

## 6.2 팝업 전체 배경 프레임

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_modal_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 화면 중앙 모달 전체 |
| 설명 | 흰색 세로형 rough 모달 프레임 |

### 디자인 기준

```txt
흰색 배경
둥근 모서리
손그림 느낌의 두꺼운 검정 외곽선
모바일 화면 중앙 정렬
화면 폭 기준 약 86~90%
```

---

## 6.3 닫기 아이콘

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_action_close_circle_rough_default_24.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 팝업 우측 상단 |
| 설명 | 원형 X 닫기 아이콘 |
| 텍스트 포함 여부 | 없음 |

### 동작

| 액션 | 동작 |
|---|---|
| 닫기 아이콘 클릭 | 팝업 닫기 |

---

## 6.4 상품명 영역

### 화면 구성

```txt
스타벅스 아메리카노
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 상품명 | 코드 텍스트 |
| 폰트 크기/굵기 | CSS |
| 에셋 사용 | 없음 |

상품명은 이미지에 포함하지 않는다.

---

## 6.5 바코드 영역

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_barcode_box_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 상품명 아래 큰 박스 |
| 설명 | 바코드, 쿠폰 번호, 복사 버튼이 들어가는 영역 |

### 내부 구성

```txt
바코드 렌더링 영역
쿠폰 번호
복사 버튼
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 바코드 | 실제 쿠폰 데이터 기반 렌더링 |
| 쿠폰 번호 | 코드 텍스트 |
| 복사 버튼 | HTML button |
| 바코드 박스 외곽 | SVG 프레임 |

중요:

```txt
바코드 자체는 이미지 에셋이 아니다.
실제 쿠폰 데이터로 렌더링한다.
```

---

## 6.6 복사 버튼

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_copy_button_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 쿠폰 번호 우측 |
| 표시 문구 | `복사` |
| 텍스트 구현 | 코드 텍스트 |
| 설명 | 쿠폰 번호 복사 버튼 프레임 |

### 동작

| 액션 | 동작 |
|---|---|
| 복사 버튼 클릭 | 쿠폰 번호 클립보드 복사 |

---

## 6.7 하단 정보 박스

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_footer_info_box_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 바코드 영역 아래 |
| 설명 | 보상 id와 유효기간 정보를 보여주는 정보 박스 |

### 표시 정보

```txt
보상 id       #CC-8829-X
유효기간      5일 남음
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 보상 id 라벨 | 코드 텍스트 |
| 보상 id 값 | 코드 텍스트 |
| 유효기간 라벨 | 코드 텍스트 |
| 유효기간 값 | 코드 텍스트 |
| 빨간 강조 텍스트 | CSS color |

---

## 6.8 사용 완료로 표시 버튼

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_button_primary_black_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 하단 정보 박스 아래 |
| 표시 문구 | `사용 완료로 표시` |
| 텍스트 구현 | 코드 텍스트 |
| 설명 | 쿠폰을 사용 완료 상태로 변경하는 1차 CTA 프레임 |

### 동작

| 액션 | 동작 |
|---|---|
| 버튼 클릭 | 사용 완료 확인 팝업 또는 confirm 표시 |
| 확인 | `used` 상태로 변경 |
| 취소 | 팝업 유지 |

중요:

```txt
사용 완료로 표시 버튼을 누르자마자 바로 상태 변경하지 않는다.
반드시 확인 절차를 거친다.
```

---

## 6.9 닫기 버튼

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_reward_detail_button_secondary_white_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 팝업 최하단 |
| 표시 문구 | `닫기` |
| 텍스트 구현 | 코드 텍스트 |
| 설명 | 팝업을 닫는 2차 CTA 프레임 |

### 동작

| 액션 | 동작 |
|---|---|
| 닫기 클릭 | 팝업 닫기 |

---

# 7. 프레임 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 팝업 전체 프레임 | `ui_frame_reward_detail_modal_rough_default.svg` |
| 바코드 영역 프레임 | `ui_frame_reward_detail_barcode_box_rough_default.svg` |
| 복사 버튼 프레임 | `ui_frame_reward_detail_copy_button_rough_default.svg` |
| 하단 정보 박스 | `ui_frame_reward_detail_footer_info_box_rough_default.svg` |
| 검정 1차 버튼 | `ui_frame_reward_detail_button_primary_black_rough_default.svg` |
| 흰색 2차 버튼 | `ui_frame_reward_detail_button_secondary_white_rough_default.svg` |

---

# 8. 아이콘 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 닫기 아이콘 | `icon_action_close_circle_rough_default_24.svg` |

---

## 9. 코드로 처리하는 요소

아래 요소는 이미지에 넣지 않는다.

| 요소 | 처리 |
|---|---|
| 딤드 배경 | CSS overlay |
| 상품명 | 코드 텍스트 |
| 바코드 | 실제 쿠폰 데이터 기반 렌더링 |
| 쿠폰 번호 | 코드 텍스트 |
| `복사` 문구 | 코드 텍스트 |
| 보상 id 라벨/값 | 코드 텍스트 |
| 유효기간 라벨/값 | 코드 텍스트 |
| `사용 완료로 표시` | 코드 텍스트 |
| `닫기` | 코드 텍스트 |
| 버튼 클릭 영역 | HTML button |
| 모달 열림/닫힘 | React state |
| 사용 완료 확인 | confirm modal 또는 상태 팝업 |

---

## 10. 제외하는 에셋

이번 시안 기준으로 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `ui_frame_reward_detail_status_badge_ready_rough_default.svg` | 시안에 상태 배지 없음 |
| `ui_frame_reward_detail_status_badge_issued_rough_default.svg` | 시안에 상태 배지 없음 |
| `ui_frame_reward_detail_status_badge_failed_rough_default.svg` | 실패 상태 시안 아님 |
| `ui_frame_reward_detail_status_badge_used_rough_default.svg` | 사용 완료 상태 시안 아님 |
| `ui_frame_reward_detail_status_badge_expired_rough_default.svg` | 만료 상태 시안 아님 |
| `ui_frame_reward_detail_notice_card_rough_default.svg` | 안내 카드 없음 |
| `ui_frame_reward_detail_error_card_rough_default.svg` | 실패 카드 없음 |
| `ui_frame_reward_detail_coupon_code_box_rough_default.svg` | 쿠폰 코드는 바코드 박스 안에 포함 |
| `ui_frame_reward_detail_used_stamp_rough_default.svg` | 사용 완료 스탬프 없음 |
| `ui_frame_reward_detail_expired_stamp_rough_default.svg` | 만료 스탬프 없음 |
| `icon_reward_detail_error_red_rough_default_32.svg` | 실패 상태 아님 |
| `icon_reward_detail_used_check_rough_default_32.svg` | 사용 완료 상태 아님 |
| `icon_loading_spinner_rough_default_24.svg` | 로딩 상태 시안 없음 |

---

## 11. 저장 경로

```txt
public/
  assets/
    icons/
      action/
        icon_action_close_circle_rough_default_24.svg

    ui/
      frames/
        reward-detail/
          ui_frame_reward_detail_modal_rough_default.svg
          ui_frame_reward_detail_barcode_box_rough_default.svg
          ui_frame_reward_detail_copy_button_rough_default.svg
          ui_frame_reward_detail_footer_info_box_rough_default.svg
          ui_frame_reward_detail_button_primary_black_rough_default.svg
          ui_frame_reward_detail_button_secondary_white_rough_default.svg
```

---

## 12. 코드 상수

```ts
export const REWARD_DETAIL_ASSETS = {
  modalFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_modal_rough_default.svg',
  closeIcon: '/assets/icons/action/icon_action_close_circle_rough_default_24.svg',

  barcodeBoxFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_barcode_box_rough_default.svg',
  copyButtonFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_copy_button_rough_default.svg',
  footerInfoBoxFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_footer_info_box_rough_default.svg',

  primaryButtonFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_button_primary_black_rough_default.svg',
  secondaryButtonFrame: '/assets/ui/frames/reward-detail/ui_frame_reward_detail_button_secondary_white_rough_default.svg',
} as const;
```

---

## 13. 데이터 구조

```ts
export interface RewardDetailIssued {
  id: string;
  productName: string;
  rewardId: string;
  couponCode: string;
  barcodeValue: string;
  expiresAtLabel: string;
  daysLeftLabel: string;
  status: 'issued';
}
```

---

## 14. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 보상 카드 클릭 | 보상 상세 팝업 열기 |
| X 아이콘 클릭 | 팝업 닫기 |
| 복사 클릭 | 쿠폰 번호 클립보드 복사 |
| 사용 완료로 표시 클릭 | 사용 완료 확인 팝업 표시 |
| 사용 완료 확인 | 쿠폰 상태를 `used`로 변경 |
| 닫기 클릭 | 팝업 닫기 |
| 딤드 배경 클릭 | 정책에 따라 닫기 허용 또는 유지 |

---

## 15. QA 체크리스트

- [ ] 팝업 전체는 `ui_frame_reward_detail_modal_rough_default.svg`를 사용한다.
- [ ] 닫기 아이콘은 `icon_action_close_circle_rough_default_24.svg`를 사용한다.
- [ ] 바코드 영역은 `ui_frame_reward_detail_barcode_box_rough_default.svg`를 사용한다.
- [ ] 복사 버튼은 `ui_frame_reward_detail_copy_button_rough_default.svg`를 사용한다.
- [ ] 하단 정보 박스는 `ui_frame_reward_detail_footer_info_box_rough_default.svg`를 사용한다.
- [ ] 검정 버튼은 `ui_frame_reward_detail_button_primary_black_rough_default.svg`를 사용한다.
- [ ] 흰색 버튼은 `ui_frame_reward_detail_button_secondary_white_rough_default.svg`를 사용한다.
- [ ] 바코드는 실제 데이터로 렌더링한다.
- [ ] 쿠폰 번호와 보상 id는 코드 텍스트로 표시한다.
- [ ] 사용 완료로 표시 클릭 시 즉시 변경하지 않고 확인 절차를 거친다.
