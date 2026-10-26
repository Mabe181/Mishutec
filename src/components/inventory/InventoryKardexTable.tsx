"use client";

import { useState, useMemo } from "react";
import { KardexMovementItem, InventoryFilterMetadata } from "@/types/inventory";
import {
  Calendar,
  Barcode,
  ArrowDownRight,
  ArrowUpRight,
  History,
  RotateCcw,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface InventoryKardexTableProps {
  kardex: KardexMovementItem[];
  metadata: InventoryFilterMetadata;
  selectedBarcode?: string;
  initialProductFilter?: string;
}

export function InventoryKardexTable({
  kardex,
  metadata,
  selectedBarcode,
  initialProductFilter,
}: InventoryKardexTableProps) {
  const [selectedProduct, setSelectedProduct] = useState(initialProductFilter || selectedBarcode || "todos");
  const [selectedTipo, setSelectedTipo] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredKardex = useMemo(() => {
    return kardex.filter((item) => {
      const matchesProd =
        selectedProduct === "todos" || item.codbarras === selectedProduct;

      const matchesTipo =
        selectedTipo === "todos" ||
        item.tipoMovimiento.toLowerCase() === selectedTipo.toLowerCase();

      const itemDate = item.fecha; // formato YYYY-MM-DD
      const matchesDateFrom = !dateFrom || itemDate >= dateFrom;
      const matchesDateTo = !dateTo || itemDate <= dateTo;

      return matchesProd && matchesTipo && matchesDateFrom && matchesDateTo;
    });
  }, [kardex, selectedProduct, selectedTipo, dateFrom, dateTo]);

  // Paginación
  const totalPages = Math.ceil(filteredKardex.length / pageSize) || 1;
  const paginatedKardex = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredKardex.slice(start, start + pageSize);
  }, [filteredKardex, currentPage]);

  const handleClearFilters = () => {
    setSelectedProduct("todos");
    setSelectedTipo("todos");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedProduct !== "todos" ||
    selectedTipo !== "todos" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controles de Filtrado del Kardex */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Selector de Producto */}
          <div className="sm:col-span-5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-400 mb-1">
              Componente
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos los productos ({metadata.productos.length})</option>
              {metadata.productos.map((prod) => (
                <option key={prod.codbarras} value={prod.codbarras}>
                  {prod.nombre} ({prod.codbarras})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Tipo de Movimiento */}
          <div className="sm:col-span-3">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-400 mb-1">
              Tipo de Operación
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 sm:py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos los tipos ({metadata.tiposMovimiento.length})</option>
              {metadata.tiposMovimiento.map((tipo) => (
                <option key={tipo.id} value={tipo.nombre}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Fechas */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-400 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-400 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Resumen de Kardex y Reset */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Mostrando <strong className="text-cyan-400">{filteredKardex.length}</strong> movimientos en historial
            </span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Restablecer Filtros
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {filteredKardex.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 sm:p-10 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center justify-center mx-auto">
            <PackageOpen className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-white">
              No hay movimientos que coincidan
            </h3>
            <p className="text-xs text-slate-400">
              No se registraron movimientos en dbo.Mov_Inventario para los criterios seleccionados.
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
          {/* Vista Móvil (< 768px): Tarjetas de Kardex */}
          <div className="md:hidden space-y-3">
            {paginatedKardex.map((item) => {
              const isEntrada = item.tipoMovimiento === "Entrada";

              return (
                <div
                  key={item.idMovimiento}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5 shadow-sm text-xs"
                >
                  {/* Cabecera: ID, Fecha y Tipo */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">
                        #{String(item.idMovimiento).padStart(4, "0")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.fecha}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isEntrada
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      {isEntrada ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      <span>{item.tipoMovimiento}</span>
                    </span>
                  </div>

                  {/* Componente */}
                  <div>
                    <h4 className="font-semibold text-white">
                      {item.nombreProducto}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">
                      Cód: {item.codbarras}
                    </span>
                  </div>

                  {/* Cantidades y Saldo */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cantidad</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isEntrada ? "text-emerald-400" : "text-orange-400"
                        }`}
                      >
                        {isEntrada ? `+${item.cantidad}` : `-${item.cantidad}`} unid.
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-slate-500 block text-[10px]">Saldo Posterior</span>
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        {item.saldoCalculado !== undefined ? `${item.saldoCalculado} unid.` : "—"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Responsable</span>
                      <span className="text-slate-300 truncate max-w-[100px] block">
                        {item.empleado}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Escritorio (>= 768px): Tabla de Kardex */}
          <div className="hidden md:block bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="py-3 px-3.5 font-medium">ID Mov.</th>
                    <th className="py-3 px-3.5 font-medium">Fecha</th>
                    <th className="py-3 px-3.5 font-medium">Código</th>
                    <th className="py-3 px-3.5 font-medium">Componente</th>
                    <th className="py-3 px-3.5 font-medium text-center">Tipo Movimiento</th>
                    <th className="py-3 px-3.5 font-medium text-center">Cantidad</th>
                    <th className="py-3 px-3.5 font-medium">Responsable</th>
                    <th className="py-3 px-3.5 font-medium text-center">Saldo Resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedKardex.map((item) => {
                    const isEntrada = item.tipoMovimiento === "Entrada";
                    const isSalida = item.tipoMovimiento === "Salida";

                    return (
                      <tr
                        key={item.idMovimiento}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* ID Movimiento */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-cyan-400 font-bold whitespace-nowrap">
                          #{String(item.idMovimiento).padStart(4, "0")}
                        </td>

                        {/* Fecha */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>{item.fecha}</span>
                          </div>
                        </td>

                        {/* Código de barras */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Barcode className="h-3.5 w-3.5 text-slate-500" />
                            <span>{item.codbarras}</span>
                          </div>
                        </td>

                        {/* Componente */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-white">
                            {item.nombreProducto}
                          </div>
                        </td>

                        {/* Tipo Movimiento */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isEntrada
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isSalida
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {isEntrada ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : isSalida ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : null}
                            <span>{item.tipoMovimiento}</span>
                          </span>
                        </td>

                        {/* Cantidad */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap font-mono font-bold">
                          <span
                            className={
                              isEntrada
                                ? "text-emerald-400"
                                : isSalida
                                ? "text-orange-400"
                                : "text-slate-200"
                            }
                          >
                            {isEntrada ? `+${item.cantidad}` : `-${item.cantidad}`} unid.
                          </span>
                        </td>

                        {/* Empleado */}
                        <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-slate-500" />
                            <span>{item.empleado}</span>
                          </div>
                        </td>

                        {/* Saldo Determinístico */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap font-mono font-bold text-slate-200">
                          {item.saldoCalculado !== undefined ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-xs">
                              {item.saldoCalculado} unid.
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginador Responsivo */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              <span>
                Página <strong className="text-white">{currentPage}</strong> de{" "}
                <strong className="text-white">{totalPages}</strong> ({filteredKardex.length} registros)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}