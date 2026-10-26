import { z } from "zod";

/**
 * Preprocesador para admitir números ingresados con coma (,) o punto (.)
 * y convertirlos a number antes de ejecutar las validaciones numéricas de Zod.
 */
export function flexibleNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess((val) => {
    if (typeof val === "string") {
      const cleaned = val.replace(",", ".").trim();
      const num = Number(cleaned);
      return isNaN(num) ? val : num;
    }
    return val;
  }, schema);
}

// Validaciones técnicas especializadas basadas en los tipos reales de sys.columns
export const cpuSpecsSchema = z.object({
  frecuenciaGhz: flexibleNumber(
    z.number().min(0.5, "La frecuencia debe ser de al menos 0.50 GHz").max(10.0, "La frecuencia no puede exceder 10.00 GHz")
  ),
  nucleos: flexibleNumber(
    z.number().int("Debe ser un número entero").min(1, "Debe tener al menos 1 núcleo").max(128, "No puede exceder 128 núcleos")
  ),
});

export const ramSpecsSchema = z.object({
  capacidadGb: flexibleNumber(
    z.number().int("Debe ser un número entero").min(1, "Mínimo 1 GB").max(512, "Máximo 512 GB")
  ),
  velocidadMhz: flexibleNumber(
    z.number().int("Debe ser un número entero").min(800, "Mínimo 800 MHz").max(12000, "Máximo 12,000 MHz")
  ),
});

export const ssdSpecsSchema = z.object({
  capacidadGb: flexibleNumber(
    z.number().int("Debe ser un número entero").min(64, "Mínimo 64 GB").max(32000, "Máximo 32,000 GB")
  ),
  interfaz: z
    .string()
    .trim()
    .min(2, "La interfaz debe tener al menos 2 caracteres")
    .max(20, "La interfaz no puede exceder 20 caracteres (límite SQL varchar(20))"),
});

export const graficaSpecsSchema = z.object({
  vramGb: flexibleNumber(
    z.number().int("Debe ser un número entero").min(1, "Mínimo 1 GB de VRAM").max(96, "Máximo 96 GB de VRAM")
  ),
  chipset: z
    .string()
    .trim()
    .min(2, "El chipset debe tener al menos 2 caracteres")
    .max(50, "El chipset no puede exceder 50 caracteres (límite SQL varchar(50))"),
});

export const fuentePoderSpecsSchema = z.object({
  potenciaW: flexibleNumber(
    z.number().int("Debe ser un número entero").min(100, "Mínimo 100 Watts").max(3000, "Máximo 3,000 Watts")
  ),
  certificacion: z
    .string()
    .trim()
    .min(2, "La certificación debe tener al menos 2 caracteres")
    .max(30, "La certificación no puede exceder 30 caracteres (límite SQL varchar(30))"),
});

export const gabineteSpecsSchema = z.object({
  formato: z
    .string()
    .trim()
    .min(2, "El formato debe tener al menos 2 caracteres")
    .max(20, "El formato no puede exceder 20 caracteres (límite SQL varchar(20))"),
  material: z
    .string()
    .trim()
    .min(2, "El material debe tener al menos 2 caracteres")
    .max(30, "El material no puede exceder 30 caracteres (límite SQL varchar(30))"),
});

// Esquema de proveedor asociado (dbo.Suministra)
export const supplierAssociationSchema = z.object({
  idProveedor: flexibleNumber(z.number().int().positive("ID de proveedor inválido")),
  precioCompra: flexibleNumber(z.number().positive("El costo de compra debe ser mayor a 0")),
});

// Esquema base para creación de producto
export const createProductSchema = z.object({
  codbarras: z
    .string()
    .trim()
    .min(3, "El código de barras debe tener al menos 3 caracteres")
    .max(13, "El código de barras no puede exceder 13 caracteres (límite SQL varchar(13))")
    .regex(/^[a-zA-Z0-9]+$/, "El código de barras debe ser alfanumérico sin espacios"),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre del producto debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres (límite SQL varchar(120))"),
  precio: flexibleNumber(
    z.number().positive("El precio de venta debe ser mayor a 0").max(999999.99, "El precio excede el límite permitido")
  ),
  garantiaMeses: flexibleNumber(
    z.number().int("Debe ser un número entero").min(0, "La garantía no puede ser negativa").max(120, "La garantía no puede superar 120 meses")
  ),
  idCategoria: flexibleNumber(z.number().int().positive("Debe seleccionar una categoría válida")),
  idMarca: flexibleNumber(z.number().int().positive("Debe seleccionar una marca válida")),
  idEstado: flexibleNumber(z.number().int().positive()).optional(),
  
  // Características técnicas opcionales según la categoría
  specs: z.object({
    cpu: cpuSpecsSchema.optional(),
    ram: ramSpecsSchema.optional(),
    ssd: ssdSpecsSchema.optional(),
    grafica: graficaSpecsSchema.optional(),
    fuentePoder: fuentePoderSpecsSchema.optional(),
    gabinete: gabineteSpecsSchema.optional(),
  }),

  // Lista de proveedores asociados
  proveedores: z.array(supplierAssociationSchema).default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// Esquema para edición de producto (código de barras y categoría son inmutables)
export const updateProductSchema = z.object({
  codbarras: z.string().trim().min(1).max(13),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre del producto debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres"),
  precio: flexibleNumber(
    z.number().positive("El precio de venta debe ser mayor a 0").max(999999.99, "El precio excede el límite permitido")
  ),
  garantiaMeses: flexibleNumber(
    z.number().int("Debe ser un número entero").min(0, "La garantía no puede ser negativa").max(120, "La garantía no puede superar 120 meses")
  ),
  idMarca: flexibleNumber(z.number().int().positive("Debe seleccionar una marca válida")),
  idEstado: flexibleNumber(z.number().int().positive()),
  
  specs: z.object({
    cpu: cpuSpecsSchema.optional(),
    ram: ramSpecsSchema.optional(),
    ssd: ssdSpecsSchema.optional(),
    grafica: graficaSpecsSchema.optional(),
    fuentePoder: fuentePoderSpecsSchema.optional(),
    gabinete: gabineteSpecsSchema.optional(),
  }),

  proveedores: z.array(supplierAssociationSchema).default([]),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
