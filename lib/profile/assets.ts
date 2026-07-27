// profile-support 에셋 경로 (Figma Dev Mode MCP export, MD 스펙 파일명 기준)
const BASE = "/assets";

export const PROFILE_ASSETS = {
  icons: {
    /** 공통 에셋 재사용 (다른 화면과 동일 노드) */
    backCircle: `${BASE}/icons/nav/icon_nav_back_circle_rough_default_24.svg`,
    gnbNotification: `${BASE}/icons/gnb/icon_gnb_notification_rough_default_24.svg`,
    gnbHelp: `${BASE}/icons/gnb/icon_gnb_help_rough_default_24.svg`,
    gnbSetting: `${BASE}/icons/gnb/icon_gnb_setting_rough_default_24.svg`,
    arrowRightWhite: `${BASE}/icons/action/icon_action_arrow_right_white_18.svg`,
    closeCircle: `${BASE}/icons/action/icon_action_close_circle_rough_default_24.svg`,
    /** 프로필 전용 — 메뉴 행 배경색별 chevron */
    chevronRightWhite: `${BASE}/icons/profile/icon_profile_chevron_right_white_12.svg`,
    chevronRightGray: `${BASE}/icons/profile/icon_profile_chevron_right_gray_12.svg`,
    chevronRightRed: `${BASE}/icons/profile/icon_profile_chevron_right_red_12.svg`,
    menuInventory: `${BASE}/icons/profile/icon_profile_inventory_rough_default_24.svg`,
    menuInquiry: `${BASE}/icons/profile/icon_profile_inquiry_rough_default_24.svg`,
    menuLogout: `${BASE}/icons/profile/icon_profile_logout_red_rough_default_24.svg`,
    logoutWarning: `${BASE}/icons/profile/icon_logout_warning_red_rough_default_48.svg`,
    /** 캐릭터 미지정 등 fallback 아바타 (Figma 13_Profile_Edit_Screen 시안 기본값) */
    editAvatarPerson: `${BASE}/icons/profile/icon_profile_edit_avatar_person_rough_default_40.svg`,
    /**
     * 13_Profile_Edit_Screen 정의서 4절 지정 파일명.
     * 아이콘 자체가 "원 테두리 + 체크"(속이 빈 링)라 별도 배경 없이 색만 바꿔 쓴다.
     */
    editCheckWhite: `${BASE}/icons/profile/icon_profile_selected_check_rough_default_16.svg`,
    editCheckDark: `${BASE}/icons/profile/icon_profile_selected_check_dark_16.svg`,
    editInfo: `${BASE}/icons/profile/icon_profile_info_rough_default_16.svg`,
    editCharacterHunter: `${BASE}/icons/profile/icon_profile_edit_character_hunter_rough_default_24.svg`,
    /** 문의하기 전용 */
    supportChevronDown: `${BASE}/icons/support/icon_support_chevron_down_rough_default_12.svg`,
    supportWarning: `${BASE}/icons/support/icon_support_warning_rough_default_12.svg`,
    /** 15_2 문의 상세 — 카드 헤더 / CTA 아이콘 */
    supportUserPerson: `${BASE}/icons/support/icon_support_user_person_dark_16.svg`,
    supportAdminHeadset: `${BASE}/icons/support/icon_support_admin_headset_dark_20.svg`,
    supportBackExit: `${BASE}/icons/support/icon_support_back_exit_white_18.svg`,
  },
  frames: {
    profileMainCard: `${BASE}/ui/frames/profile/ui_frame_profile_main_card_rough_default.svg`,
    profileEditEntryButton: `${BASE}/ui/frames/profile/ui_frame_profile_edit_entry_button_black_rough_default.svg`,
    menuButtonBlack: `${BASE}/ui/frames/profile/ui_frame_profile_menu_button_black_rough_default.svg`,
    menuButtonWhite: `${BASE}/ui/frames/profile/ui_frame_profile_menu_button_white_rough_default.svg`,
    menuButtonRed: `${BASE}/ui/frames/profile/ui_frame_profile_logout_button_red_rough_default.svg`,
    saveButtonBlack: `${BASE}/ui/frames/profile/ui_frame_profile_save_button_black_rough_default.svg`,
    editPreviewCard: `${BASE}/ui/frames/profile/ui_frame_profile_edit_preview_card_rough_default.svg`,
    /** 14_Logout_Confirm_Popup 정의서 4절 지정 파일명 */
    logoutPopupSheet: `${BASE}/ui/frames/profile/ui_frame_logout_popup_rough_default.svg`,
    logoutPopupButtonRed: `${BASE}/ui/frames/profile/ui_frame_logout_button_confirm_white_red_rough_default.svg`,
    logoutPopupButtonWhite: `${BASE}/ui/frames/profile/ui_frame_logout_button_close_white_rough_default.svg`,
    supportCategorySelect: `${BASE}/ui/frames/support/ui_frame_support_category_select_rough_default.svg`,
    /**
     * 검정 rough CTA. 정의서상 문의 등록(15_3) / 문의하기(15_1) / 돌아가기(15_2)가
     * 각각 다른 파일명으로 잡혀 있지만 Figma에는 이 하나만 있어 공용으로 쓴다.
     */
    supportSubmitButton: `${BASE}/ui/frames/support/ui_frame_support_submit_button_black_rough_default.svg`,
  },
  /**
   * mask-image 로 쓰는 rough 실루엣.
   * Figma가 "Mask Group"으로 내보낸 노드라 배경 이미지가 아니라 마스크로 얹어야
   * 손으로 그린 듯 삐뚤어진 테두리가 나온다. (`RoughMaskFrame` 참고)
   */
  masks: {
    /** 15_1 타이틀 밑줄 (96x2) */
    supportTitleUnderline: `${BASE}/ui/frames/support/ui_frame_support_title_underline_rough_default.svg`,
    /** 15_2 상태 배지 도장 — 해결됨/읽는 중 공용 (Figma 시안은 해결됨 1종만 존재) */
    supportStatusStamp: `${BASE}/ui/frames/support/ui_badge_support_status_stamp_rough_default.svg`,
    /** 15_2 사용자 문의 카드 */
    supportUserQuestionCard: `${BASE}/ui/frames/support/ui_frame_support_detail_user_question_card_rough_default.svg`,
    /** 15_2 관리자 답변 카드 */
    supportAdminReplyCard: `${BASE}/ui/frames/support/ui_frame_support_detail_admin_reply_card_rough_default.svg`,
    /** 15_2 하단 `알았다 (뒤로가기)` 버튼 */
    supportDetailBackButton: `${BASE}/ui/frames/support/ui_frame_support_detail_back_button_black_rough_default.svg`,
  },
  images: {
    editBgPattern: `${BASE}/images/profile/img_profile_edit_bg_pattern.png`,
    /** 15_1 · 15_2 배경 종이 질감 (523x384 타일, 흰 반점 α≈15%) */
    supportPaperGrain: `${BASE}/images/support/img_support_paper_grain_rough_default.png`,
    /**
     * 캐릭터 아트 7종 — 사용자가 직접 제작해 전달한 SVG(정사각 viewBox 52x52).
     * 파일명 슬러그(key)는 ASCII, 화면 표시 이름은 mock-data.ts 의 label(한글)에서 온다.
     */
    characterNewbie: `${BASE}/images/profile/img_profile_character_newbie_rough_default.svg`,
    characterGuide: `${BASE}/images/profile/img_profile_character_guide_rough_default.svg`,
    characterWanderer: `${BASE}/images/profile/img_profile_character_wanderer_rough_default.svg`,
    characterCat: `${BASE}/images/profile/img_profile_character_cat_rough_default.svg`,
    characterExplorer: `${BASE}/images/profile/img_profile_character_explorer_rough_default.svg`,
    characterTracker: `${BASE}/images/profile/img_profile_character_tracker_rough_default.svg`,
    characterHunter: `${BASE}/images/profile/img_profile_character_hunter_rough_default.svg`,
  },
} as const;

/** Figma 화면 배경/타이포 색 (tailwind 토큰에 없는 값만 상수화) */
export const PROFILE_COLORS = {
  screen: "#f7f5ef",
  muted: "#5d5f5f",
  iconBox: "#eeeeee",
  noticeBox: "#e8e8e8",
  noticeText: "#4c4546",
  dangerText: "#dc2626",
  dangerBorder: "#ba1a1a",
  dangerBox: "#fee2e2",
} as const;
