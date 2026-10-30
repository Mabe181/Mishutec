"use client";

import { InventoryDashboardStats } from "@/types/inventory";
import { formatCurrency } from "@/lib/formatters";
import {
  Boxes,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

interface InventoryKpiCardsProps {
  stats: InventoryDashboardStats;
}

export function InventoryKpiCards({ stats }: InventoryKpiCardsProps) {
  const kpis = [
    {
      title: "Existencias Totales",
      value: `${stats.totalUnidades.toLocaleString()} unid.`,
      subtitle: `${stats.totalMovimientos} movimientos registrados`,
      icon: Boxes,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      colSpan: "col-span-1",
    },
    {
      title: "Valor del Inventario",
      value: formatCurrency(stats.valorInventarioVenta),
      subtitle: "Calculado a precio de venta",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      colSpan: "col-span-2 sm:col-span-1", // Ancho completo en móvil para evitar truncar moneda
    },
    {
      title: "Entradas Totales",
      value: `+${stats.totalEntradas.toLocaleString()} unid.`,
      subtitle: "Ingresos acumulados a almacén",
      icon: ArrowDownRight,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      colSpan: "col-span-1",
    },
    {
      title: "Salidas Totales",
      value: `-${stats.totalSalidas.toLocaleString()} unid.`,
      subtitle: "Egresos físicos y ventas",
      icon: ArrowUpRight,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      colSpan: "col-span-1",
    },
    {
      title: "Agotados",
      value: `${stats.productosAgotados} prod.`,
      subtitle: "Stock actual en cero",
      icon: AlertCircle,
      color: stats.productosAgotados > 0 ? "text-rose-600" : "text-slate-400",
      bg: stats.productosAgotados > 0 ? "bg-rose-50" : "bg-slate-50",
      border: stats.productosAgotados > 0 ? "border-rose-100" : "border-slate-200",
      colSpan: "col-span-1",
    },
    {
      title: "Stock Bajo (≤ 5)",
      value: `${stats.productosStockBajo} prod.`,
      subtitle: "Próximos a agotarse",
      icon: AlertTriangle,
      color: stats.productosStockBajo > 0 ? "text-amber-600" : "text-slate-400",
      bg: stats.productosStockBajo > 0 ? "bg-amber-50" : "bg-slate-50",
      border: stats.productosStockBajo > 0 ? "border-amber-100" : "border-slate-200",
      colSpan: "col-span-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs transition-all hover:border-blue-300 ${kpi.colSpan}`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} shrink-0`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-mono truncate">
              {kpi.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {kpi.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}