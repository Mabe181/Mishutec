import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { isMutationAllowed } from "@/lib/db-guard";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const guard = isMutationAllowed();

  return (
    <AdminLayoutClient dbName={guard.dbName} isAcademic={!guard.allowed}>
      {children}
    </AdminLayoutClient>
  );
}