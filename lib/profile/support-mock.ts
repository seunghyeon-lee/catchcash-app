// 문의(Support) Mock Data
// 출처: docs/frontend/user-app/15_1 · 15_2 · 15_3 정의서
// 다음 단계에서 Supabase `support_tickets` 조회/등록으로 교체.

/** 프론트 표시 기준 상태값 (15_1 7절 / 15_2 7절) */
export type SupportStatus = "reading" | "resolved";

export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  reading: "읽는 중",
  resolved: "해결됨",
};

/**
 * DB `public.inquiry_status` 는 `reading` / `resolved` 두 값짜리 enum 이지만,
 * 조회 결과는 그냥 문자열로 넘어온다. 나중에 enum 이 늘거나 값이 비어 오면
 * `SUPPORT_STATUS_LABEL[status]` 가 undefined 가 되어 배지·도장이 빈 칸으로 찍힌다.
 * 모르는 값은 아직 처리 전이라는 뜻이므로 `reading` 으로 모은다.
 */
export function toSupportStatus(value: string | null | undefined): SupportStatus {
  return value === "resolved" ? "resolved" : "reading";
}

export type SupportInquiry = {
  id: string;
  title: string;
  /** 등록일 (MM.DD) */
  date: string;
  status: SupportStatus;
  /** 사용자가 쓴 문의 본문 */
  question: string;
  /** 관리자 답변 — 없으면 null (읽는 중) */
  answer: string | null;
};

export const MOCK_SUPPORT_INQUIRIES: SupportInquiry[] = [
  {
    id: "inquiry_001",
    title: "스타벅스 아메리카노 안 들어옴",
    date: "10.24",
    status: "resolved",
    question: "스타벅스 아메리카노 사냥 성공했는데 보관함에 안 뜬다. 이거 사기 아님? 빨리 내놔라.",
    answer: "데이터 좀 꼬였더라. 다시 던져놨으니까 보관함이나 가봐라. 이제 됐지?",
  },
  {
    id: "inquiry_002",
    title: "이거 왜 포인트 적립 안 됨? 사기 아님?",
    date: "10.22",
    status: "reading",
    question: "이거 왜 포인트 적립 안 됨? 사기 아님?",
    answer: null,
  },
  {
    id: "inquiry_003",
    title: "계정 탈퇴하고 싶어요... 근데 포인트가 아까워요",
    date: "10.15",
    status: "resolved",
    question: "계정 탈퇴하고 싶어요... 근데 포인트가 아까워요. 어떻게 하면 되나요?",
    answer: "포인트부터 다 쓰고 와라. 그 다음에 설정에서 탈퇴하면 된다.",
  },
];

export function findInquiry(id: string): SupportInquiry | undefined {
  return MOCK_SUPPORT_INQUIRIES.find((item) => item.id === id);
}

/** 답변 대기 안내 문구 (15_2 6-3) */
export const SUPPORT_ANSWER_WAITING = "아직 읽는 중이야. 답변 오면 알림으로 알려줄게.";

/**
 * `해결됨`인데 답변 본문이 비어 있을 때.
 *
 * 관리자가 상태만 바꿨거나, 답변 조회만 실패했거나(`support_replies` 권한/네트워크),
 * 트리거가 상태를 먼저 옮긴 직후에 생긴다. 이때 대기 문구를 그대로 쓰면 위쪽 도장은
 * `해결됨`인데 본문은 `아직 읽는 중`이라 서로 말이 안 맞는다.
 */
export const SUPPORT_ANSWER_RESOLVED_WITHOUT_REPLY = "답변은 달렸다는데 본문이 안 보여. 잠시 후 다시 확인해줘.";

/** 답변 카드 본문 — 답변이 있으면 그대로, 없으면 상태에 맞는 안내 문구 */
export function resolveAnswerText(inquiry: Pick<SupportInquiry, "status" | "answer">) {
  if (inquiry.answer) return inquiry.answer;
  return inquiry.status === "resolved" ? SUPPORT_ANSWER_RESOLVED_WITHOUT_REPLY : SUPPORT_ANSWER_WAITING;
}
