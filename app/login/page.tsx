"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";

const loginProviders = [
  {
    id: "kakao",
    label: "카카오 로그인",
    iconSrc: "/assets/icons/icon_social_kakao_default_24.svg",
    iconClassName: "h-6 w-6",
    buttonClassName: "bg-[#FEE500] text-black/85 hover:bg-[#F4DC00]",
  },
  {
    id: "apple",
    label: "Apple 로그인",
    iconSrc: "/assets/icons/icon_social_apple_default_24.svg",
    iconClassName: "h-6 w-6",
    buttonClassName: "bg-black text-white hover:bg-[#333333]",
  },
  {
    id: "google",
    label: "Google 로그인",
    iconSrc: "/assets/icons/icon_social_google_default_24.svg",
    iconClassName: "h-5 w-5",
    buttonClassName: "border border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F8F9FA]",
  },
] as const;

type LoginProvider = (typeof loginProviders)[number];

function TreasureLogo() {
  return (
    <span aria-hidden="true" className="flex h-32 w-32 items-center justify-center">
      <span
        className="block h-28 w-32 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/icons/icon_treasure_chest_rough_default_32.svg')" }}
      />
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<LoginProvider["id"] | null>(null);

  const handleMockLogin = (provider: LoginProvider) => {
    console.log(`[CatchCash] mock ${provider.id} login`);
    setSelectedProvider(provider.id);

    window.setTimeout(() => {
      router.push("/nickname");
    }, 450);
  };

  const handleLogin = async (provider: LoginProvider) => {
    if (provider.id !== "google") {
      handleMockLogin(provider);
      return;
    }

    const client = getSupabaseBrowserClientOrNull();
    if (!client) {
      handleMockLogin(provider);
      return;
    }

    setSelectedProvider(provider.id);

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/nickname`,
        },
      });

      if (error) {
        console.error("[CatchCash] google login failed", error);
        handleMockLogin(provider);
      }
    } catch (error) {
      console.error("[CatchCash] google login failed", error);
      handleMockLogin(provider);
    }
  };

  return (
    <section
      aria-label="캐치캐쉬 로그인"
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#F7F5EF] text-[#050505]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <span className="absolute -left-1 top-[44px] h-[355px] w-[78px] skew-x-[-8deg] border-l-[3px] border-r-[3px] border-[#050505]" />
        <span className="absolute left-[83px] top-[165px] h-[103px] w-[3px] -rotate-12 bg-[#050505]" />
        <span className="absolute left-[77px] top-[210px] h-[6px] w-[3px] -rotate-12 bg-[#050505]" />
        <span className="absolute left-[104px] top-[287px] h-[9px] w-[3px] -rotate-[18deg] bg-[#050505]" />
        <span className="absolute left-[140px] top-[474px] h-[9px] w-[3px] -rotate-[30deg] bg-[#050505]" />
        <span className="absolute left-[173px] top-[619px] h-[4px] w-[4px] rounded-full bg-[#050505]" />
        <span className="absolute left-[191px] top-[698px] h-[18px] w-[8px] rounded-full bg-[#050505]" />
        <span className="absolute right-[36px] top-[88px] h-[710px] w-[8px] border-r-[5px] border-dashed border-[#050505]" />
        <span className="absolute right-[-24px] bottom-[-92px] h-[368px] w-[84px] rotate-12 border-l-[3px] border-r-[3px] border-[#050505]" />
        <span className="absolute right-[71px] top-[521px] h-[18px] w-[8px] rounded-full bg-[#050505]" />
      </div>

      <main className="relative flex min-h-[884px] flex-1 flex-col items-center px-5 pb-16 pt-[138px]">
        <div className="flex flex-col items-center">
          <TreasureLogo />
          <h1 className="mt-4 text-2xl font-bold leading-6 tracking-[-0.4px] text-black">
            catchcash
          </h1>
          <p className="mt-2 text-center text-[15px] font-medium leading-6 text-[#4C4546]/80">
            현실에 숨겨둔 보물, 찾을 자신 있냐?
          </p>
        </div>

        <div className="mt-[93px] flex w-full max-w-[350px] flex-col gap-3">
          {loginProviders.map((provider) => {
            const isLoading = selectedProvider === provider.id;

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => void handleLogin(provider)}
                disabled={selectedProvider !== null}
                className={`flex h-12 w-full items-center justify-center gap-3 rounded-[6px] px-4 text-base font-medium leading-none transition-colors disabled:cursor-wait disabled:opacity-70 ${provider.buttonClassName}`}
              >
                <span className="inline-flex items-center justify-center gap-4">
                  <img
                    src={provider.iconSrc}
                    alt=""
                    aria-hidden="true"
                    className={`shrink-0 object-contain transition-none ${provider.iconClassName}`}
                  />
                  <span>{isLoading ? "탐험 준비 중..." : provider.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </section>
  );
}
