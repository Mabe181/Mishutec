import { SalesKpis } from "@/types/sales";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  CircleDollarSign,
  ShoppingCart,
  Receipt,
  FileCheck2,
  TrendingUp,
} from "lucide-react";

interface SaleKpiCardsProps {
  kpis: SalesKpis;
}

export function SaleKpiCards({ kpis }: SaleKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* KPI 1: Ventas Acumuladas (ocupa 2 columnas en móvil para evitar corte de moneda) */}
      <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Total Facturado
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CircleDollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-cyan-400 truncate">
            {formatCurrency(kpis.totalVentasAcumuladas)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Suma de dbo.Venta.Total_venta
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Conciliado 100%</span>
          <span className="font-mono text-slate-400">SQL Express</span>
        </div>
      </div>

      {/* KPI 2: Comprobantes Emitidos */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Comprobantes
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-white truncate">
            {formatNumber(kpis.cantidadVentas)} ops.
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Transacciones registradas
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span className="text-blue-400 font-medium">Histórico</span>
          <span>5 ventas</span>
        </div>
      </div>

      {/* KPI 3: Ticket Promedio */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Ticket Promedio
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400 truncate">
            {formatCurrency(kpis.ticketPromedio)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Promedio por comprobante
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Mediana operativa</span>
          <span className="font-mono text-emerald-400">En soles</span>
        </div>
      </div>

      {/* KPI 4: Desglose por Comprobante */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Tipo Documento
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FileCheck2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
          <div className="flex-1">
            <div className="text-base sm:text-xl font-bold font-mono text-slate-200">
              {kpis.totalBoletas} <span className="text-[10px] text-slate-400 font-sans font-normal">Boletas</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-cyan-400 mt-0.5">
              {kpis.totalFacturas} <span className="text-[10px] text-slate-400 font-sans font-normal">Factura</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Total: {kpis.totalBoletas + kpis.totalFacturas}</span>
          <span className="text-cyan-400 font-mono">B001 / F001</span>
        </div>
      </div>
    </div>
  );
}
