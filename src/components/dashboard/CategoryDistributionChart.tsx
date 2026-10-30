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
  "#2563eb", // Blue
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#6366f1", // Indigo
];

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center shadow-xs">
        <Layers className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-500">No hay categorías registradas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <PieChart className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Productos y Stock por Categoría
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />

            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />

            <YAxis
              type="category"
              dataKey="nombreCategoria"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              width={95}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryDistribution;
                  return (
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-900">{item.nombreCategoria}</p>
                      <p className="text-blue-600 font-mono">
                        Modelos registrados: <span className="font-bold">{item.totalProductos}</span>
                      </p>
                      <p className="text-slate-700 font-mono">
                        Stock total: <span className="font-bold">{formatNumber(item.stockTotal)} unidades</span>
                      </p>
                      <p className="text-emerald-700 font-mono">
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

      <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
        <span>Métricas por agrupación relacional</span>
        <span className="font-mono text-slate-400">{data.length} categorías activas</span>
      </div>
    </div>
  );
}
