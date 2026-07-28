export type MockHallOfFame = {
  nickname: string;
  avatar_key: string | null;
  find_count: number;
  rank: number;
};

export type FameFilter = "all" | "today" | "week" | "month" | "nearby";

export type FameSummarySnapshot = {
  topHunter: {
    nickname: string;
    subtitle: string;
    findCount: number;
  };
  weeklyFindCount: number;
  recentTreasureName: string;
  recentTreasureLocation: string;
  recentTreasureTimeLabel: string;
  myRecentTreasureName: string;
  myRecentFoundAtLabel: string;
};

export type FameFilterMeta = {
  key: FameFilter;
  label: string;
  rotateClass: string;
};

export const FAME_FILTERS: FameFilterMeta[] = [
  { key: "all", label: "전체", rotateClass: "rotate-[0.2deg]" },
  { key: "today", label: "오늘", rotateClass: "rotate-[0.1deg]" },
  { key: "week", label: "이번 주", rotateClass: "-rotate-[0.4deg]" },
  { key: "month", label: "이번 달", rotateClass: "rotate-[0.6deg]" },
  { key: "nearby", label: "내 주변", rotateClass: "rotate-[0.5deg]" },
];

export const MOCK_HALL_OF_FAME: Record<FameFilter, MockHallOfFame[]> = {
  all: [
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 82, rank: 1 },
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 75, rank: 2 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 68, rank: 3 },
    { nickname: "master", avatar_key: "hunter", find_count: 61, rank: 4 },
    { nickname: "반짝고등어", avatar_key: "cat", find_count: 58, rank: 5 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 54, rank: 6 },
    { nickname: "지도부수기", avatar_key: "guide", find_count: 49, rank: 7 },
    { nickname: "탐색왕김돌", avatar_key: "newbie", find_count: 44, rank: 8 },
    { nickname: "노랑상자", avatar_key: "tracker", find_count: 39, rank: 9 },
    { nickname: "모험파인", avatar_key: null, find_count: 35, rank: 10 },
  ],
  today: [
    { nickname: "master", avatar_key: "hunter", find_count: 12, rank: 1 },
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 10, rank: 2 },
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 9, rank: 3 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 8, rank: 4 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 7, rank: 5 },
    { nickname: "반짝고등어", avatar_key: "cat", find_count: 6, rank: 6 },
  ],
  week: [
    { nickname: "master", avatar_key: "hunter", find_count: 42, rank: 1 },
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 39, rank: 2 },
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 34, rank: 3 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 31, rank: 4 },
    { nickname: "반짝고등어", avatar_key: "cat", find_count: 27, rank: 5 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 23, rank: 6 },
    { nickname: "탐색왕김돌", avatar_key: "newbie", find_count: 18, rank: 7 },
  ],
  month: [
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 82, rank: 1 },
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 75, rank: 2 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 68, rank: 3 },
    { nickname: "master", avatar_key: "hunter", find_count: 61, rank: 4 },
    { nickname: "반짝고등어", avatar_key: "cat", find_count: 58, rank: 5 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 54, rank: 6 },
    { nickname: "지도부수기", avatar_key: "guide", find_count: 49, rank: 7 },
    { nickname: "탐색왕김돌", avatar_key: "newbie", find_count: 44, rank: 8 },
  ],
  nearby: [
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 15, rank: 1 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 13, rank: 2 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 11, rank: 3 },
    { nickname: "master", avatar_key: "hunter", find_count: 10, rank: 4 },
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 9, rank: 5 },
    { nickname: "모험파인", avatar_key: null, find_count: 8, rank: 6 },
  ],
};

export const FAME_SUMMARY_BY_FILTER: Record<FameFilter, FameSummarySnapshot> = {
  all: {
    topHunter: { nickname: "master", subtitle: "오늘 최고의 사냥꾼", findCount: 12 },
    weeklyFindCount: 42,
    recentTreasureName: "황금 상자",
    recentTreasureLocation: "종로구",
    recentTreasureTimeLabel: "3분 전",
    myRecentTreasureName: "보물상자 명칭",
    myRecentFoundAtLabel: "2일 전",
  },
  today: {
    topHunter: { nickname: "master", subtitle: "오늘 최고의 사냥꾼", findCount: 12 },
    weeklyFindCount: 12,
    recentTreasureName: "광화문 상자",
    recentTreasureLocation: "종로구",
    recentTreasureTimeLabel: "방금 전",
    myRecentTreasureName: "광화문 상자",
    myRecentFoundAtLabel: "오늘",
  },
  week: {
    topHunter: { nickname: "master", subtitle: "이번 주 최고의 사냥꾼", findCount: 42 },
    weeklyFindCount: 42,
    recentTreasureName: "한강 상자",
    recentTreasureLocation: "동작구",
    recentTreasureTimeLabel: "3분 전",
    myRecentTreasureName: "보물상자 명칭",
    myRecentFoundAtLabel: "2일 전",
  },
  month: {
    topHunter: { nickname: "진짜헌터", subtitle: "이번 달 최고의 사냥꾼", findCount: 82 },
    weeklyFindCount: 138,
    recentTreasureName: "성수 상자",
    recentTreasureLocation: "성동구",
    recentTreasureTimeLabel: "1시간 전",
    myRecentTreasureName: "성수 상자",
    myRecentFoundAtLabel: "5일 전",
  },
  nearby: {
    topHunter: { nickname: "보물지도주인", subtitle: "내 주변에서 잘 건지는 헌터", findCount: 15 },
    weeklyFindCount: 9,
    recentTreasureName: "골목 상자",
    recentTreasureLocation: "동작구",
    recentTreasureTimeLabel: "12분 전",
    myRecentTreasureName: "한강 산책로 상자",
    myRecentFoundAtLabel: "어제",
  },
};
