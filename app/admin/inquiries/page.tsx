"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import { ADMIN_CATEGORY_LABEL, ADMIN_STATUS_LABEL, formatAdminDate, type AdminInquiryCategory, type AdminInquiryStatus, type AdminSupportInquiry } from "@/lib/admin/mock-inquiries";
import { loadAdminInquiries, type AdminInquiryDataSource } from "@/lib/admin/support-service";

type CategoryFilter = "all" | AdminInquiryCategory;
type StatusFilter = "all" | AdminInquiryStatus;
type AnswerFilter = "all" | "answered" | "unanswered";
type RewardFilter = "all" | "has_reward" | "no_reward";
type InquirySortKey = "created_desc" | "created_asc" | "unresolved_first" | "answered_first";

const adminRole = "super_admin";

const defaultFilters = {
  query: "",
  category: "all" as CategoryFilter,
  status: "all" as StatusFilter,
  answer: "all" as AnswerFilter,
  reward: "all" as RewardFilter,
  from: "",
  to: "",
  sort: "created_desc" as InquirySortKey,
  pageSize: 20,
};

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "카테고리 전체", value: "all" },
  { label: "이용 문의", value: "general" },
  { label: "쿠폰 문의", value: "coupon" },
  { label: "보상 문의", value: "reward" },
  { label: "계정 문의", value: "account" },
  { label: "오류 제보", value: "bug" },
  { label: "개선 문의", value: "improvement" },
  { label: "기타 문의", value: "etc" },
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "상태 전체", value: "all" },
  { label: "접수", value: "received" },
  { label: "읽는 중/확인 중", value: "reading" },
  { label: "처리 중", value: "in_progress" },
  { label: "해결됨/답변 완료", value: "resolved" },
  { label: "종료", value: "closed" },
];

const answerOptions: Array<{ label: string; value: AnswerFilter }> = [
  { label: "답변 여부 전체", value: "all" },
  { label: "답변 전", value: "unanswered" },
  { label: "답변 완료", value: "answered" },
];

const rewardOptions: Array<{ label: string; value: RewardFilter }> = [
  { label: "연관 보상 전체", value: "all" },
  { label: "연관 보상 있음", value: "has_reward" },
  { label: "연관 보상 없음", value: "no_reward" },
];

const sortOptions: Array<{ label: string; value: InquirySortKey }> = [
  { label: "최근 접수순", value: "created_desc" },
  { label: "오래된 접수순", value: "created_asc" },
  { label: "미처리 우선", value: "unresolved_first" },
  { label: "답변 완료 우선", value: "answered_first" },
];

