"use client";

import { useState, useEffect } from "react";
import { ReturnDetail } from "@/types/returns";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  approveReturnAction,
  rejectReturnAction,
} from "@/lib/actions/return.actions";
import {
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  User,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Package,
} from "lucide-react";

interface ReturnDetailModalProps {
  detail: ReturnDetail;
  onClose: () => void;
  onActionComplete?: () => void;
}

export function ReturnDetailModal({ detail, onClose, onActionComplete }: ReturnDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reingresoStock, setReingresoStock] = useState(false);

  // Comprobar si tiene algún ítem con motivo 'Producto equivocado' (ID = 2)
  const hasWrongProduct = detail.lineasDevolucion.some((l) => l.idMotivo === 2);
  const isPending = detail.idEstadoDev === 1;

  // Manejo de tecla Escape y bloqueo de scroll de fondo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isProcessing]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      setActionSuccess(null);

      const res = await approveReturnAction({
        idDevolucion: detail.idDevolucion,
        reingresoStock: hasWrongProduct ? reingresoStock : false,
      });

      if (!res.success || !res.data) {
        setActionError(res.error || "No se pudo aprobar la devolución.");
        return;
      }

      setActionSuccess(
        res.data.reingresoKardexRealizado
          ? `Devolución #${detail.idDevolucion} aprobada exitosamente. Se reingresaron ${res.data.unidadesReingresadas} unidades al inventario (Kardex).`
          : `Devolución #${detail.idDevolucion} aprobada exitosamente. Sin alteración de stock comercial.`
      );

      if (onActionComplete) {
        setTimeout(() => {
          onActionComplete();
        }, 1200);
      }
    } catch (err: any) {
      setActionError(err.message || "Error al procesar la aprobación.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      setActionSuccess(null);

      const res = await rejectReturnAction({
        idDevolucion: detail.idDevolucion,
      });

      if (!res.success || !res.data) {
        setActionError(res.error || "No se pudo rechazar la devolución.");
        return;
      }

      setActionSuccess(
        `Devolución #${detail.idDevolucion} rechazada. Las unidades reservadas han sido liberadas para el comprobante original.`
      );

      if (onActionComplete) {
        setTimeout(() => {
          onActionComplete();
        }, 1200);
      }
    } catch (err: any) {
      setActionError(err.message || "Error al procesar el rechazo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusBadge = (estado: string, idEstado: number) => {
    switch (idEstado) {
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Aprobada</span>
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>En Revisión (Pendiente)</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            <span>Rechazada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {estado}
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-return-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Cabecera Fija */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id="modal-return-title"
                  className="text-base sm:text-lg font-bold text-slate-100 truncate"
                >
                  Ficha de Devolución DEV-#{detail.idDevolucion.toString().padStart(4, "0")}
                </h3>
                {renderStatusBadge(detail.estadoDev, detail.idEstadoDev)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trámite registrado el {formatDate(detail.fechaDev)} en SQL Server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {/* Mensajes de Acción Transaccional */}
          {actionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Bloque 1: Resumen de Venta Original y Titular */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Comprobante de Venta
              </span>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="font-mono font-bold text-slate-200">
                  {detail.numeroComprobante}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Emisión: {formatDate(detail.fechaVenta)}
              </p>
              <p className="text-xs text-cyan-400 font-semibold font-mono">
                Total Venta: {formatCurrency(detail.totalVenta)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cliente Titular
              </span>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-200 truncate">
                  {detail.clienteNombre}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                DNI: {detail.dniCliente}
              </p>
              {detail.clienteCorreo && (
                <p className="text-[11px] text-slate-500 truncate">
                  {detail.clienteCorreo}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Operador Responsable
              </span>
              <p className="font-semibold text-slate-200">
                {detail.empleadoNombre}
              </p>
              <p className="text-xs text-slate-400">
                ID Empleado #{detail.idEmpleado}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 inline-block">
                Área de Soporte Técnico / Caja
              </span>
            </div>
          </div>

          {/* Bloque 2: Líneas Involucradas en esta Devolución */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Líneas Afectadas en esta Devolución</span>
              </h4>
              <span className="text-xs text-slate-400">
                {detail.totalUnidadesDevueltas} unid. en este trámite
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Producto / Código</th>
                      <th className="py-2.5 px-3 text-right">Precio Venta</th>
                      <th className="py-2.5 px-3 text-center">Vendidos</th>
                      <th className="py-2.5 px-3 text-center">Devueltos</th>
                      <th className="py-2.5 px-3 text-center">Disponibles</th>
                      <th className="py-2.5 px-3 text-center">Causa / Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {detail.lineasDevolucion.map((line) => (
                      <tr key={line.idDetalle} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-200 block truncate max-w-[200px]">
                            {line.nombreProd}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {line.codbarras}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                          {formatCurrency(line.precioVentaOriginal)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-300">
                          {line.cantidadVendidaOriginal} unid.
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-cyan-400 text-sm">
                            {line.cantidadDevueltaEstaDev}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                          {line.cantidadDisponibleDevolucion} unid.
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-cyan-300 border border-slate-700">
                            {line.motivo || "No especificado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bloque 3: Análisis de Garantía Legal por Producto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Análisis de Garantía Legal por Producto</span>
            </h4>

            <div className="space-y-2">
              {detail.lineasDevolucion.map((line) => (
                <div
                  key={`garantia-${line.idDetalle}`}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="font-medium text-slate-200 text-xs block">
                      {line.nombreProd}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Plazo: <strong>{line.garantiaMeses} meses</strong></span>
                      <span>•</span>
                      <span>Venta: {formatDate(line.fechaVenta)}</span>
                      <span>•</span>
                      <span>Vencimiento Estimado: {formatDate(line.fechaVencimientoGarantia)}</span>
                    </div>
                  </div>

                  <div>
                    {line.garantiaVigente ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Garantía Vigente ({line.diasRestantesGarantia} días restantes)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Garantía Expirada hace {Math.abs(line.diasRestantesGarantia)} días</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Observación de Esquema */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Observación de Esquema:</strong> El cálculo de vigencia se deriva de{" "}
                <code>dbo.Producto.Garantia_meses</code> sumado a <code>Fecha_venta</code>. Dado que la
                tabla <code>Detalle_Venta</code> no almacena una captura histórica del plazo de garantía al
                momento de la compra, cualquier modificación posterior en el catálogo alteraría este cálculo
                prospectivamente.
              </p>
            </div>
          </div>

          {/* Bloque 4: Panel de Aprobación / Rechazo para Trámites Pendientes (Fase 7B) */}
          {isPending && !actionSuccess && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Resolución Administrativa del Trámite</span>
                </h4>
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Requiere Autorización
                </span>
              </div>

              {/* Opción de Reingreso Físico (Solo si hay Producto equivocado) */}
              {hasWrongProduct ? (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reingresoStock}
                      onChange={(e) => setReingresoStock(e.target.checked)}
                      disabled={isProcessing}
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">
                        Confirmar inspección técnica y reingreso físico a almacén (Kardex)
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Aplica únicamente a ítems con motivo "Producto equivocado". Al marcar esta
                        opción, el stock del producto aumentará en almacén y se registrará un movimiento
                        de Entrada en Kardex.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-400 flex items-center gap-2 border border-slate-800">
                  <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>
                    Este trámite corresponde a producto defectuoso o garantía; su aprobación{" "}
                    <strong>no incrementará el stock comercial ni generará Kardex de reingreso</strong>.
                  </span>
                </div>
              )}

              {/* Botones de Resolución Transaccional */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span>Rechazar Devolución (Liberar Reserva)</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Aprobar Devolución Definitiva</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bloque 5: Constancia Interna */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Constancia Interna de Trámite:</strong> Este documento acredita el control físico
              y administrativo de la devolución en <strong>MishutecT2_Aceptacion</strong>. No constituye
              ni reemplaza una Nota de Crédito Electrónica emitida ante la administración tributaria (SUNAT).
            </p>
          </div>
        </div>

        {/* Pie Fijo */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            ID Trámite: #{detail.idDevolucion} | Venta: #{detail.idVenta}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
