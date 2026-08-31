import { ADMIN_CATEGORY_LABEL, type AdminSupportInquiry } from "./mock-inquiries";
import {
  ADMIN_REWARD_RETRY_STATUS_LABEL,
  ADMIN_REWARD_STATUS_LABEL,
  type AdminRewardRequestListItem,
} from "./mock-reward-requests";
import {
  REWARD_STATUS_DISPLAY,
  SUCCESS_REWARD_STATUSES,
  type DashboardClaimRow,
  type DashboardFailureRow,
  type DashboardInquiryRow,
  type DashboardSectionSummaryCard,
} from "./mock-dashboard";

export type AdminDashboardRecent = {
  claimRows: DashboardClaimRow[];
  failureRows: DashboardFailureRow[];
  inquiryRows: DashboardInquiryRow[];
  claimSummaries: DashboardSectionSummaryCard[];
  failureSummaries: DashboardSectionSummaryCard[];
  inquirySummaries: DashboardSectionSummaryCard[];
};

const RECENT_ROW_LIMIT = 8;

/** Asia/Seoul(KST, UTC+9) 기준 오늘 00:00의 epoch ms. */
function kstTodayStartMs(now: Date) {
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0) - 9 * 60 * 60 * 1000;
}

function isOnOrAfter(value: string | null, thresholdMs: number) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= thresholdMs;
}

/**
 * 실데이터(보상/문의 서비스 조회 결과)로 대시보드 하단 '최근 현황' 섹션을 구성한다.
 * 화면에 가짜 숫자를 만들지 않도록 모든 값은 전달받은 목록에서만 계산한다.
 */
export function buildAdminDashboardRecent(
  rewards: AdminRewardRequestListItem[],
  inquiries: AdminSupportInquiry[],
  now: Date = new Date(),
): AdminDashboardRecent {
  const todayStartMs = kstTodayStartMs(now);
  const fourHoursAgoMs = now.getTime() - 4 * 60 * 60 * 1000;

  const successItems = rewards.filter((item) => SUCCESS_REWARD_STATUSES.has(item.status));
  const failedItems = rewards.filter((item) => item.status === "failed");

  const claimRows: DashboardClaimRow[] = [...successItems]
    .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
    .slice(0, RECENT_ROW_LIMIT)
    .map((item) => ({
      id: item.rewardId,
      claimId: `CLM-${item.rewardId.slice(0, 8).toUpperCase()}`,
      treasureTitle: item.treasureTitle,
      treasureHref: item.treasureBoxId ? `/admin/treasures/${item.treasureBoxId}` : "/admin/treasures",
      userNickname: item.userNickname,
      rewardStatus: item.status,
      rewardStatusLabel: REWARD_STATUS_DISPLAY[item.status] ?? ADMIN_REWARD_STATUS_LABEL[item.status],
      claimedAt: item.claimedAt,
      href: `/admin/rewards/${item.rewardId}`,
    }));

  const failureRows: DashboardFailureRow[] = [...failedItems]
    .map((item) => ({
      id: item.rewardId,
      rewardId: item.rewardId,
      treasureTitle: item.treasureTitle,
      treasureHref: item.treasureBoxId ? `/admin/treasures/${item.treasureBoxId}` : "/admin/treasures",
      userNickname: item.userNickname,
      failureCode: item.lastFailureCode ?? "-",
      failedAt: item.failedAt ?? item.claimedAt,
      retryStatus: item.retryRequestStatus,
      retryStatusLabel: ADMIN_REWARD_RETRY_STATUS_LABEL[item.retryRequestStatus],
      href: `/admin/rewards/${item.rewardId}`,
    }))
    .sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime())
    .slice(0, RECENT_ROW_LIMIT);

  const inquiryRows: DashboardInquiryRow[] = [...inquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, RECENT_ROW_LIMIT)
    .map((item) => ({
      id: item.id,
      inquiryId: `INQ-${item.id.slice(0, 8).toUpperCase()}`,
      categoryLabel: ADMIN_CATEGORY_LABEL[item.category],
      userNickname: item.user_nickname,
      statusLabel: item.status === "resolved" || item.status === "answered" || item.status === "closed" ? "answered" : "in_progress",
      createdAt: item.created_at,
      href: `/admin/inquiries/${item.id}`,
    }));

  const todayClaims = successItems.filter((item) => isOnOrAfter(item.claimedAt, todayStartMs)).length;
  const todayRewards = rewards.filter(
    (item) => (item.status === "ready" || item.status === "issued") && isOnOrAfter(item.createdAt, todayStartMs),
  ).length;
  const recentClaims = successItems.filter((item) => isOnOrAfter(item.claimedAt, fourHoursAgoMs)).length;

  const claimSummaries: DashboardSectionSummaryCard[] = [
    { title: "오늘 획득 성공", value: String(todayClaims), description: "claimed_at 오늘 기준" },
    { title: "오늘 보상 생성", value: String(todayRewards), description: "ready / issued" },
    { title: "최근 4시간 획득", value: String(recentClaims), description: "claimed_at 기준" },
  ];

  const retryWaiting = failedItems.filter(
    (item) => item.retryRequestStatus === "requested" || item.retryRequestStatus === "in_progress",
  ).length;
  const codeCounts = new Map<string, number>();
  for (const item of failedItems) {
    if (!item.lastFailureCode) continue;
    codeCounts.set(item.lastFailureCode, (codeCounts.get(item.lastFailureCode) ?? 0) + 1);
  }
  const topCode = [...codeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const failureSummaries: DashboardSectionSummaryCard[] = [
    { title: "미처리 실패", value: String(failedItems.length), description: "failed 상태" },
    { title: "재처리 대기", value: String(retryWaiting), description: "requested / in_progress" },
    { title: "최근 실패 사유", value: topCode, description: "최다 실패 코드" },
  ];

  const openInquiries = inquiries.filter(
    (item) => item.status !== "resolved" && item.status !== "answered" && item.status !== "closed",
  ).length;
  const todayInquiries = inquiries.filter((item) => isOnOrAfter(item.created_at, todayStartMs)).length;
  const answeredInquiries = inquiries.length - openInquiries;

  const inquirySummaries: DashboardSectionSummaryCard[] = [
    { title: "미처리 문의", value: String(openInquiries), description: "reading 상태" },
    { title: "오늘 접수", value: String(todayInquiries), description: "당일 문의 유입" },
    { title: "답변 완료", value: String(answeredInquiries), description: "resolved 상태" },
  ];

  return { claimRows, failureRows, inquiryRows, claimSummaries, failureSummaries, inquirySummaries };
}
