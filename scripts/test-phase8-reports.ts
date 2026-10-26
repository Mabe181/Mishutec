import fs from "fs";
import path from "path";
import sql from "mssql/msnodesqlv8";

// 1. Cargar .env.local
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

// Importar servicios y repositorios de Fase 8
import {
  getReportKpis,
  getSalesByDate,
  getSalesByVoucherType,
  getSalesByPaymentMethod,
  getTopSellingProducts,
  getSalesByCategory,
  getSalesByEmployee,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getSupplierAnalytics,
  getReturnsAnalytics,
  getReportsFilterMetadata,
} from "../src/lib/repositories/report.repository";

import {
  getReportsPageData,
  generateReportCsv,
  resolveDateFilters,
  sanitizeCsvCell,
  maskCustomerItem,
} from "../src/lib/services/report.service";

async function runPhase8Validation() {
  console.log("=======================================================================");
  console.log(" MISHUTEC - FASE 8: BATERÍA DE PRUEBAS DE REPORTES Y ANALÍTICA (100% LECTURA)");
  console.log("=======================================================================\n");

  const driver = process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server";
  const server = process.env.DB_SERVER;
  const dbAceptacion = process.env.DB_NAME || "MishutecT2_Aceptacion";
  const dbAcademica = "MishutecT2";

  console.log(`[Configuración] Servidor: ${server}`);
  console.log(`[Configuración] Base Activa Aceptación: ${dbAceptacion}`);
  console.log(`[Configuración] Base Académica Protegida: ${dbAcademica}\n`);

  // Conexión a Aceptación
  const poolAcep = await new sql.ConnectionPool({
    connectionString: `Driver={${driver}};Server=${server};Database=${dbAceptacion};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  // Conexión a Académica
  const poolAcad = await new sql.ConnectionPool({
    connectionString: `Driver={${driver}};Server=${server};Database=${dbAcademica};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  let passCount = 0;
  let failCount = 0;

  function assert(desc: string, condition: boolean, extraInfo?: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passCount++;
    } else {
      console.error(`  [FAIL] ${desc} ${extraInfo ? `-> ${extraInfo}` : ""}`);
      failCount++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: LECTURA DE METADATOS Y DROPDOWNS
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: Metadatos para Filtros Analíticos ---");
    const meta = await getReportsFilterMetadata();
    assert("Categorías cargadas correctamente", meta.categorias.length > 0, `Cant: ${meta.categorias.length}`);
    assert("Marcas cargadas correctamente", meta.marcas.length > 0, `Cant: ${meta.marcas.length}`);
    assert("Empleados cargados con nombre completo", meta.empleados.length > 0, `Cant: ${meta.empleados.length}`);
    assert("Tipos de Comprobante cargados", meta.tiposComprobante.length >= 2, `Cant: ${meta.tiposComprobante.length}`);
    assert("Métodos de Pago cargados", meta.metodosPago.length >= 4, `Cant: ${meta.metodosPago.length}`);

    // -------------------------------------------------------------------------
    // TEST 2: CONCILIACIÓN DE KPIS GLOBALES CONTRA SQL SERVER
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Conciliación de KPIs Globales ---");
    const kpis = await getReportKpis({});

    const dbVentasRes = await poolAcep.request().query(`
      SELECT 
        COUNT(*) AS totalVentas, 
        ISNULL(SUM(Total_venta), 0) AS totalSoles 
      FROM dbo.Venta;
    `);
    const dbVentas = dbVentasRes.recordset[0];

    assert("Ventas totales coinciden exactamente (S/ 5,500.00)", kpis.ventasTotales === Number(dbVentas.totalSoles) && kpis.ventasTotales === 5500);
    assert("Comprobantes emitidos coinciden exactamente (9 ventas)", kpis.comprobantesCount === Number(dbVentas.totalVentas) && kpis.comprobantesCount === 9);
    assert("Ticket promedio calculado correctamente (5500 / 9 = 611.11)", kpis.ticketPromedio === 611.11);
    assert("Unidades vendidas totales coinciden exactamente (15 unidades)", kpis.unidadesVendidas === 15);
    assert("Productos en catálogo coinciden (12 productos)", kpis.productosCatalogo === 12);
    assert("Stock físico total en almacén coincide (76 unidades)", kpis.stockTotal === 76);
    assert("Total de trámites RMA coincide (7 devoluciones)", kpis.totalDevoluciones === 7);
    assert("Devoluciones aprobadas coinciden (5 aprobadas)", kpis.devolucionesAprobadas === 5);
    assert("Devoluciones pendientes coinciden (1 pendiente)", kpis.devolucionesPendientes === 1);
    assert("Devoluciones rechazadas coinciden (1 rechazada)", kpis.devolucionesRechazadas === 1);
    assert("Unidades devueltas físicas coinciden (8 unidades en 7 trámites)", kpis.unidadesDevueltasTotal === 8);

    // -------------------------------------------------------------------------
    // TEST 3: EVOLUCIÓN TEMPORAL DE VENTAS (CERO DUPLICACIÓN CARTESIANA)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Evolución Temporal y Acumulados de Ventas ---");
    const salesByDate = await getSalesByDate({});
    const totalDateSales = salesByDate.reduce((acc, d) => acc + d.totalVenta, 0);
    const totalDateUnits = salesByDate.reduce((acc, d) => acc + d.unidadesVendidas, 0);
    const lastAccum = salesByDate.length > 0 ? salesByDate[salesByDate.length - 1].acumulado : 0;

    assert("Suma de ventas por fecha igual a S/ 5,500.00 (Sin duplicación)", Number(totalDateSales.toFixed(2)) === 5500);
    assert("Suma de unidades vendidas por fecha igual a 15", totalDateUnits === 15);
    assert("Último valor acumulado coincide con el total general", Number(lastAccum.toFixed(2)) === 5500);

    // -------------------------------------------------------------------------
    // TEST 4: DESGLOSE POR TIPO DE COMPROBANTE Y MÉTODO DE PAGO
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Comprobantes y Métodos de Pago ---");
    const voucherSales = await getSalesByVoucherType({});
    const voucherSum = voucherSales.reduce((acc, v) => acc + v.totalVenta, 0);
    const voucherCount = voucherSales.reduce((acc, v) => acc + v.comprobantesCount, 0);

    assert("Suma de comprobantes igual a S/ 5,500.00", Number(voucherSum.toFixed(2)) === 5500);
    assert("Total de comprobantes igual a 9", voucherCount === 9);

    const paymentMethods = await getSalesByPaymentMethod({});
    const paymentSum = paymentMethods.reduce((acc, m) => acc + m.montoPagado, 0);
    assert("Suma de métodos de pago igual a S/ 5,500.00 (Conciliación financiera)", Number(paymentSum.toFixed(2)) === 5500);

    // -------------------------------------------------------------------------
    // TEST 5: TOP PRODUCTOS VENDIDOS Y VENTAS POR CATEGORÍA
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Top Productos y Ventas por Categoría ---");
    const topProds = await getTopSellingProducts({});
    const topProdsUnits = topProds.reduce((acc, p) => acc + p.unidadesVendidas, 0);
    const topProdsRevenue = topProds.reduce((acc, p) => acc + p.totalFacturado, 0);

    assert("Unidades vendidas en Top Productos suman 15", topProdsUnits === 15);
    assert("Facturación en Top Productos suma S/ 5,500.00", Number(topProdsRevenue.toFixed(2)) === 5500);
    assert("Ranking ordenado descendentemente por unidades y facturación", topProds.length > 0 && topProds[0].unidadesVendidas >= topProds[topProds.length - 1].unidadesVendidas);

    const categorySales = await getSalesByCategory({});
    const categorySum = categorySales.reduce((acc, c) => acc + c.totalFacturado, 0);
    assert("Ventas por categoría suman S/ 5,500.00", Number(categorySum.toFixed(2)) === 5500);

    // -------------------------------------------------------------------------
    // TEST 6: VENTAS Y PRODUCTIVIDAD POR EMPLEADO
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Productividad por Empleado ---");
    const employeeSales = await getSalesByEmployee({});
    const empTotalRevenue = employeeSales.reduce((acc, e) => acc + e.totalFacturado, 0);
    const empTotalVouchers = employeeSales.reduce((acc, e) => acc + e.comprobantesCount, 0);

    assert("Facturación por empleado suma S/ 5,500.00", Number(empTotalRevenue.toFixed(2)) === 5500);
    assert("Comprobantes por empleado suman 9", empTotalVouchers === 9);
    assert("Cada empleado cuenta con métricas de Kardex y trámites RMA", employeeSales.every((e) => typeof e.movimientosKardexCount === "number" && typeof e.devolucionesTramitadasCount === "number"));

    // -------------------------------------------------------------------------
    // TEST 7: CARTERA DE CLIENTES Y RECURRENCIA (LEY 29733)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 7: Análisis de Clientes y Recurrencia ---");
    const customerAnalytics = await getCustomerAnalytics({});
    assert("Detección de clientes recurrentes (3 clientes >= 2 compras)", customerAnalytics.recurrentes === 3);
    const ana = customerAnalytics.lista.find((c) => c.dniCliente === "72145890");
    assert("Ana Torres Quispe tiene 4 compras registradas", ana !== undefined && ana.comprasCount === 4);
    assert("Ana Torres Quispe marcada como recurrente (true)", ana?.esRecurrente === true);

    // Prueba de enmascaramiento Ley 29733
    const maskedAna = maskCustomerItem(ana!);
    assert("DNI de cliente enmascarado adecuadamente (72****90)", maskedAna.dniCliente.startsWith("72****"));
    assert("Correo de cliente enmascarado adecuadamente", maskedAna.correo.includes("***@"));

    // -------------------------------------------------------------------------
    // TEST 8: INVENTARIO, VALORACIÓN POTENCIAL RETAIL Y ROTACIÓN
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 8: Inventario, Valoración Retail y Rotación ---");
    const inv = await getInventoryAnalytics();
    const sumCatStock = inv.stockPorCategoria.reduce((acc, c) => acc + c.stockTotal, 0);
    assert("Suma de stock por categoría igual a 76", sumCatStock === 76);
    assert("Valoración potencial de venta coincide (S/ 27,500.00)", inv.valorTotalInventarioVenta === 27500);
    assert("Flujo Kardex entradas registradas suman 113", inv.movimientosResumen.entradasTotal === 113);
    assert("Flujo Kardex salidas registradas suman 37", inv.movimientosResumen.salidasTotal === 37);
    assert("Balance de flujo Kardex (113 - 37 = 76 unidades disponibles)", inv.movimientosResumen.entradasTotal - inv.movimientosResumen.salidasTotal === 76);

    // -------------------------------------------------------------------------
    // TEST 9: PROVEEDORES Y SUMINISTRO (DISPERSIÓN DE PRECIO DE COMPRA)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 9: Cadena de Suministro y Dispersión de Costos ---");
    const supp = await getSupplierAnalytics();
    assert("Total de proveedores igual a 6 en aceptación", supp.totalProveedores === 6);
    assert("Total de relaciones de catálogo en dbo.Suministra igual a 15", supp.totalRelacionesSuministro === 15);
    const multiProd = supp.productosConMultiplesProveedores.find((p) => p.codbarras === "7750000000001");
    assert("Producto 7750000000001 (Kingston Fury 16GB) abastecido por múltiples proveedores", multiProd !== undefined && multiProd.cantidadProveedores >= 2);
    assert(
      "Dispersión de costo de compra demostrada en Kingston Fury (S/ 130 - S/ 142.50)",
      Boolean(multiProd?.rangoPreciosCompra.includes("130") && (multiProd?.rangoPreciosCompra.includes("135") || multiProd?.rangoPreciosCompra.includes("142.50")))
    );

    // -------------------------------------------------------------------------
    // TEST 10: DEVOLUCIONES RMA Y CALIDAD
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 10: Devoluciones RMA y Relación con Ventas ---");
    const ret = await getReturnsAnalytics({});
    assert("Total devoluciones registradas igual a 7", ret.totalDevoluciones === 7);
    assert("Total de unidades físicas devueltas igual a 8", ret.relacionRetornoVentas.totalDevueltas === 8);
    assert("Tasa de retorno calculada (8 devueltas / 15 vendidas = 53.33%)", ret.relacionRetornoVentas.tasaRetorno === 53.33);
    assert("Indicador A: Incidencia bruta de solicitudes (8 / 15 = 53.33%)", ret.relacionRetornoVentas.tasaIncidenciaSolicitudes === 53.33);
    assert("Indicador B: Unidades aprobadas en trámites (6 / 15 = 40.00%)", ret.relacionRetornoVentas.tasaDevolucionAprobada === 40.00);
    assert("Indicador C: Reingreso comprobado al inventario Kardex (1 / 15 = 6.67%)", ret.relacionRetornoVentas.tasaReingresoKardex === 6.67);

    // -------------------------------------------------------------------------
    // TEST 11: FILTRADO DINÁMICO MULTICRITERIO
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 11: Filtrado Dinámico Multicriterio ---");
    // Filtro por fecha específica
    const filteredByDate = await getReportKpis({ fechaDesde: "2026-10-22", fechaHasta: "2026-10-22" });
    assert("Filtro por fecha 2026-10-22 retorna subconjunto válido (4 comprobantes, S/ 1,450.00)", filteredByDate.comprobantesCount === 4 && filteredByDate.ventasTotales === 1450);

    // Filtro por empleado específico (ID 1)
    const filteredByEmp = await getReportKpis({ idEmpleado: 1 });
    assert("Filtro por empleado ID 1 retorna ventas correspondientes", filteredByEmp.comprobantesCount > 0 && filteredByEmp.ventasTotales > 0);

    // -------------------------------------------------------------------------
    // TEST 12: EXPORTACIÓN CSV, SANITIZACIÓN Y PREVENCIÓN DE FORMULA INJECTION
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 12: Exportación CSV y Seguridad RFC 4180 ---");
    const testSanitizeEq = sanitizeCsvCell("=SUM(A1:A10)");
    assert("Fórmula '=' neutralizada con apóstrofe inicial", testSanitizeEq === `"'=SUM(A1:A10)"`);
    const testSanitizePlus = sanitizeCsvCell("+cmd|' /C calc'!A0");
    assert("Fórmula '+' neutralizada con apóstrofe inicial", testSanitizePlus.startsWith(`"'+`));
    const testSanitizeAt = sanitizeCsvCell("@test");
    assert("Carácter '@' neutralizado con apóstrofe inicial", testSanitizeAt.startsWith(`"'@`));

    // Generar los 7 tipos de CSV
    const csvTypes = ["kpis", "ventas", "productos", "inventario", "clientes", "proveedores", "devoluciones"] as const;
    for (const type of csvTypes) {
      const csv = await generateReportCsv(type, {}, true);
      assert(`CSV tipo '${type}' generado con BOM UTF-8 y contenido válido`, csv.content.startsWith("\uFEFF") && csv.content.length > 50);
    }

    // -------------------------------------------------------------------------
    // TEST 13: VERIFICACIÓN DE INTEGRIDAD ABSOLUTA EN MISHUTECT2 (ACADÉMICA)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 13: Integridad de Base Académica (MishutecT2) Protegida ---");
    const acadProds = (await poolAcad.request().query("SELECT COUNT(*) AS c FROM dbo.Producto;")).recordset[0].c;
    const acadVentas = (await poolAcad.request().query("SELECT COUNT(*) AS c FROM dbo.Venta;")).recordset[0].c;
    const acadDetVentas = (await poolAcad.request().query("SELECT COUNT(*) AS c FROM dbo.Detalle_Venta;")).recordset[0].c;
    const acadPagos = (await poolAcad.request().query("SELECT COUNT(*) AS c FROM dbo.Venta_Metodo_Pago;")).recordset[0].c;
    const acadKardex = (await poolAcad.request().query("SELECT COUNT(*) AS c FROM dbo.Mov_Inventario;")).recordset[0].c;
    const acadStock = (await poolAcad.request().query("SELECT ISNULL(SUM(Stock), 0) AS s FROM dbo.Producto;")).recordset[0].s;

    assert("Académica conserva exactamente 10 productos", acadProds === 10);
    assert("Académica conserva exactamente 5 ventas", acadVentas === 5);
    assert("Académica conserva exactamente 8 detalles de venta", acadDetVentas === 8);
    assert("Académica conserva exactamente 6 pagos", acadPagos === 6);
    assert("Académica conserva exactamente 17 movimientos Kardex", acadKardex === 17);
    assert("Académica conserva exactamente 73 unidades de stock", acadStock === 73);

    // -------------------------------------------------------------------------
    // TEST 14: VERIFICACIÓN DE INTEGRIDAD EN ACEPTACIÓN (MishutecT2_Aceptacion)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 14: Verificación de Cero Modificaciones en Aceptación ---");
    const acepProds = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Producto;")).recordset[0].c;
    const acepVentas = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Venta;")).recordset[0].c;
    const acepDetVentas = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Detalle_Venta;")).recordset[0].c;
    const acepPagos = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Venta_Metodo_Pago;")).recordset[0].c;
    const acepKardex = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Mov_Inventario;")).recordset[0].c;
    const acepStock = (await poolAcep.request().query("SELECT ISNULL(SUM(Stock), 0) AS s FROM dbo.Producto;")).recordset[0].s;
    const acepDevs = (await poolAcep.request().query("SELECT COUNT(*) AS c FROM dbo.Devolucion;")).recordset[0].c;

    assert("Aceptación conserva intactos 12 productos", acepProds === 12);
    assert("Aceptación conserva intactas 9 ventas (S/ 5,500.00)", acepVentas === 9);
    assert("Aceptación conserva intactos 13 detalles de venta", acepDetVentas === 13);
    assert("Aceptación conserva intactos 11 registros de pago", acepPagos === 11);
    assert("Aceptación conserva intactos 31 movimientos Kardex", acepKardex === 31);
    assert("Aceptación conserva intactas 76 unidades de stock", acepStock === 76);
    assert("Aceptación conserva intactas 7 devoluciones", acepDevs === 7);

    console.log("\n=======================================================================");
    console.log(` RESULTADO FINAL FASE 8: ${passCount} PRUEBAS EXITOSAS / ${failCount} FALLIDAS`);
    console.log("=======================================================================");

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Error durante la ejecución de pruebas de Fase 8:", err);
    process.exit(1);
  } finally {
    await poolAcep.close();
    await poolAcad.close();
  }
}

runPhase8Validation();
