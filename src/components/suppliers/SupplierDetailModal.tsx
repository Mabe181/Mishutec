"use client";

import { useEffect, useState, useTransition } from "react";
import { SupplierDetail } from "@/types/entities";
import {
  getSupplierDetailAction,
  associateProductAction,
  dissociateProductAction,
  getAvailableProductsForLinkingAction,
} from "@/lib/actions/supplier.actions";
import { formatCurrency } from "@/lib/formatters";
import {
  X,
  Building2,
  Mail,
  Phone,
  Package,
  PlusCircle,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Edit,
} from "lucide-react";

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number | null;
  onEdit: (supplier: SupplierDetail) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onSupplierUpdated?: () => void;
}

export function SupplierDetailModal({
  isOpen,
  onClose,
  supplierId,
  onEdit,
  isAuthenticated,
  onRequireAuth,
  onSupplierUpdated,
}: SupplierDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [availableProducts, setAvailableProducts] = useState<
    { codbarras: string; nombre: string; precio: number }[]
  >([]);

  // Estado para asociar nuevo producto
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async (id: number) => {
    setLoading(true);
    setActionError(null);
    try {
      const [detailRes, prodRes] = await Promise.all([
        getSupplierDetailAction(id),
        getAvailableProductsForLinkingAction(),
      ]);

      if (detailRes.success && detailRes.data) {
        setDetail(detailRes.data);
      }
      if (prodRes.success && prodRes.data) {
        setAvailableProducts(prodRes.data);
      }
    } catch (err: any) {
      setActionError("Error al cargar los datos del proveedor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && supplierId) {
      loadData(supplierId);
      setSelectedBarcode("");
      setPurchasePrice("");
      setActionSuccess(null);
    } else {
      setDetail(null);
    }
  }, [isOpen, supplierId]);

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

  const handleLinkProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (!selectedBarcode) {
      setActionError("Seleccione un producto para asociar.");
      return;
    }

    const priceNum = parseFloat(purchasePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setActionError("Ingrese un precio de compra válido mayor a 0.");
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await associateProductAction({
        idProveedor: supplierId!,
        codbarras: selectedBarcode,
        precioCompra: priceNum,
      });

      if (!res.success) {
        setActionError(res.error || "Error al asociar producto.");
      } else {
        setActionSuccess("Producto vinculado al proveedor exitosamente.");
        setSelectedBarcode("");
        setPurchasePrice("");
        await loadData(supplierId!);
        if (onSupplierUpdated) onSupplierUpdated();
      }
    });
  };

  const handleUnlinkProduct = (codbarras: string, nombreProd: string) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (
      !confirm(
        `¿Está seguro de desvincular el producto '${nombreProd}' (${codbarras}) de este proveedor?`
      )
    ) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const res = await dissociateProductAction(supplierId!, codbarras);
      if (!res.success) {
        setActionError(res.error || "Error al desvincular producto.");
      } else {
        setActionSuccess(`Producto '${nombreProd}' desvinculado exitosamente.`);
        await loadData(supplierId!);
        if (onSupplierUpdated) onSupplierUpdated();
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="supplier-detail-title" className="text-sm sm:text-base font-bold text-white">
                Ficha del Proveedor y Catálogo
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Relación comercial y costos de adquisición en SQL Server (dbo.Suministra)
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

        {/* Notificaciones de Acción */}
        {actionSuccess && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-xs text-emerald-400 hover:underline p-1"
            >
              Cerrar
            </button>
          </div>
        )}

        {actionError && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-xs text-rose-400 hover:underline p-1"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {loading || !detail ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="text-xs">Cargando catálogo del proveedor...</span>
            </div>
          ) : (
            <>
              {/* Información General */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                        ID #{detail.idProveedor}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {detail.nombre}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(detail)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto"
                  >
                    <Edit className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Editar Proveedor</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="truncate">{detail.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>{detail.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Formulario Vincular Nuevo Producto Adaptable */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <PlusCircle className="h-4 w-4 text-cyan-400" />
                  <span>Vincular Producto al Catálogo</span>
                </div>

                <form
                  onSubmit={handleLinkProduct}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3"
                >
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Componente
                    </label>
                    <select
                      value={selectedBarcode}
                      onChange={(e) => {
                        setSelectedBarcode(e.target.value);
                        const found = availableProducts.find(
                          (p) => p.codbarras === e.target.value
                        );
                        if (found) {
                          setPurchasePrice(
                            (Math.round(found.precio * 0.8 * 100) / 100).toFixed(2)
                          );
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Seleccionar producto --</option>
                      {availableProducts.map((p) => (
                        <option key={p.codbarras} value={p.codbarras}>
                          {p.nombre} ({p.codbarras}) - PVP {formatCurrency(p.precio)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Costo Compra (S/)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={isPending || !selectedBarcode || !purchasePrice}
                      className="w-full py-2.5 px-3 min-h-[42px] rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition-colors"
                    >
                      {isPending ? "Guardando..." : "Asociar"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Productos Suministrados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-cyan-400" />
                    <span>
                      Productos en Catálogo ({detail.productos.length})
                    </span>
                  </div>
                </div>

                {detail.productos.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                    Este proveedor no tiene productos vinculados en dbo.Suministra.
                  </div>
                ) : (
                  <>
                    {/* Tarjetas Móviles (< sm) */}
                    <div className="sm:hidden space-y-2">
                      {detail.productos.map((prod) => (
                        <div key={prod.codbarras} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[10px] text-cyan-300 font-semibold block">
                                {prod.codbarras}
                              </span>
                              <h4 className="font-semibold text-white">
                                {prod.nombreProducto}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {prod.categoria} &bull; {prod.marca}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnlinkProduct(prod.codbarras, prod.nombreProducto)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Desvincular"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                            <span className="text-slate-400">
                              Compra: <strong className="text-amber-300 font-mono">{formatCurrency(prod.precioCompra)}</strong>
                            </span>
                            <span className="text-slate-400">
                              Venta: <strong className="text-slate-200 font-mono">{formatCurrency(prod.precioVenta)}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tabla Desktop (>= sm) */}
                    <div className="hidden sm:block rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px]">
                            <th className="py-2.5 px-3 font-medium">Código</th>
                            <th className="py-2.5 px-3 font-medium">Componente</th>
                            <th className="py-2.5 px-3 font-medium">Categoría / Marca</th>
                            <th className="py-2.5 px-3 font-medium text-right">P. Compra</th>
                            <th className="py-2.5 px-3 font-medium text-right">P. Venta</th>
                            <th className="py-2.5 px-3 font-medium text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {detail.productos.map((prod) => (
                            <tr
                              key={prod.codbarras}
                              className="hover:bg-slate-850 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-mono text-cyan-300 font-medium">
                                {prod.codbarras}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {prod.nombreProducto}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                {prod.categoria} • {prod.marca}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-medium">
                                {formatCurrency(prod.precioCompra)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-300 font-medium">
                                {formatCurrency(prod.precioVenta)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnlinkProduct(prod.codbarras, prod.nombreProducto)
                                  }
                                  disabled={isPending}
                                  title="Desvincular de este proveedor"
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
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
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[42px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}