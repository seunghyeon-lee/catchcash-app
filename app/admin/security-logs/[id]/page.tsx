"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  SECURITY_LOG_EVENT_TYPE_LABEL,
  SECURITY_LOG_SEVERITY_LABEL,
  SECURITY_LOG_STATUS_LABEL,
  formatSecurityLogDateTime,
  getRelatedSecurityLogsByTreasure,
  getRelatedSecurityLogsByUser,
  getSecurityLogDetail,
  type SecurityLogSeverity,
  type SecurityLogStatus,
} from "@/lib/admin/mock-security-logs";

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

export default function AdminSecurityLogDetailPage() {
  const params = useParams<{ id?: string }>();
  const logId = String(params.id ?? "");
  const detail = getSecurityLogDetail(logId);

  const relatedByUser = useMemo(
    () => getRelatedSecurityLogsByUser(detail?.userPublicId ?? null, logId),
    [detail?.userPublicId, logId],
  );
  const relatedByTreasure = useMemo(
    () => getRelatedSecurityLogsByTreasure(detail?.treasureId ?? null, logId),
    [detail?.treasureId, logId],
  );

  if (!detail) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">보안 로그를 찾을 수 없음</h1>
          <p className="mt-2 text-sm text-[#6b7280]">요청한 로그 ID와 일치하는 mock 보안 로그가 없습니다.</p>
          <Link href="/admin/security-logs" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            보안 로그 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  const excessDistance =
    detail.distanceMeters != null && detail.allowedRadiusMeters != null
      ? detail.distanceMeters - detail.allowedRadiusMeters
      : null;

  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">보안 로그 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">조회 전용 mock 상세입니다. 원본 payload·위험 액션·상태 변경은 포함하지 않습니다.</p>
        </div>
        <Link href="/admin/security-logs" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
          목록으로
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="space-y-4">
          <DetailCard title="이벤트 요약">
            <dl>
              <DetailRow label="로그 ID" value={<span className="font-mono text-xs">{detail.id}</span>} />
              <DetailRow label="이벤트 유형" value={SECURITY_LOG_EVENT_TYPE_LABEL[detail.eventType]} />
              <DetailRow label="위험도" value={<SeverityBadge severity={detail.severity} />} />
              <DetailRow label="처리 결과" value={<StatusBadge status={detail.status} />} />
              <DetailRow label="요약" value={detail.summary} />
              <DetailRow label="결과 안내" value={detail.resultNote} />
              <DetailRow label="요청 시각" value={formatSecurityLogDateTime(detail.requestedAt)} />
              <DetailRow label="기기 시각" value={formatSecurityLogDateTime(detail.deviceAt)} />
              <DetailRow label="서버 수신" value={formatSecurityLogDateTime(detail.receivedAt)} />
            </dl>
          </DetailCard>

          <DetailCard title="위치 검증 정보">
            <p className="mb-4 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs text-[#6b7280]">{detail.coordinateNote}</p>
            <dl>
              <DetailRow label="요청 위도(반올림)" value={detail.latitudeRounded ?? "-"} />
              <DetailRow label="요청 경도(반올림)" value={detail.longitudeRounded ?? "-"} />
              <DetailRow label="기준 위도(반올림)" value={detail.referenceLatitudeRounded ?? "-"} />
              <DetailRow label="기준 경도(반올림)" value={detail.referenceLongitudeRounded ?? "-"} />
              <DetailRow label="실제 거리" value={detail.distanceMeters != null ? `${detail.distanceMeters.toFixed(1)}m` : "-"} />
              <DetailRow label="허용 반경" value={detail.allowedRadiusMeters != null ? `${detail.allowedRadiusMeters}m` : "-"} />
              <DetailRow label="초과 거리" value={excessDistance != null ? `${excessDistance > 0 ? "+" : ""}${excessDistance.toFixed(1)}m` : "-"} />
              <DetailRow label="GPS 정확도" value={detail.accuracyMeters != null ? `${detail.accuracyMeters.toFixed(1)}m` : "-"} />
            </dl>
          </DetailCard>

          <DetailCard title="기기 및 네트워크">
            <dl>
              <DetailRow label="마스킹 IP" value={<span className="font-mono text-xs">{detail.ipMasked}</span>} />
              <DetailRow label="UA(일반화)" value={detail.userAgentGeneralized} />
              <DetailRow label="OS(일반화)" value={detail.osGeneralized} />
              <DetailRow label="앱 버전" value={detail.appVersion} />
              <DetailRow label="네트워크" value={detail.networkType} />
            </dl>
          </DetailCard>

          <DetailCard title="연관 엔티티">
            <dl>
              <DetailRow
                label="유저"
                value={
                  detail.userPublicId ? (
                    <span>
                      {detail.userPublicId} / {detail.nickname} · {detail.relatedUserStatus}
                    </span>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="보물"
                value={detail.treasureId ? `${detail.treasureId} · ${detail.relatedTreasureStatus}` : "-"}
              />
              <DetailRow
                label="보상"
                value={detail.relatedRewardId ? `${detail.relatedRewardId} · ${detail.relatedRewardStatus}` : "-"}
              />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {detail.userPublicId ? (
                <Link
                  href={`/admin/security-logs?userId=${encodeURIComponent(detail.userPublicId)}`}
                  className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  같은 유저 로그 목록
                </Link>
              ) : null}
              {detail.treasureId ? (
                <Link
                  href={`/admin/security-logs?treasureId=${encodeURIComponent(detail.treasureId)}`}
                  className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  같은 보물 로그 목록
                </Link>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-[#6b7280]">유저/보물 상세 route는 아직 없으므로 목록 query로만 연결합니다.</p>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="같은 유저 연관 로그">
            {relatedByUser.length === 0 ? (
              <p className="text-sm text-[#6b7280]">연관 로그가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {relatedByUser.map((log) => (
                  <li key={log.id} className="rounded-md border border-[#e5e7eb] px-3 py-2">
                    <Link href={`/admin/security-logs/${log.id}`} className="text-sm font-medium text-[#111827] underline underline-offset-2">
                      {log.id}
                    </Link>
                    <p className="mt-1 text-xs text-[#6b7280]">{SECURITY_LOG_EVENT_TYPE_LABEL[log.eventType]} · {SECURITY_LOG_SEVERITY_LABEL[log.severity]}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>

          <DetailCard title="같은 보물 연관 로그">
            {relatedByTreasure.length === 0 ? (
              <p className="text-sm text-[#6b7280]">연관 로그가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {relatedByTreasure.map((log) => (
                  <li key={log.id} className="rounded-md border border-[#e5e7eb] px-3 py-2">
                    <Link href={`/admin/security-logs/${log.id}`} className="text-sm font-medium text-[#111827] underline underline-offset-2">
                      {log.id}
                    </Link>
                    <p className="mt-1 text-xs text-[#6b7280]">{SECURITY_LOG_EVENT_TYPE_LABEL[log.eventType]} · {SECURITY_LOG_SEVERITY_LABEL[log.severity]}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </div>
    </AdminShell>
  );
}
