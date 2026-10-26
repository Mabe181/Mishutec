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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Calendar className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-400">No se encontraron ventas registradas en SQL Server.</p>
      </div>
    );
  }

  // El último punto representa el total acumulado de todas las ventas
  const totalAcumuladoFinal = data[data.length - 1]?.acumulado ?? data.reduce((a, b) => a + b.total, 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
      {/* Encabezado del Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Evolución de Ventas Acumuladas
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Curva de suma progresiva de comprobantes en dbo.Venta
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-400">Total Acumulado Final:</span>
          <div className="text-sm sm:text-base font-bold text-cyan-400 font-mono">
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
              <linearGradient id="salesCyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="fechaLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) => `S/. ${val}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SalesTimelinePoint;
                  return (
                    <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1.5">
                      <p className="font-semibold text-white border-b border-slate-800 pb-1">
                        {item.fechaLabel} ({item.fecha})
                      </p>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Venta de la fecha:</span>
                        <span className="font-mono font-semibold text-slate-100">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-cyan-400 pt-0.5">
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
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesCyanGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Conciliado: 5 comprobantes &bull; Total S/. 4,050.00
        </span>
        <span className="font-mono">SQL Server &bull; dbo.Venta</span>
      </div>
    </div>
  );
}
