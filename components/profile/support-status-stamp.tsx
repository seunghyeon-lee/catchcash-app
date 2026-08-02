import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { SUPPORT_STATUS_LABEL, type SupportStatus } from "@/lib/profile/support-mock";

const { masks } = PROFILE_ASSETS;

/**
 * 문의 상세 상단 상태 도장 — `15_2_Support_Inquiry_Detail_Screen` (Figma `36:145`)
 *
 * 둥근 사각형을 타원 마스크로 잘라 위아래가 좁아지는 "도장" 실루엣을 만든다.
 * 마스크 크기/오프셋은 Figma 값 그대로라 배지 박스 크기도 시안대로 고정한다.
 *
 * Figma에는 `해결됨` 1종만 있지만, 정의서 4-1(해결됨=검정)/4-2(읽는 중=흰색)이 두 상태를
 * 색으로 구분하도록 정의해서 마스크는 공용으로 쓰고 채움색만 바꾼다.
 * 목록 화면 배지(`support-status-badge.tsx`)와 같은 규칙이라 두 화면의 상태 표시가 일치한다.
 */
export function SupportStatusStamp({ status }: { status: SupportStatus }) {
  const resolved = status === "resolved";

  return (
    <div className="flex justify-center">
      <div className="-rotate-3">
        <RoughMaskFrame
          src={masks.supportStatusStamp}
          maskSize="138.327px 105.523px"
          maskPosition="-0.002px -17.674px"
          className={`flex h-[63.19px] w-[135.2px] items-center justify-center rounded-[47.61px] border-4 border-black ${
            resolved ? "bg-black" : "bg-white"
          }`}
        >
          <span
            className={`whitespace-nowrap pb-[4.17px] text-2xl leading-[31.2px] tracking-[2.4px] ${
              resolved ? "text-white" : "text-black"
            }`}
          >
            {SUPPORT_STATUS_LABEL[status]}
          </span>
        </RoughMaskFrame>
      </div>
    </div>
  );
}
