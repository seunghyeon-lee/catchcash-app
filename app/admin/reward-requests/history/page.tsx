"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL,
  MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY,
  formatAdminRewardDateTime,
  type AdminRewardRetryRequestHistoryItem,
  type AdminRewardRetryRequestStatus,
  type AdminRewardRetryWorkerResult,
} from "@/lib/admin/mock-reward-requests";

type StatusFilter<T extends string> = "all" | T;
type WorkerResultFilter = "all" | "none" | Exclude<AdminRewardRetryWorkerResult, null>;

const adminRole = "super_admin";
const defaultFilters = {
  query: "",
  status: "all" as StatusFilter<AdminRewardRetryRequestStatus>,
  workerResult: "all" as WorkerResultFilter,
  rewardId: "",
  from: "",
  to: "",
  pageSize: 20,
};

function getStatusTone(status: string) {
  if (status === "success") return "bg-[#dcfce7] text-[#166534]";
  if (status === "failed") return "bg-[#fee2e2] text-[#991b1b]";
  if (status === "processing") return "bg-[#dbeafe] text-[#1d4ed8]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(status)}`}>{label}</span>;
}

function getProcessDuration(item: AdminRewardRetryRequestHistoryItem) {
  if (!item.processingStartedAt || !item.processedAt) return "-";
  const minutes = Math.max(1, Math.round((new Date(item.processedAt).getTime() - new Date(item.processingStartedAt).getTime()) / 60000));
  return `약 ${minutes}분`;
}

