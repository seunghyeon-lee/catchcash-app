import { getAdminContext, type AdminDataSource, type AdminWriteResult } from "./admin-context";
import {
  findAdminProduct,
  getAdminProductMappings,
  MOCK_ADMIN_PRODUCTS,
  type AdminProductListItem,
  type AdminProductMappingSummary,
  type AdminProductStatus,
} from "./mock-products";

export type AdminProductListResult = {
  products: AdminProductListItem[];
  source: AdminDataSource;
  message?: string;
};

export type AdminProductDetailResult = {
  product: AdminProductListItem | undefined;
  mappings: AdminProductMappingSummary[];
  source: AdminDataSource;
  message?: string;
};

type GiftProductStatus = "active" | "inactive" | "sold_out";

type GiftProductRow = {
  id: string;
  provider_product_id: string | null;
  brand_name: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  status: GiftProductStatus;
  created_at: string;
  updated_at: string;
};

type ProductMappingRewardRow = {
  gift_product_id: string | null;
  treasure_box_id: string;
  status: "active" | "replaced" | "ended";
  created_at: string;
  treasure_boxes?: { title?: string } | { title?: string }[] | null;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 상품 데이터를 표시하고 있습니다.";
const ERROR_MESSAGE = "상품 데이터를 불러오지 못해 예시 데이터를 표시합니다.";

const GIFT_PRODUCT_COLUMNS =
  "id, provider_product_id, brand_name, product_name, product_image_url, price, status, created_at, updated_at";

function mapProductStatus(status: GiftProductStatus): AdminProductStatus {
  return status === "active" ? "active" : "inactive";
}

function toProductListItem(row: GiftProductRow, activeMappingCount: number): AdminProductListItem {
  return {
    id: row.id,
    name: row.product_name,
    brandName: row.brand_name,
    externalProductId: row.provider_product_id ?? "-",
    price: row.price,
    status: mapProductStatus(row.status),
    imageUrl: row.product_image_url,
    activeMappingCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function relationTitle(relation: ProductMappingRewardRow["treasure_boxes"]): string {
  if (!relation) return "-";
  if (Array.isArray(relation)) return relation[0]?.title ?? "-";
  return relation.title ?? "-";
}

export async function loadAdminProducts(): Promise<AdminProductListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { products: MOCK_ADMIN_PRODUCTS, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const [productsResult, rewardsResult] = await Promise.all([
      context.client.from("gift_products").select(GIFT_PRODUCT_COLUMNS).order("created_at", { ascending: false }),
      context.client.from("treasure_rewards").select("gift_product_id").eq("status", "active"),
    ]);

    if (productsResult.error) throw new Error(productsResult.error.message);

    const activeCountByProduct = new Map<string, number>();
    for (const row of (rewardsResult.data ?? []) as { gift_product_id: string | null }[]) {
      if (!row.gift_product_id) continue;
      activeCountByProduct.set(row.gift_product_id, (activeCountByProduct.get(row.gift_product_id) ?? 0) + 1);
    }

    const products = ((productsResult.data ?? []) as GiftProductRow[]).map((row) =>
      toProductListItem(row, activeCountByProduct.get(row.id) ?? 0),
    );

    return { products, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminProducts는 mock으로 fallback합니다:", error);
    return { products: MOCK_ADMIN_PRODUCTS, source: "mock", message: ERROR_MESSAGE };
  }
}

export async function loadAdminProductDetail(id: string): Promise<AdminProductDetailResult> {
  const context = await getAdminContext();
  if (!context) {
    return {
      product: findAdminProduct(id),
      mappings: getAdminProductMappings(id),
      source: "mock",
      message: MOCK_MESSAGE,
    };
  }

  try {
    const { data: product, error: productError } = await context.client
      .from("gift_products")
      .select(GIFT_PRODUCT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (productError) throw new Error(productError.message);
    if (!product) return { product: undefined, mappings: [], source: "supabase" };

    const { data: rewardRows } = await context.client
      .from("treasure_rewards")
      .select("gift_product_id, treasure_box_id, status, created_at, treasure_boxes(title)")
      .eq("gift_product_id", id)
      .order("created_at", { ascending: false });

    const mappings: AdminProductMappingSummary[] = ((rewardRows ?? []) as unknown as ProductMappingRewardRow[]).map((row) => ({
      treasureId: row.treasure_box_id,
      treasureName: relationTitle(row.treasure_boxes),
      mappingStatus: row.status === "active" ? "active" : "inactive",
      mappedAt: row.created_at,
    }));

    const activeMappingCount = mappings.filter((mapping) => mapping.mappingStatus === "active").length;

    return {
      product: toProductListItem(product as GiftProductRow, activeMappingCount),
      mappings,
      source: "supabase",
    };
  } catch (error) {
    console.warn("[admin] loadAdminProductDetail은 mock으로 fallback합니다:", error);
    return {
      product: findAdminProduct(id),
      mappings: getAdminProductMappings(id),
      source: "mock",
      message: ERROR_MESSAGE,
    };
  }
}

// ---------------------------------------------------------------------------
// 4차: 상품 등록 쓰기 연결 (삭제 없음)
// ---------------------------------------------------------------------------

export type AdminProductWritePayload = {
  brandName: string;
  productName: string;
  price: number;
  status: "active" | "inactive";
  imageUrl: string | null;
  externalProductId: string | null;
};

const WRITE_MOCK_MESSAGE = "관리자 세션이 없어 실제 저장 없이 mock 처리했습니다.";

export async function insertAdminProduct(payload: AdminProductWritePayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    const { data, error } = await context.client
      .from("gift_products")
      .insert({
        // 외부 API 미연결: 항상 manual_mock provider로 등록한다.
        provider: "manual_mock",
        provider_product_id: payload.externalProductId,
        brand_name: payload.brandName,
        product_name: payload.productName,
        product_image_url: payload.imageUrl,
        price: payload.price,
        status: payload.status,
        created_by: context.adminUserId,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { source: "supabase", ok: true, id: data?.id as string };
  } catch (error) {
    console.warn("[admin] insertAdminProduct 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "상품 등록에 실패했습니다." };
  }
}

// 이미지 업로드(Storage)는 미연결이므로 수정 화면에서는 product_image_url을 건드리지 않는다.
export type AdminProductUpdatePayload = Omit<AdminProductWritePayload, "imageUrl">;

export async function updateAdminProduct(id: string, payload: AdminProductUpdatePayload): Promise<AdminWriteResult> {
  const context = await getAdminContext();
  if (!context) return { source: "mock", ok: true, message: WRITE_MOCK_MESSAGE };

  try {
    const { error } = await context.client
      .from("gift_products")
      .update({
        // provider(manual_mock)와 created_by는 등록 시점 값을 유지한다.
        provider_product_id: payload.externalProductId,
        brand_name: payload.brandName,
        product_name: payload.productName,
        price: payload.price,
        status: payload.status,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { source: "supabase", ok: true, id };
  } catch (error) {
    console.warn("[admin] updateAdminProduct 실패:", error);
    return { source: "supabase", ok: false, message: error instanceof Error ? error.message : "상품 수정에 실패했습니다." };
  }
}
