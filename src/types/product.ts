/**
 * Tipos de datos para el módulo de Catálogo y Ficha Técnica de Productos
 * Mapeo estricto con el esquema relacional de Microsoft SQL Server (MishutecT2)
 * Tipos verificados contra sys.columns
 */

export interface ProductListItem {
  codbarras: string;
  nombre: string; // varchar(120)
  precio: number; // decimal(10,2)
  garantiaMeses: number; // int
  stock: number; // int
  idEstado: number; // int
  estado: string; // varchar(30)
  idCategoria: number; // int
  categoria: string; // varchar(50)
  idMarca: number; // int
  marca: string; // varchar(50)
  cantidadProveedores: number;
  esStockBajo: boolean;
  esAgotado: boolean;
}

export interface ProductSupplier {
  idProveedor: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  precioCompra: number | null; // decimal(10,2)
}

export interface CpuSpecs {
  frecuenciaGhz: number; // decimal(4,2)
  nucleos: number; // int
}

export interface RamSpecs {
  capacidadGb: number; // int
  velocidadMhz: number; // int
}

export interface SsdSpecs {
  capacidadGb: number; // int
  interfaz: string; // varchar(20)
}

export interface GraficaSpecs {
  vramGb: number; // int
  chipset: string; // varchar(50)
}

export interface FuentePoderSpecs {
  potenciaW: number; // int
  certificacion: string; // varchar(30)
}

export interface GabineteSpecs {
  formato: string; // varchar(20)
  material: string; // varchar(30)
}

export interface ProductTechnicalSpecs {
  cpu?: CpuSpecs;
  ram?: RamSpecs;
  ssd?: SsdSpecs;
  grafica?: GraficaSpecs;
  fuentePoder?: FuentePoderSpecs;
  gabinete?: GabineteSpecs;
}

export interface ProductDetail extends ProductListItem {
  proveedores: ProductSupplier[];
  specs: ProductTechnicalSpecs;
}

export type StockFilterOption = "todos" | "disponible" | "agotado" | "stock_bajo";
export type SortColumnOption = "nombre" | "precio" | "stock";
export type SortOrderOption = "asc" | "desc";

export interface ProductFilterParams {
  search?: string;
  categoria?: string;
  marca?: string;
  estado?: string;
  stockStatus?: StockFilterOption;
  sortBy?: SortColumnOption;
  sortOrder?: SortOrderOption;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProductsResult {
  items: ProductListItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface FilterOptionItem {
  id: number;
  nombre: string;
  count: number;
}

export interface AvailableSupplierItem {
  id: number;
  nombre: string;
}

export interface ProductFilterMetadata {
  categorias: FilterOptionItem[];
  marcas: FilterOptionItem[];
  estados: FilterOptionItem[];
  proveedoresDisponibles: AvailableSupplierItem[];
  totalCatalog: number;
}
