"use client";

import { useCallback } from "react";

import { getCurrentCoords } from "@/features/ar/lib/geolocation";
import type { ClaimOutcome } from "@/features/ar/types/ar.types";
import { createHuntClaim } from "@/lib/hunt/claim-service";

/**
 * 상자 터치 → 현재 위치 재조회 → 서버 claim 흐름 (공식 명세 10.2 / 13장).
 *
 * ⚠️ 현재 프로젝트 상태(2026-09-01 확인):
 * 공식 명세의 목표 RPC `claim_treasure_with_lock`는 아직 DB/마이그레이션에 없다.
 * 그래서 기존 `lib/hunt/claim-service.ts`의 `createHuntClaim`(client insert)를 재사용한다.
 * 거리/기간/수량/동시성 서버 검증은 RPC 도입 전까지 blocked이며, 이 훅은 그 계약 지점만 격리한다.
 * RPC가 생기면 createHuntClaim 내부만 교체하면 되고 이 훅의 인터페이스는 유지된다.
 */
export function useTreasureClaim() {
  const claimTreasure = useCallback(async (treasureId: string): Promise<ClaimOutcome> => {
    // 1) 현재 위치 재조회. 실패하면 claim하지 않는다(공식 명세 12.x / 20 STEP13).
    let coords;
    try {
      coords = await getCurrentCoords();
    } catch {
      return {
        kind: "failure",
        reason: "LOCATION_ERROR",
        message: "현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.",
      };
    }

    // 2) 기존 claim 서비스 재사용(현재 GPS 좌표를 함께 기록).
    const result = await createHuntClaim(treasureId, coords);

    // 3) 정상 게임 결과 vs 운영/검증 실패 구분(공식 명세 20 STEP16).
    if (result.ok && result.alreadyClaimed) {
      return {
        kind: "failure",
        reason: "ALREADY_CLAIMED",
        message: "이미 획득한 보물이에요.",
      };
    }

    if (!result.ok) {
      return {
        kind: "failure",
        reason: "SERVER_ERROR",
        message: result.errorMessage ?? "사냥에 실패했어요. 다시 시도해주세요.",
      };
    }

    // 서버 RPC 부재로 빈 상자(lose) 판정이 없어 현재는 항상 보상 획득(win)으로 처리한다.
    // RPC 도입 후 서버 결과에 따라 win/lose를 구분한다(blocked, PR에 명시).
    return { kind: "normal", result: "win", treasureId };
  }, []);

  return { claimTreasure };
}
