"use client";

import { useEffect } from "react";
import { ProductDetail } from "@/types/product";
import { formatCurrency } from "@/lib/formatters";
import {
  X,
  Barcode,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  Cpu,
  HardDrive,
  Layers,
  Zap,
  Box,
  MemoryStick,
  Lock,
  Tag,
  Boxes,
  Edit3,
  Archive,
  ShieldAlert,
} from "lucide-react";

interface ProductDetailModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  onEdit?: (product: ProductDetail) => void;
  onDiscontinue?: (product: ProductDetail) => void;
  onRequestLogin?: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isAuthenticated = false,
  onEdit,
  onDiscontinue,
  onRequestLogin,
}: ProductDetailModalProps) {
  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir scroll en body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const isDiscontinued =
    product.estado.toLowerCase().includes("descontinuado") ||
    product.idEstado === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                <Tag className="h-3 w-3" />
                {product.categoria}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {product.marca}
              </span>

              {isDiscontinued ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Archive className="h-3 w-3" />
                  Descontinuado
                </span>
              ) : product.esAgotado ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <PackageX className="h-3 w-3" />
                  Agotado
                </span>
              ) : product.esStockBajo ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="h-3 w-3" />
                  Stock Bajo ({product.stock} un.)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  En Stock ({product.stock} un.)
                </span>
              )}
            </div>

            <h2
              id="modal-product-title"
              className="text-lg sm:text-xl font-bold text-white tracking-tight pt-1"
            >
              {product.nombre}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Barcode className="h-3.5 w-3.5 text-cyan-400" />
              <span>Código: {product.codbarras}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-6 text-xs">
          {/* Tarjetas de Datos Comerciales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Precio de Venta
              </span>
              <p className="text-base font-bold text-cyan-300 font-mono mt-0.5">
                {formatCurrency(product.precio)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Stock Actual
              </span>
              <p className="text-base font-bold text-white font-mono mt-0.5">
                {product.stock} <span className="text-xs font-normal text-slate-400">unidades</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Garantía
              </span>
              <p className="text-base font-bold text-white font-mono mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400 inline" />
                {product.garantiaMeses} <span className="text-xs font-normal text-slate-400">meses</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Estado Catálogo
              </span>
              <p className="text-xs font-semibold text-slate-200 mt-1 capitalize">
                {product.estado}
              </p>
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              {product.specs.cpu && <Cpu className="h-4 w-4 text-cyan-400" />}
              {product.specs.ram && <MemoryStick className="h-4 w-4 text-cyan-400" />}
              {product.specs.ssd && <HardDrive className="h-4 w-4 text-cyan-400" />}
              {product.specs.grafica && <Layers className="h-4 w-4 text-cyan-400" />}
              {product.specs.fuentePoder && <Zap className="h-4 w-4 text-cyan-400" />}
              {product.specs.gabinete && <Box className="h-4 w-4 text-cyan-400" />}
              <span>Ficha Técnica Especializada: {product.categoria}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 divide-y divide-slate-800/60">
              {product.specs.cpu && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Frecuencia Base / Turbo</span>
                    <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {product.specs.cpu.frecuenciaGhz.toFixed(2)} GHz
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Número de Núcleos</span>
                    <p className="text-sm font-semibold text-white font-mono mt-0.5">
                      {product.specs.cpu.nucleos} núcleos
                    </p>
                  </div>
                </div>
              )}

              {product.specs.ram && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Capacidad Total</span>
                    <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {product.specs.ram.capacidadGb} GB
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Velocidad de Frecuencia</span>
                    <p className="text-sm font-semibold text-white font-mono mt-0.5">
                      {product.specs.ram.velocidadMhz} MHz
                    </p>
                  </div>
                </div>
              )}

              {product.specs.ssd && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Capacidad de Almacenamiento</span>
                    <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {product.specs.ssd.capacidadGb >= 1000
                        ? `${product.specs.ssd.capacidadGb / 1000} TB (${product.specs.ssd.capacidadGb} GB)`
                        : `${product.specs.ssd.capacidadGb} GB`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Tipo de Interfaz</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {product.specs.ssd.interfaz}
                    </p>
                  </div>
                </div>
              )}

              {product.specs.grafica && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Memoria de Video (VRAM)</span>
                    <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {product.specs.grafica.vramGb} GB
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Chipset Gráfico</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {product.specs.grafica.chipset}
                    </p>
                  </div>
                </div>
              )}

              {product.specs.fuentePoder && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Potencia Nominal</span>
                    <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                      {product.specs.fuentePoder.potenciaW} W
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Certificación de Eficiencia</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {product.specs.fuentePoder.certificacion}
                    </p>
                  </div>
                </div>
              )}

              {product.specs.gabinete && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Factor de Forma / Formato</span>
                    <p className="text-sm font-semibold text-cyan-300 mt-0.5">
                      {product.specs.gabinete.formato}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Material de Construcción</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {product.specs.gabinete.material}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proveedores Asociados */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>Proveedores Vinculados ({product.proveedores.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                dbo.Suministra
              </span>
            </div>

            {product.proveedores.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-1">
                <Boxes className="h-5 w-5 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">
                  Sin proveedor directo registrado
                </p>
                <p className="text-[11px] text-slate-400">
                  Este componente no tiene ningún registro asociado en la tabla <code className="text-slate-400">dbo.Suministra</code>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {product.proveedores.map((sup) => (
                  <div
                    key={sup.idProveedor}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200 text-xs">
                          {sup.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: #{sup.idProveedor}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                        {sup.correo && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-500" />
                            {sup.correo}
                          </span>
                        )}
                        {sup.telefono && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-500" />
                            {sup.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-3">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        Costo Compra
                      </span>
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        {sup.precioCompra !== null
                          ? formatCurrency(sup.precioCompra)
                          : "No registrado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal: Acciones Transaccionales y Auditoría */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(product);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Editar Ficha
              </button>
            )}

            {onDiscontinue && !isDiscontinued && (
              <button
                type="button"
                onClick={() => {
                  onDiscontinue(product);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors"
              >
                <Archive className="h-3.5 w-3.5" />
                Descontinuar
              </button>
            )}

            {!isAuthenticated && (
              <span className="text-[10px] text-slate-500 hidden sm:inline ml-1">
                (Requiere auth)
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
