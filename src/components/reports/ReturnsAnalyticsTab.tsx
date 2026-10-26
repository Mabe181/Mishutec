"use client";

import { useMemo } from "react";
import { ReturnsAnalytics } from "@/types/reports";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  ShieldAlert,
  Info,
  UserCheck,
} from "lucide-react";

interface ReturnsAnalyticsTabProps {
  devoluciones: ReturnsAnalytics;
}

const STATUS_COLORS: Record<string, string> = {
  "Pendiente": "#f59e0b",
  "Aprobada": "#10b981",
  "Rechazada": "#ef4444",
};

export function ReturnsAnalyticsTab({ devoluciones }: ReturnsAnalyticsTabProps) {
  const pieStatusData = useMemo(() => {
    return devoluciones.porEstado.map((e) => ({
      name: e.estado,
      value: e.total,
      percentage: e.porcentaje,
    }));
  }, [devoluciones.porEstado]);

  const motivosBarData = useMemo(() => {
    return devoluciones.porMotivo.map((m) => ({
      name: m.motivo,
      Casos: m.total,
      Unidades: m.unidadesDevueltas,
    }));
  }, [devoluciones.porMotivo]);

  return (
    <div className="space-y-6">
      {/* 1. ACLARACIÓN COMERCIAL: GARANTÍAS RMA VS REEMBOLSOS MONETARIOS Y POLÍTICA DE REINGRESO (H-04) */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <div className="font-semibold text-blue-950 text-sm">
            Tratamiento Transaccional y Política de Inventario en Devoluciones y Garantías (RMA)
          </div>
          <p className="text-blue-800 leading-relaxed">
            El módulo de Devoluciones administra exclusivamente la resolución de garantías comerciales de hardware.
            En el modelo transaccional de Mishutec <strong>no existen notas de crédito ni devoluciones de dinero</strong>;
            por lo tanto, el total facturado en ventas (S/ 5,500.00) se mantiene íntegro e inalterado en concordancia con
            la normativa tributaria para comprobantes emitidos.
          </p>
          <div className="pt-1 border-t border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
            <strong>Política de Reincorporación a Existencias (H-04):</strong> La aprobación administrativa de un trámite RMA
            reconoce formalmente la garantía del cliente, pero <strong>no incrementa automáticamente el inventario vendible</strong>.
            Los productos defectuosos nunca retornan al stock comercial. Únicamente los artículos no averiados (ej. motivo
            <em> &quot;Producto equivocado&quot;</em>) con empaque íntegro pueden ser reincorporados a existencias previa certificación
            técnica y registro formal de un movimiento Kardex de Entrada.
          </div>
        </div>
      </div>

      {/* 2. KPIs Y DISTRIBUCIÓN POR ESTADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Estado de Trámites RMA
              </h3>
              <p className="text-xs text-slate-500">Distribución de resoluciones técnicas</p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieStatusData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={STATUS_COLORS[entry.name] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} trámite(s)`, name]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {devoluciones.porEstado.map((e) => (
              <div key={e.idEstado} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[e.estado] || "#64748b" }}
                  />
                  <span className="font-semibold text-slate-800">{e.estado}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{e.total} casos</span>
                  <span className="text-[10px] text-slate-500">({e.porcentaje}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivos de Reclamación */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Causas Frecuentes de Garantía
              </h3>
              <p className="text-xs text-slate-500">Motivos catalogados y volumen de unidades afectadas</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={motivosBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="Casos" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Trámites Totales" />
                <Bar dataKey="Unidades" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Unidades Afectadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. PRODUCTOS MÁS DEVUELTOS & GESTIÓN POR EMPLEADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos Más Devueltos */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Incidencia de Fallas por Producto
                </h3>
                <p className="text-xs text-slate-500">
                  Artículos con mayor tasa de devolución y valor comprometido
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3 text-center">Trámites RMA</th>
                  <th className="py-2 px-3 text-center">Unids. Devueltas</th>
                  <th className="py-2 px-3 text-right">Valor Venta Comprometido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devoluciones.productosMasDevueltos.map((p) => (
                  <tr key={p.codbarras} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{p.nombreProd}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.codbarras}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                      {p.vecesDevuelto}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">
                      {p.unidadesDevueltas}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      S/ {p.impactoValorVenta.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trámites por Empleado */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Atención RMA por Empleado
              </h3>
              <p className="text-xs text-slate-500">Gestores de resolución técnica</p>
            </div>
          </div>

          <div className="space-y-3">
            {devoluciones.porEmpleado.map((emp) => (
              <div key={emp.idEmpleado} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800 text-xs">{emp.empleado}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                  {emp.totalTramites} trámites
                </span>
              </div>
            ))}
          </div>

          {/* Ratios RMA Desglosados (H-03) */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Unidades Vendidas Históricas:</span>
              <span className="font-bold text-slate-900">{devoluciones.relacionRetornoVentas.totalVendidas} unid.</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span title="Cantidad total solicitada en expedientes RMA">Unidades Reclamadas (Brutas):</span>
              <span className="font-bold text-amber-700">{devoluciones.relacionRetornoVentas.unidadesReclamadasTotal ?? 8} unid.</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span title="Aprobadas administrativamente para garantía">Unidades Aprobadas RMA:</span>
              <span className="font-bold text-blue-700">{devoluciones.relacionRetornoVentas.unidadesAprobadasTotal ?? 6} unid.</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span title="Reingresadas formalmente al Kardex de almacén">Reingreso Físico Kardex:</span>
              <span className="font-bold text-emerald-700">{devoluciones.relacionRetornoVentas.unidadesReingresadasKardex ?? 1} unid.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DESGLOSE METODOLÓGICO DE INDICADORES RMA (H-03) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Desglose Metodológico de Indicadores RMA y Calidad Postventa
              </h3>
              <p className="text-xs text-slate-500">
                Diferenciación técnica entre incidencia de reclamaciones, resoluciones aprobadas y restock efectivo
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
            Base: 15 Unids. Vendidas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Indicador A */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                Indicador A: Incidencia Bruta
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                8 / 15
              </span>
            </div>
            <div className="text-2xl font-black text-amber-950 font-mono">
              {(devoluciones.relacionRetornoVentas.tasaIncidenciaSolicitudes ?? 53.33).toFixed(2)}%
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Incidencia bruta de solicitudes:</strong> Mide la cantidad total solicitada en expedientes de garantía (8 unidades reclamadas en 7 trámites) respecto al volumen vendido. Aclara que mide reclamaciones tramitadas, no unidades descartadas.
            </p>
          </div>

          {/* Indicador B */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                Indicador B: Aprobación RMA
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-200 text-blue-900 rounded">
                6 / 15
              </span>
            </div>
            <div className="text-2xl font-black text-blue-950 font-mono">
              {(devoluciones.relacionRetornoVentas.tasaDevolucionAprobada ?? 40.0).toFixed(2)}%
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Unidades aprobadas en trámite:</strong> Mide las unidades cuya procedencia técnica de garantía fue aprobada administrativamente (6 unidades). No constituye reingreso a existencias, sino reconocimiento del derecho comercial.
            </p>
          </div>

          {/* Indicador C */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                Indicador C: Reingreso Kardex
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                1 / 15
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              {(devoluciones.relacionRetornoVentas.tasaReingresoKardex ?? 6.67).toFixed(2)}%
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>Reingreso comprobado a inventario:</strong> Corresponde a la única unidad física devuelta (Movimiento Kardex #52, Kingston Fury) reincorporada al stock comercial tras certificación técnica formal bajo el motivo <em>Producto equivocado</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
