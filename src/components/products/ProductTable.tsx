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
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 sm:p-10 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center justify-center mx-auto">
          <PackageOpen className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm sm:text-base font-semibold text-white">
            No se encontraron productos
          </h3>
          <p className="text-xs text-slate-400">
            No hay componentes en el catálogo de MishutecT2 que coincidan con la búsqueda o combinación de filtros aplicada.
          </p>
        </div>
        <button
          onClick={onClearFilters}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
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
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 active:bg-slate-850/60 transition-all cursor-pointer shadow-sm space-y-3"
          >
            {/* Cabecera: Código, Categoría y Estado */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {item.codbarras}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-cyan-300 border border-cyan-500/20">
                  {item.categoria}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    item.estado === "Disponible"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {item.estado}
                </span>
              </div>
            </div>

            {/* Nombre y Marca */}
            <div>
              <h3 className="font-semibold text-sm text-white leading-snug">
                {item.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>Marca: <strong className="text-slate-300">{item.marca}</strong></span>
                <span>&bull;</span>
                <span>Garantía: {item.garantiaMeses} meses</span>
              </div>
            </div>

            {/* Métricas: Stock y Proveedores */}
            <div className="flex items-center justify-between text-xs pt-1">
              {/* Stock con Alertas */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Stock:</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    item.esAgotado
                      ? "text-rose-400"
                      : item.esStockBajo
                      ? "text-amber-400"
                      : "text-slate-200"
                  }`}
                >
                  {item.stock} unid.
                </span>
                {item.esAgotado && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                    <PackageX className="h-2.5 w-2.5" /> Agotado
                  </span>
                )}
                {item.esStockBajo && !item.esAgotado && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                    <AlertTriangle className="h-2.5 w-2.5" /> Bajo
                  </span>
                )}
              </div>

              {/* Proveedores */}
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Building2 className="h-3 w-3 text-cyan-400 shrink-0" />
                {item.cantidadProveedores === 1
                  ? "1 prov."
                  : item.cantidadProveedores > 1
                  ? `${item.cantidadProveedores} provs.`
                  : "Sin prov."}
              </span>
            </div>

            {/* Pie: Precio y Botón Ver Ficha */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60">
              <div>
                <span className="text-[10px] text-slate-500 block">Precio de Venta</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {formatCurrency(item.precio)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(item.codbarras);
                }}
                className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-medium border border-slate-800 transition-all text-xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver Ficha</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Escritorio (>= 768px): Tabla Clásica */}
      <div className="hidden md:block bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-3 px-3.5 font-medium">Código</th>
                <th className="py-3 px-3.5 font-medium">Producto</th>
                <th className="py-3 px-3.5 font-medium">Categoría</th>
                <th className="py-3 px-3.5 font-medium">Marca</th>
                <th className="py-3 px-3.5 font-medium text-right">Precio Venta</th>
                <th className="py-3 px-3.5 font-medium text-center">Stock</th>
                <th className="py-3 px-3.5 font-medium text-center">Estado</th>
                <th className="py-3 px-3.5 font-medium text-center">Proveedores</th>
                <th className="py-3 px-3.5 font-medium text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {products.map((item) => (
                <tr
                  key={item.codbarras}
                  onClick={() => onSelectProduct(item.codbarras)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Código de barras */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Barcode className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-mono text-slate-300 font-semibold group-hover:text-cyan-300 transition-colors">
                        {item.codbarras}
                      </span>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-white group-hover:text-cyan-200 transition-colors block">
                      {item.nombre}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Garantía: {item.garantiaMeses} meses
                    </span>
                  </td>

                  {/* Categoría */}
                  <td className="py-3 px-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 text-cyan-300 border border-cyan-500/20">
                      {item.categoria}
                    </span>
                  </td>

                  {/* Marca */}
                  <td className="py-3 px-3.5 text-slate-300">
                    {item.marca}
                  </td>

                  {/* Precio Venta */}
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {formatCurrency(item.precio)}
                  </td>

                  {/* Stock con Alertas */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          item.esAgotado
                            ? "text-rose-400"
                            : item.esStockBajo
                            ? "text-amber-400"
                            : "text-slate-100"
                        }`}
                      >
                        {item.stock} unid.
                      </span>
                      {item.esAgotado ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                          <PackageX className="h-2.5 w-2.5" />
                          Agotado
                        </span>
                      ) : item.esStockBajo ? (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
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
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
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
                          ? "bg-slate-950 text-slate-300 border-slate-800"
                          : "bg-slate-950/60 text-slate-400 border-slate-800/80"
                      }`}
                    >
                      <Building2 className="h-3 w-3 text-cyan-400" />
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-medium border border-slate-800 hover:border-cyan-400 transition-all text-xs"
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