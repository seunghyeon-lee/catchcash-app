"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BottomTab } from "@/components/bottom-tab";
import { CharacterAvatar, PROFILE_AVATAR_SIZE } from "@/components/profile/character-avatar";
import { LogoutConfirmPopup } from "@/components/profile/logout-confirm-popup";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { Toast } from "@/components/profile/toast";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { useToast } from "@/components/profile/use-toast";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { findCharacter, findColor, MOCK_PROFILE, resolveIntro } from "@/lib/profile/mock-data";

const { icons, frames } = PROFILE_ASSETS;

/** 두 자리 고정 표기 (Figma: 08, 03) */
const pad2 = (value: number) => String(value).padStart(2, "0");

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-md border-[3px] border-black bg-white px-2 py-3 shadow-[4px_4px_0_#000]">
      <span className="text-xs tracking-[0.6px] text-[#5d5f5f]">{label}</span>
      <span className="mt-0.5 text-[32px] font-bold leading-[38.4px] text-black">{value}</span>
    </div>
  );
}

type MenuTone = "black" | "white" | "red";

const MENU_FRAME: Record<MenuTone, string> = {
  black: frames.menuButtonBlack,
  white: frames.menuButtonWhite,
  red: frames.menuButtonRed,
};

const MENU_CHEVRON: Record<MenuTone, string> = {
  black: icons.chevronRightWhite,
  white: icons.chevronRightGray,
  red: icons.chevronRightRed,
};

function MenuRow({
  tone,
  icon,
  label,
  onClick,
}: {
  tone: MenuTone;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  const danger = tone === "red";

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <RoughImageFrame src={MENU_FRAME[tone]} className="w-full">
        <div className="flex items-center gap-4 px-6 py-3.5">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border p-px ${
              danger ? "border-[#ba1a1a] bg-[#fee2e2]" : "border-black bg-[#eee]"
            }`}
          >
            <img src={icon} alt="" className="size-5" />
          </span>
          <span
            className={`min-w-0 flex-1 truncate text-base leading-6 ${
              tone === "black" ? "text-white" : danger ? "text-[#dc2626]" : "text-black"
            }`}
          >
            {label}
          </span>
          <img src={MENU_CHEVRON[tone]} alt="" className="h-3 w-[7.4px] shrink-0" />
        </div>
      </RoughImageFrame>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { message, show } = useToast();
  const [showLogout, setShowLogout] = useState(false);

  const { nickname, intro, characterKey, colorKey, stats } = MOCK_PROFILE;
  const character = findCharacter(characterKey);
  const color = findColor(colorKey);
  // 사용자가 쓴 한 줄 소개 우선, 비었으면 캐릭터 기본 문구 — 수정 화면 미리보기와 같은 규칙.
  const introText = resolveIntro(intro, character);

  const comingSoon = () => show("곧 만들어 준다");

  const handleLogout = () => {
    // Mock: 실제 세션 정리 없이 로그인 화면으로 이동
    console.log("[CatchCash] mock logout");
    router.push("/login");
  };

  return (
    <>
      <section className="min-h-screen bg-[#f7f5ef] pb-28">
        <ProfileTopAppBar backHref="/home" onGnbClick={comingSoon} />

        <div className="px-5 pt-4">
          {/* 프로필 메인 카드 */}
          <RoughImageFrame src={frames.profileMainCard} className="w-full">
            <div className="flex flex-col items-center px-6 pb-7 pt-9">
              <CharacterAvatar character={character} color={color.value} size={PROFILE_AVATAR_SIZE} />

              <h2 className="mt-4 text-2xl font-bold leading-[31.2px] text-black">{nickname}</h2>
              <p className="mt-1.5 text-center text-sm leading-5 text-[#5d5f5f]">{introText}</p>

              <button
                type="button"
                onClick={() => router.push("/profile/edit")}
                className="mt-6 block w-full max-w-[284px] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <RoughImageFrame src={frames.profileEditEntryButton} className="w-full">
                  <span className="flex items-center justify-center gap-2 px-6 py-5 text-[15px] text-white">
                    프로필 수정
                    <img src={icons.arrowRightWhite} alt="" className="size-[17.7px] shrink-0" />
                  </span>
                </RoughImageFrame>
              </button>
            </div>
          </RoughImageFrame>

          {/* 통계 3종 */}
          <div className="mt-6 flex items-stretch gap-3">
            <StatCard label="찾은 보물" value={pad2(stats.treasuresFound)} />
            <StatCard label="보유 쿠폰" value={pad2(stats.couponsOwned)} />
            <StatCard label="현재 순위" value={`#${stats.rank}`} />
          </div>

          {/* 메뉴 */}
          <div className="mt-7 space-y-4">
            <MenuRow
              tone="black"
              icon={icons.menuInventory}
              label="보상 보관함"
              onClick={() => router.push("/inventory")}
            />
            <MenuRow tone="white" icon={icons.menuInquiry} label="문의하기" onClick={() => router.push("/support")} />
            <MenuRow tone="red" icon={icons.menuLogout} label="로그아웃" onClick={() => setShowLogout(true)} />
          </div>
        </div>
      </section>

      <BottomTab />

      {showLogout ? (
        <LogoutConfirmPopup onCancel={() => setShowLogout(false)} onConfirm={handleLogout} />
      ) : null}
      {message ? <Toast message={message} /> : null}
    </>
  );
}
