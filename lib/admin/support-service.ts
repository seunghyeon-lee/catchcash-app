import { getSupabaseBrowserClient } from "@/lib/supabase";

import {
  findAdminInquiry,
  MOCK_ADMIN_INQUIRIES,
  type AdminInquiryCategory,
  type AdminInquiryStatus,
  type AdminSupportInquiry,
  type AdminSupportReply,
} from "./mock-inquiries";

type SupabaseInquiryRow = {
  id: string;
  user_id: string;
  category: AdminInquiryCategory;
  title: string;
  content: string;
  status: AdminInquiryStatus;
  created_at: string;
  updated_at: string;
};

type SupabaseReplyRow = Omit<AdminSupportReply, "admin_name">;
type ProfileRow = { user_id: string; nickname: string | null };

type AdminContext = {
  client: ReturnType<typeof getSupabaseBrowserClient>;
  adminUserId: string;
};

export type AdminInquiryDataSource = "supabase" | "mock";

type AdminInquiryResult = {
  inquiry: AdminSupportInquiry | undefined;
  source: AdminInquiryDataSource;
  message?: string;
};

type AdminInquiryListResult = {
  inquiries: AdminSupportInquiry[];
  source: AdminInquiryDataSource;
  message?: string;
};

function toAdminReply(row: SupabaseReplyRow): AdminSupportReply {
  return { ...row, admin_name: `관리자 ${row.admin_user_id.slice(0, 8)}` };
}

function toAdminInquiry(row: SupabaseInquiryRow, profiles: ProfileRow[], replies: AdminSupportReply[] = []): AdminSupportInquiry {
  const profile = profiles.find((item) => item.user_id === row.user_id);
  return {
    ...row,
    user_nickname: profile?.nickname ?? `사용자 ${row.user_id.slice(0, 8)}`,
    replies,
  };
}

/**
 * TODO(admin-auth): 관리자 로그인 완료 전에는 현재 Supabase 세션이 active admin인지
 * 확정할 수 없다. RPC는 admin_users를 Data API에 노출하지 않고도 RLS와 동일한
 * 관리자 식별자를 반환한다. 세션/RPC가 없으면 DB mutation을 시도하지 않는다.
 */
async function getAdminContext(): Promise<AdminContext | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return null;

    const { data: adminUserId, error: adminError } = await client.rpc("current_admin_user_id");
    if (adminError || !adminUserId) return null;

    return { client, adminUserId };
  } catch {
    return null;
  }
}

async function fetchProfiles(client: ReturnType<typeof getSupabaseBrowserClient>) {
  const { data, error } = await client.from("profiles").select("user_id, nickname");
  if (error) return [] as ProfileRow[];
  return (data ?? []) as ProfileRow[];
}

export async function loadAdminInquiries(): Promise<AdminInquiryListResult> {
  const context = await getAdminContext();
  if (!context) {
    return {
      inquiries: MOCK_ADMIN_INQUIRIES,
      source: "mock",
      message: "관리자 인증이 연결되지 않아 예시 문의를 표시하고 있습니다.",
    };
  }

  const [{ data: inquiryRows, error: inquiryError }, profiles] = await Promise.all([
    context.client.from("support_inquiries").select("id, user_id, category, title, content, status, created_at, updated_at").order("created_at", { ascending: false }),
    fetchProfiles(context.client),
  ]);

  if (inquiryError) throw new Error(inquiryError.message);

  return {
    inquiries: ((inquiryRows ?? []) as SupabaseInquiryRow[]).map((row) => toAdminInquiry(row, profiles)),
    source: "supabase",
  };
}

export async function loadAdminInquiry(id: string): Promise<AdminInquiryResult> {
  const context = await getAdminContext();
  if (!context) {
    return {
      inquiry: findAdminInquiry(id),
      source: "mock",
      message: "관리자 인증이 연결되지 않아 예시 문의를 표시하고 있습니다.",
    };
  }

  const { data: inquiryRow, error: inquiryError } = await context.client
    .from("support_inquiries")
    .select("id, user_id, category, title, content, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (inquiryError) throw new Error(inquiryError.message);
  if (!inquiryRow) return { inquiry: undefined, source: "supabase" };

  const [profiles, { data: replyRows, error: replyError }] = await Promise.all([
    fetchProfiles(context.client),
    context.client.from("support_replies").select("id, inquiry_id, admin_user_id, content, created_at, updated_at").eq("inquiry_id", id).order("created_at", { ascending: true }),
  ]);
  if (replyError) throw new Error(replyError.message);

  return {
    inquiry: toAdminInquiry(inquiryRow as SupabaseInquiryRow, profiles, ((replyRows ?? []) as SupabaseReplyRow[]).map(toAdminReply)),
    source: "supabase",
  };
}

export async function createAdminSupportReply(inquiry: AdminSupportInquiry, content: string) {
  const context = await getAdminContext();
  if (!context) return { source: "mock" as const };

  const { error: insertError } = await context.client.from("support_replies").insert({
    inquiry_id: inquiry.id,
    admin_user_id: context.adminUserId,
    content,
  });
  if (insertError) throw new Error(insertError.message);

  // `support_replies_resolve_inquiry` trigger가 status=resolved 및 notifications row를 생성한다.
  const [{ data: updatedInquiry, error: inquiryError }, { data: notifications, error: notificationError }] = await Promise.all([
    context.client.from("support_inquiries").select("status").eq("id", inquiry.id).maybeSingle(),
    context.client.from("notifications").select("id").eq("user_id", inquiry.user_id).eq("target_route", `/support/${inquiry.id}`).order("created_at", { ascending: false }).limit(1),
  ]);

  if (inquiryError) throw new Error(inquiryError.message);
  if (updatedInquiry?.status !== "resolved") throw new Error("답변은 등록됐지만 문의 상태 갱신을 확인하지 못했습니다.");

  return {
    source: "supabase" as const,
    notificationVerified: !notificationError && (notifications?.length ?? 0) > 0,
  };
}
