import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/masuk" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
