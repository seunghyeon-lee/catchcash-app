import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  MOCK_DASHBOARD_TODAY,
  formatDashboardDateTime,
  getDashboardMetricCards,
  getDashboardQuickLinks,
  getDashboardRecentItems,
} from "@/lib/admin/mock-dashboard";

const adminRole = "super_admin" as const;

function RecentStatusBadge({ kind, label }: { kind: string; label: string }) {
  const tone =
    kind === "issue_failed"
      ? "bg-[#fee2e2] text-[#991b1b]"
      : kind === "inquiry"
        ? "bg-[#fef3c7] text-[#92400e]"
        : "bg-[#dcfce7] text-[#166534]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label}</span>
  );
}

export default function AdminDashboardPage() {
  const metrics = getDashboardMetricCards();
  const recentItems = getDashboardRecentItems();
  const quickLinks = getDashboardQuickLinks(adminRole);

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">운영 대시보드</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Asia/Seoul 기준 · 오늘 00:00~현재</p>
        </div>
        <span className="text-xs text-[#6b7280]">Mock data · 집계일 {MOCK_DASHBOARD_TODAY}</span>
      </div>

      <section aria-label="핵심 운영 지표" className="mt-7 grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="rounded-lg border border-[#e5e7eb] bg-white p-5 transition hover:border-[#d1d5db] hover:bg-[#f9fafb]"
          >
            <p className="text-sm font-medium text-[#4b5563]">{metric.title}</p>
            <strong className="mt-3 block text-3xl tracking-tight text-[#111827]">{metric.value}</strong>
            <p className="mt-2 text-xs text-[#6b7280]">{metric.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="font-semibold">최근 현황</h2>
          <Link href="/admin/inquiries" className="text-sm font-medium underline underline-offset-2">
            문의 전체 보기
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">최근 현황이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">구분</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">항목</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">유저</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">상태</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">일시</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="whitespace-nowrap px-5 py-4 text-[#374151]">{item.kindLabel}</td>
                    <td className="px-5 py-4">
                      <Link href={item.href} className="font-medium text-[#111827] underline-offset-2 hover:underline">
                        {item.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#4b5563]">{item.userLabel}</td>
                    <td className="px-5 py-4">
                      <RecentStatusBadge kind={item.kind} label={item.statusLabel} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#6b7280]">{formatDashboardDateTime(item.occurredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-xs leading-5 text-[#6b7280]">
          대시보드 집계는 Asia/Seoul(KST) 기준으로 계산되며 최대 1분 지연이 있을 수 있습니다. 쿠폰·이메일 등 민감 정보는
          표시되지 않습니다.
        </p>
        <nav aria-label="빠른 링크" className="flex flex-wrap gap-2">
          {quickLinks.map((link) =>
            link.enabled && link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.label}
                title="준비 중"
                className="rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-xs font-medium text-[#9ca3af]"
              >
                {link.label}
              </span>
            ),
          )}
        </nav>
      </div>
    </AdminShell>
  );
}
