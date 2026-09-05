"use client";

import { useCallback } from "react";

import { getCurrentCoords } from "@/features/ar/lib/geolocation";
import type { ClaimFailureReason, ClaimOutcome } from "@/features/ar/types/ar.types";
import { claimTreasureWithLock } from "@/lib/hunt/claim-service";

/** 운영/검증 실패 사유별 기본 안내 문구. */
const FAILURE_MESSAGE: Record<ClaimFailureReason, string> = {
  LOCATION_ERROR: "현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.",
  TOO_FAR: "보물에서 너무 멀어졌어요.",
  EXPIRED_TREASURE: "사냥 기간이 끝난 보물이에요.",
  ALREADY_CLAIMED: "이미 획득한 보물이에요.",
  INVALID_TREASURE: "보물 정보를 찾을 수 없어요.",
  UNAUTHENTICATED: "로그인이 필요해요.",
  SUSPENDED_USER: "현재 계정으로는 사냥할 수 없어요.",
  SERVER_ERROR: "사냥에 실패했어요. 다시 시도해주세요.",
};

/**
 * 상자 터치 → 현재 위치 재조회 → 서버 claim RPC 흐름 (공식 명세 10.2 / 13장).
 *
 * `claim_treasure_with_lock` RPC가 서버에서 인증/거리/기간/수량/중복/동시성을 원자적으로 검증한다.
 * 이 훅은 GPS 재조회와 RPC status → ClaimOutcome 매핑만 담당하고, UI는 raw response에 의존하지 않는다.
 * - SUCCESS → 정상 결과 win / EMPTY → 정상 결과 lose (상자 Open 후 /hunt-result)
 * - 그 외 status → 운영/검증 실패(상자 열지 않고 AR 오류 오버레이)
 */
export function useTreasureClaim() {
  const claimTreasure = useCallback(async (treasureId: string): Promise<ClaimOutcome> => {
    // 1) 현재 위치 재조회. 실패하면 claim하지 않는다(공식 명세 5.3 / STEP13).
    let coords;
    try {
      coords = await getCurrentCoords();
    } catch {
      return { kind: "failure", reason: "LOCATION_ERROR", message: FAILURE_MESSAGE.LOCATION_ERROR };
    }

    // 2) 서버 RPC 호출. user_id는 서버 auth.uid() 기준(클라이언트가 넘기지 않음).
    const result = await claimTreasureWithLock(treasureId, coords);

    // 3) 정상 게임 결과(SUCCESS=win / EMPTY=lose) vs 운영/검증 실패 구분.
    switch (result.status) {
      case "SUCCESS":
        return { kind: "normal", result: "win", treasureId };
      case "EMPTY":
        return { kind: "normal", result: "lose", treasureId };
      default:
        return {
          kind: "failure",
          reason: result.status,
          message: FAILURE_MESSAGE[result.status],
        };
    }
  }, []);

  return { claimTreasure };
}
