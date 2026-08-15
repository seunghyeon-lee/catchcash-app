"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  MOCK_OPERATION_LOGS,
  MOCK_OPERATION_LOG_ADMINS,
  OPERATION_LOG_EVENT_TYPE_LABEL,
  OPERATION_LOG_RESOURCE_TYPE_LABEL,
  OPERATION_LOG_RESULT_LABEL,
  OPERATION_LOG_SENSITIVITY_LABEL,
  OPERATION_LOG_SENSITIVITY_RANK,
  formatOperationLogDateTime,
  getOperationLogResourceHref,
  type OperationLogEventType,
  type OperationLogListItem,
  type OperationLogResourceType,
  type OperationLogSensitivity,
} from "@/lib/admin/mock-operation-logs";

type LogTypeTab = OperationLogSensitivity;
type EventFilter = "all" | OperationLogEventType;
type ResourceFilter = "all" | OperationLogResourceType;
type ActorFilter = "all" | string;
type PeriodFilter = "all" | "today" | "last_7_days" | "last_30_days";
type SortFilter = "created_desc" | "created_asc" | "sensitivity_desc" | "event_type_asc";
type PageSize = 20 | 50 | 100;
type AdminRole = "super_admin" | "operator" | "viewer";

const adminRole: AdminRole = "super_admin";

function SensitivityBadge({ sensitivity }: { sensitivity: OperationLogSensitivity }) {
  const tone = sensitivity === "sensitive" ? "bg-[#fee2e2] text-[#991b1b]" : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {OPERATION_LOG_SENSITIVITY_LABEL[sensitivity]}
    </span>
  );
}

function ResultBadge({ result }: { result: OperationLogListItem["result"] }) {
  const tone =
    result === "success"
      ? "bg-[#dcfce7] text-[#166534]"
      : result === "failed"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : result === "blocked"
          ? "bg-[#ffedd5] text-[#c2410c]"
          : "bg-[#fef3c7] text-[#92400e]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {OPERATION_LOG_RESULT_LABEL[result]}
    </span>
  );
}

function matchesPeriod(createdAt: string, period: PeriodFilter) {
  if (period === "all") return true;

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (period === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return created >= start.getTime();
  }

  if (period === "last_7_days") return created >= now - 7 * dayMs;
  if (period === "last_30_days") return created >= now - 30 * dayMs;
  return true;
}

function parseLogType(value: string | null): LogTypeTab {
  return value === "sensitive" ? "sensitive" : "normal";
}

