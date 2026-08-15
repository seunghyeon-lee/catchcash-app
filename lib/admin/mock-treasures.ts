export type AdminTreasureSaveStatus = "active" | "inactive" | "deleted";

export type AdminTreasureCalculatedStatus =
  | "visible"
  | "scheduled"
  | "expired"
  | "sold_out"
  | "invalid"
  | "hidden";

export type AdminTreasureListItem = {
  id: string;
  treasureCode: string;
  title: string;
  locationLabel: string;
  regionLabel: string;
  latitude: number | null;
  longitude: number | null;
  status: AdminTreasureSaveStatus;
  calculatedStatus: AdminTreasureCalculatedStatus;
  startsAt: string;
  endsAt: string;
  maxClaimCount: number;
  currentClaimCount: number;
  activeMappingCount: number;
  activeProductCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_TREASURE_SAVE_STATUS_LABEL: Record<AdminTreasureSaveStatus, string> = {
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
  hidden: "hidden",
};

export const MOCK_ADMIN_TREASURES: AdminTreasureListItem[] = [
  {
    id: "treasure-jongno-factory-01",
    treasureCode: "B-1042",
    title: "광화문 광장 보물",
    locationLabel: "서울 종로구 세종대로",
    regionLabel: "서울 종로구",
    latitude: 37.572,
    longitude: 126.9769,
    status: "active",
    calculatedStatus: "visible",
    startsAt: "2026-07-01T00:00:00+09:00",
    endsAt: "2026-09-30T23:59:59+09:00",
    maxClaimCount: 100,
    currentClaimCount: 37,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-06-20T10:15:00+09:00",
    updatedAt: "2026-08-08T14:20:00+09:00",
  },
  {
    id: "treasure-yeouido-lunch-01",
    treasureCode: "B-1108",
    title: "여의도 점심 보물",
    locationLabel: "서울 영등포구 여의대로",
    regionLabel: "서울 영등포구",
    latitude: 37.5219,
    longitude: 126.9245,
    status: "active",
    calculatedStatus: "visible",
    startsAt: "2026-08-01T09:00:00+09:00",
    endsAt: "2026-08-31T21:00:00+09:00",
    maxClaimCount: 80,
    currentClaimCount: 22,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-07-25T11:10:00+09:00",
    updatedAt: "2026-08-09T09:40:00+09:00",
  },
  {
    id: "treasure-hongdae-night-01",
    treasureCode: "B-1188",
    title: "홍대 야간 보물",
    locationLabel: "서울 마포구 어울마당로",
    regionLabel: "서울 마포구",
    latitude: 37.5563,
    longitude: 126.9236,
    status: "active",
    calculatedStatus: "scheduled",
    startsAt: "2026-08-20T18:00:00+09:00",
    endsAt: "2026-09-20T23:59:59+09:00",
    maxClaimCount: 60,
    currentClaimCount: 0,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-08-05T16:30:00+09:00",
    updatedAt: "2026-08-10T10:00:00+09:00",
  },
  {
    id: "treasure-gangnam-station-01",
    treasureCode: "B-1210",
    title: "강남역 출구 보물",
    locationLabel: "서울 강남구 강남대로",
    regionLabel: "서울 강남구",
    latitude: 37.4979,
    longitude: 127.0276,
    status: "active",
    calculatedStatus: "sold_out",
    startsAt: "2026-07-10T00:00:00+09:00",
    endsAt: "2026-08-31T23:59:59+09:00",
    maxClaimCount: 50,
    currentClaimCount: 50,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-07-05T09:00:00+09:00",
    updatedAt: "2026-08-07T19:10:00+09:00",
  },
  {
    id: "treasure-itaewon-dinner-01",
    treasureCode: "B-1302",
    title: "이태원 저녁 보물",
    locationLabel: "서울 용산구 이태원로",
    regionLabel: "서울 용산구",
    latitude: 37.5345,
    longitude: 126.9946,
    status: "active",
    calculatedStatus: "expired",
    startsAt: "2026-06-01T12:00:00+09:00",
    endsAt: "2026-07-15T23:59:59+09:00",
    maxClaimCount: 40,
    currentClaimCount: 28,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-05-20T13:40:00+09:00",
    updatedAt: "2026-07-16T00:05:00+09:00",
  },
  {
    id: "treasure-mapo-riverside-02",
    treasureCode: "B-1401",
    title: "마포 강변 보물",
    locationLabel: "서울 마포구 토정로",
    regionLabel: "서울 마포구",
    latitude: null,
    longitude: null,
    status: "active",
    calculatedStatus: "invalid",
    startsAt: "2026-08-01T00:00:00+09:00",
    endsAt: "2026-09-15T23:59:59+09:00",
    maxClaimCount: 30,
    currentClaimCount: 2,
    activeMappingCount: 0,
    activeProductCount: 0,
    deletedAt: null,
    createdAt: "2026-07-28T15:20:00+09:00",
    updatedAt: "2026-08-06T11:00:00+09:00",
  },
  {
    id: "treasure-jamsil-park-01",
    treasureCode: "B-1505",
    title: "잠실 한강공원 보물",
    locationLabel: "서울 송파구 올림픽로",
    regionLabel: "서울 송파구",
    latitude: 37.5172,
    longitude: 127.0824,
    status: "inactive",
    calculatedStatus: "hidden",
    startsAt: "2026-08-05T00:00:00+09:00",
    endsAt: "2026-09-05T23:59:59+09:00",
    maxClaimCount: 70,
    currentClaimCount: 0,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-07-30T08:50:00+09:00",
    updatedAt: "2026-08-04T17:30:00+09:00",
  },
  {
    id: "treasure-busan-gwangalli-01",
    treasureCode: "B-1600",
    title: "광안리 해변 보물",
    locationLabel: "부산 수영구 광안해변로",
    regionLabel: "부산 수영구",
    latitude: 35.1532,
    longitude: 129.1186,
    status: "deleted",
    calculatedStatus: "hidden",
    startsAt: "2026-05-01T00:00:00+09:00",
    endsAt: "2026-06-30T23:59:59+09:00",
    maxClaimCount: 90,
    currentClaimCount: 41,
    activeMappingCount: 0,
    activeProductCount: 0,
    deletedAt: "2026-07-02T10:00:00+09:00",
    createdAt: "2026-04-18T12:00:00+09:00",
    updatedAt: "2026-07-02T10:00:00+09:00",
  },
  {
    id: "treasure-seongsu-cafe-01",
    treasureCode: "B-1711",
    title: "성수 카페거리 보물",
    locationLabel: "서울 성동구 연무장길",
    regionLabel: "서울 성동구",
    latitude: 37.5445,
    longitude: 127.0557,
    status: "active",
    calculatedStatus: "visible",
    startsAt: "2026-08-12T00:00:00+09:00",
    endsAt: "2026-09-12T23:59:59+09:00",
    maxClaimCount: 45,
    currentClaimCount: 5,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-08-10T09:20:00+09:00",
    updatedAt: "2026-08-11T13:15:00+09:00",
  },
  {
    id: "treasure-daejeon-expo-01",
    treasureCode: "B-1803",
    title: "대전 엑스포 보물",
    locationLabel: "대전 유성구 엑스포로",
    regionLabel: "대전 유성구",
    latitude: 36.3741,
    longitude: 127.3845,
    status: "active",
    calculatedStatus: "scheduled",
    startsAt: "2026-09-01T10:00:00+09:00",
    endsAt: "2026-09-30T22:00:00+09:00",
    maxClaimCount: 120,
    currentClaimCount: 0,
    activeMappingCount: 1,
    activeProductCount: 1,
    deletedAt: null,
    createdAt: "2026-08-08T18:00:00+09:00",
    updatedAt: "2026-08-09T12:30:00+09:00",
  },
];

export type AdminTreasureHistoryAction = "delete" | "restore";

export type AdminTreasureHistoryItem = {
  id: string;
  action: AdminTreasureHistoryAction;
  adminName: string;
  reason: string;
  createdAt: string;
};

export type AdminTreasureDetail = AdminTreasureListItem & {
  description: string;
  hintText: string;
  radiusM: number;
  mappedProductName: string | null;
  mappedProductId: string | null;
  mappingStatus: "active" | "inactive" | "none";
  createdBy: string;
  updatedBy: string;
  history: AdminTreasureHistoryItem[];
};

export type AdminTreasureVisibleCheckKey =
  | "notDeleted"
  | "statusActive"
  | "hasCoordinates"
  | "periodValid"
  | "claimAvailable"
  | "hasActiveMapping"
  | "productActive";

export const ADMIN_TREASURE_HISTORY_ACTION_LABEL: Record<AdminTreasureHistoryAction, string> = {
  delete: "삭제",
  restore: "복구",
};

export const ADMIN_TREASURE_VISIBLE_CHECK_LABEL: Record<AdminTreasureVisibleCheckKey, string> = {
  notDeleted: "삭제되지 않음",
  statusActive: "저장 상태 active",
  hasCoordinates: "좌표 존재",
  periodValid: "운영 기간 유효",
  claimAvailable: "획득 수량 여유",
  hasActiveMapping: "활성 매칭 존재",
  productActive: "연결 상품 active",
};

const TREASURE_DETAIL_EXTRA: Record<
  string,
  Pick<
    AdminTreasureDetail,
    "description" | "hintText" | "radiusM" | "mappedProductName" | "mappedProductId" | "mappingStatus" | "createdBy" | "updatedBy" | "history"
  >
> = {
  "treasure-jongno-factory-01": {
    description: "광화문 광장 인근 시즌 이벤트 보물상자입니다.",
    hintText: "큰 건물 앞쪽을 바라보세요.",
    radiusM: 30,
    mappedProductName: "스타벅스 아메리카노 Tall",
    mappedProductId: "prod-starbucks-americano-tall",
    mappingStatus: "active",
    createdBy: "김운영",
    updatedBy: "김운영",
    history: [],
  },
  "treasure-mapo-riverside-02": {
    description: "좌표 및 매칭이 부족한 테스트용 보물입니다.",
    hintText: "강변 산책로 근처를 확인하세요.",
    radiusM: 25,
    mappedProductName: null,
    mappedProductId: null,
    mappingStatus: "none",
    createdBy: "이운영",
    updatedBy: "이운영",
    history: [],
  },
  "treasure-busan-gwangalli-01": {
    description: "운영 종료 후 soft delete된 보물상자입니다.",
    hintText: "해변 산책로 근처의 표지판을 확인하세요.",
    radiusM: 40,
    mappedProductName: null,
    mappedProductId: null,
    mappingStatus: "none",
    createdBy: "박관리",
    updatedBy: "김운영",
    history: [
      {
        id: "hist-busan-delete-01",
        action: "delete",
        adminName: "김운영",
        reason: "운영 종료 후 정리",
        createdAt: "2026-07-02T10:00:00+09:00",
      },
    ],
  },
  "treasure-jamsil-park-01": {
    description: "비활성 상태로 보관 중인 잠실 한강공원 보물입니다.",
    hintText: "공원 입구 근처를 확인하세요.",
    radiusM: 35,
    mappedProductName: "CU 모바일금액권 5천원",
    mappedProductId: "prod-cu-mobile-voucher-5000",
    mappingStatus: "active",
    createdBy: "이운영",
    updatedBy: "이운영",
    history: [],
  },
};

function buildDefaultDetailExtra(treasure: AdminTreasureListItem) {
  const hasMapping = treasure.activeMappingCount > 0 && treasure.activeProductCount > 0;

  return {
    description: `${treasure.title} 운영 상세 정보입니다.`,
    hintText: `${treasure.locationLabel} 주변을 탐색하세요.`,
    radiusM: 30,
    mappedProductName: hasMapping ? "연결 상품 mock" : null,
    mappedProductId: hasMapping ? "prod-mock-linked" : null,
    mappingStatus: hasMapping ? ("active" as const) : ("none" as const),
    createdBy: "김운영",
    updatedBy: "김운영",
    history: [] as AdminTreasureHistoryItem[],
  };
}

export function findAdminTreasure(id: string) {
  return MOCK_ADMIN_TREASURES.find((treasure) => treasure.id === id);
}

export function findAdminTreasureDetail(id: string): AdminTreasureDetail | undefined {
  const treasure = findAdminTreasure(id);
  if (!treasure) return undefined;

  const extra = TREASURE_DETAIL_EXTRA[id] ?? buildDefaultDetailExtra(treasure);
  return { ...treasure, ...extra };
}

export function getAdminTreasureVisibleChecks(detail: AdminTreasureDetail) {
  const now = Date.now();
  const starts = new Date(detail.startsAt).getTime();
  const ends = new Date(detail.endsAt).getTime();

  return {
    notDeleted: detail.deletedAt === null && detail.status !== "deleted",
    statusActive: detail.status === "active",
    hasCoordinates: detail.latitude !== null && detail.longitude !== null,
    periodValid: now >= starts && now <= ends,
    claimAvailable: detail.currentClaimCount < detail.maxClaimCount,
    hasActiveMapping: detail.mappingStatus === "active" && detail.activeMappingCount > 0,
    productActive: detail.activeProductCount > 0 && detail.mappingStatus === "active",
  } satisfies Record<AdminTreasureVisibleCheckKey, boolean>;
}

export function formatAdminTreasureDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatAdminTreasureDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatAdminTreasurePeriod(startsAt: string, endsAt: string) {
  return `${formatAdminTreasureDate(startsAt)} ~ ${formatAdminTreasureDate(endsAt)}`;
}
