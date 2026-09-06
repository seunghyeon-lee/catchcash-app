import { calculateDistanceMeters, type GeoPoint } from "@/lib/hunt/distance";

export type NearestCandidate = {
  id: string;
  latitude: number;
  longitude: number;
};

/**
 * 현재 위치에서 가장 가까운 보물 1개의 id를 반환한다(지시서 5·6장).
 * 거리 계산은 기존 `lib/hunt/distance.ts`의 Haversine 헬퍼를 재사용한다(중복 구현 금지).
 * 이 계산은 nearest 선택에만 쓰이며 획득 성공/실패를 확정하지 않는다(최종 판정은 서버 RPC).
 * 좌표가 유효하지 않은 후보는 건너뛴다.
 */
export function findNearestTreasureId(from: GeoPoint, candidates: NearestCandidate[]): string | null {
  let nearestId: string | null = null;
  let minDistance = Infinity;

  for (const candidate of candidates) {
    if (!Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude)) continue;
    const distance = calculateDistanceMeters(from, {
      latitude: candidate.latitude,
      longitude: candidate.longitude,
    });
    if (distance < minDistance) {
      minDistance = distance;
      nearestId = candidate.id;
    }
  }

  return nearestId;
}
