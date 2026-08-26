import { getAdminContext, type AdminContext, type AdminDataSource } from "./admin-context";
import {
  findAdminRewardDetail,
  getAdminRewardRetryHistoryByRewardId,
  MOCK_ADMIN_REWARD_REQUESTS,
  MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY,
  type AdminRewardDetail,
  type AdminRewardRequestListItem,
  type AdminRewardRetryRequestHistoryItem,
  type AdminRewardRetryRequestStatus,
  type AdminRewardRetryStatus,
  type AdminRewardStatus,
} from "./mock-reward-requests";

export type AdminRewardListResult = {
  rewards: AdminRewardRequestListItem[];
  source: AdminDataSource;
  message?: string;
};

export type AdminRewardDetailResult = {
  reward: AdminRewardDetail | undefined;
  source: AdminDataSource;
  message?: string;
};

export type AdminRewardRetryHistoryResult = {
  history: AdminRewardRetryRequestHistoryItem[];
  source: AdminDataSource;
  message?: string;
};

type RetryRequestStatus = "requested" | "processing" | "succeeded" | "failed" | "canceled";
type ProfileStatus = "active" | "suspended" | "deleted";

// 쿠폰번호/바코드(coupon_code, barcode_value)는 절대 select하지 않는다.
const INVENTORY_COLUMNS =
  "id, user_id, treasure_box_id, gift_product_id, treasure_claim_id, status, issued_at, used_at, expired_at, issue_failed_reason, provider_order_id, created_at, updated_at, " +
  "gift_products(product_name, brand_name), treasure_boxes(title), treasure_claims(created_at)";

type InventoryRewardRow = {
  id: string;
  user_id: string;
  treasure_box_id: string | null;
  gift_product_id: string | null;
  treasure_claim_id: string | null;
  status: AdminRewardStatus;
  issued_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  issue_failed_reason: string | null;
  provider_order_id: string | null;
  created_at: string;
  updated_at: string;
  gift_products?: { product_name?: string; brand_name?: string } | { product_name?: string; brand_name?: string }[] | null;
  treasure_boxes?: { title?: string } | { title?: string }[] | null;
  treasure_claims?: { created_at?: string } | { created_at?: string }[] | null;
};

type RetryRow = { inventory_item_id: string; status: RetryRequestStatus; created_at: string };

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 보상 데이터를 표시하고 있습니다.";
const ERROR_MESSAGE = "보상 데이터를 불러오지 못해 예시 데이터를 표시합니다.";

function single<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function deriveUserDisplayId(userId: string) {
  return `USR-${userId.slice(0, 8)}`;
}

function mapRetryStatus(status: RetryRequestStatus): AdminRewardRetryStatus {
  if (status === "requested") return "requested";
  if (status === "processing") return "in_progress";
  if (status === "succeeded") return "succeeded";
  if (status === "failed") return "failed";
  return "none"; // canceled
}

function mapRetryRequestStatus(status: RetryRequestStatus): AdminRewardRetryRequestStatus {
  if (status === "requested") return "pending";
  if (status === "processing") return "processing";
  if (status === "succeeded") return "success";
  if (status === "failed") return "failed";
  return "canceled";
}

async function fetchProfileMaps(context: AdminContext) {
  const { data } = await context.client.from("profiles").select("user_id, nickname, status");
  const nickname = new Map<string, string>();
  const status = new Map<string, ProfileStatus>();
  for (const row of (data ?? []) as { user_id: string; nickname: string | null; status: ProfileStatus }[]) {
    if (row.nickname) nickname.set(row.user_id, row.nickname);
    status.set(row.user_id, row.status);
  }
  return { nickname, status };
}

