// hunt-reward-flow Mock Data
// 이번 단계: UI 껍데기용 Mock. 다음 단계에서 Supabase 연동으로 교체.

export type TreasureStatus = "active" | "claimed";
export type TreasureVariant = "yellow" | "purple";

export type MockTreasure = {
  id: string;
  name: string;
  locationHint: string;
  status: TreasureStatus;
  variant: TreasureVariant;
  /** 지도 placeholder 위 마커 위치 (%) */
  position: { left: number; top: number };
  distanceM: number;
  unlockRadiusM: number;
  hint: { order: number; text: string };
};

export const MOCK_TREASURES: MockTreasure[] = [
  {
    id: "treasure-gold-1",
    name: "황금 보물상자",
    locationHint: "반포한강공원 근처",
    status: "active",
    variant: "yellow",
    position: { left: 68, top: 30 },
    distanceM: 700,
    unlockRadiusM: 20,
    hint: { order: 1, text: "땅 보고 걷냐? 쫌 올려다 봐라" },
  },
  {
    id: "treasure-purple-1",
    name: "보라 선물상자",
    locationHint: "세빛섬 근처",
    status: "active",
    variant: "purple",
    position: { left: 22, top: 70 },
    distanceM: 180,
    unlockRadiusM: 20,
    hint: { order: 1, text: "물 근처다. 발 조심해라" },
  },
];

export const MOCK_CLAIMED_TREASURE = {
  id: "treasure-claimed-1",
  position: { left: 16, top: 45 },
};

export type RewardStatus = "available" | "failed" | "used" | "expired";

export type MockReward = {
  id: string;
  rewardCode: string;
  couponNumber?: string;
  name: string;
  brand: string;
  status: RewardStatus;
  image: "coffee" | "sandwich" | null;
  expiresAt: string;
  expiresLabel: string;
  remainingDaysLabel?: string;
  usedAtLabel?: string;
  failReason?: string;
};

export const MOCK_REWARDS: MockReward[] = [
  {
    id: "reward-1",
    rewardCode: "#CC-8829-X",
    couponNumber: "1234-5678-9012",
    name: "아메리카노 Tall",
    brand: "스타벅스",
    status: "available",
    image: "coffee",
    expiresAt: "2024-12-31",
    expiresLabel: "2024.12.31 까지",
    remainingDaysLabel: "5일 남음",
  },
  {
    id: "reward-2",
    rewardCode: "#CC-1042-F",
    name: "비타500 100ml",
    brand: "광동제약",
    status: "failed",
    image: null,
    expiresAt: "2024-11-30",
    expiresLabel: "-",
    failReason: "네트워크 오류로 중단됨",
  },
  {
    id: "reward-3",
    rewardCode: "#CC-0917-U",
    name: "에그 드랍 샌드위치",
    brand: "에그드랍",
    status: "used",
    image: "sandwich",
    expiresAt: "2023-12-31",
    expiresLabel: "-",
    usedAtLabel: "2023.10.15 사용됨",
  },
  {
    id: "reward-4",
    rewardCode: "#CC-2201-E",
    name: "카페라떼",
    brand: "스타벅스",
    status: "expired",
    image: "coffee",
    expiresAt: "2023-01-01",
    expiresLabel: "2023.01.01 만료",
  },
];

/** MD 08 카피 기준 */
export const MOCK_HUNT_RESULT = {
  success: {
    badge: "건졌다",
    titleLines: ["잘했네.", "하나 건졌다."],
    subtitle: "전리품은 보관함에 넣어뒀다.",
    rewardName: "아메리카노 기프티콘",
    rewardBrand: "STARBUCKS",
    noticeLines: ["실물은 보관함에서 확인할 수 있습니다.", "쿠폰 코드는 보관함에서 직접 받으세요."],
    huntLog: ["보물 상자 접근", "상자 열기 시도", "보상 발견!"],
    quote: '"세상에 공짜는 없다지만, 이건 진짜인가 보네."',
  },
  fail: {
    badge: "꽝",
    titleLines: ["아쉽네. 빈 상자다."],
    subtitle: "다른 상자나 뒤져봐.",
    emptyLines: ["상자 안이 텅 비었다.", "아쉽네 ㅋ"],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "보상 없음"],
  },
} as const;
