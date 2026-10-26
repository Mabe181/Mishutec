import fs from "fs";
import path from "path";
import sql from "mssql/msnodesqlv8";

// Cargar .env.local
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

async function runDatabaseAudit() {
  const driver = process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server";
  const server = process.env.DB_SERVER;

  console.log("=== AUDITORÍA SQL SERVER - FASE 9A (100% SOLO LECTURA) ===");
  console.log(`Servidor: ${server}\n`);

  const poolAcep = await new sql.ConnectionPool({
    connectionString: `Driver={${driver}};Server=${server};Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  const poolAcad = await new sql.ConnectionPool({
    connectionString: `Driver={${driver}};Server=${server};Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  // 1. Listar todas las tablas físicas en ambas bases
  const tablesAcadRes = await poolAcad.request().query("SELECT name FROM sys.tables ORDER BY name ASC;");
  const tablesAcepRes = await poolAcep.request().query("SELECT name FROM sys.tables ORDER BY name ASC;");
  const tablesAcad = tablesAcadRes.recordset.map((r: any) => r.name);
  const tablesAcep = tablesAcepRes.recordset.map((r: any) => r.name);

  console.log(`Tablas en MishutecT2: ${tablesAcad.length}`);
  console.log(`Tablas en MishutecT2_Aceptacion: ${tablesAcep.length}`);

  // 2. Conteo fila por fila en ambas bases
  console.log("\n--- CONTEO COMPARATIVO DE FILAS POR TABLA ---");
  const rowComparison: any[] = [];
  for (const t of tablesAcep) {
    const cAcad = await poolAcad.request().query(`SELECT COUNT(*) AS c FROM dbo.[${t}]`);
    const cAcep = await poolAcep.request().query(`SELECT COUNT(*) AS c FROM dbo.[${t}]`);
    rowComparison.push({
      Tabla: t,
      MishutecT2: cAcad.recordset[0].c,
      MishutecT2_Aceptacion: cAcep.recordset[0].c,
      Diferencia: cAcep.recordset[0].c - cAcad.recordset[0].c,
    });
  }
  console.table(rowComparison);

  // 3. Verificación de Métricas Específicas
  console.log("\n--- VERIFICACIÓN DE MÉTRICAS CLAVE ---");
  
  // Ventas Académica
  const vAcad = await poolAcad.request().query(`
    SELECT 
      COUNT(*) AS ventasCount,
      ISNULL(SUM(Total_venta), 0) AS totalVentas,
      (SELECT COUNT(*) FROM dbo.Detalle_Venta) AS detallesCount,
      (SELECT COUNT(*) FROM dbo.Venta_Metodo_Pago) AS pagosCount,
      (SELECT COUNT(*) FROM dbo.Producto) AS prodsCount,
      (SELECT ISNULL(SUM(Stock), 0) FROM dbo.Producto) AS stockTotal,
      (SELECT COUNT(*) FROM dbo.Mov_Inventario) AS movsCount,
      (SELECT COUNT(*) FROM dbo.Devolucion) AS devsCount
    FROM dbo.Venta;
  `);
  console.log("MishutecT2 (Académica):", vAcad.recordset[0]);

  // Ventas Aceptación
  const vAcep = await poolAcep.request().query(`
    SELECT 
      COUNT(*) AS ventasCount,
      ISNULL(SUM(Total_venta), 0) AS totalVentas,
      (SELECT COUNT(*) FROM dbo.Detalle_Venta) AS detallesCount,
      (SELECT COUNT(*) FROM dbo.Venta_Metodo_Pago) AS pagosCount,
      (SELECT COUNT(*) FROM dbo.Producto) AS prodsCount,
      (SELECT ISNULL(SUM(Stock), 0) FROM dbo.Producto) AS stockTotal,
      (SELECT COUNT(*) FROM dbo.Mov_Inventario) AS movsCount,
      (SELECT COUNT(*) FROM dbo.Devolucion) AS devsCount,
      (SELECT COUNT(*) FROM dbo.Detalle_Dev) AS detallesDevCount
    FROM dbo.Venta;
  `);
  console.log("MishutecT2_Aceptacion:", vAcep.recordset[0]);

  // 4. Verificación exacta de columnas de Estado_Dev y Motivo_Dev
  console.log("\n--- COLUMNAS REALES DE Estado_Dev Y Motivo_Dev ---");
  const colsDev = await poolAcep.request().query(`
    SELECT t.name AS Tabla, c.name AS Columna, ty.name AS Tipo, c.is_nullable
    FROM sys.tables t
    JOIN sys.columns c ON t.object_id = c.object_id
    JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    WHERE t.name IN ('Estado_Dev', 'Motivo_Dev', 'Devolucion', 'Detalle_Dev')
    ORDER BY t.name, c.column_id;
  `);
  console.table(colsDev.recordset);

  // 5. Verificación de Estado_Dev y Motivo_Dev contenidos
  const estDev = await poolAcep.request().query("SELECT * FROM dbo.Estado_Dev;");
  console.log("Valores en Estado_Dev:");
  console.table(estDev.recordset);

  const motDev = await poolAcep.request().query("SELECT * FROM dbo.Motivo_Dev;");
  console.log("Valores en Motivo_Dev:");
  console.table(motDev.recordset);

  await poolAcad.close();
  await poolAcep.close();
}

runDatabaseAudit();
