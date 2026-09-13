import { normalizeAngleDifference } from "@/features/ar/lib/bearing";

export const AR_DISCOVERY_RADIUS_METERS = 100;
export const AR_HORIZONTAL_FOV_HALF_DEGREES = 30;

type ARVisibilityCandidate = {
  distanceMeters: number;
  bearing: number;
};

export type ARVisibleCandidate<T extends ARVisibilityCandidate> = T & {
  headingDifference: number;
  xOffset: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateARHeadingDifference(candidate: ARVisibilityCandidate, deviceHeading: number) {
  return normalizeAngleDifference(candidate.bearing, deviceHeading);
}

export function calculateARXOffset(headingDifference: number) {
  return clamp(headingDifference / AR_HORIZONTAL_FOV_HALF_DEGREES, -1, 1);
}

export function resolveVisibleARTreasureCandidate<T extends ARVisibilityCandidate>(
  candidates: T[],
  deviceHeading: number | null,
): ARVisibleCandidate<T> | null {
  if (deviceHeading === null) return null;

  const visibleCandidates = candidates
    .filter((candidate) => candidate.distanceMeters <= AR_DISCOVERY_RADIUS_METERS)
    .map((candidate) => {
      const headingDifference = calculateARHeadingDifference(candidate, deviceHeading);
      return {
        ...candidate,
        headingDifference,
        xOffset: calculateARXOffset(headingDifference),
      };
    })
    .filter((candidate) => Math.abs(candidate.headingDifference) <= AR_HORIZONTAL_FOV_HALF_DEGREES)
    .sort((a, b) => {
      const headingDelta = Math.abs(a.headingDifference) - Math.abs(b.headingDifference);
      if (headingDelta !== 0) return headingDelta;
      return a.distanceMeters - b.distanceMeters;
    });

  return visibleCandidates[0] ?? null;
}
