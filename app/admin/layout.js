import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import "@/components/admin/adminResponsive.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await getSession();
  const isAdmin =
    session &&
    [
      "admin",
      "super-admin",
      "support",
      "warehouse",
      "marketing",
      "finance",
    ].includes(session.role);

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading Admin...</div>}>
      <AdminShell session={isAdmin ? session : null}>{children}</AdminShell>
    </Suspense>
  );
}
