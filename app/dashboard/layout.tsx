import AuthGuard from "@/components/shared/AuthGuard";
import ClientBoundary from "./_components/ClientBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fbfbfb]">
      <AuthGuard>
        <ClientBoundary>{children}</ClientBoundary>
      </AuthGuard>
    </div>
  );
}
