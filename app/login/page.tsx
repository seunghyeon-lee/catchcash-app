"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const loginProviders = [
  { id: "google", label: "Google로 계속하기", mark: "G" },
  { id: "kakao", label: "Kakao로 계속하기", mark: "K" },
  { id: "apple", label: "Apple로 계속하기", mark: "●" },
] as const;

type LoginProvider = (typeof loginProviders)[number];

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

  return (
    <section
      aria-label="캐치캐쉬 로그인"
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#F7F5EF] px-7 pb-8 pt-10 text-[#171717]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
        <span className="absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-[#171717]" />
        <span className="absolute right-[12%] top-[20%] h-3 w-3 rotate-45 border-2 border-[#171717]" />
        <span className="absolute bottom-[25%] left-[7%] text-xl">✦</span>
        <span className="absolute bottom-[19%] right-[10%] h-2 w-2 rounded-full border-2 border-[#171717]" />
      </div>

      <header className="relative flex items-center justify-between">
        <p className="font-mono text-xl font-black tracking-[-0.08em]">catchcash</p>
        <span aria-hidden="true" className="rotate-6 text-2xl">✧</span>
      </header>

      <main className="relative flex flex-1 flex-col justify-center">
        <div className="mb-11">
          <div aria-hidden="true" className="mb-7 flex items-end gap-1.5">
            <span className="h-11 w-11 -rotate-6 rounded-full border-[3px] border-[#171717] bg-[#F7F5EF]" />
            <span className="mb-1 h-8 w-8 rotate-6 rounded-[0.4rem] border-[3px] border-[#171717] bg-[#F7F5EF]" />
            <span className="mb-5 h-4 w-4 rounded-full border-[3px] border-[#171717]" />
          </div>
          <h1 className="max-w-[295px] text-[2rem] font-black leading-[1.2] tracking-[-0.075em]">
            현실에 숨겨둔 보물,
            <br />
            찾을 자신 있냐?
          </h1>
          <p className="mt-4 text-sm font-medium leading-6 text-[#171717]/65">
            잠깐의 로그인 후, 진짜 보물찾기가 시작돼요.
          </p>
        </div>

        <div className="rounded-[1.3rem] border-2 border-[#171717] bg-[#F7F5EF] p-4 shadow-[5px_5px_0_#171717]">
          <p className="mb-3 text-center text-xs font-bold tracking-[0.08em]">3초면 탐험 준비 끝!</p>
          <div className="space-y-3">
            {loginProviders.map((provider) => {
              const isLoading = selectedProvider === provider.id;

              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleMockLogin(provider)}
                  disabled={selectedProvider !== null}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-[#171717] bg-[#F7F5EF] px-4 text-sm font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#171717] text-xs font-black"
                  >
                    {provider.mark}
                  </span>
                  <span>{isLoading ? "탐험 준비 중..." : provider.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <p className="relative text-center text-[11px] font-medium leading-5 text-[#171717]/50">
        로그인은 현재 화면 흐름을 확인하기 위한 mock 동작이에요.
      </p>
    </section>
  );
}
