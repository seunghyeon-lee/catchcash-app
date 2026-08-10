import { MOCK_SUPPORT_INQUIRIES, findInquiry, type SupportInquiry, type SupportStatus } from "./support-mock";
import { getAuthenticatedUserSession, type AuthenticatedUserSession } from "./auth-session";

type SupportInquiryRow = {
  id: string;
  title: string;
  content: string;
  status: SupportStatus;
  created_at: string;
};

export type SupportSession = AuthenticatedUserSession;

export type SupportDataSource = "supabase" | "mock";

export type ListSupportInquiriesResult = {
  inquiries: SupportInquiry[];
  source: SupportDataSource;
  errorMessage?: string;
};

export type GetSupportInquiryResult = {
  inquiry: SupportInquiry | undefined;
  source: SupportDataSource;
  errorMessage?: string;
};

export type CreateSupportInquiryInput = {
  category: string;
  title: string;
  content: string;
};

export type CreateSupportInquiryResult = {
  source: SupportDataSource;
  ok: boolean;
  inquiryId?: string;
  errorMessage?: string;
};

export function formatSupportDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" })
    .format(date)
    .replace(/\.$/, "");
}

export function toSupportInquiry(row: SupportInquiryRow, answer: string | null = null): SupportInquiry {
  return {
    id: row.id,
    title: row.title,
    date: formatSupportDate(row.created_at),
    status: row.status,
    question: row.content,
    answer,
  };
}

/**
 * TODO(auth): 로그인 플로우가 완성되면 auth.users.id를
 * 프로필/문의 전 화면의 공통 세션 상태로 교체한다. 세션이 없을 때는 임의 UUID를
 * 만들거나 DB에 쓰지 않고 화면별 mock fallback을 사용한다.
 *
 * Prefer `getAuthenticatedUserSession` from `./auth-session`.
 */
export async function getAuthenticatedSupportSession(): Promise<SupportSession | null> {
  return getAuthenticatedUserSession();
}

/**
 * `/support` 내 문의 목록.
 * 세션이 없으면 mock 목록. 세션이 있으면 본인 `user_id` 문의만 조회한다.
 */
export async function listSupportInquiries(): Promise<ListSupportInquiriesResult> {
  const session = await getAuthenticatedSupportSession();

  if (!session) {
    return { inquiries: MOCK_SUPPORT_INQUIRIES, source: "mock" };
  }

  const { data, error } = await session.client
    .from("support_inquiries")
    .select("id, title, content, status, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      inquiries: [],
      source: "supabase",
      errorMessage: "문의 내역을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  return {
    inquiries: ((data ?? []) as SupportInquiryRow[]).map((row) => toSupportInquiry(row)),
    source: "supabase",
  };
}

/**
 * `/support/[inquiryId]` 상세.
 * 본인 문의만 조회하고, 답변은 `support_replies` 첫 건을 사용한다.
 */
export async function getSupportInquiry(inquiryId: string): Promise<GetSupportInquiryResult> {
  const session = await getAuthenticatedSupportSession();

  if (!session) {
    return { inquiry: findInquiry(inquiryId), source: "mock" };
  }

  const { data: inquiryRow, error: inquiryError } = await session.client
    .from("support_inquiries")
    .select("id, title, content, status, created_at")
    .eq("id", inquiryId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (inquiryError) {
    return {
      inquiry: undefined,
      source: "supabase",
      errorMessage: "문의를 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  if (!inquiryRow) {
    return { inquiry: undefined, source: "supabase" };
  }

  const { data: replies, error: repliesError } = await session.client
    .from("support_replies")
    .select("content, created_at")
    .eq("inquiry_id", inquiryRow.id)
    .order("created_at", { ascending: true });

  if (repliesError) {
    return {
      inquiry: toSupportInquiry(inquiryRow as SupportInquiryRow, null),
      source: "supabase",
      errorMessage: "답변을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  return {
    inquiry: toSupportInquiry(inquiryRow as SupportInquiryRow, replies?.[0]?.content ?? null),
    source: "supabase",
  };
}

/**
 * `/support/new` 문의 작성.
 * 세션이 없으면 DB insert 없이 mock 성공만 반환한다. fake user_id 금지.
 */
export async function createSupportInquiry(
  input: CreateSupportInquiryInput,
): Promise<CreateSupportInquiryResult> {
  const session = await getAuthenticatedSupportSession();

  if (!session) {
    return { source: "mock", ok: true };
  }

  const { data, error } = await session.client
    .from("support_inquiries")
    .insert({
      user_id: session.userId,
      category: input.category,
      title: input.title.trim(),
      content: input.content.trim(),
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      source: "supabase",
      ok: false,
      errorMessage: "문의 접수에 실패했어. 잠시 후 다시 시도해줘.",
    };
  }

  return { source: "supabase", ok: true, inquiryId: data.id as string };
}
