export type MockTreasureRewardStatus = "active" | "inactive";
export type MockRewardType = "coupon" | "empty";

export type MockTreasureReward = {
  id: string;
  treasure_box_id: string;
  gift_product_id: string | null;
  reward_quantity: number;
  remaining_quantity: number;
  reward_type: MockRewardType;
  status: MockTreasureRewardStatus;
};

export const mockTreasureRewards: MockTreasureReward[] = [
  {
    id: "70000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    gift_product_id: "60000000-0000-0000-0000-000000000001",
    reward_quantity: 20,
    remaining_quantity: 19,
    reward_type: "coupon",
    status: "active",
  },
  {
    id: "70000000-0000-0000-0000-000000000002",
    treasure_box_id: "50000000-0000-0000-0000-000000000002",
    gift_product_id: "60000000-0000-0000-0000-000000000002",
    reward_quantity: 10,
    remaining_quantity: 10,
    reward_type: "coupon",
    status: "active",
  },
  {
    id: "70000000-0000-0000-0000-000000000003",
    treasure_box_id: "50000000-0000-0000-0000-000000000003",
    gift_product_id: null,
    reward_quantity: 5,
    remaining_quantity: 5,
    reward_type: "empty",
    status: "active",
  },
  {
    id: "70000000-0000-0000-0000-000000000004",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    gift_product_id: "60000000-0000-0000-0000-000000000004",
    reward_quantity: 5,
    remaining_quantity: 0,
    reward_type: "coupon",
    status: "inactive",
  },
];
