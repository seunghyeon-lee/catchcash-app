# Figma export 에셋 현황

> 이 디렉터리는 Figma Dev Mode MCP(`figma-desktop`)의 `dirForAssetWrites` 랜딩존이다.
> MCP는 해시 파일명으로 떨어뜨리므로, **MD 스펙 파일명으로 rename 후 아래 규약 경로로 이동**한다.
> 랜딩존에는 이 문서만 남긴다.

## 경로 규약

| 종류 | 위치 |
|---|---|
| 아이콘 | `icons/<도메인>/icon_*.svg` |
| UI 프레임(rough 카드/버튼) | `ui/frames/<도메인>/ui_frame_*.svg` |
| 이미지 | `images/<도메인>/img_*.{svg,png}` |
| 지도 마커 | `markers/map/marker_*.svg` |

---

## hunt-reward-flow (`feature/hunt-reward-flow`) — 완료

- `/map` · 보물 힌트 팝업 · `/ar-hunt` · `/hunt-result` · `/inventory` · 보상 상세 팝업
- 코드 상수: `lib/hunt/assets.ts`
- 파일명은 화면 MD(`05`~`08`, `11`~`12`) 스펙명 우선. 일부 단순 UI(필터 칩, 상태 배지, HUNT LOG 점선 카드, 진행바)는 CSS로 재현.

---

## profile-support (`feature/profile-support`) — Figma 실 디자인 반영 완료

코드 상수: `lib/profile/assets.ts`

대상 Figma 프레임
| 화면 | node id |
|---|---|
| 10_My_Profile_Screen | `1:2367` |
| 13_Profile_Edit_Screen | `1:2651` |
| 14_Logout_Confirm_Popup | `1:2786` |
| 문의하기(Html → Body) | `1:2809` |

### 신규 반입 에셋

