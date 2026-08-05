import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { mapInventoryItemToRewardDetailUi, mapInventoryListRowToRewardUi, type MockReward, type MockRewardDetail } from "@/lib/hunt/mappers";
import type { MockGiftProduct } from "@/lib/hunt/mock/gift-products";
import type { MockInventoryItem } from "@/lib/hunt/mock/inventory-items";
import type { MockInventoryItemListRow } from "@/lib/hunt/mock/inventory-item-list";
import { getInventoryRewardDetail, getInventoryRewardList } from "@/lib/hunt/selectors";

export type InventoryDataSource = "supabase" | "mock";

export type GetInventoryRewardListResult = {
  rewards: MockReward[];
  source: InventoryDataSource;
  errorMessage?: string;
};

export type GetInventoryRewardDetailResult = {
  detail: MockRewardDetail | null;
  source: InventoryDataSource;
  errorMessage?: string;
};

const INVENTORY_LIST_SELECT =
  "id, user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id, status, issued_at, used_at, expired_at, issue_failed_reason, created_at, updated_at";

const INVENTORY_ITEM_DETAIL_SELECT =
  "id, user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id, status, issued_at, used_at, expired_at, coupon_code, barcode_value, issue_failed_reason, created_at, updated_at";

const GIFT_PRODUCT_SELECT = "id, provider, provider_product_id, brand_name, product_name, product_image_url, price, status";

/**
 * `/inventory` 목록 조회.
 * 쿠폰코드/바코드가 없는 `inventory_item_list` view만 사용한다 (상세 전용 컬럼은 조회하지 않음).
 * 세션이 없으면 mock fallback을 유지하고, 있으면 내 보관함만 조회한다.
 */
export async function getInventoryRewardListData(): Promise<GetInventoryRewardListResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { rewards: getInventoryRewardList(), source: "mock" };
  }

  const { data, error } = await session.client
    .from("inventory_item_list")
    .select(INVENTORY_LIST_SELECT)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      rewards: getInventoryRewardList(),
      source: "mock",
      errorMessage: "보관함을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  const listRows = (data ?? []) as MockInventoryItemListRow[];
  const giftProductIds = Array.from(
    new Set(listRows.map((row) => row.gift_product_id).filter((id): id is string => Boolean(id))),
  );

  let giftProductById = new Map<string, MockGiftProduct>();
  if (giftProductIds.length > 0) {
    const { data: giftProducts, error: giftProductError } = await session.client
      .from("gift_products")
      .select(GIFT_PRODUCT_SELECT)
      .in("id", giftProductIds);

    if (giftProductError) {
      return {
        rewards: getInventoryRewardList(),
        source: "mock",
        errorMessage: "보관함을 불러오지 못했어. 잠시 후 다시 확인해줘.",
      };
    }

    giftProductById = new Map(((giftProducts ?? []) as MockGiftProduct[]).map((product) => [product.id, product]));
  }

  return {
    rewards: listRows.map((row) => mapInventoryListRowToRewardUi(row, giftProductById.get(row.gift_product_id))),
    source: "supabase",
  };
}

/**
 * 보상 상세 팝업 조회.
 * 쿠폰코드/바코드는 이 함수(상세)에서만 조회하고 목록에는 절대 포함하지 않는다.
 * 세션이 없으면 mock fallback을 유지하고, 있으면 내 소유 row만 조회한다.
 */
export async function getInventoryRewardDetailData(rewardId: string): Promise<GetInventoryRewardDetailResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { detail: getInventoryRewardDetail(rewardId) ?? null, source: "mock" };
  }

  const { data, error } = await session.client
    .from("inventory_items")
    .select(INVENTORY_ITEM_DETAIL_SELECT)
    .eq("id", rewardId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    return {
      detail: getInventoryRewardDetail(rewardId) ?? null,
      source: "mock",
      errorMessage: "보상 정보를 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  if (!data) {
    return { detail: null, source: "supabase" };
  }

  const item = data as MockInventoryItem;
  let giftProduct: MockGiftProduct | undefined;

  if (item.gift_product_id) {
    const { data: product, error: productError } = await session.client
      .from("gift_products")
      .select(GIFT_PRODUCT_SELECT)
      .eq("id", item.gift_product_id)
      .maybeSingle();

    if (productError) {
      return {
        detail: getInventoryRewardDetail(rewardId) ?? null,
        source: "mock",
        errorMessage: "보상 정보를 불러오지 못했어. 잠시 후 다시 확인해줘.",
      };
    }

    giftProduct = (product as MockGiftProduct | null) ?? undefined;
  }

  return { detail: mapInventoryItemToRewardDetailUi(item, giftProduct), source: "supabase" };
}
