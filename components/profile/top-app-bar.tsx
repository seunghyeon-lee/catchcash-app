"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { PROFILE_ASSETS } from "@/lib/profile/assets";

const { icons } = PROFILE_ASSETS;

/**
 * 프로필/프로필 수정 화면 상단 GNB.
 * Figma: 10_My_Profile_Screen > "Header - TopAppBar" (1:2444)
 */
export function ProfileTopAppBar({
  backHref,
  onGnbClick,
}: {
  backHref?: string;
  onGnbClick?: () => void;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b-2 border-black bg-[#f7f5ef] px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="mr-4 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-black transition-transform active:translate-x-0.5 active:translate-y-0.5"
      >
        <img src={icons.backCircle} alt="" className="size-[17.7px]" />
      </button>

      <h1 className="flex-1 text-xl font-bold lowercase tracking-tight text-black">catch cash</h1>

      <div className="flex items-center gap-4">
        <button type="button" aria-label="알림" onClick={onGnbClick} className="flex items-center justify-center">
          <img src={icons.gnbNotification} alt="" className="h-5 w-4" />
        </button>
        <button type="button" aria-label="도움말" onClick={onGnbClick} className="flex items-center justify-center">
          <img src={icons.gnbHelp} alt="" className="size-5" />
        </button>
        <button type="button" aria-label="설정" onClick={onGnbClick} className="flex items-center justify-center">
          <img src={icons.gnbSetting} alt="" className="h-5 w-[20.1px]" />
        </button>
      </div>
    </header>
  );
}
