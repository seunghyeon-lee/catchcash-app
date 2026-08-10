export type AdminRole = "super_admin" | "operator" | "viewer";

export type AdminStatus = "active" | "inactive" | "locked";

export type AdminAccountListItem = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "super_admin",
  operator: "operator",
  viewer: "viewer",
};

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  active: "active",
  inactive: "inactive",
  locked: "locked",
};

export const MOCK_ADMIN_ACCOUNTS: AdminAccountListItem[] = [
  {
    id: "admin-kim-ops",
    name: "김운영",
    email: "admin.ops@example.invalid",
    role: "super_admin",
    status: "active",
    lastLoginAt: "2026-08-10T09:12:00+09:00",
    createdAt: "2025-06-01T10:00:00+09:00",
  },
  {
    id: "admin-lee-ops",
    name: "이운영",
    email: "admin.lee@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-09T18:40:00+09:00",
    createdAt: "2025-07-12T11:20:00+09:00",
  },
  {
    id: "admin-park-view",
    name: "박조회",
    email: "admin.park@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-08-08T14:05:00+09:00",
    createdAt: "2025-08-03T09:30:00+09:00",
  },
  {
    id: "admin-choi-ops",
    name: "최운영",
    email: "admin.choi@example.invalid",
    role: "operator",
    status: "inactive",
    lastLoginAt: "2026-07-20T16:22:00+09:00",
    createdAt: "2025-09-15T13:10:00+09:00",
  },
  {
    id: "admin-jung-view",
    name: "정조회",
    email: "admin.jung@example.invalid",
    role: "viewer",
    status: "locked",
    lastLoginAt: "2026-07-01T08:45:00+09:00",
    createdAt: "2025-10-02T15:40:00+09:00",
  },
  {
    id: "admin-han-ops",
    name: "한운영",
    email: "admin.han@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-10T11:03:00+09:00",
    createdAt: "2025-11-18T10:15:00+09:00",
  },
  {
    id: "admin-yoon-view",
    name: "윤조회",
    email: "admin.yoon@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: null,
    createdAt: "2025-12-05T12:00:00+09:00",
  },
  {
    id: "admin-kang-ops",
    name: "강운영",
    email: "admin.kang@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-07T19:28:00+09:00",
    createdAt: "2026-01-09T09:50:00+09:00",
  },
  {
    id: "admin-oh-view",
    name: "오조회",
    email: "admin.oh@example.invalid",
    role: "viewer",
    status: "inactive",
    lastLoginAt: "2026-06-15T10:11:00+09:00",
    createdAt: "2026-01-22T14:25:00+09:00",
  },
  {
    id: "admin-seo-ops",
    name: "서운영",
    email: "admin.seo@example.invalid",
    role: "operator",
    status: "locked",
    lastLoginAt: "2026-05-30T21:02:00+09:00",
    createdAt: "2026-02-04T16:35:00+09:00",
  },
  {
    id: "admin-shin-view",
    name: "신조회",
    email: "admin.shin@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-08-06T13:44:00+09:00",
    createdAt: "2026-02-18T11:05:00+09:00",
  },
  {
    id: "admin-kwon-ops",
    name: "권운영",
    email: "admin.kwon@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-05T08:17:00+09:00",
    createdAt: "2026-03-01T10:40:00+09:00",
  },
  {
    id: "admin-hong-view",
    name: "홍조회",
    email: "admin.hong@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-08-04T17:55:00+09:00",
    createdAt: "2026-03-12T09:20:00+09:00",
  },
  {
    id: "admin-bae-ops",
    name: "배운영",
    email: "admin.bae@example.invalid",
    role: "operator",
    status: "inactive",
    lastLoginAt: null,
    createdAt: "2026-03-25T15:00:00+09:00",
  },
  {
    id: "admin-ryu-view",
    name: "류조회",
    email: "admin.ryu@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-08-03T12:33:00+09:00",
    createdAt: "2026-04-07T13:45:00+09:00",
  },
  {
    id: "admin-moon-ops",
    name: "문운영",
    email: "admin.moon@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-02T09:08:00+09:00",
    createdAt: "2026-04-20T10:10:00+09:00",
  },
  {
    id: "admin-yang-view",
    name: "양조회",
    email: "admin.yang@example.invalid",
    role: "viewer",
    status: "locked",
    lastLoginAt: "2026-04-28T22:19:00+09:00",
    createdAt: "2026-04-28T11:30:00+09:00",
  },
  {
    id: "admin-baek-ops",
    name: "백운영",
    email: "admin.baek@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-08-01T15:41:00+09:00",
    createdAt: "2026-05-10T09:00:00+09:00",
  },
  {
    id: "admin-nam-view",
    name: "남조회",
    email: "admin.nam@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-07-29T16:27:00+09:00",
    createdAt: "2026-05-22T14:50:00+09:00",
  },
  {
    id: "admin-ha-ops",
    name: "하운영",
    email: "admin.ha@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-07-28T10:06:00+09:00",
    createdAt: "2026-06-03T12:15:00+09:00",
  },
  {
    id: "admin-an-view",
    name: "안조회",
    email: "admin.an@example.invalid",
    role: "viewer",
    status: "inactive",
    lastLoginAt: "2026-06-20T11:52:00+09:00",
    createdAt: "2026-06-15T09:35:00+09:00",
  },
  {
    id: "admin-song-ops",
    name: "송운영",
    email: "admin.song@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-07-27T13:14:00+09:00",
    createdAt: "2026-06-28T16:20:00+09:00",
  },
  {
    id: "admin-jo-view",
    name: "조조회",
    email: "admin.jo@example.invalid",
    role: "viewer",
    status: "active",
    lastLoginAt: "2026-07-26T09:48:00+09:00",
    createdAt: "2026-07-08T10:05:00+09:00",
  },
  {
    id: "admin-im-ops",
    name: "임운영",
    email: "admin.im@example.invalid",
    role: "operator",
    status: "active",
    lastLoginAt: "2026-07-25T18:01:00+09:00",
    createdAt: "2026-07-18T11:40:00+09:00",
  },
];

