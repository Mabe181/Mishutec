"use client";

import { useState, useTransition, useEffect } from "react";
import { ClientListItem } from "@/types/entities";
import {
  createClientAction,
  updateClientAction,
} from "@/lib/actions/client.actions";
import {
  X,
  UserPlus,
  UserCheck,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientListItem | null;
  onSuccess: (msg: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function ClientModal({
  isOpen,
  onClose,
  client = null,
  onSuccess,
  isAuthenticated,
  onRequireAuth,
}: ClientModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = Boolean(client);

  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    if (client) {
      setDni(client.dni);
      setNombre(client.nombre);
      setApellido(client.apellido);
      setTelefono(client.telefono || "");
      setCorreo(client.correo);
    } else {
      setDni("");
      setNombre("");
      setApellido("");
      setTelefono("");
      setCorreo("");
    }
    setErrorMsg(null);
  }, [client, isOpen]);

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
      setErrorMsg("El DNI peruano debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg("Los nombres y apellidos son campos obligatorios.");
      return;
    }

    if (!correo.trim() || !correo.includes("@")) {
      setErrorMsg("Ingrese un correo electrónico válido.");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      if (isEdit) {
        const res = await updateClientAction(client!.dni, {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || undefined,
          correo: correo.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al actualizar cliente.");
        } else {
          onSuccess(`Cliente con DNI ${client!.dni} actualizado exitosamente.`);
          onClose();
        }
      } else {
        const res = await createClientAction({
          dni: dni.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || undefined,
          correo: correo.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al registrar cliente.");
        } else {
          onSuccess(`Cliente '${nombre} ${apellido}' (DNI ${dni}) registrado exitosamente.`);
          onClose();
        }
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
              {isEdit ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 id="client-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                {isEdit ? "Editar Información de Cliente" : "Registrar Nuevo Cliente"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {isEdit
                  ? `DNI ${client?.dni} (PK Inmutable)`
                  : "Alta de cliente para facturación y ventas en SQL Server"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario con Scroll Interno */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DNI */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              DNI Peruano (8 dígitos) *
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                disabled={isEdit}
                placeholder="Ej. 70231456"
                className={`w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm font-mono transition-colors ${
                  isEdit
                    ? "border border-slate-200 text-slate-500 cursor-not-allowed bg-slate-100"
                    : "border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                }`}
              />
              {isEdit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 font-sans">
                  <Lock className="h-3 w-3" /> PK Inmutable
                </span>
              )}
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombres *
              </label>
              <input
                type="text"
                maxLength={60}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                maxLength={60}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Vega Ramos"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Correo Electrónico *
            </label>
            <input
              type="email"
              maxLength={100}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Teléfono de Contacto (Opcional)
            </label>
            <input
              type="tel"
              maxLength={15}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 987654321"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Botones de Acción (Siempre Visibles / Fijos) */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 min-h-[42px] rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEdit ? "Actualizar Cliente" : "Registrar Cliente"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}