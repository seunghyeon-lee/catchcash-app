"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_USER_ACTIVITY_LABEL,
  ADMIN_USER_INQUIRY_CATEGORY_LABEL,
  ADMIN_USER_INQUIRY_STATUS_LABEL,
  ADMIN_USER_PROVIDER_LABEL,
  ADMIN_USER_REWARD_STATUS_LABEL,
  ADMIN_USER_STATUS_LABEL,
  formatAdminUserDate,
  formatAdminUserDateTime,
  getAdminUserActivityItems,
  getAdminUserSecurityLogSummaries,
  type AdminUserDetail,
  type AdminUserInquirySummaryItem,
  type AdminUserInquirySummaryStatus,
  type AdminUserRewardSummaryItem,
  type AdminUserRewardSummaryStatus,
} from "@/lib/admin/mock-users";
import {
  loadAdminUserDetail,
  loadAdminUserInquirySummaries,
  loadAdminUserRewardSummaries,
} from "@/lib/admin/user-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

const adminRole = "super_admin";

function getStatusTone(status: string) {
  if (status === "active" || status === "issued" || status === "used" || status === "answered" || status === "closed") return "bg-[#dcfce7] text-[#166534]";
  if (status === "suspended" || status === "failed" || status === "blocked") return "bg-[#fee2e2] text-[#991b1b]";
  if (status === "ready" || status === "open" || status === "in_progress" || status === "observed") return "bg-[#dbeafe] text-[#1d4ed8]";
  if (status === "expired" || status === "suspected") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(status)}`}>{label}</span>;
}

function DetailCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
      <div>
        <h2 className="text-base font-bold text-[#111827]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#6b7280]">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[68%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function MetricCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-[#e5e7eb] bg-white p-5 hover:bg-[#f9fafb]">
      <p className="text-sm font-medium text-[#4b5563]">{label}</p>
      <strong className="mt-3 block text-3xl tracking-tight text-[#111827]">{value}</strong>
      <span className="mt-2 block text-xs text-[#6b7280]">관련 목록으로 이동</span>
    </Link>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [user, setUser] = useState<AdminUserDetail | undefined>(undefined);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 보상/문의 요약은 7차에서 실데이터로 연결한다. 활동·보안 요약은 소스가 없어 mock 유지.
  const [rewards, setRewards] = useState<AdminUserRewardSummaryItem[]>([]);
  const [inquiries, setInquiries] = useState<AdminUserInquirySummaryItem[]>([]);
  const activities = useMemo(() => getAdminUserActivityItems(userId), [userId]);
  const securityLogs = useMemo(() => getAdminUserSecurityLogSummaries(userId), [userId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailResult, rewardsResult, inquiriesResult] = await Promise.all([
        loadAdminUserDetail(userId),
        loadAdminUserRewardSummaries(userId),
        loadAdminUserInquirySummaries(userId),
      ]);
      setUser(detailResult.user);
      setRewards(rewardsResult.rewards);
      setInquiries(inquiriesResult.inquiries);
      setSource(detailResult.source);
      setMessage(detailResult.message ?? null);
    } catch (error) {
      console.warn("[admin] 유저 상세 로딩 실패:", error);
      setUser(undefined);
      setRewards([]);
      setInquiries([]);
      setSource(null);
      setMessage("유저 상세를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const [memo, setMemo] = useState("");
  const [memoError, setMemoError] = useState("");

  // 상세 로딩 후 내부 메모 초기값을 동기화한다.
  useEffect(() => {
    setMemo(user?.internalMemo ?? "");
  }, [user]);
  const [toast, setToast] = useState("");
  const [statusDialog, setStatusDialog] = useState<"suspend" | "unsuspend" | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusError, setStatusError] = useState("");

  const canWriteMemo = adminRole === "super_admin" || adminRole === "operator";
  const canSeeSecurityLogs = adminRole === "super_admin";
  const canOpenSuspendShell = adminRole === "super_admin" && user?.status === "active";
  const canOpenUnsuspendShell = adminRole === "super_admin" && user?.status === "suspended";

  const saveMemo = () => {
    if (memo.length > 1000) {
      setMemoError("내부 메모는 1,000자 이하로 입력하세요.");
      return;
    }

    setMemoError("");
    setToast("내부 관리자 메모를 mock 저장했습니다. 실제 DB에는 저장되지 않습니다.");
  };

  const openStatusDialog = (type: "suspend" | "unsuspend") => {
    setStatusDialog(type);
    setStatusReason("");
    setStatusError("");
  };

  const closeStatusDialog = () => {
    setStatusDialog(null);
    setStatusReason("");
    setStatusError("");
  };

  const confirmStatusShell = () => {
    const reason = statusReason.trim();
    if (reason.length < 2 || reason.length > 200) {
      setStatusError("사유는 2자 이상 200자 이하로 입력하세요.");
      return;
    }

    setToast(statusDialog === "suspend" ? "유저 정지 shell 확인만 완료했습니다. 실제 상태는 변경하지 않았습니다." : "정지 해제 shell 확인만 완료했습니다. 실제 상태는 변경하지 않았습니다.");
    closeStatusDialog();
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <p className="text-sm text-[#6b7280]">유저 상세를 불러오는 중입니다.</p>
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">유저를 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">삭제되었거나 접근할 수 없는 유저입니다.</p>
          <Link href="/admin/users" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            유저 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">유저 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            특정 유저의 운영 정보와 활동 요약을 확인합니다. 기본 정보·카운트·보상/문의 요약은 {source === "supabase" ? "Supabase 실데이터" : "mock data"} 기준이며, 활동·보안 요약은 예시(mock)로 표시됩니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            유저 목록으로
          </Link>
          {canSeeSecurityLogs ? (
            <Link href={`/admin/security-logs?userId=${user.id}`} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
              보안 로그 상세로
            </Link>
          ) : null}
          {canOpenSuspendShell ? (
            <button type="button" onClick={() => openStatusDialog("suspend")} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
              유저 정지
            </button>
          ) : null}
          {canOpenUnsuspendShell ? (
            <button type="button" onClick={() => openStatusDialog("unsuspend")} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
              정지 해제
            </button>
          ) : null}
        </div>
      </div>

      {toast ? <div role="status" className="mt-5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">{toast}</div> : null}

      {source && source !== "supabase" ? (
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

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_380px] gap-5">
        <div className="space-y-5">
          <DetailCard title="유저 기본 정보" description="사용자 이메일, 전화번호, 소셜 계정 원문 식별자는 표시하지 않습니다.">
            <div className="flex gap-5">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[#111827] text-lg font-bold text-white">
                {user.nickname.slice(0, 2)}
              </div>
              <dl className="min-w-0 flex-1">
                <DetailRow label="닉네임" value={user.nickname} />
                <DetailRow label="유저 ID" value={<span className="font-mono text-xs">{user.publicId} · {user.id}</span>} />
                <DetailRow label="로그인 제공자" value={ADMIN_USER_PROVIDER_LABEL[user.provider]} />
                <DetailRow label="상태" value={<StatusBadge label={ADMIN_USER_STATUS_LABEL[user.status]} status={user.status} />} />
                <DetailRow label="가입일" value={formatAdminUserDate(user.joinedAt)} />
                <DetailRow label="최근 활동일" value={formatAdminUserDateTime(user.lastActiveAt)} />
                <DetailRow label="정지일" value={formatAdminUserDateTime(user.suspendedAt)} />
                <DetailRow label="정지 사유" value={user.suspendReason ?? "-"} />
              </dl>
            </div>
          </DetailCard>

          <section className="grid grid-cols-4 gap-4">
            <MetricCard label="총 보상 획득 수" value={`${user.rewardCount}개`} href={`/admin/reward-requests?userId=${user.id}`} />
            <MetricCard label="총 문의 수" value={`${user.inquiryCount}건`} href={`/admin/inquiries?userId=${user.id}`} />
            <MetricCard label="미처리 문의" value={`${user.openInquiryCount}건`} href={`/admin/inquiries?userId=${user.id}&status=open`} />
            <MetricCard label="재처리 요청" value={`${user.retryRequestCount}건`} href={`/admin/reward-requests/history?userId=${user.id}`} />
          </section>

          {canSeeSecurityLogs ? (
            <DetailCard title="보안 로그 요약" description="정확한 좌표와 민감 정보는 표시하지 않고 지역 수준 요약만 제공합니다.">
              {securityLogs.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 font-medium">발생일시</th>
                      <th className="px-4 py-3 font-medium">이벤트</th>
                      <th className="px-4 py-3 font-medium">요약</th>
                      <th className="px-4 py-3 font-medium">지역</th>
                      <th className="px-4 py-3 font-medium">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log.id} className="border-t border-[#f3f4f6]">
                        <td className="px-4 py-3 text-[#6b7280]">{formatAdminUserDateTime(log.occurredAt)}</td>
                        <td className="px-4 py-3">{log.eventType}</td>
                        <td className="px-4 py-3">{log.summary}</td>
                        <td className="px-4 py-3">{log.region}</td>
                        <td className="px-4 py-3"><StatusBadge label={log.result} status={log.result} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">표시할 보안 로그 요약이 없습니다.</p>
              )}
            </DetailCard>
          ) : null}

          <DetailCard title="최근 활동 mock 리스트">
            {activities.length ? (
              <ul className="divide-y divide-[#f3f4f6]">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{ADMIN_USER_ACTIVITY_LABEL[activity.type]} · {activity.summary}</p>
                      <p className="mt-1 font-mono text-xs text-[#6b7280]">{activity.targetId ?? "target 없음"}</p>
                    </div>
                    <span className="text-xs text-[#6b7280]">{formatAdminUserDateTime(activity.occurredAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">최근 활동 mock 데이터가 없습니다.</p>
            )}
          </DetailCard>

          <DetailCard title="내부 관리자 메모" description="운영 참고용 메모입니다. 사용자 앱에는 노출되지 않습니다.">
            <textarea
              value={memo}
              onChange={(event) => {
                setMemo(event.target.value);
                setMemoError("");
              }}
              readOnly={!canWriteMemo}
              maxLength={1000}
              className="min-h-32 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827] read-only:bg-[#f9fafb]"
              placeholder="메모를 입력하세요"
            />
            <div className="mt-2 flex items-center justify-between">
              {memoError ? <p role="alert" className="text-sm font-medium text-[#b91c1c]">{memoError}</p> : <span />}
              <span className="text-xs text-[#6b7280]">{memo.length}/1000</span>
            </div>
            {canWriteMemo ? (
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={saveMemo} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                  메모 저장
                </button>
              </div>
            ) : null}
          </DetailCard>
        </div>

        <aside className="space-y-5">
          <DetailCard title="보상/보관함 요약" description={`보관함 보유 보상 ${user.inventoryRewardCount}개`}>
            {rewards.length ? (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div key={reward.rewardId} className="rounded-lg border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/admin/rewards/${reward.rewardId}`} className="font-mono text-xs font-medium underline underline-offset-2">{reward.rewardId}</Link>
                        <p className="mt-2 text-sm font-semibold text-[#111827]">{reward.treasureTitle}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">{reward.productName}</p>
                      </div>
                      <StatusBadge label={ADMIN_USER_REWARD_STATUS_LABEL[reward.status as AdminUserRewardSummaryStatus]} status={reward.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280]">
                      <span>{formatAdminUserDateTime(reward.claimedAt)}</span>
                      <span>{reward.hasRetryRequest ? "재처리 요청 있음" : "재처리 요청 없음"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">최근 보상 요약이 없습니다.</p>
            )}
          </DetailCard>

          <DetailCard title="문의 요약">
            {inquiries.length ? (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.inquiryId} className="rounded-lg border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#6b7280]">{ADMIN_USER_INQUIRY_CATEGORY_LABEL[inquiry.category]}</p>
                        <Link href={`/admin/inquiries/${inquiry.inquiryId}`} className="mt-1 block text-sm font-semibold text-[#111827] underline underline-offset-2">{inquiry.title}</Link>
                      </div>
                      <StatusBadge label={ADMIN_USER_INQUIRY_STATUS_LABEL[inquiry.status as AdminUserInquirySummaryStatus]} status={inquiry.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#6b7280]">
                      <span>{formatAdminUserDateTime(inquiry.createdAt)}</span>
                      <span>{inquiry.hasAnswer ? "답변 완료" : "답변 전"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">최근 문의 요약이 없습니다.</p>
            )}
          </DetailCard>

          <DetailCard title="상태 관련 안내 영역">
            <p className="text-sm leading-6 text-[#6b7280]">
              이 화면의 정지/해제 버튼은 shell 확인만 제공합니다. 실제 유저 정지, 차단, 해제, 저장, Auth 연동은 수행하지 않습니다.
            </p>
            <p className="mt-3 rounded-md bg-[#fef3c7] p-3 text-xs leading-5 text-[#92400e]">
              사용자 이메일, 전화번호, 소셜 provider 원문 식별자, 쿠폰 번호, 바코드, API Secret, token은 표시하지 않습니다.
            </p>
          </DetailCard>
        </aside>
      </div>

      <p className="mt-5 rounded-md bg-[#f9fafb] p-4 text-xs leading-5 text-[#6b7280]">
        A18 shell은 mock-only 화면입니다. Supabase/Auth/API/fetch 호출과 실제 저장 기능을 포함하지 않습니다.
      </p>

      {statusDialog ? (
        <div role="dialog" aria-modal="true" aria-labelledby="user-status-dialog-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="user-status-dialog-title" className="text-lg font-bold">{statusDialog === "suspend" ? "유저 정지 확인" : "유저 정지 해제 확인"}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              {statusDialog === "suspend" ? "이 유저를 정지하면 앱의 주요 기능이 차단되는 정책을 따릅니다. 현재 shell에서는 실제 상태를 변경하지 않습니다." : "이 유저의 정지를 해제하면 앱 기능이 복구되는 정책을 따릅니다. 현재 shell에서는 실제 상태를 변경하지 않습니다."}
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">{statusDialog === "suspend" ? "정지 사유 (필수)" : "해제 사유 (필수)"}</span>
              <textarea
                value={statusReason}
                onChange={(event) => {
                  setStatusReason(event.target.value);
                  setStatusError("");
                }}
                maxLength={200}
                className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                placeholder={statusDialog === "suspend" ? "정지 사유를 입력하세요." : "해제 사유를 입력하세요."}
              />
            </label>
            {statusError ? <p role="alert" className="mt-2 text-sm font-medium text-[#b91c1c]">{statusError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeStatusDialog} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button type="button" onClick={confirmStatusShell} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                {statusDialog === "suspend" ? "정지 확인" : "정지 해제 확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
