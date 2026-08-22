import { hasSupabasePublicEnv } from "./client";

export type SupabaseDataSource = "supabase" | "mock";

export type MockFallbackReason = "missing_env" | "missing_session" | "supabase_error";

export function shouldUseMockFallback(options: {
  hasPublicEnv?: boolean;
  hasSession?: boolean;
  hasError?: boolean;
}) {
  if (options.hasPublicEnv === false) return true;
  if (options.hasSession === false) return true;
  if (options.hasError === true) return true;
  return false;
}

export function getMockFallbackReason(options: {
  hasPublicEnv?: boolean;
  hasSession?: boolean;
  hasError?: boolean;
}): MockFallbackReason | null {
  if (options.hasPublicEnv === false) return "missing_env";
  if (options.hasSession === false) return "missing_session";
  if (options.hasError === true) return "supabase_error";
  return null;
}

export function createMockFallbackResult<T>(data: T, message?: string) {
  return {
    data,
    source: "mock" as const satisfies SupabaseDataSource,
    message,
  };
}

export function canAttemptSupabaseQuery() {
  return hasSupabasePublicEnv();
}
