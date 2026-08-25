import { getAdminContext, type AdminContext, type AdminDataSource } from "./admin-context";
import {
  getSecurityLogDetail,
  MOCK_SECURITY_LOGS,
  type SecurityLogDetail,
  type SecurityLogEventType,
  type SecurityLogListItem,
  type SecurityLogSeverity,
} from "./mock-security-logs";

export type AdminSecurityLogListResult = {
  logs: SecurityLogListItem[];
  source: AdminDataSource;
  message?: string;
};

export type AdminSecurityLogDetailResult = {
  detail: SecurityLogDetail | undefined;
  source: AdminDataSource;
  message?: string;
};

type SecurityLogRow = {
  id: string;
  user_id: string | null;
  admin_user_id: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const MOCK_MESSAGE = "관리자 인증이 연결되지 않아 예시 보안 로그를 표시하고 있습니다.";
const ERROR_MESSAGE = "보안 로그를 불러오지 못해 예시 데이터를 표시합니다. (super_admin 권한/RLS 확인 필요)";

const KNOWN_EVENT_TYPES = new Set<SecurityLogEventType>([
  "location_validation_failed",
  "repeated_claim_attempt",
  "abnormal_access",
  "permission_denied",
  "session_anomaly",
  "reward_issue_suspicious",
  "admin_security_event",
]);

// 심각도는 DB에 없어 event_type으로 추정한다(placeholder).
const SEVERITY_BY_EVENT: Partial<Record<SecurityLogEventType, SecurityLogSeverity>> = {
  reward_issue_suspicious: "high",
  abnormal_access: "high",
  permission_denied: "medium",
  session_anomaly: "medium",
  repeated_claim_attempt: "medium",
  location_validation_failed: "low",
  admin_security_event: "high",
};

function normalizeEventType(value: string): SecurityLogEventType {
  return KNOWN_EVENT_TYPES.has(value as SecurityLogEventType) ? (value as SecurityLogEventType) : "abnormal_access";
}

function metaString(metadata: Record<string, unknown> | null, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function toSecurityLogListItem(row: SecurityLogRow, nickname: string | undefined): SecurityLogListItem {
  const eventType = normalizeEventType(row.event_type);
  return {
    id: row.id,
    eventType,
    severity: SEVERITY_BY_EVENT[eventType] ?? "medium",
    status: "open",
    userPublicId: row.user_id ? `USR-${row.user_id.slice(0, 8)}` : null,
    nickname: nickname ?? null,
    treasureId: metaString(row.metadata, "treasure_id"),
    summary: metaString(row.metadata, "summary") ?? "실데이터 보안 이벤트",
    requestedAt: row.created_at,
    deviceAt: null,
    receivedAt: row.created_at,
  };
}

async function fetchNicknameMap(context: AdminContext) {
  const { data } = await context.client.from("profiles").select("user_id, nickname");
  const map = new Map<string, string>();
  for (const row of (data ?? []) as { user_id: string; nickname: string | null }[]) {
    if (row.nickname) map.set(row.user_id, row.nickname);
  }
  return map;
}

function maskIp(ip: string | null) {
  if (!ip) return "표시하지 않음";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  return "***";
}

/** 상세는 좌표·원본 payload를 노출하지 않는다(민감정보 금지). base만 실데이터, 나머지는 마스킹/placeholder. */
function toSecurityLogDetail(row: SecurityLogRow, nickname: string | undefined): SecurityLogDetail {
  const base = toSecurityLogListItem(row, nickname);
  return {
    ...base,
    resultNote: "실데이터 보안 이벤트입니다. 상세 심각도/상태는 아직 스키마에 없어 기본값으로 표시됩니다.",
    latitudeRounded: null,
    longitudeRounded: null,
    referenceLatitudeRounded: null,
    referenceLongitudeRounded: null,
    distanceMeters: null,
    accuracyMeters: null,
    allowedRadiusMeters: null,
    ipMasked: maskIp(row.ip_address),
    userAgentGeneralized: row.user_agent ? "Mobile/Web Client" : "표시하지 않음",
    osGeneralized: "표시하지 않음",
    appVersion: "표시하지 않음",
    networkType: "표시하지 않음",
    relatedUserStatus: base.userPublicId ? "active" : null,
    relatedTreasureStatus: base.treasureId ? "active" : null,
    relatedRewardId: null,
    relatedRewardStatus: null,
    coordinateNote: "좌표·원본 payload는 정책상 표시하지 않습니다.",
  };
}

export async function loadAdminSecurityLogs(): Promise<AdminSecurityLogListResult> {
  const context = await getAdminContext();
  if (!context) {
    return { logs: MOCK_SECURITY_LOGS, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const [logsResult, nicknameMap] = await Promise.all([
      context.client
        .from("security_logs")
        .select("id, user_id, admin_user_id, event_type, ip_address, user_agent, metadata, created_at")
        .order("created_at", { ascending: false }),
      fetchNicknameMap(context),
    ]);

    if (logsResult.error) throw new Error(logsResult.error.message);

    const logs = ((logsResult.data ?? []) as SecurityLogRow[]).map((row) =>
      toSecurityLogListItem(row, row.user_id ? nicknameMap.get(row.user_id) : undefined),
    );

    return { logs, source: "supabase" };
  } catch (error) {
    console.warn("[admin] loadAdminSecurityLogs는 mock으로 fallback합니다:", error);
    return { logs: MOCK_SECURITY_LOGS, source: "mock", message: ERROR_MESSAGE };
  }
}

export async function loadAdminSecurityLogDetail(id: string): Promise<AdminSecurityLogDetailResult> {
  const context = await getAdminContext();
  if (!context) {
    return { detail: getSecurityLogDetail(id) ?? undefined, source: "mock", message: MOCK_MESSAGE };
  }

  try {
    const { data: row, error } = await context.client
      .from("security_logs")
      .select("id, user_id, admin_user_id, event_type, ip_address, user_agent, metadata, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return { detail: undefined, source: "supabase" };

    const logRow = row as SecurityLogRow;
    const nicknameMap = await fetchNicknameMap(context);

    return {
      detail: toSecurityLogDetail(logRow, logRow.user_id ? nicknameMap.get(logRow.user_id) : undefined),
      source: "supabase",
    };
  } catch (error) {
    console.warn("[admin] loadAdminSecurityLogDetail은 mock으로 fallback합니다:", error);
    return { detail: getSecurityLogDetail(id) ?? undefined, source: "mock", message: ERROR_MESSAGE };
  }
}
