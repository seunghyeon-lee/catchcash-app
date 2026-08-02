/** 공통 상·하단 네비게이션 에셋 — GNB/BNB MD 스펙 */
const BASE = "/assets";

/**
 * GNB 아이콘 — 프레임(검정 박스) 없는 글리프형.
 * Figma 프레임형(`navigation/top/icon_gnb_*_default`)은 박스+그림자라
 * 팀장 피드백(검정 박스 제거)에 맞춰 rough_default_24 / nav back 을 사용한다.
 */
export const GNB_ASSETS = {
  icons: {
    back: `${BASE}/icons/nav/icon_nav_back_circle_rough_default_24.svg`,
    notification: `${BASE}/icons/gnb/icon_gnb_notification_rough_default_24.svg`,
    help: `${BASE}/icons/gnb/icon_gnb_help_rough_default_24.svg`,
    setting: `${BASE}/icons/gnb/icon_gnb_setting_rough_default_24.svg`,
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
