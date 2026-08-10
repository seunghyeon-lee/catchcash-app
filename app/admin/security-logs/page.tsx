"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  MOCK_SECURITY_LOGS,
  SECURITY_LOG_EVENT_TYPE_LABEL,
  SECURITY_LOG_SEVERITY_LABEL,
  SECURITY_LOG_SEVERITY_RANK,
  SECURITY_LOG_STATUS_LABEL,
  formatSecurityLogDateTime,
  type SecurityLogEventType,
  type SecurityLogListItem,
  type SecurityLogSeverity,
  type SecurityLogStatus,
} from "@/lib/admin/mock-security-logs";

type EventFilter = "all" | SecurityLogEventType;
type SeverityFilter = "all" | SecurityLogSeverity;
type StatusFilter = "all" | SecurityLogStatus;
type PeriodFilter = "all" | "today" | "last_7_days" | "last_30_days";
type SortFilter = "created_desc" | "created_asc" | "risk_desc" | "open_first";
type PageSize = 20 | 50 | 100;

function SeverityBadge({ severity }: { severity: SecurityLogSeverity }) {
  const tone =
    severity === "critical"
      ? "bg-[#fee2e2] text-[#991b1b]"
      : severity === "high"
        ? "bg-[#ffedd5] text-[#c2410c]"
        : severity === "medium"
          ? "bg-[#fef3c7] text-[#92400e]"
          : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      <span aria-hidden="true">●</span>
      {SECURITY_LOG_SEVERITY_LABEL[severity]}
    </span>
  );
}

function StatusBadge({ status }: { status: SecurityLogStatus }) {
  const tone =
    status === "open"
      ? "bg-[#dbeafe] text-[#1d4ed8]"
      : status === "reviewing"
        ? "bg-[#fef3c7] text-[#92400e]"
        : status === "resolved"
          ? "bg-[#dcfce7] text-[#166534]"
          : "bg-[#f3f4f6] text-[#4b5563]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{SECURITY_LOG_STATUS_LABEL[status]}</span>;
}

function matchesPeriod(requestedAt: string, period: PeriodFilter) {
  if (period === "all") return true;

  const requested = new Date(requestedAt).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (period === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return requested >= start.getTime() && requested <= now;
  }

  if (period === "last_7_days") return requested >= now - 7 * dayMs && requested <= now;
  if (period === "last_30_days") return requested >= now - 30 * dayMs && requested <= now;
  return true;
}

function SecurityLogsPageContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") ?? "";
  const initialTreasureId = searchParams.get("treasureId") ?? "";

  const [query, setQuery] = useState(initialUserId || initialTreasureId);
  const [eventType, setEventType] = useState<EventFilter>("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sort, setSort] = useState<SortFilter>("created_desc");
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const nextQuery = initialUserId || initialTreasureId;
    if (nextQuery) {
      setQuery(nextQuery);
      setPage(1);
    }
  }, [initialUserId, initialTreasureId]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = MOCK_SECURITY_LOGS.filter((log) => {
      const searchable = [log.id, log.userPublicId ?? "", log.nickname ?? "", log.treasureId ?? ""].join(" ").toLowerCase();
      const matchesQuery = searchable.includes(normalizedQuery);
      const matchesEvent = eventType === "all" || log.eventType === eventType;
      const matchesSeverity = severity === "all" || log.severity === severity;
      const matchesStatus = status === "all" || log.status === status;
      const matchesPeriodFilter = matchesPeriod(log.requestedAt, period);
      return matchesQuery && matchesEvent && matchesSeverity && matchesStatus && matchesPeriodFilter;
    });

    return filtered.sort((a, b) => {
      if (sort === "created_asc") return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      if (sort === "risk_desc") {
        const severityDiff = SECURITY_LOG_SEVERITY_RANK[b.severity] - SECURITY_LOG_SEVERITY_RANK[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
      if (sort === "open_first") {
        const aOpen = a.status === "open" ? 0 : 1;
        const bOpen = b.status === "open" ? 0 : 1;
        if (aOpen !== bOpen) return aOpen - bOpen;
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
  }, [query, eventType, severity, status, period, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setQuery("");
    setEventType("all");
    setSeverity("all");
    setStatus("all");
    setPeriod("all");
    setSort("created_desc");
    setPageSize(20);
    setPage(1);
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">보안 로그</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            super_admin 전용 보안 이벤트 목록입니다. 이번 shell은 mock 조회만 제공하며 제재·상태 변경은 포함하지 않습니다.
          </p>
        </div>
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <input
            aria-label="보안 로그 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="로그 ID, 유저 ID, 닉네임, 보물 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] xl:col-span-2"
          />
          <select
            aria-label="이벤트 유형 필터"
            value={eventType}
            onChange={(event) => {
              setEventType(event.target.value as EventFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">이벤트 전체</option>
            {Object.entries(SECURITY_LOG_EVENT_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="위험도 필터"
            value={severity}
            onChange={(event) => {
              setSeverity(event.target.value as SeverityFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">위험도 전체</option>
            {Object.entries(SECURITY_LOG_SEVERITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="처리 상태 필터"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">상태 전체</option>
            {Object.entries(SECURITY_LOG_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="기간 필터"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value as PeriodFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">기간 전체</option>
            <option value="today">오늘</option>
            <option value="last_7_days">최근 7일</option>
            <option value="last_30_days">최근 30일</option>
          </select>
          <select
            aria-label="정렬"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="created_desc">최근 발생순</option>
            <option value="created_asc">오래된 발생순</option>
            <option value="risk_desc">위험도 높은 순</option>
            <option value="open_first">미확인 우선</option>
          </select>
          <select
            aria-label="페이지 크기"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value) as PageSize);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            필터 초기화
          </button>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>총 {filteredLogs.length}건 · mock data</span>
        <span>목록에는 IP/UA/좌표/payload를 표시하지 않습니다.</span>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        {pageItems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-base font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">조건과 일치하는 보안 로그가 없습니다.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
              <tr>
                <th className="px-4 py-3 font-medium">로그 ID</th>
                <th className="px-4 py-3 font-medium">이벤트</th>
                <th className="px-4 py-3 font-medium">위험도</th>
                <th className="px-4 py-3 font-medium">유저</th>
                <th className="px-4 py-3 font-medium">보물</th>
                <th className="px-4 py-3 font-medium">요청 시각</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((log: SecurityLogListItem) => (
                <tr key={log.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#111827]">{log.id}</td>
                  <td className="px-4 py-3 text-[#374151]">{SECURITY_LOG_EVENT_TYPE_LABEL[log.eventType]}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="px-4 py-3 text-[#4b5563]">
                    {log.userPublicId ? `${log.userPublicId} / ${log.nickname}` : "-"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#4b5563]">{log.treasureId ?? "-"}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{formatSecurityLogDateTime(log.requestedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/security-logs/${log.id}`} className="text-sm font-medium text-[#111827] underline underline-offset-2 hover:text-black">
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {filteredLogs.length > 0 ? (
        <nav aria-label="보안 로그 페이지네이션" className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(0, 8)
            .map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === safePage ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
                className={`min-w-9 rounded-md px-3 py-1.5 text-sm ${
                  pageNumber === safePage ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      ) : null}
    </>
  );
}

export default function AdminSecurityLogsPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">보안 로그를 불러오는 중...</p>}>
        <SecurityLogsPageContent />
      </Suspense>
    </AdminShell>
  );
}
