"use client";

import { ProductListItem } from "@/types/product";
import { formatCurrency } from "@/lib/formatters";
import {
  Barcode,
  Eye,
  AlertTriangle,
  PackageX,
  Building2,
  PackageOpen,
  RotateCcw,
} from "lucide-react";

interface ProductTableProps {
  products: ProductListItem[];
  onSelectProduct: (codbarras: string) => void;
  onClearFilters: () => void;
}

export function ProductTable({
  products,
  onSelectProduct,
  onClearFilters,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <PackageOpen className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900">
            No se encontraron productos
          </h3>
          <p className="text-xs text-slate-500">
            No hay componentes en el catálogo de MishutecT2 que coincidan con la búsqueda o combinación de filtros aplicada.
          </p>
        </div>
        <button
          onClick={onClearFilters}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer Filtros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista Móvil (< 768px): Tarjetas Responsivas de Productos */}
      <div className="md:hidden space-y-3">
        {products.map((item) => (
          <div
            key={item.codbarras}
            onClick={() => onSelectProduct(item.codbarras)}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 active:bg-slate-50 transition-all cursor-pointer shadow-xs space-y-3"
          >
            {/* Cabecera: Código, Categoría y Estado */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-xs font-semibold text-blue-600">
                  {item.codbarras}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {item.categoria}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    item.estado === "Disponible"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {item.estado}
                </span>
              </div>
            </div>

            {/* Nombre y Marca */}
            <div>
              <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                {item.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>Marca: <strong className="text-slate-700">{item.marca}</strong></span>
                <span>&bull;</span>
                <span>Garantía: {item.garantiaMeses} meses</span>
              </div>
            </div>

            {/* Métricas: Stock y Proveedores */}
            <div className="flex items-center justify-between text-xs pt-1">
              {/* Stock con Alertas */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">Stock:</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    item.esAgotado
                      ? "text-rose-600"
                      : item.esStockBajo
                      ? "text-amber-600"
                      : "text-slate-800"
                  }`}
                >
                  {item.stock} unid.
                </span>
                {item.esAgotado && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <PackageX className="h-2.5 w-2.5" /> Agotado
                  </span>
                )}
                {item.esStockBajo && !item.esAgotado && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="h-2.5 w-2.5" /> Bajo
                  </span>
                )}
              </div>

              {/* Proveedores */}
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Building2 className="h-3 w-3 text-blue-500 shrink-0" />
                {item.cantidadProveedores === 1
                  ? "1 prov."
                  : item.cantidadProveedores > 1
                  ? `${item.cantidadProveedores} provs.`
                  : "Sin prov."}
              </span>
            </div>

            {/* Pie: Precio y Botón Ver Ficha */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">Precio de Venta</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(item.precio)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(item.codbarras);
                }}
                className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-white hover:bg-blue-50 text-blue-600 font-medium border border-slate-200 hover:border-blue-300 transition-all text-xs shadow-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver Ficha</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Escritorio (>= 768px): Tabla Clásica */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3.5 font-semibold">Código</th>
                <th className="py-3 px-3.5 font-semibold">Producto</th>
                <th className="py-3 px-3.5 font-semibold">Categoría</th>
                <th className="py-3 px-3.5 font-semibold">Marca</th>
                <th className="py-3 px-3.5 font-semibold text-right">Precio Venta</th>
                <th className="py-3 px-3.5 font-semibold text-center">Stock</th>
                <th className="py-3 px-3.5 font-semibold text-center">Estado</th>
                <th className="py-3 px-3.5 font-semibold text-center">Proveedores</th>
                <th className="py-3 px-3.5 font-semibold text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((item) => (
                <tr
                  key={item.codbarras}
                  onClick={() => onSelectProduct(item.codbarras)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  {/* Código de barras */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="font-mono text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">
                        {item.codbarras}
                      </span>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">
                      {item.nombre}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Garantía: {item.garantiaMeses} meses
                    </span>
                  </td>

                  {/* Categoría */}
                  <td className="py-3 px-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {item.categoria}
                    </span>
                  </td>

                  {/* Marca */}
                  <td className="py-3 px-3.5 text-slate-600">
                    {item.marca}
                  </td>

                  {/* Precio Venta */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(item.precio)}
                  </td>

                  {/* Stock con Alertas */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          item.esAgotado
                            ? "text-rose-600"
                            : item.esStockBajo
                            ? "text-amber-600"
                            : "text-slate-800"
                        }`}
                      >
                        {item.stock} unid.
                      </span>
                      {item.esAgotado ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <PackageX className="h-2.5 w-2.5" />
                          Agotado
                        </span>
                      ) : item.esStockBajo ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Stock Bajo
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        item.estado === "Disponible"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>

                  {/* Proveedores */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
                        item.cantidadProveedores > 0
                          ? "bg-slate-50 text-slate-700 border-slate-200"
                          : "bg-slate-50/60 text-slate-500 border-slate-200"
                      }`}
                    >
                      <Building2 className="h-3 w-3 text-blue-500" />
                      {item.cantidadProveedores === 1
                        ? "1 distribuidor"
                        : item.cantidadProveedores > 1
                        ? `${item.cantidadProveedores} distribuidores`
                        : "Sin proveedor"}
                    </span>
                  </td>

                  {/* Botón Ver Ficha */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(item.codbarras);
                      }}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 font-medium border border-slate-200 hover:border-blue-300 transition-all text-xs shadow-xs"
                      title="Ver ficha técnica y proveedores"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Ver Ficha</span>
                    </button>
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