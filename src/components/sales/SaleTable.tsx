import { useState } from "react";
import { SaleListItem } from "@/types/sales";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FileText,
  Calendar,
  User,
  CreditCard,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

interface SaleTableProps {
  sales: SaleListItem[];
  onViewDetail: (idVenta: number) => void;
}

const ITEMS_PER_PAGE = 8;

export function SaleTable({ sales, onViewDetail }: SaleTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE) || 1;
  const paginatedSales = sales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
        <FileText className="h-10 w-10 mx-auto text-slate-500 mb-2 opacity-50" />
        <p className="text-sm font-medium text-slate-300">
          No se encontraron ventas con los filtros seleccionados.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Intente ajustando el término de búsqueda o rango de fechas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista Móvil (< 768px): Tarjetas Adaptables */}
      <div className="md:hidden space-y-3">
        {paginatedSales.map((sale) => (
          <div
            key={sale.idVenta}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-3"
          >
            {/* Fila 1: Comprobante, Tipo y Monto */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-white text-sm block">
                    {sale.numeroComprobante}
                  </span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      sale.tipoComprobante === "Factura"
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {sale.tipoComprobante}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-cyan-400 text-base block">
                  {formatCurrency(sale.total)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {sale.totalItems} {sale.totalItems === 1 ? "ítem" : "ítems"}
                </span>
              </div>
            </div>

            {/* Fila 2: Cliente y Fecha */}
            <div className="text-xs space-y-1 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-medium truncate">{sale.clienteNombre}</span>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  DNI: {sale.dniCliente}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Atendido por: {sale.empleadoNombre}</span>
                <span className="shrink-0">{formatDate(sale.fecha)}</span>
              </div>
            </div>

            {/* Fila 3: Método de pago y Botón de Acción */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-cyan-300 border border-slate-800 truncate max-w-[170px]">
                {sale.metodosPago}
              </span>

              <button
                type="button"
                onClick={() => onViewDetail(sale.idVenta)}
                className="inline-flex items-center gap-1.5 px-3 min-h-[42px] rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 active:bg-cyan-500/30 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver Detalle</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Escritorio (>= 768px): Tabla Densa */}
      <div className="hidden md:block rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Atendido por</th>
                <th className="py-3 px-4">Método de Pago</th>
                <th className="py-3 px-4 text-center">Ítems</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {paginatedSales.map((sale) => (
                <tr
                  key={sale.idVenta}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Comprobante */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
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
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    {formatDate(sale.fecha)}
                  </td>

                  {/* Cliente */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-100">
                      {sale.clienteNombre}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      DNI: {sale.dniCliente}
                    </div>
                  </td>

                  {/* Empleado */}
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {sale.empleadoNombre}
                  </td>

                  {/* Métodos de Pago */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-950 text-cyan-300 border border-slate-800 font-medium whitespace-nowrap">
                      {sale.metodosPago}
                    </span>
                  </td>

                  {/* Ítems */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="font-mono text-slate-400">
                      {sale.totalItems} unid.
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400 text-sm whitespace-nowrap">
                    {formatCurrency(sale.total)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetail(sale.idVenta)}
                      title="Ver Detalle y Conciliación"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ficha</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
          <span>
            Página {currentPage} de {totalPages} ({sales.length} comprobantes)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
