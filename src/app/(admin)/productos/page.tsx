import { Metadata } from "next";
import {
  getCatalogProducts,
  getCatalogFilterMetadata,
  getProductDetailByBarcode,
} from "@/lib/services/product.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { ProductCatalogClient } from "@/components/products/ProductCatalogClient";
import { Package, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Catálogo de Productos | MISHUTEC",
  description:
    "Catálogo y fichas técnicas de componentes de hardware desde SQL Server.",
};

export const dynamic = "force-dynamic";

interface ProductosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const resolvedSearchParams = await searchParams;

  // Consultas concurrentes en el servidor
  const [paginatedResult, filterMetadata, session] = await Promise.all([
    getCatalogProducts(resolvedSearchParams),
    getCatalogFilterMetadata(),
    getSession(),
  ]);

  const mutationGuard = isMutationAllowed();

  const selectedBarcode =
    typeof resolvedSearchParams.selectedProduct === "string"
      ? resolvedSearchParams.selectedProduct
      : null;

  const initialDetail = selectedBarcode
    ? await getProductDetailByBarcode(selectedBarcode)
    : null;

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Catálogo de Productos
              </h1>
              <p className="text-xs text-slate-400">
                Gestión transaccional, especialización técnica y cadena de suministro en SQL Server.
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de Estado de Fase 3B y Protección de BD */}
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
            <span>Fase 3B: Transaccional</span>
          </div>
        </div>
      </div>

      {/* Componente Cliente con Filtros, Tabla, Paginación y Modales CRUD */}
      <ProductCatalogClient
        initialResult={paginatedResult}
        metadata={filterMetadata}
        initialSelectedDetail={initialDetail}
        isAuthenticated={!!session}
        username={session?.username}
      />
    </div>
  );
}
