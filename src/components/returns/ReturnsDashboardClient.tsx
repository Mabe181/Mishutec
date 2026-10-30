"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReturnsPageData,
  ReturnDetail,
  TransactionalReturnResult,
} from "@/types/returns";
import { ReturnKpiCards } from "./ReturnKpiCards";
import { ReturnFilters } from "./ReturnFilters";
import { ReturnTable } from "./ReturnTable";
import { ReturnDetailModal } from "./ReturnDetailModal";
import { NewReturnModal } from "./NewReturnModal";
import { getReturnDetailAction } from "@/lib/actions/return.actions";
import { ShieldCheck, Plus, CheckCircle2, RotateCcw } from "lucide-react";

interface ReturnsDashboardClientProps {
  initialData: ReturnsPageData;
  isAuthenticated: boolean;
  username: string | null;
  dbName: string;
  isAcademic: boolean;
}

export function ReturnsDashboardClient({
  initialData,
  isAuthenticated,
  username,
  dbName,
  isAcademic,
}: ReturnsDashboardClientProps) {
  const router = useRouter();

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("todos");
  const [selectedMotivo, setSelectedMotivo] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Modal de Detalle
  const [selectedReturnDetail, setSelectedReturnDetail] = useState<ReturnDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal de Nueva Devolución (Fase 7B)
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtrado reactivo en memoria de los trámites
  const filteredReturns = useMemo(() => {
    return initialData.returns.filter((ret) => {
      // 1. Buscador
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchComp = ret.numeroComprobante.toLowerCase().includes(query);
        const matchClient = ret.clienteNombre.toLowerCase().includes(query);
        const matchDni = ret.dniCliente.includes(query);
        const matchId = `dev-#${ret.idDevolucion}`.toLowerCase().includes(query);
        const matchProd = ret.productosDevueltos.some((p) =>
          p.nombre.toLowerCase().includes(query) || p.codbarras.includes(query)
        );

        if (!matchComp && !matchClient && !matchDni && !matchId && !matchProd) {
          return false;
        }
      }

      // 2. Estado
      if (selectedEstado !== "todos") {
        if (ret.idEstadoDev !== Number(selectedEstado)) {
          return false;
        }
      }

      // 3. Motivo
      if (selectedMotivo !== "todos") {
        const motivoInfo = initialData.metadata.motivos.find(
          (m) => m.id.toString() === selectedMotivo
        );
        if (motivoInfo && !ret.motivos.includes(motivoInfo.descripcion)) {
          return false;
        }
      }

      // 4. Fechas
      if (fechaDesde && ret.fechaDev < fechaDesde) {
        return false;
      }
      if (fechaHasta && ret.fechaDev > fechaHasta) {
        return false;
      }

      return true;
    });
  }, [
    initialData.returns,
    initialData.metadata.motivos,
    search,
    selectedEstado,
    selectedMotivo,
    fechaDesde,
    fechaHasta,
  ]);

  // Manejador para abrir la ficha de devolución
  const handleOpenDetail = async (idDevolucion: number) => {
    try {
      setIsLoadingDetail(true);
      setErrorMsg(null);

      const result = await getReturnDetailAction(idDevolucion);

      if (!result.success || !result.data) {
        setErrorMsg(result.error || "No se pudo recuperar la información de la devolución.");
        return;
      }

      setSelectedReturnDetail(result.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al consultar la ficha de devolución.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      if (idParam && !isNaN(Number(idParam))) {
        handleOpenDetail(Number(idParam));
      }
    }
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedEstado("todos");
    setSelectedMotivo("todos");
    setFechaDesde("");
    setFechaHasta("");
  };

  const handleReturnCreated = (result: TransactionalReturnResult) => {
    setIsNewReturnOpen(false);
    setToastMessage(
      `Devolución DEV-#${result.idDevolucion.toString().padStart(4, "0")} registrada exitosamente como Pendiente. ${result.totalUnidades} unidades reservadas en la venta ${result.numeroComprobante}.`
    );
    router.refresh();
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleActionComplete = () => {
    setSelectedReturnDetail(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Banner Informativo Fase 7B */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-blue-900 block text-sm">
                Módulo de Devoluciones y Garantías — Control Transaccional (Fase 7B)
              </span>
              <p className="text-blue-800/90 leading-relaxed">
                Gestión transaccional ACID en <code>{dbName}</code>. Creación con reserva de
                saldos (Pendiente), resolución administrativa con bloqueos pesimistas, y reingreso
                condicional a inventario (Kardex) exclusivo para producto equivocado inspeccionado.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewReturnOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Devolución</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast de Notificación */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Tarjetas KPI */}
      <ReturnKpiCards kpis={initialData.kpis} />

      {/* Filtros de Búsqueda */}
      <ReturnFilters
        metadata={initialData.metadata}
        search={search}
        onSearchChange={setSearch}
        selectedEstado={selectedEstado}
        onEstadoChange={setSelectedEstado}
        selectedMotivo={selectedMotivo}
        onMotivoChange={setSelectedMotivo}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={setFechaDesde}
        fechaHasta={fechaHasta}
        onFechaHastaChange={setFechaHasta}
        onReset={handleResetFilters}
      />

      {/* Listado y Tabla */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span>
            Mostrando <strong>{filteredReturns.length}</strong> de{" "}
            <strong>{initialData.returns.length}</strong> trámites registrados
          </span>
          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Base: {dbName}
          </span>
        </div>

        <ReturnTable
          returns={filteredReturns}
          onSelectReturn={handleOpenDetail}
        />
      </div>

      {/* Modal Ficha de Devolución */}
      {selectedReturnDetail && (
        <ReturnDetailModal
          detail={selectedReturnDetail}
          onClose={() => setSelectedReturnDetail(null)}
          onActionComplete={handleActionComplete}
        />
      )}

      {/* Modal de Registro de Nueva Devolución (Fase 7B) */}
      {isNewReturnOpen && (
        <NewReturnModal
          onClose={() => setIsNewReturnOpen(false)}
          onSuccess={handleReturnCreated}
          motivos={initialData.metadata.motivos}
        />
      )}

      {/* Indicador de carga de detalle */}
      {isLoadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-xl shadow-2xl text-slate-800">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm font-medium">Cargando ficha de trazabilidad...</span>
          </div>
        </div>
      )}
    </div>
  );
}
