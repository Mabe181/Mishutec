"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClientListItem, ClientDetail } from "@/types/entities";
import { formatCurrency } from "@/lib/formatters";
import { ClientModal } from "./ClientModal";
import { ClientDetailModal } from "./ClientDetailModal";
import { LoginModal } from "@/components/auth/LoginModal";
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Edit,
  ShoppingBag,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ClientListClientProps {
  initialClients: ClientListItem[];
  isAuthenticated: boolean;
  username: string | null;
}

export function ClientListClient({
  initialClients,
  isAuthenticated,
  username,
}: ClientListClientProps) {
  const router = useRouter();

  // Búsqueda y filtrado
  const [search, setSearch] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(null);
  const [selectedDniForDetail, setSelectedDniForDetail] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Notificaciones
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filtrado de clientes
  const filteredClients = useMemo(() => {
    if (!search.trim()) return initialClients;
    const term = search.toLowerCase().trim();
    return initialClients.filter(
      (c) =>
        c.dni.toLowerCase().includes(term) ||
        c.nombre.toLowerCase().includes(term) ||
        c.apellido.toLowerCase().includes(term) ||
        c.correo.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.toLowerCase().includes(term))
    );
  }, [initialClients, search]);

  // Métricas agregadas
  const stats = useMemo(() => {
    const totalClients = initialClients.length;
    // Clientes recurrentes: estrictamente 2 o más compras según definición comercial
    const recurringClients = initialClients.filter((c) => c.totalVentas >= 2).length;
    const totalSpent = initialClients.reduce((acc, c) => acc + c.montoTotalComprado, 0);
    const totalPurchases = initialClients.reduce((acc, c) => acc + c.totalVentas, 0);
    return {
      totalClients,
      recurringClients,
      totalSpent,
      totalPurchases,
    };
  }, [initialClients]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingClient(null);
    setIsCreateOpen(true);
  };

  const handleOpenDetail = (dni: string) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedDniForDetail(dni);
  };

  const handleOpenEdit = (client: ClientListItem) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingClient(client);
    setIsCreateOpen(true);
  };

  const handleDetailEdit = (detail: ClientDetail) => {
    setSelectedDniForDetail(null);
    handleOpenEdit(detail);
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
        {/* KPI 1: Total Clientes */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Total Clientes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
            {stats.totalClients}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Registrados en BD
          </p>
        </div>

        {/* KPI 2: Clientes Recurrentes (definido como >= 2 compras) */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Recurrentes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {stats.recurringClients}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Con ≥ 2 compras
          </p>
        </div>

        {/* KPI 3: Consumo Acumulado (ocupa ancho completo en móvil para legibilidad de moneda) */}
        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Consumo Acumulado</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(stats.totalSpent)}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            En {stats.totalPurchases} comprobantes emitidos
          </p>
        </div>

        {/* KPI 4: Sesión Administrativa */}
        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
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
            placeholder="Buscar por DNI, nombre o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Vista Móvil (< 768px): Tarjetas Responsivas de Clientes */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 space-y-2">
            <Users className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs">No se encontraron clientes que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredClients.map((c) => (
            <div
              key={c.dni}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
            >
              {/* Cabecera de Tarjeta: DNI y Nombre */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                      PE
                    </span>
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {c.dni}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-white">
                    {c.nombre} {c.apellido}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shrink-0 ${
                    c.totalVentas > 0
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {c.totalVentas} {c.totalVentas === 1 ? "compra" : "compras"}
                </span>
              </div>

              {/* Cuerpo: Contacto */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{c.correo}</span>
                </div>
                {c.telefono ? (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{c.telefono}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 italic block">
                    Sin teléfono registrado
                  </span>
                )}
              </div>

              {/* Pie: Consumo Total y Botones Táctiles */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 block">Consumo Total</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    {formatCurrency(c.montoTotalComprado)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(c.dni)}
                    className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Ver Ficha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    title="Editar Cliente"
                    aria-label={`Editar cliente ${c.nombre}`}
                  >
                    <Edit className="h-3.5 w-3.5 text-cyan-400" />
                  </button>
                </div>
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
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-center">Compras</th>
                <th className="py-3.5 px-4 text-right">Consumo Total</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <span>No se encontraron clientes que coincidan con la búsqueda.</span>
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr
                    key={c.dni}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* DNI */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                          PE
                        </span>
                        <span>{c.dni}</span>
                      </div>
                    </td>

                    {/* Nombre y Apellido */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {c.nombre} {c.apellido}
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{c.correo}</span>
                      </div>
                      {c.telefono ? (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{c.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">
                          Sin teléfono
                        </span>
                      )}
                    </td>

                    {/* Compras */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                          c.totalVentas > 0
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {c.totalVentas} {c.totalVentas === 1 ? "compra" : "compras"}
                      </span>
                    </td>

                    {/* Consumo Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(c.montoTotalComprado)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c.dni)}
                          title="Ver Ficha y Comprobantes"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Editar Datos"
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

      {/* Modal Crear / Editar Cliente */}
      <ClientModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        client={editingClient}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => setIsLoginOpen(true)}
        onSuccess={(msg) => {
          showNotification("success", msg);
          router.refresh();
        }}
      />

      {/* Modal Ficha del Cliente */}
      <ClientDetailModal
        isOpen={!!selectedDniForDetail}
        onClose={() => setSelectedDniForDetail(null)}
        dni={selectedDniForDetail}
        onEdit={handleDetailEdit}
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