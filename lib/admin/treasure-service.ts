import { getAdminContext, type AdminDataSource, type AdminWriteResult } from "./admin-context";
import {
  findAdminTreasureDetail,
  MOCK_ADMIN_TREASURES,
  type AdminTreasureCalculatedStatus,
  type AdminTreasureDetail,
  type AdminTreasureListItem,
  type AdminTreasureSaveStatus,
} from "./mock-treasures";

export type AdminTreasureListResult = {
  treasures: AdminTreasureListItem[];
  source: AdminDataSource;
  message?: string;
};

export type AdminTreasureDetailResult = {
  treasure: AdminTreasureDetail | undefined;
  source: AdminDataSource;
  message?: string;
};

type TreasureBoxStatus = "draft" | "active" | "paused" | "ended" | "deleted";

export type TreasureBoxRow = {
  id: string;
  title: string;
  description: string | null;
  hint_text: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_m: number;
  status: TreasureBoxStatus;
  starts_at: string | null;
  ends_at: string | null;
  max_claim_count: number;
  current_claim_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ActiveRewardRow = {
  treasure_box_id: string;
  gift_product_id: string | null;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 보물상자 데이터를 표시하고 있습니다.";
const ERROR_MESSAGE = "보물상자 데이터를 불러오지 못해 예시 데이터를 표시합니다.";

const TREASURE_BOX_COLUMNS =
  "id, title, description, hint_text, location_text, latitude, longitude, radius_m, status, starts_at, ends_at, max_claim_count, current_claim_count, created_by, created_at, updated_at, deleted_at";

/** treasure_boxes.status(enum 5종) → 관리자 저장 상태(active/inactive/deleted) */
export function mapTreasureSaveStatus(status: TreasureBoxStatus): AdminTreasureSaveStatus {
  if (status === "active") return "active";
  if (status === "deleted") return "deleted";
  return "inactive";
}

export type TreasureCalcInput = Pick<
  TreasureBoxRow,
  "status" | "deleted_at" | "latitude" | "longitude" | "starts_at" | "ends_at" | "current_claim_count" | "max_claim_count"
>;

/** 앱 지도 노출 여부(계산 상태)를 box 상태 + 기간 + 수량 + 활성 매칭으로 산출한다. */
export function computeTreasureCalculatedStatus(box: TreasureCalcInput, hasActiveMapping: boolean): AdminTreasureCalculatedStatus {
  if (box.status === "deleted" || box.deleted_at) return "hidden";
  if (box.status !== "active") return "hidden";
  if (box.latitude === null || box.longitude === null) return "invalid";

  const now = Date.now();
  if (box.starts_at && now < Date.parse(box.starts_at)) return "scheduled";
  if (box.ends_at && now > Date.parse(box.ends_at)) return "expired";
  if (box.current_claim_count >= box.max_claim_count) return "sold_out";
  if (!hasActiveMapping) return "invalid";
  return "visible";
}

function deriveTreasureCode(id: string) {
  return `TB-${id.slice(0, 8)}`;
}

function deriveLocationLabel(box: TreasureBoxRow) {
  const locationText = box.location_text?.trim();
  if (locationText) return locationText;
  if (box.latitude === null || box.longitude === null) return "좌표 미등록";
  return `${box.latitude}, ${box.longitude}`;
}

export function toTreasureListItem(box: TreasureBoxRow, activeProductId: string | null | undefined): AdminTreasureListItem {
  const hasActiveMapping = activeProductId !== undefined;
  const hasActiveProduct = Boolean(activeProductId);
  return {
    id: box.id,
    treasureCode: deriveTreasureCode(box.id),
    title: box.title,
    locationLabel: deriveLocationLabel(box),
    regionLabel: "-",
    latitude: box.latitude,
    longitude: box.longitude,
    status: mapTreasureSaveStatus(box.status),
    calculatedStatus: computeTreasureCalculatedStatus(box, hasActiveMapping && hasActiveProduct),
    startsAt: box.starts_at ?? "",
    endsAt: box.ends_at ?? "",
    maxClaimCount: box.max_claim_count,
    currentClaimCount: box.current_claim_count,
    activeMappingCount: hasActiveMapping ? 1 : 0,
    activeProductCount: hasActiveProduct ? 1 : 0,
    deletedAt: box.deleted_at,
    createdAt: box.created_at,
    updatedAt: box.updated_at,
  };
}

export async function loadAdminTreasures(): Promise<AdminTreasureListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { treasures: MOCK_ADMIN_TREASURES, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const [boxesResult, rewardsResult] = await Promise.all([
      context.client.from("treasure_boxes").select(TREASURE_BOX_COLUMNS).order("created_at", { ascending: false }),
      context.client.from("treasure_rewards").select("treasure_box_id, gift_product_id").eq("status", "active"),
    ]);

    if (boxesResult.error) throw new Error(boxesResult.error.message);

    const activeProductByBox = new Map<string, string | null>();
    for (const row of (rewardsResult.data ?? []) as ActiveRewardRow[]) {
      activeProductByBox.set(row.treasure_box_id, row.gift_product_id);
    }

    const boxes = (boxesResult.data ?? []) as TreasureBoxRow[];
    const treasures = boxes.map((box) =>
      toTreasureListItem(box, activeProductByBox.has(box.id) ? activeProductByBox.get(box.id) ?? null : undefined),
    );

    return { treasures, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminTreasures는 mock으로 fallback합니다:", error);
    return { treasures: MOCK_ADMIN_TREASURES, source: "mock", message: ERROR_MESSAGE };
  }
}

export async function loadAdminTreasureDetail(id: string): Promise<AdminTreasureDetailResult> {
  const context = await getAdminContext();
  if (!context) {
    return { treasure: findAdminTreasureDetail(id), source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data: box, error: boxError } = await context.client
      .from("treasure_boxes")
      .select(TREASURE_BOX_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (boxError) throw new Error(boxError.message);
    if (!box) return { treasure: undefined, source: "supabase" };

    const boxRow = box as TreasureBoxRow;

    const { data: activeReward } = await context.client
      .from("treasure_rewards")
      .select("id, gift_product_id, gift_products(product_name)")
      .eq("treasure_box_id", id)
      .eq("status", "active")
      .maybeSingle();

    const activeRewardRow = (activeReward ?? null) as unknown as
      | { gift_product_id: string | null; gift_products?: { product_name?: string } | { product_name?: string }[] | null }
      | null;

    const mappedProductId = activeRewardRow?.gift_product_id ?? null;
    const productRelation = activeRewardRow?.gift_products;
    const mappedProductName = Array.isArray(productRelation)
      ? productRelation[0]?.product_name ?? null
      : productRelation?.product_name ?? null;

    const base = toTreasureListItem(boxRow, activeRewardRow ? mappedProductId : undefined);

    const treasure: AdminTreasureDetail = {
      ...base,
      description: boxRow.description ?? "",
      hintText: boxRow.hint_text ?? "",
      locationText: boxRow.location_text,
      radiusM: boxRow.radius_m,
      mappedProductName,
      mappedProductId,
      mappingStatus: activeReward ? "active" : "none",
      // created_by는 admin_users.id(uuid)이고 관리자명은 Data API 조인이 필요해 placeholder.
      // updated_by 컬럼은 스키마에 없음. 상세 정합성(7차)에서 필요 시 보강.
      createdBy: "-",
      updatedBy: "-",
      history: [],
    };

    return { treasure, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminTreasureDetail은 mock으로 fallback합니다:", error);
    return { treasure: findAdminTreasureDetail(id), source: "mock", message: ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// 4차: 등록/수정 쓰기 연결 (삭제 없음)
// ---------------------------------------------------------------------------

type TreasureSaveStatusInput = "draft" | "active" | "paused" | "ended";

export type AdminTreasureWritePayload = {
  title: string;
  description: string | null;
  hintText: string | null;
  locationText: string | null;
  latitude: number;
  longitude: number;
  radiusM: number;
  status: TreasureSaveStatusInput;
  startsAt: string | null;
  endsAt: string | null;
  maxClaimCount: number;
};

const WRITE_MOCK_MESSAGE = "관리자 세션이 없어 실제 저장 없이 mock 처리했습니다.";

function toTreasureRow(payload: AdminTreasureWritePayload) {
  return {
    title: payload.title,
    description: payload.description,
    hint_text: payload.hintText,
    location_text: payload.locationText,
    latitude: payload.latitude,
    longitude: payload.longitude,
    radius_m: payload.radiusM,
    status: payload.status,
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    max_claim_count: payload.maxClaimCount,
  };
}

export async function insertAdminTreasure(payload: AdminTreasureWritePayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    const { data, error } = await context.client
      .from("treasure_boxes")
      .insert({ ...toTreasureRow(payload), created_by: context.adminUserId })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { source: "supabase", ok: true, id: data?.id as string };
  } catch (error) {
    console.warn("[admin] insertAdminTreasure 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "보물상자 등록에 실패했습니다." };
  }
}

export async function updateAdminTreasure(id: string, payload: AdminTreasureWritePayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    const { error } = await context.client.from("treasure_boxes").update(toTreasureRow(payload)).eq("id", id);
    if (error) throw new Error(error.message);
    return { source: "supabase", ok: true, id };
  } catch (error) {
    console.warn("[admin] updateAdminTreasure 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "보물상자 수정에 실패했습니다." };
  }
}
