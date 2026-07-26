import { SUPPORT_STATUS_LABEL, type SupportStatus } from "@/lib/profile/support-mock";

/**
 * 문의 상태 배지.
 * 정의서는 `ui_badge_support_status_{resolved_black,reading_white}_rough_*.svg` 에셋을 지정하지만
 * Figma에 해당 시안·에셋이 아직 없어, 앱에 이미 쓰는 rough CSS(검정 테두리 + 하드 섀도)로 재현했다.
 * 에셋이 나오면 이 컴포넌트만 교체하면 된다.
 */
export function SupportStatusBadge({ status, size = "sm" }: { status: SupportStatus; size?: "sm" | "md" }) {
  const resolved = status === "resolved";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-black font-bold ${
        size === "md" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs"
      } ${resolved ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {SUPPORT_STATUS_LABEL[status]}
    </span>
  );
}
