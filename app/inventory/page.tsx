"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

import { BottomNav } from "@/components/hunt/bottom-nav";
import { RewardDetailPopup } from "@/components/hunt/reward-detail-popup";
import { TopAppBar } from "@/components/hunt/top-app-bar";
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import { MOCK_REWARDS, type MockReward, type RewardStatus } from "@/lib/hunt/mock-data";

const { icons, frames, images } = HUNT_ASSETS;

type FilterKey = "all" | RewardStatus;

const FILTERS: { key: FilterKey; label: string; rotate: string }[] = [
  { key: "all", label: "전체", rotate: "rotate-1" },
  { key: "available", label: "사용 가능", rotate: "-rotate-1" },
  { key: "used", label: "사용됨", rotate: "rotate-[1.5deg]" },
  { key: "failed", label: "만료됨", rotate: "-rotate-[1.2deg]" },
];

const REWARD_IMAGES = { coffee: images.rewardCoffee, sandwich: images.rewardSandwich } as const;

function AvailableCard({ reward, onClick }: { reward: MockReward; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative block w-full text-left">
      <img src={frames.inventoryCardOdd} alt="" className="absolute inset-0 size-full" />
      <div className="relative flex items-center gap-4 px-5 py-4">
        {reward.image && (
          <img src={REWARD_IMAGES[reward.image]} alt={reward.name} className="size-[76px] shrink-0 object-contain" />
        )}
        <div className="min-w-0 flex-1">
          <span className="inline-block -rotate-2 rounded-full border-2 border-black bg-[#eab308] px-2.5 py-0.5 text-xs font-medium text-[#1b1b1b]">
            사용 가능
          </span>
          <p className="mt-1 truncate text-lg text-black">{reward.name}</p>
          <p className="truncate text-base text-[#5d5f5f]">
            {reward.brand} | {reward.expiresLabel}
          </p>
        </div>
        <img src={icons.inventoryChevronRight} alt="" className="h-3 w-2 shrink-0" />
      </div>
    </button>
  );
}

function FailedCard({ reward }: { reward: MockReward }) {
  return (
    <div className="relative w-full">
      <img src={frames.inventoryCardFailed} alt="" className="absolute inset-0 size-full" />
      <div className="relative flex items-center gap-4 px-5 py-4">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-[11px] border-2 border-black bg-[#ffdad6]/20">
          <img src={icons.inventoryErrorCircle} alt="" className="size-[25px]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block rotate-1 rounded-full border-2 border-black bg-[#ba1a1a] px-2.5 py-0.5 text-xs font-medium text-white">
            발급 실패
          </span>
          <p className="mt-1 truncate text-lg text-black">{reward.name}</p>
          <p className="truncate text-base text-[#ba1a1a]">{reward.failReason}</p>
        </div>
        <button type="button" aria-label="재시도" className="shrink-0">
          <img src={icons.inventoryRetry} alt="" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function UsedCard({ reward }: { reward: MockReward }) {
  return (
    <div className="w-full rotate-[1.2deg] rounded-xl border-2 border-dashed border-black bg-[#eee]">
      <div className="flex items-center gap-4 px-4 py-3.5 -rotate-[1.2deg]">
        {reward.image && (
          <img
            src={REWARD_IMAGES[reward.image]}
            alt={reward.name}
            className="size-[76px] shrink-0 object-contain opacity-60 grayscale"
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full border-2 border-black bg-[#e2e2e2] px-2.5 py-0.5 text-xs font-medium text-[#1b1b1b]">
            사용됨
          </span>
          <p className="mt-1 truncate text-lg text-[#5d5f5f]">{reward.name}</p>
          <p className="truncate text-base text-[#5d5f5f]">{reward.usedAtLabel}</p>
        </div>
        <img src={icons.inventoryCheckCircle} alt="" className="size-5 shrink-0" />
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<MockReward | null>(null);

  const rewards = MOCK_REWARDS.filter((reward) => filter === "all" || reward.status === filter);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5ef] pb-20">
      <TopAppBar />

      <main className="flex-1 px-5 pb-10 pt-8">
        {/* 타이틀 */}
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 -rotate-2 items-center justify-center rounded-[18px] border-[3px] border-black bg-white shadow-[2px_2px_0px_black]">
            <img src={icons.inventoryTitleBox} alt="" className="size-[30px]" />
          </div>
          <div>
            <h2 className="text-[32px] leading-9 text-black">나의 보관함</h2>
            <p className="mt-1 text-base text-[#5d5f5f]">전리품 안 잃어버리게 모아뒀다.</p>
          </div>
        </div>

        {/* 필터 칩 */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`shrink-0 rounded-[12px] border-2 border-black px-[22px] py-2.5 text-base ${item.rotate} ${
                  isActive ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 보상 카드 목록 */}
        <div className="mt-6 flex flex-col gap-6">
          {rewards.map((reward) => {
            if (reward.status === "available") {
              return <AvailableCard key={reward.id} reward={reward} onClick={() => setSelected(reward)} />;
            }
            if (reward.status === "failed") {
              return <FailedCard key={reward.id} reward={reward} />;
            }
            return <UsedCard key={reward.id} reward={reward} />;
          })}
          {rewards.length === 0 && (
            <p className="py-16 text-center text-base text-[#5d5f5f]">해당하는 전리품이 없다.</p>
          )}
        </div>
      </main>

      <BottomNav active="myinfo" />

      {selected && <RewardDetailPopup reward={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
