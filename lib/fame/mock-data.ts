export type MockHallOfFame = {
  nickname: string;
  avatar_key: string | null;
  find_count: number;
  rank: number;
};

/** 기간 필터. hunter rankings 리스트에만 적용한다. */
export type FameFilter = "all" | "today" | "week" | "month" | "year";

/**
 * 상단 고정 영역 스냅샷.
 * 기간 필터와 무관하게 항상 동일한 값을 쓴다.
 * - 오늘 최고의 사냥꾼
 * - 이번 주 발견된 갯수
 * - 최근 발견된 상자
 * - my record 의 recent 문구
 */
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
  { key: "year", label: "이번 년도", rotateClass: "rotate-[0.5deg]" },
];

/** 하단 hunter rankings 전용. 필터별로 다른 리스트. */
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
  year: [
    { nickname: "진짜헌터", avatar_key: "tracker", find_count: 210, rank: 1 },
    { nickname: "보물지도주인", avatar_key: "wanderer", find_count: 198, rank: 2 },
    { nickname: "루피너스", avatar_key: "hunter", find_count: 176, rank: 3 },
    { nickname: "master", avatar_key: "hunter", find_count: 165, rank: 4 },
    { nickname: "반짝고등어", avatar_key: "cat", find_count: 142, rank: 5 },
    { nickname: "한강추적자", avatar_key: "explorer", find_count: 131, rank: 6 },
    { nickname: "지도부수기", avatar_key: "guide", find_count: 118, rank: 7 },
    { nickname: "탐색왕김돌", avatar_key: "newbie", find_count: 104, rank: 8 },
    { nickname: "노랑상자", avatar_key: "tracker", find_count: 96, rank: 9 },
    { nickname: "모험파인", avatar_key: null, find_count: 88, rank: 10 },
  ],
};

/** 상단 고정 영역 전용. 필터 키와 무관. */
export const FAME_FIXED_SUMMARY: FameSummarySnapshot = {
  topHunter: { nickname: "master", subtitle: "오늘 최고의 사냥꾼", findCount: 12 },
  weeklyFindCount: 42,
  recentTreasureName: "황금 상자",
  recentTreasureLocation: "종로구",
  recentTreasureTimeLabel: "3분 전",
  myRecentTreasureName: "보물상자 명칭",
  myRecentFoundAtLabel: "2일 전",
};
