import type { GeoPoint } from "@/lib/hunt/distance";

const TREASURE_MARKER_CLICK_SIZE = 40;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTreasureMarkerContent({ title, isSelected }: { title: string; isSelected: boolean }) {
  const borderWidth = isSelected ? 3 : 2;
  const scale = isSelected ? 1.12 : 1;
  const escapedTitle = escapeHtml(title);

  return `
    <div
      aria-label="${escapedTitle}"
      title="${escapedTitle}"
      style="
        width: ${TREASURE_MARKER_CLICK_SIZE}px;
        height: ${TREASURE_MARKER_CLICK_SIZE}px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(${scale}) rotate(-3deg);
        transform-origin: center bottom;
      "
    >
      <div style="
        position: relative;
        width: 28px;
        height: 26px;
        border: ${borderWidth}px solid #000;
        background: #fff;
        box-shadow: 3px 3px 0 #000;
      ">
        <div style="
          position: absolute;
          left: 4px;
          right: 4px;
          top: -8px;
          height: 10px;
          border: ${borderWidth}px solid #000;
          background: #fff;
        "></div>
        <div style="
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: ${borderWidth}px;
          background: #000;
          transform: translateX(-50%);
        "></div>
        <div style="
          position: absolute;
          left: 0;
          right: 0;
          top: 9px;
          height: ${borderWidth}px;
          background: #000;
        "></div>
      </div>
    </div>
  `;
}

export function createTreasureMarker({
  maps,
  map,
  position,
  title,
  isSelected,
  onClick,
}: {
  maps: typeof naver.maps;
  map: naver.maps.Map;
  position: GeoPoint;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const marker = new maps.Marker({
    position: new maps.LatLng(position.latitude, position.longitude),
    map,
    title,
    clickable: true,
    zIndex: isSelected ? 150 : 100,
    icon: {
      content: getTreasureMarkerContent({ title, isSelected }),
      anchor: new maps.Point(TREASURE_MARKER_CLICK_SIZE / 2, TREASURE_MARKER_CLICK_SIZE),
    },
  });
  const listener = maps.Event.addListener(marker, "click", onClick);

  return { marker, listener };
}
