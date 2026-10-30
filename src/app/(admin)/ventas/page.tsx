import { Metadata } from "next";
import { fetchSales, fetchPosCatalog } from "@/lib/services/sale.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { maskDni } from "@/lib/formatters";
import { SalesDashboardClient } from "@/components/sales/SalesDashboardClient";
import { ShoppingCart, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestión de Ventas y POS | MISHUTEC",
  description:
    "Consulta de comprobantes de pago, conciliación transaccional con SQL Server y Terminal Punto de Venta (POS).",
};

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const [salesData, posProducts, session] = await Promise.all([
    fetchSales(),
    fetchPosCatalog(),
    getSession(),
  ]);

  const mutationGuard = isMutationAllowed();

  // Protección de Datos Personales (Ley 29733): si no hay sesión admin autenticada,
  // se enmascara el DNI de los clientes en la lista antes de enviarlo al cliente.
  const sanitizedSales = session
    ? salesData.sales
    : salesData.sales.map((s) => ({
        ...s,
        dniCliente: maskDni(s.dniCliente),
      }));

  const sanitizedClients = session
    ? salesData.metadata.clientes
    : salesData.metadata.clientes.map((c) => ({
        ...c,
        dni: maskDni(c.dni),
      }));

  const preparedData = {
    ...salesData,
    sales: sanitizedSales,
    metadata: {
      ...salesData.metadata,
      clientes: sanitizedClients,
    },
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo de Ventas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Gestión de Ventas y POS
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Consulta de comprobantes de pago, conciliación contable y Terminal Punto de Venta.
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Fase 6B: Ventas y POS Transaccional</span>
          </div>
        </div>
      </div>

      {/* Componente Cliente del Módulo de Ventas y POS */}
      <SalesDashboardClient
        initialData={preparedData}
        posProducts={posProducts}
        isAuthenticated={!!session}
        username={session?.username ?? null}
        dbName={mutationGuard.dbName}
        isAcademic={!mutationGuard.allowed}
      />
    </div>
  );
}