| 파일 | 출처 node | 비고 |
|---|---|---|
| `icons/profile/icon_profile_inventory_rough_default_24.svg` | `1:2476` | |
| `icons/profile/icon_profile_inquiry_rough_default_24.svg` | `1:2479` | |
| `icons/profile/icon_profile_logout_red_rough_default_24.svg` | `1:2482` | |
| `icons/profile/icon_logout_warning_red_rough_default_48.svg` | `1:2793` | 원형 테두리 + 빨강 아이콘 일체형 |
| `icons/profile/icon_profile_chevron_right_white_12.svg` | `1:2401` | 검정 행용 |
| `icons/profile/icon_profile_chevron_right_gray_12.svg` | `1:2406` | 흰 행용(#5D5F5F) |
| `icons/profile/icon_profile_chevron_right_red_12.svg` | `1:2411` | 빨강 행용(#FCA5A5) |
| `icons/profile/icon_profile_edit_avatar_person_rough_default_40.svg` | `1:2677` | |
| `icons/profile/icon_profile_selected_check_rough_default_16.svg` | `1:2692` | 13 정의서 4절 지정명 |
| `icons/profile/icon_profile_selected_check_dark_16.svg` | `1:2692` | 밝은 배경용 — fill fallback만 `#1B1B1B`로 교체 |
| `icons/profile/icon_profile_edit_character_hunter_rough_default_24.svg` | `1:2699` | |
| `icons/profile/icon_profile_info_rough_default_16.svg` | `1:2746` | 13 정의서 4절 지정명 |
| `icons/support/icon_support_chevron_down_rough_default_12.svg` | `1:2831` | |
| `icons/support/icon_support_warning_rough_default_12.svg` | `1:2846` | |
| `ui/frames/profile/ui_frame_profile_main_card_rough_default.svg` | `1:2465` | |
| `ui/frames/profile/ui_frame_profile_edit_entry_button_black_rough_default.svg` | `1:2441` | 프로필 수정 진입 버튼 |
| `ui/frames/profile/ui_frame_profile_menu_button_black_rough_default.svg` | `1:2394` | |
| `ui/frames/profile/ui_frame_profile_menu_button_white_rough_default.svg` | `1:2395` | |
| `ui/frames/profile/ui_frame_profile_logout_button_red_rough_default.svg` | `1:2396` | stroke fallback을 `#FF9797`로 교체(아래 참고) |
| `ui/frames/profile/ui_frame_profile_save_button_black_rough_default.svg` | `1:2854` | 저장한다 / 던져놓기 공용 |
| `ui/frames/profile/ui_frame_profile_edit_preview_card_rough_default.svg` | `1:2672` | |
| `ui/frames/profile/ui_frame_logout_popup_rough_default.svg` | `1:2787` | |
| `ui/frames/profile/ui_frame_logout_button_confirm_white_red_rough_default.svg` | `1:2789` | 로그아웃 버튼(stroke `#FF9797`) |
| `ui/frames/profile/ui_frame_logout_button_close_white_rough_default.svg` | `1:2791` | 닫기 버튼 |
| `ui/frames/support/ui_frame_support_category_select_rough_default.svg` | `1:2829` | |
| `ui/frames/support/ui_frame_support_submit_button_black_rough_default.svg` | `1:2864` | 검정 CTA — 등록/문의하기/돌아가기 3곳 공용 |
| `images/profile/img_profile_avatar_chest_rough_default.png` | `1:2471` | Figma 레이어명은 `.svg`지만 실제로는 이미지 fill(PNG) |
| `images/profile/img_profile_edit_bg_pattern.png` | `1:2651` | 8x8 반복 배경 패턴 |

### 캐릭터 초상 — 랭킹 아바타 반입 (2026-07-27, 팀장 요청)

캐릭터 선택 아트를 `09_Hall_Of_Fame_Screen`(`1:2076`)의 **헌터 랭킹 아바타 이미지**로 통일했다.
이전에 직접 그렸던 임시 SVG 3종(`_placeholder_`)은 **삭제**했다.

| 파일 | 캐릭터 | 출처 node | 원본 |
|---|---|---|---|
| `images/profile/img_profile_character_mackerel_rough_default.jpg` | 힘찬 고등어 | `1:2165` | 랭킹 1위 아바타 |
| `images/profile/img_profile_character_wanderer_rough_default.jpg` | 나약한 나그네 | `1:2188` | 랭킹 2위 아바타 |
| `images/profile/img_profile_character_resting_rough_default.jpg` | 쉬었음 청년 | `1:2209` | 랭킹 3위 아바타 |
| `images/profile/img_profile_character_hunter_rough_default.jpg` | 헌터 | `1:2113` | 오늘 최고의 사냥군 아바타 |

- **Figma가 이 이미지들을 JPEG로 내보낸다.** MCP는 확장자를 `.png`로 붙여서 떨어뜨리므로
  실제 매직바이트(`ff d8 ff`)를 확인하고 `.jpg`로 고쳤다.
- 원본 크기: 104x104(랭킹 1~3위) · 88x88(사냥군). 미리보기 원이 128px이라 살짝 확대된다.
- 상자(`chest`)만 선화라 예외 처리 — 원 안에 여백을 두고 어두운 배경에서 반전한다.
  코드에서는 `PROFILE_CHARACTERS[].kind` 로 `glyph` / `portrait` 를 구분한다.
- `icons/profile/icon_profile_edit_character_hunter_rough_default_24.svg`(Figma 헌터 글리프)는
  초상으로 대체되어 현재 미사용이다.

### 재사용(기존 커밋 에셋)

`icons/nav/icon_nav_back_circle_rough_default_24.svg` · `icons/gnb/icon_gnb_{notification,help,setting}_rough_default_24.svg` ·
`icons/action/icon_action_arrow_right_white_18.svg` · `icons/action/icon_action_close_circle_rough_default_24.svg`

### 파일명 관련 메모

Figma 레이어명이 실제 쓰임과 어긋나는 경우가 있어(예: 로그아웃 팝업의 빨강 버튼이
`ui_frame_result_button_secondary_white_rough_default.svg`, 닫기 버튼이
`ui_frame_profile_logout_button_white_rough_default.svg`) **쓰임 기준 이름**으로 반입했다.
위 표의 node id로 원본을 추적할 수 있다.

### 색상 fallback 교체

MCP export SVG는 색을 `fill="var(--fill-0, …)"` / `stroke="var(--stroke-0, …)"` 형태로 내보내며,
`<img>`로 쓰면 fallback 값이 적용된다. 프로필 로그아웃 행(`1:2396`)은 Figma 렌더는 빨강인데
export fallback이 `black`으로 나와, 팝업 빨강 버튼과 동일한 `#FF9797`로 fallback만 교체했다(패스 데이터는 원본 유지).

### CSS로 재현한 부분 (전용 에셋 없음)

Figma 노드를 열어 보면 벡터가 아니라 CSS 박스인 것들이다. 정의서 에셋 표에 파일명이 있어도
실제 노드에 벡터가 없으면 CSS로 구현한다.

- 프로필 통계 카드 3종 — `1:2462`가 CSS 박스(`border-3 + shadow 4px 4px 0`)
- 프로필 수정 캐릭터/색상 선택 카드, 닉네임 입력, 안내 카드 — 전부 CSS 박스
- 문의 작성 한 줄 요약 input(`1:2858`) / 핵심 요약 textarea(`1:2860`) /
  점선 안내 카드(`1:2863`) — 정의서는 에셋으로 지정하지만 Figma 노드가 CSS 박스다
- **문의 목록(15_1) / 문의 상세(15_2) 전체** — Figma에 시안 자체가 없다.
  앱의 rough CSS 스타일로 재현했고, 필요한 전용 에셋 11종은 `handoff.md` 의 `#논의필요` D-1 참고.
  상태 배지는 `components/profile/support-status-badge.tsx` 한 곳에 모아 뒀다.
