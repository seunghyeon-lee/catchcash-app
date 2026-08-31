import { ADMIN_CATEGORY_LABEL, MOCK_ADMIN_INQUIRIES, formatAdminDate } from "@/lib/admin/mock-inquiries";
import {
  ADMIN_REWARD_RETRY_STATUS_LABEL,
  ADMIN_REWARD_STATUS_LABEL,
  MOCK_ADMIN_REWARD_REQUESTS,
  type AdminRewardRetryStatus,
  type AdminRewardStatus,
} from "@/lib/admin/mock-reward-requests";
import { MOCK_ADMIN_TREASURES } from "@/lib/admin/mock-treasures";

/** mock 보상 데이터가 몰려 있는 일자. shell에서 '오늘' 집계 기준으로 사용한다. */
export const MOCK_DASHBOARD_TODAY = "2026-08-09";

export type DashboardMetricKey = "visible_treasure" | "claim_success" | "issue_failed" | "open_inquiry";

export type DashboardMetricCard = {
  key: DashboardMetricKey;
  title: string;
  value: number;
  description: string;
  href: string;
};

export type DashboardQuickLink = {
  label: string;
  href: string | null;
  enabled: boolean;
};

export type DashboardSectionSummaryCard = {
  title: string;
  value: string;
  description: string;
};

export type DashboardClaimRow = {
  id: string;
  claimId: string;
  treasureTitle: string;
  treasureHref: string;
  userNickname: string;
  rewardStatus: AdminRewardStatus;
  rewardStatusLabel: string;
  claimedAt: string;
  href: string;
};

export type DashboardFailureRow = {
  id: string;
  rewardId: string;
  treasureTitle: string;
  treasureHref: string;
  userNickname: string;
  failureCode: string;
  failedAt: string;
  retryStatus: AdminRewardRetryStatus;
  retryStatusLabel: string;
  href: string;
};

export type DashboardInquiryRow = {
  id: string;
  inquiryId: string;
  categoryLabel: string;
  userNickname: string;
  statusLabel: string;
  createdAt: string;
  href: string;
};

export const SUCCESS_REWARD_STATUSES = new Set<AdminRewardStatus>(["ready", "issued", "used"]);

export const REWARD_STATUS_DISPLAY: Record<AdminRewardStatus, string> = {
  ready: "발급 전",
  issued: "발급 완료",
  failed: "발급 실패",
  used: "사용 완료",
  expired: "만료",
  canceled: "취소",
};

function isSameMockDay(value: string | null, day: string) {
  if (!value) return false;
  return value.slice(0, 10) === day;
}

function treasureHref(treasureBoxId: string) {
  return `/admin/treasures/${treasureBoxId}`;
}

export function getDashboardMetricCards(): DashboardMetricCard[] {
  const visibleTreasure = MOCK_ADMIN_TREASURES.filter((item) => item.calculatedStatus === "visible").length;

  const claimSuccess = MOCK_ADMIN_REWARD_REQUESTS.filter(
    (item) => SUCCESS_REWARD_STATUSES.has(item.status) && isSameMockDay(item.claimedAt, MOCK_DASHBOARD_TODAY),
  ).length;

  const issueFailed = MOCK_ADMIN_REWARD_REQUESTS.filter(
    (item) => item.status === "failed" && isSameMockDay(item.failedAt ?? item.claimedAt, MOCK_DASHBOARD_TODAY),
  ).length;

  const openInquiry = MOCK_ADMIN_INQUIRIES.filter((item) => item.status === "reading").length;

  return [
    {
      key: "visible_treasure",
      title: "Visible 보물",
      value: visibleTreasure,
      description: "현재 앱 지도 노출 중",
      href: "/admin/treasures?calculatedStatus=visible",
    },
    {
      key: "claim_success",
      title: "오늘 획득 성공",
      value: claimSuccess,
      description: "오늘 claimed_at 기준",
      href: "/admin/reward-requests?date=today&status=ready,issued,used",
    },
    {
      key: "issue_failed",
      title: "오늘 발급 실패",
      value: issueFailed,
      description: "failed 상태 · 오늘 기준",
      href: "/admin/reward-requests?date=today&status=failed",
    },
    {
      key: "open_inquiry",
      title: "미처리 문의",
      value: openInquiry,
      description: "open + in_progress 합산",
      href: "/admin/inquiries?status=open,in_progress",
    },
  ];
}

export function getClaimSectionSummaries(): DashboardSectionSummaryCard[] {
  const todayClaims = MOCK_ADMIN_REWARD_REQUESTS.filter(
    (item) => SUCCESS_REWARD_STATUSES.has(item.status) && isSameMockDay(item.claimedAt, MOCK_DASHBOARD_TODAY),
  ).length;

  const todayRewards = MOCK_ADMIN_REWARD_REQUESTS.filter(
    (item) =>
      (item.status === "ready" || item.status === "issued") && isSameMockDay(item.claimedAt, MOCK_DASHBOARD_TODAY),
  ).length;

  const recentWindowClaims = MOCK_ADMIN_REWARD_REQUESTS.filter((item) => SUCCESS_REWARD_STATUSES.has(item.status)).length;

  return [
    { title: "오늘 획득 성공", value: String(todayClaims), description: "claimed_at 오늘 기준" },
    { title: "오늘 보상 생성", value: String(todayRewards), description: "ready / issued" },
    { title: "최근 4시간 획득", value: String(Math.min(recentWindowClaims, 3)), description: "예시 데이터" },
  ];
}

