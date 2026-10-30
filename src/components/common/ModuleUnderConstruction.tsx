import Link from "next/link";
import {
  Clock,
  Layers,
  ArrowLeft,
  Database,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ModuleUnderConstructionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  associatedTables: {
    tableName: string;
    description: string;
    estimatedRows?: number;
  }[];
  plannedFeatures: string[];
}

export function ModuleUnderConstruction({
  title,
  description,
  icon: Icon,
  associatedTables,
  plannedFeatures,
}: ModuleUnderConstructionProps) {
  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Fase 3: En Preparación
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          prefetch={false}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al Dashboard
        </Link>
      </div>

      {/* Contenedor Informativo y Estado de Arquitectura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Tablas SQL Server Asociadas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Database className="h-4 w-4 text-blue-600" />
              <span>Entidades en SQL Server (MishutecT2)</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
              Tablas Físicas Verificadas
            </span>
          </div>
          <p className="text-xs text-slate-500">
            La base de datos ya cuenta con las siguientes tablas relacionales definidas en el esquema dbo
            listas para la integración transaccional en la siguiente fase:
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
            {associatedTables.map((t) => (
              <div
                key={t.tableName}
                className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
              >
                <div>
                  <span className="font-mono font-semibold text-blue-700">
                    dbo.{t.tableName}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{t.description}</p>
                </div>
                {typeof t.estimatedRows === "number" && (
                  <span className="self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200">
                    {t.estimatedRows} {t.estimatedRows === 1 ? "registro" : "registros"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alcance Funcional Previsto para Fase 3 */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Alcance Planificado (Fase 3)</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Funcionalidades que se incorporarán en la capa de negocio sin alterar el diseño existente:
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              {plannedFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Arquitectura Next.js SaaS</span>
            <Link
              href="/diagnostico"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Diagnóstico BD <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
