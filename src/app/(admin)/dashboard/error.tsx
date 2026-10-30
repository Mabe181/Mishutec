"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Database } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[450px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-xl space-y-4">
        <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Error al Cargar Datos del Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            No se pudo completar la consulta sobre SQL Server Express (MishutecT2).
            Compruebe que el servicio de base de datos se encuentre activo y disponible.
          </p>
        </div>

        {error.message && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Detalle del error:</span>
            <p className="text-xs font-mono text-rose-700 break-words mt-1">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar Consulta
          </button>

          <Link
            href="/diagnostico"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <Database className="h-3.5 w-3.5 text-blue-600" />
            Diagnóstico Técnico
          </Link>
        </div>
      </div>
    </div>
  );
}
