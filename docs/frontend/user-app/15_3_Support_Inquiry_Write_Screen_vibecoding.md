# 15_3. 문의 작성 화면 정의서
## 바이브코딩 기준 최종 에셋 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 15_3. 문의 작성 화면 정의서 |
| 파일명 | `15_3_Support_Inquiry_Write_Screen_vibecoding.md` |
| 화면명 | 문의 작성 |
| 화면 ID | `15_3_Support_Inquiry_Write_Screen` |
| 서비스 | 캐치캐쉬 |
| 기준 화면 | 문의 작성 화면 시안 |
| 작성 목적 | 바이브코딩 구현을 위한 화면 구조, 라우트, 에셋명, 상태, 인터랙션 정의 |
| 호출 위치 | `/support` 문의 내역 리스트 화면의 하단 `문의하기` 버튼 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |
| 라우트 | `/support/new` |
| 이전 화면 | `/support` 문의 내역 리스트 |
| 등록 성공 후 이동 | `/support` 문의 내역 리스트 |
| 상세 확인 화면 | `/support/[inquiryId]` |

---

## 1-1. 변경된 문의 플로우 기준

기존에는 내프로필의 `문의하기` 버튼을 누르면 문의 작성 화면으로 바로 이동하는 구조였지만,
현재 플로우에서는 문의 내역 리스트를 먼저 거친다.

```txt
/profile
→ 문의하기 버튼
→ /support 문의 내역 리스트
→ 하단 문의하기 버튼
→ /support/new 문의 작성
→ 문의 등록
→ /support 문의 내역 리스트
```

문의 내역 카드를 누르면 상세 화면으로 이동한다.

```txt
/support 문의 내역 리스트
→ 문의 카드 클릭
→ /support/[inquiryId] 문의 상세
```

본 문서는 위 플로우 중 `/support/new` 문의 작성 화면만 정의한다.

---

## 2. 화면 개요

문의 작성 화면은 사용자가 서비스 이용 중 발생한 문제를 문의글 형태로 등록하는 화면이다.

이 화면은 문의 내역 리스트나 실시간 채팅 화면이 아니다.  
카테고리, 제목, 내용을 입력한 뒤 문의를 등록하는 **문의글 등록 폼 화면**이다. 문의 내역 리스트는 `/support`, 문의 상세는 `/support/[inquiryId]`에서 처리한다.

```txt
문의 카테고리 선택
→ 한 줄 요약 입력
→ 핵심 내용 입력
→ 안내 문구 확인
→ 문의 등록
```

---

## 3. 최종 화면 구성

바이브코딩 기준 화면 구성은 아래 순서로 확정한다.

```txt
상단 헤더
→ 안내 타이틀 영역
→ 카테고리 선택 필드
→ 한 줄 요약 입력 필드
→ 핵심 요약 textarea
→ 안내 카드
→ 문의 등록 버튼
```

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | 상단 헤더 | 뒤로가기, 화면 타이틀 |
| 2 | 안내 타이틀 영역 | 화면 안내 문구 |
| 3 | 카테고리 선택 | 문의 유형 선택 |
| 4 | 한 줄 요약 | 제목 입력 |
| 5 | 핵심 요약 | 문의 내용 입력 |
| 6 | 안내 카드 | 작성 안내 문구 |
| 7 | 문의 등록 버튼 | 문의 제출 CTA |

---

## 4. 최종 에셋 전체 목록

이번 화면에서 사용하는 에셋은 아래 8개로 확정한다.

| 구분 | 화면 요소 | 에셋명 | 비고 |
|---|---|---|---|
| 아이콘 | 뒤로가기 아이콘 | `icon_nav_back_simple_rough_default_24.svg` | 헤더 좌측 |
| 프레임 | 카테고리 선택 프레임 | `ui_frame_support_category_select_rough_default.svg` | 드롭다운 영역 |
| 아이콘 | 드롭다운 화살표 | `icon_action_chevron_down_rough_default_20.svg` | 카테고리 우측 |
| 프레임 | 제목 입력 프레임 | `ui_frame_support_title_input_rough_default.svg` | 한 줄 요약 입력 |
| 프레임 | 내용 입력 프레임 | `ui_frame_support_content_textarea_rough_default.svg` | 핵심 요약 textarea |
| 프레임 | 안내 카드 프레임 | `ui_frame_support_related_info_card_dashed_rough_default.svg` | 점선 안내 카드 |
| 아이콘 | 경고/안내 아이콘 | `icon_support_warning_rough_default_16.svg` | 안내 카드 좌측 |
| 프레임 | 문의 등록 버튼 프레임 | `ui_frame_support_submit_button_black_rough_default.svg` | 검정 CTA |

