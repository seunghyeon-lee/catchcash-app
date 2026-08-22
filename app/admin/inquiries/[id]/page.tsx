"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import { ADMIN_CATEGORY_LABEL, formatAdminDate, type AdminInquiryStatus, type AdminSupportInquiry } from "@/lib/admin/mock-inquiries";
import { createAdminSupportReply, loadAdminInquiry, type AdminInquiryDataSource } from "@/lib/admin/support-service";

const adminRole = "super_admin";

const statusOptions: Array<{ label: string; value: AdminInquiryStatus }> = [
  { label: "읽는 중/확인 중", value: "reading" },
  { label: "처리 중", value: "in_progress" },
  { label: "해결됨/답변 완료", value: "resolved" },
  { label: "종료", value: "closed" },
];

function getInquiryStatusLabel(status: AdminInquiryStatus) {
  if (status === "received" || status === "open" || status === "reading") return "읽는 중/확인 중";
  if (status === "in_progress") return "처리 중";
  if (status === "resolved" || status === "answered") return "해결됨/답변 완료";
  return "종료";
}

function getStatusTone(status: AdminInquiryStatus) {
  if (status === "resolved" || status === "answered" || status === "closed") return "bg-[#dcfce7] text-[#166534]";
  if (status === "in_progress") return "bg-[#dbeafe] text-[#1d4ed8]";
  return "bg-[#fef3c7] text-[#92400e]";
}

function isInquiryAnswered(inquiry: AdminSupportInquiry) {
  return inquiry.replies.length > 0 || inquiry.status === "resolved" || inquiry.status === "answered";
}

