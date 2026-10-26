import {
  getInventoryDashboardStats,
  getInventoryProductStockList,
  getKardexMovements,
  getInventoryMetadata,
} from "../repositories/inventory.repository";
import {
  InventoryDashboardStats,
  InventoryProductStockItem,
  KardexMovementItem,
  InventoryFilterMetadata,
  InventoryPageData,
} from "@/types/inventory";

export async function getInventoryPageData(params?: {
  query?: string;
  categoria?: string;
  estado?: string;
  kardexProducto?: string;
  kardexTipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<InventoryPageData> {
  const [stats, products, kardex, metadata] = await Promise.all([
    getInventoryDashboardStats(),
    getInventoryProductStockList({
      query: params?.query,
      categoria: params?.categoria,
      estado: params?.estado,
    }),
    getKardexMovements({
      codbarras: params?.kardexProducto,
      tipo: params?.kardexTipo,
      fechaInicio: params?.fechaInicio,
      fechaFin: params?.fechaFin,
    }),
    getInventoryMetadata(),
  ]);

  return {
    stats,
    products,
    kardex,
    metadata,
  };
}

export async function getInventoryStats(): Promise<InventoryDashboardStats> {
  return getInventoryDashboardStats();
}

export async function getInventoryProducts(params?: {
  query?: string;
  categoria?: string;
  estado?: string;
}): Promise<InventoryProductStockItem[]> {
  return getInventoryProductStockList(params);
}

export async function getKardex(params?: {
  codbarras?: string;
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<KardexMovementItem[]> {
  return getKardexMovements(params);
}

export async function getInventoryMeta(): Promise<InventoryFilterMetadata> {
  return getInventoryMetadata();
}
