import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "캐치캐쉬",
  description: "보물을 찾고 캐시를 모으는 캐치캐쉬",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><AppShell>{children}</AppShell></body></html>;
}
