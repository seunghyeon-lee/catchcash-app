"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NotificationInbox } from "@/components/notification/inbox";
import { icons } from "@/lib/assets";

type TopBarProps = {
  brand?: string;
  showBack?: boolean;
  backHref?: string;
};

/**
 * 홈/안내 화면 상단 GNB.
 *
 * 우측 3개 아이콘 동작은 프로필·문의 GNB(`components/profile/top-app-bar`)와 동일하다.
 * - 알림 → 알림함 팝업 (`04_1_Notification_Inbox_Screen`)
 * - 도움말 → `/guide`
 * - 설정 → `/profile`
 *
 * 알림함 상태는 화면이 아니라 이 컴포넌트가 들고 있다 — 붙이기만 하면 알림 아이콘이 동작한다.
 */
export function TopBar({ brand = "catch cash", showBack = false, backHref = "/home" }: TopBarProps) {
  const [inboxOpen, setInboxOpen] = useState(false);

  return (
    <>
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
          <button
            type="button"
            onClick={() => setInboxOpen(true)}
            className="flex h-8 w-8 items-center justify-center"
            aria-label="알림"
          >
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

      <NotificationInbox open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </>
  );
}
