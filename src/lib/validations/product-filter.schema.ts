import { z } from "zod";

export const productFilterSchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoria: z.string().trim().max(50).optional(),
  marca: z.string().trim().max(50).optional(),
  estado: z.string().trim().max(30).optional(),
  stockStatus: z.enum(["todos", "disponible", "agotado", "stock_bajo"]).default("todos"),
  sortBy: z.enum(["nombre", "precio", "stock"]).default("nombre"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  selectedProduct: z.string().trim().max(13).optional(),
});

export type ValidatedProductFilters = z.infer<typeof productFilterSchema>;
