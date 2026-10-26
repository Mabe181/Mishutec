import { useEffect } from "react";
import { SaleDetail } from "@/types/sales";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  X,
  FileText,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShieldCheck,
} from "lucide-react";

interface SaleDetailModalProps {
  detail: SaleDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function SaleDetailModal({ detail, loading, onClose }: SaleDetailModalProps) {
  // Manejo de tecla Escape y bloqueo de scroll
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Cabecera Fija */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="sale-detail-title"
                  className="text-base sm:text-lg font-bold text-white truncate font-mono"
                >
                  {detail ? detail.numeroComprobante : "Cargando Venta..."}
                </h2>
                {detail && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0 ${
                      detail.tipoComprobante === "Factura"
                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {detail.tipoComprobante}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {detail ? `Emisión: ${formatDate(detail.fecha)} &bull; ID Venta: #${detail.idVenta}` : "Consultando SQL Server..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo con Scroll Interno */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="animate-spin h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3" />
              Recuperando trazabilidad y desglose en SQL Server...
            </div>
          ) : !detail ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              No se pudo cargar la información del comprobante solicitado.
            </div>
          ) : (
            <>
              {/* Información de Participantes (Cliente y Empleado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Cliente Receptor
                  </span>
                  <div className="font-semibold text-white mt-1">
                    {detail.clienteNombre}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    DNI: {detail.dniCliente}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5 truncate">
                    {detail.clienteCorreo}
                    {detail.clienteTelefono && ` &bull; ${detail.clienteTelefono}`}
                  </div>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2.5 sm:pt-0 sm:pl-3.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Operador / Empleado
                  </span>
                  <div className="font-semibold text-white mt-1">
                    {detail.empleadoNombre}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    ID Empleado: #{detail.idEmpleado}
                  </div>
                  <div className="text-emerald-400 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Transacción Autorizada</span>
                  </div>
                </div>
              </div>

              {/* Detalle de Productos Vendidos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-cyan-400" />
                    Líneas de Detalle (dbo.Detalle_Venta)
                  </span>
                  <span className="text-slate-400 font-mono">
                    {detail.detalles.length} {detail.detalles.length === 1 ? "producto" : "productos"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-medium">
                          <th className="py-2.5 px-3">Producto</th>
                          <th className="py-2.5 px-3 text-center">Cant.</th>
                          <th className="py-2.5 px-3 text-right">P. Unit.</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {detail.detalles.map((d) => (
                          <tr key={d.idDetalle} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-white block">
                                {d.nombreProducto}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Cód: {d.codbarras} &bull; {d.categoria}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-semibold">
                              {d.cantidad}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                              {formatCurrency(d.precioUnitario)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-300">
                              {formatCurrency(d.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Métodos de Pago Aplicados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                    Desglose de Pago (dbo.Venta_Metodo_Pago)
                  </span>
                  <span className="text-slate-400 font-mono">
                    {detail.pagos.length} {detail.pagos.length === 1 ? "método" : "métodos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detail.pagos.map((p) => (
                    <div
                      key={p.idMetodo}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="font-medium text-slate-200">
                          {p.nombreMetodo}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(p.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel de Conciliación Transaccional */}
              <div
                className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                  detail.isReconciled
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    {detail.isReconciled ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>
                      {detail.isReconciled
                        ? "Conciliación Transaccional Validada (3/3 Componentes)"
                        : "Discrepancia en Conciliación Transaccional"}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-white">
                    Total: {formatCurrency(detail.total)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cabecera (Venta)</span>
                    <span className="text-white font-bold">{formatCurrency(detail.total)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Líneas (Detalle)</span>
                    <span className="text-cyan-300 font-bold">{formatCurrency(detail.sumDetalles)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pagos (VMP)</span>
                    <span className="text-emerald-300 font-bold">{formatCurrency(detail.sumPagos)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pie Fijo con Botón de Cierre */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
