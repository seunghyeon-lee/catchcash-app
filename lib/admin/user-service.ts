import { getAdminContext, type AdminContext, type AdminDataSource } from "./admin-context";
import {
  findAdminUserDetail,
  getAdminUserInquirySummaries,
  getAdminUserRewardSummaries,
  MOCK_ADMIN_USERS,
  type AdminUserDetail,
  type AdminUserInquirySummaryCategory,
  type AdminUserInquirySummaryItem,
  type AdminUserInquirySummaryStatus,
  type AdminUserListItem,
  type AdminUserRewardSummaryItem,
  type AdminUserRewardSummaryStatus,
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
    const inventoryIds = ((inventoryResult.data ?? []) as { id: string }[]).map((row) => row.id);
    const inventoryRewardCount = inventoryIds.length;

    // 유저의 재처리 요청 수 = 유저 보관함 항목들에 걸린 reward_retry_requests 수.
    let retryRequestCount = 0;
    if (inventoryIds.length > 0) {
      const { count } = await context.client
        .from("reward_retry_requests")
        .select("id", { count: "exact", head: true })
        .in("inventory_item_id", inventoryIds);
      retryRequestCount = count ?? 0;
    }

    const base = toListItem(profileRow, stat, inquiries.length);

    const user: AdminUserDetail = {
      ...base,
      openInquiryCount,
      retryRequestCount,
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

// ---------------------------------------------------------------------------
// 7차: 유저 상세 관련 데이터 요약 실연결 (보상/문의). 활동·보안 요약은 소스 없어 mock 유지.
// ---------------------------------------------------------------------------

export type AdminUserRewardSummaryResult = {
  rewards: AdminUserRewardSummaryItem[];
  source: AdminDataSource;
};

export type AdminUserInquirySummaryResult = {
  inquiries: AdminUserInquirySummaryItem[];
  source: AdminDataSource;
};

type InventorySummaryRow = {
  id: string;
  status: AdminUserRewardSummaryStatus;
  provider_order_id: string | null;
  created_at: string;
  gift_products?: { product_name?: string } | { product_name?: string }[] | null;
  treasure_boxes?: { title?: string } | { title?: string }[] | null;
  treasure_claims?: { created_at?: string } | { created_at?: string }[] | null;
};

type InquirySummaryRow = {
  id: string;
  category: "general" | "coupon" | "reward" | "account" | "bug" | "improvement" | "etc";
  title: string;
  status: "reading" | "resolved";
  created_at: string;
};

const INQUIRY_CATEGORY_MAP: Record<InquirySummaryRow["category"], AdminUserInquirySummaryCategory> = {
  general: "usage",
  coupon: "coupon",
  reward: "reward",
  account: "account",
  bug: "error",
  improvement: "improvement",
  etc: "other",
};

function summarySingle<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

async function fetchRetryInventoryIdSet(context: AdminContext): Promise<Set<string>> {
  const { data } = await context.client.from("reward_retry_requests").select("inventory_item_id");
  return new Set(((data ?? []) as { inventory_item_id: string }[]).map((row) => row.inventory_item_id));
}

export async function loadAdminUserRewardSummaries(userId: string): Promise<AdminUserRewardSummaryResult> {
  const context = await getAdminContext();
  if (!context) return { rewards: getAdminUserRewardSummaries(userId), source: "mock" };

  try {
    const [inventoryResult, retrySet] = await Promise.all([
      // coupon_code/barcode는 select하지 않는다.
      context.client
        .from("inventory_items")
        .select("id, status, provider_order_id, created_at, gift_products(product_name), treasure_boxes(title), treasure_claims(created_at)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      fetchRetryInventoryIdSet(context),
    ]);

    if (inventoryResult.error) throw new Error(inventoryResult.error.message);

    const rewards = ((inventoryResult.data ?? []) as unknown as InventorySummaryRow[]).map((row) => {
      const product = summarySingle(row.gift_products);
      const box = summarySingle(row.treasure_boxes);
      const claim = summarySingle(row.treasure_claims);
      return {
        rewardId: row.id,
        claimedAt: claim?.created_at ?? row.created_at,
        treasureTitle: box?.title ?? "-",
        productName: product?.product_name ?? "-",
        status: row.status,
        providerRequestId: row.provider_order_id,
        hasRetryRequest: retrySet.has(row.id),
      } satisfies AdminUserRewardSummaryItem;
    });

    return { rewards, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminUserRewardSummaries는 mock으로 fallback합니다:", error);
    return { rewards: getAdminUserRewardSummaries(userId), source: "mock" };
  }
}

export async function loadAdminUserInquirySummaries(userId: string): Promise<AdminUserInquirySummaryResult> {
  const context = await getAdminContext();
  if (!context) return { inquiries: getAdminUserInquirySummaries(userId), source: "mock" };

  try {
    const { data, error } = await context.client
      .from("support_inquiries")
      .select("id, category, title, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const inquiries = ((data ?? []) as InquirySummaryRow[]).map((row) => {
      const answered = row.status === "resolved";
      const status: AdminUserInquirySummaryStatus = answered ? "answered" : "open";
      return {
        inquiryId: row.id,
        createdAt: row.created_at,
        category: INQUIRY_CATEGORY_MAP[row.category] ?? "other",
        title: row.title,
        status,
        hasAnswer: answered,
      } satisfies AdminUserInquirySummaryItem;
    });

    return { inquiries, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminUserInquirySummaries는 mock으로 fallback합니다:", error);
    return { inquiries: getAdminUserInquirySummaries(userId), source: "mock" };
  }
}
