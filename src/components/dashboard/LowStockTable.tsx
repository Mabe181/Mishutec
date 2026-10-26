import { LowStockProduct } from "@/types/dashboard";
import { formatCurrency } from "@/lib/formatters";
import { AlertTriangle, PackageX, Info } from "lucide-react";
import Link from "next/link";

interface LowStockTableProps {
  products: LowStockProduct[];
  threshold?: number;
}

export function LowStockTable({ products, threshold = 5 }: LowStockTableProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">
            Alerta de Stock Bajo y Agotados ({products.length})
          </h3>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
          <Info className="h-3 w-3 text-cyan-400 shrink-0" />
          <span>Umbral visual configurado: ≤ {threshold} unidades</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Productos prioritarios que requieren reabastecimiento según inventario en tiempo real:
      </p>

      {/* Lista de Productos */}
      {products.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-lg border border-slate-800">
          No hay productos con stock igual o inferior a {threshold} unidades.
        </div>
      ) : (
        <>
          {/* Vista de Tarjetas para Móvil (< md) */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {products.map((item) => (
              <div key={item.codbarras} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-white text-xs block leading-tight">
                      {item.nombre}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Cód: {item.codbarras} &bull; {item.marca}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-100 text-xs shrink-0">
                    {formatCurrency(item.precio)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 text-[10px]">{item.categoria}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        item.stock === 0
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {item.stock} {item.stock === 1 ? "ud." : "uds."}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        item.nivelUrgencia === "Agotado"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : item.nivelUrgencia === "Crítico"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.nivelUrgencia}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla Responsive para Pantallas Medianas y Grandes (>= md) */}
          <div className="hidden md:block overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Producto</th>
                  <th className="py-2.5 px-3 font-medium">Categoría</th>
                  <th className="py-2.5 px-3 font-medium">Marca</th>
                  <th className="py-2.5 px-3 font-medium text-center">Stock Actual</th>
                  <th className="py-2.5 px-3 font-medium text-center">Nivel</th>
                  <th className="py-2.5 px-3 font-medium text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {products.map((item) => (
                  <tr key={item.codbarras} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">
                        {item.nombre}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Cód: {item.codbarras}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {item.categoria}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {item.marca}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          item.stock === 0
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {item.stock} {item.stock === 1 ? "unidad" : "unidades"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.nivelUrgencia === "Agotado"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : item.nivelUrgencia === "Crítico"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {item.nivelUrgencia}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                      {formatCurrency(item.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong>Nota de Arquitectura:</strong> El umbral de {threshold} unidades corresponde a un filtro visual
          definido a nivel de presentación en la capa SaaS; no representa un CHECK constraint ni restricción rígida
          en la base de datos SQL Server.
        </span>
      </div>
    </div>
  );
}
