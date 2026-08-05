import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { getFameRankingRows, mapHallOfFameRowToRankingRow, type FameRankingRow } from "@/lib/fame/mappers";
import type { FameFilter, MockHallOfFame } from "@/lib/fame/mock-data";

export type FameDataSource = "supabase" | "mock";

export type GetFameRankingRowsResult = {
  rows: FameRankingRow[];
  source: FameDataSource;
  errorMessage?: string;
};

const HALL_OF_FAME_SELECT = "nickname, avatar_key, find_count, rank";

/**
 * hunter rankings 조회.
 * `hall_of_fame` view는 기간별 집계 없이 all-time 랭킹만 제공하므로
 * "전체" 필터만 실제 DB로 연결한다. 나머지 기간 필터, 세션 없음, 조회 실패는 mock 유지.
 * 상단 4개 고정 영역(오늘의 헌터/이번주 발견수/최근 발견 상자/my record)은
 * 이 작업 범위가 아니라 기존 mock 그대로 둔다.
 */
export async function getFameRankingRowsData(filter: FameFilter): Promise<GetFameRankingRowsResult> {
  const session = await getAuthenticatedUserSession();

  if (!session || filter !== "all") {
    return { rows: getFameRankingRows(filter), source: "mock" };
  }

  const { data, error } = await session.client
    .from("hall_of_fame")
    .select(HALL_OF_FAME_SELECT)
    .order("rank", { ascending: true })
    .limit(10);

  if (error) {
    return {
      rows: getFameRankingRows(filter),
      source: "mock",
      errorMessage: "랭킹을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  const rows = (data ?? []) as MockHallOfFame[];

  return {
    rows: rows.map((row) => mapHallOfFameRowToRankingRow(row, filter)),
    source: "supabase",
  };
}
