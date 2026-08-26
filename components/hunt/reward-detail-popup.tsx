"use client";

/* eslint-disable @next/next/no-img-element */
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import type { MockRewardDetail } from "@/lib/hunt/mock-data";

const { icons, frames } = HUNT_ASSETS;

export function RewardDetailPopup({
  reward,
  onClose,
  onMarkUsed,
}: {
  reward: MockRewardDetail;
  onClose: () => void;
  onMarkUsed?: (rewardId: string) => void;
}) {
  const handleMarkUsed = () => {
    // MD: 즉시 변경하지 않고 확인 절차 필수
    const confirmed = window.confirm("이 쿠폰을 사용 완료로 표시할까요?");
    if (!confirmed) return;
    onMarkUsed?.(reward.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] items-center justify-center">
      <button type="button" aria-label="팝업 닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative mx-4 w-full max-w-[348px]">
        <img src={frames.rewardDetailModal} alt="" className="absolute inset-0 size-full" />
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

          {/* 바코드 + 쿠폰 번호 (4차: Giftishow 발급 연결 전까지 실제값 미노출, 준비중 처리) */}
          <div className="relative mt-6">
            <img src={frames.rewardDetailBarcode} alt="" className="absolute inset-0 size-full" />
            <div className="relative flex flex-col items-center px-8 py-10">
              <div className="flex h-[68px] w-full max-w-[204px] items-center justify-center bg-[#d9d9d9]">
                <div className="text-center text-black">
                  <p className="text-base uppercase">바코드 영역</p>
                  <p className="mt-1 text-[10px] tracking-[0.8px]">발급 준비중</p>
                </div>
              </div>
              <div className="mt-6 flex w-full max-w-[240px] items-center justify-between gap-3">
                <p className="text-sm font-medium tracking-[0.6px] text-[#5d5f5f]">쿠폰 발급 준비중</p>
                <button
                  type="button"
                  disabled
                  className="shrink-0 cursor-not-allowed border-[3px] border-[#1b1b1b]/40 bg-white px-3 py-2 text-xs font-medium tracking-[0.6px] text-[#1b1b1b]/40"
                >
                  복사
                </button>
              </div>
            </div>
          </div>

          {/* 하단 정보 박스 */}
          <div className="mt-6 flex flex-col gap-1 rounded-lg border-2 border-dashed border-[#cfc4c5] p-[18px]">
            <div className="flex items-center justify-between text-xs tracking-[0.6px]">
              <span className="text-[#4c4546]">보상 id</span>
              <span className="font-bold text-[#1b1b1b]">{reward.rewardCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs tracking-[0.6px]">
              <span className="text-[#4c4546]">유효기간</span>
              <span className="text-[#ba1a1a]">{reward.remainingDaysLabel ?? "5일 남음"}</span>
            </div>
          </div>

          {/* 1차 CTA: 사용 완료로 표시 */}
          <button
            type="button"
            onClick={handleMarkUsed}
            className="relative mt-6 flex h-[62px] w-full items-center justify-center"
          >
            <img src={frames.resultButtonPrimaryBlack} alt="" className="absolute inset-0 size-full" />
            <span className="relative text-base font-medium text-white">사용 완료로 표시</span>
          </button>

          {/* 2차 CTA: 닫기 */}
          <button type="button" onClick={onClose} className="relative mt-4 flex h-[62px] w-full items-center justify-center">
            <img src={frames.rewardDetailButtonSecondaryWhite} alt="" className="absolute inset-0 size-full" />
            <span className="relative text-base font-medium text-black">닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
