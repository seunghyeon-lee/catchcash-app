import type { CSSProperties, ReactNode } from "react";

/**
 * Figma "Mask Group" 노드 재현.
 *
 * `RoughImageFrame`이 SVG를 배경으로 깔았다면, 이쪽은 SVG를 mask로 씌운다.
 * 카드/버튼 자체는 CSS(배경·테두리)로 그리고, 살짝 삐뚤어진 사각형 마스크가
 * 테두리를 잘라내면서 손으로 그린 듯한 rough 실루엣이 만들어진다.
 * export 된 마스크 SVG는 `preserveAspectRatio="none"` 이라 `100% 100%`로 늘려 쓴다.
 *
 * `dropShadow`는 마스크된 자식을 감싸는 래퍼에 filter로 건다.
 * 같은 엘리먼트에 걸면 마스크가 그림자까지 잘라내 버리기 때문에,
 * 래퍼에서 잘린 실루엣 기준으로 그림자를 만들어야 Figma와 같은 모양이 나온다.
 */
export function RoughMaskFrame({
  src,
  className = "",
  style,
  maskSize = "100% 100%",
  maskPosition,
  dropShadow,
  children,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
  /** 기본은 컨테이너에 꽉 맞춤. Figma가 별도 mask-size를 지정한 경우만 넘긴다. */
  maskSize?: string;
  maskPosition?: string;
  /** 예: `8px 8px 0 #000` */
  dropShadow?: string;
  children?: ReactNode;
}) {
  const maskStyle: CSSProperties = {
    ...style,
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskSize,
    WebkitMaskSize: maskSize,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    // Figma 값은 테두리 포함 기준이다. `-webkit-mask-origin` 기본값이 padding-box인
    // 구형 WebKit에서 테두리 두께만큼 어긋나므로 명시한다.
    maskOrigin: "border-box",
    WebkitMaskOrigin: "border-box",
    ...(maskPosition ? { maskPosition, WebkitMaskPosition: maskPosition } : null),
  };

  const masked = (
    <div className={className} style={maskStyle}>
      {children}
    </div>
  );

  if (!dropShadow) return masked;

  return <div style={{ filter: `drop-shadow(${dropShadow})` }}>{masked}</div>;
}