export function getFailureSectionSummaries(): DashboardSectionSummaryCard[] {
  const openFailures = MOCK_ADMIN_REWARD_REQUESTS.filter((item) => item.status === "failed").length;
  const retryWaiting = MOCK_ADMIN_REWARD_REQUESTS.filter(
    (item) => item.status === "failed" && (item.retryRequestStatus === "requested" || item.retryRequestStatus === "in_progress"),
  ).length;

  const codeCounts = new Map<string, number>();
  for (const item of MOCK_ADMIN_REWARD_REQUESTS) {
    if (item.status !== "failed" || !item.lastFailureCode) continue;
    codeCounts.set(item.lastFailureCode, (codeCounts.get(item.lastFailureCode) ?? 0) + 1);
  }
  const topCode = [...codeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return [
    { title: "미처리 실패", value: String(openFailures), description: "failed · 재처리 전" },
    { title: "재처리 대기", value: String(retryWaiting), description: "requested / in_progress" },
    { title: "최근 실패 사유", value: topCode, description: "최다 실패 코드" },
  ];
}

export function getInquirySectionSummaries(): DashboardSectionSummaryCard[] {
  const openCount = MOCK_ADMIN_INQUIRIES.filter((item) => item.status === "reading").length;
  const todayCount = MOCK_ADMIN_INQUIRIES.filter((item) => isSameMockDay(item.created_at, "2026-07-28")).length || MOCK_ADMIN_INQUIRIES.length;

  return [
    { title: "미처리 문의", value: String(openCount), description: "open + in_progress" },
    { title: "오늘 접수", value: String(todayCount), description: "당일 문의 유입" },
    { title: "평균 응답 대기", value: "4.2시간", description: "예시 데이터" },
  ];
}

export function getDashboardClaimRows(limit = 8): DashboardClaimRow[] {
  return MOCK_ADMIN_REWARD_REQUESTS.filter((item) => SUCCESS_REWARD_STATUSES.has(item.status))
    .map((item) => ({
      id: item.rewardId,
      claimId: `clm-${item.rewardId.replace("reward-", "")}`,
      treasureTitle: item.treasureTitle,
      treasureHref: treasureHref(item.treasureBoxId),
      userNickname: item.userNickname,
      rewardStatus: item.status,
      rewardStatusLabel: REWARD_STATUS_DISPLAY[item.status] ?? ADMIN_REWARD_STATUS_LABEL[item.status],
      claimedAt: item.claimedAt,
      href: `/admin/rewards/${item.rewardId}`,
    }))
    .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
    .slice(0, limit);
}

export function getDashboardFailureRows(limit = 8): DashboardFailureRow[] {
  return MOCK_ADMIN_REWARD_REQUESTS.filter((item) => item.status === "failed")
    .map((item) => ({
      id: item.rewardId,
      rewardId: item.rewardId,
      treasureTitle: item.treasureTitle,
      treasureHref: treasureHref(item.treasureBoxId),
      userNickname: item.userNickname,
      failureCode: item.lastFailureCode ?? "-",
      failedAt: item.failedAt ?? item.claimedAt,
      retryStatus: item.retryRequestStatus,
      retryStatusLabel: ADMIN_REWARD_RETRY_STATUS_LABEL[item.retryRequestStatus],
      href: `/admin/rewards/${item.rewardId}`,
    }))
    .sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime())
    .slice(0, limit);
}

export function getDashboardInquiryRows(limit = 8): DashboardInquiryRow[] {
  return [...MOCK_ADMIN_INQUIRIES]
    .map((item) => ({
      id: item.id,
      inquiryId: `inq-${item.id.slice(0, 8)}`,
      categoryLabel: ADMIN_CATEGORY_LABEL[item.category],
      userNickname: item.user_nickname,
      statusLabel: item.status === "reading" ? "in_progress" : "answered",
      createdAt: item.created_at,
      href: `/admin/inquiries/${item.id}`,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getDashboardQuickLinks(role: "super_admin" | "operator" | "viewer" = "super_admin"): DashboardQuickLink[] {
  return [
    { label: "보상 목록", href: "/admin/reward-requests", enabled: true },
    { label: "보물상자 목록", href: "/admin/treasures", enabled: true },
    { label: "문의 목록", href: "/admin/inquiries", enabled: true },
    {
      label: "운영 로그",
      href: role === "viewer" ? null : "/admin/operation-logs",
      enabled: role !== "viewer",
    },
  ];
}

export { formatAdminDate as formatDashboardDateTime };
