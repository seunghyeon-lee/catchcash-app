import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <main className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-paper shadow-xl">{children}</main>;
}
