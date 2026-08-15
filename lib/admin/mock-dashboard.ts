import { MOCK_ADMIN_INQUIRIES, formatAdminDate } from "@/lib/admin/mock-inquiries";
import { MOCK_ADMIN_REWARD_REQUESTS, ADMIN_REWARD_STATUS_LABEL } from "@/lib/admin/mock-reward-requests";
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

export type DashboardRecentKind = "claim_success" | "issue_failed" | "inquiry";

export type DashboardRecentItem = {
  id: string;
  kind: DashboardRecentKind;
  kindLabel: string;
  title: string;
  userLabel: string;
  statusLabel: string;
  occurredAt: string;
  href: string;
};

export type DashboardQuickLink = {
  label: string;
  href: string | null;
  enabled: boolean;
};

const SUCCESS_REWARD_STATUSES = new Set(["ready", "issued", "used"]);

function isSameMockDay(value: string | null, day: string) {
  if (!value) return false;
  return value.slice(0, 10) === day;
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
      href: "/admin/treasures?visibility=visible",
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

export function getDashboardRecentItems(limit = 8): DashboardRecentItem[] {
  const claimItems: DashboardRecentItem[] = MOCK_ADMIN_REWARD_REQUESTS.filter((item) =>
    SUCCESS_REWARD_STATUSES.has(item.status),
  ).map((item) => ({
    id: `claim-${item.rewardId}`,
    kind: "claim_success",
    kindLabel: "보물 획득",
    title: item.treasureTitle,
    userLabel: item.userNickname,
    statusLabel: ADMIN_REWARD_STATUS_LABEL[item.status],
    occurredAt: item.claimedAt,
    href: `/admin/rewards/${item.rewardId}`,
  }));

  const failedItems: DashboardRecentItem[] = MOCK_ADMIN_REWARD_REQUESTS.filter((item) => item.status === "failed").map(
    (item) => ({
      id: `fail-${item.rewardId}`,
      kind: "issue_failed",
      kindLabel: "발급 실패",
      title: item.productName ?? item.treasureTitle,
      userLabel: item.userNickname,
      statusLabel: ADMIN_REWARD_STATUS_LABEL[item.status],
      occurredAt: item.failedAt ?? item.claimedAt,
      href: `/admin/rewards/${item.rewardId}`,
    }),
  );

  const inquiryItems: DashboardRecentItem[] = MOCK_ADMIN_INQUIRIES.filter((item) => item.status === "reading").map(
    (item) => ({
      id: `inquiry-${item.id}`,
      kind: "inquiry",
      kindLabel: "문의",
      title: item.title,
      userLabel: item.user_nickname,
      statusLabel: "in_progress",
      occurredAt: item.created_at,
      href: `/admin/inquiries/${item.id}`,
    }),
  );

  return [...claimItems, ...failedItems, ...inquiryItems]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

export function getDashboardQuickLinks(role: "super_admin" | "operator" | "viewer" = "super_admin"): DashboardQuickLink[] {
  const links: DashboardQuickLink[] = [
    { label: "상품 목록", href: "/admin/products", enabled: true },
    { label: "매칭 목록", href: "/admin/mappings", enabled: true },
    { label: "유저 목록", href: null, enabled: false },
    {
      label: "운영 로그",
      href: role === "viewer" ? null : "/admin/operation-logs",
      enabled: role !== "viewer",
    },
  ];

  return links;
}

export { formatAdminDate as formatDashboardDateTime };
