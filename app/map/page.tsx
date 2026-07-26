"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import { BottomNav } from "@/components/hunt/bottom-nav";
import { TopAppBar } from "@/components/hunt/top-app-bar";
import { TreasureHintPopup } from "@/components/hunt/treasure-hint-popup";
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import { MOCK_CLAIMED_TREASURE, MOCK_TREASURES, type MockTreasure } from "@/lib/hunt/mock-data";

const { icons, markers, images } = HUNT_ASSETS;

export default function MapPage() {
  const [selected, setSelected] = useState<MockTreasure | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5ef]">
      <TopAppBar />

      {/* Map Canvas - 실제 Naver Map 대신 placeholder (다음 단계에서 교체) */}
      <section className="relative flex-1 overflow-hidden bg-[#e0e0e0] pb-20">
        <img
          src={images.mapMockBg}
          alt="임시 지도 배경"
          className="absolute inset-0 size-full object-cover opacity-40 mix-blend-multiply grayscale"
        />

        {/* 상태 배너 */}
        <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-center gap-3 border-2 border-black bg-black px-6 py-3.5 shadow-[6px_6px_0px_black]">
          <img src={icons.mapBannerBell} alt="" className="size-5" />
          <p className="text-base font-medium tracking-[-0.4px] text-white">근처에 열린 보물이 있어요!</p>
        </div>

        {/* 사용자 위치 마커 */}
        <div className="absolute left-1/2 top-[46%] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#ff0004]">
          <div className="size-2 rounded-full bg-white" />
        </div>

        {/* 보물 마커 */}
        {MOCK_TREASURES.map((treasure) => (
          <button
            key={treasure.id}
            type="button"
            onClick={() => setSelected(treasure)}
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
            left: `${MOCK_CLAIMED_TREASURE.position.left}%`,
            top: `${MOCK_CLAIMED_TREASURE.position.top}%`,
          }}
        />

        {/* 플로팅 사이드 버튼 */}
        <div className="absolute bottom-28 right-5 z-10 flex flex-col gap-4">
          <button
            type="button"
            aria-label="현재 위치로 이동"
            className="flex size-14 items-center justify-center rounded-[2px] border-2 border-black bg-[#f9f9f9] shadow-[4px_4px_0px_black]"
          >
            <img src={icons.mapCrosshair} alt="" className="size-[22px]" />
          </button>
          <button
            type="button"
            aria-label="보물 새로고침"
            className="flex size-14 items-center justify-center rounded-[2px] border-2 border-black bg-[#f9f9f9] shadow-[4px_4px_0px_black]"
          >
            <img src={icons.mapRefresh} alt="" className="size-4" />
          </button>
        </div>
      </section>

      <BottomNav active="map" />

      {selected && <TreasureHintPopup treasure={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
