import { z } from "zod";

function flexibleNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess((val) => {
    if (typeof val === "string") {
      const cleaned = val.replace(",", ".").trim();
      const num = Number(cleaned);
      return isNaN(num) ? val : num;
    }
    return val;
  }, schema);
}

// 1. Validaciones para Clientes
export const clientSchema = z.object({
  dni: z
    .string()
    .trim()
    .length(8, "El DNI peruano debe tener exactamente 8 dígitos")
    .regex(/^\d{8}$/, "El DNI debe contener únicamente dígitos numéricos"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres"),
  apellido: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(60, "El apellido no puede exceder 60 caracteres"),
  telefono: z
    .string()
    .trim()
    .max(15, "El teléfono no puede superar 15 dígitos")
    .regex(/^[\d\s+-]*$/, "El teléfono contiene caracteres inválidos")
    .optional()
    .or(z.literal("")),
  correo: z
    .string()
    .trim()
    .min(5, "El correo electrónico es obligatorio")
    .max(100, "El correo no puede exceder 100 caracteres")
    .email("Formato de correo electrónico inválido"),
});

export const clientUpdateSchema = clientSchema.omit({ dni: true });

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

// 2. Validaciones para Proveedores
export const supplierSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "La razón social o nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre del proveedor no puede exceder 100 caracteres"),
  correo: z
    .string()
    .trim()
    .min(5, "El correo electrónico es obligatorio")
    .max(100, "El correo no puede exceder 100 caracteres")
    .email("Formato de correo electrónico inválido"),
  telefono: z
    .string()
    .trim()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .max(15, "El teléfono no puede exceder 15 caracteres")
    .regex(/^[\d\s+-]+$/, "El teléfono contiene caracteres inválidos"),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

// 3. Asociación Proveedor - Producto (dbo.Suministra)
export const supplierProductAssociationSchema = z.object({
  idProveedor: z.number().int().positive("ID de proveedor inválido"),
  codbarras: z
    .string()
    .trim()
    .min(3, "El código de barras debe tener al menos 3 caracteres")
    .max(13, "El código de barras no puede exceder 13 caracteres"),
  precioCompra: flexibleNumber(
    z
      .number()
      .positive("El costo de compra debe ser estrictamente mayor a 0")
      .max(999999.99, "El costo excede el límite permitido")
  ),
});

export type SupplierProductAssociationInput = z.infer<
  typeof supplierProductAssociationSchema
>;

// 4. Validaciones para Empleados
export const employeeSchema = z.object({
  dni: z
    .string()
    .trim()
    .length(8, "El DNI de empleado debe tener exactamente 8 dígitos")
    .regex(/^\d{8}$/, "El DNI debe contener únicamente dígitos numéricos"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres"),
  apellido: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(60, "El apellido no puede exceder 60 caracteres"),
});

export const employeeUpdateSchema = employeeSchema.omit({ dni: true });

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
