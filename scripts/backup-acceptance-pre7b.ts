import fs from "fs";
import path from "path";
import sql from "mssql/msnodesqlv8";

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

async function main() {
  console.log("================================================================================");
  console.log("     MISHUTEC - RESPALDO PREVIO DE SEGURIDAD PARA FASE 7B (ACEPTACIÓN)         ");
  console.log("================================================================================");

  const dbName = process.env.DB_NAME;
  if (dbName !== "MishutecT2_Aceptacion") {
    throw new Error(`DB_NAME no es 'MishutecT2_Aceptacion'. Es '${dbName}'. Operación abortada.`);
  }

  const pool = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  console.log("✓ Conectado a SQL Server como master");

  // Definir ruta física de respaldo
  const backupPath = "C:\\Program Files\\Microsoft SQL Server\\MSSQL16.SQLEXPRESS\\MSSQL\\Backup\\MishutecT2_Aceptacion_PrePhase7B.bak";
  console.log(`\n[PASO 1] Generando respaldo de seguridad en:\n  ${backupPath}`);

  // Ejecutar BACKUP
  await pool.request().query(`
    BACKUP DATABASE [MishutecT2_Aceptacion]
    TO DISK = N'${backupPath}'
    WITH FORMAT, INIT, NAME = N'MishutecT2_Aceptacion_PrePhase7B', SKIP, NOREWIND, NOUNLOAD, STATS = 10;
  `);
  console.log("✓ Respaldo generado con éxito.");

  // PASO 2: Verificar respaldo con RESTORE VERIFYONLY
  console.log("\n[PASO 2] Verificando integridad del respaldo (RESTORE VERIFYONLY)...");
  const verifyRes = await pool.request().query(`
    RESTORE VERIFYONLY FROM DISK = N'${backupPath}';
  `);
  console.log("✓ Archivo de respaldo 100% íntegro y verificado.");

  // PASO 3: Auditar métricas de línea base de Aceptación
  console.log("\n[PASO 3] Verificando métricas de línea base en MishutecT2_Aceptacion...");
  const poolAcept = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const metrics = await poolAcept.request().query(`
    SELECT
      (SELECT COUNT(*) FROM dbo.Producto) AS TotalProductos,
      (SELECT SUM(Stock) FROM dbo.Producto) AS StockTotal,
      (SELECT COUNT(*) FROM dbo.Venta) AS TotalVentas,
      (SELECT SUM(Total_venta) FROM dbo.Venta) AS TotalMontoVentas,
      (SELECT COUNT(*) FROM dbo.Detalle_Venta) AS TotalDetallesVenta,
      (SELECT COUNT(*) FROM dbo.Venta_Metodo_Pago) AS TotalPagos,
      (SELECT COUNT(*) FROM dbo.Mov_Inventario) AS TotalMovimientos,
      (SELECT COUNT(*) FROM dbo.Devolucion) AS TotalDevoluciones,
      (SELECT COUNT(*) FROM dbo.Detalle_Dev) AS TotalDetallesDev,
      (SELECT COUNT(*) FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')) AS TotalTablasDbo
  `);

  const m = metrics.recordset[0];
  console.log("  - Productos:            ", m.TotalProductos, "(Esperado: 12)");
  console.log("  - Stock actual:         ", m.StockTotal, "unidades (Esperado: 75)");
  console.log("  - Ventas registradas:   ", m.TotalVentas, "(Esperado: 9)");
  console.log("  - Monto ventas:          S/.", Number(m.TotalMontoVentas).toFixed(2), "(Esperado: S/. 5500.00)");
  console.log("  - Detalles venta:       ", m.TotalDetallesVenta, "(Esperado: 13)");
  console.log("  - Registros de pago:    ", m.TotalPagos, "(Esperado: 11)");
  console.log("  - Movimientos Kardex:   ", m.TotalMovimientos, "(Esperado: 30)");
  console.log("  - Devoluciones:         ", m.TotalDevoluciones, "(Esperado: 1)");
  console.log("  - Detalles devolución:  ", m.TotalDetallesDev, "(Esperado: 1)");
  console.log("  - Tablas físicas dbo:   ", m.TotalTablasDbo, "(Esperado: 25)");

  if (
    m.TotalProductos !== 12 ||
    m.StockTotal !== 75 ||
    m.TotalVentas !== 9 ||
    Number(m.TotalMontoVentas) !== 5500 ||
    m.TotalDetallesVenta !== 13 ||
    m.TotalPagos !== 11 ||
    m.TotalMovimientos !== 30 ||
    m.TotalDevoluciones !== 1 ||
    m.TotalDetallesDev !== 1 ||
    m.TotalTablasDbo !== 25
  ) {
    throw new Error("Línea base de MishutecT2_Aceptacion no coincide con lo esperado antes de Fase 7B.");
  }

  console.log("\n================================================================================");
  console.log("✓ LÍNEA BASE Y RESPALDO PRE-FASE 7B CONFIRMADOS Y VERIFICADOS CON ÉXITO");
  console.log("================================================================================");

  await poolAcept.close();
  await pool.close();
}

main().catch((err) => {
  console.error("Error crítico en respaldo:", err);
  process.exit(1);
});
