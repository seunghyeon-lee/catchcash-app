"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_CATEGORY_LABEL, ADMIN_STATUS_LABEL, formatAdminDate, type AdminSupportInquiry } from "@/lib/admin/mock-inquiries";
import { createAdminSupportReply, loadAdminInquiry, type AdminInquiryDataSource } from "@/lib/admin/support-service";

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<AdminSupportInquiry | undefined>();
  const [source, setSource] = useState<AdminInquiryDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await loadAdminInquiry(id);
      setInquiry(result.inquiry);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch {
      setInquiry(undefined);
      setSource(null);
      setMessage("문의 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReply = async () => {
    if (!inquiry || answer.trim().length < 2 || isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await createAdminSupportReply(inquiry, answer.trim());
      if (result.source === "mock") {
        setInquiry({
          ...inquiry,
          status: "resolved",
          updated_at: new Date().toISOString(),
          replies: [{ id: `mock-${Date.now()}`, inquiry_id: inquiry.id, admin_user_id: "mock-admin", admin_name: "Mock 관리자", content: answer.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...inquiry.replies],
        });
        setAnswer("");
        setMessage("관리자 인증 전이라 예시 답변으로만 처리했습니다. DB에는 저장되지 않았습니다.");
        return;
      }

      setAnswer("");
      await load();
      setMessage(result.notificationVerified ? "답변을 등록했고, 문의 해결 및 사용자 알림 생성을 확인했습니다." : "답변을 등록했고 문의 해결 상태를 확인했습니다. 사용자 알림 생성 여부는 DB에서 확인해 주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? `답변 등록에 실패했습니다: ${error.message}` : "답변 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <AdminShell><p className="text-sm text-[#6b7280]">문의 정보를 불러오는 중입니다.</p></AdminShell>;
  if (!inquiry) return <AdminShell><h1 className="text-2xl font-bold">문의를 찾을 수 없습니다.</h1><p className="mt-2 text-sm text-[#6b7280]">삭제되었거나 접근할 수 없는 문의입니다.</p>{message ? <p role="alert" className="mt-3 text-sm text-[#b91c1c]">{message}</p> : null}<div className="mt-6 flex gap-3"><button onClick={() => void load()} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">다시 시도</button><Link href="/admin/inquiries" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">문의 목록으로</Link></div></AdminShell>;

  return (
    <AdminShell>
      <div className="flex items-start justify-between"><div><p className="text-sm text-[#6b7280]">문의 관리</p><h1 className="mt-1 text-2xl font-bold">문의 상세</h1></div><Link href="/admin/inquiries" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium">문의 목록으로</Link></div>
      {message ? <div role="status" className={`mt-5 rounded-lg border px-4 py-3 text-sm ${source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"}`}>{message}</div> : null}
      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_280px] gap-6"><div className="space-y-5">
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-[#6b7280]">{ADMIN_CATEGORY_LABEL[inquiry.category]}</p><h2 className="mt-2 text-xl font-bold">{inquiry.title}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${inquiry.status === "resolved" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{ADMIN_STATUS_LABEL[inquiry.status]}</span></div><dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#f3f4f6] pt-5 text-sm"><div><dt className="text-[#6b7280]">작성자</dt><dd className="mt-1 font-medium">{inquiry.user_nickname} <span className="font-mono text-xs text-[#6b7280]">{inquiry.user_id.slice(0, 8)}</span></dd></div><div><dt className="text-[#6b7280]">접수 시각</dt><dd className="mt-1 font-medium">{formatAdminDate(inquiry.created_at)}</dd></div><div><dt className="text-[#6b7280]">답변 여부</dt><dd className="mt-1 font-medium">{inquiry.replies.length ? "답변 완료" : "답변 전"}</dd></div><div><dt className="text-[#6b7280]">최근 수정</dt><dd className="mt-1 font-medium">{formatAdminDate(inquiry.updated_at)}</dd></div></dl></section>
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><h2 className="font-semibold">문의 본문</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{inquiry.content}</p></section>
        {inquiry.replies.map((reply) => <section key={reply.id} className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">등록된 답변</h2><span className="text-xs text-[#6b7280]">{reply.admin_name} · {formatAdminDate(reply.created_at)}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{reply.content}</p></section>)}
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">답변 작성</h2><p className="mt-1 text-sm text-[#6b7280]">사용자에게 전달할 답변을 입력하세요.</p></div>{source === "mock" ? <span className="rounded bg-[#f3f4f6] px-2 py-1 text-xs text-[#6b7280]">Mock fallback</span> : null}</div><label htmlFor="answer" className="sr-only">답변 내용</label><textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={2000} placeholder="사용자에게 전달할 답변을 입력하세요." className="mt-4 min-h-36 w-full resize-y rounded-md border border-[#d1d5db] p-3 text-sm outline-none focus:border-[#111827]" /><div className="mt-3 flex items-center justify-between"><span className="text-xs text-[#6b7280]">{answer.length} / 2000</span><button disabled={answer.trim().length < 2 || isSubmitting} onClick={() => void handleReply()} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? "등록 중..." : "답변 등록"}</button></div></section>
      </div><aside className="space-y-5"><section className="rounded-lg border border-[#e5e7eb] bg-white p-5"><h2 className="font-semibold">문의 처리 현황</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-[#6b7280]">첫 답변 시각</dt><dd className="mt-1">{inquiry.replies[0] ? formatAdminDate(inquiry.replies[0].created_at) : "-"}</dd></div><div><dt className="text-[#6b7280]">최근 상태</dt><dd className="mt-1">{ADMIN_STATUS_LABEL[inquiry.status]}</dd></div><div><dt className="text-[#6b7280]">담당 운영자</dt><dd className="mt-1">{inquiry.replies[0]?.admin_name ?? "미지정"}</dd></div></dl></section><section className="rounded-lg border border-[#e5e7eb] bg-white p-5"><h2 className="font-semibold">연관 정보</h2><p className="mt-3 text-sm text-[#6b7280]">현재 데이터에는 연관 보상·보물 정보가 없습니다.</p></section></aside></div>
    </AdminShell>
  );
}
