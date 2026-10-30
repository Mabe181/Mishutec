import { Metadata } from "next";
import { fetchSuppliers } from "@/lib/services/supplier.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { SupplierListClient } from "@/components/suppliers/SupplierListClient";
import { Building2, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Directorio de Proveedores | MISHUTEC",
  description:
    "Gestión de distribuidores mayoristas, marcas, precios de adquisición y catálogo suministrado en SQL Server.",
};

export const dynamic = "force-dynamic";

interface ProveedoresPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProveedoresPage({ searchParams }: ProveedoresPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : undefined;

  const [suppliers, session] = await Promise.all([
    fetchSuppliers(query),
    getSession(),
  ]);

  const mutationGuard = isMutationAllowed();

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Directorio de Proveedores
              </h1>
              <p className="text-xs text-slate-500">
                Administración de socios comerciales, importadores y líneas de suministro en SQL Server.
              </p>
            </div>
          </div>
        </div>

        {/* Indicadores de Entorno y Fase */}
        <div className="flex flex-wrap items-center gap-2">
          {!mutationGuard.allowed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800 shadow-xs">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>BD Académica Protegida ({mutationGuard.dbName})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Entorno Aceptación Activo ({mutationGuard.dbName})</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>Fase 5: Clientes, Proveedores y Empleados</span>
          </div>
        </div>
      </div>

      {/* Componente Cliente con KPIs, Buscador y Modales */}
      <SupplierListClient
        initialSuppliers={suppliers}
        isAuthenticated={!!session}
        username={session?.username ?? null}
      />
    </div>
  );
}