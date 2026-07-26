"use client";

/* eslint-disable @next/next/no-img-element */
import { useParams, useRouter } from "next/navigation";

import { BottomTab } from "@/components/bottom-tab";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { SupportStatusBadge } from "@/components/profile/support-status-badge";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { findInquiry, SUPPORT_ANSWER_WAITING } from "@/lib/profile/support-mock";

const { frames } = PROFILE_ASSETS;

/**
 * 문의 상세 — `15_2_Support_Inquiry_Detail_Screen` (`/support/[inquiryId]`)
 *
 * 정의서가 지정한 카드/배지/버튼 전용 에셋은 Figma에 시안이 아직 없어
 * 앱에 이미 쓰는 rough CSS로 재현했다. 에셋이 나오면 프레임만 교체하면 된다.
 */
export default function SupportDetailPage() {
  const router = useRouter();
  const params = useParams<{ inquiryId: string }>();
  const inquiry = findInquiry(params.inquiryId);

  const goList = () => router.push("/support");

  if (!inquiry) {
    return (
      <>
        <section className="min-h-screen bg-[#f7f5ef] pb-28">
          <ProfileTopAppBar backHref="/support" />
          <div className="px-5 pt-16 text-center">
            <p className="text-base font-bold text-black">그런 문의는 없다.</p>
            <p className="mt-2 text-sm text-[#5d5f5f]">목록에서 다시 골라봐.</p>
            <button
              type="button"
              onClick={goList}
              className="mt-8 block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <RoughImageFrame src={frames.supportSubmitButton} className="w-full">
                <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-white">
                  목록으로
                </span>
              </RoughImageFrame>
            </button>
          </div>
        </section>
        <BottomTab />
      </>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-[#f7f5ef] pb-28">
        <ProfileTopAppBar backHref="/support" />

        <div className="px-5 pt-7">
          <h2 className="text-2xl font-bold leading-[31.2px] text-black">뭐라카노 답변</h2>

          <div className="mt-4 flex justify-center">
            <SupportStatusBadge status={inquiry.status} size="md" />
          </div>

          {/* 사용자 문의 카드 */}
          <div className="mt-6 rounded-md border-[3px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-black">내가 쓴 거</span>
              <span className="text-xs tracking-[0.6px] text-[#5d5f5f]">{inquiry.date}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-base leading-6 text-black">{inquiry.question}</p>
          </div>

          {/* 관리자 답변 카드 */}
          <div className="mt-5 rounded-md border-[3px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
            <span className="inline-flex rounded border-2 border-black bg-black px-3 py-1 text-xs font-bold text-white">
              관리자의 대답
            </span>
            <p className="mt-3 whitespace-pre-wrap text-base leading-6 text-black">
              {inquiry.answer ?? SUPPORT_ANSWER_WAITING}
            </p>
          </div>

          <button
            type="button"
            onClick={goList}
            className="mt-8 block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <RoughImageFrame src={frames.supportSubmitButton} className="w-full">
              <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-white">
                알았다 (뒤로가기)
              </span>
            </RoughImageFrame>
          </button>
        </div>
      </section>

      <BottomTab />
    </>
  );
}
