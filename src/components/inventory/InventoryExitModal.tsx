"use client";

import { useState, useTransition, useEffect } from "react";
import {
  InventoryFilterMetadata,
  InventoryProductStockItem,
} from "@/types/inventory";
import { recordInventoryExitAction } from "@/lib/actions/inventory.actions";
import {
  ArrowUpRight,
  X,
  AlertCircle,
  Loader2,
  AlertTriangle,
  PackageMinus,
  CheckCircle2,
} from "lucide-react";

interface InventoryExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: InventoryFilterMetadata;
  initialProduct?: InventoryProductStockItem | null;
  onSuccess: (message: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function InventoryExitModal({
  isOpen,
  onClose,
  metadata,
  initialProduct = null,
  onSuccess,
  isAuthenticated,
  onRequireAuth,
}: InventoryExitModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedCodbarras, setSelectedCodbarras] = useState<string>(
    initialProduct?.codbarras || metadata.productos[0]?.codbarras || ""
  );
  const [cantidad, setCantidad] = useState<number>(1);
  const [idEmpleado, setIdEmpleado] = useState<number>(
    metadata.empleados[0]?.idEmpleado || 1
  );
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (initialProduct) {
      setSelectedCodbarras(initialProduct.codbarras);
    }
  }, [initialProduct]);

  if (!isOpen) return null;

  const currentProd = metadata.productos.find(
    (p) => p.codbarras === selectedCodbarras
  );
  const isDescontinuado =
    currentProd?.idEstado === 3 ||
    currentProd?.estado.toLowerCase() === "descontinuado";
  const currentStock = currentProd?.stock ?? 0;
  const safeQty = Number(cantidad) > 0 ? Number(cantidad) : 0;
  const estimatedStock = currentStock - safeQty;
  const hasInsufficientStock = safeQty > currentStock;
  const willBeAgotado = estimatedStock === 0 && currentStock > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (isDescontinuado) {
      setErrorMsg("No se permiten salidas ordinarias sobre productos descontinuados.");
      return;
    }

    if (safeQty <= 0) {
      setErrorMsg("La cantidad a retirar debe ser estrictamente mayor a 0.");
      return;
    }

    if (hasInsufficientStock) {
      setErrorMsg(
        `Stock insuficiente: No se puede retirar ${safeQty} unidades. Existencia actual: ${currentStock}.`
      );
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      const res = await recordInventoryExitAction({
        codbarras: selectedCodbarras,
        cantidad: safeQty,
        idEmpleado: Number(idEmpleado),
        fecha,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al registrar la salida de inventario.");
      } else {
        onSuccess(
          `Salida física confirmada: -${safeQty} unidades de '${res.data?.nombreProducto}' (Stock remanente: ${res.data?.stockNuevo}).`
        );
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Registrar Salida de Inventario
              </h2>
              <p className="text-xs text-slate-400">
                Egreso físico validado con bloqueo de sobreventa (UPDLOCK)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Selector de Producto */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Componente a Retirar *
            </label>
            <select
              value={selectedCodbarras}
              onChange={(e) => setSelectedCodbarras(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {metadata.productos.map((prod) => (
                <option key={prod.codbarras} value={prod.codbarras}>
                  {prod.nombre} (Stock: {prod.stock} - {prod.estado})
                </option>
              ))}
            </select>
          </div>

          {/* Alerta de Descontinuado */}
          {isDescontinuado && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                Este producto se encuentra <strong>Descontinuado</strong>. No se permiten salidas operativas de productos inactivos.
              </span>
            </div>
          )}

          {/* Fila: Cantidad y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cantidad a Retirar *
              </label>
              <input
                type="number"
                min={1}
                max={Math.max(1, currentStock)}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                disabled={isDescontinuado || currentStock === 0}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fecha del Movimiento *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={isDescontinuado || currentStock === 0}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Empleado Responsable */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Empleado Responsable (Autoriza o Despacha) *
            </label>
            <select
              value={idEmpleado}
              onChange={(e) => setIdEmpleado(Number(e.target.value))}
              disabled={isDescontinuado || currentStock === 0}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {metadata.empleados.map((emp) => (
                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                  {emp.nombreCompleto} (DNI: {emp.dni})
                </option>
              ))}
            </select>
          </div>

          {/* Panel de Proyección de Existencias y Validación de Suficiencia */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">
              Proyección de Existencias en Almacén
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Stock Actual</span>
                <span className="font-mono font-bold text-white">
                  {currentStock} unidades
                </span>
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  hasInsufficientStock
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-300"
                }`}
              >
                <span className="text-[10px] block opacity-80">Stock Resultante</span>
                <span className="font-mono font-bold">
                  {hasInsufficientStock ? "INVÁLIDO" : `${estimatedStock} unidades`}
                </span>
              </div>
            </div>

            {hasInsufficientStock && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  <strong>Stock insuficiente:</strong> No se puede retirar {safeQty} unidades si solo existen {currentStock} en almacén.
                </span>
              </div>
            )}

            {willBeAgotado && !hasInsufficientStock && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>El producto consumirá todo su stock y transitará automáticamente a <strong>Agotado</strong>.</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                isDescontinuado ||
                currentStock === 0 ||
                hasInsufficientStock
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold shadow-md shadow-orange-500/20 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Procesando Salida...</span>
                </>
              ) : (
                <>
                  <PackageMinus className="h-4 w-4" />
                  <span>Confirmar Salida</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
