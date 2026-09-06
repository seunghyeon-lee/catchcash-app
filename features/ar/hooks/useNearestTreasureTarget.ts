"use client";

import { useCallback, useEffect, useState } from "react";

import { getCurrentCoords } from "@/features/ar/lib/geolocation";
import { findNearestTreasureId } from "@/features/ar/lib/find-nearest-treasure";
import { getMapTreasuresData } from "@/lib/hunt/treasure-service";

export type TargetResolveError = "no_treasure" | "server_error" | "location_error";

export type NearestTreasureTarget = {
  /** 최종 target. query 진입이면 queryTreasureId, BNB 직접 진입이면 nearest.id. 미정이면 null. */
  resolvedTreasureId: string | null;
  /** nearest 탐색 진행 중 여부. query 진입이면 항상 false. */
  resolving: boolean;
  /** 탐색 실패 사유(없으면 null). */
  resolveError: TargetResolveError | null;
  /** server_error / location_error 재시도. */
  retryResolve: () => void;
};

/**
 * AR target(claim 대상 보물) 결정 (지시서 3·4·5장).
 *
 * - CASE A: queryTreasureId 있음 → 그대로 사용, 자동 탐색하지 않음(기존 지도 진입 회귀 방지).
 * - CASE B: queryTreasureId 없음(BNB 직접 진입) → 현재 위치 조회 + active treasure 목록 조회
 *   → 가장 가까운 1개 선택. 진입 자체를 거리로 막지 않는다(최종 거리 검증은 서버 RPC).
 * - CASE C: active treasure 0개 → resolvedTreasureId=null + no_treasure(지도 redirect 금지).
 *
 * 기존 `getMapTreasuresData`(읽기)와 `calculateDistanceMeters`를 재사용한다. 세션 없는 개발
 * 환경의 mock fallback은 그대로 존중하고, 실세션 DB 오류(errorMessage)만 server_error로 노출한다.
 * 중복 반영 방지: 각 실행은 `active` 플래그로 관리해 오래된 요청의 setState를 무시한다
 * (StrictMode 이중 마운트/effect 재실행에도 최신 결과 1개만 반영, 지시서 18장).
 */
export function useNearestTreasureTarget(queryTreasureId: string | null): NearestTreasureTarget {
  const [resolvedTreasureId, setResolvedTreasureId] = useState<string | null>(queryTreasureId);
  const [resolving, setResolving] = useState<boolean>(!queryTreasureId);
  const [resolveError, setResolveError] = useState<TargetResolveError | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retryResolve = useCallback(() => {
    setResolveError(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    // CASE A: query 있으면 그대로 사용하고 자동 탐색하지 않는다(query를 덮어쓰지 않음).
    if (queryTreasureId) {
      setResolvedTreasureId(queryTreasureId);
      setResolving(false);
      setResolveError(null);
      return;
    }

    // CASE B: BNB 직접 진입 → nearest 탐색.
    let active = true;
    setResolving(true);
    setResolveError(null);

    void (async () => {
      // 1차 GPS(가장 가까운 treasure 선택용). 2차 GPS는 상자 탭 시 claim에서 별도 조회.
      let coords;
      try {
        coords = await getCurrentCoords();
      } catch {
        if (active) {
          setResolveError("location_error");
          setResolving(false);
        }
        return;
      }

      // active treasure 목록(기존 서비스 재사용, 읽기 전용).
      const result = await getMapTreasuresData();
      if (!active) return;

      // 실세션 DB 오류만 server_error로 노출(mock success로 숨기지 않음, 지시서 17장).
      if (result.errorMessage) {
        setResolveError("server_error");
        setResolving(false);
        return;
      }

      const candidates = result.treasures.filter(
        (treasure) => Number.isFinite(treasure.latitude) && Number.isFinite(treasure.longitude),
      );

      // CASE C: 주변 active treasure 없음 → redirect 금지, overlay 안내.
      if (candidates.length === 0) {
        setResolveError("no_treasure");
        setResolving(false);
        return;
      }

      setResolvedTreasureId(findNearestTreasureId(coords, candidates));
      setResolving(false);
    })();

    return () => {
      active = false;
    };
  }, [queryTreasureId, attempt]);

  return { resolvedTreasureId, resolving, resolveError, retryResolve };
}
