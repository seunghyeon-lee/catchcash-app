# 14. 로그아웃 확인 팝업 화면 정의서
## 디자인 시안 기준 최종 에셋 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 14. 로그아웃 확인 팝업 화면 정의서 |
| 파일명 | `14_Logout_Confirm_Popup_v1_design_based.md` |
| 화면명 | 로그아웃 확인 팝업 |
| 화면 ID | `14_Logout_Confirm_Popup` |
| 서비스 | 캐치캐쉬 |
| 기준 디자인 | Stitch AI 로그아웃 팝업 Grug 시안 |
| 작성 목적 | 실제 디자인 시안 기준으로 화면 구성, 에셋명, 코드 구현 요소를 명확히 정리 |
| 호출 위치 | `10_My_Profile_Screen` 로그아웃 버튼 클릭 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |

---

## 2. 화면 개요

로그아웃 확인 팝업은 사용자가 내프로필 화면에서 `로그아웃` 버튼을 눌렀을 때 중앙에 표시되는 확인 모달이다.

사용자가 실수로 로그아웃하지 않도록 한 번 더 확인하는 역할을 한다.

```txt
내프로필 화면
→ 로그아웃 버튼 클릭
→ 로그아웃 확인 팝업 표시
→ 닫기 선택 시 팝업 닫기
→ 로그아웃 선택 시 세션 종료
```

---

## 3. 최종 화면 구성

디자인 시안 기준 화면 구성은 아래 순서로 확정한다.

```txt
Modal Overlay
→ 로그아웃 팝업 프레임
→ 닫기 아이콘
→ 로그아웃 경고 아이콘
→ 타이틀
→ 설명 문구
→ 로그아웃 버튼
→ 닫기 버튼
```

| 순서 | 영역 | 설명 |
|---:|---|---|
| 1 | Modal Overlay | 어두운 반투명 배경 |
| 2 | 팝업 프레임 | 흰색 중앙 모달 |
| 3 | 닫기 아이콘 | 우측 상단 X |
| 4 | 로그아웃 경고 아이콘 | 중앙 원형 로그아웃 아이콘 |
| 5 | 타이틀 | `진짜 나가게?` |
| 6 | 설명 | `다시 들어오려면 로그인해야 한다.` |
| 7 | 로그아웃 버튼 | 위험 액션 |
| 8 | 닫기 버튼 | 취소 액션 |

---

## 4. 최종 에셋 목록

이번 화면에서 사용하는 에셋은 아래 5개로 확정한다.

| 구분 | 화면 요소 | 에셋명 | 비고 |
|---|---|---|---|
| 프레임 | 로그아웃 팝업 프레임 | `ui_frame_logout_popup_rough_default.svg` | 흰색 중앙 모달 |
| 아이콘 | 닫기 아이콘 | `icon_action_close_circle_rough_default_24.svg` | 우측 상단 X |
| 아이콘 | 로그아웃 경고 아이콘 | `icon_logout_warning_red_rough_default_48.svg` | 중앙 로그아웃 아이콘 |
| 프레임 | 로그아웃 버튼 프레임 | `ui_frame_logout_button_confirm_white_red_rough_default.svg` | 빨간 테두리 버튼 |
| 프레임 | 닫기 버튼 프레임 | `ui_frame_logout_button_close_white_rough_default.svg` | 검정 테두리 버튼 |

---

# 5. 영역별 상세 정의

---

## 5.1 Modal Overlay

### 화면 구성

