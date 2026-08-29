import { getAdminContext, type AdminDataSource } from "./admin-context";
import {
  MOCK_ADMIN_MAPPINGS,
  type AdminMappingListItem,
  type AdminMappingProductStatus,
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

function mapProductStatus(status: MappingProductRelation["status"]): AdminMappingProductStatus {
  return status === "active" ? "active" : "inactive";
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
        productStatus: product ? mapProductStatus(product.status) : "inactive",
        mappingStatus: isActive ? "active" : "inactive",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        inactiveReason: null,
      };
    });

    return { mappings, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminMappings는 mock으로 fallback합니다:", error);
    return { mappings: MOCK_ADMIN_MAPPINGS, source: "mock", message: ERROR_MESSAGE };
  }
}
