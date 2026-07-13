import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-screen w-full max-w-[480px] bg-paper shadow-xl">{children}</main>;
}
