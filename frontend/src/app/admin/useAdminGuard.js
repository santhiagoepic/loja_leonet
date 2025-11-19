"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAdminAuth } from "../providers/admin-auth-context";

export function useAdminGuard() {
  const adminAuth = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!adminAuth.loading && !adminAuth.isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [adminAuth.loading, adminAuth.isAuthenticated, router]);

  const ready = useMemo(() => !adminAuth.loading && adminAuth.isAuthenticated, [adminAuth.loading, adminAuth.isAuthenticated]);

  return { ...adminAuth, ready };
}
