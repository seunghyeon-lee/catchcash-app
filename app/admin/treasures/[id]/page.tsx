"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_TREASURE_CALCULATED_STATUS_LABEL,
  ADMIN_TREASURE_HISTORY_ACTION_LABEL,
  ADMIN_TREASURE_SAVE_STATUS_LABEL,
  ADMIN_TREASURE_VISIBLE_CHECK_LABEL,
  formatAdminTreasureDateTime,
  getAdminTreasureVisibleChecks,
  type AdminTreasureCalculatedStatus,
  type AdminTreasureDetail,
  type AdminTreasureSaveStatus,
  type AdminTreasureVisibleCheckKey,
} from "@/lib/admin/mock-treasures";
import { loadAdminTreasureDetail } from "@/lib/admin/treasure-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

const adminRole = "super_admin";

function DetailCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#6b7280]">{description}</p> : null}
      </div>
      {children}
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

function CheckRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-[#374151]">{label}</span>
      <span
        className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          passed ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
        }`}
      >
        {passed ? "충족" : "미충족"}
      </span>
    </div>
  );
}

export default function AdminTreasureDetailPage() {
  const params = useParams<{ id?: string }>();
  const treasureId = String(params.id ?? "");
  const [detail, setDetail] = useState<AdminTreasureDetail | undefined>(undefined);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [restoreReason, setRestoreReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminTreasureDetail(treasureId);
      setDetail(result.treasure);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch (error) {
      console.warn("[admin] 보물상자 상세 로딩 실패:", error);
      setDetail(undefined);
      setSource(null);
      setMessage("보물상자 상세를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [treasureId]);

  useEffect(() => {
    void load();
  }, [load]);

  const canManage = adminRole === "super_admin" || adminRole === "operator";
  const canDanger = adminRole === "super_admin";

  const visibleChecks = useMemo(() => (detail ? getAdminTreasureVisibleChecks(detail) : null), [detail]);
  const checkEntries = useMemo(() => {
    if (!visibleChecks) return [];
    return (Object.keys(ADMIN_TREASURE_VISIBLE_CHECK_LABEL) as AdminTreasureVisibleCheckKey[]).map((key) => ({
      key,
      label: ADMIN_TREASURE_VISIBLE_CHECK_LABEL[key],
      passed: visibleChecks[key],
    }));
  }, [visibleChecks]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <p className="text-sm text-[#6b7280]">보물상자 상세를 불러오는 중입니다.</p>
        </div>
      </AdminShell>
    );
  }

  if (!detail) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">보물상자를 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">요청한 ID와 일치하는 mock 보물상자가 없습니다.</p>
          <Link href="/admin/treasures" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  const isDeleted = detail.status === "deleted" || detail.deletedAt !== null;

  const handleMockDelete = () => {
    if (!deleteReason.trim()) return;

    const now = new Date().toISOString();
    setDetail({
      ...detail,
      status: "deleted",
      calculatedStatus: "hidden",
      deletedAt: now,
      updatedAt: now,
      history: [
        {
          id: `hist-delete-${Date.now()}`,
          action: "delete",
          adminName: "김운영",
          reason: deleteReason.trim(),
          createdAt: now,
        },
        ...detail.history,
      ],
    });
    setDeleteReason("");
    setIsDeleteOpen(false);
    setActionMessage("mock 삭제가 반영되었습니다. 실제 DB에는 저장되지 않습니다.");
  };

  const handleMockRestore = () => {
    if (!restoreReason.trim()) return;

    const now = new Date().toISOString();
    setDetail({
      ...detail,
      status: "inactive",
      calculatedStatus: "hidden",
      deletedAt: null,
      updatedAt: now,
      history: [
        {
          id: `hist-restore-${Date.now()}`,
          action: "restore",
          adminName: "김운영",
          reason: restoreReason.trim(),
          createdAt: now,
        },
        ...detail.history,
      ],
    });
    setRestoreReason("");
    setIsRestoreOpen(false);
    setActionMessage("mock 복구가 inactive 상태로 반영되었습니다. 실제 DB에는 저장되지 않습니다.");
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">보물상자 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">{detail.title} · {source === "supabase" ? "Supabase 실데이터" : "mock data"} 기준 · 실제 지도/API 연결 없음</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/treasures" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            목록으로
          </Link>
          {canManage && !isDeleted ? (
            <Link href={`/admin/treasures/${detail.id}/edit`} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
              수정
            </Link>
          ) : null}
        </div>
      </div>

      {actionMessage ? (
        <div className="mt-4 rounded-md border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">{actionMessage}</div>
      ) : null}

      {source && source !== "supabase" ? (
        <div
          role="status"
          className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          <span>{message ?? "예시 데이터를 표시하고 있습니다."}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 font-medium underline">
            다시 시도
          </button>
        </div>
      ) : null}

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_340px] gap-4">
        <div className="space-y-4">
          <DetailCard title="기본 정보">
            <dl>
              <DetailRow label="보물상자 ID" value={<span className="font-mono text-xs">{detail.treasureCode}</span>} />
              <DetailRow label="제목" value={detail.title} />
              <DetailRow label="저장 상태" value={<SaveStatusBadge status={detail.status} />} />
              <DetailRow label="계산 상태" value={<CalculatedStatusBadge status={detail.calculatedStatus} />} />
              <DetailRow label="설명" value={detail.description} />
              <DetailRow label="위치 문구" value={detail.locationLabel} />
              <DetailRow label="힌트" value={detail.hintText} />
            </dl>
          </DetailCard>

          <DetailCard title="위치 및 반경" description="Naver Map API는 연결하지 않으며 좌표는 mock 값만 표시합니다.">
            <dl>
              <DetailRow label="위도" value={detail.latitude ?? "-"} />
              <DetailRow label="경도" value={detail.longitude ?? "-"} />
              <DetailRow label="허용 반경" value={`${detail.radiusM}m`} />
            </dl>
            <div className="mt-5 grid h-48 place-items-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] text-sm text-[#9ca3af]">
              {detail.latitude === null || detail.longitude === null ? "좌표가 등록되지 않았습니다." : "지도 placeholder · mock UI"}
            </div>
          </DetailCard>

          <DetailCard title="운영 조건">
            <dl>
              <DetailRow label="운영 시작일" value={formatAdminTreasureDateTime(detail.startsAt)} />
              <DetailRow label="운영 종료일" value={formatAdminTreasureDateTime(detail.endsAt)} />
              <DetailRow label="최대 획득 수" value={`${detail.maxClaimCount}개`} />
              <DetailRow label="현재 획득 수" value={`${detail.currentClaimCount}개`} />
            </dl>
          </DetailCard>

          <DetailCard title="연결 상품 및 매칭">
            <dl>
              <DetailRow
                label="연결 상품"
                value={
                  detail.mappedProductName ? (
                    <Link href={`/admin/products/${detail.mappedProductId}`} className="underline underline-offset-2">
                      {detail.mappedProductName}
                    </Link>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="매칭 상태"
                value={detail.mappingStatus === "active" ? "활성 매칭" : detail.mappingStatus === "inactive" ? "비활성 매칭" : "매칭 없음"}
              />
              <DetailRow label="활성 매칭 수" value={`${detail.activeMappingCount}개`} />
            </dl>
            {canManage && !isDeleted ? (
              <div className="mt-5 flex justify-end">
                <Link
                  href="/admin/mappings/new"
                  className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  매칭 관리
                </Link>
              </div>
            ) : null}
          </DetailCard>

          <DetailCard title="visible 조건 체크" description="사용자 앱 지도 노출 가능 여부를 mock 조건으로 확인합니다.">
            <div>
              {checkEntries.map((item) => (
                <CheckRow key={item.key} label={item.label} passed={item.passed} />
              ))}
            </div>
            <p className="mt-4 rounded-md bg-[#f9fafb] p-3 text-sm leading-6 text-[#6b7280]">
              현재 계산 상태: <strong className="text-[#111827]">{ADMIN_TREASURE_CALCULATED_STATUS_LABEL[detail.calculatedStatus]}</strong>
            </p>
          </DetailCard>
        </div>

        <div className="space-y-4">
          {canDanger ? (
            <DetailCard title="위험 액션" description="shell 단계에서는 확인 팝업과 local mock 상태만 변경합니다.">
              {!isDeleted ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="w-full rounded-md border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-sm font-medium text-[#991b1b] hover:bg-[#fee2e2]"
                >
                  삭제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRestoreOpen(true)}
                  className="w-full rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  inactive로 복구
                </button>
              )}
            </DetailCard>
          ) : null}

          <DetailCard title="삭제·복구 이력">
            {detail.history.length === 0 ? (
              <p className="text-sm text-[#6b7280]">아직 기록된 이력이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {detail.history.slice(0, 5).map((item) => (
                  <li key={item.id} className="rounded-md border border-[#f3f4f6] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#111827]">{ADMIN_TREASURE_HISTORY_ACTION_LABEL[item.action]}</span>
                      <span className="text-xs text-[#6b7280]">{formatAdminTreasureDateTime(item.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#4b5563]">{item.adminName}</p>
                    <p className="mt-1 text-sm text-[#6b7280]">{item.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>

          <DetailCard title="등록 정보">
            <dl>
              <DetailRow label="등록자" value={detail.createdBy} />
              <DetailRow label="등록일" value={formatAdminTreasureDateTime(detail.createdAt)} />
              <DetailRow label="최근 수정자" value={detail.updatedBy} />
              <DetailRow label="최근 수정일" value={formatAdminTreasureDateTime(detail.updatedAt)} />
            </dl>
          </DetailCard>
        </div>
      </div>

      <p className="mt-5 text-xs text-[#6b7280]">
        쿠폰 번호, 바코드, 사용자 이메일, 관리자 이메일은 표시하지 않습니다. 실제 treasure_boxes DB 연결과 Naver Map API는 이번 shell 범위가 아닙니다.
      </p>

      {isDeleteOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-delete-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-delete-title" className="text-lg font-bold">
              보물상자를 삭제할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">삭제된 보물상자는 사용자 앱 지도에 노출되지 않습니다.</p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">삭제 사유</span>
              <textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                placeholder="삭제 사유를 입력하세요."
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button
                type="button"
                disabled={!deleteReason.trim()}
                onClick={handleMockDelete}
                className="rounded-md bg-[#991b1b] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#fca5a5]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isRestoreOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-restore-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-restore-title" className="text-lg font-bold">
              inactive로 복구할까요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">복구 후 자동으로 active/visible이 되지 않습니다. 운영자가 다시 검수해야 합니다.</p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">복구 사유</span>
              <textarea
                value={restoreReason}
                onChange={(event) => setRestoreReason(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                placeholder="복구 사유를 입력하세요."
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsRestoreOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button
                type="button"
                disabled={!restoreReason.trim()}
                onClick={handleMockRestore}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              >
                inactive로 복구
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
