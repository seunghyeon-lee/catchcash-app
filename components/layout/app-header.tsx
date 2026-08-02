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

const actionBtnClass =
  "inline-flex h-[30px] w-[43px] shrink-0 items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5";

/**
 * 공통 상단 GNB.
 * 스펙: `docs/frontend/common/00_Common_Top_Navigation_GNB.md`
 * Figma: `15:2` / `15:25` / `15:39`~`15:45`
 *
 * - Type A `main-actions`: 타이틀 + 알림/도움말/설정
 * - Type B `back-actions`: 뒤로가기 + 타이틀 + 알림/도움말/설정
 * - Type C `back-title`: 뒤로가기 + 타이틀
 */
export function AppHeader({
  variant = "main-actions",
  title = "CATCH CASH",
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
      <div className="relative isolate min-h-[76px]">
        <img
          src={frames.paper}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />
        <div className="relative flex h-[76px] items-center justify-between px-5 pb-3 pt-1">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showBack ? (
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={handleBack}
                className="inline-flex h-[30px] w-[43px] shrink-0 items-center justify-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <img src={icons.back} alt="" className="h-[30px] w-[43px] object-contain" />
              </button>
            ) : null}
            <h1
              className={`-rotate-[2deg] truncate font-black uppercase leading-none tracking-[-0.04em] text-black ${
                showBack ? "text-[18px]" : "text-[24px]"
              }`}
            >
              {title}
            </h1>
          </div>

          {showActions ? (
            <div className="ml-3 flex shrink-0 items-center gap-[11px]">
              <Link href="/notification" aria-label="알림" className={actionBtnClass}>
                <img src={icons.notification} alt="" className="h-[30px] w-[43px] object-contain" />
              </Link>
              <Link href="/guide" aria-label="도움말" className={actionBtnClass}>
                <img src={icons.help} alt="" className="h-[30px] w-[43px] object-contain" />
              </Link>
              <Link href="/profile/edit" aria-label="설정" className={actionBtnClass}>
                <img src={icons.setting} alt="" className="h-[30px] w-[43px] object-contain" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
