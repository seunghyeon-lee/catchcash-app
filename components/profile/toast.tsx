// 프로필 플로우 공용 토스트 (UI 상태 안내용).
export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-[480px] justify-center px-6"
    >
      <div className="rounded-xl border-2 border-ink bg-ink px-4 py-3 text-center text-sm font-bold text-paper shadow-[4px_4px_0_#171717]">
        {message}
      </div>
    </div>
  );
}
