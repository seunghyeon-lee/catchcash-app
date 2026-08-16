"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_TREASURE_CALCULATED_STATUS_LABEL,
  ADMIN_TREASURE_SAVE_STATUS_LABEL,
  MOCK_ADMIN_TREASURES,
  formatAdminTreasureDate,
  formatAdminTreasurePeriod,
  type AdminTreasureCalculatedStatus,
  type AdminTreasureListItem,
  type AdminTreasureSaveStatus,
} from "@/lib/admin/mock-treasures";

type SaveStatusFilter = "all" | AdminTreasureSaveStatus;
type CalculatedStatusFilter = "all" | AdminTreasureCalculatedStatus;
type PeriodFilter = "all" | "starts_today" | "starts_this_week" | "starts_this_month" | "past" | "future";
type TreasureSortKey =
  | "created_desc"
  | "created_asc"
  | "starts_asc"
  | "ends_asc"
  | "claim_desc"
  | "claim_asc";

const PAGE_SIZE = 20;
const adminRole = "super_admin";

const CALCULATED_STATUS_VALUES = new Set<AdminTreasureCalculatedStatus>([
  "visible",
  "scheduled",
  "expired",
  "sold_out",
  "invalid",
  "hidden",
]);

function parseCalculatedStatusFilter(searchParams: URLSearchParams): CalculatedStatusFilter {
  const fromCalculated = searchParams.get("calculatedStatus");
  if (fromCalculated && CALCULATED_STATUS_VALUES.has(fromCalculated as AdminTreasureCalculatedStatus)) {
    return fromCalculated as AdminTreasureCalculatedStatus;
  }

  // A02 대시보드 스펙 호환: ?visibility=visible
  const fromVisibility = searchParams.get("visibility");
  if (fromVisibility && CALCULATED_STATUS_VALUES.has(fromVisibility as AdminTreasureCalculatedStatus)) {
    return fromVisibility as AdminTreasureCalculatedStatus;
  }

  return "all";
}

const sortOptions: Array<{ label: string; value: TreasureSortKey }> = [
  { label: "최신 등록순", value: "created_desc" },
  { label: "오래된 등록순", value: "created_asc" },
  { label: "시작일 빠른순", value: "starts_asc" },
  { label: "종료일 빠른순", value: "ends_asc" },
  { label: "획득 수량 많은순", value: "claim_desc" },
  { label: "획득 수량 적은순", value: "claim_asc" },
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function matchesPeriodFilter(startsAt: string, period: PeriodFilter) {
  if (period === "all") return true;

  const starts = new Date(startsAt);
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (period === "starts_today") {
    return starts >= todayStart && starts < tomorrowStart;
  }

  if (period === "starts_this_week") {
    const weekStart = startOfWeek(now);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return starts >= weekStart && starts < nextWeekStart;
  }

  if (period === "starts_this_month") {
    const monthStart = startOfMonth(now);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return starts >= monthStart && starts < nextMonthStart;
  }

  if (period === "past") return starts < todayStart;
  if (period === "future") return starts >= tomorrowStart;

  return true;
}

function SaveStatusBadge({ status }: { status: AdminTreasureSaveStatus }) {
  const tone =
    status === "active"
      ? "bg-[#111827] text-white"
      : status === "deleted"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {ADMIN_TREASURE_SAVE_STATUS_LABEL[status]}
    </span>
  );
}

function CalculatedStatusBadge({ status }: { status: AdminTreasureCalculatedStatus }) {
  const tone =
    status === "visible"
      ? "bg-[#dcfce7] text-[#166534]"
      : status === "scheduled"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : status === "expired" || status === "sold_out"
          ? "bg-[#fef3c7] text-[#92400e]"
          : status === "invalid"
            ? "bg-[#fee2e2] text-[#991b1b]"
            : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {ADMIN_TREASURE_CALCULATED_STATUS_LABEL[status]}
    </span>
  );
}

