"use client";

/** 카메라 로딩 / 보상 확인 중 등 대기 상태 오버레이(공식 명세 6·19장). */
export function ARLoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/60">
      <div className="size-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <p className="text-lg font-medium text-white">{message}</p>
    </div>
  );
}
