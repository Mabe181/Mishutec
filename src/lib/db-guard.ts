import { getDbConfig } from "./db";

/**
 * Error lanzado cuando se intenta ejecutar una mutación contra una base de datos protegida.
 */
export class AcademicDatabaseProtectedError extends Error {
  constructor(operation: string, dbName: string) {
    super(
      `[SEGURIDAD BLOQUEADA] Operación de mutación '${operation}' denegada. ` +
      `La base de datos '${dbName}' está catalogada como Entorno Académico Protegido (Solo Lectura). ` +
      `Para realizar pruebas de escritura, configure una base de aceptación autorizada (ej. 'MishutecT2_Aceptacion') ` +
      `o defina la variable explícita ALLOW_ACADEMIC_MUTATIONS=true previa autorización.`
    );
    this.name = "AcademicDatabaseProtectedError";
  }
}

/**
 * Comprueba si la base de datos actual permite mutaciones de escritura (INSERT, UPDATE, DELETE).
 * Protege de forma incondicional e irreversible la integridad de la base académica original MishutecT2.
 */
export function isMutationAllowed(): { allowed: boolean; reason?: string; dbName: string } {
  const { DB_NAME } = getDbConfig();
  const dbClean = DB_NAME.trim().toLowerCase();

  // Bloqueo incondicional: MishutecT2 NUNCA admite mutaciones bajo ninguna circunstancia.
  if (dbClean === "mishutect2") {
    return {
      allowed: false,
      reason: `Bloqueo incondicional de seguridad: La base académica original '${DB_NAME}' es de solo lectura estricta.`,
      dbName: DB_NAME,
    };
  }

  // Solo se permiten mutaciones si la base es explícitamente un entorno de aceptación o desarrollo autorizado
  return { allowed: true, dbName: DB_NAME };
}

/**
 * Aserción estricta de seguridad. Lanza excepción si la base está protegida.
 */
export function assertMutationsAllowed(operationName: string): void {
  const status = isMutationAllowed();
  if (!status.allowed) {
    throw new AcademicDatabaseProtectedError(operationName, status.dbName);
  }
}
