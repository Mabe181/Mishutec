import { SalesFilterMetadata } from "@/types/sales";
import { Search, Filter, RotateCcw, Calendar } from "lucide-react";

interface SaleFiltersProps {
  metadata: SalesFilterMetadata;
  search: string;
  onSearchChange: (val: string) => void;
  selectedClient: string;
  onClientChange: (val: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (val: string) => void;
  selectedTipoComp: string;
  onTipoCompChange: (val: string) => void;
  fechaDesde: string;
  onFechaDesdeChange: (val: string) => void;
  fechaHasta: string;
  onFechaHastaChange: (val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function SaleFilters({
  metadata,
  search,
  onSearchChange,
  selectedClient,
  onClientChange,
  selectedEmployee,
  onEmployeeChange,
  selectedTipoComp,
  onTipoCompChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onClearFilters,
  hasActiveFilters,
}: SaleFiltersProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md space-y-3.5">
      {/* Fila 1: Buscador Principal */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por N° comprobante (ej: B001-000001), cliente o DNI..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-colors"
        />
      </div>

      {/* Fila 2: Selectores de Filtrado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Filtro por Tipo de Comprobante */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Tipo Comprobante
          </label>
          <select
            value={selectedTipoComp}
            onChange={(e) => onTipoCompChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="todos">Todos los comprobantes</option>
            {metadata.tiposComprobante.map((tc) => (
              <option key={tc.id} value={tc.id.toString()}>
                {tc.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Cliente */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Cliente
          </label>
          <select
            value={selectedClient}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="todos">Todos los clientes</option>
            {metadata.clientes.map((c) => (
              <option key={c.dni} value={c.dni}>
                {c.nombreCompleto} (DNI: {c.dni})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Empleado */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Atendido por
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="todos">Todos los empleados</option>
            {metadata.empleados.map((emp) => (
              <option key={emp.id} value={emp.id.toString()}>
                {emp.nombreCompleto}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Fecha Desde */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filtro Fecha Hasta & Limpiar */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Fecha Hasta
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors shrink-0"
                title="Limpiar todos los filtros"
                aria-label="Limpiar todos los filtros"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
