import { FAME_ASSETS } from "@/lib/fame/assets";
import {
  FAME_FIXED_SUMMARY,
  MOCK_HALL_OF_FAME,
  type FameFilter,
  type MockHallOfFame,
} from "@/lib/fame/mock-data";
import { MOCK_PROFILE, findCharacter } from "@/lib/profile/mock-data";

export type FameTopHunterCard = {
  nickname: string;
  subtitle: string;
  findCount: number;
  avatarSrc: string;
};

export type FameSummaryCards = {
  weeklyFindCount: string;
  recentTreasureName: string;
  recentTreasureMeta: string;
};

export type FameMyRecordCard = {
  rankLabel: string;
  totalFindsLabel: string;
  recentTreasureName: string;
  recentFoundAtLabel: string;
};

export type FameRankingRow = {
  rank: number;
  nickname: string;
  avatarSrc: string;
  findCountLabel: string;
  locationLabel: string;
  lastFoundAtLabel: string;
};

function resolveAvatarSrc(row: MockHallOfFame) {
  if (row.rank === 1) return FAME_ASSETS.images.rank1;
  if (row.rank === 2) return FAME_ASSETS.images.rank2;
  if (row.rank === 3) return FAME_ASSETS.images.rank3;
  if (!row.avatar_key) return FAME_ASSETS.images.rank1;
  return findCharacter(row.avatar_key).icon;
}

function resolveLocationLabel(filter: FameFilter, rank: number) {
  const byFilter: Record<FameFilter, string[]> = {
    all: ["한강공원", "종로구", "성수동", "잠실", "연남동", "광화문", "동작구", "이태원", "망원동", "서촌"],
    today: ["종로구", "광화문", "동작구", "성수동", "잠실", "한강공원"],
    week: ["동작구", "종로구", "한강공원", "성수동", "잠실", "망원동", "서촌"],
    month: ["한강공원", "종로구", "성수동", "잠실", "연남동", "광화문", "동작구", "서촌"],
    year: ["한강공원", "종로구", "성수동", "잠실", "연남동", "광화문", "동작구", "이태원", "망원동", "서촌"],
  };

  return byFilter[filter][rank - 1] ?? "근처";
}

function resolveTimeLabel(filter: FameFilter, rank: number) {
  const byFilter: Record<FameFilter, string[]> = {
    all: ["5분 전", "12분 전", "1시간 전", "2시간 전", "오늘", "1일 전", "2일 전", "3일 전", "4일 전", "5일 전"],
    today: ["방금 전", "5분 전", "12분 전", "34분 전", "1시간 전", "2시간 전"],
    week: ["3분 전", "12분 전", "1시간 전", "오늘", "어제", "2일 전", "3일 전"],
    month: ["1시간 전", "오늘", "어제", "2일 전", "4일 전", "6일 전", "1주 전", "2주 전"],
    year: ["오늘", "어제", "3일 전", "1주 전", "2주 전", "1달 전", "2달 전", "3달 전", "4달 전", "5달 전"],
  };

  return byFilter[filter][rank - 1] ?? "최근";
}

/** 상단 고정: 오늘 최고의 사냥꾼 */
export function getFameTopHunter(): FameTopHunterCard {
  const summary = FAME_FIXED_SUMMARY;

  return {
    nickname: summary.topHunter.nickname,
    subtitle: summary.topHunter.subtitle,
    findCount: summary.topHunter.findCount,
    avatarSrc: FAME_ASSETS.images.topHunter,
  };
}

/** 상단 고정: 이번 주 발견 수 / 최근 발견된 상자 */
export function getFameSummary(): FameSummaryCards {
  const summary = FAME_FIXED_SUMMARY;

  return {
    weeklyFindCount: `${summary.weeklyFindCount} finds`,
    recentTreasureName: summary.recentTreasureName,
    recentTreasureMeta: `${summary.recentTreasureTimeLabel} · ${summary.recentTreasureLocation}`,
  };
}

/** 상단 고정: my record */
export function getFameMyRecord(): FameMyRecordCard {
  const base = FAME_FIXED_SUMMARY;

  return {
    rankLabel: `#${MOCK_PROFILE.stats.rank}`,
    totalFindsLabel: String(MOCK_PROFILE.stats.treasuresFound).padStart(2, "0"),
    recentTreasureName: base.myRecentTreasureName,
    recentFoundAtLabel: base.myRecentFoundAtLabel,
  };
}

/** hall_of_fame view row 한 건 → ranking row UI 매핑. mock/실 데이터 공용. */
export function mapHallOfFameRowToRankingRow(row: MockHallOfFame, filter: FameFilter): FameRankingRow {
  return {
    rank: row.rank,
    nickname: row.nickname,
    avatarSrc: resolveAvatarSrc(row),
    findCountLabel: `보물 ${row.find_count}개 발견`,
    locationLabel: resolveLocationLabel(filter, row.rank),
    lastFoundAtLabel: resolveTimeLabel(filter, row.rank),
  };
}

/** 하단만 필터 연동: hunter rankings */
export function getFameRankingRows(filter: FameFilter): FameRankingRow[] {
  return MOCK_HALL_OF_FAME[filter].map((row) => mapHallOfFameRowToRankingRow(row, filter));
}
