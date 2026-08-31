export type OperationLogEventType =
  | "treasure_created"
  | "treasure_updated"
  | "treasure_deleted"
  | "treasure_restored"
  | "product_created"
  | "product_updated"
  | "product_status_changed"
  | "mapping_created"
  | "mapping_replaced"
  | "mapping_deactivated"
  | "mapping_ended"
  | "reward_retry_requested"
  | "inquiry_answer_saved"
  | "inquiry_status_changed"
  | "internal_memo_saved"
  | "user_suspended"
  | "user_unsuspended"
  | "csv_exported"
  | "admin_login"
  | "admin_login_failed";

export type OperationLogSensitivity = "normal" | "sensitive";

export type OperationLogResult = "success" | "failed" | "blocked" | "pending";

export type OperationLogResourceType =
  | "treasure"
  | "product"
  | "mapping"
  | "reward"
  | "user"
  | "inquiry"
  | "admin"
  | "csv_export"
  | "system";

export type OperationLogListItem = {
  id: string;
  createdAt: string;
  eventType: OperationLogEventType;
  sensitivity: OperationLogSensitivity;
  adminId: string;
  adminName: string;
  resourceType: OperationLogResourceType;
  resourceId: string;
  summary: string;
  result: OperationLogResult;
};

export const OPERATION_LOG_EVENT_TYPE_LABEL: Record<OperationLogEventType, string> = {
  treasure_created: "보물 생성",
  treasure_updated: "보물 수정",
  treasure_deleted: "보물 삭제",
  treasure_restored: "보물 복구",
  product_created: "상품 생성",
  product_updated: "상품 수정",
  product_status_changed: "상품 상태 변경",
  mapping_created: "매칭 생성",
  mapping_replaced: "매칭 교체",
  mapping_deactivated: "매칭 비활성화",
  mapping_ended: "매칭 종료",
  reward_retry_requested: "보상 재처리 요청",
  inquiry_answer_saved: "문의 답변 저장",
  inquiry_status_changed: "문의 상태 변경",
  internal_memo_saved: "내부 메모 저장",
  user_suspended: "유저 정지",
  user_unsuspended: "유저 정지 해제",
  csv_exported: "CSV 내보내기",
  admin_login: "관리자 로그인",
  admin_login_failed: "관리자 로그인 실패",
};

export const OPERATION_LOG_SENSITIVITY_LABEL: Record<OperationLogSensitivity, string> = {
  normal: "일반",
  sensitive: "민감",
};

export const OPERATION_LOG_RESULT_LABEL: Record<OperationLogResult, string> = {
  success: "성공",
  failed: "실패",
  blocked: "차단",
  pending: "대기",
};

export const OPERATION_LOG_RESOURCE_TYPE_LABEL: Record<OperationLogResourceType, string> = {
  treasure: "보물상자",
  product: "상품",
  mapping: "매칭",
  reward: "보상",
  user: "유저",
  inquiry: "문의",
  admin: "관리자",
  csv_export: "CSV",
  system: "시스템",
};

export const OPERATION_LOG_SENSITIVITY_RANK: Record<OperationLogSensitivity, number> = {
  normal: 1,
  sensitive: 2,
};

const SENSITIVE_EVENT_TYPES: OperationLogEventType[] = [
  "user_suspended",
  "user_unsuspended",
  "csv_exported",
  "admin_login",
  "admin_login_failed",
];

const EVENT_RESOURCE: Record<OperationLogEventType, OperationLogResourceType> = {
  treasure_created: "treasure",
  treasure_updated: "treasure",
  treasure_deleted: "treasure",
  treasure_restored: "treasure",
  product_created: "product",
  product_updated: "product",
  product_status_changed: "product",
  mapping_created: "mapping",
  mapping_replaced: "mapping",
  mapping_deactivated: "mapping",
  mapping_ended: "mapping",
  reward_retry_requested: "reward",
  inquiry_answer_saved: "inquiry",
  inquiry_status_changed: "inquiry",
  internal_memo_saved: "inquiry",
  user_suspended: "user",
  user_unsuspended: "user",
  csv_exported: "csv_export",
  admin_login: "admin",
  admin_login_failed: "admin",
};

const eventTypes: OperationLogEventType[] = Object.keys(OPERATION_LOG_EVENT_TYPE_LABEL) as OperationLogEventType[];

const admins = [
  { id: "admin_01", name: "김운영" },
  { id: "admin_02", name: "이관리" },
  { id: "admin_03", name: "박운영" },
];

const results: OperationLogResult[] = ["success", "success", "success", "failed", "blocked", "pending"];

function resourceIdFor(eventType: OperationLogEventType, index: number) {
  const bucket = (index % 8) + 1;
  switch (EVENT_RESOURCE[eventType]) {
    case "treasure":
      return `TRS-${8000 + bucket}`;
    case "product":
      return `PRD-${2000 + bucket}`;
    case "mapping":
      return `MAP-${3000 + bucket}`;
    case "reward":
      return `RWD-${4000 + bucket}`;
    case "user":
      return `USR-${1000 + bucket}`;
    case "inquiry":
      return `INQ-${1000 + bucket}`;
    case "admin":
      return admins[index % admins.length].id;
    case "csv_export":
      return `CSV-${5000 + bucket}`;
    default:
      return `SYS-${index}`;
  }
}

function buildMockOperationLogs(): OperationLogListItem[] {
  const logs: OperationLogListItem[] = [];

  for (let index = 1; index <= 48; index += 1) {
    const eventType = eventTypes[index % eventTypes.length];
    const sensitivity: OperationLogSensitivity = SENSITIVE_EVENT_TYPES.includes(eventType) ? "sensitive" : "normal";
    const admin = admins[index % admins.length];
    const day = String((index % 28) + 1).padStart(2, "0");
    const hour = String((index % 20) + 1).padStart(2, "0");
    const resourceType = EVENT_RESOURCE[eventType];
    const resourceId = resourceIdFor(eventType, index);
    const result = results[index % results.length];

    logs.push({
      id: `OPL-${1000 + index}`,
      createdAt: `2026-08-${day}T${hour}:12:00+09:00`,
      eventType,
      sensitivity,
      adminId: admin.id,
      adminName: admin.name,
      resourceType,
      resourceId,
      summary: `${OPERATION_LOG_EVENT_TYPE_LABEL[eventType]} · ${resourceId}`,
      result,
    });
  }

  return logs;
}

export const MOCK_OPERATION_LOGS: OperationLogListItem[] = buildMockOperationLogs();

export const MOCK_OPERATION_LOG_ADMINS = admins;

export function formatOperationLogDateTime(value: string | null) {
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

export function getOperationLogResourceHref(log: OperationLogListItem): string | null {
  switch (log.resourceType) {
    case "treasure":
      return `/admin/treasures/${log.resourceId}`;
    case "product":
      return `/admin/products/${log.resourceId}`;
    case "mapping":
      return `/admin/mappings?mappingId=${encodeURIComponent(log.resourceId)}`;
    case "reward":
      return `/admin/reward-requests?rewardId=${encodeURIComponent(log.resourceId)}`;
    case "inquiry":
      return `/admin/inquiries/${log.resourceId}`;
    case "user":
      return null;
    case "admin":
      return `/admin/admins`;
    case "csv_export":
    case "system":
      return null;
    default:
      return null;
  }
}
