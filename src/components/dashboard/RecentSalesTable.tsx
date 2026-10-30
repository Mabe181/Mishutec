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
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs shadow-xs">
        No se registran ventas en el sistema.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Últimas Ventas Realizadas ({sales.length})
          </h3>
        </div>
        <Link
          href="/ventas"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
        >
          Ver módulo ventas <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Vista de Tarjetas para Móvil (< md) */}
      <div className="md:hidden divide-y divide-slate-100">
        {sales.map((sale) => (
          <div key={sale.idVenta} className="py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900 text-xs truncate">
                  {sale.numeroComprobante}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider shrink-0 ${
                    sale.tipoComprobante === "Factura"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {sale.tipoComprobante}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm shrink-0">
                {formatCurrency(sale.total)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-700">
              <span className="font-medium truncate">{sale.cliente}</span>
              <span className="text-slate-500 font-mono shrink-0">DNI: {sale.dniCliente}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="truncate">Atendido por: {sale.empleado}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-medium">
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
            <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <th className="py-2.5 px-3 font-semibold">Comprobante</th>
              <th className="py-2.5 px-3 font-semibold">Fecha</th>
              <th className="py-2.5 px-3 font-semibold">Cliente</th>
              <th className="py-2.5 px-3 font-semibold">Atendido por</th>
              <th className="py-2.5 px-3 font-semibold">Método de Pago</th>
              <th className="py-2.5 px-3 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sales.map((sale) => (
              <tr key={sale.idVenta} className="hover:bg-slate-50/80 transition-colors">
                {/* Comprobante */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-mono font-semibold text-slate-900 block">
                        {sale.numeroComprobante}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider ${
                          sale.tipoComprobante === "Factura"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {sale.tipoComprobante}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Fecha */}
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                  {formatDate(sale.fecha)}
                </td>

                {/* Cliente */}
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-900">{sale.cliente}</div>
                  <div className="text-[10px] text-slate-500 font-mono">DNI: {sale.dniCliente}</div>
                </td>

                {/* Empleado */}
                <td className="py-3 px-3 text-slate-700">
                  {sale.empleado}
                </td>

                {/* Método de Pago */}
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                    {sale.metodosPago}
                  </span>
                </td>

                {/* Total */}
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
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
