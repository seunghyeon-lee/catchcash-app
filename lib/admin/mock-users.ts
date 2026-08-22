export type AdminUserStatus = "active" | "suspended" | "deleted" | "inactive";
export type AdminUserLoginProvider = "google" | "kakao" | "apple";

export type AdminUserListItem = {
  id: string;
  publicId: string;
  nickname: string;
  provider: AdminUserLoginProvider;
  status: AdminUserStatus;
  joinedAt: string;
  lastActiveAt: string | null;
  treasureFoundCount: number;
  rewardCount: number;
  inquiryCount: number;
};

export type AdminUserDetail = AdminUserListItem & {
  openInquiryCount: number;
  retryRequestCount: number;
  inventoryRewardCount: number;
  internalMemo: string | null;
  suspendedAt: string | null;
  suspendReason: string | null;
};

export type AdminUserRewardSummaryStatus = "ready" | "issued" | "failed" | "used" | "expired" | "canceled";

export type AdminUserRewardSummaryItem = {
  rewardId: string;
  claimedAt: string;
  treasureTitle: string;
  productName: string;
  status: AdminUserRewardSummaryStatus;
  providerRequestId: string | null;
  hasRetryRequest: boolean;
};

export type AdminUserInquirySummaryStatus = "open" | "in_progress" | "answered" | "closed";
export type AdminUserInquirySummaryCategory = "usage" | "coupon" | "reward" | "account" | "error" | "improvement" | "other";

export type AdminUserInquirySummaryItem = {
  inquiryId: string;
  createdAt: string;
  category: AdminUserInquirySummaryCategory;
  title: string;
  status: AdminUserInquirySummaryStatus;
  hasAnswer: boolean;
};

export type AdminUserActivityType = "login" | "treasure_claim" | "reward_issue" | "inquiry_created" | "profile_updated";

export type AdminUserActivityItem = {
  id: string;
  occurredAt: string;
  type: AdminUserActivityType;
  summary: string;
  targetId: string | null;
};

export type AdminUserSecurityLogSummaryItem = {
  id: string;
  occurredAt: string;
  eventType: string;
  summary: string;
  region: string;
  result: "observed" | "suspected" | "blocked";
};

export const ADMIN_USER_STATUS_LABEL: Record<AdminUserStatus, string> = {
  active: "active",
  suspended: "suspended",
  deleted: "deleted",
  inactive: "inactive",
};

export const ADMIN_USER_PROVIDER_LABEL: Record<AdminUserLoginProvider, string> = {
  google: "Google",
  kakao: "Kakao",
  apple: "Apple",
};

export const ADMIN_USER_REWARD_STATUS_LABEL: Record<AdminUserRewardSummaryStatus, string> = {
  ready: "ready",
  issued: "issued",
  failed: "failed",
  used: "used",
  expired: "expired",
  canceled: "canceled",
};

export const ADMIN_USER_INQUIRY_STATUS_LABEL: Record<AdminUserInquirySummaryStatus, string> = {
  open: "open",
  in_progress: "in_progress",
  answered: "answered",
  closed: "closed",
};

export const ADMIN_USER_INQUIRY_CATEGORY_LABEL: Record<AdminUserInquirySummaryCategory, string> = {
  usage: "이용 문의",
  coupon: "쿠폰 문의",
  reward: "보상 문의",
  account: "계정 문의",
  error: "오류 제보",
  improvement: "개선 문의",
  other: "기타",
};

export const ADMIN_USER_ACTIVITY_LABEL: Record<AdminUserActivityType, string> = {
  login: "로그인",
  treasure_claim: "보물 획득",
  reward_issue: "보상 발급",
  inquiry_created: "문의 등록",
  profile_updated: "프로필 수정",
};

