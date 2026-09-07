"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { loadAdminSession } from "@/lib/admin/admin-session";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/access-denied"] as const;

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [canRender, setCanRender] = useState(() => isPublicAdminPath(pathname));

  useEffect(() => {
    let isMounted = true;

    if (isPublicAdminPath(pathname)) {
      setCanRender(true);
      return () => {
        isMounted = false;
      };
    }

    setCanRender(false);

    const verifyAdminSession = async () => {
      const session = await loadAdminSession();
      if (!isMounted) return;

      if (session.status === "authorized") {
        setCanRender(true);
        return;
      }

      if (session.status === "unauthenticated") {
        router.replace("/admin/login");
        return;
      }

      router.replace("/admin/access-denied?reason=role_missing");
    };

    void verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!canRender) {
    return (
      <main className="fixed inset-0 z-50 grid place-items-center bg-[#f8fafc] p-6 text-sm text-[#6b7280]">
        관리자 권한을 확인하는 중...
      </main>
    );
  }

  return children;
}
