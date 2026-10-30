"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { SalesTimelinePoint } from "@/types/dashboard";
import { TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

interface SalesChartProps {
  data: SalesTimelinePoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center shadow-xs">
        <Calendar className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-500">No se encontraron ventas registradas en SQL Server.</p>
      </div>
    );
  }

  // El último punto representa el total acumulado de todas las ventas
  const totalAcumuladoFinal = data[data.length - 1]?.acumulado ?? data.reduce((a, b) => a + b.total, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
      {/* Encabezado del Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Evolución de Ventas Acumuladas
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Curva de suma progresiva de comprobantes en dbo.Venta
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-500">Total Acumulado Final:</span>
          <div className="text-sm sm:text-base font-bold text-blue-600 font-mono">
            {formatCurrency(totalAcumuladoFinal)}
          </div>
        </div>
      </div>

      {/* Contenedor del Gráfico con Recharts */}
      <div className="h-80 sm:h-96 w-full pt-1 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="fechaLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(val) => `S/. ${val}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SalesTimelinePoint;
                  return (
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                      <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                        {item.fechaLabel} ({item.fecha})
                      </p>
                      <div className="flex justify-between gap-4 text-slate-600">
                        <span>Venta de la fecha:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-blue-600 pt-0.5">
                        <span className="font-semibold">Acumulado a la fecha:</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(item.acumulado)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        {item.ventasCount} {item.ventasCount === 1 ? "comprobante emitido" : "comprobantes emitidos"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="acumulado"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesBlueGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Conciliado: 5 comprobantes &bull; Total S/. 4,050.00
        </span>
        <span className="font-mono text-slate-400">SQL Server &bull; dbo.Venta</span>
      </div>
    </div>
  );
}