export function formatAdminAccountDateTime(value: string | null) {
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

export function formatAdminAccountDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function findAdminAccount(adminId: string) {
  return MOCK_ADMIN_ACCOUNTS.find((account) => account.id === adminId) ?? null;
}

export type AdminActivityAction =
  | "login_success"
  | "login_failure"
  | "role_changed"
  | "password_reset"
  | "status_changed";

export type AdminAccountActivity = {
  id: string;
  adminId: string;
  occurredAt: string;
  action: AdminActivityAction;
  ipMasked: string;
  summary: string;
};

export const ADMIN_ACTIVITY_ACTION_LABEL: Record<AdminActivityAction, string> = {
  login_success: "로그인 성공",
  login_failure: "로그인 실패",
  role_changed: "역할 변경",
  password_reset: "비밀번호 재설정",
  status_changed: "상태 변경",
};

export const ADMIN_ROLE_ALLOWED_MENUS: Record<AdminRole, string[]> = {
  super_admin: ["대시보드", "관리자 계정", "상품 관리", "매핑 관리", "보상 재처리", "문의", "보안 로그", "접근 차단"],
  operator: ["대시보드", "상품 관리", "매핑 관리", "보상 재처리", "문의"],
  viewer: ["대시보드", "상품 관리", "매핑 관리", "문의"],
};

export const ADMIN_ROLE_RESTRICTED_MENUS: Record<AdminRole, string[]> = {
  super_admin: [],
  operator: ["관리자 계정", "보안 로그"],
  viewer: ["관리자 계정", "보상 재처리", "보안 로그"],
};

export const MOCK_ADMIN_ACCOUNT_ACTIVITIES: AdminAccountActivity[] = [
  {
    id: "act-kim-1",
    adminId: "admin-kim-ops",
    occurredAt: "2026-08-10T09:12:00+09:00",
    action: "login_success",
    ipMasked: "203.0.113.***",
    summary: "CMS 로그인 성공",
  },
  {
    id: "act-kim-2",
    adminId: "admin-kim-ops",
    occurredAt: "2026-08-09T17:40:00+09:00",
    action: "role_changed",
    ipMasked: "203.0.113.***",
    summary: "operator → super_admin 역할 변경 (mock)",
  },
  {
    id: "act-lee-1",
    adminId: "admin-lee-ops",
    occurredAt: "2026-08-09T18:40:00+09:00",
    action: "login_success",
    ipMasked: "198.51.100.***",
    summary: "CMS 로그인 성공",
  },
  {
    id: "act-lee-2",
    adminId: "admin-lee-ops",
    occurredAt: "2026-08-08T11:05:00+09:00",
    action: "password_reset",
    ipMasked: "198.51.100.***",
    summary: "비밀번호 재설정 요청 처리 (mock)",
  },
  {
    id: "act-park-1",
    adminId: "admin-park-view",
    occurredAt: "2026-08-08T14:05:00+09:00",
    action: "login_success",
    ipMasked: "192.0.2.***",
    summary: "CMS 로그인 성공",
  },
  {
    id: "act-choi-1",
    adminId: "admin-choi-ops",
    occurredAt: "2026-07-20T16:22:00+09:00",
    action: "status_changed",
    ipMasked: "203.0.113.***",
    summary: "active → inactive 상태 변경 (mock)",
  },
  {
    id: "act-jung-1",
    adminId: "admin-jung-view",
    occurredAt: "2026-07-01T08:45:00+09:00",
    action: "login_failure",
    ipMasked: "198.51.100.***",
    summary: "연속 로그인 실패 후 locked (mock)",
  },
];

export function getAdminAccountActivities(adminId: string) {
  return MOCK_ADMIN_ACCOUNT_ACTIVITIES.filter((activity) => activity.adminId === adminId).sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