function getPublicInquiryId(id: string) {
  return `INQ-${id.slice(0, 8).toUpperCase()}`;
}

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<AdminSupportInquiry | undefined>();
  const [source, setSource] = useState<AdminInquiryDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [internalMemo, setInternalMemo] = useState("사용자 앱에는 노출되지 않는 내부 운영 메모입니다.");
  const [statusDraft, setStatusDraft] = useState<AdminInquiryStatus>("reading");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [statusReasonError, setStatusReasonError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await loadAdminInquiry(id);
      setInquiry(result.inquiry);
      if (result.inquiry) setStatusDraft(result.inquiry.status);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch {
      setInquiry(undefined);
      setSource(null);
      setMessage("문의 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReply = async () => {
    if (!inquiry || answer.trim().length < 2 || isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await createAdminSupportReply(inquiry, answer.trim());
      if (result.source === "mock") {
        setInquiry({
          ...inquiry,
          status: "resolved",
          updated_at: new Date().toISOString(),
          replies: [{ id: `mock-${Date.now()}`, inquiry_id: inquiry.id, admin_user_id: "mock-admin", admin_name: "Mock 관리자", content: answer.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...inquiry.replies],
        });
        setAnswer("");
        setMessage("관리자 인증 전이라 예시 답변으로만 처리했습니다. DB에는 저장되지 않았습니다.");
        return;
      }

      setAnswer("");
      await load();
      setMessage(result.notificationVerified ? "답변을 등록했고, 문의 해결 및 사용자 알림 생성을 확인했습니다." : "답변을 등록했고 문의 해결 상태를 확인했습니다. 사용자 알림 생성 여부는 DB에서 확인해 주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? `답변 등록에 실패했습니다: ${error.message}` : "답변 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canWrite = adminRole === "super_admin" || adminRole === "operator";

  const openStatusDialog = () => {
    setStatusReason("");
    setStatusReasonError("");
    setIsStatusDialogOpen(true);
  };

  const confirmStatusShell = () => {
    if (statusReason.trim().length < 2) {
      setStatusReasonError("변경 사유를 2자 이상 입력하세요.");
      return;
    }

    setMessage("상태 변경 shell 확인만 완료했습니다. 실제 상태 변경이나 저장은 수행하지 않았습니다.");
    setIsStatusDialogOpen(false);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <p className="text-sm text-[#6b7280]">문의 정보를 불러오는 중입니다.</p>
        </div>
      </AdminShell>
    );
  }

  if (!inquiry) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-2xl font-bold">문의를 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">삭제되었거나 접근할 수 없는 문의입니다.</p>
          {message ? <p role="alert" className="mt-3 text-sm text-[#b91c1c]">{message}</p> : null}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => void load()} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
              다시 시도
            </button>
            <Link href="/admin/inquiries" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              문의 목록으로
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  const answered = isInquiryAnswered(inquiry);
  const firstReply = inquiry.replies[0];
  const latestReply = inquiry.replies[inquiry.replies.length - 1];
  const relatedRewardId = inquiry.related_reward_id;

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-[#6b7280]">문의 관리</p>
          <h1 className="mt-1 text-2xl font-bold">문의 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">문의 정보와 답변 처리 상태를 확인하고 관리자 답변을 등록합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/users/${inquiry.user_id}`} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            유저 상세로
          </Link>
          <Link href="/admin/inquiries" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            문의 목록으로
          </Link>
        </div>
      </div>

      {message ? (
        <div role="status" className="mt-5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">
          {message}
        </div>
      ) : null}

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-5">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-medium text-[#6b7280]">{getPublicInquiryId(inquiry.id)}</p>
                <h2 className="mt-2 text-xl font-bold">{inquiry.title}</h2>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(inquiry.status)}`}>
                {getInquiryStatusLabel(inquiry.status)}
              </span>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#f3f4f6] pt-5 text-sm">
              <div>
                <dt className="text-[#6b7280]">문의 ID</dt>
                <dd className="mt-1 font-mono text-xs font-medium">{inquiry.id}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">카테고리</dt>
                <dd className="mt-1 font-medium">{ADMIN_CATEGORY_LABEL[inquiry.category]}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">작성자</dt>
                <dd className="mt-1 font-medium">{inquiry.user_nickname} <span className="font-mono text-xs text-[#6b7280]">{inquiry.user_id.slice(0, 8)}</span></dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">문의 상태</dt>
                <dd className="mt-1 font-medium">{getInquiryStatusLabel(inquiry.status)}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">답변 여부</dt>
                <dd className="mt-1 font-medium">{answered ? "답변 완료" : "답변 대기"}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">접수 시각</dt>
                <dd className="mt-1 font-medium">{formatAdminDate(inquiry.created_at)}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">최근 수정</dt>
                <dd className="mt-1 font-medium">{formatAdminDate(inquiry.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">데이터 소스</dt>
                <dd className="mt-1 font-medium">{source === "mock" ? "Mock fallback" : "Supabase"}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-md bg-[#f9fafb] p-3 text-xs leading-5 text-[#6b7280]">
              사용자 이메일, 전화번호, 소셜 provider 식별자, 주소, 생년월일, 쿠폰 번호, 바코드, API Secret, token은 표시하지 않습니다.
            </p>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="font-semibold">문의 본문</h2>
            <p className="mt-4 whitespace-pre-wrap rounded-md bg-[#f9fafb] p-4 text-sm leading-6 text-[#374151]">{inquiry.content}</p>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">관리자 답변 영역</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${answered ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                {answered ? "답변 완료" : "답변 대기"}
              </span>
            </div>
            {inquiry.replies.length ? (
              <div className="mt-4 space-y-3">
                {inquiry.replies.map((reply) => (
                  <article key={reply.id} className="rounded-lg border border-[#e5e7eb] p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">등록된 답변</h3>
                      <span className="text-xs text-[#6b7280]">{reply.admin_name} · {formatAdminDate(reply.created_at)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{reply.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">아직 등록된 관리자 답변이 없습니다.</p>
            )}
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">답변 작성</h2>
                <p className="mt-1 text-sm text-[#6b7280]">사용자에게 전달할 답변을 입력하세요.</p>
              </div>
              {source === "mock" ? <span className="rounded bg-[#f3f4f6] px-2 py-1 text-xs text-[#6b7280]">Mock fallback</span> : null}
            </div>
            <label htmlFor="answer" className="mt-4 block text-sm font-medium text-[#374151]">답변 내용</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              maxLength={2000}
              placeholder="사용자에게 전달할 답변을 입력하세요."
              className="mt-2 min-h-36 w-full resize-y rounded-md border border-[#d1d5db] p-3 text-sm outline-none focus:border-[#111827]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[#6b7280]">{answer.length} / 2000</span>
              <button
                type="button"
                disabled={!canWrite || answer.trim().length < 2 || isSubmitting}
                onClick={() => void handleReply()}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "등록 중..." : "답변 저장"}
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="font-semibold">내부 메모</h2>
            <p className="mt-1 text-sm text-[#6b7280]">viewer에게는 표시되지 않는 내부 운영 메모입니다. 사용자 앱에는 노출되지 않습니다.</p>
            <textarea
              value={internalMemo}
              onChange={(event) => setInternalMemo(event.target.value)}
              maxLength={1000}
              readOnly={!canWrite}
              className="mt-4 min-h-28 w-full rounded-md border border-[#d1d5db] p-3 text-sm outline-none focus:border-[#111827] read-only:bg-[#f9fafb]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[#6b7280]">{internalMemo.length} / 1000</span>
              {canWrite ? (
                <button type="button" onClick={() => setMessage("내부 메모를 mock 저장했습니다. 실제 DB에는 저장하지 않았습니다.")} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium">
                  메모 저장
                </button>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
            <h2 className="font-semibold">운영 로그 요약</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 font-medium">일시</th>
                    <th className="px-4 py-3 font-medium">액션</th>
                    <th className="px-4 py-3 font-medium">실행자</th>
                    <th className="px-4 py-3 font-medium">결과 요약</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#f3f4f6]">
                    <td className="px-4 py-3 text-[#6b7280]">{formatAdminDate(inquiry.created_at)}</td>
                    <td className="px-4 py-3">문의 접수</td>
                    <td className="px-4 py-3">system</td>
                    <td className="px-4 py-3">사용자 문의가 접수되었습니다.</td>
                  </tr>
                  {inquiry.replies.map((reply) => (
                    <tr key={`log-${reply.id}`} className="border-t border-[#f3f4f6]">
                      <td className="px-4 py-3 text-[#6b7280]">{formatAdminDate(reply.created_at)}</td>
                      <td className="px-4 py-3">답변 저장</td>
                      <td className="px-4 py-3">{reply.admin_name}</td>
                      <td className="px-4 py-3">관리자 답변이 저장되었습니다.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="font-semibold">상태 변경</h2>
            <p className="mt-1 text-sm text-[#6b7280]">현재 화면에서는 상태 변경 확인 shell만 제공합니다.</p>
            <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as AdminInquiryStatus)} disabled={!canWrite} className="mt-4 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm disabled:bg-[#f9fafb]">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button
              type="button"
              onClick={openStatusDialog}
              disabled={!canWrite || statusDraft === inquiry.status}
              className="mt-3 w-full rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              상태 적용
            </button>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="font-semibold">문의 처리 현황</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[#6b7280]">첫 답변 시각</dt>
                <dd className="mt-1">{firstReply ? formatAdminDate(firstReply.created_at) : "-"}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">최종 상태 변경</dt>
                <dd className="mt-1">{formatAdminDate(inquiry.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">담당 운영자</dt>
                <dd className="mt-1">{latestReply?.admin_name ?? "미지정"}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">최근 처리 요약</dt>
                <dd className="mt-1">{answered ? "관리자 답변 등록 완료" : "답변 대기 중"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
            <h2 className="font-semibold">연관 정보</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[#6b7280]">연관 유저</dt>
                <dd className="mt-1">
                  <Link href={`/admin/users/${inquiry.user_id}`} className="font-medium underline underline-offset-2">{inquiry.user_nickname}</Link>
                  <span className="ml-2 font-mono text-xs text-[#6b7280]">{inquiry.user_id.slice(0, 8)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">연관 보상 ID</dt>
                <dd className="mt-1">
                  {relatedRewardId ? (
                    <Link href={`/admin/rewards/${relatedRewardId}`} className="font-mono text-xs underline underline-offset-2">{relatedRewardId}</Link>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">연관 보물</dt>
                <dd className="mt-1">{relatedRewardId ? "보상 상세에서 확인" : "-"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <DialogOverlay open={isStatusDialogOpen} onClose={() => setIsStatusDialogOpen(false)} labelledBy="inquiry-status-dialog-title">
        <h2 id="inquiry-status-dialog-title" className="text-lg font-bold">상태 변경 확인</h2>
        <p className="mt-2 text-sm text-[#6b7280]">선택한 상태로 변경하시겠습니까? 변경 사유를 입력해 주세요.</p>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-[#374151]">변경 사유 (필수)</span>
          <textarea
            value={statusReason}
            onChange={(event) => {
              setStatusReason(event.target.value);
              setStatusReasonError("");
            }}
            maxLength={200}
            className="mt-2 min-h-24 w-full rounded-md border border-[#d1d5db] p-3 text-sm outline-none focus:border-[#111827]"
          />
        </label>
        {statusReasonError ? <p role="alert" className="mt-2 text-sm font-medium text-[#b91c1c]">{statusReasonError}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsStatusDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">취소</button>
          <button type="button" onClick={confirmStatusShell} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">변경 적용</button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
