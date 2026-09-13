"use client";

/**
 * 하단 AR 상태 배지(공식 명세 6·18장).
 * 문구는 실제 월드 트래킹을 뜻하지 않으므로 "AR 사냥 모드 활성화"를 사용한다(18.2 권장).
 */
export function ARStatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+32px)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[4px] border-2 border-black bg-[#f9f9f9] px-6 py-2.5 shadow-[4px_4px_0px_black]">
      <span className={`size-3 rounded-full ${active ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
      <span className="text-base font-medium uppercase tracking-[-0.8px] text-[#1a1c1c]">{label}</span>
    </div>
  );
}
