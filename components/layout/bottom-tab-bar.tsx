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
};

const TABS: BottomTabItem[] = [
  {
    key: "home",
    label: "홈",
    href: "/home",
    matchPaths: ["/home"],
    activeIcon: BNB_ASSETS.home.active,
    defaultIcon: BNB_ASSETS.home.default,
  },
  {
    key: "map",
    label: "지도",
    href: "/map",
    matchPaths: ["/map"],
    activeIcon: BNB_ASSETS.map.active,
    defaultIcon: BNB_ASSETS.map.default,
  },
  {
    key: "hunt",
    label: "사냥하기",
    href: "/ar-hunt",
    matchPaths: ["/ar-hunt"],
    activeIcon: BNB_ASSETS.hunt.active,
    defaultIcon: BNB_ASSETS.hunt.default,
  },
  {
    key: "fame",
    label: "명예의 전당",
    href: "/hall-of-fame",
    matchPaths: ["/hall-of-fame"],
    activeIcon: BNB_ASSETS.fame.active,
    defaultIcon: BNB_ASSETS.fame.default,
  },
  {
    key: "profile",
    label: "내정보",
    href: "/profile",
    matchPaths: ["/profile", "/support"],
    activeIcon: BNB_ASSETS.profile.active,
    defaultIcon: BNB_ASSETS.profile.default,
  },
];

function isTabActive(pathname: string, matchPaths: string[]) {
  return matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * 공통 하단 BNB (5탭).
 * 스펙: `docs/frontend/common/00_Common_Bottom_Navigation_BNB.md`
 *
 * `components/hunt/bottom-nav.tsx` 와 이름을 구분하기 위해 `BottomTabBar` 로 둔다.
 * 이번 PR에서는 profile/support 계열에만 적용한다.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 h-20 w-full max-w-[480px] -translate-x-1/2 border-t-2 border-black bg-white">
      <div className="flex h-full items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab.matchPaths);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 ${
                active ? "bg-black text-white" : "text-[#5d5f5f]"
              }`}
            >
              <img
                src={active ? tab.activeIcon : tab.defaultIcon}
                alt=""
                className="h-5 w-5 shrink-0 object-contain"
              />
              <span
                className={`max-w-full truncate text-center text-[10px] font-medium leading-tight tracking-[0.2px] ${
                  active ? "text-white" : "text-[#5d5f5f]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
