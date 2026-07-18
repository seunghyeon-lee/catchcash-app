"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { HUNT_ASSETS } from "@/lib/hunt/assets";
import type { MockTreasure } from "@/lib/hunt/mock-data";

const { icons, frames } = HUNT_ASSETS;

export function TreasureHintPopup({ treasure, onClose }: { treasure: MockTreasure; onClose: () => void }) {
  const router = useRouter();
  // Mock: 진행률은 목표 반경 대비 남은 거리 기준으로 시각화만 한다 (실제 GPS 연동은 다음 단계)
  const progressPercent = Math.max(4, Math.min(100, 100 - (treasure.distanceM / 1000) * 100 * 1.3));
  const isNear = treasure.distanceM <= treasure.unlockRadiusM;

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] items-center justify-center">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative mx-5 w-full max-w-[360px]">
        <img src={frames.hintPopupSheet} alt="" className="absolute inset-0 size-full" />
        <div className="relative px-7 pb-9 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-medium text-black">수상한 보물상자</h2>
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
              <p className="text-center text-base font-bold text-black">
                아직 멀다. {treasure.distanceM}m 남았다.
              </p>
              <div className="mt-4 h-8 overflow-hidden rounded-[8px] border-2 border-black bg-[#f3f3f3]">
                <div
                  className="h-full border-r-2 border-black bg-black"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between px-1 text-xs font-bold tracking-[0.6px] text-black">
                <span>0M</span>
                <span>TARGET ({treasure.unlockRadiusM}m)</span>
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
            {treasure.unlockRadiusM}m 안으로 와야 열린다.
          </p>

          {/* CTA - Mock 단계에서는 눌러서 AR 화면으로 이동 */}
          <button
            type="button"
            onClick={() => router.push("/ar-hunt")}
            className="relative mt-6 block h-[72px] w-full"
          >
            <img src={frames.hintCtaChip} alt="" className="absolute inset-0 size-full" />
            <span className="relative text-2xl font-medium text-white">
              {isNear ? "상자 열기" : "좀 더 가까이 와라"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
