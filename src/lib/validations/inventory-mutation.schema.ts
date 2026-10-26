import { z } from "zod";

/**
 * Preprocesador para admitir números enteros desde inputs HTML.
 */
function flexibleInt(schema: z.ZodNumber) {
  return z.preprocess((val) => {
    if (typeof val === "string") {
      const cleaned = val.trim();
      const num = Number(cleaned);
      return isNaN(num) ? val : num;
    }
    return val;
  }, schema);
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const inventoryMovementInputSchema = z.object({
  codbarras: z
    .string()
    .trim()
    .min(3, "El código de barras debe tener al menos 3 caracteres")
    .max(13, "El código de barras no puede exceder 13 caracteres"),
  cantidad: flexibleInt(
    z
      .number()
      .int("La cantidad debe ser un número entero")
      .positive("La cantidad debe ser estrictamente mayor a 0")
      .max(10000, "La cantidad no puede exceder 10,000 unidades por movimiento")
  ),
  idEmpleado: flexibleInt(
    z.number().int().positive("Debe seleccionar un empleado responsable válido")
  ),
  fecha: z
    .string()
    .trim()
    .regex(dateRegex, "La fecha debe tener formato YYYY-MM-DD")
    .optional(),
});

export type InventoryMovementInput = z.infer<typeof inventoryMovementInputSchema>;
