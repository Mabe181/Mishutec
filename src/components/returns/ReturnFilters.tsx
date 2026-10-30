import { ReturnFilterMetadata } from "@/types/returns";
import { Search, RotateCcw, Calendar } from "lucide-react";

interface ReturnFiltersProps {
  metadata: ReturnFilterMetadata;
  search: string;
  onSearchChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
  selectedMotivo: string;
  onMotivoChange: (value: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (value: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (value: string) => void;
  onReset: () => void;
}

export function ReturnFilters({
  metadata,
  search,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  selectedMotivo,
  onMotivoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onReset,
}: ReturnFiltersProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    selectedEstado !== "todos" ||
    selectedMotivo !== "todos" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Buscador por comprobante, cliente o código */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° comprobante (ej: B001-000002), cliente o DNI..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Botón de Limpiar Filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0 shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Selectores de Filtro Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filtro por Estado */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Estado del Trámite
          </label>
          <select
            value={selectedEstado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="todos">Todos los estados</option>
            {metadata.estados.map((est) => (
              <option key={est.id} value={est.id.toString()}>
                {est.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Motivo */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Causa / Motivo
          </label>
          <select
            value={selectedMotivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="todos">Todos los motivos</option>
            {metadata.motivos.map((mot) => (
              <option key={mot.id} value={mot.id.toString()}>
                {mot.descripcion}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Fecha Desde */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>Fecha Devolución Desde</span>
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Rango de Fecha Hasta */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>Fecha Devolución Hasta</span>
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
