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
      {/* KPI 1: Ventas Acumuladas */}
      <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Facturado
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <CircleDollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 truncate">
            {formatCurrency(kpis.totalVentasAcumuladas)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[11px] text-slate-500 truncate">
            Suma de dbo.Venta.Total_venta
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Conciliado 100%</span>
          <span className="font-mono text-slate-600">SQL Express</span>
        </div>
      </div>

      {/* KPI 2: Comprobantes Emitidos */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Comprobantes
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 truncate">
            {formatNumber(kpis.cantidadVentas)} ops.
          </div>
          <p className="mt-0.5 sm:mt-1 text-[11px] text-slate-500 truncate">
            Transacciones registradas
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="text-blue-600 font-medium">Histórico</span>
          <span>5 ventas</span>
        </div>
      </div>

      {/* KPI 3: Ticket Promedio */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-700 truncate">
            {formatCurrency(kpis.ticketPromedio)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[11px] text-slate-500 truncate">
            Promedio por comprobante
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Mediana operativa</span>
          <span className="font-mono text-emerald-700">En soles</span>
        </div>
      </div>

      {/* KPI 4: Desglose por Comprobante */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tipo Documento
          </span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-violet-50 border border-violet-100 text-violet-600">
            <FileCheck2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
          <div className="flex-1">
            <div className="text-base sm:text-xl font-bold font-mono text-slate-900">
              {kpis.totalBoletas} <span className="text-[10px] text-slate-500 font-sans font-normal">Boletas</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-blue-600 mt-0.5">
              {kpis.totalFacturas} <span className="text-[10px] text-slate-500 font-sans font-normal">Factura</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Total: {kpis.totalBoletas + kpis.totalFacturas}</span>
          <span className="text-blue-600 font-mono">B001 / F001</span>
        </div>
      </div>
    </div>
  );
}
