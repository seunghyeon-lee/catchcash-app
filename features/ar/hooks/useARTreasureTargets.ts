"use client";

import { useEffect, useState } from "react";

import {
  AR_DISCOVERY_RADIUS_METERS,
  resolveVisibleARTreasureCandidate,
  type ARVisibleCandidate,
} from "@/features/ar/lib/ar-visibility";
import { calculateBearingDegrees } from "@/features/ar/lib/bearing";
import { getCurrentCoords } from "@/features/ar/lib/geolocation";
import type { GeoCoords } from "@/features/ar/types/ar.types";
import { calculateDistanceMeters } from "@/lib/hunt/distance";
import { getMapTreasuresData } from "@/lib/hunt/treasure-service";

export type ARTreasureTargetError = "location_error" | "server_error" | "target_not_found";

export type ARTreasureCandidate = {
  id: string;
  latitude: number;
  longitude: number;
  radiusM: number | null;
  distanceMeters: number;
  bearing: number;
};

export type ARTreasureTargetsResult = {
  candidates: ARTreasureCandidate[];
  visibleCandidate: ARVisibleCandidate<ARTreasureCandidate> | null;
  headingDifference: number | null;
  xOffset: number | null;
  userCoords: GeoCoords | null;
  loading: boolean;
  error: ARTreasureTargetError | null;
};

export function useARTreasureTargets(
  queryTreasureId: string | null,
  deviceHeading: number | null,
): ARTreasureTargetsResult {
  const [candidates, setCandidates] = useState<ARTreasureCandidate[]>([]);
  const [userCoords, setUserCoords] = useState<GeoCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ARTreasureTargetError | null>(null);

  const visibleCandidate = resolveVisibleARTreasureCandidate(candidates, deviceHeading);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    void (async () => {
      let coords: GeoCoords;
      try {
        coords = await getCurrentCoords();
      } catch {
        if (!active) return;
        setUserCoords(null);
        setCandidates([]);
        setError("location_error");
        setLoading(false);
        return;
      }

      const result = await getMapTreasuresData();
      if (!active) return;

      if (result.errorMessage) {
        setUserCoords(coords);
        setCandidates([]);
        setError("server_error");
        setLoading(false);
        return;
      }

      const targetTreasures = queryTreasureId
        ? result.treasures.filter((treasure) => treasure.id === queryTreasureId)
        : result.treasures;

      if (queryTreasureId && targetTreasures.length === 0) {
        setUserCoords(coords);
        setCandidates([]);
        setError("target_not_found");
        setLoading(false);
        return;
      }

      const nextCandidates = targetTreasures
        .filter((treasure) => Number.isFinite(treasure.latitude) && Number.isFinite(treasure.longitude))
        .map((treasure) => {
          const targetCoords = {
            latitude: treasure.latitude,
            longitude: treasure.longitude,
          };
          return {
            id: treasure.id,
            latitude: treasure.latitude,
            longitude: treasure.longitude,
            radiusM: Number.isFinite(treasure.unlockRadiusM) ? treasure.unlockRadiusM : null,
            distanceMeters: calculateDistanceMeters(coords, targetCoords),
            bearing: calculateBearingDegrees(coords, targetCoords),
          };
        })
        .filter((candidate) => candidate.distanceMeters <= AR_DISCOVERY_RADIUS_METERS);

      setUserCoords(coords);
      setCandidates(nextCandidates);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [queryTreasureId]);

  return {
    candidates,
    visibleCandidate,
    headingDifference: visibleCandidate?.headingDifference ?? null,
    xOffset: visibleCandidate?.xOffset ?? null,
    userCoords,
    loading,
    error,
  };
}
