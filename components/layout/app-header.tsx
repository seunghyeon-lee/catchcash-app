"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GNB_ASSETS } from "@/lib/gnb/assets";

const { icons, frames } = GNB_ASSETS;

export type AppHeaderVariant = "main-actions" | "back-actions" | "back-title";

export type AppHeaderProps = {
  variant?: AppHeaderVariant;
  title?: string;
  backHref?: string;
  onBack?: () => void;
};

/**
 * 공통 상단 GNB.
 * 스펙: `docs/frontend/common/00_Common_Top_Navigation_GNB.md`
 *
 * - Type A `main-actions`: 타이틀 + 알림/도움말/설정
 * - Type B `back-actions`: 뒤로가기 + 타이틀 + 알림/도움말/설정
 * - Type C `back-title`: 뒤로가기 + 타이틀
 *
 * 알림 → `/notification` (단수). Supabase 연결 없음.
 */
export function AppHeader({
  variant = "main-actions",
  title = "catch cash",
  backHref,
  onBack,
}: AppHeaderProps) {
  const router = useRouter();

  const showBack = variant === "back-actions" || variant === "back-title";
  const showActions = variant === "main-actions" || variant === "back-actions";

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="relative isolate">
        <img
          src={frames.paper}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />
        <div className="relative flex h-[64px] items-center justify-between px-5 pb-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showBack ? (
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="flex shrink-0 items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <img src={icons.back} alt="" className="h-8 w-[45px]" />
              </button>
            ) : null}
            <h1 className="-rotate-[1.5deg] skew-x-[-1deg] truncate text-[20px] font-black lowercase leading-none tracking-[-0.04em] text-black">
              {title}
            </h1>
          </div>

          {showActions ? (
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <Link
                href="/notification"
                aria-label="알림"
                className="flex items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <img src={icons.notification} alt="" className="h-8 w-[45px]" />
              </Link>
              <Link
                href="/guide"
                aria-label="도움말"
                className="flex items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <img src={icons.help} alt="" className="h-8 w-[45px]" />
              </Link>
              <Link
                href="/profile/edit"
                aria-label="설정"
                className="flex items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <img src={icons.setting} alt="" className="h-8 w-[45px]" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
