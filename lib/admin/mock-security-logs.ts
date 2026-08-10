export type SecurityLogEventType =
  | "location_validation_failed"
  | "repeated_claim_attempt"
  | "abnormal_access"
  | "permission_denied"
  | "session_anomaly"
  | "reward_issue_suspicious"
  | "admin_security_event";

export type SecurityLogSeverity = "low" | "medium" | "high" | "critical";

export type SecurityLogStatus = "open" | "reviewing" | "resolved" | "false_positive";

export type SecurityLogListItem = {
  id: string;
  eventType: SecurityLogEventType;
  severity: SecurityLogSeverity;
  status: SecurityLogStatus;
  userPublicId: string | null;
  nickname: string | null;
  treasureId: string | null;
  summary: string;
  requestedAt: string;
  deviceAt: string | null;
  receivedAt: string;
};

export const SECURITY_LOG_EVENT_TYPE_LABEL: Record<SecurityLogEventType, string> = {
  location_validation_failed: "위치 검증 실패",
  repeated_claim_attempt: "반복 획득 시도",
  abnormal_access: "비정상 접근",
  permission_denied: "권한 오류",
  session_anomaly: "세션 이상",
  reward_issue_suspicious: "보상 발급 의심",
  admin_security_event: "관리자 보안 이벤트",
};

export const SECURITY_LOG_SEVERITY_LABEL: Record<SecurityLogSeverity, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  critical: "치명",
};

export const SECURITY_LOG_STATUS_LABEL: Record<SecurityLogStatus, string> = {
  open: "미확인",
  reviewing: "확인 중",
  resolved: "조치 완료",
  false_positive: "오탐",
};

export const SECURITY_LOG_SEVERITY_RANK: Record<SecurityLogSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const eventTypes: SecurityLogEventType[] = [
  "location_validation_failed",
  "repeated_claim_attempt",
  "abnormal_access",
  "permission_denied",
  "session_anomaly",
  "reward_issue_suspicious",
  "admin_security_event",
];

const severities: SecurityLogSeverity[] = ["low", "medium", "high", "critical"];
const statuses: SecurityLogStatus[] = ["open", "reviewing", "resolved", "false_positive"];

function buildMockSecurityLogs(): SecurityLogListItem[] {
  const logs: SecurityLogListItem[] = [];

  for (let index = 1; index <= 42; index += 1) {
    const eventType = eventTypes[index % eventTypes.length];
    const severity = severities[index % severities.length];
    const status = statuses[index % statuses.length];
    const day = String((index % 28) + 1).padStart(2, "0");
    const hour = String((index % 20) + 1).padStart(2, "0");
    const isAdminEvent = eventType === "admin_security_event";
    const userPublicId = isAdminEvent ? null : `USR-${1000 + index}`;
    const nickname = isAdminEvent ? null : `탐험가${index}`;
    const treasureId = ["location_validation_failed", "repeated_claim_attempt", "reward_issue_suspicious"].includes(eventType)
      ? `TRS-${8000 + index}`
      : null;

    logs.push({
      id: `SEC-${1000 + index}`,
      eventType,
      severity,
      status,
      userPublicId,
      nickname,
      treasureId,
      summary: `${SECURITY_LOG_EVENT_TYPE_LABEL[eventType]} mock 이벤트 #${index}`,
      requestedAt: `2026-08-${day}T${hour}:05:00+09:00`,
      deviceAt: isAdminEvent ? null : `2026-08-${day}T${hour}:04:00+09:00`,
      receivedAt: `2026-08-${day}T${hour}:05:20+09:00`,
    });
  }

  return logs;
}

export const MOCK_SECURITY_LOGS: SecurityLogListItem[] = buildMockSecurityLogs();

export function formatSecurityLogDateTime(value: string | null) {
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

export function findSecurityLog(logId: string) {
  return MOCK_SECURITY_LOGS.find((log) => log.id === logId) ?? null;
}
