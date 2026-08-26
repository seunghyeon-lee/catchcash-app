import {
  MOCK_SUPPORT_INQUIRIES,
  findInquiry,
  toSupportStatus,
  type SupportAnswer,
  type SupportInquiry,
} from "./support-mock";
import { getAuthenticatedUserSession, type AuthenticatedUserSession } from "./auth-session";

type SupportInquiryRow = {
  id: string;
  title: string;
  content: string;
  /** DB enum 이지만 조회 결과는 문자열이라, 라벨을 찍기 전에 `toSupportStatus` 로 좁힌다. */
  status: string;
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

type SupportReplyRow = {
  content: string;
  created_at: string;
};

/**
 * `support_replies` 행 → 화면용 답변.
 * `admin_user_id` 는 select 하지 않는다 — 담당자 실명은 사용자 화면에 필요 없고,
 * `admin_users` 는 `admin_users_select_admin` 정책상 일반 사용자가 읽지도 못한다.
 */
export function toSupportAnswers(rows: SupportReplyRow[]): SupportAnswer[] {
  return rows.map((row) => ({ content: row.content, date: formatSupportDate(row.created_at) }));
}

export function toSupportInquiry(row: SupportInquiryRow, answers: SupportAnswer[] = []): SupportInquiry {
  return {
    id: row.id,
    title: row.title,
    date: formatSupportDate(row.created_at),
    status: toSupportStatus(row.status),
    question: row.content,
    answers,
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

  // 조회 실패는 "문의가 하나도 없음"과 다르다. 빈 배열을 돌려주면 남긴 문의가 있는데도
  // 빈 상태 화면이 떠서 사용자가 문의가 사라진 걸로 읽는다 → MD 8절대로 mock 으로 되돌린다.
  if (error) {
    return {
      inquiries: MOCK_SUPPORT_INQUIRIES,
      source: "mock",
      errorMessage: "문의 내역을 불러오지 못했어. 아래는 예시 목록이야.",
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

  // 조회 자체가 실패한 것과 "그런 문의가 없다"는 구분해야 한다.
  // 에러일 때 undefined 를 돌려주면 멀쩡한 문의를 없는 문의처럼 안내하게 된다.
  if (inquiryError) {
    return {
      inquiry: findInquiry(inquiryId),
      source: "mock",
      errorMessage: "문의를 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  // 여기까지 왔는데 행이 없으면 정말로 없거나 남의 문의다(RLS 가 에러 대신 0건을 준다).
  if (!inquiryRow) {
    return { inquiry: undefined, source: "supabase" };
  }

  const { data: replies, error: repliesError } = await session.client
    .from("support_replies")
    .select("content, created_at")
    .eq("inquiry_id", inquiryRow.id)
    .order("created_at", { ascending: true });

  // 문의는 읽혔으니 상세는 그대로 띄우고, 답변만 비운 채 이유를 위에 한 줄로 알린다.
  if (repliesError) {
    return {
      inquiry: toSupportInquiry(inquiryRow as SupportInquiryRow),
      source: "supabase",
      errorMessage: "답변을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  return {
    inquiry: toSupportInquiry(inquiryRow as SupportInquiryRow, toSupportAnswers((replies ?? []) as SupportReplyRow[])),
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
