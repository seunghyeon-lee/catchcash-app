"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL,
  ADMIN_REWARD_RETRY_STATUS_LABEL,
  ADMIN_REWARD_STATUS_LABEL,
  findAdminRewardDetail,
  formatAdminRewardDateTime,
  getAdminRewardRetryHistoryByRewardId,
  getLatestAdminRewardRetryRequest,
  type AdminRewardDetail,
} from "@/lib/admin/mock-reward-requests";

const adminRole = "super_admin";
const retryReasonOptions = [
  "외부 발급 시스템 응답 지연",
  "외부 발급 시스템 일시 오류",
  "운영자 수동 재처리",
  "사용자 문의 기반 재처리",
  "데이터 보정 후 재처리",
  "기타",
];

function getRewardTone(status: string) {
  if (status === "issued" || status === "used" || status === "success" || status === "succeeded") return "bg-[#dcfce7] text-[#166534]";
  if (status === "failed") return "bg-[#fee2e2] text-[#991b1b]";
  if (status === "ready" || status === "pending" || status === "processing" || status === "requested" || status === "in_progress") return "bg-[#dbeafe] text-[#1d4ed8]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRewardTone(status)}`}>{label}</span>;
}

function getElapsedTime(value: string | null) {
  if (!value) return "-";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 ${minutes % 60}분`;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[68%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function DetailCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
      <div>
        <h2 className="text-base font-bold text-[#111827]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#6b7280]">{description}</p> : null}
      </div>
      <dl className="mt-4">{children}</dl>
    </section>
  );
}

function RelationCard({ title, href, primary, secondary, meta }: { title: string; href: string; primary: string; secondary: string; meta?: string }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">{title}</p>
          <p className="mt-2 text-sm font-semibold text-[#111827]">{primary}</p>
          <p className="mt-1 font-mono text-xs text-[#6b7280]">{secondary}</p>
          {meta ? <p className="mt-1 text-xs text-[#6b7280]">{meta}</p> : null}
        </div>
        <Link href={href} className="shrink-0 rounded-md border border-[#d1d5db] px-3 py-2 text-xs font-medium hover:bg-[#f9fafb]">
          이동
        </Link>
      </div>
    </div>
  );
}

export default function AdminRewardDetailPage() {
  const params = useParams<{ id: string }>();
  const rewardId = params.id;
  const reward = useMemo(() => findAdminRewardDetail(rewardId), [rewardId]);
  const retryHistory = useMemo(() => getAdminRewardRetryHistoryByRewardId(rewardId), [rewardId]);
  const latestRetryRequest = useMemo(() => getLatestAdminRewardRetryRequest(rewardId), [rewardId]);

  const [memo, setMemo] = useState(reward?.internalMemo ?? "");
  const [memoError, setMemoError] = useState("");
  const [toast, setToast] = useState("");
  const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
  const [retryReason, setRetryReason] = useState("");
  const [retryMemo, setRetryMemo] = useState("");
  const [retryError, setRetryError] = useState("");
  const [isCreatingRetry, setIsCreatingRetry] = useState(false);

  const canManage = adminRole === "super_admin" || adminRole === "operator";
  const hasActiveRetryRequest = latestRetryRequest?.retryStatus === "pending" || latestRetryRequest?.retryStatus === "processing";
  const canCreateRetryRequest = Boolean(reward && canManage && reward.status === "failed" && !hasActiveRetryRequest);

  const saveMemo = () => {
    if (memo.length > 1000) {
      setMemoError("내부 메모는 1,000자 이하로 입력하세요.");
      return;
    }
    setMemoError("");
    setToast("내부 메모를 mock 저장했습니다.");
  };

  const createRetryRequest = async () => {
    if (!reward || !canCreateRetryRequest) return;
    if (retryReason.trim().length < 2) {
      setRetryError("재처리 사유를 선택하거나 2자 이상 입력하세요.");
      return;
    }
    if (retryReason.length > 100) {
      setRetryError("재처리 사유는 100자 이하로 입력하세요.");
      return;
    }
    if (retryMemo.length > 1000) {
      setRetryError("내부 메모는 1,000자 이하로 입력하세요.");
      return;
    }

    setIsCreatingRetry(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setIsCreatingRetry(false);
    setIsRetryDialogOpen(false);
    setRetryReason("");
    setRetryMemo("");
    setRetryError("");
    setToast("재처리 요청을 mock 생성했습니다. 실제 발급 재시도는 Worker 처리 대상입니다.");
  };

  if (!reward) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">보상 정보를 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">목록으로 돌아가서 다시 확인해주세요.</p>
          <Link href="/admin/reward-requests" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            보상 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">보상 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">보상 상태, 발급 요청, 실패 사유, 재처리 요청 현황을 mock data 기준으로 확인합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/reward-requests" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            목록으로 돌아가기
          </Link>
          <Link href={`/admin/reward-requests/history?rewardId=${reward.rewardId}`} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            재처리 요청 이력
          </Link>
          {canManage ? (
            <button
              type="button"
              onClick={() => setIsRetryDialogOpen(true)}
              disabled={!canCreateRetryRequest}
              className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
            >
              재처리 요청 생성
            </button>
          ) : null}
        </div>
      </div>

      {toast ? <div role="status" className="mt-5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">{toast}</div> : null}

      <div className="mt-7 grid grid-cols-[1.1fr_0.9fr] gap-5">
        <DetailCard title="기본 정보">
          <DetailRow label="보상 ID" value={<span className="font-mono text-xs">{reward.rewardId}</span>} />
          <DetailRow label="상태" value={<StatusBadge label={ADMIN_REWARD_STATUS_LABEL[reward.status]} status={reward.status} />} />
          <DetailRow label="획득일시" value={formatAdminRewardDateTime(reward.claimedAt)} />
          <DetailRow label="발급 요청일시" value={formatAdminRewardDateTime(reward.issueRequestedAt)} />
          <DetailRow label="발급 완료일시" value={formatAdminRewardDateTime(reward.issuedAt)} />
          <DetailRow label="외부 발급 요청 ID" value={reward.providerRequestId ?? "-"} />
          <DetailRow label="기한" value={formatAdminRewardDateTime(reward.expiresAt)} />
        </DetailCard>

        <DetailCard title="실패 사유 및 재시도 현황" description="processing은 보상 상태가 아니라 재처리 요청 상태에서만 표시합니다.">
          <DetailRow label="실패 코드" value={reward.lastFailureCode ?? "-"} />
          <DetailRow label="실패 사유" value={reward.failureReason ?? "-"} />
          <DetailRow label="실패 발생일시" value={formatAdminRewardDateTime(reward.failedAt)} />
          <DetailRow label="사용자 재시도 횟수" value={`${reward.userRetryCount}회`} />
          <DetailRow
            label="최근 재처리 요청 상태"
            value={latestRetryRequest ? <StatusBadge label={ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL[latestRetryRequest.retryStatus]} status={latestRetryRequest.retryStatus} /> : ADMIN_REWARD_RETRY_STATUS_LABEL[reward.retryRequestStatus]}
          />
          <DetailRow label="대기 경과 시간" value={latestRetryRequest ? getElapsedTime(latestRetryRequest.createdAt) : "-"} />
        </DetailCard>
      </div>

      <section className="mt-5 rounded-lg border border-[#e5e7eb] bg-white p-5">
        <h2 className="text-base font-bold text-[#111827]">연관 정보</h2>
        <p className="mt-1 text-sm text-[#6b7280]">이메일, 전화번호, 소셜 provider 식별자는 표시하지 않습니다.</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <RelationCard title="유저" href={`/admin/users/${reward.userDisplayId}`} primary={reward.userNickname} secondary={reward.userDisplayId} meta={`상태: ${reward.userStatus}`} />
          <RelationCard title="보물상자" href={`/admin/treasures/${reward.treasureBoxId}`} primary={reward.treasureTitle} secondary={reward.treasureBoxId} />
          <RelationCard title="상품" href={reward.productId ? `/admin/products/${reward.productId}` : "/admin/products"} primary={reward.productName ?? "상품 미연결"} secondary={reward.productId ?? "-"} meta={reward.productBrandName ? `브랜드: ${reward.productBrandName}` : undefined} />
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">내부 메모</h2>
            <p className="mt-1 text-sm text-[#6b7280]">운영 참고용 메모입니다. 사용자 앱에는 노출되지 않습니다.</p>
          </div>
          {canManage ? (
            <button type="button" onClick={saveMemo} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              메모 저장
            </button>
          ) : null}
        </div>
        <textarea
          value={memo}
          onChange={(event) => {
            setMemo(event.target.value);
            setMemoError("");
          }}
          readOnly={!canManage}
          maxLength={1000}
          className="mt-4 min-h-32 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827] read-only:bg-[#f9fafb]"
          placeholder="보상 처리 과정에서 참고할 내부 메모를 입력하세요."
        />
        <div className="mt-2 flex items-center justify-between">
          {memoError ? <p role="alert" className="text-sm font-medium text-[#b91c1c]">{memoError}</p> : <span />}
          <span className="text-xs text-[#6b7280]">{memo.length}/1000</span>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">재처리 요청 이력</h2>
            <p className="mt-1 text-sm text-[#6b7280]">현재 보상 기준 이력을 조회 전용으로 표시합니다.</p>
          </div>
          <Link href={`/admin/reward-requests/history?rewardId=${reward.rewardId}`} className="text-sm font-medium underline underline-offset-2">
            전체 이력 보기
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">요청 ID</th>
              <th className="px-5 py-3 font-medium">요청 상태</th>
              <th className="px-5 py-3 font-medium">요청 사유</th>
              <th className="px-5 py-3 font-medium">요청자</th>
              <th className="px-5 py-3 font-medium">요청일시</th>
              <th className="px-5 py-3 font-medium">처리 완료일시</th>
              <th className="px-5 py-3 font-medium">결과 메시지</th>
            </tr>
          </thead>
          <tbody>
            {retryHistory.map((item) => (
              <tr key={item.retryRequestId} className="border-t border-[#f3f4f6]">
                <td className="px-5 py-4 font-mono text-xs">{item.retryRequestId}</td>
                <td className="px-5 py-4"><StatusBadge label={ADMIN_REWARD_RETRY_REQUEST_STATUS_LABEL[item.retryStatus]} status={item.retryStatus} /></td>
                <td className="px-5 py-4">{item.reason}</td>
                <td className="px-5 py-4">{item.requestedByAdminName}</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminRewardDateTime(item.createdAt)}</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminRewardDateTime(item.processedAt)}</td>
                <td className="px-5 py-4">{item.workerErrorMessage ?? (item.workerResult === "success" ? "재처리 성공" : "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {retryHistory.length === 0 ? <div className="px-5 py-10 text-center text-sm text-[#6b7280]">재처리 요청 이력이 없습니다.</div> : null}
      </section>

      <p className="mt-5 rounded-md bg-[#f9fafb] p-4 text-xs leading-5 text-[#6b7280]">
        이 화면은 쿠폰 번호와 바코드를 표시하지 않으며, 기프티쇼비즈 API를 직접 호출하지 않습니다. 재처리 요청 생성 후에도 reward.status는 failed 상태를 유지합니다.
      </p>

      <DialogOverlay
        open={isRetryDialogOpen}
        onClose={() => {
          if (!isCreatingRetry) setIsRetryDialogOpen(false);
        }}
        labelledBy="reward-detail-retry-title"
        className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="reward-detail-retry-title" className="text-lg font-bold">재처리 요청 생성</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          failed 상태의 보상에 대해 재처리 요청을 생성합니다. 동일 보상에 pending 또는 processing 요청이 있으면 중복 생성이 차단됩니다.
        </p>
        <dl className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm">
          <DetailRow label="보상 ID" value={<span className="font-mono text-xs">{reward.rewardId}</span>} />
          <DetailRow label="보상 상태" value={<StatusBadge label={reward.status} status={reward.status} />} />
          <DetailRow label="최근 실패 코드" value={reward.lastFailureCode ?? "-"} />
        </dl>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-[#374151]">재처리 사유</span>
          <select
            value={retryReason}
            onChange={(event) => {
              setRetryReason(event.target.value);
              setRetryError("");
            }}
            className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#111827]"
            autoFocus
          >
            <option value="">재처리 사유를 선택하세요</option>
            {retryReasonOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-[#374151]">내부 메모</span>
          <textarea
            value={retryMemo}
            onChange={(event) => {
              setRetryMemo(event.target.value);
              setRetryError("");
            }}
            maxLength={1000}
            className="mt-1 min-h-28 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
            placeholder="동일 요청 중복 여부, 확인 내용 등을 입력하세요."
          />
        </label>
        {retryError ? <p role="alert" className="mt-2 text-sm font-medium text-[#b91c1c]">{retryError}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsRetryDialogOpen(false)} disabled={isCreatingRetry} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-[#9ca3af]">
            취소
          </button>
          <button type="button" onClick={() => void createRetryRequest()} disabled={!retryReason || isCreatingRetry} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]">
            {isCreatingRetry ? "생성 중..." : "요청 생성"}
          </button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
