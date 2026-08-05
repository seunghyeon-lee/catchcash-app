import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { mapInventoryListRowToRewardUi, type MockReward } from "@/lib/hunt/mappers";
import type { MockGiftProduct } from "@/lib/hunt/mock/gift-products";
import type { MockInventoryItemListRow } from "@/lib/hunt/mock/inventory-item-list";
import { getInventoryRewardList } from "@/lib/hunt/selectors";

export type InventoryDataSource = "supabase" | "mock";

export type GetInventoryRewardListResult = {
  rewards: MockReward[];
  source: InventoryDataSource;
  errorMessage?: string;
};

const INVENTORY_LIST_SELECT =
  "id, user_id, treasure_claim_id, treasure_box_id, treasure_reward_id, gift_product_id, status, issued_at, used_at, expired_at, issue_failed_reason, created_at, updated_at";

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
