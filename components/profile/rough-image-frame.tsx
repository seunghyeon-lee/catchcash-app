/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";

/**
 * Figma rough 프레임 SVG를 배경처럼 깔고 그 위에 내용을 올린다.
 * export 된 SVG는 preserveAspectRatio="none" 이라 컨테이너 크기에 맞춰 늘어난다.
 */
export function RoughImageFrame({
  src,
  className = "",
  style,
  children,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      <img src={src} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 block size-full" />
      <div className="relative">{children}</div>
    </div>
  );
}
