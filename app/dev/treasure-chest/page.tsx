"use client";

/**
 * 개발/QA 전용 페이지 — TreasureChest3D 동작 확인용.
 * [Basic][Gold][Mystery] + [WIN][LOSE] + [RESET] + 상태 표시.
 * 실제 랜덤/당첨 로직 없음. result는 버튼으로 강제. (문서 20절)
 *
 * ⚠️ 현재 chest.glb는 개발용 임시 에셋(Quaternius, CC0). 최종 에셋 아님.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import type { ChestVariant, ChestResult, CoinMode } from "@/lib/hunt/treasure-chest-config";

// R3F Canvas는 WebGL이라 SSR 불가 → 클라이언트에서만 로드
const TreasureChestScene = dynamic(
  () => import("@/components/hunt/TreasureChestScene").then((m) => m.TreasureChestScene),
  { ssr: false, loading: () => <SceneLoading /> },
);

function SceneLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
      3D 로딩 중…
    </div>
  );
}

const VARIANTS: ChestVariant[] = ["basic", "gold", "mystery"];
const VARIANT_LABEL: Record<ChestVariant, string> = {
  basic: "Basic",
  gold: "Gold",
  mystery: "Mystery",
};

type Status = "idle" | "opening" | "opened";
const STATUS_LABEL: Record<Status, string> = {
  idle: "대기 (idle)",
  opening: "여는 중…",
  opened: "열림 완료 ✅",
};

export default function TreasureChestDevPage() {
  // 개발/QA 전용 페이지 — production 빌드에서는 경로를 노출하지 않고 404 처리한다.
  // (process.env.NODE_ENV는 빌드 시 상수로 치환되어 dev에서만 아래 렌더가 실행됨)
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [variant, setVariant] = useState<ChestVariant>("basic");
  const [result, setResult] = useState<ChestResult>("win");
  const [coinMode, setCoinMode] = useState<CoinMode>("burst");
  const [controls, setControls] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [completeCount, setCompleteCount] = useState(0);
  const [controlled, setControlled] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  const [tapped, setTapped] = useState(false); // controlled에서 탭됨(열림 승인 대기)

  const handleReset = () => {
    setStatus("idle");
    setTapped(false);
    setResetKey((k) => k + 1);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#12131a] text-white">
      {/* 헤더 */}
      <header className="px-5 pb-2 pt-5">
        <h1 className="text-lg font-semibold">보물상자 3D 테스트</h1>
        <p className="mt-1 text-xs text-amber-300/80">
          ⚠️ 임시 에셋(Quaternius, CC0) · 최종 에셋 아님 · 리더 확정 시 교체
        </p>
      </header>

      {/* 3D 뷰어 */}
      <div className="relative mx-5 aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-[#2a3242] to-[#151922]">
        <TreasureChestScene
          variant={variant}
          result={result}
          resetNonce={resetKey}
          coinMode={coinMode}
          controlled={controlled}
          openSignal={openSignal}
          onTap={() => {
            if (controlled) setTapped(true);
          }}
          enableControls={controls}
          onOpenStart={() => {
            setStatus("opening");
            setTapped(false);
          }}
          onOpenComplete={() => {
            setStatus("opened");
            setCompleteCount((c) => c + 1);
          }}
        />
        {/* 상태 배지 */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium backdrop-blur">
          {STATUS_LABEL[status]}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] text-white/50">
          {controlled ? "탭 → '열림 승인' 눌러야 열림" : "상자를 탭하면 열립니다"}
          {controls ? " · 드래그로 회전" : ""}
        </div>
      </div>

      {/* 컨트롤 */}
      <section className="flex flex-col gap-4 px-5 py-5">
        <ControlRow label="스타일">
          {VARIANTS.map((v) => (
            <Btn key={v} active={variant === v} onClick={() => setVariant(v)}>
              {VARIANT_LABEL[v]}
            </Btn>
          ))}
        </ControlRow>

        <ControlRow label="결과">
          <Btn active={result === "win"} onClick={() => setResult("win")}>
            WIN
          </Btn>
          <Btn active={result === "lose"} onClick={() => setResult("lose")}>
            LOSE
          </Btn>
        </ControlRow>

        <ControlRow label="코인">
          <Btn
            active={coinMode === "burst"}
            onClick={() => {
              setCoinMode("burst");
              handleReset();
            }}
          >
            퍼짐(burst)
          </Btn>
          <Btn
            active={coinMode === "none"}
            onClick={() => {
              setCoinMode("none");
              handleReset();
            }}
          >
            없음
          </Btn>
        </ControlRow>

        <ControlRow label="제어">
          <Btn
            active={controlled}
            onClick={() => {
              setControlled((c) => !c);
              handleReset();
            }}
          >
            controlled {controlled ? "ON" : "OFF"}
          </Btn>
          {controlled && (
            <Btn active={false} onClick={() => setOpenSignal((k) => k + 1)}>
              열림 승인 (openSignal)
            </Btn>
          )}
        </ControlRow>

        <ControlRow label="옵션">
          <Btn active={controls} onClick={() => setControls((c) => !c)}>
            카메라 조작 {controls ? "ON" : "OFF"}
          </Btn>
          <Btn active={false} onClick={handleReset}>
            RESET
          </Btn>
        </ControlRow>

        {/* 콜백 로그 */}
        <div className="mt-1 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-white/70">
          <div>
            현재 상태: <span className="text-white">{STATUS_LABEL[status]}</span>
          </div>
          <div>
            onOpenComplete 호출 횟수: <span className="text-white">{completeCount}</span>
            <span className="text-white/40"> (열림 1회당 정확히 +1이어야 정상)</span>
          </div>
          {controlled && (
            <div className="mt-1">
              controlled 탭 상태:{" "}
              <span className="text-white">{tapped ? "감지됨 (열림 승인 대기)" : "대기"}</span>
              <span className="text-white/40"> · 승인 안 하면 상자는 idle 유지(운영 실패 시뮬레이션)</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs text-white/50">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Btn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition " +
        (active
          ? "bg-amber-400 text-black"
          : "bg-white/10 text-white/80 hover:bg-white/20")
      }
    >
      {children}
    </button>
  );
}
