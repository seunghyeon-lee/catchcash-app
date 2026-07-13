import type { ReactNode } from "react";

export function RoughFrame({ children }: { children: ReactNode }) {
  return <div className="rounded-[2rem] border-2 border-ink bg-white p-5 shadow-[5px_5px_0_#171717]">{children}</div>;
}
