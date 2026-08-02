"use client";

import Image from "next/image";
import Link from "next/link";
import { BottomTab } from "@/components/bottom-tab";
import { TopBar } from "@/components/top-bar";
import { icons, illust, ui } from "@/lib/assets";
import { huntLogs, nearbyTreasures } from "@/lib/mock/home";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-paper pb-28">
      <TopBar />

      <div className="px-5 pt-6">
        <section className="mb-8">
          <h1 className="text-2xl font-medium leading-10 text-ink">
            근처에 뭐 좀
            <br />
            숨겨놨다.
          </h1>
          <p className="mt-2 text-[15px] text-muted">지도 열고 근처 보물부터 뒤져봐.</p>

          <div className="relative mt-5">
            <Image
              src={illust.homeMinimap}
              alt="홈 미니맵"
              width={351}
              height={252}
              className="h-auto w-full"
              unoptimized
              priority
            />
            {/* SVG 안 버튼과 글자 중복 방지: 클릭 영역만 투명 링크로 둠 */}
            <Link
              href="/map"
              className="absolute bottom-[6%] right-[3%] h-[16%] w-[44%]"
              aria-label="지도 뒤지러 가기"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 inline-block border-b-2 border-ink pb-1 text-[15px] font-medium">근처 보물상자</h2>
          <ul className="flex flex-col gap-3">
            {nearbyTreasures.map((item) => (
              <li
                key={item.id}
                className="relative flex min-h-[72px] items-stretch bg-paper"
                style={{
                  backgroundImage: `url(${ui.homeTreasureCard})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="relative flex w-[68px] shrink-0 items-center justify-center self-stretch">
                  <Image
                    src={item.icon === "chest" ? icons.treasureChest : icons.placeTree}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-1/2 h-10 w-px -translate-y-1/2 bg-soft/80"
                  />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-ink">{item.title}</p>
                    <p className="text-sm text-muted">
                      {item.place} {item.distance}
                    </p>
                  </div>
                  <Link
                    href="/map"
                    className="relative flex h-7 shrink-0 items-center justify-center bg-paper px-3.5"
                    style={{
                      backgroundImage: `url(${ui.infoViewButton})`,
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <span className="text-xs font-medium text-ink">정보보기</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 inline-block border-b-2 border-ink pb-1 text-[15px] font-medium">최근 탐색 기록</h2>
          <div className="relative ml-2 border-l-2 border-ink pl-5">
            {huntLogs.map((log, index) => (
              <div
                key={log.id}
                className={`relative pb-5 ${index < huntLogs.length - 1 ? "border-b-2 border-dashed border-ink/50" : ""} ${
                  log.tone === "miss" ? "opacity-60" : ""
                }`}
              >
                <span
                  className={`absolute -left-[27px] top-4 h-2 w-2 rounded-full border border-ink ${
                    log.tone === "miss" ? "bg-[#e2e2e2]" : "bg-ink"
                  }`}
                />
                <p className="pt-2.5 text-[15px] font-medium text-ink">→ {log.text}</p>
                <p className="mt-1 text-[15px] text-muted">{log.time}</p>
              </div>
            ))}
          </div>
        </section>

        <Link
          href="/ar-hunt"
          className="relative mb-4 flex h-[68px] w-full items-center justify-center"
          style={{
            backgroundImage: `url(${ui.huntJoinButton})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-[15px] font-medium text-white">사냥 합류하기 →</span>
        </Link>
      </div>

      <BottomTab />
    </div>
  );
}
