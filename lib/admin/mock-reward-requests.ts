export type AdminRewardStatus = "ready" | "issued" | "failed" | "used" | "expired" | "canceled";
export type AdminRewardRetryStatus = "none" | "requested" | "in_progress" | "succeeded" | "failed";
export type AdminRewardDateField = "claimed_at" | "issue_requested_at" | "issued_at" | "failed_at" | "expires_at";
export type AdminRewardRetryRequestStatus = "pending" | "processing" | "success" | "failed" | "canceled";
export type AdminRewardRetryWorkerResult = "success" | "failed" | null;

export type AdminRewardRequestListItem = {
  rewardId: string;
  claimedAt: string;
  issueRequestedAt: string | null;
  issuedAt: string | null;
  failedAt: string | null;
  expiresAt: string | null;
  userDisplayId: string;
  userNickname: string;
  treasureBoxId: string;
  treasureTitle: string;
  productId: string | null;
  productName: string | null;
  status: AdminRewardStatus;
  providerRequestId: string | null;
  lastFailureCode: string | null;
  retryRequestStatus: AdminRewardRetryStatus;
  latestRetryRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminRewardRetryRequestHistoryItem = {
  retryRequestId: string;
  rewardId: string;
  rewardStatus: AdminRewardStatus;
  treasureBoxId: string;
  treasureTitle: string;
  productId: string | null;
  productName: string | null;
  userPublicId: string;
  retryStatus: AdminRewardRetryRequestStatus;
  reason: string;
  internalMemo: string | null;
  previousErrorCode: string | null;
  previousErrorMessage: string | null;
  workerResult: AdminRewardRetryWorkerResult;
  workerErrorCode: string | null;
  workerErrorMessage: string | null;
  providerRequestId: string | null;
  requestedByAdminName: string;
  createdAt: string;
  processingStartedAt: string | null;
  processedAt: string | null;
};

export type AdminRewardDetail = AdminRewardRequestListItem & {
  failureReason: string | null;
  userRetryCount: number;
  internalMemo: string | null;
  userStatus: "active" | "inactive" | "blocked";
  productBrandName: string | null;
};

export const ADMIN_REWARD_STATUS_LABEL: Record<AdminRewardStatus, string> = {
  ready: "ready",
  issued: "issued",
  failed: "failed",
  used: "used",
  expired: "expired",
  canceled: "canceled",
};

export const ADMIN_REWARD_RETRY_STATUS_LABEL: Record<AdminRewardRetryStatus, string> = {
  none: "요청 없음",
  requested: "요청됨",
  in_progress: "처리 중",
  succeeded: "성공",
  failed: "실패",
};

export const ADMIN_REWARD_DATE_FIELD_LABEL: Record<AdminRewardDateField, string> = {
  claimed_at: "획득일",
  issue_requested_at: "발급 요청일",
  issued_at: "발급 완료일",
  failed_at: "실패 발생일",
  expires_at: "만료일",
};

export const ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL: Record<AdminRewardRetryRequestStatus, string> = {
  pending: "pending",
  processing: "processing",
  success: "success",
  failed: "failed",
  canceled: "canceled",
};

export const MOCK_ADMIN_REWARD_REQUESTS: AdminRewardRequestListItem[] = [
  {
    rewardId: "reward-20260809-001",
    claimedAt: "2026-08-09T09:12:00+09:00",
    issueRequestedAt: "2026-08-09T09:13:00+09:00",
    issuedAt: null,
    failedAt: "2026-08-09T09:14:00+09:00",
    expiresAt: "2026-09-08T23:59:59+09:00",
    userDisplayId: "USR-2048",
    userNickname: "보물헌터01",
    treasureBoxId: "treasure-gangnam-station-01",
    treasureTitle: "강남역 점심 보물",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    status: "failed",
    providerRequestId: "REQ-GFT-900124",
    lastFailureCode: "PROVIDER_TIMEOUT",
    retryRequestStatus: "requested",
    latestRetryRequestedAt: "2026-08-09T09:25:00+09:00",
    createdAt: "2026-08-09T09:12:00+09:00",
    updatedAt: "2026-08-09T09:25:00+09:00",
  },
  {
    rewardId: "reward-20260809-002",
    claimedAt: "2026-08-09T10:42:00+09:00",
    issueRequestedAt: "2026-08-09T10:42:30+09:00",
    issuedAt: "2026-08-09T10:43:00+09:00",
    failedAt: null,
    expiresAt: "2026-09-08T23:59:59+09:00",
    userDisplayId: "USR-1182",
    userNickname: "숲길몽",
    treasureBoxId: "treasure-seongsu-cafe-02",
    treasureTitle: "성수 카페거리 보물",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    status: "issued",
    providerRequestId: "REQ-GFT-900125",
    lastFailureCode: null,
    retryRequestStatus: "none",
    latestRetryRequestedAt: null,
    createdAt: "2026-08-09T10:42:00+09:00",
    updatedAt: "2026-08-09T10:43:00+09:00",
  },
  {
    rewardId: "reward-20260808-003",
    claimedAt: "2026-08-08T18:20:00+09:00",
    issueRequestedAt: "2026-08-08T18:22:00+09:00",
    issuedAt: null,
    failedAt: "2026-08-08T18:23:00+09:00",
    expiresAt: "2026-09-07T23:59:59+09:00",
    userDisplayId: "USR-3310",
    userNickname: "달리는냥이",
    treasureBoxId: "treasure-city-hall-01",
    treasureTitle: "시청 광장 보물",
    productId: "prod-cu-mobile-voucher-5000",
    productName: "CU 모바일금액권 5천원",
    status: "failed",
    providerRequestId: "REQ-GFT-899810",
    lastFailureCode: "INVALID_PRODUCT",
    retryRequestStatus: "in_progress",
    latestRetryRequestedAt: "2026-08-08T19:00:00+09:00",
    createdAt: "2026-08-08T18:20:00+09:00",
    updatedAt: "2026-08-08T19:00:00+09:00",
  },
  {
    rewardId: "reward-20260808-004",
    claimedAt: "2026-08-08T14:08:00+09:00",
    issueRequestedAt: "2026-08-08T14:09:00+09:00",
    issuedAt: "2026-08-08T14:09:30+09:00",
    failedAt: null,
    expiresAt: "2026-09-07T23:59:59+09:00",
    userDisplayId: "USR-7741",
    userNickname: "연남탐험가",
    treasureBoxId: "treasure-jamsil-weekend-01",
    treasureTitle: "잠실 주말 보물",
    productId: "prod-baskin-single-regular",
    productName: "싱글레귤러 아이스크림",
    status: "used",
    providerRequestId: "REQ-GFT-899620",
    lastFailureCode: null,
    retryRequestStatus: "none",
    latestRetryRequestedAt: null,
    createdAt: "2026-08-08T14:08:00+09:00",
    updatedAt: "2026-08-08T15:12:00+09:00",
  },
  {
    rewardId: "reward-20260807-005",
    claimedAt: "2026-08-07T11:30:00+09:00",
    issueRequestedAt: null,
    issuedAt: null,
    failedAt: null,
    expiresAt: "2026-09-06T23:59:59+09:00",
    userDisplayId: "USR-4920",
    userNickname: "지도수집가",
    treasureBoxId: "treasure-new-namsan-01",
    treasureTitle: "남산타워 신규 보물",
    productId: null,
    productName: null,
    status: "ready",
    providerRequestId: null,
    lastFailureCode: null,
    retryRequestStatus: "none",
    latestRetryRequestedAt: null,
    createdAt: "2026-08-07T11:30:00+09:00",
    updatedAt: "2026-08-07T11:30:00+09:00",
  },
  {
    rewardId: "reward-20260806-006",
    claimedAt: "2026-08-06T20:10:00+09:00",
    issueRequestedAt: "2026-08-06T20:11:00+09:00",
    issuedAt: null,
    failedAt: "2026-08-06T20:12:00+09:00",
    expiresAt: "2026-09-05T23:59:59+09:00",
    userDisplayId: "USR-8190",
    userNickname: "밤산책러",
    treasureBoxId: "treasure-itaewon-dinner-01",
    treasureTitle: "이태원 저녁 보물",
    productId: "prod-kyochon-honey-combo",
    productName: "교촌 허니콤보 웨지감자 세트",
    status: "failed",
    providerRequestId: "REQ-GFT-898300",
    lastFailureCode: "PRODUCT_INACTIVE",
    retryRequestStatus: "failed",
    latestRetryRequestedAt: "2026-08-07T09:00:00+09:00",
    createdAt: "2026-08-06T20:10:00+09:00",
    updatedAt: "2026-08-07T09:20:00+09:00",
  },
  {
    rewardId: "reward-20260805-007",
    claimedAt: "2026-08-05T13:00:00+09:00",
    issueRequestedAt: "2026-08-05T13:01:00+09:00",
    issuedAt: "2026-08-05T13:02:00+09:00",
    failedAt: null,
    expiresAt: "2026-08-05T23:59:59+09:00",
    userDisplayId: "USR-2711",
    userNickname: "행운상자",
    treasureBoxId: "treasure-yeouido-lunch-01",
    treasureTitle: "여의도 점심 보물",
    productId: "prod-twosome-americano-r",
    productName: "투썸플레이스 아메리카노 R",
    status: "expired",
    providerRequestId: "REQ-GFT-897012",
    lastFailureCode: null,
    retryRequestStatus: "succeeded",
    latestRetryRequestedAt: "2026-08-05T18:30:00+09:00",
    createdAt: "2026-08-05T13:00:00+09:00",
    updatedAt: "2026-08-05T23:59:59+09:00",
  },
  {
    rewardId: "reward-20260804-008",
    claimedAt: "2026-08-04T09:40:00+09:00",
    issueRequestedAt: null,
    issuedAt: null,
    failedAt: null,
    expiresAt: null,
    userDisplayId: "USR-6012",
    userNickname: "취소된사냥",
    treasureBoxId: "treasure-hongdae-night-03",
    treasureTitle: "홍대 야간 보물",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    status: "canceled",
    providerRequestId: null,
    lastFailureCode: null,
    retryRequestStatus: "none",
    latestRetryRequestedAt: null,
    createdAt: "2026-08-04T09:40:00+09:00",
    updatedAt: "2026-08-04T09:45:00+09:00",
  },
];

export const MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY: AdminRewardRetryRequestHistoryItem[] = [
  {
    retryRequestId: "REQ-0041",
    rewardId: "reward-20260809-001",
    rewardStatus: "failed",
    treasureBoxId: "treasure-gangnam-station-01",
    treasureTitle: "강남역 점심 보물",
    productId: "prod-starbucks-americano-tall",
    productName: "스타벅스 아메리카노 Tall",
    userPublicId: "USR-2048",
    retryStatus: "pending",
    reason: "외부 발급 시스템 응답 지연",
    internalMemo: "첫 실패 후 10분 이상 provider 응답 없음. 사용자 문의 전 선제 재처리 요청.",
    previousErrorCode: "PROVIDER_TIMEOUT",
    previousErrorMessage: "기프티쇼비즈 응답 지연",
    workerResult: null,
    workerErrorCode: null,
    workerErrorMessage: null,
    providerRequestId: "REQ-GFT-900124",
    requestedByAdminName: "김운영",
    createdAt: "2026-08-09T09:25:00+09:00",
    processingStartedAt: null,
    processedAt: null,
  },
  {
    retryRequestId: "REQ-0040",
    rewardId: "reward-20260808-003",
    rewardStatus: "failed",
    treasureBoxId: "treasure-city-hall-01",
    treasureTitle: "시청 광장 보물",
    productId: "prod-cu-mobile-voucher-5000",
    productName: "CU 모바일금액권 5천원",
    userPublicId: "USR-3310",
    retryStatus: "processing",
    reason: "데이터 보정 후 재처리",
    internalMemo: "상품 ID 매핑 보정 후 Worker 대기열에 재등록.",
    previousErrorCode: "INVALID_PRODUCT",
    previousErrorMessage: "외부 상품 ID 검증 실패",
    workerResult: null,
    workerErrorCode: null,
    workerErrorMessage: null,
    providerRequestId: "REQ-GFT-899810",
    requestedByAdminName: "박운영",
    createdAt: "2026-08-08T19:00:00+09:00",
    processingStartedAt: "2026-08-08T19:02:00+09:00",
    processedAt: null,
  },
  {
    retryRequestId: "REQ-0039",
    rewardId: "reward-20260806-006",
    rewardStatus: "failed",
    treasureBoxId: "treasure-itaewon-dinner-01",
    treasureTitle: "이태원 저녁 보물",
    productId: "prod-kyochon-honey-combo",
    productName: "교촌 허니콤보 웨지감자 세트",
    userPublicId: "USR-8190",
    retryStatus: "failed",
    reason: "운영자 수동 재처리",
    internalMemo: "상품 상태 확인 후 재시도했지만 외부 시스템에서 inactive 응답 유지.",
    previousErrorCode: "PRODUCT_INACTIVE",
    previousErrorMessage: "상품 비활성 상태",
    workerResult: "failed",
    workerErrorCode: "PRODUCT_INACTIVE",
    workerErrorMessage: "기프티쇼비즈 상품이 비활성 상태입니다.",
    providerRequestId: "REQ-GFT-898300",
    requestedByAdminName: "김운영",
    createdAt: "2026-08-07T09:00:00+09:00",
    processingStartedAt: "2026-08-07T09:05:00+09:00",
    processedAt: "2026-08-07T09:20:00+09:00",
  },
  {
    retryRequestId: "REQ-0038",
    rewardId: "reward-20260805-007",
    rewardStatus: "expired",
    treasureBoxId: "treasure-yeouido-lunch-01",
    treasureTitle: "여의도 점심 보물",
    productId: "prod-twosome-americano-r",
    productName: "투썸플레이스 아메리카노 R",
    userPublicId: "USR-2711",
    retryStatus: "success",
    reason: "사용자 문의 기반 재처리",
    internalMemo: "사용자 문의 확인 후 재처리 성공. 보상 자체는 만료 정책에 따라 expired 유지.",
    previousErrorCode: "PROVIDER_TEMPORARY_ERROR",
    previousErrorMessage: "외부 발급 시스템 일시 오류",
    workerResult: "success",
    workerErrorCode: null,
    workerErrorMessage: null,
    providerRequestId: "REQ-GFT-897012",
    requestedByAdminName: "박운영",
    createdAt: "2026-08-05T18:30:00+09:00",
    processingStartedAt: "2026-08-05T18:32:00+09:00",
    processedAt: "2026-08-05T18:43:00+09:00",
  },
  {
    retryRequestId: "REQ-0037",
    rewardId: "reward-20260806-006",
    rewardStatus: "failed",
    treasureBoxId: "treasure-itaewon-dinner-01",
    treasureTitle: "이태원 저녁 보물",
    productId: "prod-kyochon-honey-combo",
    productName: "교촌 허니콤보 웨지감자 세트",
    userPublicId: "USR-8190",
    retryStatus: "canceled",
    reason: "기타",
    internalMemo: "중복 요청으로 운영자가 취소 처리.",
    previousErrorCode: "PRODUCT_INACTIVE",
    previousErrorMessage: "상품 비활성 상태",
    workerResult: null,
    workerErrorCode: null,
    workerErrorMessage: null,
    providerRequestId: "REQ-GFT-898300",
    requestedByAdminName: "김운영",
    createdAt: "2026-08-06T21:00:00+09:00",
    processingStartedAt: null,
    processedAt: "2026-08-06T21:05:00+09:00",
  },
];

const ADMIN_REWARD_FAILURE_REASON: Record<string, string> = {
  PROVIDER_TIMEOUT: "기프티쇼비즈 응답 시간이 초과되었습니다.",
  INVALID_PRODUCT: "외부 상품 ID 검증에 실패했습니다.",
  PRODUCT_INACTIVE: "외부 발급 시스템에서 상품 비활성 상태를 반환했습니다.",
  PROVIDER_TEMPORARY_ERROR: "외부 발급 시스템 일시 오류가 발생했습니다.",
};

const ADMIN_REWARD_DETAIL_OVERRIDES: Record<string, Pick<AdminRewardDetail, "internalMemo" | "productBrandName" | "userRetryCount" | "userStatus">> = {
  "reward-20260809-001": {
    internalMemo: "provider timeout 발생. pending 재처리 요청이 있으므로 중복 생성 금지.",
    productBrandName: "스타벅스",
    userRetryCount: 1,
    userStatus: "active",
  },
  "reward-20260809-002": {
    internalMemo: "정상 발급 완료 건. 쿠폰 번호와 바코드는 CMS에 표시하지 않음.",
    productBrandName: "스타벅스",
    userRetryCount: 0,
    userStatus: "active",
  },
  "reward-20260808-003": {
    internalMemo: "상품 ID 보정 후 processing 상태의 재처리 요청 진행 중.",
    productBrandName: "CU",
    userRetryCount: 2,
    userStatus: "active",
  },
  "reward-20260808-004": {
    internalMemo: "사용 완료 보상. 재처리 대상 아님.",
    productBrandName: "배스킨라빈스",
    userRetryCount: 0,
    userStatus: "active",
  },
  "reward-20260807-005": {
    internalMemo: "쿠폰 발급 전 ready 상태. 상품 연결 확인 필요.",
    productBrandName: null,
    userRetryCount: 0,
    userStatus: "active",
  },
  "reward-20260806-006": {
    internalMemo: "상품 비활성 응답으로 실패. 외부 상품 상태 확인 후 재요청 가능.",
    productBrandName: "교촌치킨",
    userRetryCount: 3,
    userStatus: "active",
  },
  "reward-20260805-007": {
    internalMemo: "재처리 성공 이력은 있으나 보상 만료 정책은 유지.",
    productBrandName: "투썸플레이스",
    userRetryCount: 1,
    userStatus: "active",
  },
  "reward-20260804-008": {
    internalMemo: "사용자 취소 플로우로 지급 취소 처리된 건.",
    productBrandName: "스타벅스",
    userRetryCount: 0,
    userStatus: "inactive",
  },
};

export function formatAdminRewardDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function getAdminRewardDateValue(item: AdminRewardRequestListItem, field: AdminRewardDateField) {
  if (field === "issue_requested_at") return item.issueRequestedAt;
  if (field === "issued_at") return item.issuedAt;
  if (field === "failed_at") return item.failedAt;
  if (field === "expires_at") return item.expiresAt;
  return item.claimedAt;
}

export function findAdminRewardRequest(rewardId: string) {
  return MOCK_ADMIN_REWARD_REQUESTS.find((item) => item.rewardId === rewardId) ?? null;
}

export function getAdminRewardRetryHistoryByRewardId(rewardId: string) {
  return MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY
    .filter((item) => item.rewardId === rewardId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLatestAdminRewardRetryRequest(rewardId: string) {
  return getAdminRewardRetryHistoryByRewardId(rewardId)[0] ?? null;
}

export function findAdminRewardDetail(rewardId: string): AdminRewardDetail | null {
  const reward = findAdminRewardRequest(rewardId);
  if (!reward) return null;

  const overrides = ADMIN_REWARD_DETAIL_OVERRIDES[reward.rewardId] ?? {
    internalMemo: null,
    productBrandName: null,
    userRetryCount: 0,
    userStatus: "active" as const,
  };

  return {
    ...reward,
    failureReason: reward.lastFailureCode ? ADMIN_REWARD_FAILURE_REASON[reward.lastFailureCode] ?? "관리자 확인이 필요한 실패입니다." : null,
    ...overrides,
  };
}
