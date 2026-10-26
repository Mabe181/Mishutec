"use client";

import { useState, useTransition, useEffect } from "react";
import { SupplierListItem } from "@/types/entities";
import {
  createSupplierAction,
  updateSupplierAction,
} from "@/lib/actions/supplier.actions";
import {
  X,
  Building2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: SupplierListItem | null;
  onSuccess: (msg: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

export function SupplierModal({
  isOpen,
  onClose,
  supplier = null,
  onSuccess,
  isAuthenticated,
  onRequireAuth,
}: SupplierModalProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = Boolean(supplier);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    if (supplier) {
      setNombre(supplier.nombre);
      setCorreo(supplier.correo);
      setTelefono(supplier.telefono);
    } else {
      setNombre("");
      setCorreo("");
      setTelefono("");
    }
    setErrorMsg(null);
  }, [supplier, isOpen]);

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

    if (!nombre.trim()) {
      setErrorMsg("El nombre o razón social del proveedor es obligatorio.");
      return;
    }

    if (!correo.trim() || !correo.includes("@")) {
      setErrorMsg("Ingrese un correo electrónico válido de contacto comercial.");
      return;
    }

    if (!telefono.trim() || telefono.trim().length < 6) {
      setErrorMsg("Ingrese un número de teléfono válido de contacto (mínimo 6 caracteres).");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      if (isEdit) {
        const res = await updateSupplierAction(supplier!.idProveedor, {
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al actualizar información del proveedor.");
        } else {
          onSuccess(`Proveedor '${nombre}' actualizado exitosamente.`);
          onClose();
        }
      } else {
        const res = await createSupplierAction({
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim(),
        });

        if (!res.success) {
          setErrorMsg(res.error || "Error al registrar nuevo proveedor.");
        } else {
          onSuccess(`Proveedor '${nombre}' registrado exitosamente con ID #${res.data?.idProveedor}.`);
          onClose();
        }
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="supplier-modal-title" className="text-sm sm:text-base font-bold text-white">
                {isEdit ? "Editar Información de Proveedor" : "Registrar Nuevo Proveedor"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isEdit
                  ? `ID #${supplier?.idProveedor} en SQL Server`
                  : "Alta de distribuidor o fabricante en SQL Server (dbo.Proveedor)"}
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

          {/* Razón Social / Nombre */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Razón Social / Nombre Comercial *
            </label>
            <input
              type="text"
              maxLength={100}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Deltron Perú S.A."
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Correo Electrónico Comercial *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                maxLength={100}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ventas@deltron.pe"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Teléfono de Contacto Comercial *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                maxLength={15}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 01-5123456 o 987654321"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
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
                <span>{isEdit ? "Actualizar Proveedor" : "Registrar Proveedor"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}