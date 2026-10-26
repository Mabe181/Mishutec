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
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      colSpan: "col-span-1",
    },
    {
      title: "Valor del Inventario",
      value: formatCurrency(stats.valorInventarioVenta),
      subtitle: "Calculado a precio de venta",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      colSpan: "col-span-2 sm:col-span-1", // Ancho completo en móvil para evitar truncar moneda
    },
    {
      title: "Entradas Totales",
      value: `+${stats.totalEntradas.toLocaleString()} unid.`,
      subtitle: "Ingresos acumulados a almacén",
      icon: ArrowDownRight,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      colSpan: "col-span-1",
    },
    {
      title: "Salidas Totales",
      value: `-${stats.totalSalidas.toLocaleString()} unid.`,
      subtitle: "Egresos físicos y ventas",
      icon: ArrowUpRight,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      colSpan: "col-span-1",
    },
    {
      title: "Agotados",
      value: `${stats.productosAgotados} prod.`,
      subtitle: "Stock actual en cero",
      icon: AlertCircle,
      color: stats.productosAgotados > 0 ? "text-rose-400" : "text-slate-400",
      bg: stats.productosAgotados > 0 ? "bg-rose-500/10" : "bg-slate-800/40",
      border: stats.productosAgotados > 0 ? "border-rose-500/30" : "border-slate-800",
      colSpan: "col-span-1",
    },
    {
      title: "Stock Bajo (≤ 5)",
      value: `${stats.productosStockBajo} prod.`,
      subtitle: "Próximos a agotarse",
      icon: AlertTriangle,
      color: stats.productosStockBajo > 0 ? "text-amber-400" : "text-slate-400",
      bg: stats.productosStockBajo > 0 ? "bg-amber-500/10" : "bg-slate-800/40",
      border: stats.productosStockBajo > 0 ? "border-amber-500/30" : "border-slate-800",
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
            className={`p-3 sm:p-4 rounded-xl bg-slate-900/80 border ${kpi.border} shadow-sm transition-all hover:bg-slate-900 ${kpi.colSpan}`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} shrink-0`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-base sm:text-xl font-bold tracking-tight text-white font-mono truncate">
              {kpi.value}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 truncate">
              {kpi.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}