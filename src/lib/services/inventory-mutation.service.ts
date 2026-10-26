import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../auth/session";
import {
  inventoryMovementInputSchema,
  InventoryMovementInput,
} from "../validations/inventory-mutation.schema";
import {
  recordInventoryEntryTransactional,
  recordInventoryExitTransactional,
  MovementResult,
} from "../repositories/inventory-mutation.repository";

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Servicio para registrar una entrada física de inventario.
 */
export async function executeInventoryEntry(
  rawInput: unknown
): Promise<ServiceResult<MovementResult>> {
  try {
    // 1. Requerir sesión administrativa activa
    await requireAdminSession();

    // 2. Validar con Zod
    const parsed = inventoryMovementInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos de entrada inválidos";
      return {
        success: false,
        error: firstError,
        statusCode: 400,
      };
    }

    // 3. Ejecutar transacción
    const result = await recordInventoryEntryTransactional(parsed.data);

    // 4. Revalidar rutas afectadas
    revalidatePath("/inventario");
    revalidatePath("/productos");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result,
      statusCode: 201,
    };
  } catch (err: any) {
    console.error("Error en executeInventoryEntry:", err);

    if (err.name === "UnauthorizedError") {
      return {
        success: false,
        error: "Sesión administrativa requerida para registrar movimientos de inventario.",
        statusCode: 401,
      };
    }

    if (err.name === "AcademicDatabaseProtectedError") {
      return {
        success: false,
        error: err.message,
        statusCode: 403,
      };
    }

    if (err.name === "DiscontinuedProductOperationError") {
      return {
        success: false,
        error: err.message,
        statusCode: 422,
      };
    }

    if (err.name === "ProductNotFoundError" || err.name === "EmployeeNotFoundError") {
      return {
        success: false,
        error: err.message,
        statusCode: 404,
      };
    }

    return {
      success: false,
      error: err.message || "Error interno al registrar la entrada de inventario.",
      statusCode: 500,
    };
  }
}

/**
 * Servicio para registrar una salida física de inventario.
 */
export async function executeInventoryExit(
  rawInput: unknown
): Promise<ServiceResult<MovementResult>> {
  try {
    // 1. Requerir sesión administrativa activa
    await requireAdminSession();

    // 2. Validar con Zod
    const parsed = inventoryMovementInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos de salida inválidos";
      return {
        success: false,
        error: firstError,
        statusCode: 400,
      };
    }

    // 3. Ejecutar transacción
    const result = await recordInventoryExitTransactional(parsed.data);

    // 4. Revalidar rutas afectadas
    revalidatePath("/inventario");
    revalidatePath("/productos");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result,
      statusCode: 201,
    };
  } catch (err: any) {
    console.error("Error en executeInventoryExit:", err);

    if (err.name === "UnauthorizedError") {
      return {
        success: false,
        error: "Sesión administrativa requerida para registrar salidas de inventario.",
        statusCode: 401,
      };
    }

    if (err.name === "AcademicDatabaseProtectedError") {
      return {
        success: false,
        error: err.message,
        statusCode: 403,
      };
    }

    if (err.name === "InsufficientStockError") {
      return {
        success: false,
        error: err.message,
        statusCode: 400,
      };
    }

    if (err.name === "DiscontinuedProductOperationError") {
      return {
        success: false,
        error: err.message,
        statusCode: 422,
      };
    }

    if (err.name === "ProductNotFoundError" || err.name === "EmployeeNotFoundError") {
      return {
        success: false,
        error: err.message,
        statusCode: 404,
      };
    }

    return {
      success: false,
      error: err.message || "Error interno al registrar la salida de inventario.",
      statusCode: 500,
    };
  }
}
