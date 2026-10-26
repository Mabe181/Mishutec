import { ReturnKpiMetrics } from "@/types/returns";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  TrendingDown,
} from "lucide-react";

interface ReturnKpiCardsProps {
  kpis: ReturnKpiMetrics;
}

export function ReturnKpiCards({ kpis }: ReturnKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Devoluciones */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Total Trámites</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <RotateCcw className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatNumber(kpis.totalDevoluciones)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ops.</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 truncate">Historial registrado</p>
      </div>

      {/* 2. Devoluciones Aprobadas */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Aprobadas</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {formatNumber(kpis.totalAprobadas)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">resueltas</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-500/80 truncate">Garantía concedida</p>
      </div>

      {/* 3. Devoluciones Pendientes */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">En Revisión</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {formatNumber(kpis.totalPendientes)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">pendientes</span>
        </div>
        <p className="mt-1 text-[10px] text-amber-500/80 truncate">Evaluación técnica</p>
      </div>

      {/* 4. Devoluciones Rechazadas */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Rechazadas</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            {formatNumber(kpis.totalRechazadas)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">denegadas</span>
        </div>
        <p className="mt-1 text-[10px] text-rose-500/80 truncate">Fuera de garantía / Daño</p>
      </div>

      {/* 5. Unidades Físicas Devueltas */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Unidades Dev.</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Package className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-purple-400">
            {formatNumber(kpis.totalUnidadesDevueltas)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">unid.</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 truncate">
          {kpis.productosInvolucradosCount} productos
        </p>
      </div>

      {/* 6. Monto Estimado de Devolución */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Impacto Económico</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-bold font-mono text-cyan-400 truncate">
            {formatCurrency(kpis.montoTotalDevueltoEstimado)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 truncate">Aprobadas a valor venta</p>
      </div>
    </div>
  );
}
