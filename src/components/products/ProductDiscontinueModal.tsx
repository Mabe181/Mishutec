"use client";

import { useState, useTransition } from "react";
import { ProductDetail } from "@/types/product";
import { discontinueProductAction } from "@/lib/actions/product.actions";
import {
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
  Archive,
  CheckCircle2,
} from "lucide-react";

interface ProductDiscontinueModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onRequestLogin: () => void;
  onProductDiscontinued: (codbarras: string) => void;
}

export function ProductDiscontinueModal({
  product,
  isOpen,
  onClose,
  isAuthenticated,
  onRequestLogin,
  onProductDiscontinued,
}: ProductDiscontinueModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isAuthenticated) {
      onRequestLogin();
      return;
    }

    startTransition(async () => {
      try {
        const res = await discontinueProductAction(product.codbarras);
        if (res.success) {
          setSuccessMsg(res.message || "Producto descontinuado con éxito.");
          setTimeout(() => {
            onProductDiscontinued(product.codbarras);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || "No se pudo descontinuar el producto.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error al procesar la descontinuación.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-150 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Descontinuar Producto
              </h3>
              <p className="text-xs text-slate-400">
                Baja lógica en catálogo de hardware
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-white text-xs">{product.nombre}</h4>
              <p className="text-[11px] text-cyan-300 font-mono mt-0.5">
                Código: {product.codbarras}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
              {product.categoria}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold">Política de Baja Lógica:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1 text-[11px]">
              <li>El estado se actualizará a <span className="text-amber-300 font-medium">Descontinuado</span> en <code className="text-slate-400">dbo.Producto</code>.</li>
              <li>No se eliminará ningún registro físico de SQL Server.</li>
              <li>Se conservará íntegro el historial de ventas, compras y especificaciones.</li>
              <li>No se permitirá emitir nuevas ventas de este producto.</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Actualizando Estado...</span>
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                <span>Confirmar Descontinuación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
