import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { SUPPORT_STATUS_LABEL, type SupportStatus } from "@/lib/profile/support-mock";

const { masks } = PROFILE_ASSETS;

/**
 * 문의 카드 상태 배지 — `15_1_Support_Inquiry_List_Screen` (Figma `36:62` / `36:71`)
 *
 * 정의서 4-3·4-4가 지정한 배지 전용 에셋(sm 2종)이 아직 없다(handoff D-1).
 * 상세 화면의 도장 마스크는 타원이라 이 크기에서는 글자를 먹어서 못 쓰고,
 * 대신 하단 CTA와 같은 사각 마스크를 축소해 "손으로 자른 듯한" 실루엣만 맞춘다.
 *
 * 마스크가 가장자리를 잘라내므로 테두리는 쓰지 않고 배경색으로만 상태를 구분한다.
 * `읽는 중`은 흰 카드 위에 올라가서 흰 배경이면 안 보이므로 안내 박스 톤(`#e8e8e8`)을 쓴다.
 * 에셋이 나오면 이 파일만 교체하면 된다.
 */
export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  const resolved = status === "resolved";

  return (
    <RoughMaskFrame
      src={masks.supportDetailBackButton}
      className={`self-start px-3.5 py-1.5 text-xs uppercase leading-[16.8px] tracking-[0.6px] ${
        resolved ? "bg-black text-white" : "bg-[#e8e8e8] text-black"
      }`}
    >
      {SUPPORT_STATUS_LABEL[status]}
    </RoughMaskFrame>
  );
}
