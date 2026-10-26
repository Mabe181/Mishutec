"use client";

import { useState, useEffect } from "react";
import {
  SaleForReturnSearch,
  SaleLineWithBalance,
  TransactionalReturnResult,
} from "@/types/returns";
import {
  searchSaleForReturnAction,
  createReturnAction,
} from "@/lib/actions/return.actions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  X,
  Search,
  RotateCcw,
  Package,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Clock,
} from "lucide-react";

interface NewReturnModalProps {
  onClose: () => void;
  onSuccess: (result: TransactionalReturnResult) => void;
  motivos: Array<{ id: number; descripcion: string }>;
}

interface SelectedItemState {
  idDetalle: number;
  cantidadDev: number;
  idMotivo: number;
}

export function NewReturnModal({ onClose, onSuccess, motivos }: NewReturnModalProps) {
  // Búsqueda de venta
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saleData, setSaleData] = useState<SaleForReturnSearch | null>(null);

  // Selección de ítems para devolución
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItemState>>(new Map());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);

  // Envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cerrar con Escape y bloquear scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Manejador de búsqueda de comprobante
  const handleSearchSale = async (voucherToSearch?: string) => {
    const term = voucherToSearch || searchTerm;
    if (!term.trim()) return;

    try {
      setIsSearching(true);
      setSearchError(null);
      setSubmitError(null);
      setSaleData(null);
      setSelectedItems(new Map());

      const res = await searchSaleForReturnAction(term.trim());

      if (!res.success || !res.data) {
        setSearchError(res.error || "No se encontró ninguna venta con el código ingresado.");
        return;
      }

      setSaleData(res.data);
      setSelectedEmployeeId(res.data.idEmpleado || 1);
    } catch (err: any) {
      setSearchError(err.message || "Error al buscar la venta solicitada.");
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle selección de ítem
  const handleToggleItem = (line: SaleLineWithBalance) => {
    if (line.cantidadDisponible <= 0) return;

    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(line.idDetalle)) {
        next.delete(line.idDetalle);
      } else {
        next.set(line.idDetalle, {
          idDetalle: line.idDetalle,
          cantidadDev: 1,
          idMotivo: motivos[0]?.id || 1,
        });
      }
      return next;
    });
  };

  // Cambio de cantidad devuelta
  const handleQuantityChange = (idDetalle: number, newCant: number, maxDisponible: number) => {
    const validCant = Math.min(Math.max(1, newCant), maxDisponible);
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const current = next.get(idDetalle);
      if (current) {
        next.set(idDetalle, { ...current, cantidadDev: validCant });
      }
      return next;
    });
  };

  // Cambio de motivo
  const handleMotiveChange = (idDetalle: number, idMotivo: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const current = next.get(idDetalle);
      if (current) {
        next.set(idDetalle, { ...current, idMotivo });
      }
      return next;
    });
  };

  // Resumen de cálculo
  const selectedCount = selectedItems.size;
  const totalUnits = Array.from(selectedItems.values()).reduce(
    (acc, it) => acc + it.cantidadDev,
    0
  );
  const estimatedAmount = Array.from(selectedItems.values()).reduce((acc, it) => {
    const line = saleData?.lineas.find((l) => l.idDetalle === it.idDetalle);
    return acc + (line ? it.cantidadDev * line.precioUnitario : 0);
  }, 0);

  // Envío del registro de devolución
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleData || selectedItems.size === 0) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const itemsArray = Array.from(selectedItems.values()).map((it) => ({
        idDetalle: it.idDetalle,
        cantidadDev: it.cantidadDev,
        idMotivo: it.idMotivo,
      }));

      const res = await createReturnAction({
        idVenta: saleData.idVenta,
        idEmpleado: selectedEmployeeId,
        items: itemsArray,
      });

      if (!res.success || !res.data) {
        setSubmitError(res.error || "No se pudo registrar la devolución.");
        return;
      }

      onSuccess(res.data);
    } catch (err: any) {
      setSubmitError(err.message || "Error al procesar la solicitud de devolución.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Registrar Solicitud de Devolución
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Estado: Pendiente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Búsqueda transaccional de comprobante, verificación de saldos y reserva de unidades
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Buscador de Comprobante */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Paso 1: Localizar Venta Original por Comprobante
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSale()}
                  placeholder="Ej: B001-000001, B001-000002, F001-000001..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearchSale()}
                disabled={isSearching || !searchTerm.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Buscar Venta</span>
              </button>
            </div>

            {/* Accesos rápidos a ventas recientes */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-1">
              <span>Sugerencias rápidas:</span>
              {["B001-000001", "B001-000002", "B001-000003", "B001-000004", "B001-000005"].map(
                (v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setSearchTerm(v);
                      handleSearchSale(v);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[11px] border border-slate-700 transition-colors"
                  >
                    {v}
                  </button>
                )
              )}
            </div>

            {searchError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* 2. Información de la Venta Localizada */}
          {saleData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Comprobante
                  </span>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span className="font-mono font-bold text-slate-200">
                      {saleData.numeroComprobante}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {saleData.tipoComprobante}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Fecha: {formatDate(saleData.fechaVenta)} • Total:{" "}
                    <strong className="text-slate-200">
                      {formatCurrency(saleData.totalVenta)}
                    </strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cliente Titular
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-slate-200 text-sm">
                      {saleData.nombreCliente}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">DNI: {saleData.dniCliente}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Vendedor Asignado
                  </span>
                  <p className="text-sm font-medium text-slate-200">
                    {saleData.nombreEmpleado}
                  </p>
                  <p className="text-xs text-slate-400">
                    Venta ID #{saleData.idVenta}
                  </p>
                </div>
              </div>

              {/* 3. Selección de Productos Vendidos y Cantidades */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Paso 2: Seleccionar Productos a Devolver y Causa
                  </label>
                  <span className="text-xs text-cyan-400">
                    {selectedCount} de {saleData.lineas.length} ítems seleccionados
                  </span>
                </div>

                <div className="space-y-2.5">
                  {saleData.lineas.map((line) => {
                    const isSelected = selectedItems.has(line.idDetalle);
                    const isAvailable = line.cantidadDisponible > 0;
                    const selectedState = selectedItems.get(line.idDetalle);

                    return (
                      <div
                        key={line.idDetalle}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-950/50"
                            : isAvailable
                            ? "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                            : "bg-slate-950/20 border-slate-800/40 opacity-60"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Checkbox y Nombre */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isAvailable}
                              onChange={() => handleToggleItem(line)}
                              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-200 truncate">
                                  {line.nombreProd}
                                </h4>
                                <span className="font-mono text-[11px] text-slate-400">
                                  [{line.codbarrasProd}]
                                </span>
                              </div>

                              {/* Badges de Balance y Plazo de Garantía */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  Vendidos: {line.cantidadVendida} unid.
                                </span>
                                {line.cantidadAprobada > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                                    Aprobados: {line.cantidadAprobada}
                                  </span>
                                )}
                                {line.cantidadPendiente > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                                    Reservados en Pendiente: {line.cantidadPendiente}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded font-bold border ${
                                    line.cantidadDisponible > 0
                                      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  }`}
                                >
                                  Disponible: {line.cantidadDisponible} unid.
                                </span>

                                {/* Indicador de Garantía */}
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700">
                                  {line.garantiaVigente ? (
                                    <>
                                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                      <span className="text-emerald-300 font-medium">
                                        Garantía Vigente ({line.diasGarantiaRestantes} d)
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldAlert className="h-3 w-3 text-rose-400" />
                                      <span className="text-rose-300 font-medium">
                                        Garantía Expirada
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Precio Unitario */}
                          <div className="text-right shrink-0">
                            <span className="text-xs text-slate-400 block">Precio Venta</span>
                            <span className="text-sm font-bold text-slate-200">
                              {formatCurrency(line.precioUnitario)}
                            </span>
                          </div>
                        </div>

                        {/* Controles de Entrada (cuando está seleccionado) */}
                        {isSelected && selectedState && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Cantidad a Devolver (Máx: {line.cantidadDisponible})
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={line.cantidadDisponible}
                                  value={selectedState.cantidadDev}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      line.idDetalle,
                                      parseInt(e.target.value) || 1,
                                      line.cantidadDisponible
                                    )
                                  }
                                  className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                                />
                                <span className="text-xs text-slate-400">
                                  Subtotal devolución:{" "}
                                  <strong className="text-slate-200 font-mono">
                                    {formatCurrency(
                                      selectedState.cantidadDev * line.precioUnitario
                                    )}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Causa / Motivo del Trámite
                              </label>
                              <select
                                value={selectedState.idMotivo}
                                onChange={(e) =>
                                  handleMotiveChange(line.idDetalle, Number(e.target.value))
                                }
                                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                              >
                                {motivos.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.descripcion}
                                  </option>
                                ))}
                              </select>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {selectedState.idMotivo === 1
                                  ? "Producto con daño físico o fallo interno (No reingresa a stock vendible)."
                                  : selectedState.idMotivo === 2
                                  ? "Error de despacho. Sellado y apto para reventa tras inspección."
                                  : "Falla de fábrica cubierta por garantía técnica."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Resumen y Empleado Responsable */}
              {selectedCount > 0 && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                        Resumen del Trámite RMA
                      </span>
                      <p className="text-xs text-slate-400">
                        {selectedCount} producto(s) seleccionado(s) • Total unidades:{" "}
                        <strong className="text-slate-200">{totalUnits} unid.</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Impacto Estimado</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        {formatCurrency(estimatedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Advertencia Transaccional */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Política de Reserva Transaccional:</strong> Al registrar este trámite,
                      las {totalUnits} unidades quedarán en estado{" "}
                      <span className="text-amber-200 font-bold">Pendiente</span> y reservadas en la
                      base de datos, impidiendo que otra terminal las devuelva. La mercadería no
                      ingresa al stock físico de almacén hasta su posterior evaluación y aprobación
                      administrativa.
                    </p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie Fijo con Acciones */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCount === 0 || !saleData}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                <span>Registrando Transacción...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Registrar Devolución ({totalUnits} unid.)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
