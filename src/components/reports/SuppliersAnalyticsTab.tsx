"use client";

import { SupplierOverview } from "@/types/reports";
import {
  Truck,
  Building2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  DollarSign,
  Package,
} from "lucide-react";

interface SuppliersAnalyticsTabProps {
  proveedores: SupplierOverview;
}

export function SuppliersAnalyticsTab({ proveedores }: SuppliersAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. NOTA ARQUITECTÓNICA: LIMITACIÓN DEL ESQUEMA Y COSTOS DE COMPRA */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">
            Arquitectura de Costos y Abastecimiento (dbo.Suministra vs dbo.Detalle_Venta)
          </div>
          <p className="text-slate-600 leading-relaxed">
            La tabla <code>dbo.Suministra</code> almacena la relación de catálogo entre proveedores y productos junto con su <code>Precio_compra</code> pactado.
            Múltiples proveedores abastecen un mismo componente a distintos precios (dispersión de costos).
            Dado que la base de datos no cuenta con órdenes de compra ni asocia el lote o proveedor de origen a cada línea de venta (<code>dbo.Detalle_Venta</code>),
            <strong> no es técnicamente riguroso calcular un margen de utilidad neta individual por venta</strong>.
            Esta sección presenta el análisis real de la cadena de suministro basado estrictamente en el esquema físico.
          </p>
        </div>
      </div>

      {/* 2. PRODUCTOS CON MÚLTIPLES PROVEEDORES (DISPERSIÓN DE PRECIO) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Productos con Múltiples Proveedores Homologados
            </h3>
            <p className="text-xs text-slate-500">
              Componentes con alternativas de suministro y variabilidad en el precio de adquisición
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3 text-center">Proveedores</th>
                <th className="py-2 px-3 text-center">Rango Precios Compra</th>
                <th className="py-2 px-3">Empresas Proveedoras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proveedores.productosConMultiplesProveedores.map((p) => (
                <tr key={p.codbarras} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{p.nombreProd}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.codbarras}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">
                      {p.cantidadProveedores} proveedores
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 font-mono">
                    {p.rangoPreciosCompra}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.proveedoresNombres}
                  </td>
                </tr>
              ))}
              {proveedores.productosConMultiplesProveedores.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No existen productos con más de un proveedor asignado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PRODUCTOS SIN PROVEEDOR ASIGNADO */}
      {proveedores.productosSinProveedor.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Productos en Catálogo sin Relación de Suministro
              </h3>
              <p className="text-xs text-slate-500">
                Artículos sin registro en dbo.Suministra (requieren asignación de proveedor)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3 text-center">Stock Físico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proveedores.productosSinProveedor.map((p) => (
                  <tr key={p.codbarras} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-600">{p.codbarras}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{p.nombreProd}</td>
                    <td className="py-2 px-3 text-slate-600">{p.categoria}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LISTADO MAESTRO DE PROVEEDORES Y SU CATÁLOGO */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Cartera de Proveedores y Catálogo Asociado
              </h3>
              <p className="text-xs text-slate-500">
                Total: {proveedores.totalProveedores} empresas | {proveedores.totalRelacionesSuministro} vínculos en dbo.Suministra
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedores.proveedores.map((prov) => (
            <div
              key={prov.idProveedor}
              className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {prov.nombreProveedor}
                    </h4>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      <span>{prov.correo}</span>
                      {prov.telefono && <span className="ml-2 font-mono">Tel: {prov.telefono}</span>}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
                    ID: #{prov.idProveedor}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Catálogo Suministrado:</span>
                    <span className="font-bold text-slate-800">{prov.productosSuministradosCount} productos</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Costo Compra Promedio:</span>
                    <span className="font-bold text-blue-700">S/ {prov.costoPromedioCompra.toFixed(2)}</span>
                  </div>
                </div>

                {/* Sublista de productos */}
                {prov.productos.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Componentes asignados:
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {prov.productos.map((item) => (
                        <div
                          key={item.codbarras}
                          className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-100"
                        >
                          <span className="truncate max-w-[200px] text-slate-700 font-medium">
                            {item.nombreProd}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            Compra: S/ {item.precioCompra.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
