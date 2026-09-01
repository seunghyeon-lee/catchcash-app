"use client";

/* eslint-disable @next/next/no-img-element */
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CharacterAvatar, PROFILE_AVATAR_SIZE } from "@/components/profile/character-avatar";
import { LogoutConfirmPopup } from "@/components/profile/logout-confirm-popup";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { Toast } from "@/components/profile/toast";
import { useToast } from "@/components/profile/use-toast";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { findCharacter, findColor, MOCK_PROFILE, resolveIntro, type MockProfile } from "@/lib/profile/mock-data";
import { getProfile, signOutProfile } from "@/lib/profile/profile-service";

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
  const pathname = usePathname();
  // 로그아웃 실패 안내용. GNB 아이콘이 배선된 뒤로는 이 토스트만 남았다.
  const { message, show } = useToast();
  const [showLogout, setShowLogout] = useState(false);
  const [profile, setProfile] = useState<MockProfile>(MOCK_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockFallback, setIsMockFallback] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      const result = await getProfile();
      if (!isMounted) return;

      setProfile(result.profile);
      setIsMockFallback(result.source === "mock");
      setLoadError(result.errorMessage ?? null);
      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const { nickname, intro, characterKey, colorKey, stats } = profile;
  const character = findCharacter(characterKey);
  const color = findColor(colorKey);
  // 사용자가 쓴 한 줄 소개 우선, 비었으면 캐릭터 기본 문구 — 수정 화면 미리보기와 같은 규칙.
  const introText = resolveIntro(intro, character);

  const handleLogout = async () => {
    // TODO(auth): Auth 연결 후에는 signOut 성공 시에만 /login 으로 보낸다.
    const result = await signOutProfile();

    if (!result.ok) {
      show(result.errorMessage ?? "로그아웃에 실패했어.");
      return;
    }

    if (result.source === "mock") {
      console.log("[CatchCash] mock logout");
    }

    router.push("/login");
  };

  return (
    <>
      <section className="min-h-screen bg-[#f7f5ef] pb-28">
        {/* MD: /profile = Type A (뒤로가기 없음) */}
        <AppHeader variant="main-actions" />

        <div className="px-5 pt-4">
          {isMockFallback ? (
            <p className="mb-3 text-xs leading-5 text-[#5d5f5f]">로그인 연결 전이라 예시 프로필을 보여주고 있어.</p>
          ) : null}
          {loadError ? <p className="mb-3 text-sm leading-5 text-[#b42318]">{loadError}</p> : null}
          {isLoading ? <p className="mb-3 text-sm leading-5 text-[#5d5f5f]">프로필을 불러오는 중이야.</p> : null}

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

      <BottomNav />

      {showLogout ? (
        <LogoutConfirmPopup onCancel={() => setShowLogout(false)} onConfirm={() => void handleLogout()} />
      ) : null}
      {message ? <Toast message={message} /> : null}
    </>
  );
}
