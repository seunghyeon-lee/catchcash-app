"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  MOCK_DASHBOARD_TODAY,
  formatDashboardDateTime,
  getClaimSectionSummaries,
  getDashboardClaimRows,
  getDashboardFailureRows,
  getDashboardInquiryRows,
  getDashboardMetricCards,
  getDashboardQuickLinks,
  getFailureSectionSummaries,
  getInquirySectionSummaries,
  type DashboardMetricKey,
  type DashboardSectionSummaryCard,
} from "@/lib/admin/mock-dashboard";
import { loadAdminDashboardStats, type AdminDashboardStats } from "@/lib/admin/dashboard-service";
import { buildAdminDashboardRecent, type AdminDashboardRecent } from "@/lib/admin/dashboard-recent";
import { loadAdminRewardRequests } from "@/lib/admin/reward-service";
import { loadAdminInquiries } from "@/lib/admin/support-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

const adminRole = "super_admin" as const;

function StatusBadge({ tone, label }: { tone: "success" | "danger" | "warning" | "neutral"; label: string }) {
  const className =
    tone === "danger"
      ? "bg-[#fee2e2] text-[#991b1b]"
      : tone === "warning"
        ? "bg-[#fef3c7] text-[#92400e]"
        : tone === "success"
          ? "bg-[#dcfce7] text-[#166534]"
          : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span>
  );
}

function SummaryCards({ cards }: { cards: DashboardSectionSummaryCard[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <article key={card.title} className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
          <p className="text-xs font-medium text-[#6b7280]">{card.title}</p>
          <p className="mt-2 truncate text-xl font-semibold tracking-tight text-[#111827]" title={card.value}>
            {card.value}
          </p>
          <p className="mt-1 text-[11px] text-[#9ca3af]">{card.description}</p>
        </article>
      ))}
    </div>
  );
}

