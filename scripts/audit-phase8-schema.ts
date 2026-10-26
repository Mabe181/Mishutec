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
  console.log("     MISHUTEC - AUDITORÍA FÍSICA DEL ESQUEMA PARA REPORTES (FASE 8)            ");
  console.log("================================================================================");

  const pool = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const tablesToAudit = [
    "Venta",
    "Detalle_Venta",
    "Venta_Metodo_Pago",
    "Metodo_Pago",
    "Tipo_Comprobante",
    "Producto",
    "Categoria",
    "Marca",
    "Cliente",
    "Empleado",
    "Proveedor",
    "Suministra",
    "Mov_Inventario",
    "Tipo_Movimiento",
    "Devolucion",
    "Detalle_Dev",
    "Estado_Dev",
    "Motivo_Dev",
  ];

  console.log("\n--- CONTEO DE FILAS POR TABLA ---");
  for (const t of tablesToAudit) {
    const countRes = await pool.request().query(`SELECT COUNT(*) AS total FROM dbo.[${t}]`);
    console.log(`  - dbo.${t.padEnd(20)} : ${countRes.recordset[0].total} filas`);
  }

  console.log("\n--- COLUMNAS Y TIPOS POR TABLA ---");
  const cols = await pool.request().query(`
    SELECT 
      t.name AS Tabla,
      c.name AS Columna,
      ty.name AS Tipo,
      c.max_length AS MaxLength,
      c.is_nullable AS Nullable,
      c.is_identity AS EsIdentity
    FROM sys.tables t
    JOIN sys.columns c ON t.object_id = c.object_id
    JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    WHERE t.name IN (${tablesToAudit.map((t) => `'${t}'`).join(",")})
    ORDER BY t.name, c.column_id;
  `);

  const grouped: Record<string, any[]> = {};
  for (const r of cols.recordset) {
    if (!grouped[r.Tabla]) grouped[r.Tabla] = [];
    grouped[r.Tabla].push({ Columna: r.Columna, Tipo: r.Tipo, Nullable: r.Nullable });
  }

  for (const [tbl, columns] of Object.entries(grouped)) {
    console.log(`\n[dbo.${tbl}]`);
    console.table(columns);
  }

  // Verificación de datos de Suministra y Proveedor
  console.log("\n--- AUDITORÍA DE dbo.Suministra Y dbo.Proveedor ---");
  const provSample = await pool.request().query("SELECT TOP 2 * FROM dbo.Proveedor");
  console.log("Proveedor sample:", provSample.recordset);

  const sumSample = await pool.request().query("SELECT TOP 2 * FROM dbo.Suministra");
  console.log("Suministra sample:", sumSample.recordset);

  const paySample = await pool.request().query("SELECT TOP 2 * FROM dbo.Venta_Metodo_Pago");
  console.log("Venta_Metodo_Pago sample:", paySample.recordset);

  const metodoSample = await pool.request().query("SELECT * FROM dbo.Metodo_Pago");
  console.log("Metodo_Pago sample:", metodoSample.recordset);

  await pool.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error en auditoría:", err);
  process.exit(1);
});
