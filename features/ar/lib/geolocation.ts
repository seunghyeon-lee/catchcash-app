import type { GeoCoords } from "@/features/ar/types/ar.types";

/**
 * 상자 터치 시 현재 위치를 다시 조회한다(공식 명세 5.3 위치 정책).
 * 지도에서 받은 위치를 최종 판정에 재사용하지 않고 여기서 새로 얻는다.
 *
 * Capacitor Geolocation은 네이티브/웹(navigator.geolocation) 모두 지원한다.
 * SSR/빌드 안전을 위해 호출 시점에 동적 import한다.
 * 실패(거부/타임아웃/미지원)는 throw하며 호출부가 LOCATION_ERROR로 처리한다.
 */
export async function getCurrentCoords(): Promise<GeoCoords> {
  const { Geolocation } = await import("@capacitor/geolocation");
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
