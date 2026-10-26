"use client";

import { Info, AlertTriangle, ShieldCheck, Database, FileText } from "lucide-react";

export function InventoryAdjustmentsNotice() {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">
            Auditoría de Esquema: Tipo de Movimiento "Ajuste" (ID 3)
          </h3>
          <p className="text-xs text-slate-400">
            Documentación de limitaciones del modelo relacional original de MishutecT2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            <span>Restricción CHECK de Cantidad</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            La tabla <code className="text-cyan-300">dbo.Mov_Inventario</code> cuenta con la restricción{" "}
            <code className="text-amber-300">CK_Mov_Cantidad ([Cantidad] &gt; 0)</code>, impidiendo valores negativos.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Info className="h-4 w-4" />
            <span>Ausencia de Columna de Sentido</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            No existe en el esquema una columna que indique la orientación del ajuste (ej. positivo/negativo) ni desglose
            entre <em>Ajuste Entrada</em> y <em>Ajuste Salida</em>.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Integridad de Conciliación</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Para garantizar que el saldo progresivo del Kardex concilie matemáticamente con el stock físico,
            la funcionalidad de ajustes ambiguos se mantiene retenida hasta una migración autorizada.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
        <FileText className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong>Decisión Arquitectónica (Fase 4):</strong> Las operaciones permitidas en producción son{" "}
          <strong className="text-emerald-300">Entradas</strong> (+ stock) y{" "}
          <strong className="text-orange-300">Salidas</strong> (- stock). Esto preserva la conciliación estricta{" "}
          <code className="text-cyan-300">Stock = TotalEntradas - TotalSalidas</code> al 100% en SQL Server.
        </span>
      </div>
    </div>
  );
}
