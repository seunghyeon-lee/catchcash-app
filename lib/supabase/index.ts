export {
  getSupabaseBrowserClient,
  getSupabaseBrowserClientOrNull,
  getSupabasePublicEnv,
  hasSupabasePublicEnv,
} from "./client";
export type { SupabasePublicEnv } from "./client";

export { getBrowserAuthSession, getCurrentUserId } from "./session";
export type { BrowserAuthSession } from "./session";

export {
  canAttemptSupabaseQuery,
  createMockFallbackResult,
  getMockFallbackReason,
  shouldUseMockFallback,
} from "./fallback";
export type { MockFallbackReason, SupabaseDataSource } from "./fallback";
