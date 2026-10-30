"use client";

import { useEffect, useState } from "react";
import { ClientDetail } from "@/types/entities";
import { getClientDetailAction } from "@/lib/actions/client.actions";
import { formatCurrency } from "@/lib/formatters";
import {
  X,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Loader2,
  Edit,
} from "lucide-react";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dni: string | null;
  onEdit: (client: ClientDetail) => void;
}

export function ClientDetailModal({
  isOpen,
  onClose,
  dni,
  onEdit,
}: ClientDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ClientDetail | null>(null);

  useEffect(() => {
    if (isOpen && dni) {
      setLoading(true);
      getClientDetailAction(dni)
        .then((res) => {
          if (res.success && res.data) {
            setDetail(res.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
    }
  }, [isOpen, dni]);

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
      aria-labelledby="client-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 id="client-detail-title" className="text-sm sm:text-base font-bold text-slate-900">
                Ficha del Cliente
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Información personal e historial de compras registrado en SQL Server
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {loading || !detail ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs">Cargando ficha del cliente...</span>
            </div>
          ) : (
            <>
              {/* Información Personal */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {detail.nombreCompleto}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-semibold text-blue-600">
                        DNI: {detail.dni}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(detail)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 text-xs font-semibold border border-slate-200 hover:border-blue-300 shadow-xs transition-colors self-start sm:self-auto"
                  >
                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                    <span>Editar Cliente</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{detail.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{detail.telefono || "Sin teléfono registrado"}</span>
                  </div>
                </div>
              </div>

              {/* Métricas de Compra Responsivas */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block truncate">Total Compras</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                    {detail.totalVentas}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block truncate">Consumo Total</span>
                  <span className="text-xs sm:text-base font-bold text-slate-900 font-mono">
                    {formatCurrency(detail.montoTotalComprado)}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block truncate">Última Compra</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 font-mono truncate block">
                    {detail.ultimaCompraFecha || "Sin compras"}
                  </span>
                </div>
              </div>

              {/* Historial de Ventas */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  <span>Historial de Comprobantes ({detail.ventas.length})</span>
                </div>

                {detail.ventas.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Este cliente aún no registra comprobantes de venta emitidos.
                  </div>
                ) : (
                  <>
                    {/* Lista Móvil de Comprobantes (< sm) */}
                    <div className="sm:hidden space-y-2">
                      {detail.ventas.map((v) => (
                        <div key={v.idVenta} className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-600">
                              {v.numeroComprobante}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {formatCurrency(v.total)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{v.tipoComprobante} &bull; {v.fecha}</span>
                            <span>{v.empleado}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tabla de Comprobantes (>= sm) */}
                    <div className="hidden sm:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                            <th className="py-2.5 px-3">Comprobante</th>
                            <th className="py-2.5 px-3">Tipo</th>
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Atendido Por</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.ventas.map((v) => (
                            <tr key={v.idVenta} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">
                                {v.numeroComprobante}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">
                                {v.tipoComprobante}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                {v.fecha}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">
                                {v.empleado}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[42px] rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}