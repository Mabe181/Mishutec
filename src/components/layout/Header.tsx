"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  ChevronRight,
  Database,
  UserCheck,
} from "lucide-react";
import { navItems } from "./Sidebar";

interface HeaderProps {
  onToggleMobile: () => void;
  dbName: string;
  isAcademic: boolean;
}

export function Header({ onToggleMobile, dbName, isAcademic }: HeaderProps) {
  const pathname = usePathname();

  // Obtener el título del módulo actual a partir de la ruta
  const currentItem = navItems.find((item) => item.href === pathname) || {
    title: pathname === "/diagnostico" ? "Diagnóstico Técnico" : "Módulo",
  };

  return (
    <header className="h-14 sm:h-16 px-3.5 sm:px-6 sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between transition-all">
      {/* Lado Izquierdo: Botón Mobile + Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          type="button"
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation Adaptable */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
          <Link
            href="/dashboard"
            className="hidden sm:inline text-slate-400 hover:text-slate-200 transition-colors font-medium shrink-0"
          >
            Mishutec
          </Link>
          <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span className="text-cyan-400 font-semibold truncate text-xs sm:text-sm">
            {currentItem.title}
          </span>
        </nav>
      </div>

      {/* Lado Derecho: Estado de Base de Datos y Usuario Autenticado */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Badge de Base de Datos Dinámica */}
        <div
          title={`Base de datos activa: ${dbName} (${isAcademic ? "Protegida" : "Aceptación"})`}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] sm:text-xs"
        >
          <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400 shrink-0" />
          <span className="hidden md:inline text-slate-400">BD:</span>
          <span className="font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-none">
            {dbName}
          </span>
          <span
            className={`hidden sm:inline-block h-1.5 w-1.5 rounded-full ${
              isAcademic ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
            }`}
          />
        </div>

        {/* Badge de Usuario Windows */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="h-6 w-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              Operador Local
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              Windows Auth
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}