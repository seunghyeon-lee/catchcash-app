"use client";

/**
 * 오류/실패 오버레이(공식 명세 15·16·20장).
 * 권한 거부·미지원·카메라 오류·운영 실패(거리/마감/중복/서버)를 여기서 안내한다.
 * 운영 실패를 "꽝"으로 표시하지 않고 안내 + 재시도/지도 이동만 제공한다.
 */
export function ARErrorFallback({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  description?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/80 px-8 text-center">
      <p className="text-xl font-medium leading-8 text-white">{title}</p>
      {description ? <p className="text-base leading-6 text-white/70">{description}</p> : null}

      <div className="mt-2 flex w-full max-w-[280px] flex-col gap-3">
        {primaryLabel && onPrimary ? (
          <button
            type="button"
            onClick={onPrimary}
            className="h-12 rounded-[4px] border-2 border-black bg-[#f9f9f9] text-base font-medium text-[#1a1c1c] shadow-[3px_3px_0px_black]"
          >
            {primaryLabel}
          </button>
        ) : null}
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="h-12 rounded-[4px] border-2 border-white/50 text-base font-medium text-white"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
