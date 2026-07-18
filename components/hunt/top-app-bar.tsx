"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { HUNT_ASSETS } from "@/lib/hunt/assets";

const { icons } = HUNT_ASSETS;

export function TopAppBar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b-2 border-black bg-[#f7f5ef] px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => router.back()}
        className="mr-4 flex size-10 items-center justify-center rounded-full border-2 border-black bg-transparent"
      >
        <img src={icons.backCircle} alt="" className="size-[18px]" />
      </button>
      <h1 className="flex-1 text-xl font-bold lowercase tracking-tight text-black">catch cash</h1>
      <div className="flex items-center gap-4">
        <button type="button" aria-label="알림" className="flex size-6 items-center justify-center">
          <img src={icons.gnbNotification} alt="" className="h-5 w-4" />
        </button>
        <button type="button" aria-label="도움말" className="flex size-6 items-center justify-center">
          <img src={icons.gnbHelp} alt="" className="size-5" />
        </button>
        <button type="button" aria-label="설정" className="flex size-6 items-center justify-center">
          <img src={icons.gnbSetting} alt="" className="size-5" />
        </button>
      </div>
    </header>
  );
}