export const MOCK_ADMIN_USERS: AdminUserListItem[] = [
  {
    id: "user-202608-001",
    publicId: "USR-2048",
    nickname: "보물헌터01",
    provider: "kakao",
    status: "active",
    joinedAt: "2026-08-01T10:12:00+09:00",
    lastActiveAt: "2026-08-22T09:45:00+09:00",
    treasureFoundCount: 18,
    rewardCount: 12,
    inquiryCount: 1,
  },
  {
    id: "user-202608-002",
    publicId: "USR-1182",
    nickname: "숲길몽",
    provider: "google",
    status: "active",
    joinedAt: "2026-08-03T14:20:00+09:00",
    lastActiveAt: "2026-08-21T20:10:00+09:00",
    treasureFoundCount: 9,
    rewardCount: 7,
    inquiryCount: 2,
  },
  {
    id: "user-202607-003",
    publicId: "USR-3310",
    nickname: "달리는냥이",
    provider: "apple",
    status: "active",
    joinedAt: "2026-07-28T18:05:00+09:00",
    lastActiveAt: "2026-08-20T17:36:00+09:00",
    treasureFoundCount: 15,
    rewardCount: 10,
    inquiryCount: 1,
  },
  {
    id: "user-202607-004",
    publicId: "USR-7741",
    nickname: "연남탐험가",
    provider: "kakao",
    status: "inactive",
    joinedAt: "2026-07-24T11:30:00+09:00",
    lastActiveAt: "2026-07-30T08:22:00+09:00",
    treasureFoundCount: 4,
    rewardCount: 3,
    inquiryCount: 0,
  },
  {
    id: "user-202607-005",
    publicId: "USR-4920",
    nickname: "지도수집가",
    provider: "google",
    status: "active",
    joinedAt: "2026-07-18T15:40:00+09:00",
    lastActiveAt: "2026-08-22T11:00:00+09:00",
    treasureFoundCount: 22,
    rewardCount: 16,
    inquiryCount: 3,
  },
  {
    id: "user-202607-006",
    publicId: "USR-8190",
    nickname: "밤산책러",
    provider: "apple",
    status: "suspended",
    joinedAt: "2026-07-12T20:10:00+09:00",
    lastActiveAt: "2026-08-06T20:12:00+09:00",
    treasureFoundCount: 6,
    rewardCount: 2,
    inquiryCount: 4,
  },
  {
    id: "user-202606-007",
    publicId: "USR-2711",
    nickname: "행운상자",
    provider: "kakao",
    status: "active",
    joinedAt: "2026-06-29T13:00:00+09:00",
    lastActiveAt: "2026-08-18T12:40:00+09:00",
    treasureFoundCount: 31,
    rewardCount: 25,
    inquiryCount: 1,
  },
  {
    id: "user-202606-008",
    publicId: "USR-6012",
    nickname: "취소된사냥",
    provider: "google",
    status: "deleted",
    joinedAt: "2026-06-18T09:40:00+09:00",
    lastActiveAt: null,
    treasureFoundCount: 2,
    rewardCount: 0,
    inquiryCount: 1,
  },
  {
    id: "user-202606-009",
    publicId: "USR-5127",
    nickname: "강변러너",
    provider: "apple",
    status: "active",
    joinedAt: "2026-06-10T07:50:00+09:00",
    lastActiveAt: "2026-08-19T07:30:00+09:00",
    treasureFoundCount: 12,
    rewardCount: 8,
    inquiryCount: 0,
  },
  {
    id: "user-202605-010",
    publicId: "USR-9302",
    nickname: "휴면탐험가",
    provider: "kakao",
    status: "inactive",
    joinedAt: "2026-05-21T16:25:00+09:00",
    lastActiveAt: "2026-06-15T14:12:00+09:00",
    treasureFoundCount: 3,
    rewardCount: 1,
    inquiryCount: 0,
  },
];