```txt
팝업 뒤 전체 화면에 어두운 반투명 배경 표시
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 어두운 배경 | CSS overlay |
| 배경색 | `rgba(0, 0, 0, 0.55)` |
| 에셋 사용 여부 | 사용하지 않음 |

Modal Overlay는 에셋으로 만들지 않는다.

---

## 5.2 로그아웃 팝업 프레임

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_logout_popup_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 화면 중앙 |
| 설명 | 로그아웃 확인 내용을 담는 흰색 rough 모달 프레임 |

### 디자인 기준

```txt
흰색 배경
세로형 중앙 모달
둥근 모서리
거친 손그림 외곽선
모바일 화면 중앙 정렬
```

---

## 5.3 닫기 아이콘

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

## 5.4 로그아웃 경고 아이콘

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_logout_warning_red_rough_default_48.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 팝업 중앙 상단 |
| 설명 | 로그아웃 위험 액션을 나타내는 빨간 로그아웃 아이콘 |
| 텍스트 포함 여부 | 없음 |

### 디자인 기준

```txt
원형 테두리 안 로그아웃 아이콘
빨간 포인트 허용
위험 액션 강조
```

원형 테두리는 아이콘 에셋 안에 포함한다.

---

## 5.5 타이틀 / 설명 영역

### 표시 문구

| 요소 | 문구 | 처리 |
|---|---|---|
| 타이틀 | `진짜 나가게?` | 코드 텍스트 |
| 설명 | `다시 들어오려면 로그인해야 한다.` | 코드 텍스트 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 타이틀 | 코드 텍스트 |
| 설명 문구 | 코드 텍스트 |
| 텍스트 정렬 | CSS |
| 에셋 사용 | 없음 |

---

## 5.6 로그아웃 버튼

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_logout_button_confirm_white_red_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 설명 문구 아래 첫 번째 버튼 |
| 표시 문구 | `로그아웃` |
| 텍스트 구현 | 코드 텍스트 |
| 설명 | 로그아웃 실행을 위한 위험 액션 버튼 프레임 |

### 디자인 기준

```txt
흰색 배경
빨간 rough border
검정 또는 빨간 텍스트
```

### 동작

| 액션 | 동작 |
|---|---|
| 로그아웃 클릭 | Supabase signOut 실행 |
| 성공 | 로그인 화면 이동 |
| 실패 | 오류 메시지 표시 |

중요:

```txt
로그아웃 버튼 클릭 전에는 세션을 종료하지 않는다.
```

---

## 5.7 닫기 버튼

### 사용 에셋

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_logout_button_close_white_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 로그아웃 버튼 아래 |
| 표시 문구 | `닫기` |
| 텍스트 구현 | 코드 텍스트 |
| 설명 | 팝업을 닫는 취소 버튼 프레임 |

### 디자인 기준

```txt
흰색 배경
검정 rough border
검정 텍스트
```

### 동작

| 액션 | 동작 |
|---|---|
| 닫기 클릭 | 팝업 닫기 |

---

# 6. 프레임 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 로그아웃 팝업 프레임 | `ui_frame_logout_popup_rough_default.svg` |
| 로그아웃 버튼 프레임 | `ui_frame_logout_button_confirm_white_red_rough_default.svg` |
| 닫기 버튼 프레임 | `ui_frame_logout_button_close_white_rough_default.svg` |

---

# 7. 아이콘 정의만 따로 보기

| 역할 | 에셋명 |
|---|---|
| 닫기 아이콘 | `icon_action_close_circle_rough_default_24.svg` |
| 로그아웃 경고 아이콘 | `icon_logout_warning_red_rough_default_48.svg` |

---

## 8. 코드로 처리하는 요소

아래 요소는 이미지에 넣지 않는다.

| 요소 | 처리 |
|---|---|
| Modal Overlay | CSS |
| 타이틀 `진짜 나가게?` | 코드 텍스트 |
| 설명 `다시 들어오려면 로그인해야 한다.` | 코드 텍스트 |
| 버튼 문구 `로그아웃` | 코드 텍스트 |
| 버튼 문구 `닫기` | 코드 텍스트 |
| 버튼 클릭 영역 | HTML button |
| 팝업 열림/닫힘 | React state |
| 로그아웃 실행 | Supabase Auth signOut |
| 로그아웃 실패 메시지 | 코드 텍스트 |

---

## 9. 제외하는 에셋

이번 시안 기준으로 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `icon_loading_spinner_rough_default_24.svg` | 로딩 상태 시안이 없음 |
| `ui_frame_logout_button_confirm_black_rough_default.svg` | 현재 시안은 검정 버튼이 아니라 빨간 테두리 흰색 버튼 |
| `ui_frame_logout_button_cancel_white_rough_default.svg` | 버튼 문구가 `취소`가 아니라 `닫기` |
| `icon_profile_logout_red_rough_default_24.svg` | 내프로필 리스트용 아이콘이며 팝업 중앙 아이콘과 다름 |

---

## 10. 저장 경로

```txt
public/
  assets/
    icons/
      action/
        icon_action_close_circle_rough_default_24.svg

      logout/
        icon_logout_warning_red_rough_default_48.svg

    ui/
      frames/
        logout/
          ui_frame_logout_popup_rough_default.svg
          ui_frame_logout_button_confirm_white_red_rough_default.svg
          ui_frame_logout_button_close_white_rough_default.svg
```

---

## 11. 코드 상수

```ts
export const LOGOUT_POPUP_ASSETS = {
  popupFrame: '/assets/ui/frames/logout/ui_frame_logout_popup_rough_default.svg',
  closeIcon: '/assets/icons/action/icon_action_close_circle_rough_default_24.svg',
  warningIcon: '/assets/icons/logout/icon_logout_warning_red_rough_default_48.svg',
  confirmButtonFrame: '/assets/ui/frames/logout/ui_frame_logout_button_confirm_white_red_rough_default.svg',
  closeButtonFrame: '/assets/ui/frames/logout/ui_frame_logout_button_close_white_rough_default.svg',
} as const;
```

---

## 12. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 내프로필 로그아웃 클릭 | 로그아웃 확인 팝업 열기 |
| X 아이콘 클릭 | 팝업 닫기 |
| 닫기 버튼 클릭 | 팝업 닫기 |
| 로그아웃 버튼 클릭 | Supabase signOut 실행 |
| signOut 성공 | 로그인 화면 이동 |
| signOut 실패 | 오류 메시지 표시 후 팝업 유지 |
| 딤드 배경 클릭 | 정책에 따라 닫기 허용 또는 유지 |

---

## 13. QA 체크리스트

- [ ] 팝업 프레임은 `ui_frame_logout_popup_rough_default.svg`를 사용한다.
- [ ] 닫기 아이콘은 `icon_action_close_circle_rough_default_24.svg`를 사용한다.
- [ ] 중앙 로그아웃 아이콘은 `icon_logout_warning_red_rough_default_48.svg`를 사용한다.
- [ ] 로그아웃 버튼은 `ui_frame_logout_button_confirm_white_red_rough_default.svg`를 사용한다.
- [ ] 닫기 버튼은 `ui_frame_logout_button_close_white_rough_default.svg`를 사용한다.
- [ ] Modal Overlay는 CSS로 처리한다.
- [ ] 모든 텍스트는 이미지가 아니라 코드 텍스트다.
- [ ] 로그아웃 버튼 클릭 전에는 세션을 종료하지 않는다.
- [ ] 닫기/X 클릭 시 팝업만 닫힌다.
