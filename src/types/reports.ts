/**
 * Tipos de datos para el módulo de Reportes, Estadísticas y Analítica Comercial (Fase 8).
 * Estructuras estrictamente alineadas al esquema físico de SQL Server en MishutecT2_Aceptacion.
 */

export interface ReportFilterParams {
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
  idCategoria?: number;
  idMarca?: number;
  idEmpleado?: number;
  dniCliente?: string;
  idTipoComp?: number;
  idMetodoPago?: number;
  preset?: "today" | "last7" | "last30" | "thisMonth" | "all";
}

export interface ReportKpiMetrics {
  ventasTotales: number;
  comprobantesCount: number;
  ticketPromedio: number;
  unidadesVendidas: number;
  productosCatalogo: number;
  productosAgotados: number;
  productosStockBajo: number;
  stockTotal: number;
  valorInventarioVenta: number;
  totalDevoluciones: number;
  devolucionesPendientes: number;
  devolucionesAprobadas: number;
  devolucionesRechazadas: number;
  unidadesDevueltasTotal: number;
  tasaRetornoUnidades: number;
  // Indicadores RMA desglosados (H-03)
  unidadesReclamadasTotal: number;
  unidadesAprobadasTotal: number;
  unidadesRechazadasTotal: number;
  unidadesPendientesTotal: number;
  unidadesReingresadasKardex: number;
  tasaIncidenciaSolicitudes: number;
  tasaDevolucionAprobada: number;
  tasaReingresoKardex: number;
}

export interface SalesByDateItem {
  fecha: string;
  totalVenta: number;
  comprobantesCount: number;
  unidadesVendidas: number;
  acumulado: number;
}

export interface SalesByVoucherType {
  idTipoComp: number;
  nombreTipo: string;
  totalVenta: number;
  comprobantesCount: number;
  porcentaje: number;
}

export interface SalesByPaymentMethod {
  idMetodo: number;
  nombreMetodo: string;
  montoPagado: number;
  transaccionesCount: number;
  porcentaje: number;
}

export interface TopSellingProduct {
  codbarras: string;
  nombreProd: string;
  categoria: string;
  marca: string;
  precioUnitario: number;
  unidadesVendidas: number;
  totalFacturado: number;
  stockActual: number;
}

export interface SalesByCategory {
  idCategoria: number;
  nombreCategoria: string;
  totalFacturado: number;
  unidadesVendidas: number;
  porcentaje: number;
}

export interface SalesByEmployee {
  idEmpleado: number;
  nombreEmpleado: string;
  comprobantesCount: number;
  unidadesVendidas: number;
  totalFacturado: number;
  ticketPromedio: number;
  movimientosKardexCount: number;
  devolucionesTramitadasCount: number;
}

export interface CustomerAnalyticsItem {
  dniCliente: string;
  nombreCliente: string;
  telefono: string | null;
  correo: string;
  comprasCount: number;
  unidadesCompradas: number;
  totalGastado: number;
  ticketPromedio: number;
  primeraCompra: string;
  ultimaCompra: string;
  esRecurrente: boolean;
}

export interface InventoryAnalytics {
  stockPorCategoria: Array<{
    idCategoria: number;
    categoria: string;
    stockTotal: number;
    valorVenta: number;
    productosCount: number;
  }>;
  stockPorMarca: Array<{
    idMarca: number;
    marca: string;
    stockTotal: number;
    valorVenta: number;
    productosCount: number;
  }>;
  productosAgotados: Array<{
    codbarras: string;
    nombreProd: string;
    categoria: string;
    marca: string;
    precio: number;
  }>;
  productosStockBajo: Array<{
    codbarras: string;
    nombreProd: string;
    categoria: string;
    marca: string;
    stock: number;
    precio: number;
  }>;
  movimientosResumen: {
    entradasTotal: number;
    salidasTotal: number;
    ajustesTotal: number;
  };
  productosRotacion: Array<{
    codbarras: string;
    nombreProd: string;
    unidadesVendidas: number;
    stockActual: number;
    indiceRotacion: number;
  }>;
  valorTotalInventarioVenta: number;
}

export interface SupplierProductItem {
  codbarras: string;
  nombreProd: string;
  precioCompra: number;
  precioVenta: number;
}

export interface SupplierAnalyticsItem {
  idProveedor: number;
  nombreProveedor: string;
  correo: string;
  telefono: string | null;
  productosSuministradosCount: number;
  productos: SupplierProductItem[];
  costoPromedioCompra: number;
}

export interface SupplierOverview {
  totalProveedores: number;
  totalRelacionesSuministro: number;
  productosConMultiplesProveedores: Array<{
    codbarras: string;
    nombreProd: string;
    cantidadProveedores: number;
    rangoPreciosCompra: string;
    proveedoresNombres: string;
  }>;
  productosSinProveedor: Array<{
    codbarras: string;
    nombreProd: string;
    categoria: string;
    stock: number;
  }>;
  proveedores: SupplierAnalyticsItem[];
}

export interface ReturnsAnalytics {
  totalDevoluciones: number;
  porEstado: Array<{
    idEstado: number;
    estado: string;
    total: number;
    porcentaje: number;
  }>;
  porMotivo: Array<{
    idMotivo: number;
    motivo: string;
    total: number;
    unidadesDevueltas: number;
  }>;
  productosMasDevueltos: Array<{
    codbarras: string;
    nombreProd: string;
    vecesDevuelto: number;
    unidadesDevueltas: number;
    impactoValorVenta: number;
  }>;
  devolucionesPorFecha: Array<{
    fecha: string;
    count: number;
    unidades: number;
  }>;
  porEmpleado: Array<{
    idEmpleado: number;
    empleado: string;
    totalTramites: number;
  }>;
  relacionRetornoVentas: {
    totalVendidas: number;
    totalDevueltas: number;
    tasaRetorno: number;
    // Indicadores RMA desglosados (H-03)
    unidadesReclamadasTotal: number;
    unidadesAprobadasTotal: number;
    unidadesRechazadasTotal: number;
    unidadesPendientesTotal: number;
    unidadesReingresadasKardex: number;
    tasaIncidenciaSolicitudes: number;
    tasaDevolucionAprobada: number;
    tasaReingresoKardex: number;
  };
}

export interface ReportsFilterMetadata {
  categorias: Array<{ id: number; nombre: string }>;
  marcas: Array<{ id: number; nombre: string }>;
  empleados: Array<{ id: number; nombre: string }>;
  tiposComprobante: Array<{ id: number; nombre: string }>;
  metodosPago: Array<{ id: number; nombre: string }>;
}

export interface CompleteReportsPageData {
  kpis: ReportKpiMetrics;
  ventasPorFecha: SalesByDateItem[];
  ventasPorComprobante: SalesByVoucherType[];
  ventasPorMetodoPago: SalesByPaymentMethod[];
  topProductos: TopSellingProduct[];
  ventasPorCategoria: SalesByCategory[];
  ventasPorEmpleado: SalesByEmployee[];
  clientesAnalytics: {
    totalClientes: number;
    conCompras: number;
    recurrentes: number;
    lista: CustomerAnalyticsItem[];
  };
  inventarioAnalytics: InventoryAnalytics;
  proveedoresAnalytics: SupplierOverview;
  devolucionesAnalytics: ReturnsAnalytics;
  metadata: ReportsFilterMetadata;
  filtrosAplicados: ReportFilterParams;
}
