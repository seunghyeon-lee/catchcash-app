// profile-support Mock Data
// 이번 단계: UI 껍데기용 Mock. 다음 단계에서 Supabase 연동으로 교체.
// 값/카피는 Figma 화면(10_My_Profile_Screen, 13_Profile_Edit_Screen, 문의하기) 기준.

import { PROFILE_ASSETS } from "@/lib/profile/assets";

export type ProfileStats = {
  /** 찾은 보물 */
  treasuresFound: number;
  /** 보유 쿠폰 */
  couponsOwned: number;
  /** 현재 순위 */
  rank: number;
};

export type MockProfile = {
  nickname: string;
  /** 사용자가 직접 쓴 한 줄 소개. 비우면 캐릭터 기본 문구를 쓴다 (`resolveIntro`) */
  intro: string;
  /** 선택한 캐릭터 key */
  characterKey: string;
  /** 선택한 색상 key */
  colorKey: string;
  stats: ProfileStats;
};

/**
 * 프로필/프로필 수정 화면이 함께 쓰는 현재 프로필.
 * 수정 화면도 이 값에서 시작하므로 두 화면의 아바타·닉네임·소개가 항상 일치한다.
 */
export const MOCK_PROFILE: MockProfile = {
  nickname: "최고의 헌터",
  // 빈 값 = 아직 직접 안 씀 → 캐릭터 기본 문구가 보인다
  intro: "",
  characterKey: "hunter",
  colorKey: "white",
  stats: { treasuresFound: 8, couponsOwned: 3, rank: 458 },
};

/**
 * 한 줄 소개 길이 제한.
 *
 * DB(`profiles.intro_text`)는 160자까지 허용하지만, 프로필 카드 한 줄에 들어가는 문구라
 * 화면에서는 더 짧게 받는다. (미리보기 카드 기준 30자면 최대 2줄)
 * DB 제약보다 느슨하지 않으므로 저장이 막힐 일은 없다 — handoff.md N-1 참고.
 */
export const INTRO_MAX_LENGTH = 30;

/**
 * 화면에 보여줄 한 줄 소개.
 * 사용자가 직접 쓴 게 있으면 그걸 쓰고, 없으면 선택한 캐릭터의 기본 문구로 채운다.
 * 프로필/프로필 수정 두 화면이 같은 규칙을 쓰도록 여기 모아 둔다.
 */
export function resolveIntro(intro: string, character: ProfileCharacter): string {
  return intro.trim() || character.tagline;
}

/**
 * 닉네임 규칙 — 길이는 가입 화면과 동일하게 맞춘다.
 * 출처: `docs/frontend/user-app/03_Nickname_Terms_Screen.md` 14.1
 * (Figma 수정 화면 시안의 "6 / 10자" 표기는 따르지 않는다.
 *  가입 때 만든 11~12자 닉네임을 수정 화면에서 못 고치는 문제가 생기기 때문)
 *
 * ⚠️ 문자 규칙은 가입 정의서 정규식 `^[가-힣a-zA-Z0-9_-]+$` 에서 **공백을 추가로 허용**했다.
 * 그 정규식대로면 `10_My_Profile_Screen` 정의서가 지정한 닉네임 `최고의 헌터` 가 검증에 걸린다.
 * 정의서 간 충돌이라 가입 담당과 통일 필요 — handoff.md 참고.
 * (양끝 공백은 trim, 연속 공백은 불허)
 */
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 12;
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_-]+(?: [가-힣a-zA-Z0-9_-]+)*$/;

