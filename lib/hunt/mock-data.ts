// hunt-reward-flow Mock Data
// DB schema 기준 raw mock은 `mock/` 아래 테이블별 파일에 두고,
// 이 파일은 기존 화면이 그대로 쓸 수 있는 UI용 facade 역할만 맡는다.

export type {
  MockReward,
  MockRewardDetail,
  MockTreasure,
  RewardStatus,
  TreasureStatus,
  TreasureVariant,
} from "@/lib/hunt/mappers";
export { mockGiftProducts } from "@/lib/hunt/mock/gift-products";
export { mockInventoryItemList } from "@/lib/hunt/mock/inventory-item-list";
export { mockInventoryItems } from "@/lib/hunt/mock/inventory-items";
export { mockTreasureBoxes } from "@/lib/hunt/mock/treasure-boxes";
export { mockTreasureClaims } from "@/lib/hunt/mock/treasure-claims";
export { mockTreasureRewards } from "@/lib/hunt/mock/treasure-rewards";
import {
  getClaimedTreasureMarker,
  getHuntResultByQuery,
  getInventoryRewardList,
  getMapTreasures,
} from "@/lib/hunt/selectors";

export const MOCK_TREASURES = getMapTreasures();

export const MOCK_CLAIMED_TREASURE = getClaimedTreasureMarker();

/** inventory_item_list 기준 목록 (민감정보 제외). */
export const MOCK_REWARDS = getInventoryRewardList();

/** MD 08 카피 기준 */
export const MOCK_HUNT_RESULT = getHuntResultByQuery();
