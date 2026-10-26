"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { CategoryDistribution } from "@/types/dashboard";
import { PieChart, Layers } from "lucide-react";

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
}

const BAR_COLORS = [
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#0ea5e9", // Sky
];

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Layers className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-400">No hay categorías registradas.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Productos y Stock por Categoría
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Volumen de inventario en dbo.Categoria y dbo.Producto
          </p>
        </div>
      </div>

      {/* Gráfico de Barras Horizontales */}
      <div className="h-80 sm:h-96 w-full pt-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />

            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />

            <YAxis
              type="category"
              dataKey="nombreCategoria"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              width={95}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryDistribution;
                  return (
                    <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-white">{item.nombreCategoria}</p>
                      <p className="text-cyan-400 font-mono">
                        Modelos registrados: <span className="font-bold">{item.totalProductos}</span>
                      </p>
                      <p className="text-slate-300 font-mono">
                        Stock total: <span className="font-bold">{formatNumber(item.stockTotal)} unidades</span>
                      </p>
                      <p className="text-emerald-400 font-mono">
                        Valor en inventario: <span className="font-bold">{formatCurrency(item.valorInventario)}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="stockTotal" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.idCategoria}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
        <span>Métricas por agrupación relacional</span>
        <span className="font-mono">{data.length} categorías activas</span>
      </div>
    </div>
  );
}