function AdminTreasuresPageContent() {
  const searchParams = useSearchParams();
  const initialCalculatedStatus = parseCalculatedStatusFilter(searchParams);

  const [query, setQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatusFilter>("all");
  const [calculatedStatus, setCalculatedStatus] = useState<CalculatedStatusFilter>(initialCalculatedStatus);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sort, setSort] = useState<TreasureSortKey>("created_desc");
  const [page, setPage] = useState(1);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  useEffect(() => {
    setCalculatedStatus(parseCalculatedStatusFilter(searchParams));
    setPage(1);
  }, [searchParams]);

  const canManageTreasures = adminRole === "super_admin" || adminRole === "operator";

  const filteredTreasures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...MOCK_ADMIN_TREASURES]
      .filter((treasure) => {
        const searchable = [treasure.id, treasure.treasureCode, treasure.title, treasure.locationLabel, treasure.regionLabel]
          .join(" ")
          .toLowerCase();
        const matchesQuery = searchable.includes(normalizedQuery);
        const matchesSaveStatus = saveStatus === "all" || treasure.status === saveStatus;
        const matchesCalculatedStatus = calculatedStatus === "all" || treasure.calculatedStatus === calculatedStatus;
        const matchesPeriod = matchesPeriodFilter(treasure.startsAt, period);

        return matchesQuery && matchesSaveStatus && matchesCalculatedStatus && matchesPeriod;
      })
      .sort((a, b) => {
        if (sort === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "starts_asc") return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
        if (sort === "ends_asc") return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
        if (sort === "claim_desc") return b.currentClaimCount - a.currentClaimCount;
        if (sort === "claim_asc") return a.currentClaimCount - b.currentClaimCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [calculatedStatus, period, query, saveStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTreasures.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredTreasures.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setQuery("");
    setSaveStatus("all");
    setCalculatedStatus("all");
    setPeriod("all");
    setSort("created_desc");
    setPage(1);
  };

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">보물상자 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            등록된 보물상자를 mock data 기준으로 조회합니다. 실제 지도/API 연결과 저장은 포함하지 않습니다.
          </p>
        </div>
        {canManageTreasures ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setIsCsvDialogOpen(true)}
              className="whitespace-nowrap rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              CSV 내보내기
            </button>
            <Link href="/admin/treasures/new" className="whitespace-nowrap rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
              보물상자 등록
            </Link>
          </div>
        ) : null}
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-[minmax(220px,1.2fr)_140px_150px_150px_160px_auto] gap-3">
          <input
            aria-label="보물상자 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="보물상자명·ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <label className="sr-only" htmlFor="treasure-save-status-filter">
            저장 상태
          </label>
          <select
            id="treasure-save-status-filter"
            value={saveStatus}
            onChange={(event) => {
              setSaveStatus(event.target.value as SaveStatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">저장 상태 전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="deleted">삭제됨</option>
          </select>
          <label className="sr-only" htmlFor="treasure-calculated-status-filter">
            계산 상태
          </label>
          <select
            id="treasure-calculated-status-filter"
            value={calculatedStatus}
            onChange={(event) => {
              setCalculatedStatus(event.target.value as CalculatedStatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">계산 상태 전체</option>
            <option value="visible">노출 가능</option>
            <option value="scheduled">예정</option>
            <option value="expired">만료</option>
            <option value="sold_out">매진</option>
            <option value="invalid">조건 오류</option>
            <option value="hidden">숨김</option>
          </select>
          <label className="sr-only" htmlFor="treasure-period-filter">
            기간 시작
          </label>
          <select
            id="treasure-period-filter"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value as PeriodFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">기간 시작 전체</option>
            <option value="starts_today">오늘 시작</option>
            <option value="starts_this_week">이번 주 시작</option>
            <option value="starts_this_month">이번 달 시작</option>
            <option value="past">지난 기간</option>
            <option value="future">예정 기간</option>
          </select>
          <label className="sr-only" htmlFor="treasure-sort-filter">
            정렬
          </label>
          <select
            id="treasure-sort-filter"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as TreasureSortKey);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 whitespace-nowrap rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            필터 초기화
          </button>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
            <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
              <tr>
                <th className="w-[88px] whitespace-nowrap px-5 py-3 font-medium">ID</th>
                <th className="w-[180px] whitespace-nowrap px-5 py-3 font-medium">보물상자명</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">위치 문구</th>
                <th className="w-[100px] whitespace-nowrap px-5 py-3 font-medium">저장 상태</th>
                <th className="w-[110px] whitespace-nowrap px-5 py-3 font-medium">계산 상태</th>
                <th className="w-[200px] whitespace-nowrap px-5 py-3 font-medium">기간</th>
                <th className="w-[120px] whitespace-nowrap px-5 py-3 font-medium">최대/현재 수량</th>
                <th className="w-[110px] whitespace-nowrap px-5 py-3 font-medium">등록일</th>
                <th className="w-[72px] whitespace-nowrap px-5 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((treasure) => (
                <TreasureRow key={treasure.id} treasure={treasure} />
              ))}
            </tbody>
          </table>
        </div>
        {pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 항목이 없습니다. 필터를 조정해 주세요.</p>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>총 {filteredTreasures.length}건 · mock data</span>
        <nav aria-label="보물상자 목록 페이지네이션" className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              aria-current={safePage === pageNumber ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md px-2 text-sm ${
                safePage === pageNumber ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage >= totalPages}
            className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:text-[#9ca3af]"
          >
            다음
          </button>
        </nav>
      </div>

      <p className="mt-5 text-xs text-[#6b7280]">
        쿠폰 번호, 바코드, 사용자 이메일은 목록과 CSV에 포함하지 않습니다. 실제 Naver Map API와 treasure_boxes DB 연결은 이번
        shell 범위가 아닙니다.
      </p>

      {isCsvDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-csv-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-csv-title" className="text-lg font-bold">
              CSV 내보내기
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 필터 조건이 반영된 목록을 CSV로 내보냅니다. 쿠폰·바코드·이메일 등 민감 정보는 포함되지 않습니다.
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
    </>
  );
}

export default function AdminTreasuresPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">보물상자 목록을 불러오는 중...</p>}>
        <AdminTreasuresPageContent />
      </Suspense>
    </AdminShell>
  );
}

function TreasureRow({ treasure }: { treasure: AdminTreasureListItem }) {
  const detailHref = `/admin/treasures/${treasure.id}`;

  return (
    <tr className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
      <td className="whitespace-nowrap px-5 py-4">
        <Link href={detailHref} className="font-mono text-xs text-[#4b5563] hover:underline">
          {treasure.treasureCode}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={detailHref} className="block truncate font-medium text-[#111827] hover:underline" title={treasure.title}>
          {treasure.title}
        </Link>
      </td>
      <td className="truncate px-5 py-4 text-[#4b5563]" title={treasure.locationLabel}>
        {treasure.locationLabel}
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <SaveStatusBadge status={treasure.status} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <CalculatedStatusBadge status={treasure.calculatedStatus} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-[#6b7280]">{formatAdminTreasurePeriod(treasure.startsAt, treasure.endsAt)}</td>
      <td className="whitespace-nowrap px-5 py-4">
        {treasure.maxClaimCount} / {treasure.currentClaimCount}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-[#6b7280]">{formatAdminTreasureDate(treasure.createdAt)}</td>
      <td className="whitespace-nowrap px-5 py-4">
        <Link href={detailHref} className="inline-flex whitespace-nowrap text-sm font-medium text-[#111827] underline underline-offset-2">
          상세
        </Link>
      </td>
    </tr>
  );
}
