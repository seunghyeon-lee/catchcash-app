export type AdminTreasureStatus = "active" | "inactive" | "deleted";
export type AdminTreasureCalculatedStatus = "visible" | "scheduled" | "expired" | "sold_out" | "invalid";
export type AdminMappingStatus = "active" | "inactive";
export type AdminMappingProductStatus = "active" | "inactive";
export type AdminMappingTreasureOptionStatus = "active" | "inactive" | "sold_out" | "expired" | "invalid";

export type AdminMappingListItem = {
  mappingId: string;
  treasureId: string;
  treasureTitle: string;
  treasureStatus: AdminTreasureStatus;
  treasureCalculatedStatus: AdminTreasureCalculatedStatus;
  productId: string;
  productName: string;
  productBrand: string;
  productStatus: AdminMappingProductStatus;
  mappingStatus: AdminMappingStatus;
  createdAt: string;
  updatedAt: string;
  inactiveReason?: string | null;
};

export type AdminMappingTreasureOption = {
  treasureId: string;
  title: string;
  locationLabel: string;
  status: AdminMappingTreasureOptionStatus;
  currentClaimCount: number;
  maxClaimCount: number;
  deletedAt: string | null;
};

export const ADMIN_TREASURE_STATUS_LABEL: Record<AdminTreasureStatus, string> = {
  active: "active",
  inactive: "inactive",
  deleted: "deleted",
};

export const ADMIN_TREASURE_CALCULATED_STATUS_LABEL: Record<AdminTreasureCalculatedStatus, string> = {
  visible: "visible",
  scheduled: "scheduled",
  expired: "expired",
  sold_out: "sold_out",
  invalid: "invalid",
};

export const ADMIN_MAPPING_STATUS_LABEL: Record<AdminMappingStatus, string> = {
  active: "active",
  inactive: "inactive",
};

export const MOCK_ADMIN_MAPPINGS: AdminMappingListItem[] = [
  {
    mappingId: "M-1042",
    treasureId: "treasure-gangnam-station-01",
    treasureTitle: "강남역 점심 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "visible",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    productBrand: "스타벅스",
    productStatus: "active",
    mappingStatus: "active",
    createdAt: "2026-07-26T09:00:00+09:00",
    updatedAt: "2026-07-26T09:00:00+09:00",
    inactiveReason: null,
  },
  {
    mappingId: "M-1043",
    treasureId: "treasure-gangnam-station-01",
    treasureTitle: "강남역 점심 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "visible",
    productId: "prod-gs25-mobile-voucher-3000",
    productName: "GS25 모바일금액권 3천원",
    productBrand: "GS25",
    productStatus: "active",
    mappingStatus: "inactive",
    createdAt: "2026-07-20T10:10:00+09:00",
    updatedAt: "2026-07-25T18:30:00+09:00",
    inactiveReason: "운영 상품 교체",
  },
  {
    mappingId: "M-1050",
    treasureId: "treasure-seongsu-cafe-02",
    treasureTitle: "성수 카페거리 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "visible",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    productBrand: "스타벅스",
    productStatus: "active",
    mappingStatus: "active",
    createdAt: "2026-07-27T11:30:00+09:00",
    updatedAt: "2026-07-27T11:30:00+09:00",
    inactiveReason: null,
  },
  {
    mappingId: "M-1061",
    treasureId: "treasure-jamsil-weekend-01",
    treasureTitle: "잠실 주말 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "sold_out",
    productId: "prod-baskin-single-regular",
    productName: "싱글레귤러 아이스크림",
    productBrand: "배스킨라빈스",
    productStatus: "active",
    mappingStatus: "active",
    createdAt: "2026-07-24T10:10:00+09:00",
    updatedAt: "2026-07-28T20:00:00+09:00",
    inactiveReason: null,
  },
  {
    mappingId: "M-1075",
    treasureId: "treasure-yeonnam-park-03",
    treasureTitle: "연남 공원 보물",
    treasureStatus: "inactive",
    treasureCalculatedStatus: "invalid",
    productId: "prod-baskin-single-regular",
    productName: "싱글레귤러 아이스크림",
    productBrand: "배스킨라빈스",
    productStatus: "active",
    mappingStatus: "inactive",
    createdAt: "2026-07-25T16:45:00+09:00",
    updatedAt: "2026-07-29T09:10:00+09:00",
    inactiveReason: "보물 운영 중지",
  },
  {
    mappingId: "M-1088",
    treasureId: "treasure-city-hall-01",
    treasureTitle: "시청 광장 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "scheduled",
    productId: "prod-cu-mobile-voucher-5000",
    productName: "CU 모바일금액권 5천원",
    productBrand: "CU",
    productStatus: "active",
    mappingStatus: "active",
    createdAt: "2026-07-22T08:00:00+09:00",
    updatedAt: "2026-07-30T08:00:00+09:00",
    inactiveReason: null,
  },
  {
    mappingId: "M-1094",
    treasureId: "treasure-itaewon-dinner-01",
    treasureTitle: "이태원 저녁 보물",
    treasureStatus: "active",
    treasureCalculatedStatus: "expired",
    productId: "prod-kyochon-honey-combo",
    productName: "교촌 허니콤보 웨지감자 세트",
    productBrand: "교촌치킨",
    productStatus: "inactive",
    mappingStatus: "inactive",
    createdAt: "2026-07-13T18:20:00+09:00",
    updatedAt: "2026-07-24T17:35:00+09:00",
    inactiveReason: "상품 inactive 전환",
  },
  {
    mappingId: "M-1101",
    treasureId: "treasure-deleted-test-01",
    treasureTitle: "삭제된 테스트 보물",
    treasureStatus: "deleted",
    treasureCalculatedStatus: "invalid",
    productId: "prod-megabox-popcorn-r",
    productName: "메가박스 오리지널 팝콘 R",
    productBrand: "메가박스",
    productStatus: "inactive",
    mappingStatus: "inactive",
    createdAt: "2026-07-17T11:50:00+09:00",
    updatedAt: "2026-07-26T15:30:00+09:00",
    inactiveReason: "테스트 보물 삭제",
  },
];

