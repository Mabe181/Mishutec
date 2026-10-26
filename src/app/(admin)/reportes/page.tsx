import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getReportsPageData } from "@/lib/services/report.service";
import { getSession } from "@/lib/auth/session";
import { ReportsDashboardClient } from "@/components/reports/ReportsDashboardClient";

export const metadata: Metadata = {
  title: "Reportes y Analítica Comercial | MISHUTEC",
  description:
    "Inteligencia de negocios, trazabilidad de ingresos, rotación de inventarios, garantías RMA y análisis de proveedores.",
};

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const dbName = process.env.DB_NAME || "MishutecT2_Aceptacion";
  const isAcademic = dbName.toLowerCase() === "mishutect2";

  // Carga inicial SSR con filtros históricos completos para usuario autenticado
  const initialData = await getReportsPageData({}, true);

  return (
    <div className="space-y-6">
      <ReportsDashboardClient
        initialData={initialData}
        dbName={dbName}
        isAcademic={isAcademic}
        isAuthenticated={Boolean(session)}
      />
    </div>
  );
}
