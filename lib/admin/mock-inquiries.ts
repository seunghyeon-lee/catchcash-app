export type AdminInquiryCategory = "general" | "coupon" | "reward" | "account" | "bug" | "improvement" | "etc";
export type AdminInquiryStatus = "reading" | "resolved";

export type AdminSupportReply = {
  id: string;
  inquiry_id: string;
  admin_user_id: string;
  admin_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type AdminSupportInquiry = {
  id: string;
  user_id: string;
  user_nickname: string;
  category: AdminInquiryCategory;
  title: string;
  content: string;
  status: AdminInquiryStatus;
  created_at: string;
  updated_at: string;
  replies: AdminSupportReply[];
};

export const ADMIN_CATEGORY_LABEL: Record<AdminInquiryCategory, string> = {
  general: "이용 문의",
  coupon: "쿠폰 문의",
  reward: "보상 문의",
  account: "계정 문의",
  bug: "오류 제보",
  improvement: "개선 문의",
  etc: "기타 문의",
};

export const ADMIN_STATUS_LABEL: Record<AdminInquiryStatus, string> = {
  reading: "읽는 중",
  resolved: "해결됨",
};

export const MOCK_ADMIN_INQUIRIES: AdminSupportInquiry[] = [
  {
    id: "42b7dfe7-4427-4db4-b6dc-3d0509357951",
    user_id: "b2918460-8e5a-4d2e-b1d5-0bcf8c53f815",
    user_nickname: "숲길몽",
    category: "reward",
    title: "앱에서 보상이 발급되지 않았어요",
    content: "보물상자 사냥에 성공했는데 보관함에 쿠폰이 보이지 않습니다. 확인 부탁드립니다.",
    status: "reading",
    created_at: "2026-07-28T10:23:00+09:00",
    updated_at: "2026-07-28T10:23:00+09:00",
    replies: [],
  },
  {
    id: "6af6218e-2e5d-4a0e-a1e4-2608e8cb57fc",
    user_id: "27ed93a4-c587-4852-9d23-23cf7ce1e9fd",
    user_nickname: "보물헌터01",
    category: "coupon",
    title: "쿠폰 유효기간을 확인하고 싶어요",
    content: "받은 쿠폰의 유효기간이 어디에 표시되는지 모르겠습니다.",
    status: "resolved",
    created_at: "2026-07-27T16:42:00+09:00",
    updated_at: "2026-07-27T17:04:00+09:00",
    replies: [
      {
        id: "b9d81781-0178-4728-9b0e-cad941d92324",
        inquiry_id: "6af6218e-2e5d-4a0e-a1e4-2608e8cb57fc",
        admin_user_id: "f36fd81d-cc05-4b95-ab47-ebc9048a3f9d",
        admin_name: "김운영",
        content: "보관함에서 쿠폰을 선택하면 상세 화면의 유효기간 항목에서 확인할 수 있습니다.",
        created_at: "2026-07-27T17:04:00+09:00",
        updated_at: "2026-07-27T17:04:00+09:00",
      },
    ],
  },
  {
    id: "d55d3c67-1543-4d08-b338-a4e2c2a8a40e",
    user_id: "c7c44f4a-6a4f-4af1-92f4-07f92ebef4f0",
    user_nickname: "달리는냥이",
    category: "bug",
    title: "지도 화면이 계속 로딩 상태예요",
    content: "앱을 다시 실행해도 지도 화면에서 위치를 찾는 중이라는 메시지만 보여요.",
    status: "reading",
    created_at: "2026-07-27T14:10:00+09:00",
    updated_at: "2026-07-27T14:10:00+09:00",
    replies: [],
  },
];

export function findAdminInquiry(id: string) {
  return MOCK_ADMIN_INQUIRIES.find((inquiry) => inquiry.id === id);
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
