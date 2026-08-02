import { MOCK_PROFILE, type MockProfile, type ProfileStats } from "./mock-data";
import { getAuthenticatedUserSession } from "./auth-session";

export type ProfileDataSource = "supabase" | "mock";

export type AppProfile = MockProfile;

type ProfileRow = {
  nickname: string;
  avatar_key: string | null;
  background_key: string | null;
  intro_text: string | null;
};

export type GetProfileResult = {
  profile: AppProfile;
  source: ProfileDataSource;
  errorMessage?: string;
};

export type UpdateProfileInput = {
  nickname: string;
  intro: string;
  characterKey: string;
  colorKey: string;
};

export type UpdateProfileResult = {
  source: ProfileDataSource;
  ok: boolean;
  errorMessage?: string;
};

export type SignOutResult = {
  source: ProfileDataSource;
  ok: boolean;
  errorMessage?: string;
};

const DEFAULT_STATS: ProfileStats = MOCK_PROFILE.stats;

function toAppProfile(row: ProfileRow, stats: ProfileStats = DEFAULT_STATS): AppProfile {
  return {
    nickname: row.nickname,
    intro: row.intro_text?.trim() ?? "",
    characterKey: row.avatar_key?.trim() || MOCK_PROFILE.characterKey,
    colorKey: row.background_key?.trim() || MOCK_PROFILE.colorKey,
    stats,
  };
}

/**
 * `/profile`, `/profile/edit` 공통 조회.
 * 세션이 없으면 mock 프로필을 반환한다. Auth 연결 후 실제 `profiles` row를 읽는다.
 */
export async function getProfile(): Promise<GetProfileResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { profile: MOCK_PROFILE, source: "mock" };
  }

  const { data, error } = await session.client
    .from("profiles")
    .select("nickname, avatar_key, background_key, intro_text")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    return {
      profile: MOCK_PROFILE,
      source: "mock",
      errorMessage: "프로필을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  if (!data) {
    return {
      profile: MOCK_PROFILE,
      source: "mock",
      errorMessage: "아직 저장된 프로필이 없어서 예시 프로필을 보여주고 있어.",
    };
  }

  return {
    profile: toAppProfile(data as ProfileRow),
    source: "supabase",
  };
}

/**
 * `/profile/edit` 저장.
 * 세션이 없으면 DB에 쓰지 않고 mock 성공만 반환한다.
 * 매핑: nickname / intro_text / avatar_key(characterKey) / background_key(colorKey)
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { source: "mock", ok: true };
  }

  const { error } = await session.client
    .from("profiles")
    .update({
      nickname: input.nickname.trim(),
      intro_text: input.intro.trim() || null,
      avatar_key: input.characterKey,
      background_key: input.colorKey,
    })
    .eq("user_id", session.userId);

  if (error) {
    return {
      source: "supabase",
      ok: false,
      errorMessage: "저장에 실패했어. 잠시 후 다시 시도해줘.",
    };
  }

  return { source: "supabase", ok: true };
}

/**
 * 로그아웃.
 * TODO(auth): 세션이 있으면 signOut, 없으면 기존처럼 로그인 화면으로만 이동한다.
 */
export async function signOutProfile(): Promise<SignOutResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { source: "mock", ok: true };
  }

  const { error } = await session.client.auth.signOut();

  if (error) {
    return {
      source: "supabase",
      ok: false,
      errorMessage: "로그아웃에 실패했어. 잠시 후 다시 시도해줘.",
    };
  }

  return { source: "supabase", ok: true };
}
