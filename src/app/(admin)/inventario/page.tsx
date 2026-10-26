import { Metadata } from "next";
import { getInventoryPageData } from "@/lib/services/inventory.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { InventoryDashboardClient } from "@/components/inventory/InventoryDashboardClient";
import { Boxes, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Control de Inventario y Kardex | MISHUTEC",
  description:
    "Gestión física de existencias, trazabilidad de movimientos y Kardex con bloqueo atómico en SQL Server.",
};

export const dynamic = "force-dynamic";

interface InventarioPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventarioPage({
  searchParams,
}: InventarioPageProps) {
  const resolvedSearchParams = await searchParams;

  const [inventoryData, session] = await Promise.all([
    getInventoryPageData({
      query: typeof resolvedSearchParams.query === "string" ? resolvedSearchParams.query : undefined,
      categoria: typeof resolvedSearchParams.categoria === "string" ? resolvedSearchParams.categoria : undefined,
      estado: typeof resolvedSearchParams.estado === "string" ? resolvedSearchParams.estado : undefined,
      kardexProducto: typeof resolvedSearchParams.kardexProducto === "string" ? resolvedSearchParams.kardexProducto : undefined,
      kardexTipo: typeof resolvedSearchParams.kardexTipo === "string" ? resolvedSearchParams.kardexTipo : undefined,
      fechaInicio: typeof resolvedSearchParams.fechaInicio === "string" ? resolvedSearchParams.fechaInicio : undefined,
      fechaFin: typeof resolvedSearchParams.fechaFin === "string" ? resolvedSearchParams.fechaFin : undefined,
    }),
    getSession(),
  ]);

  const mutationGuard = isMutationAllowed();

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo de Inventario */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Control de Inventario y Kardex
              </h1>
              <p className="text-xs text-slate-400">
                Supervisión física de almacén, movimientos transaccionales y balance determinístico en SQL Server.
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-slate-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Fase 4: Inventario y Kardex</span>
          </div>
        </div>
      </div>

      {/* Componente Cliente con KPIs, Tabla de Existencias, Kardex y Modales CRUD */}
      <InventoryDashboardClient
        stats={inventoryData.stats}
        products={inventoryData.products}
        kardex={inventoryData.kardex}
        metadata={inventoryData.metadata}
        isAuthenticated={!!session}
        username={session?.username ?? null}
      />
    </div>
  );
}
