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
          className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 shadow-xs ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1 text-slate-500"
          >
            ×
          </button>
        </div>
      )}

      {/* Tarjetas KPI Mobile-First (2 columnas en móvil, 4 en desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Total Clientes */}
        <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Total Clientes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {stats.totalClients}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Registrados en BD
          </p>
        </div>

        {/* KPI 2: Clientes Recurrentes (definido como >= 2 compras) */}
        <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Recurrentes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            {stats.recurringClients}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Con ≥ 2 compras
          </p>
        </div>

        {/* KPI 3: Consumo Acumulado */}
        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Consumo Acumulado</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(stats.totalSpent)}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            En {stats.totalPurchases} comprobantes emitidos
          </p>
        </div>

        {/* KPI 4: Sesión Administrativa */}
        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Sesión Admin</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{username || "admin"}</span>
              </>
            ) : (
              <span className="text-slate-500 font-normal text-xs">Solo lectura</span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            {isAuthenticated ? "Acceso de edición autorizado" : "Consulta pública"}
          </p>
        </div>
      </div>

      {/* Barra de Control: Búsqueda y Botón Registrar */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, nombre o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Vista Móvil (< 768px): Tarjetas Responsivas de Clientes */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-xs text-center text-slate-500 space-y-2">
            <Users className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs">No se encontraron clientes que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredClients.map((c) => (
            <div
              key={c.dni}
              className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-blue-200 transition-colors"
            >
              {/* Cabecera de Tarjeta: DNI y Nombre */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">
                      PE
                    </span>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {c.dni}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900">
                    {c.nombre} {c.apellido}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 ${
                    c.totalVentas > 0
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {c.totalVentas} {c.totalVentas === 1 ? "compra" : "compras"}
                </span>
              </div>

              {/* Cuerpo: Contacto */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.correo}</span>
                </div>
                {c.telefono ? (
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{c.telefono}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic block">
                    Sin teléfono registrado
                  </span>
                )}
              </div>

              {/* Pie: Consumo Total y Botones Táctiles */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 block">Consumo Total</span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {formatCurrency(c.montoTotalComprado)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(c.dni)}
                    className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold border border-slate-200 hover:border-blue-300 shadow-xs transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Ver Ficha</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xs transition-colors"
                    title="Editar Cliente"
                    aria-label={`Editar cliente ${c.nombre}`}
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista Escritorio (>= 768px): Tabla Completa */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-center">Compras</th>
                <th className="py-3.5 px-4 text-right">Consumo Total</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* DNI */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                          PE
                        </span>
                        <span className="text-blue-600">{c.dni}</span>
                      </div>
                    </td>

                    {/* Nombre y Apellido */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {c.nombre} {c.apellido}
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{c.correo}</span>
                      </div>
                      {c.telefono ? (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{c.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Sin teléfono
                        </span>
                      )}
                    </td>

                    {/* Compras */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                          c.totalVentas > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {c.totalVentas} {c.totalVentas === 1 ? "compra" : "compras"}
                      </span>
                    </td>

                    {/* Consumo Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(c.montoTotalComprado)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c.dni)}
                          title="Ver Ficha y Comprobantes"
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 shadow-xs transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Editar Datos"
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-xs transition-colors"
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