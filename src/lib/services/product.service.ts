import {
  findProducts,
  findProductByBarcode,
  getFilterMetadata,
} from "@/lib/repositories/product.repository";
import {
  productFilterSchema,
  ValidatedProductFilters,
} from "@/lib/validations/product-filter.schema";
import {
  PaginatedProductsResult,
  ProductDetail,
  ProductFilterMetadata,
} from "@/types/product";

/**
 * Servicio de Negocio para el Catálogo de Productos.
 * Proporciona métodos de solo lectura para listar, filtrar y consultar fichas técnicas.
 */
export async function getCatalogProducts(
  rawParams: Record<string, string | string[] | undefined>
): Promise<PaginatedProductsResult> {
  // Aplanar searchParams si vienen en formato de arrays
  const normalizedParams: Record<string, any> = {};
  for (const [key, val] of Object.entries(rawParams)) {
    normalizedParams[key] = Array.isArray(val) ? val[0] : val;
  }

  const parsed = productFilterSchema.safeParse(normalizedParams);
  const filters: ValidatedProductFilters = parsed.success
    ? parsed.data
    : {
        stockStatus: "todos",
        sortBy: "nombre",
        sortOrder: "asc",
        page: 1,
        pageSize: 10,
      };

  return findProducts(filters);
}

/**
 * Obtiene la ficha técnica detallada de un producto específico.
 */
export async function getProductDetailByBarcode(
  barcode: string
): Promise<ProductDetail | null> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) return null;
  return findProductByBarcode(cleanBarcode);
}

/**
 * Obtiene metadatos de filtros (categorías, marcas y estados).
 */
export async function getCatalogFilterMetadata(): Promise<ProductFilterMetadata> {
  return getFilterMetadata();
}
