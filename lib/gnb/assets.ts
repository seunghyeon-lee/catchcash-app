/** 공통 상·하단 네비게이션 에셋 — GNB/BNB MD 스펙 파일명 */
const BASE = "/assets";

export const GNB_ASSETS = {
  icons: {
    back: `${BASE}/icons/navigation/top/icon_gnb_back_rough.svg`,
    notification: `${BASE}/icons/navigation/top/icon_gnb_notification_default.svg`,
    help: `${BASE}/icons/navigation/top/icon_gnb_help_default.svg`,
    setting: `${BASE}/icons/navigation/top/icon_gnb_setting_default.svg`,
  },
  frames: {
    paper: `${BASE}/ui/frames/navigation/top/ui_frame_gnb_paper_rough_default.svg`,
  },
} as const;

/**
 * BNB 아이콘 — 스펙 파일명으로 배치.
 * 홈 전용 에셋이 없어 map 아이콘을 임시 재사용한다. (후속 PR에서 교체)
 */
export const BNB_ASSETS = {
  home: {
    active: `${BASE}/icons/navigation/bottom/icon_bnb_home_active.svg`,
    default: `${BASE}/icons/navigation/bottom/icon_bnb_home_default.svg`,
  },
  map: {
    active: `${BASE}/icons/navigation/bottom/icon_bnb_map_active.svg`,
    default: `${BASE}/icons/navigation/bottom/icon_bnb_map_default.svg`,
  },
  hunt: {
    active: `${BASE}/icons/navigation/bottom/icon_bnb_hunt_active.svg`,
    default: `${BASE}/icons/navigation/bottom/icon_bnb_hunt_default.svg`,
  },
  fame: {
    active: `${BASE}/icons/navigation/bottom/icon_bnb_fame_active.svg`,
    default: `${BASE}/icons/navigation/bottom/icon_bnb_fame_default.svg`,
  },
  profile: {
    active: `${BASE}/icons/navigation/bottom/icon_bnb_profile_active.svg`,
    default: `${BASE}/icons/navigation/bottom/icon_bnb_profile_default.svg`,
  },
} as const;
