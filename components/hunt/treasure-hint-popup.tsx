"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { HUNT_ASSETS } from "@/lib/hunt/assets";
import { DISTANCE_GUIDE_END_RADIUS_M } from "@/lib/hunt/distance";
import type { MockTreasure } from "@/lib/hunt/mock-data";

const { icons, frames } = HUNT_ASSETS;

function formatDistance(distanceM: number) {
  if (distanceM >= 1000) return `${(distanceM / 1000).toFixed(1)}km`;
  return `${Math.round(distanceM)}m`;
}

export function TreasureHintPopup({
  treasure,
  hasCurrentLocation = true,
  onClose,
}: {
  treasure: MockTreasure;
  hasCurrentLocation?: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const isNearEnoughForHint = hasCurrentLocation && treasure.distanceM <= DISTANCE_GUIDE_END_RADIUS_M;
  const progressPercent = hasCurrentLocation
    ? Math.max(
        4,
        Math.min(100, (DISTANCE_GUIDE_END_RADIUS_M / Math.max(treasure.distanceM, DISTANCE_GUIDE_END_RADIUS_M)) * 100),
      )
    : 4;
  const distanceMessage = !hasCurrentLocation
    ? "현재 위치를 확인할 수 없어요."
    : isNearEnoughForHint
      ? "보물 근처에 도착했어요."
      : `현재 보물과 ${formatDistance(treasure.distanceM)} 떨어져 있어요.`;
  const statusMessage = !hasCurrentLocation
    ? "현재 위치를 확인하고 다시 살펴봐."
    : isNearEnoughForHint
      ? "이제 힌트를 보고 찾아보세요."
      : "근처까지 가면 힌트가 더 쓸모 있어진다.";

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] items-center justify-center">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative mx-5 w-full max-w-[360px]">
        <img src={frames.hintPopupSheet} alt="" className="absolute inset-0 size-full" />
        <div className="relative px-7 pb-9 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-medium text-black">{treasure.name}</h2>
              <p className="mt-2 text-sm font-medium tracking-[0.7px] text-[#4c4546]">{treasure.locationHint}</p>
            </div>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex h-8 w-[33px] shrink-0 items-center justify-center rounded-full border-2 border-black bg-white"
            >
              <img src={icons.closeCircle} alt="" className="size-3" />
            </button>
          </div>

          {/* 거리 정보 카드 */}
          <div className="relative mt-8">
            <img src={frames.distanceInfo} alt="" className="absolute inset-0 size-full" />
            <div className="relative px-6 py-7">
              <p className="text-center text-base font-bold text-black">{distanceMessage}</p>
              <div className="mt-4 h-8 overflow-hidden rounded-[8px] border-2 border-black bg-[#f3f3f3]">
                <div
                  className="h-full border-r-2 border-black bg-black"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between px-1 text-xs font-bold tracking-[0.6px] text-black">
                <span>0M</span>
                <span>TARGET ({DISTANCE_GUIDE_END_RADIUS_M}m)</span>
              </div>
            </div>
          </div>

          {/* 힌트 카드 */}
          <div className="relative mt-5">
            <img src={frames.guideStepCardEven} alt="" className="absolute inset-0 size-full" />
            <div className="relative px-7 py-6">
              <p className="text-sm font-bold uppercase tracking-[0.7px] text-black">HINT</p>
              <p className="mt-1 text-base font-medium text-black">
                #{treasure.hint.order}&nbsp;&nbsp;{treasure.hint.text}
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs font-medium tracking-[0.6px] text-[#4c4546]">
            {statusMessage}
          </p>

          {/* 최신 정책: 거리 제한은 AR 화면에서 다시 확인하고, 지도 팝업에서는 항상 진입을 허용한다. */}
          <button
            type="button"
            onClick={() => router.push(`/ar-hunt?treasureId=${treasure.id}`)}
            className="relative mt-6 block h-[72px] w-full"
          >
            <img src={frames.hintCtaChip} alt="" className="absolute inset-0 size-full" />
            <span className="relative text-2xl font-medium text-white">사냥하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
