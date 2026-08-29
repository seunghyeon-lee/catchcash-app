import { getAdminContext, type AdminDataSource } from "./admin-context";

export type AdminDashboardStats = {
  /** 앱 지도에 노출 중(active)인 보물상자 수 */
  visibleTreasure: number;
  /** 오늘(Asia/Seoul) 성공한 보물 획득 수 */
  claimSuccessToday: number;
  /** 발급 실패(failed) 상태 보상 수 */
  issueFailed: number;
  /** 미처리(reading) 문의 수 */
  openInquiry: number;
};

export type AdminDashboardStatsResult = {
  stats: AdminDashboardStats | null;
  source: AdminDataSource;
  message?: string;
};

type DashboardStatsRow = {
  active_treasure_count: number | null;
  failed_reward_count: number | null;
  open_inquiry_count: number | null;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 대시보드 지표를 표시하고 있습니다.";
const ERROR_MESSAGE = "대시보드 지표를 불러오지 못해 예시 데이터를 표시합니다.";

/** Asia/Seoul(KST, UTC+9) 기준 오늘 00:00에 해당하는 UTC ISO 문자열. */
function kstTodayStartIso() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const startUtcMs = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0) - 9 * 60 * 60 * 1000;
  return new Date(startUtcMs).toISOString();
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStatsResult> {
  const context = await getAdminContext();
  if (!context) {
    return { stats: null, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const [statsResult, todayClaimResult] = await Promise.all([
      context.client
        .from("admin_dashboard_stats")
        .select("active_treasure_count, failed_reward_count, open_inquiry_count")
        .maybeSingle(),
      context.client
        .from("treasure_claims")
        .select("id", { count: "exact", head: true })
        .eq("result", "success")
        .gte("created_at", kstTodayStartIso()),
    ]);

    if (statsResult.error) throw new Error(statsResult.error.message);

    const row = (statsResult.data ?? null) as DashboardStatsRow | null;
    if (!row) return { stats: null, source: "supabase" };

    const stats: AdminDashboardStats = {
      visibleTreasure: row.active_treasure_count ?? 0,
      claimSuccessToday: todayClaimResult.count ?? 0,
      issueFailed: row.failed_reward_count ?? 0,
      openInquiry: row.open_inquiry_count ?? 0,
    };

    return { stats, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminDashboardStats는 mock으로 fallback합니다:", error);
    return { stats: null, source: "mock", message: ERROR_MESSAGE };
  }
}
