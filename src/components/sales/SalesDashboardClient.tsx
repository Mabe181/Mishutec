"use client";

import { useState, useMemo, useEffect } from "react";
import {
  SalesPageData,
  SaleDetail,
  PosProductItem,
} from "@/types/sales";
import { SaleKpiCards } from "./SaleKpiCards";
import { SaleFilters } from "./SaleFilters";
import { SaleTable } from "./SaleTable";
import { SaleDetailModal } from "./SaleDetailModal";
import { PosTerminalClient } from "./PosTerminalClient";
import { getSaleDetailAction } from "@/lib/actions/sale.actions";
import {
  Receipt,
  ShoppingCart,
  History,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface SalesDashboardClientProps {
  initialData: SalesPageData;
  posProducts: PosProductItem[];
  isAuthenticated: boolean;
  username: string | null;
  dbName: string;
  isAcademic: boolean;
}

export function SalesDashboardClient({
  initialData,
  posProducts,
  isAuthenticated,
  username,
  dbName,
  isAcademic,
}: SalesDashboardClientProps) {
  // Pestaña Activa: "historial" o "pos" (admite ?tab=pos en URL)
  const [activeTab, setActiveTab] = useState<"historial" | "pos">("historial");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("tab");
      if (param === "pos") {
        setActiveTab("pos");
      }
    }
  }, []);

  // Filtros de Historial de Ventas
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("todos");
  const [selectedEmployee, setSelectedEmployee] = useState("todos");
  const [selectedTipoComp, setSelectedTipoComp] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Modal de Detalle de Venta
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filtrado reactivo en el cliente para el historial
  const filteredSales = useMemo(() => {
    return initialData.sales.filter((sale) => {
      // 1. Búsqueda por texto (N° Comprobante, Nombre de Cliente o DNI)
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchComp = sale.numeroComprobante.toLowerCase().includes(term);
        const matchCliente = sale.clienteNombre.toLowerCase().includes(term);
        const matchDni = sale.dniCliente.toLowerCase().includes(term);
        if (!matchComp && !matchCliente && !matchDni) return false;
      }

      // 2. Filtro por Cliente
      if (selectedClient !== "todos" && sale.dniCliente !== selectedClient) {
        return false;
      }

      // 3. Filtro por Empleado
      if (selectedEmployee !== "todos" && sale.idEmpleado.toString() !== selectedEmployee) {
        return false;
      }

      // 4. Filtro por Tipo de Comprobante
      if (selectedTipoComp !== "todos" && sale.idTipoComp.toString() !== selectedTipoComp) {
        return false;
      }

      // 5. Rango de Fechas
      if (fechaDesde && sale.fecha < fechaDesde) {
        return false;
      }
      if (fechaHasta && sale.fecha > fechaHasta) {
        return false;
      }

      return true;
    });
  }, [
    initialData.sales,
    search,
    selectedClient,
    selectedEmployee,
    selectedTipoComp,
    fechaDesde,
    fechaHasta,
  ]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedClient !== "todos" ||
    selectedEmployee !== "todos" ||
    selectedTipoComp !== "todos" ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedClient("todos");
    setSelectedEmployee("todos");
    setSelectedTipoComp("todos");
    setFechaDesde("");
    setFechaHasta("");
  };

  // Abrir Ficha de Venta mediante Server Action
  const handleViewDetail = async (idVenta: number) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await getSaleDetailAction(idVenta);
      if (res.success && res.data) {
        setSelectedSaleDetail(res.data);
      } else {
        setSelectedSaleDetail(null);
      }
    } catch (e) {
      console.error("Error al cargar detalle de venta:", e);
      setSelectedSaleDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Principal */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("historial")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "historial"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historial y Consulta de Ventas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "historial"
                  ? "bg-slate-950/20 text-slate-900"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {initialData.sales.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "pos"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Terminal POS Transaccional (Fase 6B)</span>
          </button>
        </div>

        {/* Entorno DB Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{dbName}</span>
        </div>
      </div>

      {/* Contenido Según la Pestaña Activa */}
      {activeTab === "historial" ? (
        <div className="space-y-6">
          {/* Tarjetas KPI */}
          <SaleKpiCards kpis={initialData.kpis} />

          {/* Filtros de Búsqueda y Rango */}
          <SaleFilters
            metadata={initialData.metadata}
            search={search}
            onSearchChange={setSearch}
            selectedClient={selectedClient}
            onClientChange={setSelectedClient}
            selectedEmployee={selectedEmployee}
            onEmployeeChange={setSelectedEmployee}
            selectedTipoComp={selectedTipoComp}
            onTipoCompChange={setSelectedTipoComp}
            fechaDesde={fechaDesde}
            onFechaDesdeChange={setFechaDesde}
            fechaHasta={fechaHasta}
            onFechaHastaChange={setFechaHasta}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Tabla Paginada y Tarjetas Móviles */}
          <SaleTable
            sales={filteredSales}
            onViewDetail={handleViewDetail}
          />
        </div>
      ) : (
        <PosTerminalClient
          initialProducts={posProducts}
          metadata={initialData.metadata}
          isAuthenticated={isAuthenticated}
          username={username}
        />
      )}

      {/* Modal de Detalle de Venta */}
      {isDetailModalOpen && (
        <SaleDetailModal
          detail={selectedSaleDetail}
          loading={isDetailLoading}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSaleDetail(null);
          }}
        />
      )}
    </div>
  );
}
