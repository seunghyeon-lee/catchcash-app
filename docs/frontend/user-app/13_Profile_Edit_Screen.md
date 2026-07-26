# 13. 프로필 수정 화면 정의서
## 에셋 최소화 기준 최종 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 13. 프로필 수정 화면 정의서 |
| 파일명 | `13_Profile_Edit_Screen_v2_min_assets.md` |
| 화면명 | 프로필 수정 |
| 화면 ID | `13_Profile_Edit_Screen` |
| 서비스 | 캐치캐쉬 |
| 기준 디자인 | Stitch AI 프로필 수정 시안 |
| 작성 목적 | 실제 구현 기준으로 꼭 필요한 에셋만 남기고 다시 정리 |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 흑백 손그림 rough UI |

---

## 2. 정리 원칙

이번 화면은 **에셋을 최소화**한다.

즉, 아래 5개만 에셋으로 사용한다.

```txt
프로필 미리보기 카드
아바타 원형 프레임
저장 버튼 프레임
선택 체크 아이콘
안내 정보 아이콘
```

그 외 나머지는 모두 CSS와 코드 텍스트로 구현한다.

---

## 3. 최종 화면 구조

```txt
상단 헤더
→ 프로필 미리보기 카드
→ 캐릭터 선택 영역
→ 색상 선택 영역
→ 닉네임 입력 영역
→ 안내 박스
→ 저장 버튼
→ 하단 탭바
```

---

## 4. 최종 에셋 목록

| 구분 | 화면 요소 | 에셋명 | 설명 |
|---|---|---|---|
| 프레임 | 프로필 미리보기 카드 | `ui_frame_profile_edit_preview_card_rough_default.svg` | 상단 큰 프로필 카드 |
| 프레임 | 아바타 원형 프레임 | `ui_frame_profile_edit_avatar_circle_rough_default.svg` | 카드 내부 원형 아바타 영역 |
| 프레임 | 저장 버튼 프레임 | `ui_frame_profile_save_button_black_rough_default.svg` | 하단 검정 저장 버튼 |
| 아이콘 | 선택 체크 아이콘 | `icon_profile_selected_check_rough_default_16.svg` | 선택된 캐릭터/색상 표시 |
| 아이콘 | 안내 정보 아이콘 | `icon_profile_info_rough_default_16.svg` | 안내 박스 좌측 정보 아이콘 |

---

# 5. 에셋별 상세 정의

---

## 5.1 프로필 미리보기 카드

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_profile_edit_preview_card_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 상단 프로필 미리보기 영역 |
| 설명 | 프로필 수정 화면 상단의 큰 미리보기 카드 프레임 |

### 카드 내부 구성

```txt
아바타 원형 프레임
닉네임
한 줄 소개
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 카드 외곽 | SVG 에셋 |
| 닉네임 | 코드 텍스트 |
| 소개 문구 | 코드 텍스트 |
| 내부 정렬 | CSS flex / column |

---

## 5.2 아바타 원형 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_profile_edit_avatar_circle_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 프로필 미리보기 카드 내부 |
| 설명 | 프로필 캐릭터를 감싸는 원형 프레임 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 원형 외곽 | SVG 에셋 |
| 내부 아바타 아이콘 또는 캐릭터 | CSS / 코드 / 별도 이미지 또는 아이콘 사용 가능 |
| 중앙 정렬 | CSS |

중요:

```txt
이번 정리에서는 내부 아바타 캐릭터 이미지는 별도 필수 에셋으로 정의하지 않는다.
필요 시 코드 또는 별도 이미지로 주입한다.
```

---

## 5.3 저장 버튼 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_profile_save_button_black_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 화면 하단 저장 버튼 |
| 표시 문구 | `저장한다` |
| 설명 | 하단 1차 CTA 검정 버튼 프레임 |

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 버튼 외곽 | SVG 에셋 |
| 버튼 문구 | 코드 텍스트 |
| 클릭 영역 | HTML button |
| 비활성 상태 | CSS opacity / disabled 처리 |

중요:

```txt
저장 버튼 비활성 프레임은 따로 만들지 않는다.
비활성 상태는 CSS로 처리한다.
```

---

## 5.4 선택 체크 아이콘

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_profile_selected_check_rough_default_16.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 선택된 캐릭터 카드 우측 상단 / 선택된 색상 카드 우측 상단 |
| 설명 | 현재 선택 상태를 표시하는 체크 아이콘 |

### 사용 위치

```txt
캐릭터 선택 카드
색상 선택 카드
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 체크 아이콘 | SVG 에셋 |
| 카드 프레임 | CSS border로 구현 |
| 활성 카드 구분 | CSS border/background + 체크 아이콘 |

---

## 5.5 안내 정보 아이콘

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_profile_info_rough_default_16.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 닉네임 입력 아래 안내 박스 좌측 |
| 설명 | 안내성 메시지를 표시하는 정보 아이콘 |

### 안내 문구 예시

```txt
캐릭터와 닉네임은 랭킹과 보관함에 표시된다.
신중하게 선택해라.
```

### 구현 기준

| 요소 | 처리 방식 |
|---|---|
| 아이콘 | SVG 에셋 |
| 안내 박스 프레임 | CSS border / background |
| 안내 문구 | 코드 텍스트 |

---

# 6. CSS로 처리하는 요소

아래 요소는 모두 CSS로 구현한다.

