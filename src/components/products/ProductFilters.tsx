"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { ProductFilterMetadata, StockFilterOption } from "@/types/product";

interface ProductFiltersProps {
  metadata: ProductFilterMetadata;
  totalFiltered: number;
}

export function ProductFilters({
  metadata,
  totalFiltered,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") || "";
  const categoria = searchParams.get("categoria") || "todas";
  const marca = searchParams.get("marca") || "todas";
  const estado = searchParams.get("estado") || "todos";
  const stockStatus = (searchParams.get("stockStatus") as StockFilterOption) || "todos";
  const sortBy = searchParams.get("sortBy") || "nombre";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const hasActiveFilters =
    Boolean(search) ||
    categoria !== "todas" ||
    marca !== "todas" ||
    estado !== "todos" ||
    stockStatus !== "todos" ||
    sortBy !== "nombre" ||
    sortOrder !== "asc";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todas" && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page" && key !== "selectedProduct") {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
      {/* Fila Superior: Búsqueda y Selector de Ordenamiento */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Input de Búsqueda de Ancho Completo en Móvil */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            placeholder="Buscar por nombre o código EAN-13..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => updateParam("search", "")}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              aria-label="Borrar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Ordenamiento y Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                const params = new URLSearchParams(searchParams.toString());
                params.set("sortBy", by);
                params.set("sortOrder", order);
                params.set("page", "1");
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }}
              className="w-full sm:w-auto appearance-none bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-8 text-xs text-slate-200 font-medium focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="nombre-asc">Nombre (A &rarr; Z)</option>
              <option value="nombre-desc">Nombre (Z &rarr; A)</option>
              <option value="precio-asc">Precio (Menor a Mayor)</option>
              <option value="precio-desc">Precio (Mayor a Menor)</option>
              <option value="stock-asc">Stock (Menor a Mayor)</option>
              <option value="stock-desc">Stock (Mayor a Menor)</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors shrink-0"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="h-3 w-3 text-cyan-400" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Fila Inferior: Selectores de Filtro Específico (2 cols móvil, 4 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2.5 border-t border-slate-800/80">
        {/* Filtro Categoría */}
        <div>
          <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1">
            Categoría:
          </label>
          <select
            value={categoria}
            onChange={(e) => updateParam("categoria", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 cursor-pointer"
          >
            <option value="todas">Todas ({metadata.categorias.length})</option>
            {metadata.categorias.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre} ({cat.count})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Marca */}
        <div>
          <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1">
            Marca:
          </label>
          <select
            value={marca}
            onChange={(e) => updateParam("marca", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 cursor-pointer"
          >
            <option value="todas">Todas ({metadata.marcas.length})</option>
            {metadata.marcas.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre} ({m.count})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Estado del Producto */}
        <div>
          <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1">
            Estado:
          </label>
          <select
            value={estado}
            onChange={(e) => updateParam("estado", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 cursor-pointer"
          >
            <option value="todos">Todos</option>
            {metadata.estados.map((est) => (
              <option key={est.id} value={est.nombre}>
                {est.nombre} ({est.count})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Disponibilidad de Stock */}
        <div>
          <label className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1">
            Stock:
          </label>
          <select
            value={stockStatus}
            onChange={(e) => updateParam("stockStatus", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 cursor-pointer"
          >
            <option value="todos">Cualquier stock</option>
            <option value="disponible">En Stock (&gt; 0)</option>
            <option value="agotado">Agotados (= 0)</option>
            <option value="stock_bajo">Bajo (&le; 5)</option>
          </select>
        </div>
      </div>

      {/* Resumen de Resultados */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong className="text-cyan-400">{totalFiltered}</strong> de{" "}
            <strong>{metadata.totalCatalog}</strong> productos
          </span>
          {isPending && (
            <span className="inline-block h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {hasActiveFilters && (
          <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Filtros activos
          </span>
        )}
      </div>
    </div>
  );
}