import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";

/**
 * `claim_treasure_with_lock` RPC 반환 status.
 * 정상 게임 결과(SUCCESS/EMPTY)와 운영/검증 실패를 구분한다.
 * 계약: docs/db/Claim_Treasure_RPC_Contract.md,
 *      supabase/migrations/20260902090000_claim_treasure_with_lock_rpc.sql
 */
export type ClaimStatus =
  | "SUCCESS"
  | "EMPTY"
  | "TOO_FAR"
  | "EXPIRED_TREASURE"
  | "ALREADY_CLAIMED"
  | "INVALID_TREASURE"
  | "UNAUTHENTICATED"
  | "SUSPENDED_USER"
  | "LOCATION_ERROR"
  | "SERVER_ERROR";

const CLAIM_STATUSES: readonly ClaimStatus[] = [
  "SUCCESS",
  "EMPTY",
  "TOO_FAR",
  "EXPIRED_TREASURE",
  "ALREADY_CLAIMED",
  "INVALID_TREASURE",
  "UNAUTHENTICATED",
  "SUSPENDED_USER",
  "LOCATION_ERROR",
  "SERVER_ERROR",
];

export type ClaimTreasureResult = {
  status: ClaimStatus;
  /** SUCCESS/EMPTY만 true(정상 게임 결과). 나머지는 운영/검증 실패. */
  ok: boolean;
  claimId: string | null;
  rewardType: string | null;
  distanceM: number | null;
  radiusM: number | null;
  detail: string | null;
};

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** 알 수 없는 응답은 SERVER_ERROR로 정규화해 UI가 raw response 구조에 직접 의존하지 않게 한다. */
function normalizeClaimResult(raw: Record<string, unknown>): ClaimTreasureResult {
  const status = raw.status;
  const safeStatus: ClaimStatus =
    typeof status === "string" && (CLAIM_STATUSES as readonly string[]).includes(status)
      ? (status as ClaimStatus)
      : "SERVER_ERROR";

  return {
    status: safeStatus,
    ok: safeStatus === "SUCCESS" || safeStatus === "EMPTY",
    claimId: toStringOrNull(raw.claim_id),
    rewardType: toStringOrNull(raw.reward_type),
    distanceM: toNumberOrNull(raw.distance_m),
    radiusM: toNumberOrNull(raw.radius_m),
    detail: toStringOrNull(raw.detail),
  };
}

/**
 * 서버에서 보물 획득을 원자적으로 판정하는 `claim_treasure_with_lock` RPC를 호출한다.
 *
 * 사용자 식별은 서버 `auth.uid()` 기준이므로 클라이언트가 user_id를 넘기지 않고 좌표만 전달한다.
 * 인증/거리/기간/수량/중복/동시성 검증은 모두 서버(DB 함수)에서 처리하며,
 * 클라이언트는 결과 status만 소비한다(당첨/꽝을 프론트에서 확정하지 않음).
 * 세션 없음·네트워크·파싱 실패는 UNAUTHENTICATED / SERVER_ERROR로 정규화한다.
 */
export async function claimTreasureWithLock(
  treasureBoxId: string,
  coords: { latitude: number; longitude: number },
): Promise<ClaimTreasureResult> {
  const session = await getAuthenticatedUserSession();
  if (!session) {
    return normalizeClaimResult({ status: "UNAUTHENTICATED", detail: "NO_SESSION" });
  }

  const { data, error } = await session.client.rpc("claim_treasure_with_lock", {
    p_treasure_id: treasureBoxId,
    p_latitude: coords.latitude,
    p_longitude: coords.longitude,
  });

  if (error) {
    return normalizeClaimResult({ status: "SERVER_ERROR", detail: error.message });
  }
  if (!data || typeof data !== "object") {
    return normalizeClaimResult({ status: "SERVER_ERROR", detail: "EMPTY_RESPONSE" });
  }

  return normalizeClaimResult(data as Record<string, unknown>);
}
