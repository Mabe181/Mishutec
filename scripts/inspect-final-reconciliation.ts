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
  console.log("       MISHUTEC - CONCILIACIÓN FINAL DE INTEGRIDAD FASE 7B                      ");
  console.log("================================================================================");

  // 1. Base Académica (MishutecT2)
  const poolAcad = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const acad = await poolAcad.request().query(`
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
  console.log("\n[1] BASE ACADÉMICA (MishutecT2 - Protegida):");
  console.table(acad.recordset[0]);
  await poolAcad.close();

  // 2. Base de Aceptación (MishutecT2_Aceptacion)
  const poolAcept = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const acept = await poolAcept.request().query(`
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
  console.log("\n[2] BASE DE ACEPTACIÓN (MishutecT2_Aceptacion - Activa):");
  console.table(acept.recordset[0]);

  // Desglose de estados de Devoluciones en Aceptación
  const devsByState = await poolAcept.request().query(`
    SELECT ed.Nombre_estado, COUNT(d.ID_devolucion) AS Total
    FROM dbo.Devolucion d
    JOIN dbo.Estado_Dev ed ON d.ID_estado_dev = ed.ID_estado_dev
    GROUP BY ed.Nombre_estado;
  `);
  console.log("\n[3] DESGLOSE DE ESTADOS DE DEVOLUCIONES EN ACEPTACIÓN:");
  console.table(devsByState.recordset);

  // Movimientos adicionales en Kardex de Aceptación generados en Fase 7B
  const extraKardex = await poolAcept.request().query(`
    SELECT m.ID_movimiento, CONVERT(VARCHAR(10), m.Fecha, 120) AS Fecha, m.Cantidad, tm.Nombre_tipo, m.Codbarras_prod, p.Nombre_prod, m.ID_empleado
    FROM dbo.Mov_Inventario m
    JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
    JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
    WHERE m.ID_movimiento > 49;
  `);
  console.log("\n[4] MOVIMIENTOS KARDEX GENERADOS EN FASE 7B (REINGRESO AUTORIZADO):");
  console.table(extraKardex.recordset);

  await poolAcept.close();
}

main().catch(console.error);