function getStatusTone(status: AdminInquiryStatus) {
  if (status === "resolved" || status === "answered" || status === "closed") return "bg-[#dcfce7] text-[#166534]";
  if (status === "reading" || status === "in_progress") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[#dbeafe] text-[#1d4ed8]";
}

function normalizeStatusForFilter(status: AdminInquiryStatus) {
  if (status === "open") return "received";
  if (status === "answered") return "resolved";
  return status;
}

function normalizeCategoryForFilter(category: AdminInquiryCategory) {
  if (category === "usage") return "general";
  if (category === "error") return "bug";
  if (category === "other") return "etc";
  return category;
}

function isInquiryAnswered(item: AdminSupportInquiry) {
  return item.replies.length > 0 || item.status === "resolved" || item.status === "answered";
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [query, setQuery] = useState(defaultFilters.query);
  const [category, setCategory] = useState(defaultFilters.category);
  const [status, setStatus] = useState(defaultFilters.status);
  const [answer, setAnswer] = useState(defaultFilters.answer);
  const [reward, setReward] = useState(defaultFilters.reward);
  const [from, setFrom] = useState(defaultFilters.from);
  const [to, setTo] = useState(defaultFilters.to);
  const [sort, setSort] = useState(defaultFilters.sort);
  const [pageSize, setPageSize] = useState(defaultFilters.pageSize);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminSupportInquiry | null>(null);
  const [inquiries, setInquiries] = useState<AdminSupportInquiry[]>([]);
  const [source, setSource] = useState<AdminInquiryDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await loadAdminInquiries();
      setInquiries(result.inquiries);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch {
      setInquiries([]);
      setSource(null);
      setMessage("문의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canExportCsv = adminRole === "super_admin" || adminRole === "operator";
  const dateRangeError = Boolean(from && to && from > to);

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setQuery(defaultFilters.query);
    setCategory(defaultFilters.category);
    setStatus(defaultFilters.status);
    setAnswer(defaultFilters.answer);
    setReward(defaultFilters.reward);
    setFrom(defaultFilters.from);
    setTo(defaultFilters.to);
    setSort(defaultFilters.sort);
    setPageSize(defaultFilters.pageSize);
    setPage(1);
  };

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (dateRangeError) return [];

    return [...inquiries]
      .filter((item) => {
        const itemCategory = normalizeCategoryForFilter(item.category);
        const itemStatus = normalizeStatusForFilter(item.status);
        const itemAnswered = isInquiryAnswered(item);
        const itemDate = item.created_at.slice(0, 10);
        const hasReward = Boolean(item.related_reward_id);
        const matchesQuery = [item.id, item.title, item.content, item.user_nickname, item.user_id, item.related_reward_id ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesCategory = category === "all" || itemCategory === category;
        const matchesStatus = status === "all" || itemStatus === normalizeStatusForFilter(status);
        const matchesAnswer = answer === "all" || (answer === "answered" ? itemAnswered : !itemAnswered);
        const matchesReward = reward === "all" || (reward === "has_reward" ? hasReward : !hasReward);
        const matchesFrom = !from || itemDate >= from;
        const matchesTo = !to || itemDate <= to;

        return matchesQuery && matchesCategory && matchesStatus && matchesAnswer && matchesReward && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        if (sort === "created_asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sort === "unresolved_first") return Number(isInquiryAnswered(a)) - Number(isInquiryAnswered(b)) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sort === "answered_first") return Number(isInquiryAnswered(b)) - Number(isInquiryAnswered(a)) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [answer, category, dateRangeError, from, inquiries, query, reward, sort, status, to]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItemNumber = items.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItemNumber = Math.min(safePage * pageSize, items.length);

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">문의 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">사용자 문의와 답변 처리 상태를 확인합니다. 목록에서는 답변 작성이나 상태 변경을 수행하지 않습니다.</p>
        </div>
        {canExportCsv ? (
          <button type="button" onClick={() => setIsCsvDialogOpen(true)} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            CSV 내보내기
          </button>
        ) : null}
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(260px,1fr)_150px_150px_150px_165px_135px_135px_150px_130px] gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="문의 검색 (유저 ID·닉네임·문의 내용)"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as CategoryFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value as AnswerFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {answerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            value={reward}
            onChange={(event) => {
              setReward(event.target.value as RewardFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {rewardOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input
            aria-label="접수 시작일"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
          <input
            aria-label="접수 종료일"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as InquirySortKey);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            aria-label="페이지 크기"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
            <option value={100}>100개씩</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={resetFilters} className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            필터 초기화
          </button>
          <span className="text-xs text-[#6b7280]">pageSize는 20 / 50 / 100개를 지원합니다.</span>
        </div>
        {dateRangeError ? <p className="mt-3 text-sm text-[#b91c1c]">접수 시작일은 종료일보다 늦을 수 없습니다.</p> : null}
      </section>

      {message ? (
        <div role="status" className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"}`}>
          <span>{message}</span>
          {source !== "mock" ? <button type="button" onClick={() => void load()} className="font-medium underline">다시 시도</button> : null}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>{startItemNumber}-{endItemNumber} / {items.length}건 {source === "mock" ? "· mock data" : ""}</span>
        <span>사용자 이메일, 전화번호, 쿠폰 번호, 바코드, token은 표시하지 않습니다.</span>
      </div>

      <section aria-busy={isLoading} className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">문의 ID</th>
              <th className="px-5 py-3 font-medium">카테고리</th>
              <th className="px-5 py-3 font-medium">제목 요약</th>
              <th className="px-5 py-3 font-medium">유저 닉네임</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">답변 여부</th>
              <th className="px-5 py-3 font-medium">연관 보상</th>
              <th className="px-5 py-3 font-medium">접수일시</th>
              <th className="px-5 py-3 font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const answered = isInquiryAnswered(item);
              const rewardId = item.related_reward_id;

              return (
                <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-[#111827]">INQ-{item.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 max-w-36 truncate font-mono text-[11px] text-[#9ca3af]">{item.id}</p>
                  </td>
                  <td className="px-5 py-4">{ADMIN_CATEGORY_LABEL[item.category]}</td>
                  <td className="max-w-[280px] px-5 py-4">
                    <p className="truncate font-medium text-[#111827]">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-[#6b7280]">{item.content}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/users/${item.user_id}`} onClick={(event) => event.stopPropagation()} className="font-medium underline underline-offset-2">
                      {item.user_nickname}
                    </Link>
                    <p className="mt-1 font-mono text-[11px] text-[#9ca3af]">{item.user_id.slice(0, 8)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(item.status)}`}>{ADMIN_STATUS_LABEL[item.status]}</span>
                  </td>
                  <td className="px-5 py-4">{answered ? "답변 완료" : "답변 전"}</td>
                  <td className="px-5 py-4">
                    {rewardId ? (
                      <Link href={`/admin/rewards/${rewardId}`} onClick={(event) => event.stopPropagation()} className="font-mono text-xs underline underline-offset-2">
                        {rewardId}
                      </Link>
                    ) : (
                      <span className="text-[#9ca3af]">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#6b7280]">{formatAdminDate(item.created_at)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/inquiries/${item.id}`} onClick={(event) => event.stopPropagation()} className="font-medium underline underline-offset-2">
                      상세
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {isLoading ? <p className="p-12 text-center text-sm text-[#6b7280]">문의 목록을 불러오는 중입니다.</p> : null}
        {!isLoading && items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">조건과 일치하는 문의가 없습니다. 필터를 조정해 주세요.</p>
            <button type="button" onClick={resetFilters} className="mt-5 rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              필터 초기화
            </button>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <p className="text-[#6b7280]">문의 상세 이동과 답변 작성 흐름은 `/admin/inquiries/[id]`에서 유지됩니다.</p>
        <nav aria-label="문의 목록 페이지네이션" className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1} className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]">
            이전
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              aria-current={safePage === pageNumber ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md px-2 ${safePage === pageNumber ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"}`}
            >
              {pageNumber}
            </button>
          ))}
          <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages} className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]">
            다음
          </button>
        </nav>
      </div>

      <DialogOverlay open={!!selected} onClose={() => setSelected(null)} labelledBy="inquiry-detail-dialog-title">
        <h2 id="inquiry-detail-dialog-title" className="text-lg font-bold">문의 상세로 이동</h2>
        <p className="mt-2 text-sm text-[#6b7280]">선택한 문의의 상세 내용을 확인합니다.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setSelected(null)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">취소</button>
          <button type="button" onClick={() => { if (selected) router.push(`/admin/inquiries/${selected.id}`); }} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">상세 보기</button>
        </div>
      </DialogOverlay>

      <DialogOverlay open={isCsvDialogOpen} onClose={() => setIsCsvDialogOpen(false)} labelledBy="inquiry-csv-dialog-title">
        <h2 id="inquiry-csv-dialog-title" className="text-lg font-bold">CSV 내보내기</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          현재 필터 조건 기준으로 문의 목록 CSV를 내보내는 shell입니다. 사용자 이메일, 전화번호, 쿠폰 번호, 바코드, API Secret, token은 포함하지 않습니다.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">취소</button>
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">확인</button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
