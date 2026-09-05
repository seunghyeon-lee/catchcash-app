// AR 사냥 화면(WebAR Lite) 공용 타입.
// 기준: docs/frontend/user-app/07_AR_Hunt_Screen.md (12장 상태 정의 / 13장 Claim 정책)

import type { ClaimStatus } from "@/lib/hunt/claim-service";

/** AR 사냥 화면 상태 머신. 공식 명세 12장과 1:1 대응한다. */
export type ARHuntStatus =
  | "initial"
  | "checking_permission"
  | "camera_loading"
  | "asset_loading"
  | "ready"
  | "touching"
  | "claiming"
  | "opening"
  | "claimed"
  | "failed"
  | "camera_error"
  | "permission_denied"
  | "unsupported";

/** 카메라 스트림 훅의 내부 상태. */
export type CameraState = "idle" | "loading" | "ready" | "denied" | "unsupported" | "error";

/** 3D 상자 variant. 팀원2 TreasureChest3D 계약(04 문서)과 동일. */
export type ChestVariant = "basic" | "gold" | "mystery";

/** 3D 상자에 전달하는 정상 게임 결과. win=보상 획득, lose=빈 상자. */
export type ChestResult = "win" | "lose";

export type GeoCoords = {
  latitude: number;
  longitude: number;
};

/**
 * 운영/검증 실패 사유(= RPC status에서 정상 결과 SUCCESS/EMPTY를 뺀 나머지).
 * 이 값들은 "꽝"이 아니라 오류로 취급하며 AR 화면 내 오류 오버레이로 안내한다(결과 화면으로 보내지 않음).
 * claim-service의 ClaimStatus에서 파생해 서버 계약과 항상 일치시킨다.
 */
export type ClaimFailureReason = Exclude<ClaimStatus, "SUCCESS" | "EMPTY">;

/**
 * Claim 처리 결과.
 * - normal: 정상 게임 결과(보상/빈 상자) → 상자 Open 연출 후 /hunt-result 이동
 * - failure: 운영/검증 실패 → 상자를 열지 않고 오류 안내
 */
export type ClaimOutcome =
  | { kind: "normal"; result: ChestResult; treasureId: string }
  | { kind: "failure"; reason: ClaimFailureReason; message: string };
