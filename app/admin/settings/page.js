import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import AdminSettings from "@/components/admin/AdminSettings";

export const metadata = {
  title: "Settings · RF Riddhy Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await getSession();

  return (
    <Suspense
      fallback={
        <div style={{ padding: 32, color: "#687269", fontStyle: "italic" }}>
          Loading settings...
        </div>
      }
    >
      <AdminSettings session={session} />
    </Suspense>
  );
}
