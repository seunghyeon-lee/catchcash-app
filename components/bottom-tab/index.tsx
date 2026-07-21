"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { icons } from "@/lib/assets";

const tabs = [
  {
    href: "/home",
    label: "지도",
    match: ["/home", "/map"],
    iconDefault: icons.navMapDefault,
    iconActive: icons.navMapActive,
  },
  {
    href: "/ar-hunt",
    label: "사냥하기",
    match: ["/ar-hunt", "/guide"],
    iconDefault: icons.navHuntDefault,
    iconActive: icons.navHuntActive,
  },
  {
    href: "/hall-of-fame",
    label: "랭킹",
    match: ["/hall-of-fame"],
    iconDefault: icons.navRankDefault,
    iconActive: icons.navRankActive,
  },
  {
    href: "/profile",
    label: "내정보",
    match: ["/profile", "/inventory", "/support"],
    iconDefault: icons.navProfileDefault,
    iconActive: icons.navProfileActive,
  },
] as const;

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 flex h-20 w-full max-w-[480px] -translate-x-1/2 items-center justify-around border-t-2 border-ink bg-surface px-3">
      {tabs.map((tab) => {
        const active = tab.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-16 w-16 flex-col items-center justify-center gap-1 ${
              active ? "border-2 border-ink bg-ink text-white" : "text-muted"
            }`}
          >
            <Image
              src={active ? tab.iconActive : tab.iconDefault}
              alt=""
              width={20}
              height={20}
              className={active ? "brightness-0 invert" : ""}
              unoptimized
            />
            <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
