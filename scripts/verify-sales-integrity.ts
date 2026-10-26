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

  const salesCheck = await pool.request().query(`
    SELECT 
      v.ID_venta,
      v.Numero_comprobante,
      v.Total_venta,
      ISNULL(SUM(dv.Subtotal), 0) AS SumDetalles,
      ISNULL(SUM(dv.Cantidad), 0) AS SumUnidadesVendidas,
      (SELECT ISNULL(SUM(Monto_pagado), 0) FROM dbo.Venta_Metodo_Pago WHERE ID_venta = v.ID_venta) AS SumPagos
    FROM dbo.Venta v
    LEFT JOIN dbo.Detalle_Venta dv ON v.ID_venta = dv.ID_venta
    GROUP BY v.ID_venta, v.Numero_comprobante, v.Total_venta
    ORDER BY v.ID_venta ASC;
  `);

  console.log("=== CONCILIACIÓN DE LAS 9 VENTAS ===");
  console.table(salesCheck.recordset);

  const totalVentas = salesCheck.recordset.reduce((acc: number, r: any) => acc + Number(r.Total_venta), 0);
  const totalDetalles = salesCheck.recordset.reduce((acc: number, r: any) => acc + Number(r.SumDetalles), 0);
  const totalPagos = salesCheck.recordset.reduce((acc: number, r: any) => acc + Number(r.SumPagos), 0);
  const totalUnidades = salesCheck.recordset.reduce((acc: number, r: any) => acc + Number(r.SumUnidadesVendidas), 0);

  console.log("Suma Total_venta:       S/.", totalVentas.toFixed(2));
  console.log("Suma Subtotal Detalles: S/.", totalDetalles.toFixed(2));
  console.log("Suma Monto_pagado:      S/.", totalPagos.toFixed(2));
  console.log("Total Unidades Vendidas:", totalUnidades);

  await pool.close();
  process.exit(0);
}

main().catch(console.error);
