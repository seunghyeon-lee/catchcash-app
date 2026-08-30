import type { GeoPoint } from "@/lib/hunt/distance";

const USER_LOCATION_MARKER_SIZE = 28;

export function createUserLocationMarker({
  maps,
  map,
  position,
}: {
  maps: typeof naver.maps;
  map: naver.maps.Map;
  position: GeoPoint;
}) {
  return new maps.Marker({
    position: new maps.LatLng(position.latitude, position.longitude),
    map,
    zIndex: 200,
    icon: {
      content: `
        <div style="
          width: ${USER_LOCATION_MARKER_SIZE}px;
          height: ${USER_LOCATION_MARKER_SIZE}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #000;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 3px 3px 0 #000;
          transform: rotate(-2deg);
        ">
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: #000;
            display: block;
          "></span>
        </div>
      `,
      anchor: new maps.Point(USER_LOCATION_MARKER_SIZE / 2, USER_LOCATION_MARKER_SIZE / 2),
    },
  });
}
