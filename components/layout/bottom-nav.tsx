"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BNB_ASSETS } from "@/lib/gnb/assets";

type BottomTabItem = {
  key: "home" | "map" | "hunt" | "fame" | "profile";
  label: string;
  href: string;
  matchPaths: string[];
  activeIcon: string;
  defaultIcon: string;
  iconClass: string;
};

/**
 * Common BNB — docs/frontend/common/00_Common_Bottom_Navigation_BNB.md
 * Figma: 15:85 BottomNavBar
 */
const TABS: BottomTabItem[] = [
  {
    key: "home",
    label: "홈",
    href: "/home",
    matchPaths: ["/home"],
    activeIcon: BNB_ASSETS.home.active,
    defaultIcon: BNB_ASSETS.home.default,
    iconClass: "h-[18px] w-4",
  },
  {
    key: "map",
    label: "지도",
    href: "/map",
    matchPaths: ["/map"],
    activeIcon: BNB_ASSETS.map.active,
    defaultIcon: BNB_ASSETS.map.default,
    iconClass: "size-[18px]",
  },
  {
    key: "hunt",
    label: "사냥하기",
    href: "/ar-hunt",
    matchPaths: ["/ar-hunt", "/hunt-result"],
    activeIcon: BNB_ASSETS.hunt.active,
    defaultIcon: BNB_ASSETS.hunt.default,
    iconClass: "size-5",
  },
  {
    key: "fame",
    label: "명예의 전당",
    href: "/hall-of-fame",
    matchPaths: ["/hall-of-fame"],
    activeIcon: BNB_ASSETS.fame.active,
    defaultIcon: BNB_ASSETS.fame.default,
    iconClass: "size-[18px]",
  },
  {
    key: "profile",
    label: "내정보",
    href: "/profile",
    matchPaths: ["/profile", "/support", "/inventory"],
    activeIcon: BNB_ASSETS.profile.active,
    defaultIcon: BNB_ASSETS.profile.default,
    iconClass: "size-4",
  },
];

function isTabActive(pathname: string, matchPaths: string[]) {
  return matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed bottom-0 left-1/2 z-30 flex h-[72px] w-full max-w-[480px] -translate-x-1/2 items-stretch border-t-4 border-black bg-white pt-1"
    >
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab.matchPaths);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 ${
              active ? "border-2 border-black bg-black" : "bg-white"
            }`}
          >
            <img
              src={active ? tab.activeIcon : tab.defaultIcon}
              alt=""
              className={`${tab.iconClass} shrink-0 object-contain`}
            />
            <span
              className={`max-w-full truncate text-center text-[12px] font-normal leading-3 tracking-[0.6px] ${
                active ? "text-white" : "text-black"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** @deprecated Prefer BottomNav. Compat alias. */
export const BottomTabBar = BottomNav;
