"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { FAME_ASSETS } from "@/lib/fame/assets";
import { getFameMyRecord, getFameRankingRows, getFameSummary, getFameTopHunter } from "@/lib/fame/mappers";
import { FAME_FILTERS, type FameFilter } from "@/lib/fame/mock-data";
import { HUNT_ASSETS } from "@/lib/hunt/assets";

const { icons } = HUNT_ASSETS;

function SectionCard({
  className,
  rotateClass,
  children,
}: {
  className?: string;
  rotateClass?: string;
  children: ReactNode;
}) {
  return (
    <div className={rotateClass}>
      <div
        className={`rounded-[6px] border-2 border-black bg-white shadow-[6px_6px_0px_#000] ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function HallOfFamePage() {
  // 기간 필터는 hunter rankings 리스트에만 적용. 상단 4개 영역은 고정.
  const [activeFilter, setActiveFilter] = useState<FameFilter>("all");

  const topHunter = useMemo(() => getFameTopHunter(), []);
  const summary = useMemo(() => getFameSummary(), []);
  const myRecord = useMemo(() => getFameMyRecord(), []);
  const rankingRows = useMemo(() => getFameRankingRows(activeFilter), [activeFilter]);

  return (
    <section className="min-h-screen bg-[#f7f5ef] pb-28 text-[#1a1c1c]">
      <AppHeader variant="main-actions" />

      <div className="mx-auto flex max-w-[480px] flex-col px-[18px] pb-8 pt-8">
        <h1 className="text-[32px] font-medium leading-[1.2]">명예의 전당</h1>
        <p className="mt-1 text-[16px] italic leading-[1.6] text-[#5d5f5f]">보물을 찾아낸 괘씸한 놈들</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <SectionCard rotateClass="-rotate-[1deg]" className="relative overflow-hidden p-[18px]">
              <div className="text-[12px] tracking-[0.6px] text-[#5d5f5f]">{topHunter.subtitle}</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] border-2 border-black bg-[#eee]">
                  <img src={topHunter.avatarSrc} alt="" className="h-11 w-11 rounded-full object-cover" />
                </div>
                <div>
                  <div className="text-[24px] font-semibold leading-[1.2]">{topHunter.nickname}</div>
                  <div className="text-[16px] leading-[1.6]">{`보물 ${topHunter.findCount}개 발견`}</div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-1 top-1 opacity-10">
                <img src={icons.tabRankBlack} alt="" className="h-16 w-16" />
              </div>
            </SectionCard>
          </div>

          <SectionCard rotateClass="rotate-[0.3deg]" className="p-[18px]">
            <div className="text-[12px] tracking-[0.6px] text-[#5d5f5f]">이번주 발견된 갯수</div>
            <div className="mt-2 text-[24px] font-semibold leading-[1.25]">{summary.weeklyFindCount}</div>
          </SectionCard>

          <SectionCard rotateClass="-rotate-[0.7deg]" className="p-[18px]">
            <div className="text-[12px] tracking-[0.6px] text-[#5d5f5f]">최근 발견된 상자</div>
            <div className="mt-2 flex items-center gap-2">
              <img src={FAME_ASSETS.icons.recentChest} alt="" className="h-[19px] w-5" />
              <div className="text-[14px] font-medium leading-[1.4]">{summary.recentTreasureName}</div>
            </div>
            <div className="mt-2 text-[12px] tracking-[0.6px] text-[#5d5f5f]">{summary.recentTreasureMeta}</div>
          </SectionCard>
        </div>

        <div className="mt-6 rotate-[0.9deg] rounded-[6px] border-2 border-black bg-black p-[26px] text-white shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between">
            <div className="text-[24px] font-semibold lowercase leading-[1.2]">my record</div>
            <div className="-rotate-[0.6deg] rounded-[6px] border-2 border-black bg-white px-3.5 py-1.5 text-[16px] font-medium text-black">
              {myRecord.rankLabel}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] tracking-[0.6px] text-white/70">total finds</div>
              <div className="mt-1 text-[32px] font-bold leading-[1.2]">{myRecord.totalFindsLabel}</div>
            </div>
            <div>
              <div className="text-[12px] tracking-[0.6px] text-white/70">recent</div>
              <div className="mt-1 text-[16px] leading-[1.6]">{myRecord.recentTreasureName}</div>
              <div className="text-[12px] tracking-[0.6px] text-white/60">{myRecord.recentFoundAtLabel}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-3">
            {FAME_FILTERS.map((filter) => {
              const isActive = filter.key === activeFilter;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`${filter.rotateClass} rounded-[6px] border-2 border-black px-[18px] py-[10px] text-[14px] tracking-[0.7px] ${
                    isActive ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-4">
          <h2 className="text-[24px] font-semibold lowercase leading-[1.3]">hunter rankings</h2>
          <div className="mt-4 space-y-0">
            {rankingRows.map((row, index) => (
              <div key={`${activeFilter}-${row.rank}-${row.nickname}`}>
                <div className="flex items-center gap-4 py-5">
                  <div className="w-7 text-center text-[24px] font-semibold italic leading-none">{row.rank}</div>
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] border-2 border-black bg-[#eee] p-[2px]">
                    <img src={row.avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[18px] font-medium leading-[1.4]">{row.nickname}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-[16px] leading-[1.4] text-[#5d5f5f]">
                      <span>{row.findCountLabel}</span>
                      <span>{row.locationLabel}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[16px] leading-[1.4] text-[#5d5f5f]">
                    {row.lastFoundAtLabel}
                  </div>
                </div>
                {index < rankingRows.length - 1 && <div className="h-px w-full bg-black/20" />}
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomTabBar />
    </section>
  );
}
