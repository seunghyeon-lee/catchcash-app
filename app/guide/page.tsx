"use client";

import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { icons, illust, ui } from "@/lib/assets";
import { guideSteps } from "@/lib/mock/guide";

const stepIcons = {
  map: icons.guideStepMap,
  location: icons.guideStepLocation,
  ar: icons.guideStepAr,
  inventory: icons.guideStepInventory,
} as const;

export default function GuidePage() {
  return (
    <div className="relative min-h-screen bg-paper pb-28">
      <AppHeader variant="back-actions" backHref="/home" />

      <div className="px-5 pt-6">
        <section className="mb-8">
          <h1 className="text-[32px] font-medium leading-tight text-ink">뭐 하는 앱인지 알려줄게.</h1>
          <p className="mt-3 text-base text-muted">지도 보고, 가까이 가고, 열면 끝.</p>
        </section>

        <section
          className="relative mb-6 overflow-hidden px-5 pb-6 pt-8"
          style={{
            backgroundImage: `url(${ui.guideIntro})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="mb-4 flex justify-center">
            <Image src={illust.treasureBox} alt="" width={71} height={74} unoptimized />
          </div>
          <h2 className="text-center text-2xl font-normal text-ink">캐치캐쉬가 뭐냐면</h2>
          <p className="mt-3 text-center text-base leading-6 text-ink">
            현실 곳곳에 숨겨진 보물을 지도에서 찾고,
            <br />
            가까이 가서 사냥하면 보상을 얻는 앱이다.
          </p>
        </section>

        <ul className="mb-8 flex flex-col gap-3">
          {guideSteps.map((step, index) => (
            <li
              key={step.id}
              className="flex min-h-[110px] items-center gap-4 px-4 py-3"
              style={{
                backgroundImage: `url(${index % 2 === 0 ? ui.guideStepOdd : ui.guideStepEven})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-paper">
                <Image src={stepIcons[step.icon]} alt="" width={24} height={24} unoptimized />
              </div>
              <div>
                <p className="text-base text-muted">{step.step}</p>
                <p className="text-lg font-medium text-ink">{step.title}</p>
                <p className="text-sm text-ink">{step.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <section
          className="mb-4 px-8 py-8 text-white"
          style={{
            backgroundImage: `url(${ui.guideRewardBlob})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h3 className="text-2xl font-medium leading-tight">보상은 보관함에서 봐라,</h3>
          <p className="mt-4 text-base leading-6 text-white/90">
            보물을 찾으면 먼저 보관함에 수령권이 생긴다. 쿠폰 코드는 보관함에서 직접 받을 때 열린다.
          </p>
        </section>

        <section
          className="mb-8 px-8 py-8"
          style={{
            backgroundImage: `url(${ui.guidePermission})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h3 className="text-2xl font-medium text-ink">GPS랑 카메라는 왜 필요하냐</h3>
          <p className="mt-4 text-base leading-6 text-ink">
            보물 근처인지 확인하려면 위치가 필요하고, AR 사냥을 하려면 카메라가 필요하다.
          </p>
        </section>

        <Link
          href="/map"
          className="relative mb-4 flex h-[68px] w-full items-center justify-center"
          style={{
            backgroundImage: `url(${ui.huntJoinButton})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="relative z-10 text-2xl font-medium text-white">지도 뒤지러 가기 →</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