| 요소 | 구현 방식 |
|---|---|
| 상단 헤더 전체 | CSS layout |
| 뒤로가기 아이콘 영역 | CSS + 텍스트/기본 아이콘 처리 |
| 설정 아이콘 영역 | CSS + 텍스트/기본 아이콘 처리 |
| 캐릭터 선택 카드 프레임 | CSS border |
| 캐릭터 선택 카드 배경 | CSS background |
| 색상 선택 카드 프레임 | CSS border |
| 색상 선택 카드 배경색 | CSS background-color |
| 닉네임 입력 프레임 | CSS border |
| 닉네임 입력 에러 상태 | CSS border-color |
| 안내 박스 프레임 | CSS border |
| 하단 탭바 프레임 | CSS border-top / background |
| 하단 탭 아이콘/라벨 배치 | CSS flex |

---

## 7. 코드 텍스트로 처리하는 요소

| 요소 | 처리 |
|---|---|
| `프로필 수정` | 코드 텍스트 |
| `지구방위대원` | 코드 텍스트 |
| `오늘도 보물을 향해 달리는 중!` | 코드 텍스트 |
| `캐릭터 선택` | 코드 텍스트 |
| `색상 선택` | 코드 텍스트 |
| `닉네임` | 코드 텍스트 |
| `6 / 10자` | 코드 텍스트 |
| 입력값 | 코드 텍스트 |
| 안내 문구 | 코드 텍스트 |
| `저장한다` | 코드 텍스트 |
| 하단 탭 라벨 | 코드 텍스트 |

---

## 8. 제외하는 에셋

이번 정리에서는 아래 에셋은 사용하지 않는다.

| 제외 에셋 | 제외 이유 |
|---|---|
| `ui_frame_profile_character_card_active_rough_default.svg` | 카드 프레임은 CSS로 처리 |
| `ui_frame_profile_character_card_inactive_rough_default.svg` | 카드 프레임은 CSS로 처리 |
| `ui_frame_profile_color_card_active_rough_default.svg` | 색상 카드 프레임은 CSS로 처리 |
| `ui_frame_profile_color_card_inactive_rough_default.svg` | 색상 카드 프레임은 CSS로 처리 |
| `ui_frame_profile_nickname_input_rough_default.svg` | 입력창은 CSS로 처리 |
| `ui_frame_profile_nickname_input_error_rough_default.svg` | 에러 입력창은 CSS로 처리 |
| `ui_frame_profile_edit_notice_box_rough_default.svg` | 안내 박스는 CSS로 처리 |
| `ui_frame_profile_save_button_disabled_rough_default.svg` | 버튼 비활성은 CSS로 처리 |
| 모든 캐릭터 이미지 에셋 | 현재는 필수 아님 |
| 하단 탭바 프레임 에셋 | CSS로 처리 가능 |
| 헤더 아이콘 전용 에셋 | CSS 또는 공통 아이콘으로 대체 가능 |

---

## 9. 저장 경로

```txt
public/
  assets/
    ui/
      frames/
        profile/
          ui_frame_profile_edit_preview_card_rough_default.svg
          ui_frame_profile_edit_avatar_circle_rough_default.svg
          ui_frame_profile_save_button_black_rough_default.svg

    icons/
      profile/
        icon_profile_selected_check_rough_default_16.svg
        icon_profile_info_rough_default_16.svg
```

---

## 10. 코드 상수

```ts
export const PROFILE_EDIT_ASSETS = {
  previewCardFrame: '/assets/ui/frames/profile/ui_frame_profile_edit_preview_card_rough_default.svg',
  avatarCircleFrame: '/assets/ui/frames/profile/ui_frame_profile_edit_avatar_circle_rough_default.svg',
  saveButtonFrame: '/assets/ui/frames/profile/ui_frame_profile_save_button_black_rough_default.svg',

  selectedCheckIcon: '/assets/icons/profile/icon_profile_selected_check_rough_default_16.svg',
  infoIcon: '/assets/icons/profile/icon_profile_info_rough_default_16.svg',
} as const;
```

---

## 11. 인터랙션 정책

| 액션 | 동작 |
|---|---|
| 뒤로가기 | 이전 화면 또는 `/profile` |
| 캐릭터 선택 | 선택 상태 변경 |
| 색상 선택 | 선택 상태 변경 |
| 닉네임 입력 | 실시간 글자 수 반영 |
| 저장 버튼 클릭 | 변경 내용 저장 |
| 저장 완료 | 프로필 화면 복귀 또는 성공 토스트 노출 |

---

## 12. QA 체크리스트

- [ ] 프로필 미리보기 카드에 `ui_frame_profile_edit_preview_card_rough_default.svg`를 사용한다.
- [ ] 아바타 원형 영역에 `ui_frame_profile_edit_avatar_circle_rough_default.svg`를 사용한다.
- [ ] 저장 버튼에 `ui_frame_profile_save_button_black_rough_default.svg`를 사용한다.
- [ ] 선택된 캐릭터/색상에 `icon_profile_selected_check_rough_default_16.svg`를 표시한다.
- [ ] 안내 박스 좌측에 `icon_profile_info_rough_default_16.svg`를 표시한다.
- [ ] 나머지 프레임과 박스는 CSS로 구현한다.
- [ ] 닉네임 입력, 안내 문구, 버튼 문구는 모두 코드 텍스트다.
