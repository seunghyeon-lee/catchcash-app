/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { BottomNav } from "@/components/hunt/bottom-nav";
import { TopAppBar } from "@/components/hunt/top-app-bar";
import { HUNT_ASSETS } from "@/lib/hunt/assets";
import { MOCK_HUNT_RESULT } from "@/lib/hunt/mock-data";

const { icons, frames, images } = HUNT_ASSETS;

function HuntLogCard({ items, lastLabelRed }: { items: readonly string[]; lastLabelRed: boolean }) {
  return (
    <div className="rotate-[1.2deg] rounded-xl border-2 border-dashed border-black bg-[#eee] p-6">
      <div className="flex items-center gap-1.5">
        <img src={icons.resultHuntLogRefresh} alt="" className="size-3" />
        <span className="text-base font-medium uppercase tracking-[1.6px] text-[#4c4546]">HUNT LOG</span>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const red = isLast && lastLabelRed;
          return (
            <li key={item} className="flex items-center gap-3">
              <span className={`size-2 rounded-full ${red ? "bg-[#ba1a1a]" : "bg-black"}`} />
              <span className={`text-base font-medium ${red ? "text-[#ba1a1a]" : "text-[#4c4546]"}`}>- {item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SuccessResult() {
  const data = MOCK_HUNT_RESULT.success;
  return (
    <main className="flex flex-col items-center px-5 pb-10 pt-8">
      <div className="-rotate-[1.5deg] rounded-full border-2 border-black bg-[#f7f5ef] px-[18px] py-2 shadow-[2px_2px_0px_black]">
        <span className="text-sm font-medium uppercase tracking-[1.4px] text-[#1b1b1b]">{data.badge}</span>
      </div>

      <div className="mt-8 rotate-[0.57deg] text-center">
        {data.titleLines.map((line) => (
          <p key={line} className="text-[32px] font-medium leading-[35px] text-black">
            {line}
          </p>
        ))}
        <p className="mt-2 text-base font-medium text-[#5d5f5f]">{data.subtitle}</p>
      </div>

      {/* 보상 카드 */}
      <div className="relative mt-8 w-full max-w-[323px]">
        <img src={frames.resultSuccessCardFill} alt="" className="absolute inset-0 size-full" />
        <img src={frames.resultSuccessCardStroke} alt="" className="absolute inset-0 size-full" />
        <div className="relative flex flex-col items-center px-8 py-12">
          <div className="rotate-[1.5deg] border-2 border-black bg-[#eee] p-2 shadow-[2px_2px_0px_black]">
            <img src={images.resultRewardCoffee} alt={data.rewardName} className="size-28 object-contain opacity-80" />
          </div>
          <p className="mt-8 rotate-[1.5deg] text-center text-2xl font-medium text-black">{data.rewardName}</p>
          <p className="mt-1 rotate-[1.5deg] text-center text-sm font-medium uppercase tracking-[-0.35px] text-[#5d5f5f]">
            {data.rewardBrand}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs font-medium leading-5 tracking-[0.6px] text-[#4c4546] opacity-70">
        <p>상품은 보관함에서 확인할 수 있습니다.</p>
        <p>쿠폰 코드는 보관함에서 직접 받으세요.</p>
      </div>

      {/* CTA */}
      <div className="mt-6 flex w-full flex-col gap-5">
        <Link href="/inventory" className="relative flex h-[68px] items-center justify-center">
          <img src={frames.ctaBlack} alt="" className="absolute inset-0 size-full" />
          <span className="relative text-[15px] font-medium text-white">보관함으로 가기</span>
          <img src={icons.arrowRightWhite} alt="" className="absolute right-[68px] top-1/2 size-[18px] -translate-y-1/2" />
        </Link>
        <Link href="/map" className="relative flex h-[68px] items-center justify-center">
          <img src={frames.ctaWhite} alt="" className="absolute inset-0 size-full" />
          <span className="relative text-[15px] font-medium text-[#0b0b0b]">지도에서 더 찾기</span>
          <img src={icons.arrowRightBlack} alt="" className="absolute right-[68px] top-1/2 size-[18px] -translate-y-1/2" />
        </Link>
      </div>

      <div className="mt-8 w-full">
        <HuntLogCard items={data.huntLog} lastLabelRed />
      </div>

      <div className="mt-12 flex flex-col items-center">
        <p className="text-xs font-medium italic tracking-[0.6px] text-[#1b1b1b]">{data.quote}</p>
        <img src={frames.grugQuoteDivider} alt="" className="mt-2 h-2 w-[265px] opacity-30" />
      </div>
    </main>
  );
}

function FailResult() {
  const data = MOCK_HUNT_RESULT.fail;
  return (
    <main className="flex flex-col items-center px-5 pb-10 pt-5">
      <img src={icons.resultFailBadge} alt={data.badge} className="h-[29px] w-[53px] -rotate-[1.5deg]" />

      <div className="mt-8 text-center">
        {data.titleLines.map((line) => (
          <p key={line} className="text-[32px] font-medium leading-[35px] text-black">
            {line}
          </p>
        ))}
        <p className="mt-2 text-base font-medium text-[#5d5f5f]">{data.subtitle}</p>
      </div>

      {/* 빈 상자 카드 */}
      <div className="relative mt-10 w-full max-w-[323px] -rotate-[0.3deg]">
        <img src={frames.resultFailCardFill} alt="" className="absolute inset-0 size-full" />
        <img src={frames.resultFailCardStroke} alt="" className="absolute inset-0 size-full" />
        <div className="relative flex flex-col items-center px-8 py-16">
          <div className="relative flex size-32 items-center justify-center -rotate-[0.5deg]">
            <img src={icons.resultFailHouse} alt="" className="absolute inset-0 size-full" />
            <img src={icons.resultFailSadFace} alt="" className="size-[30px]" />
          </div>
          <div className="mt-10 text-center -rotate-[0.5deg]">
            {data.emptyLines.map((line) => (
              <p key={line} className="text-base font-medium text-[#1b1b1b]">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href="/map" className="relative mt-10 flex h-[66px] w-full items-center justify-center">
        <img src={frames.ctaWhiteWide} alt="" className="absolute inset-0 size-full" />
        <span className="relative text-[15px] font-medium text-[#0b0b0b]">지도에서 더 찾기</span>
        <img src={icons.arrowRightBlack} alt="" className="absolute right-[60px] top-1/2 size-[18px] -translate-y-1/2" />
      </Link>

      <button type="button" className="mt-8 text-base font-medium text-[#5d5f5f] underline">
        찡찡거리기
      </button>

      <div className="mt-8 w-full">
        <HuntLogCard items={data.huntLog} lastLabelRed />
      </div>
    </main>
  );
}

export default function HuntResultPage({ searchParams }: { searchParams?: { result?: string } }) {
  const isFail = searchParams?.result === "fail";

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5ef] pb-20">
      <TopAppBar />
      {isFail ? <FailResult /> : <SuccessResult />}
      <BottomNav active="hunt" />
    </div>
  );
}
