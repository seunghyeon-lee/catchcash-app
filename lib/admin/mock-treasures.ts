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

export function findAdminTreasure(id: string) {
  return MOCK_ADMIN_TREASURES.find((treasure) => treasure.id === id);
}

export function formatAdminTreasureDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatAdminTreasurePeriod(startsAt: string, endsAt: string) {
  return `${formatAdminTreasureDate(startsAt)} ~ ${formatAdminTreasureDate(endsAt)}`;
}
