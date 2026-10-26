"use client";

import { useState, useTransition, useEffect } from "react";
import { ProductDetail, ProductFilterMetadata } from "@/types/product";
import { updateProductAction } from "@/lib/actions/product.actions";
import {
  X,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Cpu,
  MemoryStick,
  HardDrive,
  Layers,
  Zap,
  Box,
  Building2,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";

interface ProductEditModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  metadata: ProductFilterMetadata;
  isAuthenticated: boolean;
  onRequestLogin: () => void;
  onProductUpdated: (codbarras: string) => void;
}

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  metadata,
  isAuthenticated,
  onRequestLogin,
  onProductUpdated,
}: ProductEditModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados locales inicializados con el producto seleccionado
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [garantiaMeses, setGarantiaMeses] = useState("36");
  const [idMarca, setIdMarca] = useState<number>(1);
  const [idEstado, setIdEstado] = useState<number>(1);

  // Specs
  const [cpuFreq, setCpuFreq] = useState("3.50");
  const [cpuCores, setCpuCores] = useState("6");
  const [ramCap, setRamCap] = useState("16");
  const [ramVel, setRamVel] = useState("3200");
  const [ssdCap, setSsdCap] = useState("1000");
  const [ssdInterfaz, setSsdInterfaz] = useState("NVMe PCIe 4.0");
  const [gpuVram, setGpuVram] = useState("8");
  const [gpuChipset, setGpuChipset] = useState("GeForce RTX 4060");
  const [psuWatts, setPsuWatts] = useState("650");
  const [psuCert, setPsuCert] = useState("80 Plus Bronze");
  const [caseFormat, setCaseFormat] = useState("Micro-ATX");
  const [caseMaterial, setCaseMaterial] = useState("Acero y vidrio");

  // Proveedores
  const [selectedSuppliers, setSelectedSuppliers] = useState<
    { idProveedor: number; precioCompra: string }[]
  >([]);

  useEffect(() => {
    if (product && isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setNombre(product.nombre);
      setPrecio(String(product.precio));
      setGarantiaMeses(String(product.garantiaMeses));
      setIdMarca(product.idMarca);
      setIdEstado(product.idEstado);

      // Specs
      if (product.specs.cpu) {
        setCpuFreq(String(product.specs.cpu.frecuenciaGhz));
        setCpuCores(String(product.specs.cpu.nucleos));
      }
      if (product.specs.ram) {
        setRamCap(String(product.specs.ram.capacidadGb));
        setRamVel(String(product.specs.ram.velocidadMhz));
      }
      if (product.specs.ssd) {
        setSsdCap(String(product.specs.ssd.capacidadGb));
        setSsdInterfaz(product.specs.ssd.interfaz);
      }
      if (product.specs.grafica) {
        setGpuVram(String(product.specs.grafica.vramGb));
        setGpuChipset(product.specs.grafica.chipset);
      }
      if (product.specs.fuentePoder) {
        setPsuWatts(String(product.specs.fuentePoder.potenciaW));
        setPsuCert(product.specs.fuentePoder.certificacion);
      }
      if (product.specs.gabinete) {
        setCaseFormat(product.specs.gabinete.formato);
        setCaseMaterial(product.specs.gabinete.material);
      }

      // Proveedores
      setSelectedSuppliers(
        product.proveedores.map((p) => ({
          idProveedor: p.idProveedor,
          precioCompra: p.precioCompra !== null ? String(p.precioCompra) : "",
        }))
      );
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleAddSupplier = () => {
    if (metadata.proveedoresDisponibles.length === 0) return;
    const defaultProv = metadata.proveedoresDisponibles[0].id;
    if (selectedSuppliers.some((s) => s.idProveedor === defaultProv)) return;
    setSelectedSuppliers([
      ...selectedSuppliers,
      { idProveedor: defaultProv, precioCompra: "" },
    ]);
  };

  const handleRemoveSupplier = (index: number) => {
    setSelectedSuppliers(selectedSuppliers.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isAuthenticated) {
      onRequestLogin();
      return;
    }

    const parseCleanFloat = (val: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(",", ".").trim());
    };

    startTransition(async () => {
      try {
        const payload: any = {
          codbarras: product.codbarras,
          nombre: nombre.trim(),
          precio: parseCleanFloat(precio),
          garantiaMeses: parseInt(garantiaMeses, 10),
          idMarca,
          idEstado,
          specs: {},
          proveedores: selectedSuppliers
            .filter((s) => s.idProveedor && parseCleanFloat(s.precioCompra) > 0)
            .map((s) => ({
              idProveedor: s.idProveedor,
              precioCompra: parseCleanFloat(s.precioCompra),
            })),
        };

        if (product.categoria === "CPU") {
          payload.specs.cpu = {
            frecuenciaGhz: parseCleanFloat(cpuFreq),
            nucleos: parseInt(cpuCores, 10),
          };
        } else if (product.categoria === "RAM") {
          payload.specs.ram = {
            capacidadGb: parseInt(ramCap, 10),
            velocidadMhz: parseInt(ramVel, 10),
          };
        } else if (product.categoria === "SSD") {
          payload.specs.ssd = {
            capacidadGb: parseInt(ssdCap, 10),
            interfaz: ssdInterfaz.trim(),
          };
        } else if (product.categoria === "Grafica") {
          payload.specs.grafica = {
            vramGb: parseInt(gpuVram, 10),
            chipset: gpuChipset.trim(),
          };
        } else if (product.categoria === "Fuente de poder") {
          payload.specs.fuentePoder = {
            potenciaW: parseInt(psuWatts, 10),
            certificacion: psuCert.trim(),
          };
        } else if (product.categoria === "Gabinete") {
          payload.specs.gabinete = {
            formato: caseFormat.trim(),
            material: caseMaterial.trim(),
          };
        }

        const res = await updateProductAction(payload);
        if (res.success) {
          setSuccessMsg(res.message || "Producto actualizado exitosamente.");
          setTimeout(() => {
            onProductUpdated(product.codbarras);
            onClose();
          }, 1000);
        } else {
          setErrorMsg(res.error || "Ocurrió un error al actualizar.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error inesperado al conectar con el servidor.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Editar Producto
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Código: {product.codbarras} | {product.categoria}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Campos Protegidos Inmutables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" /> Código (PK Inmutable)
              </span>
              <p className="font-mono text-cyan-300 font-bold text-xs mt-1">
                {product.codbarras}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" /> Categoría Vinculada
              </span>
              <p className="font-semibold text-white text-xs mt-1">
                {product.categoria}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-400" /> Stock Actual
              </span>
              <p className="font-mono text-slate-300 text-xs mt-1">
                {product.stock} un. (Módulo Inventario)
              </p>
            </div>
          </div>

          {/* Nombre y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre del Componente *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Precio Venta (S/.) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min={0.01}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Marca, Estado y Garantía */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Marca *</label>
              <select
                value={idMarca}
                onChange={(e) => setIdMarca(parseInt(e.target.value, 10))}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {metadata.marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estado Operativo *</label>
              <select
                value={idEstado}
                onChange={(e) => setIdEstado(parseInt(e.target.value, 10))}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {metadata.estados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Garantía (meses) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={garantiaMeses}
                onChange={(e) => setGarantiaMeses(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-cyan-300 block">
              Características Técnicas ({product.categoria})
            </span>

            {product.categoria === "CPU" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Frecuencia (GHz)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cpuFreq}
                    onChange={(e) => setCpuFreq(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Número de Núcleos</label>
                  <input
                    type="number"
                    required
                    value={cpuCores}
                    onChange={(e) => setCpuCores(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {product.categoria === "RAM" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Capacidad (GB)</label>
                  <input
                    type="number"
                    required
                    value={ramCap}
                    onChange={(e) => setRamCap(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Velocidad (MHz)</label>
                  <input
                    type="number"
                    required
                    value={ramVel}
                    onChange={(e) => setRamVel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {product.categoria === "SSD" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Capacidad (GB)</label>
                  <input
                    type="number"
                    required
                    value={ssdCap}
                    onChange={(e) => setSsdCap(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Interfaz (Máx. 20 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={ssdInterfaz}
                    onChange={(e) => setSsdInterfaz(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {product.categoria === "Grafica" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">VRAM (GB)</label>
                  <input
                    type="number"
                    required
                    value={gpuVram}
                    onChange={(e) => setGpuVram(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Chipset (Máx. 50 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={gpuChipset}
                    onChange={(e) => setGpuChipset(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {product.categoria === "Fuente de poder" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Potencia (Watts)</label>
                  <input
                    type="number"
                    required
                    value={psuWatts}
                    onChange={(e) => setPsuWatts(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Certificación (Máx. 30 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={psuCert}
                    onChange={(e) => setPsuCert(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {product.categoria === "Gabinete" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Formato (Máx. 20 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={caseFormat}
                    onChange={(e) => setCaseFormat(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Material (Máx. 30 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={caseMaterial}
                    onChange={(e) => setCaseMaterial(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Proveedores */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>Proveedores Asociados</span>
              </label>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
              >
                <Plus className="h-3 w-3" />
                Agregar Proveedor
              </button>
            </div>

            {selectedSuppliers.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                Sin proveedores asignados.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSuppliers.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <select
                      value={s.idProveedor}
                      onChange={(e) => {
                        const newId = parseInt(e.target.value, 10);
                        const updated = [...selectedSuppliers];
                        updated[idx].idProveedor = newId;
                        setSelectedSuppliers(updated);
                      }}
                      className="flex-1 h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      {metadata.proveedoresDisponibles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      placeholder="Costo compra"
                      value={s.precioCompra}
                      onChange={(e) => {
                        const updated = [...selectedSuppliers];
                        updated[idx].precioCompra = e.target.value;
                        setSelectedSuppliers(updated);
                      }}
                      className="w-32 h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSupplier(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando Cambios en SQL Server...</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Actualizar Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