function OperationLogsPageContent() {
  const searchParams = useSearchParams();
  const initialLogType = parseLogType(searchParams.get("logType"));
  const initialResourceType = searchParams.get("resourceType");
  const initialResourceId = searchParams.get("resourceId") ?? "";
  const canViewSensitive = adminRole === "super_admin";
  const canExportCsv = adminRole === "super_admin" || adminRole === "operator";

  const [logType, setLogType] = useState<LogTypeTab>(canViewSensitive ? initialLogType : "normal");
  const [query, setQuery] = useState(initialResourceId);
  const [eventType, setEventType] = useState<EventFilter>("all");
  const [actor, setActor] = useState<ActorFilter>("all");
  const [resourceType, setResourceType] = useState<ResourceFilter>(
    initialResourceType && initialResourceType in OPERATION_LOG_RESOURCE_TYPE_LABEL
      ? (initialResourceType as OperationLogResourceType)
      : "all",
  );
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sort, setSort] = useState<SortFilter>("created_desc");
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [page, setPage] = useState(1);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);

  useEffect(() => {
    const nextLogType = parseLogType(searchParams.get("logType"));
    if (nextLogType === "sensitive" && !canViewSensitive) {
      setIsAccessDeniedOpen(true);
      setLogType("normal");
      return;
    }
    setLogType(nextLogType);
  }, [searchParams, canViewSensitive]);

  useEffect(() => {
    if (initialResourceId) {
      setQuery(initialResourceId);
      setPage(1);
    }
  }, [initialResourceId]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = MOCK_OPERATION_LOGS.filter((log) => {
      if (log.sensitivity !== logType) return false;
      if (!canViewSensitive && log.sensitivity === "sensitive") return false;

      const searchable = [log.id, log.adminId, log.adminName, log.resourceId].join(" ").toLowerCase();
      const matchesQuery = searchable.includes(normalizedQuery);
      const matchesEvent = eventType === "all" || log.eventType === eventType;
      const matchesActor = actor === "all" || log.adminId === actor;
      const matchesResource = resourceType === "all" || log.resourceType === resourceType;
      const matchesPeriodFilter = matchesPeriod(log.createdAt, period);
      return matchesQuery && matchesEvent && matchesActor && matchesResource && matchesPeriodFilter;
    });

    return filtered.sort((a, b) => {
      if (sort === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "sensitivity_desc") {
        const sensitivityDiff = OPERATION_LOG_SENSITIVITY_RANK[b.sensitivity] - OPERATION_LOG_SENSITIVITY_RANK[a.sensitivity];
        if (sensitivityDiff !== 0) return sensitivityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "event_type_asc") {
        const eventDiff = OPERATION_LOG_EVENT_TYPE_LABEL[a.eventType].localeCompare(OPERATION_LOG_EVENT_TYPE_LABEL[b.eventType], "ko");
        if (eventDiff !== 0) return eventDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [logType, query, eventType, actor, resourceType, period, sort, canViewSensitive]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setQuery("");
    setEventType("all");
    setActor("all");
    setResourceType("all");
    setPeriod("all");
    setSort("created_desc");
    setPageSize(20);
    setPage(1);
  };

  const selectLogType = (next: LogTypeTab) => {
    if (next === "sensitive" && !canViewSensitive) {
      setIsAccessDeniedOpen(true);
      return;
    }
    setLogType(next);
    setPage(1);
  };

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">운영 로그</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            관리자 운영 액션 이력을 mock 기준으로 조회합니다. 로그 수정·삭제는 제공하지 않으며, 이메일·쿠폰·바코드는 표시하지 않습니다.
          </p>
        </div>
        {canExportCsv ? (
          <button
            type="button"
            onClick={() => setIsCsvDialogOpen(true)}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            CSV 내보내기
          </button>
        ) : null}
      </div>

      <div className="mt-7 flex gap-2 border-b border-[#e5e7eb]">
        <button
          type="button"
          aria-current={logType === "normal" ? "page" : undefined}
          onClick={() => selectLogType("normal")}
          className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
            logType === "normal" ? "border-[#111827] text-[#111827]" : "border-transparent text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          일반 로그
        </button>
        {canViewSensitive ? (
          <button
            type="button"
            aria-current={logType === "sensitive" ? "page" : undefined}
            onClick={() => selectLogType("sensitive")}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
              logType === "sensitive" ? "border-[#111827] text-[#111827]" : "border-transparent text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            민감 로그
          </button>
        ) : null}
      </div>

      <section className="mt-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <input
            aria-label="운영 로그 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="로그 ID, 관리자 ID, 대상 리소스 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] xl:col-span-2"
          />
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
            aria-label="이벤트 유형 필터"
            value={eventType}
            onChange={(event) => {
              setEventType(event.target.value as EventFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">이벤트 전체</option>
            {Object.entries(OPERATION_LOG_EVENT_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="실행자 필터"
            value={actor}
            onChange={(event) => {
              setActor(event.target.value as ActorFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">실행자 전체</option>
            {MOCK_OPERATION_LOG_ADMINS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} / {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label="대상 리소스 필터"
            value={resourceType}
            onChange={(event) => {
              setResourceType(event.target.value as ResourceFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">리소스 전체</option>
            {Object.entries(OPERATION_LOG_RESOURCE_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
            <option value="sensitivity_desc">민감도 높은 순</option>
            <option value="event_type_asc">이벤트 유형순</option>
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
        <span>
          {logType === "sensitive" ? "민감" : "일반"} 로그 · 총 {filteredLogs.length}건 · mock data
        </span>
        <span>사용자 이메일·쿠폰·바코드는 표시하지 않습니다.</span>
      </div>

      <section className="mt-4 overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white">
        {pageItems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-base font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">조건과 일치하는 운영 로그가 없습니다. 필터를 조정해 주세요.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">발생 시각</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">이벤트 유형</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">민감도</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">실행자</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">대상 리소스</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">변경 요약</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">결과</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((log) => {
                const href = getOperationLogResourceHref(log);
                return (
                  <tr key={log.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 text-[#4b5563]">{formatOperationLogDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-[#374151]">{OPERATION_LOG_EVENT_TYPE_LABEL[log.eventType]}</td>
                    <td className="px-4 py-3">
                      <SensitivityBadge sensitivity={log.sensitivity} />
                    </td>
                    <td className="px-4 py-3 text-[#4b5563]">
                      <span className="font-mono text-xs">{log.adminId}</span>
                      <span className="mt-0.5 block text-xs text-[#6b7280]">{log.adminName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#6b7280]">{OPERATION_LOG_RESOURCE_TYPE_LABEL[log.resourceType]}</p>
                      {href ? (
                        <Link href={href} className="font-mono text-xs font-medium text-[#111827] underline underline-offset-2 hover:text-black">
                          {log.resourceId}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-[#4b5563]">{log.resourceId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">{log.summary}</td>
                    <td className="px-4 py-3">
                      <ResultBadge result={log.result} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {filteredLogs.length > 0 ? (
        <nav aria-label="운영 로그 페이지네이션" className="mt-4 flex items-center justify-end gap-2">
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

      {isCsvDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="operation-log-csv-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="operation-log-csv-title" className="text-lg font-bold">
              CSV 내보내기
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 탭·검색·필터 조건의 운영 로그를 CSV로 내보냅니다. 사용자 이메일·쿠폰 번호·바코드·시크릿·토큰은 포함하지 않습니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                내보내기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAccessDeniedOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="operation-log-denied-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="operation-log-denied-title" className="text-lg font-bold">
              접근 권한 없음
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              민감 운영 로그는 super_admin만 조회할 수 있습니다.
              <br />
              현재 계정의 역할로는 이 메뉴에 접근할 수 없습니다.
              <br />
              권한이 필요하면 super_admin에게 문의하세요.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAccessDeniedOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                닫기
              </button>
              <Link href="/admin/dashboard" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                대시보드로
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function AdminOperationLogsPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">운영 로그를 불러오는 중...</p>}>
        <OperationLogsPageContent />
      </Suspense>
    </AdminShell>
  );
}
