"use client";

import { useState, useTransition, useEffect } from "react";
import { EmployeeListItem } from "@/types/entities";
import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/lib/actions/employee.actions";
import {
  X,
  UserCheck,
  UserPlus,
  AlertCircle,
  Loader2,
  Lock,
  BadgeCheck,
} from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: EmployeeListItem | null;
  onSuccess: (msg: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function EmployeeModal({
  isOpen,
  onClose,
  employee = null,
  onSuccess,
  isAuthenticated,
  onRequireAuth,
}: EmployeeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = Boolean(employee);

  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  useEffect(() => {
    if (employee) {
      setDni(employee.dni);
      setNombre(employee.nombre);
      setApellido(employee.apellido);
    } else {
      setDni("");
      setNombre("");
      setApellido("");
    }
    setErrorMsg(null);
  }, [employee, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (!isEdit && (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni))) {
      setErrorMsg("El DNI del empleado debe tener exactamente 8 dígitos numéricos.");
      return;
    }

    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg("Los nombres y apellidos son campos obligatorios.");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      if (isEdit) {
        const res = await updateEmployeeAction(employee!.idEmpleado, {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al actualizar información del empleado.");
        } else {
          onSuccess(`Empleado '${nombre} ${apellido}' actualizado exitosamente.`);
          onClose();
        }
      } else {
        const res = await createEmployeeAction({
          dni: dni.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al registrar empleado.");
        } else {
          onSuccess(
            `Empleado '${nombre} ${apellido}' (DNI ${dni}) registrado exitosamente con ID #${res.data?.idEmpleado}.`
          );
          onClose();
        }
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              {isEdit ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="employee-modal-title" className="text-sm sm:text-base font-bold text-white">
                {isEdit ? "Editar Información de Empleado" : "Registrar Nuevo Empleado"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isEdit
                  ? `ID #${employee?.idEmpleado} (DNI ${employee?.dni})`
                  : "Alta de personal operativo en SQL Server (dbo.Empleado)"}
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

        {/* Formulario con Scroll Interno */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DNI */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              DNI de Identidad (8 dígitos) *
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                disabled={isEdit}
                placeholder="Ej. 44556677"
                className={`w-full px-3 py-2.5 bg-slate-950/70 border rounded-lg text-xs sm:text-sm font-mono transition-colors ${
                  isEdit
                    ? "border-slate-800 text-slate-400 cursor-not-allowed bg-slate-900/50"
                    : "border-slate-700/80 text-white focus:outline-none focus:border-cyan-500"
                }`}
              />
              {isEdit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 font-sans">
                  <Lock className="h-3 w-3" /> DNI Único Registrado
                </span>
              )}
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nombres *
              </label>
              <input
                type="text"
                maxLength={60}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Andrés"
                className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                maxLength={60}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Mendoza Castro"
                className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <BadgeCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              El personal registrado queda inmediatamente disponible para autorizar comprobantes de venta, registrar movimientos en almacén y tramitar garantías.
            </span>
          </div>

          {/* Botones de Acción Fijos */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 min-h-[42px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEdit ? "Actualizar Empleado" : "Registrar Empleado"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}