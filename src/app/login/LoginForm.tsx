"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/lib/auth/actions";
import { sanitizeRedirectUrl } from "@/lib/auth/redirect";
import { Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface LoginFormProps {
  fromUrl: string;
}

export function LoginForm({ fromUrl }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAdminAction, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      const safeTarget = sanitizeRedirectUrl(fromUrl);
      router.push(safeTarget);
      router.refresh();
    }
  }, [state.success, fromUrl, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Lock className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-semibold text-slate-300">
          Autenticación Administrativa Requerida
        </span>
      </div>

      {state.error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-400" />
          Usuario Administrador
        </label>
        <input
          name="username"
          type="text"
          required
          defaultValue="admin"
          className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          placeholder="admin"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          placeholder="••••••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 mt-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando credenciales...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
