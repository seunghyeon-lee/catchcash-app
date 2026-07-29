"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_CATEGORY_LABEL, ADMIN_STATUS_LABEL, findAdminInquiry, formatAdminDate } from "@/lib/admin/mock-inquiries";

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const inquiry = findAdminInquiry(id);
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!inquiry) return <AdminShell><h1 className="text-2xl font-bold">문의를 찾을 수 없습니다.</h1><p className="mt-2 text-sm text-[#6b7280]">삭제되었거나 접근할 수 없는 문의입니다.</p><Link href="/admin/inquiries" className="mt-6 inline-block rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">문의 목록으로</Link></AdminShell>;

  const reply = inquiry.replies[0];
  return (
    <AdminShell>
      <div className="flex items-start justify-between"><div><p className="text-sm text-[#6b7280]">문의 관리</p><h1 className="mt-1 text-2xl font-bold">문의 상세</h1></div><Link href="/admin/inquiries" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium">문의 목록으로</Link></div>
      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="space-y-5">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-[#6b7280]">{ADMIN_CATEGORY_LABEL[inquiry.category]}</p><h2 className="mt-2 text-xl font-bold">{inquiry.title}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${inquiry.status === "resolved" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{ADMIN_STATUS_LABEL[inquiry.status]}</span></div><dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#f3f4f6] pt-5 text-sm"><div><dt className="text-[#6b7280]">작성자</dt><dd className="mt-1 font-medium">{inquiry.user_nickname} <span className="font-mono text-xs text-[#6b7280]">{inquiry.user_id.slice(0, 8)}</span></dd></div><div><dt className="text-[#6b7280]">접수 시각</dt><dd className="mt-1 font-medium">{formatAdminDate(inquiry.created_at)}</dd></div><div><dt className="text-[#6b7280]">답변 여부</dt><dd className="mt-1 font-medium">{reply ? "답변 완료" : "답변 전"}</dd></div><div><dt className="text-[#6b7280]">최근 수정</dt><dd className="mt-1 font-medium">{formatAdminDate(inquiry.updated_at)}</dd></div></dl></section>
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><h2 className="font-semibold">문의 본문</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{inquiry.content}</p></section>
          {reply ? <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">등록된 답변</h2><span className="text-xs text-[#6b7280]">{reply.admin_name} · {formatAdminDate(reply.created_at)}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{reply.content}</p></section> : null}
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">답변 작성</h2><p className="mt-1 text-sm text-[#6b7280]">사용자에게 전달할 답변을 입력하세요.</p></div><span className="rounded bg-[#f3f4f6] px-2 py-1 text-xs text-[#6b7280]">Mock</span></div><label htmlFor="answer" className="sr-only">답변 내용</label><textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={2000} placeholder="사용자에게 전달할 답변을 입력하세요." className="mt-4 min-h-36 w-full resize-y rounded-md border border-[#d1d5db] p-3 text-sm outline-none focus:border-[#111827]" /><div className="mt-3 flex items-center justify-between"><span className="text-xs text-[#6b7280]">{answer.length} / 2000</span><button disabled={answer.trim().length < 2} onClick={() => setNotice("Mock 화면에서는 답변을 저장하지 않습니다.")} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">답변 등록</button></div>{notice ? <p role="status" className="mt-3 text-sm text-[#2563eb]">{notice}</p> : null}</section>
        </div>
        <aside className="space-y-5"><section className="rounded-lg border border-[#e5e7eb] bg-white p-5"><h2 className="font-semibold">문의 처리 현황</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-[#6b7280]">첫 답변 시각</dt><dd className="mt-1">{reply ? formatAdminDate(reply.created_at) : "-"}</dd></div><div><dt className="text-[#6b7280]">최근 상태</dt><dd className="mt-1">{ADMIN_STATUS_LABEL[inquiry.status]}</dd></div><div><dt className="text-[#6b7280]">담당 운영자</dt><dd className="mt-1">{reply?.admin_name ?? "미지정"}</dd></div></dl></section><section className="rounded-lg border border-[#e5e7eb] bg-white p-5"><h2 className="font-semibold">연관 정보</h2><p className="mt-3 text-sm text-[#6b7280]">현재 mock 데이터에는 연관 보상·보물 정보가 없습니다.</p></section></aside>
      </div>
    </AdminShell>
  );
}
