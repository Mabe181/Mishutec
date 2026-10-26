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

  for (const table of ["Mov_Inventario", "Producto", "Detalle_Venta", "Devolucion", "Detalle_Dev"]) {
    const res = await pool.request().query(`
      SELECT c.name, ty.name AS tipo, c.is_nullable, c.is_identity
      FROM sys.tables t
      JOIN sys.columns c ON t.object_id = c.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.name = '${table}'
      ORDER BY c.column_id
    `);
    console.log(`\n=== COLUMNAS DE dbo.${table} ===`);
    console.table(res.recordset);
  }

  // Ver los últimos 3 movimientos de inventario existentes
  const lastMovs = await pool.request().query(`
    SELECT TOP 3 * FROM dbo.Mov_Inventario ORDER BY ID_movimiento DESC
  `);
  console.log("\n=== ÚLTIMOS MOVIMIENTOS EN Mov_Inventario ===");
  console.table(lastMovs.recordset);

  // Ver los estados de producto existentes
  const estadosProd = await pool.request().query("SELECT * FROM dbo.Estado_Prod");
  console.log("\n=== ESTADOS DE PRODUCTO ===");
  console.table(estadosProd.recordset);

  await pool.close();
}

main().catch(console.error);
