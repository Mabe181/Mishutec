import { Metadata } from "next";
import { fetchReturnsPageData } from "@/lib/services/return.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { maskDni } from "@/lib/formatters";
import { ReturnsDashboardClient } from "@/components/returns/ReturnsDashboardClient";
import { RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestión de Devoluciones y Garantías | MISHUTEC",
  description:
    "Auditoría y consulta de solicitudes de devolución, trazabilidad de comprobantes y plazos de garantía legal.",
};

export const dynamic = "force-dynamic";

export default async function DevolucionesPage() {
  const [pageData, session] = await Promise.all([
    fetchReturnsPageData(),
    getSession(),
  ]);

  const mutationGuard = isMutationAllowed();

  // Enmascaramiento de datos personales si no hay sesión autenticada (Ley 29733)
  const sanitizedReturns = session
    ? pageData.returns
    : pageData.returns.map((r) => ({
        ...r,
        dniCliente: maskDni(r.dniCliente),
      }));

  const preparedData = {
    ...pageData,
    returns: sanitizedReturns,
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo de Devoluciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Devoluciones y Garantías (RMA)
              </h1>
              <p className="text-xs text-slate-400">
                Auditoría de trámites, historial de comprobantes y verificación de plazos de garantía.
              </p>
            </div>
          </div>
        </div>

        {/* Indicadores de Entorno y Fase */}
        <div className="flex flex-wrap items-center gap-2">
          {!mutationGuard.allowed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-[11px] font-medium text-amber-300 shadow-sm">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>BD Académica Protegida ({mutationGuard.dbName})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Entorno Aceptación Activo ({mutationGuard.dbName})</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-[11px] font-medium text-cyan-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Fase 7B: Gestión Transaccional</span>
          </div>
        </div>
      </div>

      {/* Componente Cliente del Módulo de Devoluciones */}
      <ReturnsDashboardClient
        initialData={preparedData}
        isAuthenticated={!!session}
        username={session?.username ?? null}
        dbName={mutationGuard.dbName}
        isAcademic={!mutationGuard.allowed}
      />
    </div>
  );
}
