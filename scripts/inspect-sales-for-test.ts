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
  const pool = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const sales = await pool.request().query(`
    SELECT v.ID_venta, v.Numero_comprobante, CONVERT(VARCHAR(10), v.Fecha_venta, 120) AS Fecha, v.Total_venta,
           COUNT(dv.ID_detalle) AS TotalLineas,
           SUM(dv.Cantidad) AS TotalUnidades
    FROM dbo.Venta v
    JOIN dbo.Detalle_Venta dv ON v.ID_venta = dv.ID_venta
    GROUP BY v.ID_venta, v.Numero_comprobante, v.Fecha_venta, v.Total_venta
    ORDER BY v.ID_venta ASC;
  `);
  console.log("=== VENTAS EXISTENTES ===");
  console.table(sales.recordset);

  const details = await pool.request().query(`
    SELECT dv.ID_detalle, dv.ID_venta, dv.Codbarras_prod, p.Nombre_prod, dv.Cantidad, dv.Precio_unitario
    FROM dbo.Detalle_Venta dv
    JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
    ORDER BY dv.ID_venta ASC, dv.ID_detalle ASC;
  `);
  console.log("=== DETALLES DE VENTA ===");
  console.table(details.recordset);

  const returns = await pool.request().query(`
    SELECT d.ID_devolucion, CONVERT(VARCHAR(10), d.Fecha_dev, 120) AS FechaDev, ed.Nombre_estado, d.ID_venta, dd.ID_detalle, dd.Cantidad_dev, md.Descripcion_motivo
    FROM dbo.Devolucion d
    JOIN dbo.Estado_Dev ed ON d.ID_estado_dev = ed.ID_estado_dev
    JOIN dbo.Detalle_Dev dd ON d.ID_devolucion = dd.ID_devolucion
    JOIN dbo.Motivo_Dev md ON dd.ID_motivo = md.ID_motivo;
  `);
  console.log("=== DEVOLUCIONES EXISTENTES ===");
  console.table(returns.recordset);

  await pool.close();
}

main().catch(console.error);
