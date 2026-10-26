import fs from "fs";
import path from "path";

// Función auxiliar para cargar .env.local en procesos Node.js fuera de Next.js
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
import { isMutationAllowed, assertMutationsAllowed } from "../src/lib/db-guard";
import {
  executeSaleTransaction,
  InsufficientStockError,
  PaymentMismatchError,
  ProductDiscontinuedError,
  ClientNotFoundError,
  EmployeeNotFoundError,
} from "../src/lib/repositories/sale-transaction.repository";

interface TestReport {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const reports: TestReport[] = [];

function recordTest(name: string, passed: boolean, message: string, details?: any) {
  reports.push({ name, passed, message, details });
  const icon = passed ? "✓" : "✗";
  console.log(`  [${icon}] ${name}: ${message}`);
}

async function runPhase6BTests() {
  console.log("================================================================================");
  console.log("       MISHUTEC - BATERÍA DE PRUEBAS TRANSACCIONALES FASE 6B                    ");
  console.log("================================================================================");

  // 1. Verificación de entorno y seguridad
  console.log("\n--- ETAPA 1: VERIFICACIÓN DE SEGURIDAD Y GUARD DE BASE DE DATOS ---");
  const guardStatus = isMutationAllowed();
  console.log(`  Base de datos activa: ${guardStatus.dbName}`);

  if (guardStatus.dbName.toLowerCase() === "mishutect2") {
    console.error("  [FATAL] La base activa es MishutecT2 (académica protegida). Abortando pruebas.");
    process.exit(1);
  }

  try {
    assertMutationsAllowed("testPhase6B");
    recordTest("Guard de Mutaciones", true, `Mutaciones autorizadas exclusivamente en ${guardStatus.dbName}`);
  } catch (err: any) {
    recordTest("Guard de Mutaciones", false, `Fallo en guard: ${err.message}`);
    process.exit(1);
  }

  const pool = await getPool();

  // 2. Auditoría previa de ventas históricas
  console.log("\n--- ETAPA 2: AUDITORÍA DE VENTAS HISTÓRICAS ---");
  const initialSalesRes = await pool.request().query(`
    SELECT ID_venta, Numero_comprobante, Total_venta, Dni_cliente, ID_empleado
    FROM dbo.Venta
    ORDER BY ID_venta ASC
  `);
  const initialSalesCount = initialSalesRes.recordset.length;
  console.log(`  Total de ventas existentes antes de la prueba: ${initialSalesCount}`);
  recordTest(
    "Ventas Previas",
    initialSalesCount >= 5,
    `Existen al menos las 5 ventas históricas (registradas: ${initialSalesCount})`
  );

  // 3. Prueba de Producto Descontinuado
  console.log("\n--- ETAPA 3: RECHAZO DE PRODUCTO DESCONTINUADO ---");
  try {
    // 7750000000011 es el producto descontinuado (ID_estado_prod = 3)
    await executeSaleTransaction({
      dniCliente: "72145890",
      idEmpleado: 1,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000011", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 699.90 }],
    });
    recordTest("Rechazo Descontinuado", false, "Debió rechazar venta de producto descontinuado");
  } catch (err: any) {
    const isExpected = err instanceof ProductDiscontinuedError || err.message?.includes("Descontinuado");
    recordTest(
      "Rechazo Descontinuado",
      isExpected,
      `Rechazó correctamente producto descontinuado: ${err.message}`
    );
  }

  // 4. Prueba de Stock Insuficiente y Rollback Estricto
  console.log("\n--- ETAPA 4: RECHAZO POR STOCK INSUFICIENTE Y ROLLBACK ATÓMICO ---");
  const stockBeforeReq = await pool.request().query(`
    SELECT Codbarras_prod, Stock, ID_estado_prod FROM dbo.Producto WHERE Codbarras_prod = '7750000000001'
  `);
  const stockBefore = stockBeforeReq.recordset[0].Stock;

  try {
    await executeSaleTransaction({
      dniCliente: "72145890",
      idEmpleado: 1,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: stockBefore + 999 }],
      payments: [{ idMetodo: 1, monto: 999999 }],
    });
    recordTest("Rechazo Stock Insuficiente", false, "Debió rechazar por stock insuficiente");
  } catch (err: any) {
    const isExpected = err instanceof InsufficientStockError || err.message?.includes("Stock insuficiente");
    const stockAfterReq = await pool.request().query(`
      SELECT Codbarras_prod, Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000001'
    `);
    const stockAfter = stockAfterReq.recordset[0].Stock;
    const rollbackClean = stockBefore === stockAfter;

    recordTest(
      "Rechazo Stock Insuficiente",
      isExpected && rollbackClean,
      `Rechazado y rollback atómico perfecto (Stock inicial: ${stockBefore}, Stock final: ${stockAfter})`
    );
  }

  // 5. Prueba de Discordancia de Montos (Payment Mismatch)
  console.log("\n--- ETAPA 5: RECHAZO POR DISCORDANCIA DE PAGOS ---");
  try {
    await executeSaleTransaction({
      dniCliente: "72145890",
      idEmpleado: 1,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 1.00 }], // Monto intencionalmente incorrecto
    });
    recordTest("Rechazo Discordancia Pagos", false, "Debió fallar por pagos incorrectos");
  } catch (err: any) {
    const isExpected = err instanceof PaymentMismatchError || err.message?.includes("Discrepancia");
    recordTest(
      "Rechazo Discordancia Pagos",
      isExpected,
      `Rechazó correctamente discordancia de centavos: ${err.message}`
    );
  }

  // 6. Prueba de Cliente Inexistente
  console.log("\n--- ETAPA 6: RECHAZO POR CLIENTE INEXISTENTE ---");
  try {
    await executeSaleTransaction({
      dniCliente: "99999999",
      idEmpleado: 1,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 180 }],
    });
    recordTest("Rechazo Cliente Inexistente", false, "Debió fallar por cliente inexistente");
  } catch (err: any) {
    const isExpected = err instanceof ClientNotFoundError || err.message?.includes("cliente");
    recordTest(
      "Rechazo Cliente Inexistente",
      isExpected,
      `Rechazó cliente inexistente: ${err.message}`
    );
  }

  // 7. Prueba de Empleado Inexistente
  console.log("\n--- ETAPA 7: RECHAZO POR EMPLEADO INEXISTENTE ---");
  try {
    await executeSaleTransaction({
      dniCliente: "72145890",
      idEmpleado: 999999,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 180 }],
    });
    recordTest("Rechazo Empleado Inexistente", false, "Debió fallar por empleado inexistente");
  } catch (err: any) {
    const isExpected = err instanceof EmployeeNotFoundError || err.message?.includes("empleado");
    recordTest(
      "Rechazo Empleado Inexistente",
      isExpected,
      `Rechazó empleado inexistente: ${err.message}`
    );
  }

  // 8. Transacción Real 1: Venta Boleta con Pago Mixto y Consolidación de Items
  console.log("\n--- ETAPA 8: TRANSACCIÓN REAL - BOLETA CON PAGO MIXTO Y CONSOLIDACIÓN ---");
  // Producto 7750000000002 (Corsair Vengeance LPX 32GB DDR4 3600 - Precio S/. 320.00)
  const p2Req = await pool.request().query(`
    SELECT Codbarras_prod, Stock, Precio FROM dbo.Producto WHERE Codbarras_prod = '7750000000002'
  `);
  const p2Before = p2Req.recordset[0];
  console.log(`  Producto 7750000000002 - Stock previo: ${p2Before.Stock}, Precio: S/. ${p2Before.Precio}`);

  const totalBoletaExpected = p2Before.Precio * 2; // 320 * 2 = 640.00

  // Simulamos carrito con 2 ítems repetidos para probar consolidación en una sola fila Detalle_Venta
  const boletaSale = await executeSaleTransaction({
    dniCliente: "72145890",
    idEmpleado: 1,
    idTipoComp: 1, // Boleta (B001)
    items: [
      { codbarras: "7750000000002", cantidad: 1 },
      { codbarras: "7750000000002", cantidad: 1 }, // Duplicado intencional: debe consolidar a cantidad = 2
    ],
    payments: [
      { idMetodo: 1, monto: 240.00 }, // Efectivo
      { idMetodo: 2, monto: 400.00 }, // Tarjeta (Total: 640.00)
    ],
  });

  console.log(`  Venta registrada con éxito: ID ${boletaSale.idVenta}, Nro: ${boletaSale.numeroComprobante}, Total: S/. ${boletaSale.totalVenta}`);
  recordTest(
    "Emisión de Boleta B001",
    boletaSale.numeroComprobante.startsWith("B001-") && boletaSale.totalVenta === totalBoletaExpected,
    `Boleta emitida correctamente: ${boletaSale.numeroComprobante} por S/. ${boletaSale.totalVenta}`
  );

  // Verificar consolidación en dbo.Detalle_Venta
  const detalleBoletaRes = await pool.request().input("idVenta", sql.Int, boletaSale.idVenta).query(`
    SELECT ID_venta, Codbarras_prod, Cantidad, Subtotal
    FROM dbo.Detalle_Venta
    WHERE ID_venta = @idVenta
  `);
  const detalleBoleta = detalleBoletaRes.recordset;
  recordTest(
    "Consolidación en Detalle_Venta",
    detalleBoleta.length === 1 && detalleBoleta[0].Cantidad === 2,
    `Consolidó 2 filas repetidas en 1 fila con Cantidad = ${detalleBoleta[0]?.Cantidad}`
  );

  // Verificar desglose en dbo.Venta_Metodo_Pago
  const pagosBoletaRes = await pool.request().input("idVenta", sql.Int, boletaSale.idVenta).query(`
    SELECT ID_venta, ID_metodo, Monto_pagado
    FROM dbo.Venta_Metodo_Pago
    WHERE ID_venta = @idVenta
    ORDER BY ID_metodo ASC
  `);
  recordTest(
    "Desglose de Pagos Mixtos",
    pagosBoletaRes.recordset.length === 2 &&
      Number(pagosBoletaRes.recordset[0].Monto_pagado) === 240 &&
      Number(pagosBoletaRes.recordset[1].Monto_pagado) === 400,
    "Registró correctamente ambos métodos de pago (Efectivo S/ 240 + Tarjeta S/ 400)"
  );

  // Verificar descuento de stock en dbo.Producto
  const p2AfterReq = await pool.request().query(`
    SELECT Codbarras_prod, Stock FROM dbo.Producto WHERE Codbarras_prod = '7750000000002'
  `);
  const p2After = p2AfterReq.recordset[0];
  recordTest(
    "Descuento de Stock en Producto",
    p2After.Stock === p2Before.Stock - 2,
    `Stock descontado con exactitud: inicial ${p2Before.Stock} -> final ${p2After.Stock}`
  );

  // Verificar movimiento en dbo.Mov_Inventario
  const movInvBoleta = await pool.request().input("codbarras", sql.VarChar(13), "7750000000002").query(`
    SELECT TOP 1 ID_movimiento, ID_tipo_mov, Cantidad, ID_empleado, Fecha
    FROM dbo.Mov_Inventario
    WHERE Codbarras_prod = @codbarras
    ORDER BY ID_movimiento DESC
  `);
  const ultimoMov = movInvBoleta.recordset[0];
  recordTest(
    "Registro en Mov_Inventario (Kardex)",
    ultimoMov && ultimoMov.ID_tipo_mov === 2 && ultimoMov.Cantidad === 2 && ultimoMov.ID_empleado === 1,
    `Movimiento registrado: ID #${ultimoMov?.ID_movimiento}, Tipo: ${ultimoMov?.ID_tipo_mov} (Salida), Cant: ${ultimoMov?.Cantidad}`
  );

  // 9. Transacción Real 2: Factura F001 con Múltiples Productos
  console.log("\n--- ETAPA 9: TRANSACCIÓN REAL - FACTURA F001 MULTIPRODUCTO ---");
  // Producto 7750000000003 (Kingston NV2 1TB - S/. 260.00) y 7750000000004 (Samsung 980 500GB - S/. 190.00)
  const p3Req = await pool.request().query(`
    SELECT Codbarras_prod, Stock, Precio FROM dbo.Producto WHERE Codbarras_prod = '7750000000003'
  `);
  const p4Req = await pool.request().query(`
    SELECT Codbarras_prod, Stock, Precio FROM dbo.Producto WHERE Codbarras_prod = '7750000000004'
  `);
  const p3Before = p3Req.recordset[0];
  const p4Before = p4Req.recordset[0];

  const totalExpected = p3Before.Precio * 1 + p4Before.Precio * 1; // 260 + 190 = 450.00

  const facturaSale = await executeSaleTransaction({
    dniCliente: "70231456", // Luis Rojas Medina
    idEmpleado: 2, // Rosa Paredes Luna
    idTipoComp: 2, // Factura (F001)
    items: [
      { codbarras: "7750000000004", cantidad: 1 }, // Samsung (codbarras mayor)
      { codbarras: "7750000000003", cantidad: 1 }, // Kingston (codbarras menor)
    ],
    payments: [{ idMetodo: 3, monto: totalExpected }], // Transferencia Bancaria
  });

  console.log(`  Factura emitida: ID ${facturaSale.idVenta}, Nro: ${facturaSale.numeroComprobante}, Total: S/. ${facturaSale.totalVenta}`);
  recordTest(
    "Emisión de Factura F001",
    facturaSale.numeroComprobante.startsWith("F001-") && facturaSale.totalVenta === totalExpected,
    `Factura emitida correctamente: ${facturaSale.numeroComprobante} por S/. ${facturaSale.totalVenta}`
  );

  // Verificar correlativo consecutivo
  const lastFacturaReq = await pool.request().query(`
    SELECT Numero_comprobante FROM dbo.Venta WHERE Numero_comprobante LIKE 'F001-%' ORDER BY Numero_comprobante DESC
  `);
  console.log(`  Comprobantes Factura existentes:`, lastFacturaReq.recordset.map((r: any) => r.Numero_comprobante));
  recordTest(
    "Secuencia Factura",
    lastFacturaReq.recordset.length >= 2,
    `Secuencia F001 mantenida: ${facturaSale.numeroComprobante}`
  );

  // 10. Prueba de Concurrencia Real con sp_getapplock
  console.log("\n--- ETAPA 10: PRUEBA DE CONCURRENCIA SIMULADA CON sp_getapplock ---");
  // Ejecutamos 2 ventas simultáneas de Boleta con Promise.all
  const [concRes1, concRes2] = await Promise.all([
    executeSaleTransaction({
      dniCliente: "72145890",
      idEmpleado: 1,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 180.00 }],
    }),
    executeSaleTransaction({
      dniCliente: "71458963",
      idEmpleado: 2,
      idTipoComp: 1,
      items: [{ codbarras: "7750000000001", cantidad: 1 }],
      payments: [{ idMetodo: 1, monto: 180.00 }],
    }),
  ]);

  const num1 = parseInt(concRes1.numeroComprobante.split("-")[1], 10);
  const num2 = parseInt(concRes2.numeroComprobante.split("-")[1], 10);
  console.log(`  Venta concurrente 1: ${concRes1.numeroComprobante} (ID ${concRes1.idVenta})`);
  console.log(`  Venta concurrente 2: ${concRes2.numeroComprobante} (ID ${concRes2.idVenta})`);

  const consecutive = Math.abs(num1 - num2) === 1;
  const noDuplicates = concRes1.numeroComprobante !== concRes2.numeroComprobante;
  recordTest(
    "Concurrencia sp_getapplock",
    consecutive && noDuplicates,
    `Correlativos concurrentes estrictamente secuenciales y sin colisión: ${concRes1.numeroComprobante} y ${concRes2.numeroComprobante}`
  );

  // 11. Conciliación Final de Integridad
  console.log("\n--- ETAPA 11: CONCILIACIÓN FINAL DE INTEGRIDAD ---");
  const finalSalesRes = await pool.request().query(`
    SELECT COUNT(*) AS totalVentas, SUM(Total_venta) AS montoAcumulado FROM dbo.Venta
  `);
  const finalDetalleRes = await pool.request().query(`
    SELECT COUNT(*) AS totalLineas, SUM(Subtotal) AS sumaDetalle FROM dbo.Detalle_Venta
  `);
  const finalPagosRes = await pool.request().query(`
    SELECT COUNT(*) AS totalPagos, SUM(Monto_pagado) AS sumaPagos FROM dbo.Venta_Metodo_Pago
  `);

  const { totalVentas, montoAcumulado } = finalSalesRes.recordset[0];
  const { sumaDetalle } = finalDetalleRes.recordset[0];
  const { sumaPagos } = finalPagosRes.recordset[0];

  const diffCentavos = Math.abs(Number(montoAcumulado) - Number(sumaDetalle)) + Math.abs(Number(montoAcumulado) - Number(sumaPagos));
  console.log(`  Total Ventas en Base: ${totalVentas}`);
  console.log(`  Monto Acumulado Ventas: S/. ${Number(montoAcumulado).toFixed(2)}`);
  console.log(`  Suma Subtotales Detalle: S/. ${Number(sumaDetalle).toFixed(2)}`);
  console.log(`  Suma Pagos Asignados:    S/. ${Number(sumaPagos).toFixed(2)}`);

  recordTest(
    "Conciliación Financiera Perfecta",
    diffCentavos < 0.001,
    `Monto Venta (${montoAcumulado}) == Detalle (${sumaDetalle}) == Pagos (${sumaPagos}) al centavo`
  );

  // 12. Verificación de Transacciones Abiertas
  console.log("\n--- ETAPA 12: VERIFICACIÓN DE TRANSACCIONES ABIERTAS ---");
  const activeTranRes = await pool.request().query(`
    SELECT COUNT(*) AS activeTrans FROM sys.dm_tran_active_transactions WHERE name = 'user_transaction';
  `);
  const activeCount = Number(activeTranRes.recordset[0].activeTrans);
  recordTest(
    "Sin Transacciones Huérfanas",
    activeCount === 0,
    `Transacciones de usuario activas en SQL Server: ${activeCount} (0 esperado)`
  );

  console.log("\n================================================================================");
  console.log("                           RESUMEN DE PRUEBAS                                   ");
  console.log("================================================================================");
  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Pruebas: ${total} | Aprobadas: ${passed} | Fallidas: ${failed}`);

  if (failed === 0) {
    console.log("\n>>> TODAS LAS PRUEBAS DE LA FASE 6B PASARON CON ÉXITO ABSOLUTO <<<");
  } else {
    console.error(`\n>>> SE DETECTARON ${failed} FALLAS EN LA BATERÍA DE PRUEBAS <<<`);
  }

  await pool.close();
  process.exit(failed > 0 ? 1 : 0);
}

runPhase6BTests().catch((err) => {
  console.error("Error fatal durante la ejecución de pruebas:", err);
  process.exit(1);
});
