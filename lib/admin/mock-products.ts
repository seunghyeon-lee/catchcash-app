export type AdminProductStatus = "active" | "inactive";

export type AdminProductListItem = {
  id: string;
  name: string;
  brandName: string;
  externalProductId: string;
  price: number;
  status: AdminProductStatus;
  imageUrl: string | null;
  activeMappingCount: number;
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_PRODUCT_STATUS_LABEL: Record<AdminProductStatus, string> = {
  active: "active",
  inactive: "inactive",
};

export const MOCK_ADMIN_PRODUCTS: AdminProductListItem[] = [
  {
    id: "prod-starbucks-americano-tall",
    name: "스타벅스 아메리카노 Tall",
    brandName: "스타벅스",
    externalProductId: "GFT-10234",
    price: 4500,
    status: "active",
    imageUrl: null,
    activeMappingCount: 3,
    createdAt: "2026-07-25T09:30:00+09:00",
    updatedAt: "2026-07-30T11:20:00+09:00",
  },
  {
    id: "prod-baskin-single-regular",
    name: "싱글레귤러 아이스크림",
    brandName: "배스킨라빈스",
    externalProductId: "GFT-11882",
    price: 3900,
    status: "active",
    imageUrl: null,
    activeMappingCount: 5,
    createdAt: "2026-07-23T14:12:00+09:00",
    updatedAt: "2026-07-29T10:05:00+09:00",
  },
  {
    id: "prod-cu-mobile-voucher-5000",
    name: "CU 모바일금액권 5천원",
    brandName: "CU",
    externalProductId: "GFT-14005",
    price: 5000,
    status: "active",
    imageUrl: null,
    activeMappingCount: 7,
    createdAt: "2026-07-21T16:40:00+09:00",
    updatedAt: "2026-07-28T09:18:00+09:00",
  },
  {
    id: "prod-gs25-mobile-voucher-3000",
    name: "GS25 모바일금액권 3천원",
    brandName: "GS25",
    externalProductId: "GFT-13071",
    price: 3000,
    status: "active",
    imageUrl: null,
    activeMappingCount: 4,
    createdAt: "2026-07-18T13:05:00+09:00",
    updatedAt: "2026-07-27T18:42:00+09:00",
  },
  {
    id: "prod-megabox-popcorn-r",
    name: "메가박스 오리지널 팝콘 R",
    brandName: "메가박스",
    externalProductId: "GFT-15112",
    price: 6500,
    status: "inactive",
    imageUrl: null,
    activeMappingCount: 0,
    createdAt: "2026-07-17T11:50:00+09:00",
    updatedAt: "2026-07-26T15:30:00+09:00",
  },
  {
    id: "prod-paris-baguette-10000",
    name: "파리바게뜨 교환권 1만원",
    brandName: "파리바게뜨",
    externalProductId: "GFT-17220",
    price: 10000,
    status: "active",
    imageUrl: null,
    activeMappingCount: 2,
    createdAt: "2026-07-15T08:25:00+09:00",
    updatedAt: "2026-07-25T12:00:00+09:00",
  },
  {
    id: "prod-kyochon-honey-combo",
    name: "교촌 허니콤보 웨지감자 세트",
    brandName: "교촌치킨",
    externalProductId: "GFT-18891",
    price: 26000,
    status: "inactive",
    imageUrl: null,
    activeMappingCount: 1,
    createdAt: "2026-07-12T17:35:00+09:00",
    updatedAt: "2026-07-24T17:35:00+09:00",
  },
  {
    id: "prod-twosome-americano-r",
    name: "투썸플레이스 아메리카노 R",
    brandName: "투썸플레이스",
    externalProductId: "GFT-19302",
    price: 4700,
    status: "active",
    imageUrl: null,
    activeMappingCount: 6,
    createdAt: "2026-07-10T10:10:00+09:00",
    updatedAt: "2026-07-23T16:45:00+09:00",
  },
];

export function formatAdminProductPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

export function formatAdminProductDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
