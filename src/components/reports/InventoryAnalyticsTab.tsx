"use client";

import { useMemo } from "react";
import { InventoryAnalytics } from "@/types/reports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Info,
  Layers,
  Repeat,
} from "lucide-react";

interface InventoryAnalyticsTabProps {
  inventario: InventoryAnalytics;
}

export function InventoryAnalyticsTab({ inventario }: InventoryAnalyticsTabProps) {
  const categoryBarData = useMemo(() => {
    return inventario.stockPorCategoria.map((c) => ({
      name: c.categoria,
      Stock: c.stockTotal,
      ValorRetail: c.valorVenta,
    }));
  }, [inventario.stockPorCategoria]);

  const brandBarData = useMemo(() => {
    return inventario.stockPorMarca.map((m) => ({
      name: m.marca,
      Stock: m.stockTotal,
      ValorRetail: m.valorVenta,
    }));
  }, [inventario.stockPorMarca]);

  return (
    <div className="space-y-6">
      {/* 1. NOTA TÉCNICA DE VALORIZACIÓN RETAIL VS COSTO */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-950">
            Aclaración Técnica sobre la Valoración Económica del Inventario
          </div>
          <p className="text-amber-800 leading-relaxed">
            La cifra de <strong>S/ {inventario.valorTotalInventarioVenta.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</strong> representa
            el <strong>valor potencial de realización a precio de venta minorista al público</strong> (&sum; Stock &times; Precio Unitario).
            El modelo relacional existente no almacena costo histórico en el Kardex ni vincula unidades vendidas a un lote específico de proveedor;
            por tanto, este indicador no debe interpretarse como costo contable de adquisición ni patrimonio neto inmovilizado.
          </p>
        </div>
      </div>

      {/* 2. GRÁFICAS DE STOCK POR CATEGORÍA Y POR MARCA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock por Categoría */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Existencias por Categoría
                </h3>
                <p className="text-xs text-slate-500">Unidades físicas en bodega</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "ValorRetail" ? `S/ ${Number(value).toFixed(2)}` : `${value} unidades`,
                    name === "ValorRetail" ? "Valor Potencial Retail" : "Stock Físico",
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Stock Físico" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock por Fabricante / Marca */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Existencias por Fabricante (Marca)
                </h3>
                <p className="text-xs text-slate-500">Concentración de volumen por proveedor de marca</p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "ValorRetail" ? `S/ ${Number(value).toFixed(2)}` : `${value} unidades`,
                    name === "ValorRetail" ? "Valor Potencial Retail" : "Stock Físico",
                  ]}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="Stock" fill="#10b981" radius={[4, 4, 0, 0]} name="Stock Físico" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. RESUMEN DE FLUJO KARDEX */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Resumen Acumulado del Flujo Físico de Kardex
            </h3>
            <p className="text-xs text-slate-500">
              Total de unidades transaccionadas según tipo de movimiento en dbo.Mov_Inventario
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 font-medium">Entradas Registradas</span>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">
                {inventario.movimientosResumen.entradasTotal} <span className="text-xs font-normal">unidades</span>
              </div>
              <span className="text-[10px] text-emerald-600">Compras y reingresos por garantía</span>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 font-medium">Salidas Despachadas</span>
              <div className="text-xl font-bold text-rose-900 mt-0.5">
                {inventario.movimientosResumen.salidasTotal} <span className="text-xs font-normal">unidades</span>
              </div>
              <span className="text-[10px] text-rose-600">Ventas en POS y mermas</span>
            </div>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 font-medium">Ajustes de Inventario</span>
              <div className="text-xl font-bold text-slate-800 mt-0.5">
                {inventario.movimientosResumen.ajustesTotal} <span className="text-xs font-normal">unidades</span>
              </div>
              <span className="text-[10px] text-slate-500">Correcciones físicas de conteo</span>
            </div>
            <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLA DE STOCK BAJO / AGOTADOS & ROTACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos en Stock Crítico */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Productos con Stock Bajo o Agotados
              </h3>
              <p className="text-xs text-slate-500">
                Existencias iguales o menores al umbral de seguridad (&le; 5 unidades)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3 text-center">Stock</th>
                  <th className="py-2 px-3 text-right">Precio Venta</th>
                  <th className="py-2 px-3 text-center">Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventario.productosAgotados.map((p) => (
                  <tr key={p.codbarras} className="bg-rose-50/40">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-rose-900">{p.nombreProd}</div>
                      <div className="text-[10px] text-rose-600 font-mono">{p.codbarras}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{p.categoria}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-700">0</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">S/ {p.precio.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        AGOTADO
                      </span>
                    </td>
                  </tr>
                ))}
                {inventario.productosStockBajo.map((p) => (
                  <tr key={p.codbarras} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{p.nombreProd}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.codbarras}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{p.categoria}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-700">{p.stock}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">S/ {p.precio.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        CRÍTICO
                      </span>
                    </td>
                  </tr>
                ))}
                {inventario.productosAgotados.length === 0 && inventario.productosStockBajo.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      Todos los productos cuentan con niveles de stock óptimos (&gt; 5 unidades)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rotación de Productos */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Índice de Rotación por Producto
              </h3>
              <p className="text-xs text-slate-500">
                Proporción de unidades vendidas respecto al volumen total administrado
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3 text-center">Vendidas</th>
                  <th className="py-2 px-3 text-center">Stock Actual</th>
                  <th className="py-2 px-3 text-center">Índice Rotación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventario.productosRotacion.slice(0, 8).map((p) => (
                  <tr key={p.codbarras} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-900">{p.nombreProd}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.codbarras}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-blue-700">
                      {p.unidadesVendidas}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700">
                      {p.stockActual}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-violet-600 h-full rounded-full"
                            style={{ width: `${Math.min(p.indiceRotacion, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {p.indiceRotacion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
