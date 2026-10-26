export interface InventoryDashboardStats {
  totalUnidades: number;
  productosAgotados: number;
  productosStockBajo: number;
  valorInventarioVenta: number;
  totalEntradas: number;
  totalSalidas: number;
  totalMovimientos: number;
}

export interface InventoryProductStockItem {
  codbarras: string;
  nombre: string;
  categoria: string;
  idCategoria: number;
  marca: string;
  stock: number;
  precio: number;
  valorTotal: number;
  idEstado: number;
  estado: string;
  totalEntradas: number;
  totalSalidas: number;
}

export interface KardexMovementItem {
  idMovimiento: number;
  fecha: string;
  codbarras: string;
  nombreProducto: string;
  categoria: string;
  idTipoMov: number;
  tipoMovimiento: "Entrada" | "Salida" | "Ajuste";
  cantidad: number;
  idEmpleado: number;
  empleado: string;
  saldoCalculado: number;
}

export interface InventoryEmployee {
  idEmpleado: number;
  dni: string;
  nombreCompleto: string;
}

export interface InventoryFilterMetadata {
  categorias: Array<{ id: number; nombre: string; total: number }>;
  estados: Array<{ id: number; nombre: string }>;
  empleados: InventoryEmployee[];
  tiposMovimiento: Array<{ id: number; nombre: string }>;
  productos: Array<{
    codbarras: string;
    nombre: string;
    stock: number;
    estado: string;
    idEstado: number;
  }>;
}

export interface InventoryPageData {
  stats: InventoryDashboardStats;
  products: InventoryProductStockItem[];
  kardex: KardexMovementItem[];
  metadata: InventoryFilterMetadata;
}
