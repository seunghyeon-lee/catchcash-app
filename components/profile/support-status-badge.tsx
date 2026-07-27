import { SUPPORT_STATUS_LABEL, type SupportStatus } from "@/lib/profile/support-mock";

/**
 * 문의 카드 상태 배지 — `15_1_Support_Inquiry_List_Screen` (Figma `36:62` / `36:71`)
 *
 * 정의서 4-3·4-4는 배지 배경을 전용 에셋으로 지정하지만 Figma 시안은 CSS 사각형이라
 * 그대로 재현한다. 모서리 반경이 네 귀퉁이 모두 다른 건 rough 손그림 뉘앙스를 준 것.
 */
export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  const resolved = status === "resolved";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-bl-[1px] rounded-br-[3px] rounded-tl-[2px] rounded-tr-[1px] border-2 border-black px-3.5 py-1.5 text-xs uppercase leading-[16.8px] tracking-[0.6px] ${
        resolved ? "bg-black text-white" : "bg-[#f7f5ef] text-black"
      }`}
    >
      {SUPPORT_STATUS_LABEL[status]}
    </span>
  );
}
