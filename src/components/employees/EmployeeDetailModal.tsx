"use client";

import { useEffect, useState } from "react";
import { EmployeeDetail } from "@/types/entities";
import { getEmployeeDetailAction } from "@/lib/actions/employee.actions";
import { formatCurrency } from "@/lib/formatters";
import {
  X,
  UserCheck,
  ShoppingBag,
  Boxes,
  RotateCcw,
  Loader2,
  Edit,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number | null;
  onEdit: (employee: EmployeeDetail) => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employeeId,
  onEdit,
}: EmployeeDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"ventas" | "movimientos" | "devoluciones">(
    "ventas"
  );

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      getEmployeeDetailAction(employeeId)
        .then((res) => {
          if (res.success && res.data) {
            setDetail(res.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
    }
  }, [isOpen, employeeId]);

  // Bloqueo de scroll de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Tecla escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="employee-detail-title" className="text-sm sm:text-base font-bold text-white">
                Expediente del Empleado
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Historial operativo de ventas, almacén y garantías tramitadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {loading || !detail ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="text-xs">Cargando expediente del empleado...</span>
            </div>
          ) : (
            <>
              {/* Información Personal */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                        ID #{detail.idEmpleado}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {detail.nombreCompleto}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>DNI: {detail.dni}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-sans">Personal Activo</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(detail)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto"
                  >
                    <Edit className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Editar Empleado</span>
                  </button>
                </div>

                {/* Métricas Operativas */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block truncate">Ventas Atendidas</span>
                    <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono">
                      {detail.totalVentasAtendidas}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block truncate">Movimientos Almacén</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                      {detail.totalMovimientosInventario}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block truncate">Devoluciones</span>
                    <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                      {detail.totalDevolucionesAtendidas}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pestañas de Navegación de Historial */}
              <div className="space-y-3">
                <div className="flex border-b border-slate-800 text-xs overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ventas")}
                    className={`pb-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      activeTab === "ventas"
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Ventas ({detail.ventas.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("movimientos")}
                    className={`pb-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      activeTab === "movimientos"
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Boxes className="h-3.5 w-3.5" />
                    <span>Kardex ({detail.movimientos.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("devoluciones")}
                    className={`pb-2.5 px-3 sm:px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      activeTab === "devoluciones"
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Devoluciones ({detail.devoluciones.length})</span>
                  </button>
                </div>

                {/* Tab: Ventas */}
                {activeTab === "ventas" && (
                  <div>
                    {detail.ventas.length === 0 ? (
                      <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Este empleado aún no registra comprobantes de venta emitidos.
                      </div>
                    ) : (
                      <>
                        {/* Móvil (< sm) */}
                        <div className="sm:hidden space-y-2">
                          {detail.ventas.map((v) => (
                            <div key={v.idVenta} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-cyan-300">
                                  {v.numeroComprobante}
                                </span>
                                <span className="font-mono font-bold text-white">
                                  {formatCurrency(v.total)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{v.fecha}</span>
                                <span>{v.clienteNombre}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tabla Desktop (>= sm) */}
                        <div className="hidden sm:block rounded-xl border border-slate-800 overflow-hidden">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px]">
                                <th className="py-2.5 px-3 font-medium">Comprobante</th>
                                <th className="py-2.5 px-3 font-medium">Fecha</th>
                                <th className="py-2.5 px-3 font-medium">Cliente</th>
                                <th className="py-2.5 px-3 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {detail.ventas.map((v) => (
                                <tr key={v.idVenta} className="hover:bg-slate-850 transition-colors">
                                  <td className="py-2.5 px-3 font-mono font-medium text-cyan-300">
                                    {v.numeroComprobante}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                                    {v.fecha}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-300">
                                    <span>{v.clienteNombre}</span>
                                    <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                                      (DNI {v.clienteDni})
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                    {formatCurrency(v.total)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Movimientos Kardex */}
                {activeTab === "movimientos" && (
                  <div>
                    {detail.movimientos.length === 0 ? (
                      <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Este empleado aún no registra movimientos de inventario en Kardex.
                      </div>
                    ) : (
                      <>
                        {/* Móvil (< sm) */}
                        <div className="sm:hidden space-y-2">
                          {detail.movimientos.map((m) => {
                            const isEntry = m.tipoMovimiento.toLowerCase().includes("entrada");
                            return (
                              <div key={m.idMovimiento} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-cyan-300 font-bold">
                                    #{m.idMovimiento} &bull; {m.fecha}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      isEntry
                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                    }`}
                                  >
                                    {isEntry ? (
                                      <ArrowDownRight className="h-3 w-3" />
                                    ) : (
                                      <ArrowUpRight className="h-3 w-3" />
                                    )}
                                    <span>{m.tipoMovimiento}</span>
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-white">
                                    {m.nombreProducto}
                                  </span>
                                  <span className="font-mono font-bold text-white">
                                    {m.cantidad} uds
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop (>= sm) */}
                        <div className="hidden sm:block rounded-xl border border-slate-800 overflow-hidden">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px]">
                                <th className="py-2.5 px-3 font-medium">ID Mov</th>
                                <th className="py-2.5 px-3 font-medium">Fecha</th>
                                <th className="py-2.5 px-3 font-medium">Tipo</th>
                                <th className="py-2.5 px-3 font-medium">Componente</th>
                                <th className="py-2.5 px-3 font-medium text-right">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {detail.movimientos.map((m) => {
                                const isEntry = m.tipoMovimiento.toLowerCase().includes("entrada");
                                return (
                                  <tr key={m.idMovimiento} className="hover:bg-slate-850 transition-colors">
                                    <td className="py-2.5 px-3 font-mono text-cyan-300">
                                      #{m.idMovimiento}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                                      {m.fecha}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                          isEntry
                                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                        }`}
                                      >
                                        {isEntry ? (
                                          <ArrowDownRight className="h-3 w-3" />
                                        ) : (
                                          <ArrowUpRight className="h-3 w-3" />
                                        )}
                                        <span>{m.tipoMovimiento}</span>
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-300">
                                      <span className="font-semibold text-white block">
                                        {m.nombreProducto}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {m.codbarras}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                      {m.cantidad} uds
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tab: Devoluciones */}
                {activeTab === "devoluciones" && (
                  <div>
                    {detail.devoluciones.length === 0 ? (
                      <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Este empleado no ha tramitado devoluciones o garantías.
                      </div>
                    ) : (
                      <>
                        {/* Móvil (< sm) */}
                        <div className="sm:hidden space-y-2">
                          {detail.devoluciones.map((d) => (
                            <div key={d.idDevolucion} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-cyan-300 font-bold">
                                  Dev #{d.idDevolucion}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-cyan-300 font-medium">
                                  {d.estadoDevolucion}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{d.fecha}</span>
                                <span className="font-mono">{d.numeroComprobante}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop (>= sm) */}
                        <div className="hidden sm:block rounded-xl border border-slate-800 overflow-hidden">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px]">
                                <th className="py-2.5 px-3 font-medium">ID Dev</th>
                                <th className="py-2.5 px-3 font-medium">Fecha</th>
                                <th className="py-2.5 px-3 font-medium">Comprobante Venta</th>
                                <th className="py-2.5 px-3 font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {detail.devoluciones.map((d) => (
                                <tr key={d.idDevolucion} className="hover:bg-slate-850 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">
                                    #{d.idDevolucion}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                                    {d.fecha}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-300">
                                    {d.numeroComprobante} (Venta #{d.idVenta})
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-cyan-300 font-medium">
                                      {d.estadoDevolucion}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[42px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
}