export type MockTreasureClaimResult = "success" | "too_far" | "empty" | "fail";

export type MockTreasureClaim = {
  id: string;
  user_id: string;
  treasure_box_id: string;
  treasure_reward_id: string | null;
  result: MockTreasureClaimResult;
  distance_m: number;
  claimed_latitude: number;
  claimed_longitude: number;
  created_at: string;
};

/** UI fixture. seed 대비 추가 claim은 보관함 상태 카드용. treasure_claim_id unique를 지킨다. */
export const mockTreasureClaims: MockTreasureClaim[] = [
  {
    id: "80000000-0000-0000-0000-000000000001",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000001",
    result: "success",
    distance_m: 21.5,
    claimed_latitude: 37.52831,
    claimed_longitude: 126.93269,
    created_at: "2026-07-28T12:00:00+09:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000002",
    user_id: "20000000-0000-0000-0000-000000000002",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000001",
    result: "too_far",
    distance_m: 144.2,
    claimed_latitude: 37.527,
    claimed_longitude: 126.93,
    created_at: "2026-07-28T13:00:00+09:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000003",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000003",
    treasure_reward_id: "70000000-0000-0000-0000-000000000003",
    result: "empty",
    distance_m: 18.4,
    claimed_latitude: 37.56649,
    claimed_longitude: 126.97801,
    created_at: "2026-07-27T18:30:00+09:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000004",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000004",
    result: "success",
    distance_m: 15.2,
    claimed_latitude: 37.5283,
    claimed_longitude: 126.9327,
    created_at: "2026-07-27T10:00:00+09:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000005",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000002",
    treasure_reward_id: "70000000-0000-0000-0000-000000000002",
    result: "success",
    distance_m: 12.8,
    claimed_latitude: 37.54461,
    claimed_longitude: 127.05591,
    created_at: "2026-07-20T09:00:00+09:00",
  },
  {
    id: "80000000-0000-0000-0000-000000000006",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000001",
    result: "success",
    distance_m: 19.1,
    claimed_latitude: 37.52829,
    claimed_longitude: 126.93271,
    created_at: "2026-06-01T09:00:00+09:00",
  },
];
