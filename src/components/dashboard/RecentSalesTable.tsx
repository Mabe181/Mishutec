import { RecentSale } from "@/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ShoppingBag, ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";

interface RecentSalesTableProps {
  sales: RecentSale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
        No se registran ventas en el sistema.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            Últimas Ventas Realizadas ({sales.length})
          </h3>
        </div>
        <Link
          href="/ventas"
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
        >
          Ver módulo ventas <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Vista de Tarjetas para Móvil (< md) */}
      <div className="md:hidden divide-y divide-slate-800/80">
        {sales.map((sale) => (
          <div key={sale.idVenta} className="py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="font-mono font-bold text-white text-xs truncate">
                  {sale.numeroComprobante}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider shrink-0 ${
                    sale.tipoComprobante === "Factura"
                      ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {sale.tipoComprobante}
                </span>
              </div>
              <span className="font-mono font-bold text-cyan-400 text-sm shrink-0">
                {formatCurrency(sale.total)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-medium truncate">{sale.cliente}</span>
              <span className="text-slate-400 font-mono shrink-0">DNI: {sale.dniCliente}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="truncate">Atendido por: {sale.empleado}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-medium">
                  {sale.metodosPago}
                </span>
                <span>{formatDate(sale.fecha)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla Responsive para Pantallas Medianas y Grandes (>= md) */}
      <div className="hidden md:block overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-medium">Comprobante</th>
              <th className="py-2.5 px-3 font-medium">Fecha</th>
              <th className="py-2.5 px-3 font-medium">Cliente</th>
              <th className="py-2.5 px-3 font-medium">Atendido por</th>
              <th className="py-2.5 px-3 font-medium">Método de Pago</th>
              <th className="py-2.5 px-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {sales.map((sale) => (
              <tr key={sale.idVenta} className="hover:bg-slate-800/40 transition-colors">
                {/* Comprobante */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-mono font-semibold text-white block">
                        {sale.numeroComprobante}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider ${
                          sale.tipoComprobante === "Factura"
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {sale.tipoComprobante}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Fecha */}
                <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                  {formatDate(sale.fecha)}
                </td>

                {/* Cliente */}
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-100">{sale.cliente}</div>
                  <div className="text-[10px] text-slate-400 font-mono">DNI: {sale.dniCliente}</div>
                </td>

                {/* Empleado */}
                <td className="py-3 px-3 text-slate-300">
                  {sale.empleado}
                </td>

                {/* Método de Pago */}
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-950 text-cyan-300 border border-slate-800 font-medium">
                    {sale.metodosPago}
                  </span>
                </td>

                {/* Total */}
                <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                  {formatCurrency(sale.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
