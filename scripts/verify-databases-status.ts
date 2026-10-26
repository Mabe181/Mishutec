import sql from "mssql/msnodesqlv8";
import { assertMutationsAllowed } from "../src/lib/db-guard";

async function verifyDatabases() {
  console.log("================================================================================");
  console.log("           MISHUTEC - VERIFICACIÓN DE ESTADO Y PROTECCIÓN DE BASES             ");
  console.log("================================================================================");

  // 1. Verificar MishutecT2 (Académica)
  const poolAcademic = new sql.ConnectionPool({
    connectionString:
      "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-QV4VK5K\\SQLEXPRESS;Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;",
  } as any);
  await poolAcademic.connect();

  const prodAcad = await poolAcademic.request().query("SELECT COUNT(1) AS totalProd, SUM(Stock) AS totalStock FROM dbo.Producto");
  const ventAcad = await poolAcademic.request().query("SELECT COUNT(1) AS totalVenta, SUM(Total_venta) AS totalMonto FROM dbo.Venta");
  const tabAcad = await poolAcademic.request().query("SELECT COUNT(1) AS totalTables FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')");

  console.log("\n[1] BASE ACADÉMICA (MishutecT2 - Protegida):");
  console.log(`  - Productos: ${prodAcad.recordset[0].totalProd} (Esperado: 10)`);
  console.log(`  - Stock total: ${prodAcad.recordset[0].totalStock} unidades (Esperado: 73)`);
  console.log(`  - Ventas: ${ventAcad.recordset[0].totalVenta} (Esperado: 5)`);
  console.log(`  - Monto acumulado: S/. ${Number(ventAcad.recordset[0].totalMonto).toFixed(2)} (Esperado: S/. 4050.00)`);
  console.log(`  - Tablas físicas dbo: ${tabAcad.recordset[0].totalTables} (Esperado: 25)`);

  await poolAcademic.close();

  // 2. Probar Guard sobre MishutecT2
  console.log("\n[2] PRUEBA DE GUARD DE SEGURIDAD (assertMutationsAllowed):");
  const originalDb = process.env.DB_NAME;
  try {
    process.env.DB_NAME = "MishutecT2";
    assertMutationsAllowed("MUTACION_PRUEBA");
    console.error("  [FALLO CRÍTICO] El guard no bloqueó la base académica.");
  } catch (err: any) {
    console.log(`  [ÉXITO] Guard bloqueó mutación sobre MishutecT2:`);
    console.log(`  Mensaje: ${err.message}`);
  } finally {
    process.env.DB_NAME = originalDb;
  }

  // 3. Verificar MishutecT2_Aceptacion
  const poolAcept = new sql.ConnectionPool({
    connectionString:
      "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-QV4VK5K\\SQLEXPRESS;Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;",
  } as any);
  await poolAcept.connect();

  const prodAcept = await poolAcept.request().query("SELECT COUNT(1) AS totalProd, SUM(Stock) AS totalStock FROM dbo.Producto");
  const ventAcept = await poolAcept.request().query("SELECT COUNT(1) AS totalVenta, SUM(Total_venta) AS totalMonto FROM dbo.Venta");
  const tabAcept = await poolAcept.request().query("SELECT COUNT(1) AS totalTables FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')");
  const movAcept = await poolAcept.request().query("SELECT COUNT(1) AS totalMovs FROM dbo.Mov_Inventario");

  console.log("\n[3] BASE DE ACEPTACIÓN (MishutecT2_Aceptacion - Activa):");
  console.log(`  - Productos: ${prodAcept.recordset[0].totalProd} (Esperado: >= 10, actual: 12)`);
  console.log(`  - Stock actual: ${prodAcept.recordset[0].totalStock} unidades`);
  console.log(`  - Ventas registradas: ${ventAcept.recordset[0].totalVenta}`);
  console.log(`  - Monto acumulado: S/. ${Number(ventAcept.recordset[0].totalMonto).toFixed(2)}`);
  console.log(`  - Movimientos Kardex previos: ${movAcept.recordset[0].totalMovs}`);
  console.log(`  - Tablas físicas dbo: ${tabAcept.recordset[0].totalTables} (Esperado: 25)`);

  await poolAcept.close();
  console.log("\n================================================================================");
}

verifyDatabases().catch((err) => {
  console.error("Error al verificar bases:", err);
  process.exit(1);
});
