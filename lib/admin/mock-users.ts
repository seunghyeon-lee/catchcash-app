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

export function formatAdminUserDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
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
