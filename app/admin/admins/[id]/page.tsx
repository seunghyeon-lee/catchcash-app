"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_ACTIVITY_ACTION_LABEL,
  ADMIN_ROLE_ALLOWED_MENUS,
  ADMIN_ROLE_LABEL,
  ADMIN_ROLE_RESTRICTED_MENUS,
  ADMIN_STATUS_LABEL,
  findAdminAccount,
  formatAdminAccountDate,
  formatAdminAccountDateTime,
  getAdminAccountActivities,
  type AdminRole,
  type AdminStatus,
} from "@/lib/admin/mock-admin-accounts";

type DialogKind = "role" | "deactivate" | "activate" | "password" | null;

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[70%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  const tone =
    role === "super_admin"
      ? "bg-[#dbeafe] text-[#1d4ed8]"
      : role === "operator"
        ? "bg-[#fef3c7] text-[#92400e]"
        : "bg-[#f3f4f6] text-[#4b5563]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_ROLE_LABEL[role]}</span>;
}

function StatusBadge({ status }: { status: AdminStatus }) {
  const tone =
    status === "active"
      ? "bg-[#dcfce7] text-[#166534]"
      : status === "locked"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : "bg-[#f3f4f6] text-[#4b5563]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_STATUS_LABEL[status]}</span>;
}

function validateReason(reason: string) {
  const length = reason.trim().length;
  if (length < 2) return "사유는 2자 이상 입력하세요.";
  if (length > 200) return "사유는 200자 이하로 입력하세요.";
  return null;
}