function RecentSection({
  id,
  title,
  listHref,
  listLabel,
  summaries,
  emptyText,
  children,
}: {
  id: string;
  title: string;
  listHref: string;
  listLabel: string;
  summaries: DashboardSectionSummaryCard[];
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-lg border border-[#e5e7eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
        <h3 className="font-semibold text-[#111827]">{title}</h3>
        <Link href={listHref} className="text-sm font-medium underline underline-offset-2">
          {listLabel}
        </Link>
      </div>
      <div className="space-y-4 p-5">
        <SummaryCards cards={summaries} />
        {children ? (
          children
        ) : (
          <div className="rounded-md border border-dashed border-[#e5e7eb] px-4 py-10 text-center text-sm text-[#6b7280]">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentStatusScrollHelper() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("section") !== "recent-status") return;
    document.getElementById("recent-status")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams]);

  return null;
}

function DashboardPageContent() {
  const metricsBase = getDashboardMetricCards();
  const quickLinks = getDashboardQuickLinks(adminRole);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminDashboardRecent | null>(null);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminDashboardStats();
      setStats(result.stats);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch (error) {
      console.warn("[admin] 대시보드 지표 로딩 실패:", error);
      setStats(null);
      setSource(null);
      setMessage("대시보드 지표를 불러오지 못했습니다.");
    }

    // 하단 최근 현황: 보상/문의 실데이터가 모두 조회될 때만 실데이터로 구성하고,
    // 세션 없음/오류 시에는 기존 mock 표시(상단 배지로 mock임을 안내)로 fallback한다.
    try {
      const [rewardsResult, inquiriesResult] = await Promise.all([loadAdminRewardRequests(), loadAdminInquiries()]);
      if (rewardsResult.source === "supabase" && inquiriesResult.source === "supabase") {
        setRecent(buildAdminDashboardRecent(rewardsResult.rewards, inquiriesResult.inquiries));
      } else {
        setRecent(null);
      }
    } catch (error) {
      console.warn("[admin] 대시보드 최근 현황 로딩 실패:", error);
      setRecent(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // 상단 지표 카드 값만 admin_dashboard_stats 뷰 실데이터로 덮는다.
  // (하단 최근 현황 rows/summary는 보상·보물 조인이 필요해 이후 차수에서 연결)
  const metrics = metricsBase.map((card) => {
    if (!stats) return card;
    const realValueByKey: Record<DashboardMetricKey, number> = {
      visible_treasure: stats.visibleTreasure,
      claim_success: stats.claimSuccessToday,
      issue_failed: stats.issueFailed,
      open_inquiry: stats.openInquiry,
    };
    return { ...card, value: realValueByKey[card.key] };
  });

  // 최근 현황: 실데이터가 준비되면 그대로 사용하고, 아니면 mock getter로 fallback한다.
  const claimRows = recent?.claimRows ?? getDashboardClaimRows();
  const failureRows = recent?.failureRows ?? getDashboardFailureRows();
  const inquiryRows = recent?.inquiryRows ?? getDashboardInquiryRows();
  const claimSummaries = recent?.claimSummaries ?? getClaimSectionSummaries();
  const failureSummaries = recent?.failureSummaries ?? getFailureSectionSummaries();
  const inquirySummaries = recent?.inquirySummaries ?? getInquirySectionSummaries();

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">운영 대시보드</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Asia/Seoul 기준 · 오늘 00:00~현재</p>
        </div>
        <span className="text-xs text-[#6b7280]">
          {isLoading
            ? "지표 불러오는 중…"
            : source === "supabase"
              ? recent
                ? "Supabase 실시간 지표"
                : "Supabase 실시간 지표 · 최근 현황은 예시 데이터"
              : `Mock data · 집계일 ${MOCK_DASHBOARD_TODAY}`}
        </span>
      </div>

      {!isLoading && source && source !== "supabase" ? (
        <div
          role="status"
          className={`mt-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          <span>{message ?? "예시 데이터를 표시하고 있습니다."}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 font-medium underline">
            다시 시도
          </button>
        </div>
      ) : null}

      <section aria-busy={isLoading} aria-label="핵심 운영 지표" className="mt-7 grid grid-cols-4 gap-4">
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

      <div id="recent-status" className="mt-8 scroll-mt-24">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">최근 현황</h2>
            <p className="mt-1 text-sm text-[#6b7280]">Asia/Seoul 기준 · 보물 획득 / 발급 실패 / 문의</p>
          </div>
          <Link href="/admin/dashboard?section=recent-status" className="text-sm font-medium text-[#6b7280] underline underline-offset-2">
            이 섹션으로
          </Link>
        </div>

        <div className="space-y-6">
          <RecentSection
            id="recent-claims"
            title="최근 보물 획득"
            listHref="/admin/reward-requests"
            listLabel="보상 목록"
            summaries={claimSummaries}
            emptyText="최근 보물 획득 내역이 없습니다."
          >
            {claimRows.length === 0 ? null : (
              <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">획득 ID</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">보물명</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">유저 닉네임</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">보상 상태</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">획득 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimRows.map((row) => (
                      <tr key={row.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link href={row.href} className="font-mono text-xs font-medium underline underline-offset-2">
                            {row.claimId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={row.treasureHref} className="font-medium hover:underline">
                            {row.treasureTitle}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#4b5563]">{row.userNickname}</td>
                        <td className="px-4 py-3">
                          <StatusBadge tone="success" label={row.rewardStatusLabel} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]">{formatDashboardDateTime(row.claimedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </RecentSection>

          <RecentSection
            id="recent-failures"
            title="최근 발급 실패"
            listHref="/admin/reward-requests?status=failed"
            listLabel="실패 목록"
            summaries={failureSummaries}
            emptyText="최근 발급 실패 내역이 없습니다."
          >
            {failureRows.length === 0 ? null : (
              <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
                <table className="w-full min-w-[840px] text-left text-sm">
                  <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">보상 ID</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">보물명</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">유저 닉네임</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">실패 코드</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">실패 시각</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">재처리 요청</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failureRows.map((row) => (
                      <tr key={row.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link href={row.href} className="font-mono text-xs font-medium underline underline-offset-2">
                            {row.rewardId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={row.treasureHref} className="font-medium hover:underline">
                            {row.treasureTitle}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#4b5563]">{row.userNickname}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#991b1b]">{row.failureCode}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]">{formatDashboardDateTime(row.failedAt)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={row.retryStatus === "none" ? "neutral" : "warning"}
                            label={row.retryStatusLabel}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </RecentSection>

          <RecentSection
            id="recent-inquiries"
            title="최근 문의"
            listHref="/admin/inquiries"
            listLabel="문의 목록"
            summaries={inquirySummaries}
            emptyText="최근 문의가 없습니다."
          >
            {inquiryRows.length === 0 ? null : (
              <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">문의 ID</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">카테고리</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">유저 닉네임</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">상태</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">접수 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiryRows.map((row) => (
                      <tr key={row.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link href={row.href} className="font-mono text-xs font-medium underline underline-offset-2">
                            {row.inquiryId}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#374151]">{row.categoryLabel}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#4b5563]">{row.userNickname}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={row.statusLabel === "in_progress" ? "warning" : "success"}
                            label={row.statusLabel}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]">{formatDashboardDateTime(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </RecentSection>
        </div>
      </div>

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
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">대시보드를 불러오는 중...</p>}>
        <RecentStatusScrollHelper />
        <DashboardPageContent />
      </Suspense>
    </AdminShell>
  );
}
