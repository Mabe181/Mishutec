"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SupplierListItem, SupplierDetail } from "@/types/entities";
import { SupplierModal } from "./SupplierModal";
import { SupplierDetailModal } from "./SupplierDetailModal";
import { LoginModal } from "@/components/auth/LoginModal";
import {
  Building2,
  Search,
  Plus,
  Package,
  Edit,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";

interface SupplierListClientProps {
  initialSuppliers: SupplierListItem[];
  isAuthenticated: boolean;
  username: string | null;
}

export function SupplierListClient({
  initialSuppliers,
  isAuthenticated,
  username,
}: SupplierListClientProps) {
  const router = useRouter();

  // Búsqueda y filtrado
  const [search, setSearch] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierListItem | null>(null);
  const [selectedSupplierIdForDetail, setSelectedSupplierIdForDetail] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Notificaciones
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filtrado de proveedores
  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return initialSuppliers;
    const term = search.toLowerCase().trim();
    return initialSuppliers.filter(
      (s) =>
        s.nombre.toLowerCase().includes(term) ||
        s.correo.toLowerCase().includes(term) ||
        s.telefono.toLowerCase().includes(term) ||
        s.idProveedor.toString().includes(term)
    );
  }, [initialSuppliers, search]);

  // Métricas agregadas
  const stats = useMemo(() => {
    const totalSuppliers = initialSuppliers.length;
    const totalSupplied = initialSuppliers.reduce(
      (acc, s) => acc + s.totalProductosSuministrados,
      0
    );
    const avgSupplied =
      totalSuppliers > 0 ? (totalSupplied / totalSuppliers).toFixed(1) : "0.0";
    return {
      totalSuppliers,
      totalSupplied,
      avgSupplied,
    };
  }, [initialSuppliers]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingSupplier(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (supplier: SupplierListItem) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingSupplier(supplier);
    setIsCreateOpen(true);
  };

  const handleDetailEdit = (detail: SupplierDetail) => {
    setSelectedSupplierIdForDetail(null);
    handleOpenEdit({
      idProveedor: detail.idProveedor,
      nombre: detail.nombre,
      correo: detail.correo,
      telefono: detail.telefono,
      totalProductosSuministrados: detail.totalProductosSuministrados,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner de Notificación */}
      {notification && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Tarjetas KPI Mobile-First (2 columnas en móvil, 4 en desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Total Proveedores */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Total Proveedores</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
            {stats.totalSuppliers}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Registrados en BD
          </p>
        </div>

        {/* KPI 2: Líneas Suministradas */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Líneas Suministradas</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {stats.totalSupplied}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            En dbo.Suministra
          </p>
        </div>

        {/* KPI 3: Promedio de Productos */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Promedio Catálogo</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {stats.avgSupplied}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Componentes / proveedor
          </p>
        </div>

        {/* KPI 4: Sesión Administrativa */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Sesión Admin</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{username || "admin"}</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal text-xs">Solo lectura</span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            {isAuthenticated ? "Acceso de edición autorizado" : "Consulta pública"}
          </p>
        </div>
      </div>

      {/* Barra de Control: Búsqueda y Botón Registrar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proveedor por nombre, correo o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* Vista Móvil (< 768px): Tarjetas Responsivas de Proveedores */}
      <div className="md:hidden space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 space-y-2">
            <Building2 className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs">No se encontraron proveedores que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredSuppliers.map((s) => (
            <div
              key={s.idProveedor}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
            >
              {/* Cabecera de Tarjeta: ID y Nombre */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                    #{s.idProveedor}
                  </span>
                  <h3 className="font-semibold text-sm text-white">
                    {s.nombre}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shrink-0 ${
                    s.totalProductosSuministrados > 0
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {s.totalProductosSuministrados}{" "}
                  {s.totalProductosSuministrados === 1 ? "prod." : "prods."}
                </span>
              </div>

              {/* Cuerpo: Contacto Comercial */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.correo}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{s.telefono}</span>
                </div>
              </div>

              {/* Pie: Acciones Táctiles */}
              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierIdForDetail(s.idProveedor)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Package className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ver Catálogo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Editar Proveedor"
                  aria-label={`Editar proveedor ${s.nombre}`}
                >
                  <Edit className="h-3.5 w-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista Escritorio (>= 768px): Tabla Completa */}
      <div className="hidden md:block rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Razón Social / Proveedor</th>
                <th className="py-3.5 px-4">Contacto Comercial</th>
                <th className="py-3.5 px-4 text-center">Catálogo Suministrado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <span>No se encontraron proveedores que coincidan con la búsqueda.</span>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.idProveedor}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        #{s.idProveedor}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {s.nombre}
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{s.correo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                        <span>{s.telefono}</span>
                      </div>
                    </td>

                    {/* Catálogo Suministrado */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                          s.totalProductosSuministrados > 0
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {s.totalProductosSuministrados}{" "}
                        {s.totalProductosSuministrados === 1 ? "componente" : "componentes"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierIdForDetail(s.idProveedor)}
                          title="Ver Ficha y Catálogo Suministrado"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                        >
                          <Package className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-[11px]">Ver Catálogo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          title="Editar Proveedor"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Proveedor */}
      <SupplierModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        supplier={editingSupplier}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => setIsLoginOpen(true)}
        onSuccess={(msg) => {
          showNotification("success", msg);
          router.refresh();
        }}
      />

      {/* Modal Ficha del Proveedor */}
      <SupplierDetailModal
        isOpen={!!selectedSupplierIdForDetail}
        onClose={() => setSelectedSupplierIdForDetail(null)}
        supplierId={selectedSupplierIdForDetail}
        onEdit={handleDetailEdit}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => setIsLoginOpen(true)}
        onSupplierUpdated={() => router.refresh()}
      />

      {/* Modal de Autenticación Requerida */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          router.refresh();
          showNotification("success", "Sesión administrativa iniciada correctamente.");
        }}
      />
    </div>
  );
}