export default function AdminAccountDetailPage() {
  const params = useParams<{ id?: string }>();
  const adminId = String(params.id ?? "");
  const account = findAdminAccount(adminId);
  const activities = useMemo(() => getAdminAccountActivities(adminId), [adminId]);

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>("operator");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openDialog = (kind: DialogKind) => {
    if (!account || !kind) return;
    setDialog(kind);
    setSelectedRole(account.role === "super_admin" ? "operator" : account.role);
    setReason("");
    setReasonError(null);
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialog(null);
    setReason("");
    setReasonError(null);
  };

  const submitDialog = async () => {
    const error = validateReason(reason);
    if (error) {
      setReasonError(error);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    const messageByKind: Record<Exclude<DialogKind, null>, string> = {
      role: "역할 변경을 mock으로 완료했습니다. 원본 데이터는 변경되지 않았습니다.",
      deactivate: "계정 비활성화를 mock으로 완료했습니다. 원본 데이터는 변경되지 않았습니다.",
      activate: "계정 활성화를 mock으로 완료했습니다. 원본 데이터는 변경되지 않았습니다.",
      password: "비밀번호 재설정을 mock으로 완료했습니다. 임시 비밀번호는 생성·표시하지 않습니다.",
    };

    setNotice(messageByKind[dialog as Exclude<DialogKind, null>]);
    setIsSubmitting(false);
    setDialog(null);
    setReason("");
    setReasonError(null);
  };

  if (!account) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">관리자 계정을 찾을 수 없음</h1>
          <p className="mt-2 text-sm text-[#6b7280]">요청한 관리자 ID와 일치하는 mock 계정이 없습니다.</p>
          <Link href="/admin/admins" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            관리자 계정 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  const allowedMenus = ADMIN_ROLE_ALLOWED_MENUS[account.role];
  const restrictedMenus = ADMIN_ROLE_RESTRICTED_MENUS[account.role];

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">관리자 계정 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">계정 정보와 역할·상태를 확인합니다. 액션은 mock-only이며 실제 저장/상태 변경은 하지 않습니다.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link href="/admin/admins" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            목록으로
          </Link>
          <button type="button" onClick={() => openDialog("role")} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
            역할 변경
          </button>
          {account.status === "active" ? (
            <button type="button" onClick={() => openDialog("deactivate")} className="rounded-md border border-[#fca5a5] bg-white px-4 py-2 text-sm font-medium text-[#b91c1c] hover:bg-[#fef2f2]">
              계정 비활성화
            </button>
          ) : account.status === "inactive" ? (
            <button type="button" onClick={() => openDialog("activate")} className="rounded-md border border-[#86efac] bg-white px-4 py-2 text-sm font-medium text-[#166534] hover:bg-[#f0fdf4]">
              계정 활성화
            </button>
          ) : (
            <button type="button" disabled className="rounded-md border border-[#d1d5db] bg-[#f9fafb] px-4 py-2 text-sm font-medium text-[#9ca3af]">
              locked 해제는 이번 shell 제외
            </button>
          )}
          <button type="button" onClick={() => openDialog("password")} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            비밀번호 재설정
          </button>
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-4 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {notice}
        </p>
      ) : null}

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="space-y-4">
          <DetailCard title="계정 기본 정보">
            <dl>
              <DetailRow label="이름" value={account.name} />
              <DetailRow label="관리자 이메일" value={<span className="font-mono text-xs">{account.email}</span>} />
              <DetailRow label="역할" value={<RoleBadge role={account.role} />} />
              <DetailRow label="상태" value={<StatusBadge status={account.status} />} />
              <DetailRow label="최근 로그인" value={formatAdminAccountDateTime(account.lastLoginAt)} />
              <DetailRow label="등록일" value={formatAdminAccountDate(account.createdAt)} />
              <DetailRow label="관리자 ID" value={<span className="font-mono text-xs">{account.id}</span>} />
            </dl>
          </DetailCard>

          <DetailCard title="역할 및 권한">
            <dl>
              <DetailRow label="현재 역할" value={<RoleBadge role={account.role} />} />
              <DetailRow
                label="허용 메뉴"
                value={
                  <ul className="space-y-1 text-right">
                    {allowedMenus.map((menu) => (
                      <li key={menu}>{menu}</li>
                    ))}
                  </ul>
                }
              />
              <DetailRow
                label="제한 메뉴"
                value={
                  restrictedMenus.length === 0 ? (
                    "없음"
                  ) : (
                    <ul className="space-y-1 text-right">
                      {restrictedMenus.map((menu) => (
                        <li key={menu}>{menu}</li>
                      ))}
                    </ul>
                  )
                }
              />
            </dl>
          </DetailCard>

          <DetailCard title="최근 로그인 및 활동">
            {activities.length === 0 ? (
              <p className="text-sm text-[#6b7280]">표시할 활동 기록이 없습니다.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-[#6b7280]">
                  <tr>
                    <th className="pb-2 font-medium">일시</th>
                    <th className="pb-2 font-medium">액션</th>
                    <th className="pb-2 font-medium">IP</th>
                    <th className="pb-2 font-medium">요약</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-t border-[#f3f4f6]">
                      <td className="py-3 text-[#4b5563]">{formatAdminAccountDateTime(activity.occurredAt)}</td>
                      <td className="py-3 font-medium">{ADMIN_ACTIVITY_ACTION_LABEL[activity.action]}</td>
                      <td className="py-3 font-mono text-xs text-[#4b5563]">{activity.ipMasked}</td>
                      <td className="py-3 text-[#4b5563]">{activity.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="계정 상태 요약">
            <dl>
              <DetailRow label="상태" value={<StatusBadge status={account.status} />} />
              <DetailRow label="역할" value={<RoleBadge role={account.role} />} />
              <DetailRow
                label="로그인 가능"
                value={account.status === "active" ? "가능" : account.status === "locked" ? "잠김" : "불가"}
              />
            </dl>
          </DetailCard>

          <DetailCard title="관리 액션 안내">
            <ul className="space-y-2 text-sm text-[#4b5563]">
              <li>역할 변경은 mock 확인만 수행하며 원본 데이터는 바꾸지 않습니다.</li>
              <li>계정 활성화/비활성화도 mock 안내만 표시합니다.</li>
              <li>비밀번호 재설정은 사유 검증 후 mock 완료만 알리며 임시 비밀번호를 생성·표시하지 않습니다.</li>
              <li>locked 해제는 이번 shell 범위에서 제외합니다.</li>
            </ul>
          </DetailCard>
        </div>
      </div>

      {dialog ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-detail-dialog-title">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="admin-detail-dialog-title" className="text-lg font-semibold text-[#111827]">
              {dialog === "role"
                ? "역할 변경"
                : dialog === "deactivate"
                  ? "계정 비활성화"
                  : dialog === "activate"
                    ? "계정 활성화"
                    : "비밀번호 재설정"}
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              {dialog === "role"
                ? "대상 계정의 역할을 변경할까요? 원본 mock 데이터는 변경되지 않습니다."
                : dialog === "deactivate"
                  ? "계정을 비활성화할까요? 원본 mock 데이터는 변경되지 않습니다."
                  : dialog === "activate"
                    ? "계정을 활성화할까요? 원본 mock 데이터는 변경되지 않습니다."
                    : "비밀번호 재설정을 진행할까요? 임시 비밀번호는 생성·표시하지 않습니다."}
            </p>

            {dialog === "role" ? (
              <div className="mt-4 space-y-2" role="radiogroup" aria-label="변경 역할">
                {(["super_admin", "operator", "viewer"] as AdminRole[]).map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm">
                    <input type="radio" name="detail-role" checked={selectedRole === role} onChange={() => setSelectedRole(role)} />
                    {ADMIN_ROLE_LABEL[role]}
                  </label>
                ))}
              </div>
            ) : null}

            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block font-medium text-[#374151]">
                {dialog === "role"
                  ? "변경 사유"
                  : dialog === "deactivate"
                    ? "비활성화 사유"
                    : dialog === "activate"
                      ? "활성화 사유"
                      : "재설정 사유"}
              </span>
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setReasonError(null);
                }}
                rows={4}
                maxLength={200}
                className="w-full rounded-md border border-[#d1d5db] px-3 py-2 outline-none focus:border-[#111827]"
                placeholder="2~200자"
              />
              <span className="mt-1 block text-xs text-[#6b7280]">{reason.trim().length}/200</span>
              {reasonError ? <span className="mt-1 block text-xs font-medium text-[#b91c1c]">{reasonError}</span> : null}
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeDialog}
                className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitDialog}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "처리 중..."
                  : dialog === "role"
                    ? "역할 변경 확인"
                    : dialog === "deactivate"
                      ? "비활성화"
                      : dialog === "activate"
                        ? "활성화"
                        : "재설정 확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
