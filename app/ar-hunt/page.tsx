"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BottomNav } from "@/components/hunt/bottom-nav";
import { HUNT_ASSETS } from "@/lib/hunt/assets";

const { icons, frames, images } = HUNT_ASSETS;

export default function ArHuntPage() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const handleChestTap = () => {
    if (opening) return;
    setOpening(true);
    // Mock: 상자 열기 연출 후 결과 화면으로 이동 (실제 RPC 판정은 다음 단계)
    setTimeout(() => router.push("/hunt-result?result=success"), 450);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#171717] pb-20">
      {/* 카메라 프리뷰 placeholder (실제 getUserMedia 연동은 다음 단계) */}
      <img
        src={images.arMockBg}
        alt="카메라 미리보기 자리"
        className="absolute inset-0 size-full object-cover opacity-40 grayscale"
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* 닫기 */}
      <button
        type="button"
        aria-label="사냥 종료"
        onClick={() => router.push("/map")}
        className="absolute right-4 top-4 z-20 flex h-8 w-[33px] items-center justify-center rounded-full border-2 border-black bg-white"
      >
        <img src={icons.closeCircle} alt="" className="size-3" />
      </button>

      <div className="relative z-10 flex flex-1 flex-col items-center px-5">
        {/* 안내 말풍선 */}
        <div className="relative mt-14 w-full max-w-[356px]">
          <img src={frames.arInstructionBubble} alt="" className="absolute inset-0 size-full" />
          <p className="relative py-8 text-center text-2xl font-medium uppercase tracking-[1.4px] text-black">
            상자를 터치해 열어보거라
          </p>
        </div>

        {/* 3D 보물상자 placeholder */}
        <button
          type="button"
          onClick={handleChestTap}
          aria-label="보물상자 열기"
          className={`relative mt-40 transition-transform duration-300 ${opening ? "scale-110 rotate-2" : ""}`}
        >
          <div className="relative h-36 w-48">
            <div className="absolute -bottom-8 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-black/40 blur-[12px]" />
            {/* 뚜껑 */}
            <div className="absolute -top-12 left-0 right-0 h-16 rounded-[4px] border-2 border-black bg-[#f9f9f9] shadow-[4px_4px_0px_black]">
              <div className="absolute bottom-2 left-1/2 h-6 w-10 -translate-x-1/2 rounded-t-full border-2 border-black bg-[#f9f9f9]" />
            </div>
            {/* 몸통 */}
            <div className="absolute inset-0 flex flex-col justify-end rounded-[4px] border-2 border-black bg-[#f9f9f9] p-[18px] shadow-[4px_4px_0px_black]">
              <div className="my-2 h-2 w-full bg-black/10" />
              <div className="my-1 h-1 w-full bg-black/10" />
            </div>
            {/* 탭 인디케이터 */}
            <div className="absolute left-1/2 top-9 flex -translate-x-1/2 flex-col items-center">
              <img src={icons.arTapTarget} alt="" className="size-8 animate-pulse" />
              <span className="mt-2 whitespace-nowrap text-base font-medium uppercase text-[#ff0000]">
                GRUG TAP HERE
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 트래킹 상태 */}
      <div className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[4px] border-2 border-black bg-[#f9f9f9] px-6 py-2.5 shadow-[4px_4px_0px_black]">
        <span className="size-3 rounded-full bg-[#ef4444]" />
        <span className="text-base font-medium uppercase tracking-[-0.8px] text-[#1a1c1c]">
          LIVE AR TRACKING ACTIVE
        </span>
      </div>

      <BottomNav active="hunt" />
    </div>
  );
}
