import { useAuthStore } from "@/store/useAuthStore";
import { ReactNode } from "react";
import Unauthorized from "./Unauthorized";

interface RoleBasedGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleBasedGuard({
  children,
  allowedRoles,
}: RoleBasedGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
