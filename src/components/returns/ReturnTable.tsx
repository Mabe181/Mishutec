import { ReturnSummaryItem } from "@/types/returns";
import { formatDate, formatNumber } from "@/lib/formatters";
import {
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  User,
  Package,
} from "lucide-react";

interface ReturnTableProps {
  returns: ReturnSummaryItem[];
  onSelectReturn: (idDevolucion: number) => void;
  isLoading?: boolean;
}

export function ReturnTable({
  returns,
  onSelectReturn,
  isLoading,
}: ReturnTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-3" />
        <p className="text-xs text-slate-400">Cargando registros de devoluciones...</p>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
        <RotateCcw className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">
          No se encontraron trámites de devolución
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No existen registros que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
      </div>
    );
  }

  // Renderizador de badge de estado
  const renderStatusBadge = (estado: string, idEstado: number) => {
    switch (idEstado) {
      case 2: // Aprobada
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Aprobada</span>
          </span>
        );
      case 1: // Pendiente
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </span>
        );
      case 3: // Rechazada
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <XCircle className="h-3 w-3" />
            <span>Rechazada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Vista de Tabla para Pantallas Medianas y Grandes (Escritorio / Tablet) */}
      <div className="hidden md:block rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">N° Trámite / Fecha</th>
                <th className="py-3 px-4">Venta Original</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Causa / Motivo</th>
                <th className="py-3 px-4 text-center">Unidades</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {returns.map((ret) => (
                <tr
                  key={ret.idDevolucion}
                  className="hover:bg-slate-850/50 transition-colors group"
                >
                  {/* N° Trámite y Fecha */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-cyan-400 font-bold block">
                      DEV-#{ret.idDevolucion.toString().padStart(4, "0")}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatDate(ret.fechaDev)}
                    </span>
                  </td>

                  {/* Venta Original */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {ret.numeroComprobante}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Vendido el {formatDate(ret.fechaVenta)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200 block truncate max-w-[160px]">
                      {ret.clienteNombre}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      DNI: {ret.dniCliente}
                    </span>
                  </td>

                  {/* Operador Responsable */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="truncate block max-w-[140px]">
                      {ret.empleadoNombre}
                    </span>
                  </td>

                  {/* Motivos */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {ret.motivos.map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-cyan-300 border border-slate-700/60"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Unidades Devueltas */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-white text-sm">
                      {ret.totalUnidadesDevueltas}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {ret.itemsCount} {ret.itemsCount === 1 ? "artículo" : "artículos"}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 text-center">
                    {renderStatusBadge(ret.estadoDev, ret.idEstadoDev)}
                  </td>

                  {/* Acción */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectReturn(ret.idDevolucion)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 font-medium text-xs transition-all shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ficha</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Tarjetas para Dispositivos Móviles (< 768px) */}
      <div className="md:hidden space-y-3">
        {returns.map((ret) => (
          <div
            key={ret.idDevolucion}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md space-y-3"
          >
            {/* Header Tarjeta */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
              <div>
                <span className="font-mono font-bold text-cyan-400 text-sm block">
                  DEV-#{ret.idDevolucion.toString().padStart(4, "0")}
                </span>
                <span className="text-[10px] text-slate-500">
                  Registrado el {formatDate(ret.fechaDev)}
                </span>
              </div>
              <div>{renderStatusBadge(ret.estadoDev, ret.idEstadoDev)}</div>
            </div>

            {/* Datos Venta y Cliente */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Comprobante Original:</span>
                <span className="font-mono font-bold text-white">
                  {ret.numeroComprobante}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="text-slate-200 font-medium truncate max-w-[200px]">
                  {ret.clienteNombre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operador:</span>
                <span className="text-slate-300 truncate max-w-[200px]">
                  {ret.empleadoNombre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Unidades Devueltas:</span>
                <span className="font-mono font-bold text-purple-400">
                  {ret.totalUnidadesDevueltas} unid. ({ret.itemsCount} ítems)
                </span>
              </div>
            </div>

            {/* Motivos */}
            <div className="flex flex-wrap gap-1 pt-1">
              {ret.motivos.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-cyan-300 border border-slate-800"
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Botón Ver Ficha */}
            <button
              type="button"
              onClick={() => onSelectReturn(ret.idDevolucion)}
              className="w-full py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Ficha de Trazabilidad</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
