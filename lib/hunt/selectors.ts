import { mockGiftProducts } from "@/lib/hunt/mock/gift-products";
import { mockInventoryItemList } from "@/lib/hunt/mock/inventory-item-list";
import { mockInventoryItems } from "@/lib/hunt/mock/inventory-items";
import { mockTreasureBoxes } from "@/lib/hunt/mock/treasure-boxes";
import { mockTreasureClaims } from "@/lib/hunt/mock/treasure-claims";
import {
  buildHuntFailContent,
  mapInventoryItemToRewardDetailUi,
  mapInventoryListRowToRewardUi,
  mapTreasureBoxToTreasureUi,
  mapTreasureClaimToResultUi,
  type MockRewardDetail,
} from "@/lib/hunt/mappers";

export function getMapTreasures() {
  const claimedTreasureBoxIds = new Set(
    mockTreasureClaims.filter((claim) => claim.result === "success").map((claim) => claim.treasure_box_id),
  );

  return mockTreasureBoxes
    .filter((treasureBox) => treasureBox.status === "active")
    .map((treasureBox, index) => mapTreasureBoxToTreasureUi(treasureBox, index, claimedTreasureBoxIds));
}

export function getClaimedTreasureMarker() {
  const claimed = mockTreasureClaims.find((claim) => claim.result === "success");
  if (!claimed) return { id: "claimed-none", position: { left: 16, top: 45 } };

  // map placeholder 좌표는 UI 레이아웃용. 실제 lat/lng 연동은 다음 단계.
  return { id: claimed.treasure_box_id, position: { left: 16, top: 45 } };
}

/** 보관함 목록: inventory_item_list 기준 (민감정보 제외). */
export function getInventoryRewardList() {
  return mockInventoryItemList.map((listRow) =>
    mapInventoryListRowToRewardUi(
      listRow,
      mockGiftProducts.find((giftProduct) => giftProduct.id === listRow.gift_product_id),
    ),
  );
}

/** 보상 상세: inventory_items 민감 컬럼 포함. */
export function getInventoryRewardDetail(rewardId: string): MockRewardDetail | undefined {
  const inventoryItem = mockInventoryItems.find((item) => item.id === rewardId);
  if (!inventoryItem) return undefined;

  return mapInventoryItemToRewardDetailUi(
    inventoryItem,
    mockGiftProducts.find((giftProduct) => giftProduct.id === inventoryItem.gift_product_id),
  );
}

export function getSuccessReward() {
  return getInventoryRewardList().find((reward) => reward.status === "available");
}

export function getHuntResultByQuery(result?: string) {
  const successClaim = mockTreasureClaims.find((item) => item.result === "success");

  return {
    success: mapTreasureClaimToResultUi(successClaim, getSuccessReward()),
    // 결과 상태(result)에 따라 실패형 화면 콘텐츠를 매핑한다 (too_far/empty/expired/already_claimed/fail).
    fail: buildHuntFailContent(result),
  } as const;
}
