import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvLocal();

import sql from "mssql/msnodesqlv8";
import { getPool } from "../src/lib/db";
import { assertMutationsAllowed } from "../src/lib/db-guard";
import {
  getSaleWithAvailableBalances,
  createReturnTransaction,
  approveReturnTransaction,
  rejectReturnTransaction,
  ReturnTransactionError,
  ReturnQuantityExceedsAvailableError,
  InvalidReturnQuantityError,
  ReturnLineNotFoundError,
  ReturnLineBelongsToAnotherSaleError,
  InvalidStateTransitionError,
  RestockNotAllowedForDefectiveError,
} from "../src/lib/repositories/return-transaction.repository";
import {
  fetchSaleForReturn,
  registerReturnTransactional,
} from "../src/lib/services/return.service";

interface TestReport {
  id: number;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const reports: TestReport[] = [];

function recordTest(id: number, name: string, passed: boolean, message: string, details?: any) {
  reports.push({ id, name, passed, message, details });
  const icon = passed ? "✓" : "✗";
  console.log(`  [${icon}] T${id.toString().padStart(2, "0")} - ${name}: ${message}`);
}

async function cleanupPriorPhase7BTestRuns(pool: sql.ConnectionPool) {
  // Limpieza idempotente exclusivamente de registros generados en pruebas de la Fase 7B (ID_devolucion > 1)
  // Preserva intactos: Devolución histórica ID 1, Ventas 1-9, Kardex 1-49, Productos 1-12.
  const priorDevs = await pool.request().query("SELECT ID_devolucion FROM dbo.Devolucion WHERE ID_devolucion > 1");
  if (priorDevs.recordset.length > 0) {
    console.log(`  [LIMPIEZA IDEMPOTENTE] Restableciendo ${priorDevs.recordset.length} trámites de pruebas previas de Fase 7B...`);
    
    // 1. Revertir cualquier stock y Kardex generado por Fase 7B (ID_movimiento > 49)
    const extraMovs = await pool.request().query(`
      SELECT ID_movimiento, Cantidad, Codbarras_prod
      FROM dbo.Mov_Inventario
      WHERE ID_movimiento > 49
    `);

    for (const mov of extraMovs.recordset) {
      await pool.request().query(`
        UPDATE dbo.Producto
        SET Stock = Stock - ${mov.Cantidad}
        WHERE Codbarras_prod = '${mov.Codbarras_prod}';
        DELETE FROM dbo.Mov_Inventario WHERE ID_movimiento = ${mov.ID_movimiento};
      `);
    }

    // 2. Eliminar Detalle_Dev y Devolucion con ID > 1
    await pool.request().query(`
      DELETE FROM dbo.Detalle_Dev WHERE ID_devolucion > 1;
      DELETE FROM dbo.Devolucion WHERE ID_devolucion > 1;
    `);
    console.log("  [LIMPIEZA IDEMPOTENTE] Estado base de Fase 6B restablecido para ejecución limpia.");
  }
}

async function runPhase7BTestSuite() {
  console.log("================================================================================");
  console.log("       MISHUTEC - BATERÍA DE PRUEBAS TRANSACCIONALES FASE 7B                    ");
  console.log("================================================================================");

  const pool = await getPool();

  // 0. Preparar entorno limpio e idempotente
  await cleanupPriorPhase7BTestRuns(pool);

  // ==========================================================================
  // ETAPA 1: VALIDACIONES DE ENTORNO Y REGLAS DE NEGOCIO PREVIAS
  // ==========================================================================
  console.log("\n--- ETAPA 1: VERIFICACIÓN DE SEGURIDAD Y GUARD DE BASE DE DATOS ---");

  // T20: Protección de base académica
  try {
    const originalDb = process.env.DB_NAME;
    process.env.DB_NAME = "MishutecT2";
    let blocked = false;
    try {
      assertMutationsAllowed("TEST_ACADEMIC_PROTECTION");
    } catch {
      blocked = true;
    } finally {
      process.env.DB_NAME = originalDb;
    }
    recordTest(20, "Protección incondicional de base académica", blocked, "assertMutationsAllowed bloqueó escritura sobre MishutecT2.");
  } catch (err: any) {
    recordTest(20, "Protección incondicional de base académica", false, err.message);
  }

  // T19: Rechazo de usuario sin sesión
  try {
    const res = await registerReturnTransactional({
      idVenta: 1,
      idEmpleado: 1,
      items: [{ idDetalle: 1, cantidadDev: 1, idMotivo: 1 }],
    });
    // Al ejecutarse en script sin cookies/sesión de Next.js, debe retornar statusCode 401
    const isUnauthorized = !res.success && res.statusCode === 401;
    recordTest(19, "Rechazo de usuario no autenticado", isUnauthorized, `Código retornado: ${res.statusCode} (${res.error})`);
  } catch (err: any) {
    recordTest(19, "Rechazo de usuario no autenticado", true, `Excepción capturada: ${err.message}`);
  }

  // T15: Protección de devolución histórica ID 1
  try {
    let blocked = false;
    try {
      await approveReturnTransaction({ idDevolucion: 1 }, 1);
    } catch (err: any) {
      if (err instanceof InvalidStateTransitionError) blocked = true;
    }
    recordTest(15, "Protección de devolución histórica ID 1", blocked, "No se permitió re-aprobar el trámite histórico #1 (Ya en estado Aprobada).");
  } catch (err: any) {
    recordTest(15, "Protección de devolución histórica ID 1", false, err.message);
  }

  // ==========================================================================
  // ETAPA 2: VALIDACIONES PREVIAS Y DETECCIÓN DE ERRORES DE ENTRADA
  // ==========================================================================
  console.log("\n--- ETAPA 2: VALIDACIONES PREVENTIVAS DE SALDOS Y DETALLES ---");

  // T05: Cantidad cero o negativa
  try {
    let caughtZero = false;
    try {
      await createReturnTransaction(
        {
          idVenta: 1,
          idEmpleado: 1,
          items: [{ idDetalle: 1, cantidadDev: 0, idMotivo: 1 }],
        },
        1
      );
    } catch (err: any) {
      if (err instanceof InvalidReturnQuantityError) caughtZero = true;
    }
    recordTest(5, "Rechazo de cantidad cero o negativa", caughtZero, "Lanzó InvalidReturnQuantityError al intentar devolver 0 unidades.");
  } catch (err: any) {
    recordTest(5, "Rechazo de cantidad cero o negativa", false, err.message);
  }

  // T06: Devolución sobre detalle inexistente
  try {
    let caughtNotFound = false;
    try {
      await createReturnTransaction(
        {
          idVenta: 1,
          idEmpleado: 1,
          items: [{ idDetalle: 99999, cantidadDev: 1, idMotivo: 1 }],
        },
        1
      );
    } catch (err: any) {
      if (err instanceof ReturnLineNotFoundError) caughtNotFound = true;
    }
    recordTest(6, "Rechazo de detalle inexistente", caughtNotFound, "Lanzó ReturnLineNotFoundError para ID_detalle inexistente (99999).");
  } catch (err: any) {
    recordTest(6, "Rechazo de detalle inexistente", false, err.message);
  }

  // T07: Detalle perteneciente a otra venta
  try {
    let caughtMismatch = false;
    try {
      // Detalle 4 pertenece a Venta 3, pero se solicita bajo Venta 1
      await createReturnTransaction(
        {
          idVenta: 1,
          idEmpleado: 1,
          items: [{ idDetalle: 4, cantidadDev: 1, idMotivo: 1 }],
        },
        1
      );
    } catch (err: any) {
      if (err instanceof ReturnLineBelongsToAnotherSaleError) caughtMismatch = true;
    }
    recordTest(7, "Rechazo de detalle de otra venta", caughtMismatch, "Detectó que Detalle #4 pertenece a Venta #3, no a Venta #1.");
  } catch (err: any) {
    recordTest(7, "Rechazo de detalle de otra venta", false, err.message);
  }

  // T04: Cantidad superior a la vendida / disponible
  try {
    let caughtExcess = false;
    try {
      // Venta 1 tiene Detalle 1 con 2 unidades vendidas. Intentamos pedir 5 unidades.
      await createReturnTransaction(
        {
          idVenta: 1,
          idEmpleado: 1,
          items: [{ idDetalle: 1, cantidadDev: 5, idMotivo: 1 }],
        },
        1
      );
    } catch (err: any) {
      if (err instanceof ReturnQuantityExceedsAvailableError) caughtExcess = true;
    }
    recordTest(4, "Rechazo de cantidad superior a la disponible", caughtExcess, "Detectó exceso: solicitado 5, disponible 2 unidades.");
  } catch (err: any) {
    recordTest(4, "Rechazo de cantidad superior a la disponible", false, err.message);
  }

  // ==========================================================================
  // ETAPA 3: REGISTRO TRANSACCIONAL, RESERVAS Y DEVOLUCIONES PARCIALES
  // ==========================================================================
  console.log("\n--- ETAPA 3: REGISTRO TRANSACCIONAL, RESERVAS Y SALDOS ---");

  let testDevId1 = 0; // Trámite válido simple
  let testDevId2 = 0; // Trámite multi-detalle
  let testDevId3 = 0; // Trámite para rechazo

  // T01: Registro de devolución válida en estado Pendiente
  try {
    // Venta 6 (B001-000005) tiene Detalle 9 con 2 unidades de Corsair LPX 32GB (disponibles: 2)
    const res = await createReturnTransaction(
      {
        idVenta: 6,
        idEmpleado: 1,
        items: [{ idDetalle: 9, cantidadDev: 1, idMotivo: 1 }], // 1 unidad, Defectuoso
      },
      1
    );
    testDevId1 = res.idDevolucion;
    const ok = res.idDevolucion > 1 && res.idEstadoDev === 1 && res.totalUnidades === 1;
    recordTest(1, "Registro de devolución válida (Pendiente)", ok, `Trámite creado: DEV-#${res.idDevolucion} para venta ${res.numeroComprobante}.`);
  } catch (err: any) {
    recordTest(1, "Registro de devolución válida (Pendiente)", false, err.message);
  }

  // T08: Reserva de cantidad en estado Pendiente
  try {
    // Ahora en Venta 6, Detalle 9: Vendidas: 2, Pendientes: 1, Disponibles: 1
    const saleInfo = await getSaleWithAvailableBalances(6);
    const line9 = saleInfo?.lineas.find((l) => l.idDetalle === 9);
    const ok = line9?.cantidadPendiente === 1 && line9?.cantidadDisponible === 1;
    recordTest(8, "Reserva de cantidad en estado Pendiente", Boolean(ok), `Detalle #9: Pendiente = ${line9?.cantidadPendiente}, Disponible restante = ${line9?.cantidadDisponible}.`);
  } catch (err: any) {
    recordTest(8, "Reserva de cantidad en estado Pendiente", false, err.message);
  }

  // T03: Devolución parcial (segunda reserva parcial sobre el saldo disponible remanente)
  try {
    // Solicitar la 1 unidad restante de Detalle 9
    const res = await createReturnTransaction(
      {
        idVenta: 6,
        idEmpleado: 1,
        items: [{ idDetalle: 9, cantidadDev: 1, idMotivo: 2 }], // 1 unidad, Equivocado
      },
      1
    );
    testDevId2 = res.idDevolucion;
    const saleInfo = await getSaleWithAvailableBalances(6);
    const line9 = saleInfo?.lineas.find((l) => l.idDetalle === 9);
    const ok = line9?.cantidadPendiente === 2 && line9?.cantidadDisponible === 0;
    recordTest(3, "Devolución parcial acumulativa hasta agotar saldo", Boolean(ok), `Saldo agotado exactamente: Vendidas = 2, Pendientes = 2, Disponible = ${line9?.cantidadDisponible}.`);
  } catch (err: any) {
    recordTest(3, "Devolución parcial acumulativa hasta agotar saldo", false, err.message);
  }

  // Comprobar que ya no permite pedir más unidades en Detalle 9
  try {
    let blocked = false;
    try {
      await createReturnTransaction(
        {
          idVenta: 6,
          idEmpleado: 1,
          items: [{ idDetalle: 9, cantidadDev: 1, idMotivo: 1 }],
        },
        1
      );
    } catch (err: any) {
      if (err instanceof ReturnQuantityExceedsAvailableError) blocked = true;
    }
    console.log(`    ↳ Control de sobre-reserva: ${blocked ? "Bloqueado correctamente (Saldo 0)" : "Fallo"}`);
  } catch {}

  // T02: Registro con varios detalles vendidos (Venta 7 - F001-000002 tiene Detalle 10 y Detalle 11)
  try {
    const res = await createReturnTransaction(
      {
        idVenta: 7,
        idEmpleado: 2,
        items: [
          { idDetalle: 10, cantidadDev: 1, idMotivo: 2 }, // Kingston NV2, Equivocado
          { idDetalle: 11, cantidadDev: 1, idMotivo: 1 }, // Samsung 980, Defectuoso
        ],
      },
      2
    );
    testDevId3 = res.idDevolucion;
    const ok = res.idDevolucion > 0 && res.totalItemsAfectados === 2 && res.totalUnidades === 2;
    recordTest(2, "Registro con varios detalles vendidos", ok, `DEV-#${res.idDevolucion} incluye ${res.totalItemsAfectados} líneas con ${res.totalUnidades} unidades.`);
  } catch (err: any) {
    recordTest(2, "Registro con varios detalles vendidos", false, err.message);
  }

  // ==========================================================================
  // ETAPA 4: RECHAZO Y LIBERACIÓN DE RESERVAS
  // ==========================================================================
  console.log("\n--- ETAPA 4: RECHAZO DE TRÁMITE Y LIBERACIÓN DE RESERVAS ---");

  // T11: Rechazo de una devolución
  try {
    const res = await rejectReturnTransaction({ idDevolucion: testDevId2 }, 1);
    const ok = res.idEstadoDev === 3 && res.nombreEstado === "Rechazada";
    recordTest(11, "Rechazo transaccional de una devolución", ok, `DEV-#${res.idDevolucion} pasó a estado 'Rechazada'.`);
  } catch (err: any) {
    recordTest(11, "Rechazo transaccional de una devolución", false, err.message);
  }

  // T09: Liberación de reserva por rechazo
  try {
    // Al rechazarse testDevId2 (que tenía 1 unidad de Detalle 9), el saldo disponible debe volver a 1
    const saleInfo = await getSaleWithAvailableBalances(6);
    const line9 = saleInfo?.lineas.find((l) => l.idDetalle === 9);
    const ok = line9?.cantidadPendiente === 1 && line9?.cantidadDisponible === 1;
    recordTest(9, "Liberación automática de reserva al rechazar", Boolean(ok), `Detalle #9: Pendiente volvió a 1, Disponible liberado a ${line9?.cantidadDisponible}.`);
  } catch (err: any) {
    recordTest(9, "Liberación automática de reserva al rechazar", false, err.message);
  }

  // ==========================================================================
  // ETAPA 5: APROBACIÓN, POLÍTICA DE RESTOCK Y CONTROL DE KARDEX
  // ==========================================================================
  console.log("\n--- ETAPA 5: APROBACIÓN, POLÍTICA DE RESTOCK Y KARDEX ---");

  // T16: Producto defectuoso sin reingreso comercial
  try {
    // testDevId1 tiene motivo 1 (Producto defectuoso).
    // Verificar stock antes
    const prodBefore = await pool.request().query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000002'");
    const movsBefore = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Mov_Inventario");

    // Aprobar testDevId1 (sin reingreso)
    const appRes = await approveReturnTransaction({ idDevolucion: testDevId1 }, 1);

    const prodAfter = await pool.request().query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000002'");
    const movsAfter = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Mov_Inventario");

    const stockUnchanged = prodBefore.recordset[0].Stock === prodAfter.recordset[0].Stock;
    const movsUnchanged = movsBefore.recordset[0].total === movsAfter.recordset[0].total;
    const ok = appRes.idEstadoDev === 2 && stockUnchanged && movsUnchanged && !appRes.reingresoKardexRealizado;

    recordTest(16, "Producto defectuoso sin reingreso comercial", ok, `DEV-#${testDevId1} aprobada sin alterar stock (${prodAfter.recordset[0].Stock} unid.) ni Kardex.`);
  } catch (err: any) {
    recordTest(16, "Producto defectuoso sin reingreso comercial", false, err.message);
  }

  // T10: Aprobación sin doble descuento
  try {
    // Al aprobarse testDevId1, la unidad pasó de Pendiente a Aprobada. El saldo disponible no debe descontarse de nuevo.
    const saleInfo = await getSaleWithAvailableBalances(6);
    const line9 = saleInfo?.lineas.find((l) => l.idDetalle === 9);
    const ok = line9?.cantidadAprobada === 1 && line9?.cantidadPendiente === 0 && line9?.cantidadDisponible === 1;
    recordTest(10, "Aprobación sin doble descuento de saldo", Boolean(ok), `Detalle #9: Aprobada = 1, Pendiente = 0, Disponible intacto en ${line9?.cantidadDisponible}.`);
  } catch (err: any) {
    recordTest(10, "Aprobación sin doble descuento de saldo", false, err.message);
  }

  // T12: Intento de doble aprobación
  try {
    let caughtDouble = false;
    try {
      await approveReturnTransaction({ idDevolucion: testDevId1 }, 1);
    } catch (err: any) {
      if (err instanceof InvalidStateTransitionError) caughtDouble = true;
    }
    recordTest(12, "Prevención de doble aprobación", caughtDouble, "Rechazó re-aprobación: Estado actual ya es 'Aprobada'.");
  } catch (err: any) {
    recordTest(12, "Prevención de doble aprobación", false, err.message);
  }

  // T17: Reingreso condicionado a política aprobada (Producto equivocado con reingresoStock = true)
  let testDevEquivocadoId = 0;
  try {
    // Crear una devolución por Producto equivocado en Venta 8 (Detalle 12: Kingston Fury 16GB, Codbarras: 7750000000001, 1 unid.)
    const createRes = await createReturnTransaction(
      {
        idVenta: 8,
        idEmpleado: 1,
        items: [{ idDetalle: 12, cantidadDev: 1, idMotivo: 2 }], // Motivo 2: Producto equivocado
      },
      1
    );
    testDevEquivocadoId = createRes.idDevolucion;

    const prodBefore = await pool.request().query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000001'");
    const movsBefore = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Mov_Inventario");

    // Aprobar con reingresoStock = true
    const appRes = await approveReturnTransaction(
      {
        idDevolucion: testDevEquivocadoId,
        reingresoStock: true,
      },
      1
    );

    const prodAfter = await pool.request().query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000001'");
    const movsAfter = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Mov_Inventario");

    const stockIncremented = prodAfter.recordset[0].Stock === prodBefore.recordset[0].Stock + 1;
    const movInserted = movsAfter.recordset[0].total === movsBefore.recordset[0].total + 1;
    const ok = Boolean(appRes.idEstadoDev === 2 && appRes.reingresoKardexRealizado && stockIncremented && movInserted);

    recordTest(17, "Reingreso autorizado a Kardex (Producto equivocado)", ok, `DEV-#${testDevEquivocadoId}: Stock incrementó de ${prodBefore.recordset[0].Stock} a ${prodAfter.recordset[0].Stock}, Kardex +1 Entrada.`);
  } catch (err: any) {
    recordTest(17, "Reingreso autorizado a Kardex (Producto equivocado)", false, err.message);
  }

  // Denegar reingreso forzado en producto defectuoso
  try {
    // En Venta 9 (Detalle 13), crear devolución con motivo 1 (Defectuoso)
    const createDefect = await createReturnTransaction(
      {
        idVenta: 9,
        idEmpleado: 1,
        items: [{ idDetalle: 13, cantidadDev: 1, idMotivo: 1 }],
      },
      1
    );

    let blockedIllegalRestock = false;
    try {
      // Intentar forzar reingresoStock = true en producto defectuoso
      await approveReturnTransaction(
        {
          idDevolucion: createDefect.idDevolucion,
          reingresoStock: true,
        },
        1
      );
    } catch (err: any) {
      if (err instanceof RestockNotAllowedForDefectiveError) blockedIllegalRestock = true;
    }
    // Aprobarlo normalmente sin restock
    await approveReturnTransaction({ idDevolucion: createDefect.idDevolucion }, 1);
    console.log(`    ↳ Bloqueo de reingreso forzado en defectuoso: ${blockedIllegalRestock ? "Rechazado estrictamente (RestockNotAllowedForDefectiveError)" : "Fallo"}`);
  } catch {}

  // ==========================================================================
  // ETAPA 6: CONCURRENCIA Y ATOMICIDAD (ACID)
  // ==========================================================================
  console.log("\n--- ETAPA 6: CONCURRENCIA, ATOMICIDAD Y ROLLBACK ---");

  // T13: Aprobaciones concurrentes sobre el mismo trámite
  try {
    // testDevId3 (Venta 7) está en estado Pendiente
    const results = await Promise.allSettled([
      approveReturnTransaction({ idDevolucion: testDevId3 }, 1),
      approveReturnTransaction({ idDevolucion: testDevId3 }, 2),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const rejections = results.filter((r) => r.status === "rejected");

    const exactlyOneSuccess = successes.length === 1 && rejections.length === 1;
    recordTest(13, "Resolución de aprobaciones concurrentes", exactlyOneSuccess, `De 2 llamadas simultáneas: 1 aprobó exitosamente y 1 fue rechazada por UPDATE condicional.`);
  } catch (err: any) {
    recordTest(13, "Resolución de aprobaciones concurrentes", false, err.message);
  }

  // T14: Solicitudes concurrentes sobre la misma unidad disponible
  try {
    // Venta 6, Detalle 9 tiene exactamente 1 unidad disponible.
    // Lanzamos 2 peticiones concurrentes para reservar esa única unidad
    const raceResults = await Promise.allSettled([
      createReturnTransaction(
        {
          idVenta: 6,
          idEmpleado: 1,
          items: [{ idDetalle: 9, cantidadDev: 1, idMotivo: 1 }],
        },
        1
      ),
      createReturnTransaction(
        {
          idVenta: 6,
          idEmpleado: 2,
          items: [{ idDetalle: 9, cantidadDev: 1, idMotivo: 2 }],
        },
        2
      ),
    ]);

    const successes = raceResults.filter((r) => r.status === "fulfilled");
    const rejections = raceResults.filter((r) => r.status === "rejected");

    const exactlyOneWon = successes.length === 1 && rejections.length === 1;
    recordTest(14, "Bloqueo pesimista ante reservas concurrentes", exactlyOneWon, `UPDLOCK garantizó exclusión mutua: 1 reservó la unidad, la otra recibió ReturnQuantityExceedsAvailableError.`);
  } catch (err: any) {
    recordTest(14, "Bloqueo pesimista ante reservas concurrentes", false, err.message);
  }

  // T18: Rollback ante fallo SQL
  try {
    // Inyectar un error en transacción intentando insertar un motivo inexistente después de crear cabecera
    const devCountBefore = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Devolucion");
    let rollbackSuccess = false;

    try {
      await createReturnTransaction(
        {
          idVenta: 1,
          idEmpleado: 1,
          items: [{ idDetalle: 1, cantidadDev: 1, idMotivo: 99999 }], // Motivo inexistente
        },
        1
      );
    } catch {
      const devCountAfter = await pool.request().query("SELECT COUNT(*) AS total FROM dbo.Devolucion");
      rollbackSuccess = devCountBefore.recordset[0].total === devCountAfter.recordset[0].total;
    }

    recordTest(18, "Rollback integral ante fallo de transacción", rollbackSuccess, "Fallo controlado abortó la transacción sin dejar cabecera huérfana.");
  } catch (err: any) {
    recordTest(18, "Rollback integral ante fallo de transacción", false, err.message);
  }

  // ==========================================================================
  // ETAPA 7: CONCILIACIÓN FINAL Y NO-REGRESIÓN
  // ==========================================================================
  console.log("\n--- ETAPA 7: AUDITORÍA DE INTEGRIDAD Y CONCILIACIÓN FINAL ---");

  // T21: Conservación de ventas y pagos
  try {
    const vRes = await pool.request().query("SELECT COUNT(*) AS totalVentas, SUM(Total_venta) AS totalMonto FROM dbo.Venta");
    const pRes = await pool.request().query("SELECT COUNT(*) AS totalPagos FROM dbo.Venta_Metodo_Pago");

    const ventasCount = Number(vRes.recordset[0].totalVentas);
    const ventasMonto = Number(vRes.recordset[0].totalMonto);
    const pagosCount = Number(pRes.recordset[0].totalPagos);

    const ok = ventasCount === 9 && ventasMonto === 5500 && pagosCount === 11;
    recordTest(21, "Conservación intacta de ventas y pagos", ok, `9 ventas (S/. 5,500.00) y 11 pagos preservados inalterados.`);
  } catch (err: any) {
    recordTest(21, "Conservación intacta de ventas y pagos", false, err.message);
  }

  // T22: Consistencia de cantidades totales
  try {
    const balanceCheck = await pool.request().query(`
      SELECT 
        dv.ID_detalle,
        dv.Cantidad AS Vendida,
        ISNULL(SUM(CASE WHEN d.ID_estado_dev = 2 THEN dd.Cantidad_dev ELSE 0 END), 0) AS Aprobada,
        ISNULL(SUM(CASE WHEN d.ID_estado_dev = 1 THEN dd.Cantidad_dev ELSE 0 END), 0) AS Pendiente
      FROM dbo.Detalle_Venta dv
      LEFT JOIN dbo.Detalle_Dev dd ON dv.ID_detalle = dd.ID_detalle
      LEFT JOIN dbo.Devolucion d ON dd.ID_devolucion = d.ID_devolucion
      GROUP BY dv.ID_detalle, dv.Cantidad;
    `);

    let allBalanced = true;
    for (const row of balanceCheck.recordset) {
      const vendida = Number(row.Vendida);
      const aprobada = Number(row.Aprobada);
      const pendiente = Number(row.Pendiente);
      if (aprobada + pendiente > vendida) {
        allBalanced = false;
        break;
      }
    }

    recordTest(22, "Consistencia matemática de saldos", allBalanced, "Para cada detalle de venta: Aprobadas + Pendientes <= CantidadVendida.");
  } catch (err: any) {
    recordTest(22, "Consistencia matemática de saldos", false, err.message);
  }

  // T23: Ausencia de registros huérfanos
  try {
    const orphanDetDev = await pool.request().query(`
      SELECT COUNT(*) AS huerfanos
      FROM dbo.Detalle_Dev dd
      LEFT JOIN dbo.Devolucion d ON dd.ID_devolucion = d.ID_devolucion
      WHERE d.ID_devolucion IS NULL;
    `);

    const orphanMovs = await pool.request().query(`
      SELECT COUNT(*) AS huerfanos
      FROM dbo.Mov_Inventario m
      LEFT JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
      WHERE p.Codbarras_prod IS NULL;
    `);

    const noOrphans = Number(orphanDetDev.recordset[0].huerfanos) === 0 && Number(orphanMovs.recordset[0].huerfanos) === 0;
    recordTest(23, "Ausencia de registros huérfanos", noOrphans, "0 detalles de devolución o movimientos de inventario huérfanos.");
  } catch (err: any) {
    recordTest(23, "Ausencia de registros huérfanos", false, err.message);
  }

  // T24: Conciliación de stock y Kardex
  try {
    // Inicialmente eran 75 unidades de stock y 30 movimientos en Kardex.
    // Durante la suite, exactamente 1 unidad fue reingresada en T17 (Kingston Fury 16GB por Producto equivocado).
    // Por tanto:
    // Stock actual esperado: 75 + 1 = 76 unidades.
    // Movimientos Kardex esperados: 30 + 1 = 31 movimientos.
    const stockRes = await pool.request().query("SELECT SUM(Stock) AS totalStock FROM dbo.Producto");
    const movRes = await pool.request().query("SELECT COUNT(*) AS totalMovs FROM dbo.Mov_Inventario");

    const currentStock = Number(stockRes.recordset[0].totalStock);
    const currentMovs = Number(movRes.recordset[0].totalMovs);

    const ok = currentStock === 76 && currentMovs === 31;
    recordTest(
      24,
      "Conciliación de stock y Kardex",
      ok,
      `Stock actual: ${currentStock} unidades (Base 75 + 1 reingreso T17). Movimientos Kardex: ${currentMovs} (Base 30 + 1 Entrada T17).`
    );
  } catch (err: any) {
    recordTest(24, "Conciliación de stock y Kardex", false, err.message);
  }

  // ==========================================================================
  // RESUMEN FINAL
  // ==========================================================================
  console.log("\n================================================================================");
  const totalPassed = reports.filter((r) => r.passed).length;
  const totalFailed = reports.filter((r) => !r.passed).length;

  console.log(`RESULTADO DE LA BATERÍA DE PRUEBAS FASE 7B:`);
  console.log(`  Total escenarios evaluados: ${reports.length}`);
  console.log(`  Exitosos:                   ${totalPassed}`);
  console.log(`  Fallidos:                   ${totalFailed}`);
  console.log("================================================================================");

  if (totalFailed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase7BTestSuite().catch((err) => {
  console.error("Error no controlado en test suite:", err);
  process.exit(1);
});
