"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SPLASH_DURATION_MS = 1500;

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace("/login");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(redirectTimer);
  }, [router]);

  return (
    <>
      <style>{`
        @keyframes splash-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-progress-fill {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>

      <section
        aria-label="캐치캐쉬 스플래시 화면"
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#F7F5EF] px-8 text-[#171717]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
          <span className="absolute left-[12%] top-[24%] h-2 w-2 rounded-full bg-[#171717]" />
          <span className="absolute right-[14%] top-[31%] h-3 w-3 rounded-full border-2 border-[#171717]" />
          <span className="absolute bottom-[24%] left-[18%] h-1.5 w-1.5 rounded-full bg-[#171717]" />
          <span className="absolute bottom-[18%] right-[20%] h-2 w-2 rotate-45 border border-[#171717]" />
        </div>

        <div className="relative flex w-full max-w-[290px] flex-col items-center text-center">
          <div className="relative mb-8 h-24 w-28 -rotate-2" aria-hidden="true">
            <div className="absolute bottom-0 left-1/2 h-14 w-24 -translate-x-1/2 rounded-[0.35rem] border-[3px] border-[#171717] bg-[#F7F5EF] shadow-[5px_5px_0_#171717]" />
            <div className="absolute left-1/2 top-7 h-7 w-28 -translate-x-1/2 -rotate-3 rounded-[0.35rem] border-[3px] border-[#171717] bg-[#F7F5EF]" />
            <div className="absolute left-1/2 top-4 h-4 w-11 -translate-x-1/2 rounded-full border-[3px] border-[#171717] bg-[#F7F5EF]" />
            <span className="absolute bottom-5 left-1/2 h-4 w-3 -translate-x-1/2 rounded-sm border-2 border-[#171717]" />
          </div>

          <div className="relative">
            <span aria-hidden="true" className="absolute -left-5 -top-3 text-2xl font-black">✦</span>
            <h1 className="font-mono text-[2.4rem] font-black tracking-[-0.09em]">catchcash</h1>
            <span aria-hidden="true" className="absolute -right-5 bottom-1 text-xl">✧</span>
          </div>

          <p className="mt-3 text-sm font-medium tracking-[-0.02em]">현실에서 빛나는 상자를 찾아라</p>

          <div className="mt-16 w-full">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full border-2 border-[#171717] bg-transparent p-0.5"
              role="progressbar"
              aria-label="캐치캐쉬 로딩 중"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
            >
              <div
                className="splash-progress-fill h-full origin-left rounded-full bg-[#171717]"
                style={{ animation: "splash-progress 1.5s linear forwards" }}
              />
            </div>
            <p className="mt-3 text-xs font-bold tracking-[0.18em]">생각 중...</p>
          </div>
        </div>

        <p className="absolute bottom-7 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
          find your catch
        </p>
      </section>
    </>
  );
}
