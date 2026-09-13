"use client";

/* eslint-disable @next/next/no-img-element */
import { HUNT_ASSETS } from "@/lib/hunt/assets";

/** 우측 상단 닫기 버튼(공식 명세 6·18장). safe-area 고려. */
export function ARCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="사냥 종료"
      onClick={onClose}
      className="pointer-events-auto absolute right-4 top-[calc(env(safe-area-inset-top)+16px)] z-30 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_black]"
    >
      <img src={HUNT_ASSETS.icons.closeCircle} alt="" className="size-4" />
    </button>
  );
}
