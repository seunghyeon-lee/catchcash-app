import { getAdminContext, type AdminDataSource } from "./admin-context";
import {
  MOCK_OPERATION_LOGS,
  OPERATION_LOG_EVENT_TYPE_LABEL,
  type OperationLogEventType,
  type OperationLogListItem,
  type OperationLogResourceType,
  type OperationLogResult,
  type OperationLogSensitivity,
} from "./mock-operation-logs";

export type AdminOperationLogListResult = {
  logs: OperationLogListItem[];
  source: AdminDataSource;
  message?: string;
};

type OperationLogRow = {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 운영 로그를 표시하고 있습니다.";
const ERROR_MESSAGE = "운영 로그를 불러오지 못해 예시 데이터를 표시합니다.";

const KNOWN_EVENT_TYPES = new Set<OperationLogEventType>(
  Object.keys(OPERATION_LOG_EVENT_TYPE_LABEL) as OperationLogEventType[],
);

// 민감 이벤트는 super_admin만 조회 가능해야 하므로 계정/권한 관련은 sensitive로 분류한다.
const SENSITIVE_EVENTS = new Set<OperationLogEventType>([
  "user_suspended",
  "user_unsuspended",
  "internal_memo_saved",
  "admin_login",
  "admin_login_failed",
]);

const RESOURCE_TYPE_BY_TABLE: Record<string, OperationLogResourceType> = {
  treasure_boxes: "treasure",
  gift_products: "product",
  treasure_rewards: "mapping",
  inventory_items: "reward",
  reward_retry_requests: "reward",
  profiles: "user",
  support_inquiries: "inquiry",
  support_replies: "inquiry",
  admin_users: "admin",
};

function normalizeEventType(action: string): OperationLogEventType {
  return KNOWN_EVENT_TYPES.has(action as OperationLogEventType) ? (action as OperationLogEventType) : "admin_login";
}

function mapResourceType(table: string): OperationLogResourceType {
  return RESOURCE_TYPE_BY_TABLE[table] ?? "system";
}

function metaString(metadata: Record<string, unknown> | null, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function toOperationLogListItem(row: OperationLogRow): OperationLogListItem {
  const eventType = normalizeEventType(row.action);
  const resultValue = metaString(row.metadata, "result");
  const result: OperationLogResult =
    resultValue === "failed" || resultValue === "blocked" || resultValue === "pending" ? resultValue : "success";
  const sensitivity: OperationLogSensitivity = SENSITIVE_EVENTS.has(eventType) ? "sensitive" : "normal";

  return {
    id: row.id,
    createdAt: row.created_at,
    eventType,
    sensitivity,
    adminId: row.admin_user_id ?? "-",
    // 관리자명은 admin_users 조인이 필요해 placeholder.
    adminName: "-",
    resourceType: mapResourceType(row.target_table),
    resourceId: row.target_id ?? "-",
    summary: metaString(row.metadata, "summary") ?? OPERATION_LOG_EVENT_TYPE_LABEL[eventType],
    result,
  };
}

export async function loadAdminOperationLogs(): Promise<AdminOperationLogListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { logs: MOCK_OPERATION_LOGS, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data, error } = await context.client
      .from("operation_logs")
      .select("id, admin_user_id, action, target_table, target_id, metadata, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const logs = ((data ?? []) as OperationLogRow[]).map(toOperationLogListItem);
    return { logs, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminOperationLogs는 mock으로 fallback합니다:", error);
    return { logs: MOCK_OPERATION_LOGS, source: "mock", message: ERROR_MESSAGE };
  }
}
