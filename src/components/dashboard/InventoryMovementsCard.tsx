import { InventoryMovement } from "@/types/dashboard";
import { formatDate } from "@/lib/formatters";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import Link from "next/link";

interface InventoryMovementsCardProps {
  movements: InventoryMovement[];
}

export function InventoryMovementsCard({ movements }: InventoryMovementsCardProps) {
  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs shadow-xs">
        No hay movimientos de inventario registrados.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <History className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Últimos Movimientos de Kardex ({movements.length})
          </h3>
        </div>
        <Link
          href="/inventario"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
        >
          Ver kardex <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Lista de Movimientos */}
      <div className="divide-y divide-slate-100">
        {movements.map((mov) => {
          const isEntrada = mov.tipoMov.toLowerCase() === "entrada";

          return (
            <div
              key={mov.idMovimiento}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isEntrada
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isEntrada ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div className="truncate">
                  <span className="font-semibold text-slate-900 truncate block">
                    {mov.nombreProducto}
                  </span>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(mov.fecha)}</span>
                    <span>&bull;</span>
                    <span className="truncate">Por: {mov.empleado}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-mono font-bold text-xs ${
                    isEntrada ? "text-emerald-700" : "text-blue-700"
                  }`}
                >
                  {isEntrada ? "+" : "-"}
                  {mov.cantidad} unid.
                </span>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {mov.tipoMov}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
