"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_REWARD_DATE_FIELD_LABEL,
  ADMIN_REWARD_RETRY_STATUS_LABEL,
  ADMIN_REWARD_STATUS_LABEL,
  MOCK_ADMIN_REWARD_REQUESTS,
  formatAdminRewardDateTime,
  getAdminRewardDateValue,
  type AdminRewardRequestListItem,
  type AdminRewardDateField,
  type AdminRewardRetryStatus,
  type AdminRewardStatus,
} from "@/lib/admin/mock-reward-requests";

type StatusFilter<T extends string> = "all" | T;
type RewardSortKey = "failed_first" | "claimed_desc" | "claimed_asc" | "failed_desc" | "retry_requested_desc";
type RewardRetryReason =
  | "provider_timeout"
  | "provider_temporary_error"
  | "manual_operator_request"
  | "user_reported_issue"
  | "data_correction"
  | "other";

const adminRole = "super_admin";
const defaultFilters = {
  query: "",
  status: "all" as StatusFilter<AdminRewardStatus>,
  retryStatus: "all" as StatusFilter<AdminRewardRetryStatus>,
  dateField: "claimed_at" as AdminRewardDateField,
  startDate: "",
  endDate: "",
  sort: "failed_first" as RewardSortKey,
  pageSize: 50,
};

const sortOptions: Array<{ label: string; value: RewardSortKey }> = [
  { label: "failed 우선", value: "failed_first" },
  { label: "최신 획득순", value: "claimed_desc" },
  { label: "오래된 획득순", value: "claimed_asc" },
  { label: "최근 실패순", value: "failed_desc" },
  { label: "최근 재처리 요청순", value: "retry_requested_desc" },
];

const retryReasonOptions: Array<{ label: string; value: RewardRetryReason }> = [
  { label: "외부 발급 시스템 응답 지연", value: "provider_timeout" },
  { label: "외부 발급 시스템 일시 오류", value: "provider_temporary_error" },
  { label: "운영자 수동 재처리", value: "manual_operator_request" },
  { label: "사용자 문의 기반 재처리", value: "user_reported_issue" },
  { label: "데이터 보정 후 재처리", value: "data_correction" },
  { label: "기타", value: "other" },
];

function getRewardTone(status: string) {
  if (status === "issued" || status === "succeeded") return "bg-[#dcfce7] text-[#166534]";
  if (status === "failed") return "bg-[#fee2e2] text-[#991b1b]";
  if (status === "requested" || status === "in_progress" || status === "ready") return "bg-[#dbeafe] text-[#1d4ed8]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRewardTone(status)}`}>{label}</span>;
}

