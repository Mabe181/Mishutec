"use client";

import { useState, useTransition, useEffect } from "react";
import { ProductFilterMetadata } from "@/types/product";
import { createProductAction } from "@/lib/actions/product.actions";
import {
  X,
  PackagePlus,
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

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProductFilterMetadata;
  isAuthenticated: boolean;
  onRequestLogin: () => void;
  onProductCreated: (codbarras: string) => void;
}

export function ProductCreateModal({
  isOpen,
  onClose,
  metadata,
  isAuthenticated,
  onRequestLogin,
  onProductCreated,
}: ProductCreateModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos base
  const [codbarras, setCodbarras] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [garantiaMeses, setGarantiaMeses] = useState("36");
  const [idCategoria, setIdCategoria] = useState<number>(
    metadata.categorias[0]?.id || 1
  );
  const [idMarca, setIdMarca] = useState<number>(metadata.marcas[0]?.id || 1);
  const [idEstado, setIdEstado] = useState<number>(1);

  // Especificaciones técnicas según categoría
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

  // Nombre de la categoría seleccionada actualmente
  const selectedCatObj = metadata.categorias.find((c) => c.id === idCategoria);
  const categoryName = selectedCatObj ? selectedCatObj.nombre : "";

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleAddSupplier = () => {
    if (metadata.proveedoresDisponibles.length === 0) return;
    const defaultProv = metadata.proveedoresDisponibles[0].id;
    // Evitar agregar duplicados
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
          codbarras: codbarras.trim(),
          nombre: nombre.trim(),
          precio: parseCleanFloat(precio),
          garantiaMeses: parseInt(garantiaMeses, 10),
          idCategoria,
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

        // Construir specs según categoría
        if (categoryName === "CPU") {
          payload.specs.cpu = {
            frecuenciaGhz: parseCleanFloat(cpuFreq),
            nucleos: parseInt(cpuCores, 10),
          };
        } else if (categoryName === "RAM") {
          payload.specs.ram = {
            capacidadGb: parseInt(ramCap, 10),
            velocidadMhz: parseInt(ramVel, 10),
          };
        } else if (categoryName === "SSD") {
          payload.specs.ssd = {
            capacidadGb: parseInt(ssdCap, 10),
            interfaz: ssdInterfaz.trim(),
          };
        } else if (categoryName === "Grafica") {
          payload.specs.grafica = {
            vramGb: parseInt(gpuVram, 10),
            chipset: gpuChipset.trim(),
          };
        } else if (categoryName === "Fuente de poder") {
          payload.specs.fuentePoder = {
            potenciaW: parseInt(psuWatts, 10),
            certificacion: psuCert.trim(),
          };
        } else if (categoryName === "Gabinete") {
          payload.specs.gabinete = {
            formato: caseFormat.trim(),
            material: caseMaterial.trim(),
          };
        }

        const res = await createProductAction(payload);
        if (res.success) {
          setSuccessMsg(res.message || "Producto registrado exitosamente.");
          setTimeout(() => {
            onProductCreated(payload.codbarras);
            onClose();
          }, 1000);
        } else {
          setErrorMsg(res.error || "Ocurrió un error al registrar el producto.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error inesperado al conectar con el servidor.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Nuevo Producto
              </h2>
              <p className="text-xs text-slate-500">
                Alta transaccional con especialización técnica obligatoria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario con scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Fila 1: Código de barras y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Código de Barras (EAN / PK) *
              </label>
              <input
                type="text"
                required
                maxLength={13}
                value={codbarras}
                onChange={(e) => setCodbarras(e.target.value)}
                placeholder="7750000000011"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-blue-600 font-mono text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <span className="text-[10px] text-slate-400">Máx. 13 caracteres</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre del Componente *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. AMD Ryzen 5 5600X"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <span className="text-[10px] text-slate-400">Límite varchar(120)</span>
            </div>
          </div>

          {/* Fila 2: Categoría, Marca y Garantía */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Categoría *</label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(parseInt(e.target.value, 10))}
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
              >
                {metadata.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Marca *</label>
              <select
                value={idMarca}
                onChange={(e) => setIdMarca(parseInt(e.target.value, 10))}
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
              >
                {metadata.marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Garantía (meses) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={garantiaMeses}
                onChange={(e) => setGarantiaMeses(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Fila 3: Precio de venta y Aviso de Stock Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Precio de Venta (S/.) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min={0.01}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="450.00"
                className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <span className="font-semibold text-amber-900">Stock Inicial: 0 unidades (Estado: Agotado)</span>
              <p className="text-[10px] text-amber-700 mt-0.5">
                Por directriz de inventario, el producto se registra como &apos;Agotado&apos;. El stock y disponibilidad se habilitarán mediante entradas en Inventario.
              </p>
            </div>
          </div>

          {/* Sección Dinámica: Especificaciones Técnicas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              {categoryName === "CPU" && <Cpu className="h-4 w-4 text-blue-600" />}
              {categoryName === "RAM" && <MemoryStick className="h-4 w-4 text-blue-600" />}
              {categoryName === "SSD" && <HardDrive className="h-4 w-4 text-blue-600" />}
              {categoryName === "Grafica" && <Layers className="h-4 w-4 text-blue-600" />}
              {categoryName === "Fuente de poder" && <Zap className="h-4 w-4 text-blue-600" />}
              {categoryName === "Gabinete" && <Box className="h-4 w-4 text-blue-600" />}
              <span>Ficha Técnica Requerida: {categoryName}</span>
            </div>

            {categoryName === "CPU" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Frecuencia (GHz)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.5}
                    max={10.0}
                    value={cpuFreq}
                    onChange={(e) => setCpuFreq(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">decimal(4,2)</span>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Número de Núcleos</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={128}
                    value={cpuCores}
                    onChange={(e) => setCpuCores(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {categoryName === "RAM" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Capacidad (GB)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={256}
                    value={ramCap}
                    onChange={(e) => setRamCap(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Velocidad (MHz)</label>
                  <input
                    type="number"
                    required
                    min={800}
                    max={10000}
                    value={ramVel}
                    onChange={(e) => setRamVel(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {categoryName === "SSD" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Capacidad (GB)</label>
                  <input
                    type="number"
                    required
                    min={64}
                    max={16000}
                    value={ssdCap}
                    onChange={(e) => setSsdCap(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Interfaz (Máx. 20 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={ssdInterfaz}
                    onChange={(e) => setSsdInterfaz(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {categoryName === "Grafica" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">VRAM (GB)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={96}
                    value={gpuVram}
                    onChange={(e) => setGpuVram(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Chipset (Máx. 50 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={gpuChipset}
                    onChange={(e) => setGpuChipset(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {categoryName === "Fuente de poder" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Potencia (Watts)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={3000}
                    value={psuWatts}
                    onChange={(e) => setPsuWatts(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Certificación (Máx. 30 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={psuCert}
                    onChange={(e) => setPsuCert(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {categoryName === "Gabinete" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Formato (Máx. 20 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={caseFormat}
                    onChange={(e) => setCaseFormat(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Material (Máx. 30 car.)</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={caseMaterial}
                    onChange={(e) => setCaseMaterial(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sección: Proveedores Opcionales */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Asociación de Proveedores (Opcional)</span>
              </label>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
              >
                <Plus className="h-3 w-3" />
                Vincular Proveedor
              </button>
            </div>

            {selectedSuppliers.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">
                Sin proveedores asociados inicialmente.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSuppliers.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200"
                  >
                    <select
                      value={s.idProveedor}
                      onChange={(e) => {
                        const newId = parseInt(e.target.value, 10);
                        const updated = [...selectedSuppliers];
                        updated[idx].idProveedor = newId;
                        setSelectedSuppliers(updated);
                      }}
                      className="flex-1 h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-blue-500"
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
                      className="w-32 h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSupplier(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando Transacción SQL...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  <span>Guardar Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
