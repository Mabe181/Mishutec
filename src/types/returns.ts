/**
 * Tipos de datos para el módulo de Devoluciones y Garantías (Fase 7A).
 * Estructuras estrictamente alineadas al esquema físico de SQL Server:
 * dbo.Devolucion, dbo.Detalle_Dev, dbo.Estado_Dev, dbo.Motivo_Dev, dbo.Venta, dbo.Detalle_Venta, dbo.Producto.
 */

export interface ReturnSummaryItem {
  idDevolucion: number;
  fechaDev: string; // YYYY-MM-DD
  idEstadoDev: number;
  estadoDev: string; // 'Pendiente' | 'Aprobada' | 'Rechazada'
  idVenta: number;
  numeroComprobante: string;
  fechaVenta: string;
  totalVenta: number;
  dniCliente: string;
  clienteNombre: string;
  idEmpleado: number;
  empleadoNombre: string;
  itemsCount: number;
  totalUnidadesDevueltas: number;
  motivos: string[];
  productosDevueltos: Array<{
    codbarras: string;
    nombre: string;
    cantidadDev: number;
    motivo: string;
  }>;
}

export interface ReturnSaleLineTrace {
  idDetalle: number;
  codbarras: string;
  nombreProd: string;
  precioVentaOriginal: number;
  cantidadVendidaOriginal: number;
  cantidadDevueltaEstaDev: number;
  cantidadDevueltaAprobadaTotal: number;
  cantidadDevueltaPendienteTotal: number;
  cantidadDisponibleDevolucion: number;
  idMotivo: number | null;
  motivo: string | null;
  // Garantía
  garantiaMeses: number;
  fechaVenta: string;
  fechaVencimientoGarantia: string;
  garantiaVigente: boolean;
  diasRestantesGarantia: number;
}

export interface ReturnDetail {
  idDevolucion: number;
  fechaDev: string;
  idEstadoDev: number;
  estadoDev: string;
  idVenta: number;
  numeroComprobante: string;
  fechaVenta: string;
  totalVenta: number;
  dniCliente: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteCorreo: string | null;
  idEmpleado: number;
  empleadoNombre: string;
  lineasDevolucion: ReturnSaleLineTrace[];
  todasLasLineasVenta: ReturnSaleLineTrace[];
  totalUnidadesDevueltas: number;
  montoEstimadoDevuelto: number;
}

export interface ReturnKpiMetrics {
  totalDevoluciones: number;
  totalAprobadas: number;
  totalPendientes: number;
  totalRechazadas: number;
  totalUnidadesDevueltas: number;
  productosInvolucradosCount: number;
  montoTotalDevueltoEstimado: number;
}

export interface ReturnFilterMetadata {
  estados: Array<{ id: number; nombre: string }>;
  motivos: Array<{ id: number; descripcion: string }>;
}

export interface ReturnsPageData {
  returns: ReturnSummaryItem[];
  kpis: ReturnKpiMetrics;
  metadata: ReturnFilterMetadata;
}

// ==========================================
// TIPOS TRANSACCIONALES PARA FASE 7B
// ==========================================

export interface CreateReturnItemInput {
  idDetalle: number; // Detalle_Venta.ID_detalle
  cantidadDev: number; // Cantidad positiva > 0
  idMotivo: number; // Motivo_Dev.ID_motivo (1, 2, 3)
}

export interface CreateReturnInput {
  idVenta: number;
  idEmpleado: number;
  items: CreateReturnItemInput[];
}

export interface ApproveReturnInput {
  idDevolucion: number;
  idEmpleado?: number;
  reingresoStock?: boolean; // Solo permitido y evaluado si el motivo es "Producto equivocado"
  observaciones?: string;
}

export interface RejectReturnInput {
  idDevolucion: number;
  idEmpleado?: number;
  motivoRechazo?: string;
}

export interface SaleLineWithBalance {
  idDetalle: number;
  codbarrasProd: string;
  nombreProd: string;
  precioUnitario: number;
  cantidadVendida: number;
  subtotal: number;
  garantiaMeses: number;
  cantidadAprobada: number;
  cantidadPendiente: number;
  cantidadDisponible: number;
  diasGarantiaRestantes: number;
  garantiaVigente: boolean;
  fechaVencimientoGarantia: string;
}

export interface SaleForReturnSearch {
  idVenta: number;
  numeroComprobante: string;
  fechaVenta: string;
  totalVenta: number;
  tipoComprobante: string;
  dniCliente: string;
  nombreCliente: string;
  idEmpleado: number;
  nombreEmpleado: string;
  lineas: SaleLineWithBalance[];
}

export interface TransactionalReturnResult {
  idDevolucion: number;
  fechaDev: string;
  idEstadoDev: number;
  nombreEstado: string;
  idVenta: number;
  numeroComprobante: string;
  totalItemsAfectados: number;
  totalUnidades: number;
  montoEstimado: number;
  reingresoKardexRealizado?: boolean;
  unidadesReingresadas?: number;
}
