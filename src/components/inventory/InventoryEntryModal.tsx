"use client";

import { useState, useTransition, useEffect } from "react";
import {
  InventoryFilterMetadata,
  InventoryProductStockItem,
} from "@/types/inventory";
import { recordInventoryEntryAction } from "@/lib/actions/inventory.actions";
import {
  ArrowDownRight,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  PackagePlus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface InventoryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: InventoryFilterMetadata;
  initialProduct?: InventoryProductStockItem | null;
  onSuccess: (message: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function InventoryEntryModal({
  isOpen,
  onClose,
  metadata,
  initialProduct = null,
  onSuccess,
  isAuthenticated,
  onRequireAuth,
}: InventoryEntryModalProps) {
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
  const estimatedStock = currentStock + safeQty;

  const willTransitionToAvailable =
    (currentStock === 0 || currentProd?.idEstado === 2) && safeQty > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (isDescontinuado) {
      setErrorMsg("No se permiten entradas ordinarias sobre productos descontinuados.");
      return;
    }

    if (safeQty <= 0) {
      setErrorMsg("La cantidad ingresada debe ser estrictamente mayor a 0.");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      const res = await recordInventoryEntryAction({
        codbarras: selectedCodbarras,
        cantidad: safeQty,
        idEmpleado: Number(idEmpleado),
        fecha,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al registrar la entrada de inventario.");
      } else {
        onSuccess(
          `Entrada registrada: +${safeQty} unidades añadidas a '${res.data?.nombreProducto}' (Nuevo Stock: ${res.data?.stockNuevo}).`
        );
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Entrada a Almacén
              </h2>
              <p className="text-xs text-slate-500">
                Transacción atómica con actualización de stock e historial en SQL Server
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Selector de Producto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Componente a Recibir *
            </label>
            <select
              value={selectedCodbarras}
              onChange={(e) => setSelectedCodbarras(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
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
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Este producto se encuentra <strong>Descontinuado</strong>. Por política de integridad, no se pueden registrar movimientos sobre componentes fuera de catálogo.
              </span>
            </div>
          )}

          {/* Fila: Cantidad y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cantidad a Ingresar *
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                disabled={isDescontinuado}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fecha del Movimiento *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={isDescontinuado}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Empleado Responsable (dbo.Empleado) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Empleado Responsable (Operador de Almacén) *
            </label>
            <select
              value={idEmpleado}
              onChange={(e) => setIdEmpleado(Number(e.target.value))}
              disabled={isDescontinuado}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
            >
              {metadata.empleados.map((emp) => (
                <option key={emp.idEmpleado} value={emp.idEmpleado}>
                  {emp.nombreCompleto} (DNI: {emp.dni})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Registro trazable asociado a la clave foránea dbo.Empleado en SQL Server.
            </p>
          </div>

          {/* Panel de Proyección de Existencias */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Proyección de Balance Atómico
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Stock Actual</span>
                <span className="font-mono font-bold text-slate-900">
                  {currentStock} unidades
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block font-medium">Stock Resultante</span>
                <span className="font-mono font-bold text-emerald-800">
                  {estimatedStock} unidades
                </span>
              </div>
            </div>

            {willTransitionToAvailable && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium pt-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>El producto pasará automáticamente de <strong>Agotado</strong> a <strong>Disponible</strong>.</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isDescontinuado}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Procesando Transacción...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  <span>Confirmar Entrada</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
