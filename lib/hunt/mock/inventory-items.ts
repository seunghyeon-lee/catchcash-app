export type MockInventoryItemStatus = "ready" | "issued" | "failed" | "used" | "expired";

/** inventory_items 테이블 raw. coupon_code / barcode_value 는 상세 조회용. */
export type MockInventoryItem = {
  id: string;
  user_id: string;
  treasure_claim_id: string;
  treasure_box_id: string;
  treasure_reward_id: string;
  gift_product_id: string;
  status: MockInventoryItemStatus;
  issued_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  coupon_code: string | null;
  barcode_value: string | null;
  issue_failed_reason: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * UI fixture. seed에는 issued 1건만 있어도, 보관함 상태 카드(가능/실패/사용/만료)를 위해 확장한다.
 * treasure_claim_id 는 schema unique 제약을 지킨다.
 */
export const mockInventoryItems: MockInventoryItem[] = [
  {
    id: "90000000-0000-0000-0000-000000000001",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_claim_id: "80000000-0000-0000-0000-000000000001",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000001",
    gift_product_id: "60000000-0000-0000-0000-000000000001",
    status: "issued",
    issued_at: "2026-07-28T12:10:00+09:00",
    used_at: null,
    expired_at: "2026-08-27T23:59:59+09:00",
    coupon_code: "1234-5678-9012",
    barcode_value: "8801234567890",
    issue_failed_reason: null,
    created_at: "2026-07-28T12:00:10+09:00",
    updated_at: "2026-07-28T12:10:00+09:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000002",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_claim_id: "80000000-0000-0000-0000-000000000004",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000004",
    gift_product_id: "60000000-0000-0000-0000-000000000004",
    status: "failed",
    issued_at: null,
    used_at: null,
    expired_at: null,
    coupon_code: null,
    barcode_value: null,
    issue_failed_reason: "네트워크 오류로 중단됨",
    created_at: "2026-07-27T10:00:00+09:00",
    updated_at: "2026-07-27T10:30:00+09:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000003",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_claim_id: "80000000-0000-0000-0000-000000000005",
    treasure_box_id: "50000000-0000-0000-0000-000000000002",
    treasure_reward_id: "70000000-0000-0000-0000-000000000002",
    gift_product_id: "60000000-0000-0000-0000-000000000002",
    status: "used",
    issued_at: "2026-07-20T09:00:00+09:00",
    used_at: "2026-07-22T14:30:00+09:00",
    expired_at: "2026-08-20T23:59:59+09:00",
    coupon_code: "4444-7777-1111",
    barcode_value: "8804444777711",
    issue_failed_reason: null,
    created_at: "2026-07-20T09:00:00+09:00",
    updated_at: "2026-07-22T14:30:00+09:00",
  },
  {
    id: "90000000-0000-0000-0000-000000000004",
    user_id: "20000000-0000-0000-0000-000000000001",
    treasure_claim_id: "80000000-0000-0000-0000-000000000006",
    treasure_box_id: "50000000-0000-0000-0000-000000000001",
    treasure_reward_id: "70000000-0000-0000-0000-000000000001",
    gift_product_id: "60000000-0000-0000-0000-000000000001",
    status: "expired",
    issued_at: "2026-06-01T09:00:00+09:00",
    used_at: null,
    expired_at: "2026-06-30T23:59:59+09:00",
    coupon_code: "9999-0000-5555",
    barcode_value: "8809999000055",
    issue_failed_reason: null,
    created_at: "2026-06-01T09:00:00+09:00",
    updated_at: "2026-06-30T23:59:59+09:00",
  },
];
