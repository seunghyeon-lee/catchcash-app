import Link from "next/link";

const tabs = [{ href: "/home", label: "홈" }, { href: "/map", label: "지도" }, { href: "/inventory", label: "보관함" }, { href: "/profile", label: "프로필" }];

export function BottomTab() {
  return <nav className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-ink/10 bg-paper/95 px-4 py-3 text-xs font-bold backdrop-blur">{tabs.map((tab) => <Link key={tab.href} href={tab.href} className="rounded-full px-4 py-2 hover:bg-brand">{tab.label}</Link>)}</nav>;
}
