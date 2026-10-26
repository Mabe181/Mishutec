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
import { getPool, closePool } from "../src/lib/db";
import {
  recordInventoryEntryTransactional,
  recordInventoryExitTransactional,
  InsufficientStockError,
  DiscontinuedProductOperationError,
} from "../src/lib/repositories/inventory-mutation.repository";
import {
  getInventoryDashboardStats,
  getKardexMovements,
} from "../src/lib/repositories/inventory.repository";
import {
  executeInventoryEntry,
  executeInventoryExit,
} from "../src/lib/services/inventory-mutation.service";
import { inventoryMovementInputSchema } from "../src/lib/validations/inventory-mutation.schema";

async function runInventoryTests() {
  console.log("================================================================================");
  console.log("             MISHUTEC - PRUEBAS DE INVENTARIO Y KARDEX (FASE 4)                 ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail = "") {
    if (condition) {
      console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  const pool = await getPool();

  try {
    const activeDbRes = await pool.request().query("SELECT DB_NAME() AS db");
    const activeDb = activeDbRes.recordset[0].db;
    console.log(`[INFO] Base de datos activa para pruebas: ${activeDb}`);
    assert(
      "Entorno de pruebas: Base de aceptación MishutecT2_Aceptacion activa",
      activeDb.toLowerCase() === "mishutect2_aceptacion",
      `BD: ${activeDb}`
    );

    // 0. Preparar producto de prueba dedicado: 7750000000012
    const testBarcode = "7750000000012";
    const checkTestProd = await pool
      .request()
      .input("cod", sql.VarChar(13), testBarcode)
      .query("SELECT * FROM dbo.Producto WHERE Codbarras_prod = @cod");

    if (checkTestProd.recordset.length === 0) {
      console.log(`[SETUP] Creando producto de prueba ${testBarcode}...`);
      await pool.request().query(`
        INSERT INTO dbo.Producto (Codbarras_prod, Nombre_prod, Precio, Garantia_meses, Stock, ID_estado_prod, ID_categoria, ID_marca)
        VALUES ('${testBarcode}', 'Kingston FURY Beast 8GB DDR4 Test', 120.00, 24, 0, 2, 2, 1);
        INSERT INTO dbo.RAM (Codbarras_prod, Capacidad_gb, Velocidad_mhz)
        VALUES ('${testBarcode}', 8, 3200);
      `);
      console.log(`[SETUP] Producto de prueba ${testBarcode} creado con Stock = 0 (Agotado).`);
    } else {
      // Limpiar movimientos de prueba previos y restablecer a stock 0 (Agotado) para idempotencia
      await pool.request().query(`
        DELETE FROM dbo.Mov_Inventario WHERE Codbarras_prod = '${testBarcode}';
        UPDATE dbo.Producto SET Stock = 0, ID_estado_prod = 2 WHERE Codbarras_prod = '${testBarcode}';
      `);
    }

    // A. Entrada válida
    console.log("\n--- PRUEBA A: Entrada válida ---");
    const entryRes = await recordInventoryEntryTransactional({
      codbarras: testBarcode,
      cantidad: 10,
      idEmpleado: 1, // Carlos Vega Ramos
      fecha: new Date().toISOString().split("T")[0],
    });

    assert("Prueba A: Entrada registrada exitosamente", entryRes.idMovimiento > 0, `ID: ${entryRes.idMovimiento}`);
    assert("Prueba A: Tipo de movimiento es Entrada", entryRes.tipoMovimiento === "Entrada");
    assert("Prueba A: Stock anterior era 0", entryRes.stockAnterior === 0);
    assert("Prueba A: Stock nuevo es 10", entryRes.stockNuevo === 10);
    assert("Prueba G: Estado transitó de Agotado a Disponible", entryRes.estadoAnterior === "Agotado" && entryRes.estadoNuevo === "Disponible");

    // B. Salida válida
    console.log("\n--- PRUEBA B: Salida válida ---");
    const exitRes = await recordInventoryExitTransactional({
      codbarras: testBarcode,
      cantidad: 4,
      idEmpleado: 2, // Rosa Paredes Luna
      fecha: new Date().toISOString().split("T")[0],
    });

    assert("Prueba B: Salida registrada exitosamente", exitRes.idMovimiento > 0, `ID: ${exitRes.idMovimiento}`);
    assert("Prueba B: Tipo de movimiento es Salida", exitRes.tipoMovimiento === "Salida");
    assert("Prueba B: Stock anterior era 10", exitRes.stockAnterior === 10);
    assert("Prueba B: Stock nuevo es 6", exitRes.stockNuevo === 6);
    assert("Prueba B: Estado se mantiene Disponible", exitRes.estadoNuevo === "Disponible");

    // C. Rechazo de stock insuficiente
    console.log("\n--- PRUEBA C: Rechazo de stock insuficiente ---");
    let insufficientRejected = false;
    try {
      await recordInventoryExitTransactional({
        codbarras: testBarcode,
        cantidad: 10, // Stock actual es 6
        idEmpleado: 1,
        fecha: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      if (err instanceof InsufficientStockError) {
        insufficientRejected = true;
      }
    }
    assert("Prueba C: Salida que excede el stock fue rechazada", insufficientRejected);

    // D. Rechazo de cantidades negativas o cero
    console.log("\n--- PRUEBA D: Rechazo de cantidades negativas o cero ---");
    const invalidNegative = inventoryMovementInputSchema.safeParse({
      codbarras: testBarcode,
      cantidad: -5,
      idEmpleado: 1,
    });
    const invalidZero = inventoryMovementInputSchema.safeParse({
      codbarras: testBarcode,
      cantidad: 0,
      idEmpleado: 1,
    });
    assert("Prueba D: Cantidad negativa (-5) rechazada por Zod", !invalidNegative.success);
    assert("Prueba D: Cantidad cero (0) rechazada por Zod", !invalidZero.success);

    // E. Rollback por error
    console.log("\n--- PRUEBA E: Rollback por error simulado ---");
    const stockBeforeRollbackRes = await pool
      .request()
      .input("cod", sql.VarChar(13), testBarcode)
      .query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = @cod");
    const stockBeforeRollback = Number(stockBeforeRollbackRes.recordset[0].Stock);

    let rollbackTriggered = false;
    const errorTx = new sql.Transaction(pool);
    await errorTx.begin();
    try {
      const r1 = new sql.Request(errorTx);
      r1.input("cod", sql.VarChar(13), testBarcode);
      await r1.query("UPDATE dbo.Producto SET Stock = Stock + 50 WHERE Codbarras_prod = @cod");

      // Simular fallo forzado (violación de FK en empleado inexistente 999999)
      const r2 = new sql.Request(errorTx);
      r2.input("cod", sql.VarChar(13), testBarcode);
      await r2.query("INSERT INTO dbo.Mov_Inventario (Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado) VALUES (GETDATE(), 50, 1, @cod, 999999)");
      await errorTx.commit();
    } catch {
      await errorTx.rollback();
      rollbackTriggered = true;
    }

    const stockAfterRollbackRes = await pool
      .request()
      .input("cod", sql.VarChar(13), testBarcode)
      .query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = @cod");
    const stockAfterRollback = Number(stockAfterRollbackRes.recordset[0].Stock);

    assert("Prueba E: Error disparó Rollback transaccional", rollbackTriggered);
    assert("Prueba E: Stock no se modificó tras el Rollback", stockAfterRollback === stockBeforeRollback, `Stock: ${stockAfterRollback}`);

    // G. Actualización Disponible -> Agotado al llegar a 0
    console.log("\n--- PRUEBA G: Transición a Agotado al consumir todo el stock ---");
    const exitToZeroRes = await recordInventoryExitTransactional({
      codbarras: testBarcode,
      cantidad: 6, // Vaciamos los 6 restantes
      idEmpleado: 3, // Jorge Mendoza Cruz
      fecha: new Date().toISOString().split("T")[0],
    });

    assert("Prueba G: Salida de existencias remanentes exitosa", exitToZeroRes.stockNuevo === 0);
    assert("Prueba G: Estado transitó a Agotado", exitToZeroRes.estadoNuevo === "Agotado");

    // H. Protección de productos Descontinuados
    console.log("\n--- PRUEBA H: Protección de productos Descontinuados ---");
    let discontinuedEntryRejected = false;
    let discontinuedExitRejected = false;

    try {
      await recordInventoryEntryTransactional({
        codbarras: "7750000000011", // AMD Ryzen 5 5600X (Descontinuado en Fase 3B)
        cantidad: 5,
        idEmpleado: 1,
      });
    } catch (err) {
      if (err instanceof DiscontinuedProductOperationError) {
        discontinuedEntryRejected = true;
      }
    }

    try {
      await recordInventoryExitTransactional({
        codbarras: "7750000000011",
        cantidad: 1,
        idEmpleado: 1,
      });
    } catch (err) {
      if (err instanceof DiscontinuedProductOperationError) {
        discontinuedExitRejected = true;
      }
    }

    assert("Prueba H: Entrada sobre producto Descontinuado rechazada", discontinuedEntryRejected);
    assert("Prueba H: Salida sobre producto Descontinuado rechazada", discontinuedExitRejected);

    // I. Rechazo de usuario no autenticado en la capa de servicio
    console.log("\n--- PRUEBA I: Rechazo de usuario no autenticado ---");
    const unauthEntryRes = await executeInventoryEntry({
      codbarras: testBarcode,
      cantidad: 1,
      idEmpleado: 1,
    });
    const unauthExitRes = await executeInventoryExit({
      codbarras: testBarcode,
      cantidad: 1,
      idEmpleado: 1,
    });

    assert("Prueba I: Servicio de entrada sin sesión retorna 401", unauthEntryRes.statusCode === 401);
    assert("Prueba I: Servicio de salida sin sesión retorna 401", unauthExitRes.statusCode === 401);

    // J. Movimientos concurrentes sobre un producto (Prueba de Bloqueo UPDLOCK, ROWLOCK)
    console.log("\n--- PRUEBA J: Movimientos concurrentes sobre un producto ---");
    // Añadimos 20 unidades primero
    await recordInventoryEntryTransactional({
      codbarras: testBarcode,
      cantidad: 20,
      idEmpleado: 1,
    });

    // Ejecutamos 4 salidas de 3 unidades en paralelo (total 12 unidades)
    const concurrentSalidas = [
      recordInventoryExitTransactional({ codbarras: testBarcode, cantidad: 3, idEmpleado: 1 }),
      recordInventoryExitTransactional({ codbarras: testBarcode, cantidad: 3, idEmpleado: 2 }),
      recordInventoryExitTransactional({ codbarras: testBarcode, cantidad: 3, idEmpleado: 3 }),
      recordInventoryExitTransactional({ codbarras: testBarcode, cantidad: 3, idEmpleado: 1 }),
    ];

    await Promise.all(concurrentSalidas);

    const checkConcurrentStock = await pool
      .request()
      .input("cod", sql.VarChar(13), testBarcode)
      .query("SELECT Stock FROM dbo.Producto WHERE Codbarras_prod = @cod");
    const stockAfterConcurrent = Number(checkConcurrentStock.recordset[0].Stock);
    // 20 - (4 * 3) = 8 unidades esperadas
    assert("Prueba J: Salidas concurrentes serializadas atómicamente", stockAfterConcurrent === 8, `Stock: ${stockAfterConcurrent} (Esperado: 8)`);

    // K. Conciliación entre stock y movimientos en Kardex
    console.log("\n--- PRUEBA K: Conciliación entre stock y movimientos en Kardex ---");
    const kardexMovements = await getKardexMovements({ codbarras: testBarcode });
    const latestKardex = kardexMovements[0];

    assert("Prueba K: Kardex registra movimientos del producto", kardexMovements.length >= 4);
    assert(
      "Prueba K: Último saldo calculado del Kardex coincide con el stock físico",
      latestKardex.saldoCalculado === stockAfterConcurrent,
      `Kardex Saldo: ${latestKardex.saldoCalculado}, Stock: ${stockAfterConcurrent}`
    );

    // L. Integridad de la base académica MishutecT2
    console.log("\n--- PRUEBA L: Integridad estricta de la base académica MishutecT2 ---");
    const acadPool = await new sql.ConnectionPool({
      server: process.env.DB_SERVER,
      database: "MishutecT2",
      driver: "msnodesqlv8",
      connectionString: `Driver={ODBC Driver 18 for SQL Server};Server=${process.env.DB_SERVER};Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;`,
    } as any).connect();

    const [acadProd, acadStock, acadVent, acadImp] = await Promise.all([
      acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Producto"),
      acadPool.request().query("SELECT SUM(Stock) AS totalStock FROM dbo.Producto"),
      acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Venta"),
      acadPool.request().query("SELECT SUM(Total_venta) AS totalVenta FROM dbo.Venta"),
    ]);

    const acadTotalProd = Number(acadProd.recordset[0].total);
    const acadTotalStock = Number(acadStock.recordset[0].totalStock);
    const acadTotalVent = Number(acadVent.recordset[0].total);
    const acadTotalImp = Number(acadImp.recordset[0].totalVenta);

    assert("Prueba L: Base académica conserva exactamente 10 productos", acadTotalProd === 10, `Productos: ${acadTotalProd}`);
    assert("Prueba L: Base académica conserva exactamente 73 unidades de stock", acadTotalStock === 73, `Stock: ${acadTotalStock}`);
    assert("Prueba L: Base académica conserva exactamente 5 ventas", acadTotalVent === 5, `Ventas: ${acadTotalVent}`);
    assert("Prueba L: Base académica conserva exactamente S/ 4,050.00 en ventas", acadTotalImp === 4050, `Total: S/ ${acadTotalImp}`);

    await acadPool.close();

    console.log("\n================================================================================");
    console.log(`                     RESUMEN: ${passed} PASADAS | ${failed} FALLADAS                   `);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await closePool();
  }
}

runInventoryTests().catch((err) => {
  console.error("Error fatal en pruebas de inventario:", err);
  process.exit(1);
});
