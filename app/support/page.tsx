"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

import { BottomTab } from "@/components/bottom-tab";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { SupportStatusBadge } from "@/components/profile/support-status-badge";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { MOCK_SUPPORT_INQUIRIES } from "@/lib/profile/support-mock";

const { frames } = PROFILE_ASSETS;

/**
 * 문의 내역 리스트 — `15_1_Support_Inquiry_List_Screen` (`/support`)
 *
 * 정의서가 지정한 카드/배지 전용 에셋(`ui_frame_support_inquiry_card_*`,
 * `ui_badge_support_status_*`, `ui_frame_support_write_button_*`)은 Figma에 시안이 아직 없다.
 * 앱에 이미 쓰는 rough CSS(검정 3px 테두리 + 하드 섀도)로 재현했고, 에셋이 나오면 교체하면 된다.
 */
export default function SupportListPage() {
  const router = useRouter();

  return (
    <>
      <section className="min-h-screen bg-[#f7f5ef] pb-28">
        <ProfileTopAppBar backHref="/profile" />

        <div className="px-5 pt-7">
          <h2 className="text-2xl font-bold leading-[31.2px] text-black">뭔 일 있었냐?</h2>
          <span aria-hidden="true" className="mt-2 block h-1 w-14 rounded-full bg-black" />

          {MOCK_SUPPORT_INQUIRIES.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[#5d5f5f]">아직 남긴 문의가 없다.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {MOCK_SUPPORT_INQUIRIES.map((inquiry) => (
                <li key={inquiry.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/support/${inquiry.id}`)}
                    className="block w-full rounded-md border-[3px] border-black bg-white p-4 text-left shadow-[4px_4px_0_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <p className="line-clamp-2 text-base font-bold leading-6 text-black">{inquiry.title}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs tracking-[0.6px] text-[#5d5f5f]">{inquiry.date}</span>
                      <SupportStatusBadge status={inquiry.status} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => router.push("/support/new")}
            className="mt-8 block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <RoughImageFrame src={frames.supportSubmitButton} className="w-full">
              <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-white">문의하기</span>
            </RoughImageFrame>
          </button>
        </div>
      </section>

      <BottomTab />
    </>
  );
}
