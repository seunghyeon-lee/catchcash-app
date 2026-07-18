"use client";

/* eslint-disable @next/next/no-img-element */
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import type { MockReward } from "@/lib/hunt/mock-data";

const { icons, frames } = HUNT_ASSETS;

export function RewardDetailPopup({ reward, onClose }: { reward: MockReward; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] items-center justify-center">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative mx-4 w-full max-w-[348px]">
        <img src={frames.hintPopup} alt="" className="absolute inset-0 size-full" />
        <div className="relative px-7 pb-8 pt-7">
          <div className="flex items-start justify-between">
            <h2 className="flex-1 pt-1 text-center text-2xl font-medium text-black">
              {reward.brand} {reward.name.replace(" Tall", "")}
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex h-8 w-[33px] shrink-0 items-center justify-center rounded-full border-2 border-black bg-white"
            >
              <img src={icons.closeCircle} alt="" className="size-3" />
            </button>
          </div>

          {/* 바코드 카드 */}
          <div className="relative mt-6">
            <img src={frames.rewardDetailCard} alt="" className="absolute inset-0 size-full" />
            <div className="relative flex flex-col items-center px-8 py-10">
              <div className="flex h-[68px] w-full max-w-[204px] items-center justify-center bg-[#d9d9d9]">
                <span className="text-base uppercase text-black">바코드 영역</span>
              </div>
              {/* Mock: 발급 API 연동은 다음 단계 */}
              <button
                type="button"
                className="mt-8 w-[104px] border-[3px] border-[#1b1b1b] bg-white px-3 py-2 text-xs font-medium tracking-[0.6px] text-[#1b1b1b] shadow-[2px_2px_0px_#1b1b1b]"
              >
                발급받기
              </button>
            </div>
          </div>

          {/* 보상 정보 */}
          <div className="mt-6 flex flex-col gap-1 rounded-lg border-2 border-dashed border-[#cfc4c5] p-[18px]">
            <div className="flex items-center justify-between text-xs tracking-[0.6px]">
              <span className="text-[#4c4546]">보상 id</span>
              <span className="font-bold text-[#1b1b1b]">{reward.rewardCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs tracking-[0.6px]">
              <span className="text-[#4c4546]">유효기간</span>
              <span className="text-[#ba1a1a]">5일 남음</span>
            </div>
          </div>

          {/* 닫기 */}
          <button type="button" onClick={onClose} className="relative mt-6 flex h-[62px] w-full items-center justify-center">
            <img src={frames.rewardDetailCloseButton} alt="" className="absolute inset-0 size-full" />
            <span className="relative text-base font-medium uppercase text-black">닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
