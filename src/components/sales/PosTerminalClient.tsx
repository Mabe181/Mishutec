"use client";

import { useState, useMemo } from "react";
import {
  PosProductItem,
  PosCartItem,
  PosPaymentAllocation,
  SalesFilterMetadata,
} from "@/types/sales";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { createSaleAction } from "@/lib/actions/sale.actions";
import { TransactionalSaleResult } from "@/lib/repositories/sale-transaction.repository";
import { PosReceiptModal } from "./PosReceiptModal";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CreditCard,
  User,
  ShieldCheck,
  Receipt,
  FileText,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface PosTerminalClientProps {
  initialProducts: PosProductItem[];
  metadata: SalesFilterMetadata;
  isAuthenticated: boolean;
  username: string | null;
}

export function PosTerminalClient({
  initialProducts,
  metadata,
  isAuthenticated,
  username,
}: PosTerminalClientProps) {
  // Catálogo y Búsqueda
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");

  // Carrito de compras
  const [cart, setCart] = useState<PosCartItem[]>([]);

  // Datos de la transacción
  const [selectedClientDni, setSelectedClientDni] = useState(
    metadata.clientes[0]?.dni || ""
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(
    metadata.empleados[0]?.id || 1
  );
  const [selectedTipoCompId, setSelectedTipoCompId] = useState<1 | 2>(1); // 1 = Boleta, 2 = Factura

  // Pagos múltiples
  const [payments, setPayments] = useState<PosPaymentAllocation[]>([
    { idMetodo: 1, nombreMetodo: "Efectivo", monto: 0 },
  ]);

  // Estados de Transacción Fase 6B
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<TransactionalSaleResult | null>(null);
  const [clientAttemptId, setClientAttemptId] = useState<string>(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "req-" + Date.now();
  });

  // Categorías únicas para filtro rápido
  const categories = useMemo(() => {
    const set = new Set(initialProducts.map((p) => p.categoria));
    return Array.from(set);
  }, [initialProducts]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchQuery =
        !productSearch.trim() ||
        p.nombre.toLowerCase().includes(productSearch.toLowerCase().trim()) ||
        p.codbarras.includes(productSearch.trim()) ||
        p.marca.toLowerCase().includes(productSearch.toLowerCase().trim());

      const matchCat =
        selectedCategory === "todas" || p.categoria === selectedCategory;

      return matchQuery && matchCat;
    });
  }, [initialProducts, productSearch, selectedCategory]);

  // Totales del carrito
  const totalGeneral = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.cantidad, 0);
  }, [cart]);

  // Total de pagos asignados
  const totalPagado = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.monto || 0), 0);
  }, [payments]);

  const diferenciaPagos = totalGeneral - totalPagado;

  // Añadir producto al carrito (con consolidación estricta por código de barras)
  const handleAddToCart = (product: PosProductItem) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.producto.codbarras === product.codbarras
      );

      if (existingIndex >= 0) {
        const currentItem = prev[existingIndex];
        const newQty = currentItem.cantidad + 1;

        // Validar límite contra stock real
        if (newQty > product.stock) {
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...currentItem,
          cantidad: newQty,
          subtotal: Number((newQty * product.precio).toFixed(2)),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            producto: product,
            cantidad: 1,
            precioUnitario: product.precio,
            subtotal: product.precio,
          },
        ];
      }
    });
  };

  // Actualizar cantidad de un ítem en el carrito
  const handleUpdateQuantity = (codbarras: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(codbarras);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.producto.codbarras !== codbarras) return item;
        const boundedQty = Math.min(newQty, item.producto.stock);
        return {
          ...item,
          cantidad: boundedQty,
          subtotal: Number((boundedQty * item.precioUnitario).toFixed(2)),
        };
      })
    );
  };

  // Quitar ítem del carrito
  const handleRemoveFromCart = (codbarras: string) => {
    setCart((prev) =>
      prev.filter((item) => item.producto.codbarras !== codbarras)
    );
  };

  // Limpiar carrito
  const handleClearCart = () => {
    setCart([]);
    setPayments([{ idMetodo: 1, nombreMetodo: "Efectivo", monto: 0 }]);
  };

  // Auto-llenar monto de pago con el total
  const handleAutoFillPayment = (index: number) => {
    const restante = Math.max(0, totalGeneral - totalPagado + (payments[index].monto || 0));
    setPayments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], monto: Number(restante.toFixed(2)) };
      return updated;
    });
  };

  // Añadir un nuevo método de pago (con consolidación de métodos repetidos)
  const handleAddPaymentMethod = (idMetodo: number) => {
    const metodoInfo = metadata.metodosPago.find((m) => m.id === idMetodo);
    if (!metodoInfo) return;

    // Verificar si ya existe para consolidar en lugar de duplicar PK
    const existingIndex = payments.findIndex((p) => p.idMetodo === idMetodo);
    if (existingIndex >= 0) {
      // Ya existe en la distribución
      return;
    }

    const restante = Math.max(0, totalGeneral - totalPagado);
    setPayments((prev) => [
      ...prev,
      {
        idMetodo,
        nombreMetodo: metodoInfo.nombre,
        monto: Number(restante.toFixed(2)),
      },
    ]);
  };

  // Modificar monto de un método de pago
  const handlePaymentAmountChange = (index: number, monto: number) => {
    setPayments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], monto: Math.max(0, monto) };
      return updated;
    });
  };

  // Quitar método de pago
  const handleRemovePaymentMethod = (index: number) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  // Ejecutar venta transaccional en SQL Server
  const handleExecuteSale = async () => {
    if (isSubmitting) return;

    if (cart.length === 0) {
      setSubmitError("El carrito de compras no puede estar vacío.");
      return;
    }

    if (Math.abs(diferenciaPagos) >= 0.01) {
      setSubmitError(
        `Los pagos asignados (${formatCurrency(totalPagado)}) no coinciden exactamente con el total (${formatCurrency(totalGeneral)}).`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = {
        dniCliente: selectedClientDni,
        idEmpleado: selectedEmployeeId,
        idTipoComp: selectedTipoCompId,
        items: cart.map((item) => ({
          codbarras: item.producto.codbarras,
          cantidad: item.cantidad,
        })),
        payments: payments.map((p) => ({
          idMetodo: p.idMetodo,
          monto: p.monto,
        })),
        clientRequestId: clientAttemptId,
      };

      const result = await createSaleAction(payload);

      if (!result.success || !result.data) {
        setSubmitError(result.error || "Ocurrió un error al procesar la venta.");
        setIsSubmitting(false);
        return;
      }

      // Éxito: abrir comprobante comercial
      setCompletedSale(result.data);
      setShowConfirmModal(false);
      handleClearCart();

      // Generar nuevo attempt id para la próxima transacción
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        setClientAttemptId(crypto.randomUUID());
      } else {
        setClientAttemptId("req-" + Date.now());
      }
    } catch (err: any) {
      setSubmitError(
        err?.message || "Error inesperado de comunicación con el servidor al registrar la venta."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Banner Informativo Fase 6B */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 shadow-md">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-cyan-300 block text-sm">
              Terminal POS Transaccional Activo (Fase 6B)
            </span>
            <p className="text-cyan-200/90 leading-relaxed">
              Sistema operativo conectado a <code>MishutecT2_Aceptacion</code>. Cada venta se procesa en una transacción
              atómica (ACID con bloqueo concurrente <code>sp_getapplock</code>): emite correlativos secuenciales (Boleta B001 / Factura F001),
              valida reglas de negocio, descuenta el stock real y registra las salidas correspondientes en <code>Mov_Inventario</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Principal: 2 Columnas en Escritorio (Catálogo Izquierda, Carrito/Checkout Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna Izquierda: Buscador y Catálogo de Productos (7 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Catálogo Disponible para Venta
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredProducts.length} productos con stock
              </span>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Escanear código de barras o escribir nombre del componente..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Categorías Rápidas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("todas")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  selectedCategory === "todas"
                    ? "bg-cyan-500 text-slate-950 font-semibold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? "bg-cyan-500 text-slate-950 font-semibold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-900/30 rounded-2xl border border-slate-800">
                No se encontraron productos disponibles con stock en este criterio.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const inCartItem = cart.find(
                  (c) => c.producto.codbarras === p.codbarras
                );
                const currentCartQty = inCartItem ? inCartItem.cantidad : 0;
                const remainingStock = p.stock - currentCartQty;

                return (
                  <div
                    key={p.codbarras}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-semibold text-white text-xs leading-tight line-clamp-2">
                          {p.nombre}
                        </span>
                        <span className="font-mono font-bold text-cyan-400 text-xs shrink-0">
                          {formatCurrency(p.precio)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>{p.codbarras}</span>
                        <span>&bull;</span>
                        <span>{p.marca}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          remainingStock > 2
                            ? "bg-slate-800 text-slate-300"
                            : remainingStock > 0
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        Stock: {remainingStock} ud.
                      </span>

                      <button
                        type="button"
                        disabled={remainingStock <= 0}
                        onClick={() => handleAddToCart(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 active:bg-cyan-500/40 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Carrito, Parámetros y Checkout (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-4">
            {/* Cabecera del Carrito */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Orden de Venta ({totalItemsCount} ítems)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Vaciar</span>
                </button>
              )}
            </div>

            {/* Lista de Ítems en Carrito */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  El carrito se encuentra vacío. Añada productos desde el catálogo para iniciar la orden.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.producto.codbarras}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate leading-tight">
                          {item.producto.nombre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatCurrency(item.precioUnitario)} c/u
                        </span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 shrink-0">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      {/* Control de Cantidades */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.producto.codbarras,
                              item.cantidad - 1
                            )
                          }
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono font-bold text-white px-2">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          disabled={item.cantidad >= item.producto.stock}
                          onClick={() =>
                            handleUpdateQuantity(
                              item.producto.codbarras,
                              item.cantidad + 1
                            )
                          }
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFromCart(item.producto.codbarras)
                        }
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar de la orden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Parámetros de la Transacción */}
            <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
              {/* Selector de Tipo de Comprobante */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Comprobante Legal a Emitir
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTipoCompId(1)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      selectedTipoCompId === 1
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Boleta (B001)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTipoCompId(2)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      selectedTipoCompId === 2
                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Factura (F001)</span>
                  </button>
                </div>
              </div>

              {/* Selector de Cliente */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Cliente Titular
                </label>
                <select
                  value={selectedClientDni}
                  onChange={(e) => setSelectedClientDni(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {metadata.clientes.map((c) => (
                    <option key={c.dni} value={c.dni}>
                      {c.nombreCompleto} (DNI: {c.dni})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Empleado */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Empleado Responsable
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {metadata.empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distribución de Métodos de Pago */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Distribución de Pago (Soporte Mixto)
                  </label>
                  {/* Selector rápido para añadir método */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddPaymentMethod(Number(e.target.value));
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="text-[10px] bg-slate-950 text-cyan-400 border border-slate-800 rounded px-1.5 py-0.5"
                  >
                    <option value="" disabled>
                      + Añadir método
                    </option>
                    {metadata.metodosPago.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  {payments.map((p, index) => (
                    <div
                      key={p.idMetodo}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-slate-300 text-xs w-24 truncate">
                        {p.nombreMetodo}
                      </span>
                      <div className="flex items-center gap-1.5 flex-1 justify-end">
                        <span className="text-slate-500 font-mono text-[10px]">S/.</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.monto || ""}
                          onChange={(e) =>
                            handlePaymentAmountChange(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-right font-mono font-bold text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoFillPayment(index)}
                          title="Asignar restante automáticamente"
                          className="px-1.5 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono transition-colors"
                        >
                          Auto
                        </button>
                        {payments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePaymentMethod(index)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Balance de Pagos */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total asignado a pagos:</span>
                  <span
                    className={`font-bold ${
                      Math.abs(diferenciaPagos) < 0.01
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {formatCurrency(totalPagado)}
                  </span>
                </div>
                {diferenciaPagos > 0.01 && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>Faltan asignar {formatCurrency(diferenciaPagos)} para cubrir la orden.</span>
                  </p>
                )}
                {diferenciaPagos < -0.01 && (
                  <p className="text-[11px] text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Exceso de pago (vuelto al cliente): {formatCurrency(Math.abs(diferenciaPagos))}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Resumen Total y Botón de Confirmación Fase 6B */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">
                  Total General a Pagar
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
                  {formatCurrency(totalGeneral)}
                </span>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Error al procesar la venta:</span>
                    <p className="mt-0.5 text-rose-200/90">{submitError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="text-rose-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Botón de Confirmación Activo en Fase 6B */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setShowConfirmModal(true);
                  }}
                  disabled={
                    cart.length === 0 ||
                    totalGeneral <= 0 ||
                    Math.abs(diferenciaPagos) >= 0.01 ||
                    !selectedClientDni ||
                    !selectedEmployeeId ||
                    isSubmitting
                  }
                  className="w-full py-3.5 px-4 min-h-[46px] rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Procesando Transacción...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" />
                      <span>Confirmar Venta y Generar Comprobante</span>
                    </>
                  )}
                </button>
                <div className="text-[11px] text-center text-cyan-300/80 bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-2 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span>
                    Transacción atómica segura con bloqueo de correlativos y control de existencias.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pre-Confirmación de Venta */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirmar Transacción Comercial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revisa los datos antes de emitir el comprobante y descontar el inventario.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo con Scroll */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
              {/* Alerta de Transacción Real */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Esta acción registrará la venta en <strong>MishutecT2_Aceptacion</strong>, asignará un
                  número correlativo consecutivo e inmutable y descontará el stock físico de forma inmediata.
                </p>
              </div>

              {/* Datos de Comprobante, Cliente y Empleado */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Tipo de Comprobante</span>
                  <span className="text-white font-medium">
                    {selectedTipoCompId === 1 ? "Boleta de Venta (B001)" : "Factura Comercial (F001)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Operador / Empleado</span>
                  <span className="text-white font-medium">
                    {metadata.empleados.find((e) => e.id === selectedEmployeeId)?.nombreCompleto || `ID ${selectedEmployeeId}`}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-850">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente</span>
                  <span className="text-white font-medium">
                    {metadata.clientes.find((c) => c.dni === selectedClientDni)?.nombreCompleto || selectedClientDni} ({selectedClientDni})
                  </span>
                </div>
              </div>

              {/* Resumen de Artículos */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Artículos en Orden ({cart.length} productos, {totalItemsCount} unidades)
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.producto.codbarras}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-slate-200 truncate font-medium">{item.producto.nombre}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {item.cantidad} x {formatCurrency(item.precioUnitario)}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desglose de Pagos */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Métodos de Pago
                </span>
                <div className="space-y-1">
                  {payments.map((p) => (
                    <div
                      key={p.idMetodo}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300">{p.nombreMetodo}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(p.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Final */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                <span className="font-bold text-white text-sm">Total Liquidado</span>
                <span className="font-mono font-bold text-cyan-400 text-lg sm:text-xl">
                  {formatCurrency(totalGeneral)}
                </span>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Footer Modal Acciones */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Volver y Modificar
              </button>
              <button
                type="button"
                onClick={handleExecuteSale}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>Confirmar Transacción</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante Comercial de Venta Emitida */}
      {completedSale && (
        <PosReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
}
