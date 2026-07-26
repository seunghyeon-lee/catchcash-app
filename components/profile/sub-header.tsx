"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { PROFILE_ASSETS } from "@/lib/profile/assets";

const { icons } = PROFILE_ASSETS;

/**
 * 문의하기 화면 상단 헤더 (뒤로가기 + 타이틀).
 * Figma: 문의하기 > "Header - TopAppBar Navigation" (1:2810)
 */
export function SubHeader({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b-4 border-black bg-[#f7f5ef] px-5">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={handleBack}
        className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-black transition-transform active:translate-x-0.5 active:translate-y-0.5"
      >
        <img src={icons.backCircle} alt="" className="size-[17.7px]" />
      </button>
      <h1 className="flex-1 pr-10 text-center text-base font-medium text-black">{title}</h1>
    </header>
  );
}
