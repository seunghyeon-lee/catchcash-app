"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_CATEGORY_LABEL, ADMIN_STATUS_LABEL, formatAdminDate, MOCK_ADMIN_INQUIRIES, type AdminInquiryStatus, type AdminSupportInquiry } from "@/lib/admin/mock-inquiries";

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AdminInquiryStatus>("all");
  const [selected, setSelected] = useState<AdminSupportInquiry | null>(null);
  const items = useMemo(() => MOCK_ADMIN_INQUIRIES.filter((item) => {
    const matchesQuery = [item.title, item.content, item.user_nickname, item.user_id].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || item.status === status);
  }), [query, status]);

  return (
    <AdminShell>
      <div className="flex items-end justify-between"><div><h1 className="text-2xl font-bold">문의 목록</h1><p className="mt-2 text-sm text-[#6b7280]">사용자 문의와 답변 처리 상태를 확인합니다.</p></div><button disabled title="서버 연동 후 제공" className="rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#9ca3af]">CSV 내보내기</button></div>
      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="flex gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="문의 검색 (유저 ID·닉네임·문의 내용)" className="h-10 flex-1 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]" /><select value={status} onChange={(event) => setStatus(event.target.value as "all" | AdminInquiryStatus)} className="rounded-md border border-[#d1d5db] bg-white px-3 text-sm"><option value="all">전체 상태</option><option value="reading">읽는 중</option><option value="resolved">해결됨</option></select></div>
      </section>
      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm"><thead className="bg-[#f9fafb] text-xs text-[#6b7280]"><tr><th className="px-5 py-3 font-medium">문의 ID</th><th className="px-5 py-3 font-medium">카테고리</th><th className="px-5 py-3 font-medium">제목 요약</th><th className="px-5 py-3 font-medium">유저 닉네임</th><th className="px-5 py-3 font-medium">상태</th><th className="px-5 py-3 font-medium">답변 여부</th><th className="px-5 py-3 font-medium">접수일시</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]"><td className="px-5 py-4 font-mono text-xs">INQ-{item.id.slice(0, 8).toUpperCase()}</td><td className="px-5 py-4">{ADMIN_CATEGORY_LABEL[item.category]}</td><td className="max-w-[280px] truncate px-5 py-4 font-medium">{item.title}</td><td className="px-5 py-4">{item.user_nickname}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "resolved" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{ADMIN_STATUS_LABEL[item.status]}</span></td><td className="px-5 py-4">{item.replies.length ? "답변 완료" : "답변 전"}</td><td className="px-5 py-4 text-[#6b7280]">{formatAdminDate(item.created_at)}</td></tr>)}</tbody></table>
        {items.length === 0 ? <p className="p-12 text-center text-sm text-[#6b7280]">검색 결과 없음. 조건과 일치하는 문의가 없습니다.</p> : null}
      </section>
      <p className="mt-4 text-sm text-[#6b7280]">총 {items.length}건 · mock data</p>

      {selected ? <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6"><div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"><h2 className="text-lg font-bold">문의 상세로 이동</h2><p className="mt-2 text-sm text-[#6b7280]">선택한 문의의 상세 내용을 확인합니다.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">취소</button><button onClick={() => router.push(`/admin/inquiries/${selected.id}`)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">상세 보기</button></div></div></div> : null}
    </AdminShell>
  );
}
