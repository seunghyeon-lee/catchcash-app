export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export const DISTANCE_GUIDE_END_RADIUS_M = 100;
export const NEARBY_TREASURE_NOTIFICATION_RADIUS_M = DISTANCE_GUIDE_END_RADIUS_M;

const EARTH_RADIUS_M = 6_371_000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceMeters(from: GeoPoint, to: GeoPoint) {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
