import { getAdminContext, type AdminDataSource, type AdminWriteResult } from "./admin-context";
import {
  MOCK_ADMIN_MAPPINGS,
  type AdminMappingListItem,
  type AdminTreasureCalculatedStatus,
  type AdminTreasureStatus,
} from "./mock-mappings";
import { computeTreasureCalculatedStatus, mapTreasureSaveStatus, type TreasureBoxRow } from "./treasure-service";

export type AdminMappingListResult = {
  mappings: AdminMappingListItem[];
  source: AdminDataSource;
  message?: string;
};

type RewardStatus = "active" | "replaced" | "ended";
type TreasureBoxStatus = TreasureBoxRow["status"];

type MappingBoxRelation = {
  status: TreasureBoxStatus;
  latitude: number | null;
  longitude: number | null;
  starts_at: string | null;
  ends_at: string | null;
  current_claim_count: number;
  max_claim_count: number;
  deleted_at: string | null;
  title: string;
};

type MappingProductRelation = {
  product_name: string;
  brand_name: string;
  status: "active" | "inactive" | "sold_out";
};

type MappingRewardRow = {
  id: string;
  treasure_box_id: string;
  gift_product_id: string | null;
  status: RewardStatus;
  created_at: string;
  updated_at: string;
  treasure_boxes?: MappingBoxRelation | MappingBoxRelation[] | null;
  gift_products?: MappingProductRelation | MappingProductRelation[] | null;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 매칭 데이터를 표시하고 있습니다.";
const ERROR_MESSAGE = "매칭 데이터를 불러오지 못해 예시 데이터를 표시합니다.";

function single<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

/** 매칭 목록 타입에는 hidden이 없어 invalid로 clamp한다. */
function toMappingTreasureCalculatedStatus(box: MappingBoxRelation, hasActiveMapping: boolean): AdminTreasureCalculatedStatus {
  const status = computeTreasureCalculatedStatus(
    {
      status: box.status,
      latitude: box.latitude,
      longitude: box.longitude,
      starts_at: box.starts_at,
      ends_at: box.ends_at,
      current_claim_count: box.current_claim_count,
      max_claim_count: box.max_claim_count,
      deleted_at: box.deleted_at,
    },
    hasActiveMapping,
  );
  return status === "hidden" ? "invalid" : status;
}

export async function loadAdminMappings(): Promise<AdminMappingListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { mappings: MOCK_ADMIN_MAPPINGS, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data, error } = await context.client
      .from("treasure_rewards")
      .select(
        "id, treasure_box_id, gift_product_id, status, created_at, updated_at, " +
          "treasure_boxes(title, status, latitude, longitude, starts_at, ends_at, current_claim_count, max_claim_count, deleted_at), " +
          "gift_products(product_name, brand_name, status)",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const mappings: AdminMappingListItem[] = ((data ?? []) as unknown as MappingRewardRow[]).map((row) => {
      const box = single(row.treasure_boxes);
      const product = single(row.gift_products);
      const isActive = row.status === "active";

      const treasureStatus: AdminTreasureStatus = box ? mapTreasureSaveStatus(box.status) : "inactive";
      const treasureCalculatedStatus: AdminTreasureCalculatedStatus = box
        ? toMappingTreasureCalculatedStatus(box, isActive && Boolean(row.gift_product_id))
        : "invalid";

      return {
        mappingId: row.id,
        treasureId: row.treasure_box_id,
        treasureTitle: box?.title ?? "-",
        treasureStatus,
        treasureCalculatedStatus,
        productId: row.gift_product_id ?? "-",
        productName: product?.product_name ?? "-",
        productBrand: product?.brand_name ?? "-",
        // gift_products.status(active/inactive/sold_out)와 treasure_rewards.status(active/replaced/ended)를 그대로 노출한다.
        productStatus: product ? product.status : "inactive",
        mappingStatus: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        // 종료 사유는 operation_logs에 기록되며 목록 조회에는 포함하지 않는다.
        endedReason: null,
      };
    });

    return { mappings, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminMappings는 mock으로 fallback합니다:", error);
    return { mappings: MOCK_ADMIN_MAPPINGS, source: "mock", message: ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// 4차: 매핑 등록/교체 쓰기 연결 (삭제 없음)
// ---------------------------------------------------------------------------

export type AdminMappingWritePayload = {
  treasureBoxId: string;
  giftProductId: string;
  rewardQuantity: number;
};

const WRITE_MOCK_MESSAGE = "관리자 세션이 없어 실제 저장 없이 mock 처리했습니다.";

/**
 * 보물상자-상품 매핑(treasure_rewards)을 등록한다.
 * 보물당 active 매핑은 1개만 허용(unique index)되므로, 기존 active가 있으면
 * 먼저 replaced로 전환한 뒤 새 active를 insert한다(= 교체). 삭제는 하지 않는다.
 */
export async function createOrReplaceAdminMapping(payload: AdminMappingWritePayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    const { data: existing, error: findError } = await context.client
      .from("treasure_rewards")
      .select("id")
      .eq("treasure_box_id", payload.treasureBoxId)
      .eq("status", "active")
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (existing?.id) {
      const { error: replaceError } = await context.client
        .from("treasure_rewards")
        .update({ status: "replaced" })
        .eq("id", existing.id as string);
      if (replaceError) throw new Error(replaceError.message);
    }

    const { data, error: insertError } = await context.client
      .from("treasure_rewards")
      .insert({
        treasure_box_id: payload.treasureBoxId,
        gift_product_id: payload.giftProductId,
        reward_quantity: payload.rewardQuantity,
        remaining_quantity: payload.rewardQuantity,
        reward_type: "coupon",
        status: "active",
        created_by: context.adminUserId,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);
    return { source: "supabase", ok: true, id: data?.id as string };
  } catch (error) {
    console.warn("[admin] createOrReplaceAdminMapping 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "매핑 등록에 실패했습니다." };
  }
}

export type AdminMappingEndPayload = {
  mappingId: string;
  reason: string;
};

/**
 * 관리자가 매핑을 직접 종료한다: treasure_rewards.status active → ended.
 * 교체(replaced)와 달리 새 active 매핑을 만들지 않으며, 보물에 active 0개 상태를 허용한다.
 */
export async function endAdminMapping(payload: AdminMappingEndPayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    // status 조건을 update에 포함해 replaced/ended 매핑의 재종료를 DB 수준에서 차단한다.
    const { data, error } = await context.client
      .from("treasure_rewards")
      .update({ status: "ended" })
      .eq("id", payload.mappingId)
      .eq("status", "active")
      .select("id");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return { source: "supabase", ok: false, message: "active 상태의 매핑만 종료할 수 있습니다." };
    }

    // 종료 사유는 operation_logs에 남긴다. 로그 기록 실패가 이미 완료된 종료를 되돌리지는 않는다.
    const { error: logError } = await context.client.from("operation_logs").insert({
      admin_user_id: context.adminUserId,
      action: "mapping_ended",
      target_table: "treasure_rewards",
      target_id: payload.mappingId,
      metadata: { reason: payload.reason, summary: `매칭 종료: ${payload.reason}` },
    });
    if (logError) console.warn("[admin] 매핑 종료 사유 로그 기록 실패:", logError.message);

    return { source: "supabase", ok: true, id: payload.mappingId };
  } catch (error) {
    console.warn("[admin] endAdminMapping 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "매핑 종료에 실패했습니다." };
  }
}
