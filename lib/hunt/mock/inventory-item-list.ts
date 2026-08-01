import { mockInventoryItems, type MockInventoryItem, type MockInventoryItemStatus } from "@/lib/hunt/mock/inventory-items";

/**
 * inventory_item_list view 컬럼.
 * coupon_code / barcode_value / provider_* 민감정보는 포함하지 않는다.
 * @see supabase/migrations/001_init_mvp_schema.sql
 */
export type MockInventoryItemListRow = {
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
  issue_failed_reason: string | null;
  created_at: string;
  updated_at: string;
};

export function toInventoryItemListRow(item: MockInventoryItem): MockInventoryItemListRow {
  return {
    id: item.id,
    user_id: item.user_id,
    treasure_claim_id: item.treasure_claim_id,
    treasure_box_id: item.treasure_box_id,
    treasure_reward_id: item.treasure_reward_id,
    gift_product_id: item.gift_product_id,
    status: item.status,
    issued_at: item.issued_at,
    used_at: item.used_at,
    expired_at: item.expired_at,
    issue_failed_reason: item.issue_failed_reason,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export const mockInventoryItemList: MockInventoryItemListRow[] = mockInventoryItems.map(toInventoryItemListRow);
