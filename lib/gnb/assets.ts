/** 공통 상·하단 네비게이션 에셋 — GNB/BNB MD + Figma `15:*` */
const BASE = "/assets";

/**
 * GNB 아이콘 — 문서/Figma 박스형 (`navigation/top/icon_gnb_*_default`).
 */
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
 * BNB 아이콘 — Figma `15:111`~`15:120` 원본, 스펙 파일명.
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
