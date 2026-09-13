"use client";

/* eslint-disable @next/next/no-img-element */
import { HUNT_ASSETS } from "@/lib/hunt/assets";

/** 상단 안내 말풍선(공식 명세 6·18장). 상자 터치를 방해하지 않도록 pointer-events 제거. */
export function ARInstructionCard({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[calc(env(safe-area-inset-top)+56px)] z-20 w-full max-w-[356px] -translate-x-1/2 px-5">
      <div className="relative">
        <img src={HUNT_ASSETS.frames.arInstructionBubble} alt="" className="absolute inset-0 size-full" />
        <p className="relative py-8 text-center text-2xl font-medium tracking-[1.4px] text-black">{text}</p>
      </div>
    </div>
  );
}