export const MOCK_ADMIN_MAPPING_TREASURES: AdminMappingTreasureOption[] = [
  {
    treasureId: "treasure-gangnam-station-01",
    title: "강남역 점심 보물",
    locationLabel: "강남역 11번 출구 근처",
    status: "active",
    currentClaimCount: 12,
    maxClaimCount: 50,
    deletedAt: null,
  },
  {
    treasureId: "treasure-seongsu-cafe-02",
    title: "성수 카페거리 보물",
    locationLabel: "성수동 카페거리",
    status: "active",
    currentClaimCount: 8,
    maxClaimCount: 40,
    deletedAt: null,
  },
  {
    treasureId: "treasure-jamsil-weekend-01",
    title: "잠실 주말 보물",
    locationLabel: "잠실역 롯데월드몰 인근",
    status: "sold_out",
    currentClaimCount: 30,
    maxClaimCount: 30,
    deletedAt: null,
  },
  {
    treasureId: "treasure-city-hall-01",
    title: "시청 광장 보물",
    locationLabel: "서울광장",
    status: "active",
    currentClaimCount: 3,
    maxClaimCount: 35,
    deletedAt: null,
  },
  {
    treasureId: "treasure-new-namsan-01",
    title: "남산타워 신규 보물",
    locationLabel: "남산서울타워 입구",
    status: "inactive",
    currentClaimCount: 0,
    maxClaimCount: 25,
    deletedAt: null,
  },
  {
    treasureId: "treasure-deleted-test-01",
    title: "삭제된 테스트 보물",
    locationLabel: "테스트 위치",
    status: "invalid",
    currentClaimCount: 0,
    maxClaimCount: 1,
    deletedAt: "2026-07-26T15:30:00+09:00",
  },
];

export function findActiveAdminMapping(treasureId: string) {
  return MOCK_ADMIN_MAPPINGS.find((mapping) => mapping.treasureId === treasureId && mapping.mappingStatus === "active");
}

export function formatAdminMappingDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