---

# 5. 영역별 상세 정의

---

## 5.1 상단 헤더

### 화면 구성

```txt
좌측: 뒤로가기 아이콘
중앙: 뭐가 문제데?
우측: 없음
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 뒤로가기 | `icon_nav_back_simple_rough_default_24.svg` | 이전 화면으로 돌아가기 |

### 코드/CSS 처리

| 요소 | 처리 방식 |
|---|---|
| 헤더 타이틀 `뭐가 문제데?` | 코드 텍스트 |
| 헤더 하단 라인 | CSS border-bottom |
| 헤더 배경 | CSS background |
| 아이콘 클릭 영역 | HTML button |

---

## 5.2 안내 타이틀 영역

### 화면 구성

```txt
무슨 일이야?
일단 써봐. 바쁘니까 짧게.
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 타이틀 | 코드 텍스트 |
| 보조 문구 | 코드 텍스트 |
| 별도 프레임 | 없음 |
| 배치 | CSS margin / typography |

---

## 5.3 카테고리 선택 필드

### 화면 구성

```txt
라벨: 대충 골라봐
필드 값: 이용 문의
우측: 드롭다운 화살표
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 카테고리 선택 프레임 | `ui_frame_support_category_select_rough_default.svg` | 드롭다운 선택 박스 |
| 드롭다운 화살표 | `icon_action_chevron_down_rough_default_20.svg` | 우측 화살표 |

### 카테고리 목록

```txt
이용 문의
쿠폰 문의
보상 문의
계정 문의
오류 제보
개선 문의
기타 문의
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 라벨 `대충 골라봐` | 코드 텍스트 |
| 선택 값 `이용 문의` | 코드 텍스트 |
| 드롭다운 열림/닫힘 | React state |
| 실제 선택 UI | select, bottom sheet, dropdown 중 구현 선택 |

---

## 5.4 한 줄 요약 입력 필드

### 화면 구성

```txt
라벨: 한 줄 요약
placeholder: 한 줄로 요약해
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 제목 입력 프레임 | `ui_frame_support_title_input_rough_default.svg` | 한 줄 입력창 프레임 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 라벨 | 코드 텍스트 |
| placeholder | 코드 텍스트 |
| 입력값 | form state |
| 에러 상태 | CSS border-color / message |
| 글자 수 제한 | 코드 검증 |

### 유효성 기준

```txt
2자 이상 50자 이하
```

---

## 5.5 핵심 요약 textarea

### 화면 구성

```txt
라벨: 핵심 요약
placeholder: 길게 쓰면 안 읽는다. 핵심만 써.
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 내용 입력 프레임 | `ui_frame_support_content_textarea_rough_default.svg` | 큰 textarea 프레임 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 라벨 | 코드 텍스트 |
| placeholder | 코드 텍스트 |
| 입력값 | form state |
| 에러 상태 | CSS border-color / message |
| 글자 수 제한 | 코드 검증 |

### 유효성 기준

```txt
10자 이상 1000자 이하
```

---

## 5.6 안내 카드

### 화면 구성

