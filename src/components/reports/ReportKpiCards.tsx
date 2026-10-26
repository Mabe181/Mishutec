"use client";

import { ReportKpiMetrics } from "@/types/reports";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
} from "lucide-react";

interface ReportKpiCardsProps {
  kpis: ReportKpiMetrics;
}

export function ReportKpiCards({ kpis }: ReportKpiCardsProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* 1. SECTOR COMERCIAL Y FACTURACIÓN */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Desempeño Comercial y Facturación
          </span>
          <span className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ventas Totales */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Ventas Totales</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              S/ {kpis.ventasTotales.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Monto neto facturado acumulado</span>
            </p>
          </div>

          {/* Comprobantes Emitidos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Comprobantes Emitidos</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {kpis.comprobantesCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Boletas y Facturas registradas
            </p>
          </div>

          {/* Ticket Promedio */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Ticket Promedio</span>
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              S/ {kpis.ticketPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Promedio de gasto por venta
            </p>
          </div>

          {/* Unidades Vendidas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Unidades Vendidas</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {kpis.unidadesVendidas} <span className="text-xs font-normal text-slate-500">unids.</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Despachadas en línea de detalle
            </p>
          </div>
        </div>
      </div>

      {/* 2. SECTOR INVENTARIO Y ALMACÉN */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Estado de Almacén y Valoración
          </span>
          <span className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stock Total Físico */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Stock Total Físico</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
              {kpis.stockTotal} <span className="text-xs font-normal text-slate-500">unidades</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Existencias disponibles en almacén
            </p>
          </div>

          {/* Valoración Potencial Retail */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-500">Valor Retail Potencial</span>
                <span title="Valor calculado a precio de venta al público (Stock × Precio). No representa costo de adquisición." className="cursor-help text-slate-400 hover:text-slate-600">
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-teal-700 tracking-tight">
              S/ {kpis.valorInventarioVenta.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Precio venta (No costo compra)
            </p>
          </div>

          {/* Catálogo Activo */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-slate-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Catálogo de Productos</span>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {kpis.productosCatalogo} <span className="text-xs font-normal text-slate-500">SKUs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Referencias maestras activas
            </p>
          </div>

          {/* Alertas de Stock */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Alertas de Stock</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">
              {kpis.productosAgotados + kpis.productosStockBajo}
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({kpis.productosStockBajo} bajo, {kpis.productosAgotados} agot.)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Productos con necesidad de reposición
            </p>
          </div>
        </div>
      </div>

      {/* 3. SECTOR GARANTÍAS Y RMA */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Garantías y Calidad Postventa (RMA)
          </span>
          <span className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Trámites RMA Totales */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-violet-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Trámites RMA Totales</span>
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:scale-110 transition-transform">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {kpis.totalDevoluciones}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Devoluciones registradas
            </p>
          </div>

          {/* Aprobadas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Devoluciones Aprobadas</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
              {kpis.devolucionesAprobadas}
            </div>
            <p className="text-[11px] text-slate-500 mt-1" title="Aprobación de garantía comercial. La reincorporación a stock vendible requiere certificación técnica y autorización expresa.">
              {kpis.unidadesAprobadasTotal} unids. aprobadas ({kpis.unidadesReingresadasKardex} en stock)
            </p>
          </div>

          {/* Pendientes / Rechazadas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-orange-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Pendientes / Rechazadas</span>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              <span className="text-amber-600">{kpis.devolucionesPendientes}</span>
              <span className="text-slate-300 mx-1">/</span>
              <span className="text-rose-600">{kpis.devolucionesRechazadas}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              En evaluación técnica vs denegadas
            </p>
          </div>

          {/* Tasa de Incidencia y Retorno */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-rose-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Incidencia Solicitudes RMA</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 tracking-tight">
              {kpis.tasaIncidenciaSolicitudes.toFixed(2)}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1" title="8 solicitudes / 15 vendidas (53.33%). Aprobación técnica: 40.00%. Reingreso Kardex: 6.67%.">
              Aprobada: {kpis.tasaDevolucionAprobada.toFixed(1)}% &bull; Reingreso: {kpis.tasaReingresoKardex.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
