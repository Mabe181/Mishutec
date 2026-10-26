"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: ProductPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generar lista de números de página
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-xs text-slate-400">
      <div>
        Mostrando <span className="font-semibold text-slate-200">{startItem}</span> -{" "}
        <span className="font-semibold text-slate-200">{endItem}</span> de{" "}
        <span className="font-semibold text-white">{totalItems}</span> productos
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[2rem] px-2 rounded-lg font-medium text-xs transition-colors ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