```txt
똑바로 읽어
쿠폰 안 들어왔으면 언제 뭐 샀는지 똑바로 써라.
그래야 빨리 확인한다.
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 안내 카드 프레임 | `ui_frame_support_related_info_card_dashed_rough_default.svg` | 점선 rough 안내 카드 |
| 안내 아이콘 | `icon_support_warning_rough_default_16.svg` | 안내/경고 아이콘 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 안내 카드 외곽 | SVG 프레임 |
| 아이콘 | SVG 아이콘 |
| 안내 문구 | 코드 텍스트 |

---

## 5.7 문의 등록 버튼

### 화면 구성

```txt
던져놓기
```

### 사용 에셋

| 요소 | 에셋명 | 설명 |
|---|---|---|
| 문의 등록 버튼 프레임 | `ui_frame_support_submit_button_black_rough_default.svg` | 검정 CTA 버튼 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 버튼 프레임 | SVG 에셋 |
| 버튼 문구 | 코드 텍스트 |
| 클릭 영역 | HTML button |
| disabled 상태 | CSS opacity / disabled |
| 제출 로딩 상태 | CSS / 코드 텍스트 |

### 동작

| 액션 | 동작 |
|---|---|
| 버튼 클릭 | 문의 등록 처리 |
| 등록 성공 | `/support` 문의 내역 리스트로 이동 또는 완료 토스트 후 `/support` 이동 |
| 등록 실패 | 에러 문구 표시 |

---

# 6. 프레임 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 카테고리 선택 프레임 | `ui_frame_support_category_select_rough_default.svg` |
| 제목 입력 프레임 | `ui_frame_support_title_input_rough_default.svg` |
| 내용 입력 프레임 | `ui_frame_support_content_textarea_rough_default.svg` |
| 안내 카드 프레임 | `ui_frame_support_related_info_card_dashed_rough_default.svg` |
| 문의 등록 버튼 프레임 | `ui_frame_support_submit_button_black_rough_default.svg` |

---

# 7. 아이콘 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 뒤로가기 아이콘 | `icon_nav_back_simple_rough_default_24.svg` |
| 드롭다운 화살표 | `icon_action_chevron_down_rough_default_20.svg` |
| 안내/경고 아이콘 | `icon_support_warning_rough_default_16.svg` |

---

## 8. 코드로 처리하는 요소

아래 요소는 이미지에 넣지 않는다.

| 요소 | 처리 |
|---|---|
| `뭐가 문제데?` | 코드 텍스트 |
| `무슨 일이야?` | 코드 텍스트 |
| `일단 써봐. 바쁘니까 짧게.` | 코드 텍스트 |
| `대충 골라봐` | 코드 텍스트 |
| `이용 문의` | 코드 텍스트 |
| `한 줄 요약` | 코드 텍스트 |
| `한 줄로 요약해` | placeholder |
| `핵심 요약` | 코드 텍스트 |
| `길게 쓰면 안 읽는다. 핵심만 써.` | placeholder |
| 안내 카드 문구 | 코드 텍스트 |
| `던져놓기` | 코드 텍스트 |
| 입력값 | form state |
| 에러 메시지 | 코드 텍스트 |
| 버튼 disabled 상태 | CSS |
| 헤더 라인 | CSS |
| 화면 배경 | CSS |

---

## 9. 제외하는 에셋

이번 화면 기준으로 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `ui_frame_support_title_input_error_rough_default.svg` | 에러 상태는 CSS로 처리 |
| `ui_frame_support_content_textarea_error_rough_default.svg` | 에러 상태는 CSS로 처리 |
| `ui_frame_support_submit_button_disabled_rough_default.svg` | disabled 상태는 CSS opacity로 처리 |
| `ui_frame_support_success_popup_rough_default.svg` | 현재 시안에 완료 팝업 없음 |
| `ui_frame_support_success_button_black_rough_default.svg` | 현재 시안에 완료 팝업 없음 |
| `icon_support_success_check_rough_default_32.svg` | 현재 시안에 완료 팝업 없음 |
| `icon_support_related_info_rough_default_20.svg` | 현재 시안은 경고/안내 아이콘 사용 |
| `ui_frame_support_category_option_rough_default.svg` | 옵션 목록은 CSS/dropdown으로 처리 |

---

## 10. 저장 경로

```txt
public/
  assets/
    icons/
      nav/
        icon_nav_back_simple_rough_default_24.svg

      action/
        icon_action_chevron_down_rough_default_20.svg

      support/
        icon_support_warning_rough_default_16.svg

    ui/
      frames/
        support/
          ui_frame_support_category_select_rough_default.svg
          ui_frame_support_title_input_rough_default.svg
          ui_frame_support_content_textarea_rough_default.svg
          ui_frame_support_related_info_card_dashed_rough_default.svg
          ui_frame_support_submit_button_black_rough_default.svg
