"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EmployeeListItem, EmployeeDetail } from "@/types/entities";
import { EmployeeModal } from "./EmployeeModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { LoginModal } from "@/components/auth/LoginModal";
import {
  UserCheck,
  Search,
  UserPlus,
  FileText,
  Edit,
  ShoppingBag,
  Boxes,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface EmployeeListClientProps {
  initialEmployees: EmployeeListItem[];
  isAuthenticated: boolean;
  username: string | null;
}

export function EmployeeListClient({
  initialEmployees,
  isAuthenticated,
  username,
}: EmployeeListClientProps) {
  const router = useRouter();

  // Búsqueda y filtrado
  const [search, setSearch] = useState("");

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeListItem | null>(null);
  const [selectedEmployeeIdForDetail, setSelectedEmployeeIdForDetail] = useState<number | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Notificaciones
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filtrado de empleados
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return initialEmployees;
    const term = search.toLowerCase().trim();
    return initialEmployees.filter(
      (e) =>
        e.dni.toLowerCase().includes(term) ||
        e.nombre.toLowerCase().includes(term) ||
        e.apellido.toLowerCase().includes(term) ||
        e.idEmpleado.toString().includes(term)
    );
  }, [initialEmployees, search]);

  // Métricas agregadas
  const stats = useMemo(() => {
    const totalEmployees = initialEmployees.length;
    const totalSalesHandled = initialEmployees.reduce(
      (acc, e) => acc + e.totalVentasAtendidas,
      0
    );
    const totalMovements = initialEmployees.reduce(
      (acc, e) => acc + e.totalMovimientosInventario,
      0
    );
    const totalReturns = initialEmployees.reduce(
      (acc, e) => acc + e.totalDevolucionesAtendidas,
      0
    );
    return {
      totalEmployees,
      totalSalesHandled,
      totalMovements,
      totalReturns,
    };
  }, [initialEmployees]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingEmployee(null);
    setIsCreateOpen(true);
  };

  const handleOpenDetail = (id: number) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedEmployeeIdForDetail(id);
  };

  const handleOpenEdit = (emp: EmployeeListItem) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setEditingEmployee(emp);
    setIsCreateOpen(true);
  };

  const handleDetailEdit = (detail: EmployeeDetail) => {
    setSelectedEmployeeIdForDetail(null);
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
        {/* KPI 1: Personal Registrado */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Personal Activo</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-white">
            {stats.totalEmployees}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            En dbo.Empleado
          </p>
        </div>

        {/* KPI 2: Ventas Atendidas */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Ventas Atendidas</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {stats.totalSalesHandled}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Comprobantes emitidos
          </p>
        </div>

        {/* KPI 3: Movimientos Kardex */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Movimientos Kardex</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Boxes className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            {stats.totalMovements}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Operaciones almacén
          </p>
        </div>

        {/* KPI 4: Devoluciones / Garantías */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400">Garantías</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {stats.totalReturns}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            Devoluciones atendidas
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
            placeholder="Buscar por DNI, nombres o apellidos..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* Vista Móvil (< 768px): Tarjetas Responsivas de Empleados */}
      <div className="md:hidden space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 space-y-2">
            <UserCheck className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs">No se encontraron empleados que coincidan con la búsqueda.</p>
          </div>
        ) : (
          filteredEmployees.map((e) => (
            <div
              key={e.idEmpleado}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700/80 transition-colors"
            >
              {/* Cabecera de Tarjeta: ID, Nombre y DNI */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                      #{e.idEmpleado}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      DNI: <strong className="text-slate-200">{e.dni}</strong>
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-white">
                    {e.nombre} {e.apellido}
                  </h3>
                </div>
              </div>

              {/* Métricas Operativas en Fila de Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-medium ${
                    e.totalVentasAtendidas > 0
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {e.totalVentasAtendidas} {e.totalVentasAtendidas === 1 ? "venta" : "ventas"}
                </span>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-medium ${
                    e.totalMovimientosInventario > 0
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {e.totalMovimientosInventario} {e.totalMovimientosInventario === 1 ? "mov." : "movs."}
                </span>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-medium ${
                    e.totalDevolucionesAtendidas > 0
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {e.totalDevolucionesAtendidas} {e.totalDevolucionesAtendidas === 1 ? "dev." : "devs."}
                </span>
              </div>

              {/* Pie: Acciones Táctiles */}
              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(e.idEmpleado)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Expediente</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(e)}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Editar Empleado"
                  aria-label={`Editar empleado ${e.nombre}`}
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
                <th className="py-3.5 px-4">DNI</th>
                <th className="py-3.5 px-4">Empleado</th>
                <th className="py-3.5 px-4 text-center">Ventas Atendidas</th>
                <th className="py-3.5 px-4 text-center">Movimientos Almacén</th>
                <th className="py-3.5 px-4 text-center">Devoluciones</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <span>No se encontraron empleados que coincidan con la búsqueda.</span>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e) => (
                  <tr
                    key={e.idEmpleado}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        #{e.idEmpleado}
                      </span>
                    </td>

                    {/* DNI */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {e.dni}
                    </td>

                    {/* Empleado */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {e.nombre} {e.apellido}
                    </td>

                    {/* Ventas */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                          e.totalVentasAtendidas > 0
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {e.totalVentasAtendidas}{" "}
                        {e.totalVentasAtendidas === 1 ? "venta" : "ventas"}
                      </span>
                    </td>

                    {/* Movimientos */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                          e.totalMovimientosInventario > 0
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {e.totalMovimientosInventario}{" "}
                        {e.totalMovimientosInventario === 1 ? "movimiento" : "movimientos"}
                      </span>
                    </td>

                    {/* Devoluciones */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                          e.totalDevolucionesAtendidas > 0
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {e.totalDevolucionesAtendidas}{" "}
                        {e.totalDevolucionesAtendidas === 1 ? "devolución" : "devoluciones"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(e.idEmpleado)}
                          title="Ver Expediente Operativo"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/80 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-[11px]">Expediente</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(e)}
                          title="Editar Empleado"
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

      {/* Modal Crear / Editar Empleado */}
      <EmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        employee={editingEmployee}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => setIsLoginOpen(true)}
        onSuccess={(msg) => {
          showNotification("success", msg);
          router.refresh();
        }}
      />

      {/* Modal Expediente del Empleado */}
      <EmployeeDetailModal
        isOpen={!!selectedEmployeeIdForDetail}
        onClose={() => setSelectedEmployeeIdForDetail(null)}
        employeeId={selectedEmployeeIdForDetail}
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