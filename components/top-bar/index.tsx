"use client";

import Image from "next/image";
import Link from "next/link";
import { icons } from "@/lib/assets";

type TopBarProps = {
  brand?: string;
  showBack?: boolean;
  backHref?: string;
  onNotificationClick?: () => void;
};

export function TopBar({
  brand = "catch cash",
  showBack = false,
  backHref = "/home",
  onNotificationClick,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center justify-between border-b-2 border-ink bg-surface px-5">
      <div className="flex min-w-0 items-center gap-2">
        {showBack ? (
          <Link
            href={backHref}
            className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper"
            aria-label="뒤로가기"
          >
            <Image src={icons.navBack} alt="" width={18} height={18} unoptimized />
          </Link>
        ) : null}
        <p className="truncate text-[15px] font-bold lowercase tracking-tight text-ink">{brand}</p>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" onClick={onNotificationClick} className="flex h-8 w-8 items-center justify-center" aria-label="알림">
          <Image src={icons.gnbNotification} alt="" width={16} height={20} unoptimized />
        </button>
        <Link href="/guide" className="flex h-8 w-8 items-center justify-center" aria-label="도움말">
          <Image src={icons.gnbHelp} alt="" width={20} height={20} unoptimized />
        </Link>
        <Link href="/profile" className="flex h-8 w-8 items-center justify-center" aria-label="설정">
          <Image src={icons.gnbSetting} alt="" width={20} height={20} unoptimized />
        </Link>
      </div>
    </header>
  );
}
