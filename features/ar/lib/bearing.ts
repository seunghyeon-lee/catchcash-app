import type { GeoPoint } from "@/lib/hunt/distance";

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export function calculateBearingDegrees(from: GeoPoint, to: GeoPoint) {
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function normalizeAngleDifference(targetBearing: number, deviceHeading: number) {
  return ((targetBearing - deviceHeading + 540) % 360) - 180;
}
