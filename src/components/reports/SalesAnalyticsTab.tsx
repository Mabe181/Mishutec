"use client";

import { useMemo } from "react";
import {
  SalesByDateItem,
  SalesByVoucherType,
  SalesByPaymentMethod,
  TopSellingProduct,
  SalesByCategory,
  SalesByEmployee,
  CustomerAnalyticsItem,
} from "@/types/reports";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  CreditCard,
  Receipt,
  Award,
  Users,
  ShieldCheck,
  Package,
} from "lucide-react";

interface SalesAnalyticsTabProps {
  ventasPorFecha: SalesByDateItem[];
  ventasPorComprobante: SalesByVoucherType[];
  ventasPorMetodoPago: SalesByPaymentMethod[];
  topProductos: TopSellingProduct[];
  ventasPorCategoria: SalesByCategory[];
  ventasPorEmpleado: SalesByEmployee[];
  clientesAnalytics: {
    totalClientes: number;
    conCompras: number;
    recurrentes: number;
    lista: CustomerAnalyticsItem[];
  };
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export function SalesAnalyticsTab({
  ventasPorFecha,
  ventasPorComprobante,
  ventasPorMetodoPago,
  topProductos,
  ventasPorCategoria,
  ventasPorEmpleado,
  clientesAnalytics,
}: SalesAnalyticsTabProps) {
  // Datos formateados para Recharts
  const areaData = useMemo(() => {
    return ventasPorFecha.map((v) => ({
      fecha: v.fecha,
      Venta: v.totalVenta,
      Acumulado: v.acumulado,
      Unidades: v.unidadesVendidas,
    }));
  }, [ventasPorFecha]);

  const pieComprobanteData = useMemo(() => {
    return ventasPorComprobante.map((c) => ({
      name: c.nombreTipo,
      value: c.totalVenta,
      count: c.comprobantesCount,
    }));
  }, [ventasPorComprobante]);

  const barMetodosData = useMemo(() => {
    return ventasPorMetodoPago.map((m) => ({
      name: m.nombreMetodo,
      Monto: m.montoPagado,
      Transacciones: m.transaccionesCount,
    }));
  }, [ventasPorMetodoPago]);

  return (
    <div className="space-y-6">
      {/* 1. GRÁFICAS SUPERIORES: EVOLUCIÓN TEMPORAL Y DISTRIBUCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución de Ventas Acumuladas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Evolución Cronológica de Ventas
                </h3>
                <p className="text-xs text-slate-500">
                  Ingresos diarios y curva acumulada en soles (S/)
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVenta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(val) => `S/${val}`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      typeof value === "number" ? `S/ ${value.toFixed(2)}` : value,
                      name === "Acumulado" ? "Total Acumulado" : "Venta del Día",
                    ]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="Acumulado"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAcumulado)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Venta"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVenta)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay ventas registradas para el período seleccionado
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Comprobante & Métodos de Pago */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Comprobantes y Pagos
                </h3>
                <p className="text-xs text-slate-500">Distribución de recaudación</p>
              </div>
            </div>

            {/* Donut Chart de Comprobantes */}
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieComprobanteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieComprobanteData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, "Facturado"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Desglose por Comprobante */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ventasPorComprobante.map((c, i) => (
                <div key={c.idTipoComp} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-semibold text-slate-800">{c.nombreTipo}</span>
                  </div>
                  <div className="mt-1 font-bold text-slate-900">S/ {c.totalVenta.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">{c.comprobantesCount} emitidas ({c.porcentaje}%)</div>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose de Métodos de Pago */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Modalidades de Pago</span>
            </div>
            <div className="space-y-1.5">
              {ventasPorMetodoPago.map((m) => (
                <div key={m.idMetodo} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{m.nombreMetodo}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">S/ {m.montoPagado.toFixed(2)}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {m.porcentaje}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLA DE TOP PRODUCTOS VENDIDOS & CATEGORÍAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Productos */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Productos Más Vendidos (Top Sellers)
                </h3>
                <p className="text-xs text-slate-500">Ranking por unidades despachadas y facturación</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {topProductos.length} producto{topProductos.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Categoría / Marca</th>
                  <th className="py-2 px-3 text-right">Precio Unit.</th>
                  <th className="py-2 px-3 text-center">Unid. Vendidas</th>
                  <th className="py-2 px-3 text-right">Facturado</th>
                  <th className="py-2 px-3 text-center">Stock Almacén</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProductos.map((p, idx) => (
                  <tr key={p.codbarras} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{p.nombreProd}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.codbarras}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-700">{p.categoria}</div>
                      <div className="text-[10px] text-slate-400">{p.marca}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      S/ {p.precioUnitario.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                        {p.unidadesVendidas}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      S/ {p.totalFacturado.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.stockActual <= 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.stockActual} unids.
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facturación por Categoría */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Ventas por Categoría
              </h3>
              <p className="text-xs text-slate-500">Participación en la facturación</p>
            </div>
          </div>

          <div className="space-y-3">
            {ventasPorCategoria.map((cat) => (
              <div key={cat.idCategoria} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{cat.nombreCategoria}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">S/ {cat.totalFacturado.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({cat.porcentaje}%)</span>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(cat.porcentaje, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">
                  {cat.unidadesVendidas} unidad{cat.unidadesVendidas !== 1 ? "es" : ""} vendida{cat.unidadesVendidas !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DESEMPEÑO POR EMPLEADO */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Desempeño y Productividad por Colaborador
            </h3>
            <p className="text-xs text-slate-500">
              Vouchers de venta, unidades comercializadas, ticket medio, movimientos Kardex y RMA
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2 px-3">Empleado</th>
                <th className="py-2 px-3 text-center">Ventas Realizadas</th>
                <th className="py-2 px-3 text-center">Unidades Vendidas</th>
                <th className="py-2 px-3 text-right">Facturación Total</th>
                <th className="py-2 px-3 text-right">Ticket Promedio</th>
                <th className="py-2 px-3 text-center">Movs. Kardex</th>
                <th className="py-2 px-3 text-center">Trámites RMA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventasPorEmpleado.map((emp) => (
                <tr key={emp.idEmpleado} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {emp.nombreEmpleado}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                    {emp.comprobantesCount}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                    {emp.unidadesVendidas}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                    S/ {emp.totalFacturado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    S/ {emp.ticketPromedio.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500">
                    {emp.movimientosKardexCount}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500">
                    {emp.devolucionesTramitadasCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. COMPORTAMIENTO DE CLIENTES (LEY 29733) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Cartera de Clientes y Recurrencia de Compra
              </h3>
              <p className="text-xs text-slate-500">
                Total: {clientesAnalytics.totalClientes} registrados | Con compras: {clientesAnalytics.conCompras} | Recurrentes (&ge;2): {clientesAnalytics.recurrentes}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ley 29733: Datos de contacto sujetos a protección y confidencialidad</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2 px-3">Cliente</th>
                <th className="py-2 px-3">DNI</th>
                <th className="py-2 px-3">Contacto</th>
                <th className="py-2 px-3 text-center">Compras</th>
                <th className="py-2 px-3 text-center">Unidades</th>
                <th className="py-2 px-3 text-right">Total Gastado</th>
                <th className="py-2 px-3 text-right">Ticket Prom.</th>
                <th className="py-2 px-3 text-center">Estado</th>
                <th className="py-2 px-3 text-center">Última Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesAnalytics.lista.map((c) => (
                <tr key={c.dniCliente} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {c.nombreCliente}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {c.dniCliente}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    <div>{c.correo}</div>
                    {c.telefono && <div className="text-[10px] text-slate-400">{c.telefono}</div>}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    {c.comprasCount}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    {c.unidadesCompradas}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    S/ {c.totalGastado.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    S/ {c.ticketPromedio.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {c.esRecurrente ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Recurrente
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Ocasional
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center text-[11px] text-slate-500 font-mono">
                    {c.ultimaCompra}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
