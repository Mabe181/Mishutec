import { Metadata } from "next";
import { fetchEmployees } from "@/lib/services/employee.service";
import { getSession } from "@/lib/auth/session";
import { isMutationAllowed } from "@/lib/db-guard";
import { maskDni } from "@/lib/formatters";
import { EmployeeListClient } from "@/components/employees/EmployeeListClient";
import { UserCheck, ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Directorio de Personal | MISHUTEC",
  description:
    "Gestión del equipo de ventas, almacén y atención de garantías con trazabilidad operativa en SQL Server.",
};

export const dynamic = "force-dynamic";

interface EmpleadosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EmpleadosPage({ searchParams }: EmpleadosPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : undefined;

  const [rawEmployees, session] = await Promise.all([
    fetchEmployees(query),
    getSession(),
  ]);

  // Protección de Datos Personales: si no hay sesión admin autenticada,
  // se enmascara el DNI del personal en el servidor antes del renderizado.
  const employees = session
    ? rawEmployees
    : rawEmployees.map((e) => ({
        ...e,
        dni: maskDni(e.dni),
      }));

  const mutationGuard = isMutationAllowed();

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Directorio de Personal y Empleados
              </h1>
              <p className="text-xs text-slate-500">
                Supervisión del equipo operativo, autorizaciones de venta y control de movimientos en SQL Server.
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
      <EmployeeListClient
        initialEmployees={employees}
        isAuthenticated={!!session}
        username={session?.username ?? null}
      />
    </div>
  );
}