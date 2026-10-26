import { getDashboardData } from "@/lib/services/dashboard.service";
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryDistributionChart } from "@/components/dashboard/CategoryDistributionChart";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import { LowStockTable } from "@/components/dashboard/LowStockTable";
import { InventoryMovementsCard } from "@/components/dashboard/InventoryMovementsCard";
import {
  Package,
  CircleDollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Database,
  ShieldCheck,
  Server,
} from "lucide-react";
import Link from "next/link";

// Exclusivamente ejecución en Node.js runtime
export const runtime = "nodejs";

export default async function DashboardPage() {
  const data = await getDashboardData(5);
  const { kpis, salesTimeline, categories, recentSales, lowStockProducts, recentMovements, serverInfo } = data;

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Panel de Control Principal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SQL Server Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Métricas comerciales e inventario en tiempo real sobre la base de datos{" "}
            <span className="font-semibold text-slate-300">{serverInfo.activeDatabase}</span>
          </p>
        </div>

        {/* Metadatos de servidor y botón de refresco */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Instancia Local</span>
          </div>

          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            title="Refrescar datos desde SQL Server"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Actualizar</span>
          </Link>
        </div>
      </div>

      {/* Grid de 7 Indicadores Clave (KPIs) + Seguridad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Total Productos */}
        <MetricCard
          title="Productos Registrados"
          value={formatNumber(kpis.totalProductos)}
          subtitle="Catálogo activo en dbo.Producto"
          icon={Package}
          accentColor="cyan"
          badge={{ text: "10 ítems", variant: "info" }}
        />

        {/* KPI 4: Cantidad de Ventas */}
        <MetricCard
          title="Comprobantes Emitidos"
          value={formatNumber(kpis.cantidadVentas)}
          subtitle="Boletas y Facturas procesadas"
          icon={ShoppingCart}
          accentColor="blue"
          badge={{ text: "5 ventas", variant: "neutral" }}
        />

        {/* KPI 2: Valor del Inventario */}
        <MetricCard
          title="Valor del Inventario"
          value={formatCurrency(kpis.valorInventarioVenta)}
          subtitle="Stock × Precio de venta unitario"
          icon={CircleDollarSign}
          accentColor="emerald"
          badge={{ text: "Valuación", variant: "success" }}
          className="col-span-2 sm:col-span-1"
        />

        {/* KPI 3: Ventas Acumuladas */}
        <MetricCard
          title="Ventas Acumuladas"
          value={formatCurrency(kpis.ventasAcumuladas)}
          subtitle="Facturación total en dbo.Venta"
          icon={TrendingUp}
          accentColor="cyan"
          badge={{ text: "Histórico", variant: "info" }}
          className="col-span-2 sm:col-span-1"
        />

        {/* KPI 5: Clientes Registrados */}
        <MetricCard
          title="Clientes en Cartera"
          value={formatNumber(kpis.clientesRegistrados)}
          subtitle="Personas registradas en dbo.Cliente"
          icon={Users}
          accentColor="violet"
          badge={{ text: "5 clientes", variant: "neutral" }}
        />

        {/* KPI 6: Productos Agotados */}
        <MetricCard
          title="Productos Agotados"
          value={formatNumber(kpis.productosAgotados)}
          subtitle="Ítems con stock = 0 unidades"
          icon={AlertOctagon}
          accentColor="rose"
          badge={{
            text: kpis.productosAgotados > 0 ? "Requiere reposición" : "Sin agotados",
            variant: kpis.productosAgotados > 0 ? "danger" : "success",
          }}
        />

        {/* KPI 7: Productos Stock Bajo */}
        <MetricCard
          title="Stock Bajo (Alerta)"
          value={formatNumber(kpis.productosStockBajo)}
          subtitle={`Filtro visual de alerta: ≤ ${kpis.stockBajoThreshold} unidades`}
          icon={AlertTriangle}
          accentColor="amber"
          badge={{
            text: `${kpis.productosStockBajo} por agotarse`,
            variant: "warning",
          }}
        />

        {/* Card Resumen de Seguridad */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Seguridad & Acceso</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xs font-semibold text-slate-200">
              Operador Local
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              Windows Integrated Auth
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Conectado</span>
            <span className="text-[10px] text-slate-400 font-mono">SQL Express</span>
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos de Ventas y Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesTimeline} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDistributionChart data={categories} />
        </div>
      </div>

      {/* Fila 3: Últimas Ventas y Movimientos de Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSalesTable sales={recentSales} />
        </div>
        <div className="lg:col-span-1">
          <InventoryMovementsCard movements={recentMovements} />
        </div>
      </div>

      {/* Fila 4: Alerta de Stock Bajo (Tabla Completa) */}
      <div>
        <LowStockTable products={lowStockProducts} threshold={kpis.stockBajoThreshold} />
      </div>
    </div>
  );
}
