import type { SupportInquiry, SupportStatus } from "./support-mock";
import { getAuthenticatedUserSession, type AuthenticatedUserSession } from "./auth-session";

type SupportInquiryRow = {
  id: string;
  title: string;
  content: string;
  status: SupportStatus;
  created_at: string;
};

export type SupportSession = AuthenticatedUserSession;

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
