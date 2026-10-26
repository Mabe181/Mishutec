// Tipos para Clientes
export interface ClientSaleItem {
  idVenta: number;
  numeroComprobante: string;
  fecha: string;
  total: number;
  tipoComprobante: string;
  empleado: string;
}

export interface ClientListItem {
  dni: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string | null;
  correo: string;
  totalVentas: number;
  montoTotalComprado: number;
  ultimaCompraFecha: string | null;
}

export interface ClientDetail extends ClientListItem {
  ventas: ClientSaleItem[];
}

// Tipos para Proveedores
export interface SuppliedProductItem {
  codbarras: string;
  nombreProducto: string;
  categoria: string;
  marca: string;
  precioVenta: number;
  precioCompra: number;
  stock: number;
}

export interface SupplierListItem {
  idProveedor: number;
  nombre: string;
  correo: string;
  telefono: string;
  totalProductosSuministrados: number;
}

export interface SupplierDetail extends SupplierListItem {
  productos: SuppliedProductItem[];
}

// Tipos para Empleados
export interface EmployeeSaleRecord {
  idVenta: number;
  numeroComprobante: string;
  fecha: string;
  total: number;
  clienteDni: string;
  clienteNombre: string;
}

export interface EmployeeMovementRecord {
  idMovimiento: number;
  fecha: string;
  codbarras: string;
  nombreProducto: string;
  tipoMovimiento: string;
  cantidad: number;
}

export interface EmployeeDevolucionRecord {
  idDevolucion: number;
  fecha: string;
  idVenta: number;
  numeroComprobante: string;
  estadoDevolucion: string;
}

export interface EmployeeListItem {
  idEmpleado: number;
  dni: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  totalVentasAtendidas: number;
  montoTotalVendido: number;
  totalMovimientosInventario: number;
  totalDevolucionesAtendidas: number;
}

export interface EmployeeDetail extends EmployeeListItem {
  ventas: EmployeeSaleRecord[];
  movimientos: EmployeeMovementRecord[];
  devoluciones: EmployeeDevolucionRecord[];
}
