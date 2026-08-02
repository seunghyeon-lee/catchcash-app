export type MockGiftProductStatus = "active" | "inactive";

export type MockGiftProduct = {
  id: string;
  provider: string;
  provider_product_id: string;
  brand_name: string;
  product_name: string;
  /** UI 단계에서는 에셋 키(coffee/sandwich)를 넣는다. 실서비스 URL 교체는 이후 단계. */
  product_image_url: string;
  price: number;
  status: MockGiftProductStatus;
};

export const mockGiftProducts: MockGiftProduct[] = [
  {
    id: "60000000-0000-0000-0000-000000000001",
    provider: "manual_mock",
    provider_product_id: "dev-coffee-001",
    brand_name: "모카랩",
    product_name: "아메리카노 교환권",
    product_image_url: "coffee",
    price: 4500,
    status: "active",
  },
  {
    id: "60000000-0000-0000-0000-000000000002",
    provider: "manual_mock",
    provider_product_id: "dev-snack-001",
    brand_name: "스낵하우스",
    product_name: "쿠키 세트 교환권",
    product_image_url: "sandwich",
    price: 3500,
    status: "active",
  },
  {
    id: "60000000-0000-0000-0000-000000000003",
    provider: "manual_mock",
    provider_product_id: "dev-store-001",
    brand_name: "편의점",
    product_name: "모바일 상품권 5천원",
    product_image_url: "coffee",
    price: 5000,
    status: "inactive",
  },
  {
    id: "60000000-0000-0000-0000-000000000004",
    provider: "manual_mock",
    provider_product_id: "dev-vitamin-001",
    brand_name: "광동제약",
    product_name: "비타500 100ml",
    product_image_url: "",
    price: 1200,
    status: "active",
  },
];
