"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomTab } from "@/components/bottom-tab";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { SupportStatusBadge } from "@/components/profile/support-status-badge";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { MOCK_SUPPORT_INQUIRIES, type SupportInquiry } from "@/lib/profile/support-mock";
import { getAuthenticatedSupportSession, toSupportInquiry } from "@/lib/profile/support-service";

const { frames } = PROFILE_ASSETS;

/** 문의 내역 리스트 — `15_1_Support_Inquiry_List_Screen` (`/support`) */
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
      <section className="min-h-screen bg-[#f7f5ef] pb-28">
        <ProfileTopAppBar backHref="/profile" />

        <div className="px-5 pt-7">
          <h2 className="text-2xl font-bold leading-[31.2px] text-black">뭔 일 있었냐?</h2>
          <span aria-hidden="true" className="mt-2 block h-1 w-14 rounded-full bg-black" />

          {isMockFallback ? (
            <p className="mt-4 text-xs leading-5 text-[#5d5f5f]">로그인 연결 전이라 예시 문의를 보여주고 있어.</p>
          ) : null}
          {loadError ? <p className="mt-4 text-sm text-[#b42318]">{loadError}</p> : null}

          {isLoading ? (
            <p className="mt-10 text-center text-sm text-[#5d5f5f]">문의 내역을 불러오는 중이야.</p>
          ) : inquiries.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[#5d5f5f]">아직 남긴 문의가 없다.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {inquiries.map((inquiry) => (
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
