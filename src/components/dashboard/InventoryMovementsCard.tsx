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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
        No hay movimientos de inventario registrados.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            Últimos Movimientos de Kardex ({movements.length})
          </h3>
        </div>
        <Link
          href="/inventario"
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
        >
          Ver kardex <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Lista de Movimientos */}
      <div className="divide-y divide-slate-800/80">
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
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {isEntrada ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div className="truncate">
                  <span className="font-semibold text-white truncate block">
                    {mov.nombreProducto}
                  </span>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(mov.fecha)}</span>
                    <span>&bull;</span>
                    <span className="truncate">Por: {mov.empleado}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-mono font-bold text-xs ${
                    isEntrada ? "text-emerald-400" : "text-blue-400"
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
