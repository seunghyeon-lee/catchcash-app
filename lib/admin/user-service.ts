import { getAdminContext, type AdminDataSource } from "./admin-context";
import {
  findAdminUserDetail,
  MOCK_ADMIN_USERS,
  type AdminUserDetail,
  type AdminUserListItem,
  type AdminUserStatus,
} from "./mock-users";

export type AdminUserListResult = {
  users: AdminUserListItem[];
  source: AdminDataSource;
  message?: string;
};

export type AdminUserDetailResult = {
  user: AdminUserDetail | undefined;
  source: AdminDataSource;
  message?: string;
};

type ProfileRow = {
  user_id: string;
  nickname: string;
  status: AdminUserStatus;
  created_at: string;
  updated_at: string;
};

type UserStatRow = {
  user_id: string;
  found_treasure_count: number | null;
  available_coupon_count: number | null;
  last_success_claimed_at: string | null;
};

type InquiryRow = { user_id: string; status: "reading" | "resolved" };

const MOCK_LIST_MESSAGE = "관리자 인증이 연결되지 않아 예시 유저 데이터를 표시하고 있습니다.";
const MOCK_ERROR_MESSAGE = "유저 데이터를 불러오지 못해 예시 데이터를 표시합니다.";

/**
 * publicId는 auth.users에만 존재하고 Data API로 노출되지 않으므로,
 * 표시용 식별자를 user_id 앞자리로 파생한다. (민감정보 아님)
 */
function derivePublicId(userId: string) {
  return `USR-${userId.slice(0, 8)}`;
}

/**
 * provider(google/kakao/apple)는 auth.users.app_metadata에만 있고 Data API로
 * 조회할 수 없다. profiles/뷰에는 없으므로 실제값 확정 전까지 placeholder를 쓴다.
 * TODO(leader): 로그인 제공자 표시가 필요하면 profiles 또는 뷰에 provider 컬럼 추가 요청.
 */
const PROVIDER_PLACEHOLDER = "google" as const;

function toListItem(profile: ProfileRow, stat: UserStatRow | undefined, inquiryCount: number): AdminUserListItem {
  return {
    id: profile.user_id,
    publicId: derivePublicId(profile.user_id),
    nickname: profile.nickname,
    provider: PROVIDER_PLACEHOLDER,
    status: profile.status,
    joinedAt: profile.created_at,
    lastActiveAt: stat?.last_success_claimed_at ?? profile.updated_at ?? null,
    treasureFoundCount: stat?.found_treasure_count ?? 0,
    rewardCount: stat?.available_coupon_count ?? 0,
    inquiryCount,
  };
}

export async function loadAdminUsers(): Promise<AdminUserListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { users: MOCK_ADMIN_USERS, source: "mock", message: MOCK_LIST_MESSAGE };
  }

  try {
    const [profilesResult, statsResult, inquiriesResult] = await Promise.all([
      context.client
        .from("profiles")
        .select("user_id, nickname, status, created_at, updated_at")
        .order("created_at", { ascending: false }),
      context.client
        .from("admin_user_statistics")
        .select("user_id, found_treasure_count, available_coupon_count, last_success_claimed_at"),
      context.client.from("support_inquiries").select("user_id"),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);

    const profiles = (profilesResult.data ?? []) as ProfileRow[];

    // 통계/문의 뷰 조회 실패는 치명적이지 않다. 실패 시 카운트를 0으로 두고 목록은 유지한다.
    const statMap = new Map<string, UserStatRow>();
    for (const row of (statsResult.data ?? []) as UserStatRow[]) {
      statMap.set(row.user_id, row);
    }

    const inquiryCountMap = new Map<string, number>();
    for (const row of (inquiriesResult.data ?? []) as { user_id: string }[]) {
      inquiryCountMap.set(row.user_id, (inquiryCountMap.get(row.user_id) ?? 0) + 1);
    }

    const users = profiles.map((profile) => toListItem(profile, statMap.get(profile.user_id), inquiryCountMap.get(profile.user_id) ?? 0));

    return { users, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminUsers는 mock으로 fallback합니다:", error);
    return { users: MOCK_ADMIN_USERS, source: "mock", message: MOCK_ERROR_MESSAGE };
  }
}

export async function loadAdminUserDetail(id: string): Promise<AdminUserDetailResult> {
  const context = await getAdminContext();
  if (!context) {
    return { user: findAdminUserDetail(id) ?? undefined, source: "mock", message: MOCK_LIST_MESSAGE };
  }

  try {
    const { data: profile, error: profileError } = await context.client
      .from("profiles")
      .select("user_id, nickname, status, created_at, updated_at")
      .eq("user_id", id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return { user: undefined, source: "supabase" };

    const profileRow = profile as ProfileRow;

    const [statResult, inquiriesResult, inventoryResult] = await Promise.all([
      context.client
        .from("admin_user_statistics")
        .select("user_id, found_treasure_count, available_coupon_count, last_success_claimed_at")
        .eq("user_id", id)
        .maybeSingle(),
      context.client.from("support_inquiries").select("user_id, status").eq("user_id", id),
      context.client.from("inventory_items").select("id").eq("user_id", id),
    ]);

    const stat = (statResult.data ?? undefined) as UserStatRow | undefined;
    const inquiries = (inquiriesResult.data ?? []) as InquiryRow[];
    const openInquiryCount = inquiries.filter((row) => row.status === "reading").length;
    const inventoryRewardCount = (inventoryResult.data ?? []).length;

    const base = toListItem(profileRow, stat, inquiries.length);

    const user: AdminUserDetail = {
      ...base,
      openInquiryCount,
      // reward_retry_requests 연결은 3차 범위. 상세 정합성은 7차에서 보강한다.
      retryRequestCount: 0,
      inventoryRewardCount,
      internalMemo: null,
      suspendedAt: null,
      suspendReason: null,
    };

    return { user, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminUserDetail은 mock으로 fallback합니다:", error);
    return { user: findAdminUserDetail(id) ?? undefined, source: "mock", message: MOCK_ERROR_MESSAGE };
  }
}
