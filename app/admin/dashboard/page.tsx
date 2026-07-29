import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_STATUS_LABEL, formatAdminDate, MOCK_ADMIN_INQUIRIES } from "@/lib/admin/mock-inquiries";

const metrics = [
  { label: "Visible 보물", value: "12", description: "현재 앱 지도 노출 중" },
  { label: "오늘 획득 성공", value: "38", description: "오늘 claim 기준" },
  { label: "오늘 발급 실패", value: "2", description: "failed 상태 · 오늘 기준" },
  { label: "미처리 문의", value: String(MOCK_ADMIN_INQUIRIES.filter((item) => item.status === "reading").length), description: "읽는 중 문의" },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div><h1 className="text-2xl font-bold">운영 대시보드</h1><p className="mt-2 text-sm text-[#6b7280]">Asia/Seoul 기준 · 오늘 00:00~현재</p></div>
        <span className="text-xs text-[#6b7280]">Mock data</span>
      </div>
      <section className="mt-7 grid grid-cols-4 gap-4">
        {metrics.map((metric) => <article key={metric.label} className="rounded-lg border border-[#e5e7eb] bg-white p-5"><p className="text-sm font-medium text-[#4b5563]">{metric.label}</p><strong className="mt-3 block text-3xl tracking-tight">{metric.value}</strong><p className="mt-2 text-xs text-[#6b7280]">{metric.description}</p></article>)}
      </section>
      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4"><h2 className="font-semibold">최근 현황</h2><Link href="/admin/inquiries" className="text-sm font-medium underline">문의 전체 보기</Link></div>
        <table className="w-full text-left text-sm"><thead className="bg-[#f9fafb] text-xs text-[#6b7280]"><tr><th className="px-5 py-3 font-medium">구분</th><th className="px-5 py-3 font-medium">항목</th><th className="px-5 py-3 font-medium">유저</th><th className="px-5 py-3 font-medium">상태</th><th className="px-5 py-3 font-medium">일시</th></tr></thead><tbody>{MOCK_ADMIN_INQUIRIES.map((inquiry) => <tr key={inquiry.id} className="border-t border-[#f3f4f6]"><td className="px-5 py-4">문의</td><td className="px-5 py-4"><Link href={`/admin/inquiries/${inquiry.id}`} className="font-medium hover:underline">{inquiry.title}</Link></td><td className="px-5 py-4">{inquiry.user_nickname}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${inquiry.status === "resolved" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{ADMIN_STATUS_LABEL[inquiry.status]}</span></td><td className="px-5 py-4 text-[#6b7280]">{formatAdminDate(inquiry.created_at)}</td></tr>)}</tbody></table>
      </section>
      <p className="mt-5 text-xs text-[#6b7280]">대시보드 집계는 Asia/Seoul(KST) 기준으로 계산되며 최대 1분 지연이 있을 수 있습니다. 쿠폰·이메일 등 민감 정보는 표시되지 않습니다.</p>
    </AdminShell>
  );
}
