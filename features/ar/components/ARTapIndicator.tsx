"use client";

/* eslint-disable @next/next/no-img-element */
import { HUNT_ASSETS } from "@/lib/hunt/assets";

/**
 * 중앙 상자 아래 TAP 안내(공식 명세 6·18장).
 * pointer-events 없음 — 실제 터치는 뒤의 R3F 상자가 받는다.
 */
export function ARTapIndicator() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[58%] z-20 flex -translate-x-1/2 flex-col items-center">
      <img src={HUNT_ASSETS.icons.arTapTarget} alt="" className="size-8 animate-pulse" />
      <span className="mt-2 whitespace-nowrap text-base font-medium uppercase text-[#ff0000]">GRUG TAP HERE</span>
    </div>
  );
}
