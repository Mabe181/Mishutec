import { z } from "zod";

/**
 * Esquema de validación para un ítem del carrito de venta.
 */
export const cartItemInputSchema = z.object({
  codbarras: z
    .string()
    .length(13, "El código de barras debe tener exactamente 13 dígitos.")
    .regex(/^\d{13}$/, "El código de barras solo debe contener dígitos numéricos."),
  cantidad: z
    .number()
    .int("La cantidad no puede contener decimales.")
    .positive("La cantidad a vender debe ser mayor a 0.")
    .max(999, "La cantidad máxima por línea es 999 unidades."),
});

/**
 * Esquema de validación para una asignación de medio de pago.
 */
export const paymentInputSchema = z.object({
  idMetodo: z
    .number()
    .int()
    .positive("Debe seleccionar un método de pago válido."),
  monto: z
    .number()
    .positive("El monto pagado debe ser estrictamente mayor a S/. 0.00.")
    .refine(
      (val) => {
        // Máximo 2 decimales
        return Math.round(val * 100) === val * 100;
      },
      { message: "El monto no puede tener más de dos decimales." }
    ),
});

/**
 * Esquema de validación completo para el registro de una transacción de venta.
 */
export const saleInputSchema = z.object({
  dniCliente: z
    .string()
    .length(8, "El DNI del cliente debe tener 8 dígitos.")
    .regex(/^\d{8}$/, "El DNI solo puede contener dígitos numéricos."),
  idEmpleado: z
    .number()
    .int()
    .positive("Debe seleccionar un empleado responsable."),
  idTipoComp: z.union([z.literal(1), z.literal(2)]),
  items: z
    .array(cartItemInputSchema)
    .min(1, "La orden de venta debe incluir al menos un producto."),
  payments: z
    .array(paymentInputSchema)
    .min(1, "Debe registrar al menos un método de pago."),
  clientRequestId: z
    .string()
    .optional(),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type SaleInput = z.infer<typeof saleInputSchema>;