const MOCK_ADMIN_USER_DETAIL_EXTRAS: Record<string, Pick<AdminUserDetail, "openInquiryCount" | "retryRequestCount" | "inventoryRewardCount" | "internalMemo" | "suspendedAt" | "suspendReason">> = {
  "user-202608-001": {
    openInquiryCount: 1,
    retryRequestCount: 1,
    inventoryRewardCount: 5,
    internalMemo: "최근 보상 실패 문의가 있어 재처리 요청 상태 확인 필요.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202608-002": {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 3,
    internalMemo: "정상 활동 유저. 최근 문의는 해결 완료.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202607-003": {
    openInquiryCount: 1,
    retryRequestCount: 1,
    inventoryRewardCount: 4,
    internalMemo: "지도 로딩 문의 이력 있음. 앱 버전 확인 필요.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202607-004": {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 1,
    internalMemo: "30일 이상 활동 감소. 별도 조치 없음.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202607-005": {
    openInquiryCount: 2,
    retryRequestCount: 2,
    inventoryRewardCount: 7,
    internalMemo: "활동량이 높은 유저. 보상 실패 문의 재발 여부 관찰.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202607-006": {
    openInquiryCount: 2,
    retryRequestCount: 1,
    inventoryRewardCount: 1,
    internalMemo: "비정상 반복 요청 의심으로 mock 정지 상태.",
    suspendedAt: "2026-08-07T09:30:00+09:00",
    suspendReason: "비정상 반복 요청 패턴 확인",
  },
  "user-202606-007": {
    openInquiryCount: 0,
    retryRequestCount: 1,
    inventoryRewardCount: 10,
    internalMemo: "장기 우수 활동 유저.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202606-008": {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 0,
    internalMemo: "탈퇴 처리된 mock 유저. 위험 액션 금지.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202606-009": {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 2,
    internalMemo: "최근 활동 정상.",
    suspendedAt: null,
    suspendReason: null,
  },
  "user-202605-010": {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 1,
    internalMemo: "휴면 가능성이 높은 유저.",
    suspendedAt: null,
    suspendReason: null,
  },
};

const MOCK_ADMIN_USER_REWARDS: Record<string, AdminUserRewardSummaryItem[]> = {
  "user-202608-001": [
    { rewardId: "reward-20260809-001", claimedAt: "2026-08-09T09:12:00+09:00", treasureTitle: "강남역 점심 보물", productName: "스타벅스 아메리카노 Tall", status: "failed", providerRequestId: "REQ-GFT-900124", hasRetryRequest: true },
    { rewardId: "reward-20260805-011", claimedAt: "2026-08-05T12:10:00+09:00", treasureTitle: "여의도 점심 보물", productName: "투썸플레이스 아메리카노 R", status: "issued", providerRequestId: "REQ-GFT-897201", hasRetryRequest: false },
    { rewardId: "reward-20260801-021", claimedAt: "2026-08-01T18:20:00+09:00", treasureTitle: "홍대 야간 보물", productName: "스타벅스 아메리카노 Tall", status: "used", providerRequestId: "REQ-GFT-895120", hasRetryRequest: false },
  ],
  "user-202607-006": [
    { rewardId: "reward-20260806-006", claimedAt: "2026-08-06T20:10:00+09:00", treasureTitle: "이태원 저녁 보물", productName: "교촌 허니콤보 웨지감자 세트", status: "failed", providerRequestId: "REQ-GFT-898300", hasRetryRequest: true },
    { rewardId: "reward-20260728-019", claimedAt: "2026-07-28T21:00:00+09:00", treasureTitle: "잠실 주말 보물", productName: "싱글레귤러 아이스크림", status: "expired", providerRequestId: "REQ-GFT-891822", hasRetryRequest: false },
  ],
  "user-202607-005": [
    { rewardId: "reward-20260807-031", claimedAt: "2026-08-07T11:30:00+09:00", treasureTitle: "남산타워 신규 보물", productName: "상품 미연결", status: "ready", providerRequestId: null, hasRetryRequest: false },
    { rewardId: "reward-20260803-032", claimedAt: "2026-08-03T15:30:00+09:00", treasureTitle: "성수 카페거리 보물", productName: "스타벅스 아메리카노 Tall", status: "issued", providerRequestId: "REQ-GFT-896004", hasRetryRequest: false },
  ],
};

const MOCK_ADMIN_USER_INQUIRIES: Record<string, AdminUserInquirySummaryItem[]> = {
  "user-202608-001": [
    { inquiryId: "42b7dfe7-4427-4db4-b6dc-3d0509357951", createdAt: "2026-07-28T10:23:00+09:00", category: "reward", title: "앱에서 보상이 발급되지 않았어요", status: "open", hasAnswer: false },
  ],
  "user-202608-002": [
    { inquiryId: "6af6218e-2e5d-4a0e-a1e4-2608e8cb57fc", createdAt: "2026-07-27T16:42:00+09:00", category: "coupon", title: "쿠폰 유효기간을 확인하고 싶어요", status: "answered", hasAnswer: true },
  ],
  "user-202607-003": [
    { inquiryId: "d55d3c67-1543-4d08-b338-a4e2c2a8a40e", createdAt: "2026-07-27T14:10:00+09:00", category: "error", title: "지도 화면이 계속 로딩 상태예요", status: "in_progress", hasAnswer: false },
  ],
  "user-202607-006": [
    { inquiryId: "mock-user-8190-001", createdAt: "2026-08-06T21:10:00+09:00", category: "reward", title: "보상 재발급 확인 요청", status: "open", hasAnswer: false },
    { inquiryId: "mock-user-8190-002", createdAt: "2026-08-07T09:40:00+09:00", category: "account", title: "계정 이용 제한 문의", status: "in_progress", hasAnswer: false },
  ],
};

const MOCK_ADMIN_USER_ACTIVITIES: Record<string, AdminUserActivityItem[]> = {
  "user-202608-001": [
    { id: "act-2048-001", occurredAt: "2026-08-22T09:45:00+09:00", type: "login", summary: "앱 로그인", targetId: null },
    { id: "act-2048-002", occurredAt: "2026-08-09T09:12:00+09:00", type: "treasure_claim", summary: "강남역 점심 보물 획득", targetId: "treasure-gangnam-station-01" },
    { id: "act-2048-003", occurredAt: "2026-07-28T10:23:00+09:00", type: "inquiry_created", summary: "보상 발급 문의 등록", targetId: "42b7dfe7-4427-4db4-b6dc-3d0509357951" },
  ],
  "user-202607-006": [
    { id: "act-8190-001", occurredAt: "2026-08-06T20:12:00+09:00", type: "reward_issue", summary: "교촌 상품 보상 발급 실패", targetId: "reward-20260806-006" },
    { id: "act-8190-002", occurredAt: "2026-08-06T20:10:00+09:00", type: "treasure_claim", summary: "이태원 저녁 보물 획득", targetId: "treasure-itaewon-dinner-01" },
    { id: "act-8190-003", occurredAt: "2026-08-06T19:55:00+09:00", type: "login", summary: "앱 로그인", targetId: null },
  ],
};

const MOCK_ADMIN_USER_SECURITY_LOGS: Record<string, AdminUserSecurityLogSummaryItem[]> = {
  "user-202607-006": [
    { id: "sec-8190-001", occurredAt: "2026-08-07T09:20:00+09:00", eventType: "반복 발급 실패", summary: "짧은 시간 내 보상 발급 재시도 증가", region: "서울 용산구", result: "suspected" },
    { id: "sec-8190-002", occurredAt: "2026-08-06T20:05:00+09:00", eventType: "위치 패턴 확인", summary: "평소 활동 권역과 다른 지역에서 연속 요청", region: "서울 용산구", result: "observed" },
  ],
};

export function formatAdminUserDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function findAdminUser(id: string) {
  return MOCK_ADMIN_USERS.find((user) => user.id === id || user.publicId === id) ?? null;
}

export function findAdminUserDetail(id: string): AdminUserDetail | null {
  const user = findAdminUser(id);
  if (!user) return null;

  const extras = MOCK_ADMIN_USER_DETAIL_EXTRAS[user.id] ?? {
    openInquiryCount: 0,
    retryRequestCount: 0,
    inventoryRewardCount: 0,
    internalMemo: null,
    suspendedAt: null,
    suspendReason: null,
  };

  return { ...user, ...extras };
}

export function getAdminUserRewardSummaries(userId: string) {
  const user = findAdminUser(userId);
  if (!user) return [];
  return MOCK_ADMIN_USER_REWARDS[user.id] ?? [];
}

export function getAdminUserInquirySummaries(userId: string) {
  const user = findAdminUser(userId);
  if (!user) return [];
  return MOCK_ADMIN_USER_INQUIRIES[user.id] ?? [];
}

export function getAdminUserActivityItems(userId: string) {
  const user = findAdminUser(userId);
  if (!user) return [];
  return MOCK_ADMIN_USER_ACTIVITIES[user.id] ?? [];
}

export function getAdminUserSecurityLogSummaries(userId: string) {
  const user = findAdminUser(userId);
  if (!user) return [];
  return MOCK_ADMIN_USER_SECURITY_LOGS[user.id] ?? [];
}

export function formatAdminUserDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
