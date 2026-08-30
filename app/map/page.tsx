"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TreasureHintPopup } from "@/components/hunt/treasure-hint-popup";
import { calculateDistanceMeters, NEARBY_TREASURE_NOTIFICATION_RADIUS_M, type GeoPoint } from "@/lib/hunt/distance";
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import type { MockTreasure } from "@/lib/hunt/mappers";
import { getClaimedTreasureMarker, getMapTreasures } from "@/lib/hunt/selectors";
import { getMapTreasuresData } from "@/lib/hunt/treasure-service";
import { createTreasureMarker } from "@/lib/naver-map/create-treasure-marker";
import { createUserLocationMarker } from "@/lib/naver-map/create-user-location-marker";
import { loadNaverMapSdk } from "@/lib/naver-map/load-naver-map";

const DEFAULT_MAP_CENTER: GeoPoint = {
  latitude: 37.5665,
  longitude: 126.978,
} as const;

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 5_000,
};

const TOAST_VISIBLE_MS = 4_000;
const INITIAL_MAP_ZOOM = 15;
const MIN_MAP_ZOOM = 13;
const MAX_MAP_ZOOM = 17;
const NAVER_MAP_STYLE_ID = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_ID?.trim();

const MAP_TOAST_COPY = {
  nearbyTreasure: "근처에 열린 보물이 있어요!",
  locationPermissionRequired: "주변 보물을 찾으려면 위치 권한이 필요해요.",
  noNearbyTreasure: "지금 주변에는 열린 보물이 없어요.",
} as const;

const { icons, markers } = HUNT_ASSETS;

type UserLocation = GeoPoint & {
  accuracy: number | null;
};

type LocationStatus = "idle" | "loading" | "available" | "denied" | "unavailable";

type MapToast = {
  kind: "nearby-treasure" | "location-permission" | "empty-nearby";
  message: string;
  treasureId?: string;
};

type TreasureMarkerRef = {
  marker: naver.maps.Marker;
  listener: naver.maps.MapEventListener;
};

function requestBrowserLocation() {
  return new Promise<UserLocation>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is unavailable in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      reject,
      GEOLOCATION_OPTIONS,
    );
  });
}

function isLocationPermissionDenied(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 1;
}

function getLocationErrorStatus(error: unknown): Exclude<LocationStatus, "idle" | "loading" | "available"> {
  return isLocationPermissionDenied(error) ? "denied" : "unavailable";
}

function getNearbyNotificationKey(userId: string | null, treasureId: string) {
  return `catchcash:nearby-treasure-notified:${userId ?? "anonymous"}:${treasureId}`;
}

function hasNotifiedNearbyTreasure(userId: string | null, treasureId: string) {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(getNearbyNotificationKey(userId, treasureId)) === "true";
  } catch {
    return false;
  }
}

function markNearbyTreasureNotified(userId: string | null, treasureId: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getNearbyNotificationKey(userId, treasureId), "true");
  } catch {
    // localStorage가 막힌 환경에서도 지도 자체는 계속 동작해야 한다.
  }
}

