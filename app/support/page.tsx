"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BottomNav } from "@/components/hunt/bottom-nav";
import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { SupportStatusBadge } from "@/components/profile/support-status-badge";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { MOCK_SUPPORT_INQUIRIES, type SupportInquiry } from "@/lib/profile/support-mock";
import { getAuthenticatedSupportSession, toSupportInquiry } from "@/lib/profile/support-service";

const { masks, images } = PROFILE_ASSETS;

/**
 * 리스트 카드 실루엣.
 *
 * 정의서 4-1·4-2가 지정한 전용 카드 에셋이 아직 없어서(handoff D-1) 상세 화면(15_2)의
 * 카드 마스크 2종을 번갈아 쓴다. 한 종류만 쓰면 카드가 전부 같은 방향으로 기울어
 * 손그림이 아니라 도장을 찍은 것처럼 보인다.
 *
 * `user` 마스크만 좌상단이 (3.5, 1.675)에서 시작하게 export 돼서 그대로 씌우면
 * 검은 테두리가 통째로 잘린다 → 그만큼 마스크를 키워 바깥으로 민다. (상세 화면과 동일한 보정)
 */
const CARD_MASKS = [
  {
    src: masks.supportUserQuestionCard,
    maskSize: "calc(100% + 7px) calc(100% + 3.5px)",
    maskPosition: "-3.5px -1.75px",
  },
  { src: masks.supportAdminReplyCard },
] as const;

/**
 * 문의 내역 리스트 — `15_1_Support_Inquiry_List_Screen` (`/support`)
 * Figma: `15_1_Support_Inquiry_List_Screen` (`36:3`)
 *
 * 카드·배지·CTA는 정의서가 전용 에셋으로 지정했지만 에셋이 없어, 상세 화면이 쓰는
 * rough 마스크를 재사용해 세 화면의 실루엣을 맞춘다. 타이틀 밑줄도 같은 방식이다.
 *
 * 데이터는 Supabase `support_inquiries` 에서 읽는다. 세션이 없으면(로그인 연동 전)
 * mock 목록을 그대로 보여준다 — `lib/profile/support-service.ts` 참고.
 */
export default function SupportListPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<SupportInquiry[]>(MOCK_SUPPORT_INQUIRIES);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMockFallback, setIsMockFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInquiries = async () => {
      const session = await getAuthenticatedSupportSession();

      if (!isMounted) return;

      if (!session) {
        setIsMockFallback(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await session.client
        .from("support_inquiries")
        .select("id, title, content, status, created_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setInquiries([]);
        setLoadError("문의 내역을 불러오지 못했어. 잠시 후 다시 확인해줘.");
      } else {
        setInquiries((data ?? []).map((inquiry) => toSupportInquiry(inquiry)));
      }
      setIsLoading(false);
    };

    void loadInquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section
        className="min-h-screen bg-[#f7f5ef] bg-[length:523px_384px] bg-repeat pb-28"
        style={{ backgroundImage: `url("${images.supportPaperGrain}")` }}
      >
        <ProfileTopAppBar backHref="/profile" />

        <div className="flex flex-col gap-8 px-5 pt-8">
          {/* 타이틀 */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[32px] leading-[38.4px] text-[#1b1b1b]">뭔 일 있었냐?</h2>
            <RoughMaskFrame src={masks.supportTitleUnderline} className="h-0.5 w-24 bg-black" />
          </div>

          {/* 안내 문구 + 문의 리스트 (바깥 gap-8 과 분리하려고 한 겹 묶는다) */}
          <div className="flex flex-col gap-4">
            {isMockFallback ? (
              <p className="text-xs leading-5 text-[#5d5f5f]">로그인 연결 전이라 예시 문의를 보여주고 있어.</p>
            ) : null}
            {loadError ? <p className="text-sm leading-5 text-[#b42318]">{loadError}</p> : null}

            {isLoading ? (
              <p className="py-10 text-center text-base text-[#5d5f5f]">문의 내역을 불러오는 중이야.</p>
            ) : inquiries.length === 0 ? (
              <p className="py-10 text-center text-base text-[#5d5f5f]">아직 남긴 문의가 없다.</p>
            ) : (
              <ul className="flex flex-col gap-6">
                {inquiries.map((inquiry, index) => (
                  <li key={inquiry.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/support/${inquiry.id}`)}
                      className="block w-full text-left transition-transform active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <RoughMaskFrame
                        {...CARD_MASKS[index % CARD_MASKS.length]}
                        dropShadow="4px 4px 0 #000"
                        className="flex flex-col gap-4 border-2 border-black bg-white p-[22px]"
                      >
                        <div className="flex w-full items-start justify-between">
                          <h3 className="line-clamp-2 text-2xl leading-[30px] text-[#1b1b1b]">{inquiry.title}</h3>
                          <span className="ml-4 shrink-0 text-sm leading-[19.6px] tracking-[0.7px] text-[#1b1b1b]">
                            {inquiry.date}
                          </span>
                        </div>
                        <SupportStatusBadge status={inquiry.status} />
                      </RoughMaskFrame>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 하단 CTA — 상세 화면의 `알았다 (뒤로가기)` 와 같은 마스크를 써서 검정 CTA 모양을 통일한다 */}
          <button
            type="button"
            onClick={() => router.push("/support/new")}
            className="w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <RoughMaskFrame
              src={masks.supportDetailBackButton}
              className="flex items-center justify-center bg-black py-6 text-2xl uppercase leading-[31.2px] tracking-[2.4px] text-white"
            >
              문의하기
            </RoughMaskFrame>
          </button>
        </div>
      </section>

      <BottomNav active="myinfo" />
    </>
  );
}
