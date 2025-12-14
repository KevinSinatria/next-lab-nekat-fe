"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    const verifySession = async () => {
      const isValid = await checkAuth();

      if (!isValid) {
        router.replace("/");
        toast.error("Anda harus login terlebih dahulu!");
      }
    };

    if (!isAuthenticated) {
      verifySession();
    }
  }, [isAuthenticated, router, checkAuth]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="text-sm text-muted-foreground">
            Memverifikasi akses...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