export default function MapPage() {
  const shouldRenderPlaceholderMarkers = false;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const userLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const treasureMarkerRefs = useRef<Map<string, TreasureMarkerRef>>(new Map());
  const handledTreasureQueryRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const [selectedTreasureId, setSelectedTreasureId] = useState<string | null>(null);
  const [treasures, setTreasures] = useState<MockTreasure[]>(() => getMapTreasures());
  const [claimedMarker, setClaimedMarker] = useState(() => getClaimedTreasureMarker());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [hasLoadedTreasures, setHasLoadedTreasures] = useState(false);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapErrorMessage, setMapErrorMessage] = useState("");
  const [mapToast, setMapToast] = useState<MapToast | null>(null);

  const showMapToast = useCallback((toast: MapToast) => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setMapToast(toast);
    toastTimeoutRef.current = window.setTimeout(() => {
      setMapToast(null);
      toastTimeoutRef.current = null;
    }, TOAST_VISIBLE_MS);
  }, []);

  const hideMapToast = useCallback(() => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setMapToast(null);
  }, []);

  const centerMapToLocation = useCallback((location: GeoPoint) => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    map.setCenter(new maps.LatLng(location.latitude, location.longitude));
    maps.Event.trigger(map, "resize");
  }, []);

  const handleLocationError = useCallback(
    (error: unknown) => {
      setLocationStatus(getLocationErrorStatus(error));
      showMapToast({
        kind: "location-permission",
        message: MAP_TOAST_COPY.locationPermissionRequired,
      });
    },
    [showMapToast],
  );

  const refreshUserLocation = useCallback(
    async ({ centerMap = false }: { centerMap?: boolean } = {}) => {
      setLocationStatus("loading");

      try {
        const location = await requestBrowserLocation();
        setUserLocation(location);
        setLocationStatus("available");

        if (centerMap) {
          centerMapToLocation(location);
        }

        return location;
      } catch (error) {
        handleLocationError(error);
        return null;
      }
    },
    [centerMapToLocation, handleLocationError],
  );

  const refreshTreasures = useCallback(async () => {
    const result = await getMapTreasuresData();
    setTreasures(result.treasures);
    setClaimedMarker(result.claimedMarker);
    setCurrentUserId(result.userId);
    setHasLoadedTreasures(true);
    setSelectedTreasureId((currentTreasureId) => {
      if (!currentTreasureId) return currentTreasureId;
      return result.treasures.some((treasure) => treasure.id === currentTreasureId && treasure.status === "active")
        ? currentTreasureId
        : null;
    });
    return result.treasures;
  }, []);

  const treasuresWithDistance = useMemo(() => {
    if (!userLocation) return treasures;

    return treasures.map((treasure) => ({
      ...treasure,
      distanceM: calculateDistanceMeters(userLocation, {
        latitude: treasure.latitude,
        longitude: treasure.longitude,
      }),
    }));
  }, [treasures, userLocation]);

  const selectedTreasure = useMemo(
    () => treasuresWithDistance.find((treasure) => treasure.id === selectedTreasureId) ?? null,
    [selectedTreasureId, treasuresWithDistance],
  );

  const clearTreasureMarkers = useCallback(() => {
    treasureMarkerRefs.current.forEach(({ marker, listener }) => {
      window.naver?.maps.Event.removeListener(listener);
      marker.setMap(null);
    });
    treasureMarkerRefs.current.clear();
  }, []);

  const panMapToLocation = useCallback((location: GeoPoint) => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    map.panTo(new maps.LatLng(location.latitude, location.longitude));
  }, []);

  useEffect(() => {
    let active = true;

    refreshTreasures().catch((error) => {
      if (!active) return;
      console.error("Failed to refresh map treasures.", error);
    });

    return () => {
      active = false;
    };
  }, [refreshTreasures]);

  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initializeMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        setMapStatus("loading");
        setMapErrorMessage("");

        let initialLocationError: unknown = null;
        setLocationStatus("loading");

        const [maps, initialLocation] = await Promise.all([
          loadNaverMapSdk(),
          requestBrowserLocation().catch((error) => {
            initialLocationError = error;
            return null;
          }),
        ]);

        if (!active || !mapContainerRef.current) return;

        if (initialLocation) {
          setUserLocation(initialLocation);
          setLocationStatus("available");
        } else {
          setLocationStatus(getLocationErrorStatus(initialLocationError));
        }

        const initialCenter = initialLocation ?? DEFAULT_MAP_CENTER;
        const mapOptions: naver.maps.MapOptions = {
          center: new maps.LatLng(initialCenter.latitude, initialCenter.longitude),
          zoom: INITIAL_MAP_ZOOM,
          minZoom: MIN_MAP_ZOOM,
          maxZoom: MAX_MAP_ZOOM,
        };

        if (NAVER_MAP_STYLE_ID) {
          mapOptions.gl = true;
          mapOptions.customStyleId = NAVER_MAP_STYLE_ID;
        }

        const map = new maps.Map(mapContainerRef.current, mapOptions);
        mapInstanceRef.current = map;

        const triggerMapResize = () => {
          maps.Event.trigger(map, "resize");
        };

        requestAnimationFrame(triggerMapResize);

        if ("ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(([entry]) => {
            if (!entry || entry.contentRect.width === 0 || entry.contentRect.height === 0) return;
            triggerMapResize();
          });
          resizeObserver.observe(mapContainerRef.current);
        }

        setMapStatus("ready");

        if (!initialLocation && initialLocationError) {
          showMapToast({
            kind: "location-permission",
            message: MAP_TOAST_COPY.locationPermissionRequired,
          });
        }
      } catch (error) {
        console.error("Failed to initialize Naver Map.", error);
        if (!active) return;

        setMapStatus("error");
        setMapErrorMessage(error instanceof Error ? error.message : "Naver Maps SDK load failed.");
      }
    }

    initializeMap();

    return () => {
      active = false;
      resizeObserver?.disconnect();
    };
  }, [showMapToast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      userLocationMarkerRef.current?.setMap(null);
      userLocationMarkerRef.current = null;
      clearTreasureMarkers();
    };
  }, [clearTreasureMarkers]);

  useEffect(() => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;

    if (mapStatus !== "ready" || locationStatus !== "available" || !userLocation || !maps || !map) {
      if (userLocationMarkerRef.current && locationStatus !== "available") {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
      }
      return;
    }

    const position = new maps.LatLng(userLocation.latitude, userLocation.longitude);

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setPosition(position);
      return;
    }

    userLocationMarkerRef.current = createUserLocationMarker({
      maps,
      map,
      position: userLocation,
    });
  }, [locationStatus, mapStatus, userLocation]);

  useEffect(() => {
    const maps = window.naver?.maps;
    const map = mapInstanceRef.current;
    if (mapStatus !== "ready" || !maps || !map) return;

    clearTreasureMarkers();

    treasures
      .filter(
        (treasure) =>
          treasure.status === "active" &&
          Number.isFinite(treasure.latitude) &&
          Number.isFinite(treasure.longitude),
      )
      .forEach((treasure) => {
        const markerRef = createTreasureMarker({
          maps,
          map,
          position: {
            latitude: treasure.latitude,
            longitude: treasure.longitude,
          },
          title: treasure.name,
          isSelected: treasure.id === selectedTreasureId,
          onClick: () => {
            setSelectedTreasureId(treasure.id);
            panMapToLocation({
              latitude: treasure.latitude,
              longitude: treasure.longitude,
            });
          },
        });
        treasureMarkerRefs.current.set(treasure.id, markerRef);
      });
  }, [clearTreasureMarkers, mapStatus, panMapToLocation, selectedTreasureId, treasures]);

  useEffect(() => {
    if (mapStatus !== "ready" || !hasLoadedTreasures) return;

    const requestedTreasureId = new URLSearchParams(window.location.search).get("treasureId");
    if (!requestedTreasureId || handledTreasureQueryRef.current === requestedTreasureId) return;

    handledTreasureQueryRef.current = requestedTreasureId;
    const requestedTreasure = treasures.find(
      (treasure) => treasure.id === requestedTreasureId && treasure.status === "active",
    );
    if (!requestedTreasure) return;

    setSelectedTreasureId(requestedTreasure.id);
    panMapToLocation({
      latitude: requestedTreasure.latitude,
      longitude: requestedTreasure.longitude,
    });
  }, [hasLoadedTreasures, mapStatus, panMapToLocation, treasures]);

  useEffect(() => {
    if (mapStatus !== "ready" || locationStatus !== "available" || !userLocation) return;

    const nearestTreasure = treasuresWithDistance
      .filter(
        (treasure) =>
          treasure.status === "active" &&
          Number.isFinite(treasure.latitude) &&
          Number.isFinite(treasure.longitude) &&
          treasure.distanceM <= NEARBY_TREASURE_NOTIFICATION_RADIUS_M &&
          !hasNotifiedNearbyTreasure(currentUserId, treasure.id),
      )
      .sort((a, b) => a.distanceM - b.distanceM)[0];

    if (!nearestTreasure) return;

    markNearbyTreasureNotified(currentUserId, nearestTreasure.id);
    showMapToast({
      kind: "nearby-treasure",
      message: MAP_TOAST_COPY.nearbyTreasure,
      treasureId: nearestTreasure.id,
    });
  }, [currentUserId, locationStatus, mapStatus, showMapToast, treasuresWithDistance, userLocation]);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-[#f7f5ef] pb-[72px]">
      <AppHeader variant="main-actions" />

      <section
        className="relative min-h-0 flex-1 overflow-hidden bg-[#e0e0e0]"
        data-claimed-marker-id={claimedMarker.id}
        data-location-status={locationStatus}
        data-treasure-count={treasuresWithDistance.length}
      >
        <div
          ref={mapContainerRef}
          className={`absolute inset-0 h-full w-full ${NAVER_MAP_STYLE_ID ? "" : "catchcash-naver-map-monotone"}`}
          aria-label="네이버 지도"
        />

        {!NAVER_MAP_STYLE_ID && (
          <style jsx global>{`
            .catchcash-naver-map-monotone img[src*="/onetile/"],
            .catchcash-naver-map-monotone img[src*="/nrb/"],
            .catchcash-naver-map-monotone img[src*="map.pstatic.net"] {
              filter: grayscale(0.95) saturate(0.18) contrast(0.95) brightness(1.04);
            }
          `}</style>
        )}

        {mapStatus !== "ready" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f7f5ef]/85 px-6 text-center">
            <p className="border-2 border-black bg-white px-5 py-3 text-sm font-medium text-[#1a1c1c] shadow-[4px_4px_0px_black]">
              {mapStatus === "error"
                ? `지도를 불러오지 못했어요. ${mapErrorMessage}`
                : "지도 불러오는 중..."}
            </p>
          </div>
        )}

        {mapStatus === "ready" && mapToast && (
          <div
            role="status"
            className="absolute inset-x-5 top-5 z-10 flex items-center justify-center gap-3 border-2 border-black bg-black px-5 py-3.5 shadow-[6px_6px_0px_black]"
          >
            <img src={icons.mapBannerBell} alt="" className="size-5" />
            <p className="min-w-0 flex-1 text-base font-medium tracking-[-0.4px] text-white">{mapToast.message}</p>
            <button
              type="button"
              aria-label="안내 닫기"
              onClick={hideMapToast}
              className="flex size-7 shrink-0 items-center justify-center border border-white text-sm font-black text-white"
            >
              X
            </button>
          </div>
        )}

        {/* 실제 지도 좌표 연동 전까지 placeholder 기반 사용자 위치/보물 마커 렌더링은 비활성화한다. */}
        {shouldRenderPlaceholderMarkers && (
          <>
            {/* 사용자 위치 마커 */}
            <div className="absolute left-1/2 top-[46%] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#ff0004]">
              <div className="size-2 rounded-full bg-white" />
            </div>

            {/* 보물 마커 */}
            {treasuresWithDistance.map((treasure) => (
              <button
                key={treasure.id}
                type="button"
                onClick={() => setSelectedTreasureId(treasure.id)}
                className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${treasure.position.left}%`, top: `${treasure.position.top}%` }}
              >
                <img
                  src={treasure.variant === "yellow" ? markers.yellow : markers.purple}
                  alt={treasure.name}
                  className="h-[54px] w-[47px]"
                />
                <span className="mt-2 border border-black bg-white px-2.5 py-1 text-xs font-medium tracking-[0.6px] text-[#1a1c1c] shadow-[2px_2px_0px_black]">
                  {treasure.name}
                </span>
              </button>
            ))}

            {/* 획득 완료 마커 (비활성) */}
            <img
              src={markers.claimed}
              alt="획득 완료 보물상자"
              className="absolute h-[46px] w-10 -translate-x-1/2 opacity-60"
              style={{
                left: `${claimedMarker.position.left}%`,
                top: `${claimedMarker.position.top}%`,
              }}
            />
          </>
        )}

        {/* 플로팅 사이드 버튼 */}
        <div className="absolute bottom-28 right-5 z-10 flex flex-col gap-4">
          <button
            type="button"
            aria-label="현재 위치로 이동"
            onClick={() => {
              void refreshUserLocation({ centerMap: true });
            }}
            className="flex size-14 items-center justify-center rounded-[2px] border-2 border-black bg-[#f9f9f9] shadow-[4px_4px_0px_black]"
          >
            <img src={icons.mapCrosshair} alt="" className="size-[22px]" />
          </button>
          <button
            type="button"
            aria-label="보물 새로고침"
            onClick={() => {
              void Promise.all([refreshUserLocation(), refreshTreasures()]);
            }}
            className="flex size-14 items-center justify-center rounded-[2px] border-2 border-black bg-[#f9f9f9] shadow-[4px_4px_0px_black]"
          >
            <img src={icons.mapRefresh} alt="" className="size-4" />
          </button>
        </div>
      </section>

      <BottomNav />

      {selectedTreasure && (
        <TreasureHintPopup
          treasure={selectedTreasure}
          hasCurrentLocation={locationStatus === "available" && Boolean(userLocation)}
          onClose={() => setSelectedTreasureId(null)}
        />
      )}
    </div>
  );
}
