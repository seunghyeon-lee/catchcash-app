/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { HUNT_ASSETS } from "@/lib/hunt/assets";

const { icons } = HUNT_ASSETS;

export type BottomNavTab = "map" | "hunt" | "rank" | "myinfo";

const TABS: { key: BottomNavTab; label: string; href: string; iconBlack: string; iconWhite: string }[] = [
  { key: "map", label: "지도", href: "/map", iconBlack: icons.tabMapBlack, iconWhite: icons.tabMapWhite },
  { key: "hunt", label: "사냥하기", href: "/ar-hunt", iconBlack: icons.tabHuntBlack, iconWhite: icons.tabHuntWhite },
  { key: "rank", label: "랭킹", href: "/hall-of-fame", iconBlack: icons.tabRankBlack, iconWhite: icons.tabRankBlack },
  { key: "myinfo", label: "내정보", href: "/profile", iconBlack: icons.tabMyInfoBlack, iconWhite: icons.tabMyInfoWhite },
];

export function BottomNav({ active }: { active: BottomNavTab }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 h-20 w-full max-w-[480px] -translate-x-1/2 border-t-2 border-black bg-[#f9f9f9]">
      <div className="flex h-full items-center justify-around px-3">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex size-16 flex-col items-center justify-center gap-1 ${
                isActive ? "border-2 border-black bg-black" : ""
              }`}
            >
              <img src={isActive ? tab.iconWhite : tab.iconBlack} alt="" className="h-5 w-5 object-contain" />
              <span
                className={`text-[13px] font-medium tracking-[0.6px] ${isActive ? "text-white" : "text-[#5d5f5f]"}`}
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
