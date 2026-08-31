"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_ROLE_LABEL,
  ADMIN_STATUS_LABEL,
  type AdminRole,
  type AdminStatus,
} from "@/lib/admin/mock-admin-accounts";

type AdminCreateForm = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: "" | AdminRole;
  status: Extract<AdminStatus, "active" | "inactive">;
};

type AdminCreateErrors = Partial<Record<keyof AdminCreateForm, string>>;

const initialForm: AdminCreateForm = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "",
  status: "active",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-[#b91c1c]">{message}</p>;
}

export default function AdminAccountCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<AdminCreateForm>(initialForm);
  const [errors, setErrors] = useState<AdminCreateErrors>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(
    () =>
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.password !== initialForm.password ||
      form.passwordConfirm !== initialForm.passwordConfirm ||
      form.role !== initialForm.role ||
      form.status !== initialForm.status,
    [form],
  );

  const updateField = <K extends keyof AdminCreateForm>(field: K, value: AdminCreateForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: AdminCreateErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (name.length < 2) nextErrors.name = "이름은 2자 이상 입력하세요.";
    if (!email) nextErrors.email = "이메일을 입력하세요.";
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = "올바른 이메일 형식을 입력하세요.";

    if (!form.password) nextErrors.password = "비밀번호를 입력하세요.";
    else if (!PASSWORD_PATTERN.test(form.password)) {
      nextErrors.password = "8자 이상, 영문·숫자·특수문자를 포함해야 합니다.";
    }

    if (!form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호 확인을 입력하세요.";
    else if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";

    if (!form.role) nextErrors.role = "역할을 선택하세요.";
    if (form.status !== "active" && form.status !== "inactive") nextErrors.status = "초기 상태를 선택하세요.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmRegister = async () => {
    if (isSubmitting || !form.role) return;

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setIsConfirmOpen(false);
    setIsSubmitting(false);
    router.push("/admin/admins?created=1");
  };

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} noValidate className="max-w-[880px]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">관리자 계정 등록</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              신규 CMS 관리자 계정 등록 폼입니다. 계정 등록 기능은 준비 중이며 비밀번호는 저장·표시하지 않습니다.
            </p>
          </div>
          <Link
            href="/admin/admins"
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            onClick={(event) => {
              if (isDirty && !window.confirm("입력 중인 내용이 있습니다. 목록으로 이동할까요?")) {
                event.preventDefault();
              }
            }}
          >
            목록으로
          </Link>
        </div>

        <div className="mt-7 space-y-4">
          <FormSection title="기본 정보" description="관리자 이름과 로그인 이메일을 입력합니다.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#374151]">이름</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="h-10 w-full rounded-md border border-[#d1d5db] px-3 outline-none focus:border-[#111827]"
                  autoComplete="off"
                />
                <FieldError message={errors.name} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#374151]">관리자 이메일</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="name@example.invalid"
                  className="h-10 w-full rounded-md border border-[#d1d5db] px-3 outline-none focus:border-[#111827]"
                  autoComplete="off"
                />
                <FieldError message={errors.email} />
              </label>
            </div>
          </FormSection>

          <FormSection title="비밀번호 설정" description="8자 이상, 영문·숫자·특수문자를 포함해야 합니다.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#374151]">비밀번호</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className="h-10 w-full rounded-md border border-[#d1d5db] px-3 outline-none focus:border-[#111827]"
                  autoComplete="new-password"
                />
                <FieldError message={errors.password} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-[#374151]">비밀번호 확인</span>
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(event) => updateField("passwordConfirm", event.target.value)}
                  className="h-10 w-full rounded-md border border-[#d1d5db] px-3 outline-none focus:border-[#111827]"
                  autoComplete="new-password"
                />
                <FieldError message={errors.passwordConfirm} />
              </label>
            </div>
          </FormSection>

          <FormSection title="역할 및 권한" description="역할을 선택하면 해당 역할의 메뉴 접근 범위가 적용됩니다. 기본값은 없습니다.">
            <div className="space-y-3" role="radiogroup" aria-label="역할 선택">
              {(["super_admin", "operator", "viewer"] as AdminRole[]).map((role) => (
                <label key={role} className="flex cursor-pointer items-start gap-3 rounded-md border border-[#e5e7eb] px-4 py-3 hover:bg-[#f9fafb]">
                  <input
                    type="radio"
                    name="admin-role"
                    checked={form.role === role}
                    onChange={() => updateField("role", role)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#111827]">{ADMIN_ROLE_LABEL[role]}</span>
                    <span className="mt-0.5 block text-xs text-[#6b7280]">
                      {role === "super_admin"
                        ? "전체 메뉴와 민감 액션을 포함한 최고 권한"
                        : role === "operator"
                          ? "운영 메뉴 중심의 일반 관리 권한"
                          : "조회 중심의 제한된 권한"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errors.role} />
          </FormSection>

          <FormSection title="계정 초기 상태" description="등록 시점의 로그인 가능 여부를 선택합니다. 기본값은 active입니다.">
            <div className="space-y-3" role="radiogroup" aria-label="초기 상태 선택">
              {(["active", "inactive"] as const).map((status) => (
                <label key={status} className="flex cursor-pointer items-start gap-3 rounded-md border border-[#e5e7eb] px-4 py-3 hover:bg-[#f9fafb]">
                  <input
                    type="radio"
                    name="admin-status"
                    checked={form.status === status}
                    onChange={() => updateField("status", status)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#111827]">{ADMIN_STATUS_LABEL[status]}</span>
                    <span className="mt-0.5 block text-xs text-[#6b7280]">
                      {status === "active" ? "즉시 로그인 가능한 상태" : "생성 후 로그인 불가 상태"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errors.status} />
          </FormSection>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/admin/admins"
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            onClick={(event) => {
              if (isDirty && !window.confirm("입력 중인 내용이 있습니다. 목록으로 이동할까요?")) {
                event.preventDefault();
              }
            }}
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            계정 등록
          </button>
        </div>
      </form>

      <DialogOverlay open={isConfirmOpen} onClose={() => { if (!isSubmitting) setIsConfirmOpen(false); }} labelledBy="admin-create-confirm-title">
        <h2 id="admin-create-confirm-title" className="text-lg font-semibold text-[#111827]">
          관리자 계정 등록 확인
        </h2>
        <p className="mt-2 text-sm text-[#6b7280]">아래 정보로 관리자 계정을 등록할까요? 비밀번호는 표시하지 않습니다.</p>
        <dl className="mt-4 space-y-2 rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#6b7280]">이름</dt>
            <dd className="font-medium text-[#111827]">{form.name.trim()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6b7280]">이메일</dt>
            <dd className="font-medium text-[#111827]">{form.email.trim()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6b7280]">역할</dt>
            <dd className="font-medium text-[#111827]">{form.role ? ADMIN_ROLE_LABEL[form.role] : "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#6b7280]">초기 상태</dt>
            <dd className="font-medium text-[#111827]">{ADMIN_STATUS_LABEL[form.status]}</dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsConfirmOpen(false)}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmRegister}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
