"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { loginAdminAction } from "@/lib/auth/actions";
import { X, Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [state, formAction, isPending] = useActionState(loginAdminAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  }, [state.success, onSuccess, onClose]);

  // Manejo de escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-150 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Acceso Administrativo</h3>
              <p className="text-xs text-slate-400">Autenticación local requerida para mutaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Usuario</label>
            <input
              name="username"
              type="text"
              required
              defaultValue="admin"
              className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