/** inventory 1건 + 부가정보 → 보상 목록 아이템. */
function toRewardListItem(
  row: InventoryRewardRow,
  nickname: string | undefined,
  retry: { status: AdminRewardRetryStatus; requestedAt: string | null } | undefined,
): AdminRewardRequestListItem {
  const product = single(row.gift_products);
  const box = single(row.treasure_boxes);
  const claim = single(row.treasure_claims);
  const claimedAt = claim?.created_at ?? row.created_at;

  return {
    rewardId: row.id,
    claimedAt,
    issueRequestedAt: null,
    issuedAt: row.issued_at,
    failedAt: row.status === "failed" ? row.updated_at : null,
    expiresAt: row.expired_at,
    userDisplayId: deriveUserDisplayId(row.user_id),
    userNickname: nickname ?? `사용자 ${row.user_id.slice(0, 8)}`,
    treasureBoxId: row.treasure_box_id ?? "",
    treasureTitle: box?.title ?? "-",
    productId: row.gift_product_id,
    productName: product?.product_name ?? null,
    status: row.status,
    providerRequestId: row.provider_order_id,
    lastFailureCode: row.issue_failed_reason,
    retryRequestStatus: retry?.status ?? "none",
    latestRetryRequestedAt: retry?.requestedAt ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchLatestRetryByInventory(context: AdminContext) {
  const { data } = await context.client
    .from("reward_retry_requests")
    .select("inventory_item_id, status, created_at")
    .order("created_at", { ascending: false });

  const map = new Map<string, { status: AdminRewardRetryStatus; requestedAt: string | null }>();
  for (const row of (data ?? []) as RetryRow[]) {
    // 최신순 정렬이므로 첫 등장이 최신.
    if (!map.has(row.inventory_item_id)) {
      map.set(row.inventory_item_id, { status: mapRetryStatus(row.status), requestedAt: row.created_at });
    }
  }
  return map;
}

export async function loadAdminRewardRequests(): Promise<AdminRewardListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { rewards: MOCK_ADMIN_REWARD_REQUESTS, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const [inventoryResult, profiles, retryMap] = await Promise.all([
      context.client.from("inventory_items").select(INVENTORY_COLUMNS).order("created_at", { ascending: false }),
      fetchProfileMaps(context),
      fetchLatestRetryByInventory(context),
    ]);

    if (inventoryResult.error) throw new Error(inventoryResult.error.message);

    const rewards = ((inventoryResult.data ?? []) as unknown as InventoryRewardRow[]).map((row) =>
      toRewardListItem(row, profiles.nickname.get(row.user_id), retryMap.get(row.id)),
    );

    return { rewards, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminRewardRequests는 mock으로 fallback합니다:", error);
    return { rewards: MOCK_ADMIN_REWARD_REQUESTS, source: "mock", message: ERROR_MESSAGE };
  }
}

export async function loadAdminRewardDetail(id: string): Promise<AdminRewardDetailResult> {
  const context = await getAdminContext();
  if (!context) {
    return { reward: findAdminRewardDetail(id) ?? undefined, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data: inventory, error: inventoryError } = await context.client
      .from("inventory_items")
      .select(INVENTORY_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (inventoryError) throw new Error(inventoryError.message);
    if (!inventory) return { reward: undefined, source: "supabase" };

    const row = inventory as unknown as InventoryRewardRow;

    const [profiles, retryMap, retryCountResult] = await Promise.all([
      fetchProfileMaps(context),
      fetchLatestRetryByInventory(context),
      context.client.from("reward_retry_requests").select("id", { count: "exact", head: true }).eq("inventory_item_id", id),
    ]);

    const base = toRewardListItem(row, profiles.nickname.get(row.user_id), retryMap.get(row.id));
    const product = single(row.gift_products);
    const profileStatus = profiles.status.get(row.user_id);

    const reward: AdminRewardDetail = {
      ...base,
      failureReason: row.issue_failed_reason,
      userRetryCount: retryCountResult.count ?? 0,
      internalMemo: null,
      userStatus: profileStatus === "suspended" ? "blocked" : profileStatus === "deleted" ? "inactive" : "active",
      productBrandName: product?.brand_name ?? null,
    };

    return { reward, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminRewardDetail은 mock으로 fallback합니다:", error);
    return { reward: findAdminRewardDetail(id) ?? undefined, source: "mock", message: ERROR_MESSAGE };
  }
}

type RetryHistoryRow = {
  id: string;
  inventory_item_id: string;
  status: RetryRequestStatus;
  reason: string;
  before_status: string;
  after_status: string | null;
  created_at: string;
  processed_at: string | null;
  inventory_items?:
    | { user_id?: string; status?: AdminRewardStatus; treasure_box_id?: string | null; gift_product_id?: string | null; gift_products?: { product_name?: string } | { product_name?: string }[] | null; treasure_boxes?: { title?: string } | { title?: string }[] | null }
    | null;
};

export async function loadAdminRewardRetryHistory(): Promise<AdminRewardRetryHistoryResult> {
  const context = await getAdminContext();
  if (!context) {
    return { history: MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data, error } = await context.client
      .from("reward_retry_requests")
      .select(
        "id, inventory_item_id, status, reason, before_status, after_status, created_at, processed_at, " +
          "inventory_items(user_id, status, treasure_box_id, gift_product_id, gift_products(product_name), treasure_boxes(title))",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const history: AdminRewardRetryRequestHistoryItem[] = ((data ?? []) as unknown as RetryHistoryRow[]).map((row) => {
      const inventory = row.inventory_items ?? null;
      const product = single(inventory?.gift_products);
      const box = single(inventory?.treasure_boxes);
      const workerResult = row.status === "succeeded" ? "success" : row.status === "failed" ? "failed" : null;

      return {
        retryRequestId: row.id,
        rewardId: row.inventory_item_id,
        rewardStatus: (inventory?.status ?? "failed") as AdminRewardStatus,
        treasureBoxId: inventory?.treasure_box_id ?? "",
        treasureTitle: box?.title ?? "-",
        productId: inventory?.gift_product_id ?? null,
        productName: product?.product_name ?? null,
        userPublicId: inventory?.user_id ? deriveUserDisplayId(inventory.user_id) : "-",
        retryStatus: mapRetryRequestStatus(row.status),
        reason: row.reason,
        internalMemo: null,
        // provider_response 등 민감 정보는 표시하지 않는다(3차 금지사항).
        previousErrorCode: null,
        previousErrorMessage: null,
        workerResult,
        workerErrorCode: null,
        workerErrorMessage: null,
        providerRequestId: null,
        requestedByAdminName: "-",
        createdAt: row.created_at,
        processingStartedAt: null,
        processedAt: row.processed_at,
      };
    });

    return { history, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminRewardRetryHistory는 mock으로 fallback합니다:", error);
    return { history: MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY, source: "mock", message: ERROR_MESSAGE };
  }
}

export { getAdminRewardRetryHistoryByRewardId };

// ---------------------------------------------------------------------------
// 6차: 특정 보상(rewardId=inventory id)의 재처리 이력/최신 요청 조회 (실행 없음)
// ---------------------------------------------------------------------------

const RETRY_HISTORY_SELECT =
  "id, inventory_item_id, status, reason, before_status, after_status, created_at, processed_at, " +
  "inventory_items(user_id, status, treasure_box_id, gift_product_id, gift_products(product_name), treasure_boxes(title))";

function toRetryHistoryItem(row: RetryHistoryRow): AdminRewardRetryRequestHistoryItem {
  const inventory = row.inventory_items ?? null;
  const product = single(inventory?.gift_products);
  const box = single(inventory?.treasure_boxes);
  const workerResult = row.status === "succeeded" ? "success" : row.status === "failed" ? "failed" : null;

  return {
    retryRequestId: row.id,
    rewardId: row.inventory_item_id,
    rewardStatus: (inventory?.status ?? "failed") as AdminRewardStatus,
    treasureBoxId: inventory?.treasure_box_id ?? "",
    treasureTitle: box?.title ?? "-",
    productId: inventory?.gift_product_id ?? null,
    productName: product?.product_name ?? null,
    userPublicId: inventory?.user_id ? deriveUserDisplayId(inventory.user_id) : "-",
    retryStatus: mapRetryRequestStatus(row.status),
    reason: row.reason,
    internalMemo: null,
    previousErrorCode: null,
    previousErrorMessage: null,
    workerResult,
    workerErrorCode: null,
    workerErrorMessage: null,
    providerRequestId: null,
    requestedByAdminName: "-",
    createdAt: row.created_at,
    processingStartedAt: null,
    processedAt: row.processed_at,
  };
}

export async function loadAdminRewardRetryHistoryByReward(rewardId: string): Promise<AdminRewardRetryHistoryResult> {
  const context = await getAdminContext();
  if (!context) {
    return { history: getAdminRewardRetryHistoryByRewardId(rewardId), source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data, error } = await context.client
      .from("reward_retry_requests")
      .select(RETRY_HISTORY_SELECT)
      .eq("inventory_item_id", rewardId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const history = ((data ?? []) as unknown as RetryHistoryRow[]).map(toRetryHistoryItem);
    return { history, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminRewardRetryHistoryByReward는 mock으로 fallback합니다:", error);
    return { history: getAdminRewardRetryHistoryByRewardId(rewardId), source: "mock", message: ERROR_MESSAGE };
  }
}
