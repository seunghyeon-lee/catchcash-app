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
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#F7F5EF] px-5 text-black"
      >
        <main className="relative flex flex-col items-center justify-center px-5 text-center">
          <span
            aria-hidden="true"
            className="mb-6 block h-24 w-24 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/brand/logo/brand_logo_catchcash_symbol_default.svg')" }}
          />

          <h1 className="text-2xl font-bold leading-6 tracking-[-0.4px] text-black">catchcash</h1>
          <p className="mt-2 text-[15px] font-medium leading-[25.6px] text-[#5D5F5F]">
            현실에서 빛나는 상자를 찾아라
          </p>
        </main>

        <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 px-5">
          <p className="text-[15px] font-medium uppercase leading-[16.8px] tracking-[1.2px] text-[#5D5F5F]">
            생각 중...
          </p>
          <div
            className="relative h-3 w-[140px] overflow-hidden rounded-[3px] border-2 border-[#171717] bg-transparent"
            role="progressbar"
            aria-label="캐치캐쉬 로딩 중"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div
              className="splash-progress-fill absolute left-[3px] top-1/2 h-[2px] w-[132px] origin-left -translate-y-1/2 rounded-full bg-[#171717]"
              style={{ animation: "splash-progress 1.5s linear forwards" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