export default function AdminRewardRetryRequestHistoryPage() {
  const [query, setQuery] = useState(defaultFilters.query);
  const [status, setStatus] = useState(defaultFilters.status);
  const [workerResult, setWorkerResult] = useState(defaultFilters.workerResult);
  const [rewardId, setRewardId] = useState(defaultFilters.rewardId);
  const [from, setFrom] = useState(defaultFilters.from);
  const [to, setTo] = useState(defaultFilters.to);
  const [pageSize, setPageSize] = useState(defaultFilters.pageSize);
  const [page, setPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<AdminRewardRetryRequestHistoryItem | null>(null);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  const canExportCsv = adminRole === "super_admin" || adminRole === "operator";
  const dateRangeError = Boolean(from && to && from > to);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialRewardId = searchParams.get("rewardId");
    const initialRetryRequestId = searchParams.get("retryRequestId");
    if (initialRewardId) setRewardId(initialRewardId);
    if (initialRetryRequestId) {
      const target = MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY.find((item) => item.retryRequestId === initialRetryRequestId);
      if (target) setSelectedHistory(target);
    }
  }, []);

  const resetPage = () => setPage(1);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedRewardId = rewardId.trim().toLowerCase();

    if (dateRangeError) return [];

    return [...MOCK_ADMIN_REWARD_RETRY_REQUEST_HISTORY]
      .filter((item) => {
        const matchesQuery = [item.retryRequestId, item.rewardId, item.providerRequestId ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesStatus = status === "all" || item.retryStatus === status;
        const matchesWorker = workerResult === "all" || (workerResult === "none" ? item.workerResult === null : item.workerResult === workerResult);
        const matchesReward = !normalizedRewardId || item.rewardId.toLowerCase().includes(normalizedRewardId);
        const createdDate = item.createdAt.slice(0, 10);
        const matchesFrom = !from || createdDate >= from;
        const matchesTo = !to || createdDate <= to;

        return matchesQuery && matchesStatus && matchesWorker && matchesReward && matchesFrom && matchesTo;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [dateRangeError, from, query, rewardId, status, to, workerResult]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetFilters = () => {
    setQuery(defaultFilters.query);
    setStatus(defaultFilters.status);
    setWorkerResult(defaultFilters.workerResult);
    setRewardId(defaultFilters.rewardId);
    setFrom(defaultFilters.from);
    setTo(defaultFilters.to);
    setPageSize(defaultFilters.pageSize);
    setPage(1);
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">재처리 요청 이력</h1>
          <p className="mt-2 text-sm text-[#6b7280]">실패 보상에 대한 재처리 요청과 Worker 처리 결과를 확인합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/reward-requests" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            목록으로 돌아가기
          </Link>
          {canExportCsv ? (
            <button type="button" onClick={() => setIsCsvDialogOpen(true)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
              CSV 내보내기
            </button>
          ) : null}
        </div>
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(240px,1fr)_150px_150px_220px_145px_145px] gap-3">
          <input
            aria-label="재처리 요청 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="요청 ID / 보상 ID / 외부 발급 요청 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            aria-label="재처리 요청 상태"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter<AdminRewardRetryRequestStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">상태 전체</option>
            {Object.entries(ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            aria-label="처리 결과"
            value={workerResult}
            onChange={(event) => {
              setWorkerResult(event.target.value as WorkerResultFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">결과 전체</option>
            <option value="none">결과 없음</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
          </select>
          <input
            aria-label="보상 ID 검색"
            value={rewardId}
            onChange={(event) => {
              setRewardId(event.target.value);
              resetPage();
            }}
            placeholder="특정 보상 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <input
            aria-label="생성 시작일"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
          <input
            aria-label="생성 종료일"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={resetFilters} className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            초기화
          </button>
          <select
            aria-label="페이지 크기"
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
        {dateRangeError ? <p className="mt-3 text-sm text-[#b91c1c]">시작일은 종료일보다 늦을 수 없습니다.</p> : null}
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>총 {filteredItems.length}건 · mock data</span>
        <span>쿠폰 번호, 바코드, 사용자 이메일, 외부 API Secret은 표시하지 않습니다.</span>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">요청 ID</th>
              <th className="px-5 py-3 font-medium">대상 보상</th>
              <th className="px-5 py-3 font-medium">보물</th>
              <th className="px-5 py-3 font-medium">상품</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">생성 사유</th>
              <th className="px-5 py-3 font-medium">처리 결과</th>
              <th className="px-5 py-3 font-medium">생성자</th>
              <th className="px-5 py-3 font-medium">생성 시각</th>
              <th className="px-5 py-3 font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.retryRequestId} onClick={() => setSelectedHistory(item)} className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                <td className="px-5 py-4 font-mono text-xs">{item.retryRequestId}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/rewards/${item.rewardId}`} onClick={(event) => event.stopPropagation()} className="font-mono text-xs font-medium underline underline-offset-2">
                    {item.rewardId}
                  </Link>
                </td>
                <td className="px-5 py-4">{item.treasureTitle}</td>
                <td className="px-5 py-4">{item.productName ?? "상품 미연결"}</td>
                <td className="px-5 py-4"><StatusBadge label={ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL[item.retryStatus]} status={item.retryStatus} /></td>
                <td className="max-w-[180px] truncate px-5 py-4">{item.reason}</td>
                <td className="px-5 py-4">{item.workerResult ? <StatusBadge label={item.workerResult} status={item.workerResult} /> : "-"}</td>
                <td className="px-5 py-4">{item.requestedByAdminName}</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminRewardDateTime(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedHistory(item); }} className="font-medium underline underline-offset-2">
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 재처리 요청이 없습니다. 필터를 조정해 주세요.</p>
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

      <DialogOverlay open={isCsvDialogOpen} onClose={() => setIsCsvDialogOpen(false)} labelledBy="retry-history-csv-title">
        <h2 id="retry-history-csv-title" className="text-lg font-bold">CSV 내보내기</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          현재 필터 조건 기준으로 재처리 요청 이력을 CSV로 내보냅니다. 사용자 이메일, 쿠폰 번호, 바코드, 기프티쇼비즈 Secret은 포함하지 않습니다.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
            취소
          </button>
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            내보내기
          </button>
        </div>
      </DialogOverlay>

      {selectedHistory ? (
        <DialogOverlay open onClose={() => setSelectedHistory(null)} labelledBy="retry-history-detail-title" className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
          <h2 id="retry-history-detail-title" className="text-lg font-bold">재처리 요청 상세</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <DetailCard title="기본 정보">
              <DetailRow label="요청 ID" value={selectedHistory.retryRequestId} />
              <DetailRow label="상태" value={<StatusBadge label={ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL[selectedHistory.retryStatus]} status={selectedHistory.retryStatus} />} />
              <DetailRow label="요청 시각" value={formatAdminRewardDateTime(selectedHistory.createdAt)} />
              <DetailRow label="처리 시각" value={formatAdminRewardDateTime(selectedHistory.processedAt)} />
              <DetailRow label="요청자" value={selectedHistory.requestedByAdminName} />
              <DetailRow label="처리 방식" value="worker" />
            </DetailCard>
            <DetailCard title="대상 보상 정보">
              <DetailRow label="보상 ID" value={selectedHistory.rewardId} />
              <DetailRow label="유저" value={selectedHistory.userPublicId} />
              <DetailRow label="보물" value={selectedHistory.treasureTitle} />
              <DetailRow label="상품" value={selectedHistory.productName ?? "상품 미연결"} />
              <DetailRow label="현재 보상 상태" value={selectedHistory.rewardStatus} />
              <DetailRow label="외부 발급 요청 ID" value={selectedHistory.providerRequestId ?? "-"} />
            </DetailCard>
            <DetailCard title="처리 결과">
              <DetailRow label="처리 결과" value={selectedHistory.workerResult ?? "-"} />
              <DetailRow label="실패 코드" value={selectedHistory.workerErrorCode ?? "-"} />
              <DetailRow label="실패 사유" value={selectedHistory.workerErrorMessage ?? "-"} />
              <DetailRow label="처리 소요 시간" value={getProcessDuration(selectedHistory)} />
              <DetailRow label="외부 발급 요청 ID" value={selectedHistory.providerRequestId ?? "-"} />
            </DetailCard>
            <DetailCard title="생성 사유 및 메모">
              <DetailRow label="생성 사유" value={selectedHistory.reason} />
              <DetailRow label="내부 메모" value={selectedHistory.internalMemo ?? "-"} />
              <DetailRow label="이전 실패 코드" value={selectedHistory.previousErrorCode ?? "-"} />
              <DetailRow label="이전 실패 사유" value={selectedHistory.previousErrorMessage ?? "-"} />
            </DetailCard>
          </div>
          <p className="mt-5 rounded-md bg-[#f9fafb] p-3 text-xs leading-5 text-[#6b7280]">
            이 상세 팝업은 조회 전용이며, 쿠폰 번호와 바코드, 사용자 이메일, 외부 API Secret을 표시하지 않습니다.
          </p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setSelectedHistory(null)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              닫기
            </button>
          </div>
        </DialogOverlay>
      ) : null}
    </AdminShell>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] p-4">
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      <dl className="mt-3">{children}</dl>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[#f3f4f6] py-2 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-xs text-[#6b7280]">{label}</dt>
      <dd className="max-w-[65%] text-right text-xs font-medium text-[#111827]">{value}</dd>
    </div>
  );
}