/** 닉네임 검증 — 통과하면 null, 아니면 에러 문구 */
export function validateNickname(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < NICKNAME_MIN_LENGTH) return `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 입력해주세요.`;
  if (trimmed.length > NICKNAME_MAX_LENGTH) return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`;
  if (!NICKNAME_PATTERN.test(trimmed)) return "사용할 수 없는 문자가 포함되어 있어요.";
  return null;
}

/**
 * 캐릭터 선택지.
 *
 * `tagline`(한 줄 소개)은 **캐릭터별 기본 문구**다. 사용자가 프로필 수정에서 직접 쓰면
 * 그 값이 우선하고(`MockProfile.intro`), 비워 두면 이 문구가 대신 보인다(`resolveIntro`).
 * 입력란 placeholder 로도 그대로 쓴다.
 * - `wanderer` → "오늘도 보물을 향해 달리는 중!" (13_Profile_Edit_Screen 시안)
 * - 나머지는 톤에 맞춰 창작.
 *
 * `kind` 는 그리는 방식이 달라서 나눈다.
 * - `glyph` — 단색 선화(상자). 원 안에 여백을 두고 넣고, 어두운 배경에서는 반전시킨다.
 * - `portrait` — 랭킹 아바타 초상 이미지. 원을 가득 채우고 반전하지 않는다.
 *
 * 초상 이미지는 `09_Hall_Of_Fame_Screen` 의 헌터 랭킹 아바타를 반입한 것(팀장 요청).
 */
export type ProfileCharacter = {
  key: string;
  label: string;
  /** 캐릭터별 기본 한 줄 소개 — 사용자가 직접 안 썼을 때 쓰인다 */
  tagline: string;
  icon: string;
  kind: "glyph" | "portrait";
  /** glyph 전용 — 원본 비율을 지켜야 안 찌그러진다 */
  iconWidth?: number;
  iconHeight?: number;
  /** glyph 전용 — 원 지름 대비 아이콘 높이 비율 */
  avatarScale?: number;
};

export const PROFILE_CHARACTERS: ProfileCharacter[] = [
  {
    key: "newbie",
    label: "이제 막 눈뜬 새내기",
    tagline: "이제 막 눈을 떴다",
    icon: PROFILE_ASSETS.images.characterNewbie,
    kind: "portrait",
  },
  {
    key: "guide",
    label: "첫 발을 뗀 길잡이",
    tagline: "첫 발을 뗐다, 따라와라",
    icon: PROFILE_ASSETS.images.characterGuide,
    kind: "portrait",
  },
  {
    key: "wanderer",
    label: "일단 나와본 사람",
    tagline: "일단 나와봤다",
    icon: PROFILE_ASSETS.images.characterWanderer,
    kind: "portrait",
  },
  {
    key: "cat",
    label: "호기심 대장 냥탐험가",
    tagline: "궁금하면 일단 파본다",
    icon: PROFILE_ASSETS.images.characterCat,
    kind: "portrait",
  },
  {
    key: "explorer",
    label: "헛걸음 없는 탐색가",
    tagline: "헛걸음은 안 한다",
    icon: PROFILE_ASSETS.images.characterExplorer,
    kind: "portrait",
  },
  {
    key: "tracker",
    label: "X표 추적자",
    tagline: "X 표시는 내가 찾는다",
    icon: PROFILE_ASSETS.images.characterTracker,
    kind: "portrait",
  },
  {
    key: "hunter",
    label: "전설의 유물 사냥꾼",
    tagline: "발로 뛰는 게 제일 빠르다",
    icon: PROFILE_ASSETS.images.characterHunter,
    kind: "portrait",
  },
];

/** 캐릭터 key로 찾기 — 없으면 첫 번째(기본 캐릭터) */
export function findCharacter(key: string): ProfileCharacter {
  return PROFILE_CHARACTERS.find((item) => item.key === key) ?? PROFILE_CHARACTERS[0];
}

/** 색상 key로 찾기 — 없으면 첫 번째 */
export function findColor(key: string): ProfileColor {
  return PROFILE_COLOR_OPTIONS.find((item) => item.key === key) ?? PROFILE_COLOR_OPTIONS[0];
}

/** 색상 선택지 (Mock) — Figma 3종 + 브랜드 옐로 1종 */
export type ProfileColor = { key: string; label: string; value: string };

export const PROFILE_COLOR_OPTIONS: ProfileColor[] = [
  { key: "pink", label: "분홍", value: "#ffa3a3" },
  { key: "black", label: "검정", value: "#000000" },
  { key: "white", label: "흰색", value: "#ffffff" },
  { key: "yellow", label: "노랑", value: "#f5c542" },
];

/**
 * 문의 유형 — `15_3_Support_Inquiry_Write_Screen` 정의서 기준.
 * 라벨은 5.3 카테고리 목록, key 는 12절 `SupportCategory` 타입을 따른다.
 */
export type SupportCategory = { key: string; label: string };

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { key: "general", label: "이용 문의" },
  { key: "coupon", label: "쿠폰 문의" },
  { key: "reward", label: "보상 문의" },
  { key: "account", label: "계정 문의" },
  { key: "bug", label: "오류 제보" },
  { key: "improvement", label: "개선 문의" },
  { key: "etc", label: "기타 문의" },
];
