// 문의(Support) Mock Data
// 출처: docs/frontend/user-app/15_1 · 15_2 · 15_3 정의서
// 다음 단계에서 Supabase `support_tickets` 조회/등록으로 교체.

/** 프론트 표시 기준 상태값 (15_1 7절 / 15_2 7절) */
export type SupportStatus = "reading" | "resolved";

export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  reading: "읽는 중",
  resolved: "해결됨",
};

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
