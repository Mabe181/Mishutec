"use client";

import { useState, useMemo } from "react";
import { InventoryProductStockItem } from "@/types/inventory";
import { formatCurrency } from "@/lib/formatters";
import {
  Search,
  Barcode,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  PackageX,
  History,
  RotateCcw,
  PackageOpen,
} from "lucide-react";

interface InventoryProductTableProps {
  products: InventoryProductStockItem[];
  categorias: Array<{ id: number; nombre: string; total: number }>;
  estados: Array<{ id: number; nombre: string }>;
  onOpenEntry: (product: InventoryProductStockItem) => void;
  onOpenExit: (product: InventoryProductStockItem) => void;
  onViewKardex: (codbarras: string) => void;
}

export function InventoryProductTable({
  products,
  categorias,
  estados,
  onOpenEntry,
  onOpenExit,
  onViewKardex,
}: InventoryProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("todas");
  const [selectedEstado, setSelectedEstado] = useState("todos");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codbarras.includes(searchTerm.trim());

      const matchesCat =
        selectedCat === "todas" || p.categoria.toLowerCase() === selectedCat.toLowerCase();

      const matchesEstado =
        selectedEstado === "todos" || p.estado.toLowerCase() === selectedEstado.toLowerCase();

      return matchesSearch && matchesCat && matchesEstado;
    });
  }, [products, searchTerm, selectedCat, selectedEstado]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCat("todas");
    setSelectedEstado("todos");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedCat !== "todas" || selectedEstado !== "todos";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controles de Filtrado */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Búsqueda por texto o código */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar componente o código EAN-13..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Filtro por Categoría */}
          <div className="sm:col-span-3">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todas">Todas las categorías ({categorias.length})</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="sm:col-span-3">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos los estados</option>
              {estados.map((est) => (
                <option key={est.id} value={est.nombre}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de Filtros Activos */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-400 pt-1">
          <span>
            Mostrando <strong className="text-cyan-400">{filteredProducts.length}</strong> de{" "}
            <strong className="text-white">{products.length}</strong> productos en existencias
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 sm:p-10 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center justify-center mx-auto">
            <PackageOpen className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-white">
              No hay productos que coincidan
            </h3>
            <p className="text-xs text-slate-400">
              No se encontraron componentes en almacén para los criterios aplicados.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <>
          {/* Vista Móvil (< 768px): Tarjetas de Existencias */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((p) => {
              const isAgotado = p.stock === 0 || p.estado.toLowerCase() === "agotado";
              const isLowStock = p.stock >= 1 && p.stock <= 5;
              const isDescontinuado = p.estado.toLowerCase() === "descontinuado";

              return (
                <div
                  key={p.codbarras}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
                >
                  {/* Cabecera: Código, Categoría y Estado */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Barcode className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-mono text-xs font-semibold text-cyan-300">
                          {p.codbarras}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white">
                        {p.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {p.categoria} &bull; {p.marca}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 mb-1">
                        {isAgotado ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                            <PackageX className="h-2.5 w-2.5" /> Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                            <AlertTriangle className="h-2.5 w-2.5" /> Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[9px] uppercase font-bold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {p.estado}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-base font-bold text-white block">
                        {p.stock} unid.
                      </span>
                    </div>
                  </div>

                  {/* Precios y Valorización */}
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">PVP Unitario</span>
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(p.precio)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Valor en Stock</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {formatCurrency(p.valorTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones Rápidas Táctiles */}
                  <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => onViewKardex(p.codbarras)}
                      className="inline-flex items-center gap-1 px-2.5 py-2 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <History className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Kardex</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenEntry(p)}
                        className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        <span>Entrada</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenExit(p)}
                        disabled={p.stock === 0}
                        className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] rounded-lg bg-orange-500/15 hover:bg-orange-500/25 active:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>Salida</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Escritorio (>= 768px): Tabla */}
          <div className="hidden md:block bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="py-3 px-3.5 font-medium">Código</th>
                    <th className="py-3 px-3.5 font-medium">Componente</th>
                    <th className="py-3 px-3.5 font-medium">Categoría</th>
                    <th className="py-3 px-3.5 font-medium">Marca</th>
                    <th className="py-3 px-3.5 font-medium text-right">Precio Venta</th>
                    <th className="py-3 px-3.5 font-medium text-center">Stock Actual</th>
                    <th className="py-3 px-3.5 font-medium text-right">Valor en Stock</th>
                    <th className="py-3 px-3.5 font-medium text-center">Movimientos</th>
                    <th className="py-3 px-3.5 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => {
                    const isAgotado = p.stock === 0 || p.estado.toLowerCase() === "agotado";
                    const isLowStock = p.stock >= 1 && p.stock <= 5;
                    const isDescontinuado = p.estado.toLowerCase() === "descontinuado";

                    return (
                      <tr
                        key={p.codbarras}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Código de barras */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Barcode className="h-3.5 w-3.5 text-slate-500" />
                            <span>{p.codbarras}</span>
                          </div>
                        </td>

                        {/* Nombre del producto */}
                        <td className="py-3 px-3.5">
                          <span className="font-semibold text-white block group-hover:text-cyan-200 transition-colors">
                            {p.nombre}
                          </span>
                        </td>

                        {/* Categoría */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 text-cyan-300 border border-cyan-500/20">
                            {p.categoria}
                          </span>
                        </td>

                        {/* Marca */}
                        <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                          {p.marca}
                        </td>

                        {/* Precio de venta */}
                        <td className="py-3 px-3.5 text-right font-mono font-medium text-slate-300 whitespace-nowrap">
                          {formatCurrency(p.precio)}
                        </td>

                        {/* Stock actual con Alertas */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`font-mono font-bold text-xs ${
                                isAgotado
                                  ? "text-rose-400"
                                  : isLowStock
                                  ? "text-amber-400"
                                  : "text-slate-100"
                              }`}
                            >
                              {p.stock} unid.
                            </span>
                            {isAgotado ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30">
                                <PackageX className="h-2.5 w-2.5" />
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                Stock Bajo
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Valor en Stock */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-cyan-400 whitespace-nowrap">
                          {formatCurrency(p.valorTotal)}
                        </td>

                        {/* Total de movimientos */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-400">
                            {p.totalEntradas + p.totalSalidas} ops.
                          </span>
                        </td>

                        {/* Acciones Rápidas */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenEntry(p)}
                              title="Registrar entrada de stock"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            >
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenExit(p)}
                              disabled={p.stock === 0}
                              title={
                                p.stock === 0
                                  ? "Producto sin stock disponible para salida"
                                  : "Registrar salida o merma"
                              }
                              className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onViewKardex(p.codbarras)}
                              title="Ver historial de Kardex"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                            >
                              <History className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}