```

---

## 11. 코드 상수

```ts
export const SUPPORT_ASSETS = {
  backIcon: '/assets/icons/nav/icon_nav_back_simple_rough_default_24.svg',
  chevronDownIcon: '/assets/icons/action/icon_action_chevron_down_rough_default_20.svg',
  warningIcon: '/assets/icons/support/icon_support_warning_rough_default_16.svg',

  categorySelectFrame: '/assets/ui/frames/support/ui_frame_support_category_select_rough_default.svg',
  titleInputFrame: '/assets/ui/frames/support/ui_frame_support_title_input_rough_default.svg',
  contentTextareaFrame: '/assets/ui/frames/support/ui_frame_support_content_textarea_rough_default.svg',
  relatedInfoCardFrame: '/assets/ui/frames/support/ui_frame_support_related_info_card_dashed_rough_default.svg',
  submitButtonFrame: '/assets/ui/frames/support/ui_frame_support_submit_button_black_rough_default.svg',
} as const;
```

---

## 12. 데이터 구조

```ts
export type SupportCategory =
  | 'general'
  | 'coupon'
  | 'reward'
  | 'account'
  | 'bug'
  | 'improvement'
  | 'etc';

export interface SupportInquiryForm {
  category: SupportCategory;
  title: string;
  content: string;
  relatedInventoryItemId?: string;
  relatedRewardId?: string;
}
```

---

## 13. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 뒤로가기 | `/support` 문의 내역 리스트로 이동 |
| 카테고리 클릭 | 드롭다운 또는 바텀시트 열기 |
| 카테고리 선택 | 선택값 반영 |
| 제목 입력 | form state 업데이트 |
| 내용 입력 | form state 업데이트 |
| 문의 등록 클릭 | 문의 등록 처리. 프론트 1차 구현에서는 Mock 처리, 백엔드 연동 단계에서는 Supabase 저장으로 교체 |
| 등록 성공 | 완료 토스트 후 `/support` 문의 내역 리스트로 이동 |
| 등록 실패 | 오류 문구 노출 |

---

## 14. 구현 범위 정리

### 본 화면에서 구현하는 것

- `/support/new` 라우트
- 문의 카테고리 선택
- 제목 입력
- 내용 입력
- 안내 카드
- 문의 등록 버튼
- 등록 성공 후 `/support` 이동

### 본 화면에서 구현하지 않는 것

- 문의 내역 리스트
- 문의 상세
- 관리자 답변 표시
- 답변 상태 배지
- 쿠폰 코드 또는 바코드 표시
- 첨부파일 업로드
- 실시간 채팅

---

## 15. QA 체크리스트

- [ ] 카테고리 선택 필드는 `ui_frame_support_category_select_rough_default.svg`를 사용한다.
- [ ] 제목 입력은 `ui_frame_support_title_input_rough_default.svg`를 사용한다.
- [ ] 내용 입력은 `ui_frame_support_content_textarea_rough_default.svg`를 사용한다.
- [ ] 안내 카드는 `ui_frame_support_related_info_card_dashed_rough_default.svg`를 사용한다.
- [ ] 문의 등록 버튼은 `ui_frame_support_submit_button_black_rough_default.svg`를 사용한다.
- [ ] 뒤로가기는 `icon_nav_back_simple_rough_default_24.svg`를 사용한다.
- [ ] 카테고리 화살표는 `icon_action_chevron_down_rough_default_20.svg`를 사용한다.
- [ ] 안내 아이콘은 `icon_support_warning_rough_default_16.svg`를 사용한다.
- [ ] 모든 텍스트는 이미지가 아니라 코드 텍스트다.
- [ ] 쿠폰 코드와 바코드는 이 화면에 표시하지 않는다.
- [ ] 첨부파일 업로드는 넣지 않는다.