export default function AdminRewardRequestsPage() {
  const [items, setItems] = useState<AdminRewardRequestListItem[]>(MOCK_ADMIN_REWARD_REQUESTS);
  const [query, setQuery] = useState(defaultFilters.query);
  const [status, setStatus] = useState(defaultFilters.status);
  const [retryStatus, setRetryStatus] = useState(defaultFilters.retryStatus);
  const [dateField, setDateField] = useState(defaultFilters.dateField);
  const [startDate, setStartDate] = useState(defaultFilters.startDate);
  const [endDate, setEndDate] = useState(defaultFilters.endDate);
  const [sort, setSort] = useState(defaultFilters.sort);
  const [pageSize, setPageSize] = useState(defaultFilters.pageSize);
  const [page, setPage] = useState(1);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [selectedRetryReward, setSelectedRetryReward] = useState<AdminRewardRequestListItem | null>(null);
  const [retryReason, setRetryReason] = useState<RewardRetryReason | "">("");
  const [retryNote, setRetryNote] = useState("");
  const [retryError, setRetryError] = useState("");
  const [isCreatingRetry, setIsCreatingRetry] = useState(false);
  const [toast, setToast] = useState("");

  const canExportCsv = adminRole === "super_admin" || adminRole === "operator";
  const dateRangeError = Boolean(startDate && endDate && startDate > endDate);

  const resetPage = () => setPage(1);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (dateRangeError) return [];

    return [...items]
      .filter((item) => {
        const matchesQuery = [
          item.rewardId,
          item.userDisplayId,
          item.userNickname,
          item.treasureTitle,
          item.productName ?? "",
          item.providerRequestId ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesStatus = status === "all" || item.status === status;
        const matchesRetry = retryStatus === "all" || item.retryRequestStatus === retryStatus;
        const dateValue = getAdminRewardDateValue(item, dateField)?.slice(0, 10) ?? "";
        const matchesStart = !startDate || (dateValue && dateValue >= startDate);
        const matchesEnd = !endDate || (dateValue && dateValue <= endDate);

        return matchesQuery && matchesStatus && matchesRetry && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        if (sort === "claimed_asc") return new Date(a.claimedAt).getTime() - new Date(b.claimedAt).getTime();
        if (sort === "failed_desc") return new Date(b.failedAt ?? 0).getTime() - new Date(a.failedAt ?? 0).getTime();
        if (sort === "retry_requested_desc") return new Date(b.latestRetryRequestedAt ?? 0).getTime() - new Date(a.latestRetryRequestedAt ?? 0).getTime();
        if (sort === "failed_first") {
          const failedDelta = Number(b.status === "failed") - Number(a.status === "failed");
          if (failedDelta !== 0) return failedDelta;
        }
        return new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime();
      });
  }, [dateField, dateRangeError, endDate, items, query, retryStatus, sort, startDate, status]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItemNumber = filteredItems.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItemNumber = Math.min(safePage * pageSize, filteredItems.length);

  const resetFilters = () => {
    setQuery(defaultFilters.query);
    setStatus(defaultFilters.status);
    setRetryStatus(defaultFilters.retryStatus);
    setDateField(defaultFilters.dateField);
    setStartDate(defaultFilters.startDate);
    setEndDate(defaultFilters.endDate);
    setSort(defaultFilters.sort);
    setPageSize(defaultFilters.pageSize);
    setPage(1);
  };

  const openRetryDialog = (item: AdminRewardRequestListItem) => {
    setSelectedRetryReward(item);
    setRetryReason("");
    setRetryNote("");
    setRetryError("");
  };

  const closeRetryDialog = () => {
    if (isCreatingRetry) return;
    setSelectedRetryReward(null);
    setRetryReason("");
    setRetryNote("");
    setRetryError("");
  };

  const createRetryRequest = async () => {
    if (!selectedRetryReward) return;
    if (!retryReason) {
      setRetryError("재처리 사유를 선택하세요.");
      return;
    }
    if (retryNote.length > 500) {
      setRetryError("내부 메모는 500자 이하로 입력하세요.");
      return;
    }

    setIsCreatingRetry(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const now = new Date().toISOString();
    setItems((current) =>
      current.map((item) =>
        item.rewardId === selectedRetryReward.rewardId
          ? { ...item, retryRequestStatus: "requested", latestRetryRequestedAt: now, updatedAt: now }
          : item,
      ),
    );
    setIsCreatingRetry(false);
    setToast("재처리 요청을 생성했습니다.");
    setSelectedRetryReward(null);
    setRetryReason("");
    setRetryNote("");
    setRetryError("");
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">보상 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">보상 상태와 재처리 요청 현황을 mock data 기준으로 조회합니다.</p>
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

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(260px,1fr)_140px_160px_150px_145px_145px] gap-3">
          <input
            aria-label="보상 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="보물명·상품명·유저 ID·닉네임·발급 요청 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            aria-label="보상 상태"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter<AdminRewardStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">상태 전체</option>
            {Object.keys(ADMIN_REWARD_STATUS_LABEL).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            aria-label="재처리 요청 상태"
            value={retryStatus}
            onChange={(event) => {
              setRetryStatus(event.target.value as StatusFilter<AdminRewardRetryStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">재처리 전체</option>
            {Object.entries(ADMIN_REWARD_RETRY_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            aria-label="기간 기준"
            value={dateField}
            onChange={(event) => {
              setDateField(event.target.value as AdminRewardDateField);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {Object.entries(ADMIN_REWARD_DATE_FIELD_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            aria-label="시작일"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
          <input
            aria-label="종료일"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={resetFilters} className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            초기화
          </button>
          <div className="flex items-center gap-3">
            <select
              aria-label="정렬"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as RewardSortKey);
                resetPage();
              }}
              className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              aria-label="표시 수"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                resetPage();
              }}
              className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
            >
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </select>
          </div>
        </div>
        {dateRangeError ? <p className="mt-3 text-sm text-[#b91c1c]">시작일은 종료일보다 늦을 수 없습니다.</p> : null}
      </section>

      {toast ? <div role="status" className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">{toast}</div> : null}

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>{startItemNumber}-{endItemNumber} / {filteredItems.length}건</span>
        <span>쿠폰 번호, 바코드, 사용자 이메일은 목록과 CSV에 포함하지 않습니다.</span>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">획득일</th>
              <th className="px-5 py-3 font-medium">유저</th>
              <th className="px-5 py-3 font-medium">보물명</th>
              <th className="px-5 py-3 font-medium">상품명</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">외부 발급 요청 ID</th>
              <th className="px-5 py-3 font-medium">최근 실패 코드</th>
              <th className="px-5 py-3 font-medium">재처리 요청</th>
              <th className="px-5 py-3 font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.rewardId} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminRewardDateTime(item.claimedAt)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-[#111827]">{item.userNickname}</p>
                  <p className="mt-1 font-mono text-xs text-[#6b7280]">{item.userDisplayId}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-[#111827]">{item.treasureTitle}</p>
                  <p className="mt-1 font-mono text-xs text-[#6b7280]">{item.treasureBoxId}</p>
                </td>
                <td className="px-5 py-4">{item.productName ?? "상품 미연결"}</td>
                <td className="px-5 py-4"><StatusBadge label={ADMIN_REWARD_STATUS_LABEL[item.status]} status={item.status} /></td>
                <td className="px-5 py-4 font-mono text-xs text-[#4b5563]">{item.providerRequestId ?? "-"}</td>
                <td className="px-5 py-4 font-mono text-xs text-[#b91c1c]">{item.lastFailureCode ?? "-"}</td>
                <td className="px-5 py-4"><StatusBadge label={ADMIN_REWARD_RETRY_STATUS_LABEL[item.retryRequestStatus]} status={item.retryRequestStatus} /></td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <Link href={`/admin/rewards/${item.rewardId}`} className="font-medium text-[#111827] underline underline-offset-2">
                      상세
                    </Link>
                    {canExportCsv && item.status === "failed" && item.retryRequestStatus !== "requested" && item.retryRequestStatus !== "in_progress" ? (
                      <button type="button" onClick={() => openRetryDialog(item)} className="text-[#1d4ed8] underline underline-offset-2">
                        재처리 요청 생성
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 보상이 없습니다. 필터를 조정해 주세요.</p>
            <button type="button" onClick={resetFilters} className="mt-5 rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              필터 초기화
            </button>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={safePage <= 1}
          className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]"
        >
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
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={safePage >= totalPages}
          className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]"
        >
          다음
        </button>
      </div>

      {isCsvDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="reward-csv-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="reward-csv-title" className="text-lg font-bold">CSV 내보내기</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 검색·필터·정렬 조건의 보상 목록을 CSV로 내보냅니다. 쿠폰 번호, 바코드, 사용자 이메일, 외부 API Secret은 포함하지 않습니다.
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

      {selectedRetryReward ? (
        <div role="dialog" aria-modal="true" aria-labelledby="reward-retry-title" aria-describedby="reward-retry-description" className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-6">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="reward-retry-title" className="text-lg font-bold">재처리 요청 생성</h2>
            <p id="reward-retry-description" className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 발급 실패 상태의 보상을 다시 처리하도록 요청합니다. 동일 보상에 진행 중인 요청이 있으면 중복 생성이 차단됩니다.
            </p>
            <dl className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#6b7280]">보상 ID</dt>
                <dd className="font-mono text-xs font-medium text-[#111827]">{selectedRetryReward.rewardId}</dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt className="text-[#6b7280]">보상 상태</dt>
                <dd><StatusBadge label={selectedRetryReward.status} status={selectedRetryReward.status} /></dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt className="text-[#6b7280]">상품</dt>
                <dd className="text-right font-medium text-[#111827]">{selectedRetryReward.productName ?? "상품 미연결"}</dd>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <dt className="text-[#6b7280]">최근 실패 코드</dt>
                <dd className="font-mono text-xs font-medium text-[#b91c1c]">{selectedRetryReward.lastFailureCode ?? "-"}</dd>
              </div>
            </dl>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">재처리 사유</span>
              <select
                value={retryReason}
                onChange={(event) => {
                  setRetryReason(event.target.value as RewardRetryReason);
                  setRetryError("");
                }}
                className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#111827]"
                autoFocus
              >
                <option value="">재처리 사유를 선택하세요</option>
                {retryReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">내부 메모</span>
              <span className="ml-2 text-xs text-[#6b7280]">추가 설명 또는 메모</span>
              <textarea
                value={retryNote}
                onChange={(event) => {
                  setRetryNote(event.target.value);
                  setRetryError("");
                }}
                maxLength={500}
                className="mt-1 min-h-28 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                placeholder="CMS 내부 관리자용 메모입니다. 사용자 앱에는 노출되지 않습니다."
              />
              <span className="mt-1 block text-right text-xs text-[#6b7280]">{retryNote.length}/500</span>
            </label>
            {retryError ? <p role="alert" className="mt-2 text-xs font-medium text-[#b91c1c]">{retryError}</p> : null}
            <p className="mt-4 rounded-md bg-[#f9fafb] p-3 text-xs leading-5 text-[#6b7280]">
              이 팝업은 기프티쇼비즈 API를 직접 호출하지 않으며, 요청 생성 후에도 reward.status는 failed 상태를 유지합니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeRetryDialog} disabled={isCreatingRetry} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-[#9ca3af]">
                취소
              </button>
              <button type="button" onClick={() => void createRetryRequest()} disabled={!retryReason || isCreatingRetry} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]">
                {isCreatingRetry ? "생성 중..." : "재처리 요청 생성"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
