import fs from "fs";
import path from "path";

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

import { getPool, closePool } from "../src/lib/db";

async function main() {
  console.log("================================================================================");
  console.log("    CREACIÓN Y VERIFICACIÓN DE BASE DE ACEPTACIÓN: MishutecT2_Aceptacion        ");
  console.log("================================================================================");

  try {
    const pool = await getPool();

    // 1. Auditar si MishutecT2_Aceptacion ya existe
    const existRes = await pool.request().query(`
      SELECT database_id, name, state_desc 
      FROM sys.databases 
      WHERE name = 'MishutecT2_Aceptacion';
    `);

    if (existRes.recordset.length > 0) {
      console.log("[INFO] La base de datos 'MishutecT2_Aceptacion' YA EXISTE.");
      console.log("       Conservando base intacta para persistencia entre fases.");
    } else {
      console.log("[PASO 1] Comprobando rutas físicas y archivos destino...");
      const backupPath = "C:\\Program Files\\Microsoft SQL Server\\MSSQL16.SQLEXPRESS\\MSSQL\\Backup\\MishutecT2_Backup_Acceptance.bak";
      const targetMdf = "C:\\Program Files\\Microsoft SQL Server\\MSSQL16.SQLEXPRESS\\MSSQL\\DATA\\MishutecT2_Aceptacion.mdf";
      const targetLdf = "C:\\Program Files\\Microsoft SQL Server\\MSSQL16.SQLEXPRESS\\MSSQL\\DATA\\MishutecT2_Aceptacion_log.ldf";

      if (fs.existsSync(targetMdf) || fs.existsSync(targetLdf)) {
        throw new Error("ERROR DE SEGURIDAD: Uno de los archivos físicos de destino ya existe en disco.");
      }
      console.log("       Archivos de destino libres y seguros.");

      // PASO 2: Generar Respaldo Completo de MishutecT2
      console.log("\n[PASO 2] Generando respaldo de MishutecT2...");
      await pool.request().query(`
        BACKUP DATABASE [MishutecT2]
        TO DISK = N'${backupPath}'
        WITH FORMAT, INIT, NAME = N'MishutecT2-Acceptance-Seed', SKIP, NOREWIND, NOUNLOAD;
      `);
      console.log("       [OK] Respaldo completado en:", backupPath);

      // PASO 3: Verificar archivo de backup (RESTORE VERIFYONLY)
      console.log("\n[PASO 3] Verificando integridad del archivo de backup (RESTORE VERIFYONLY)...");
      await pool.request().query(`
        RESTORE VERIFYONLY
        FROM DISK = N'${backupPath}';
      `);
      console.log("       [OK] El archivo de respaldo es válido y consistente.");

      // PASO 4: Restaurar copia independiente mediante RESTORE ... WITH MOVE (sin WITH REPLACE)
      console.log("\n[PASO 4] Restaurando como 'MishutecT2_Aceptacion' con archivos físicos independientes...");
      await pool.request().query(`
        RESTORE DATABASE [MishutecT2_Aceptacion]
        FROM DISK = N'${backupPath}'
        WITH 
          MOVE N'MishutecT2' TO N'${targetMdf}',
          MOVE N'MishutecT2_log' TO N'${targetLdf}',
          NOUNLOAD;
      `);
      console.log("       [OK] Restauración finalizada exitosamente.");
    }

    // PASO 5: Verificación exhaustiva de la base de aceptación
    console.log("\n[PASO 5] Verificando esquema y datos de MishutecT2_Aceptacion...");
    const verifyTables = await pool.request().query(`
      SELECT COUNT(*) AS totalTablas 
      FROM [MishutecT2_Aceptacion].sys.tables 
      WHERE schema_id = SCHEMA_ID('dbo');
    `);
    const totalTablas = Number(verifyTables.recordset[0].totalTablas);

    const verifyProd = await pool.request().query(`
      SELECT COUNT(*) AS totalProd, SUM(Stock) AS totalStock 
      FROM [MishutecT2_Aceptacion].dbo.Producto;
    `);
    const totalProd = Number(verifyProd.recordset[0].totalProd);
    const totalStock = Number(verifyProd.recordset[0].totalStock);

    const verifyVentas = await pool.request().query(`
      SELECT COUNT(*) AS totalVentas, SUM(Total_venta) AS sumaVentas 
      FROM [MishutecT2_Aceptacion].dbo.Venta;
    `);
    const totalVentas = Number(verifyVentas.recordset[0].totalVentas);
    const sumaVentas = Number(verifyVentas.recordset[0].sumaVentas);

    console.log(`       - Total de tablas en dbo: ${totalTablas} (Esperado: 25)`);
    console.log(`       - Total de productos: ${totalProd} (Esperado: 10)`);
    console.log(`       - Total unidades stock: ${totalStock} (Esperado: 73)`);
    console.log(`       - Total de ventas: ${totalVentas} (Esperado: 5)`);
    console.log(`       - Ventas acumuladas: S/ ${sumaVentas.toFixed(2)} (Esperado: S/ 4,050.00)`);

    if (totalTablas !== 25 || totalProd !== 10 || totalStock !== 73 || totalVentas !== 5 || sumaVentas !== 4050) {
      throw new Error("ERROR: La base de aceptación no concilia exactamente con los datos esperados.");
    }
    console.log("\n[VERIFICACIÓN EXITOSA] 'MishutecT2_Aceptacion' está 100% íntegra y conciliada.");

    // PASO 6: Actualizar .env.local a MishutecT2_Aceptacion
    console.log("\n[PASO 6] Conmutando DB_NAME en .env.local hacia 'MishutecT2_Aceptacion'...");
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    let envContent = fs.readFileSync(envLocalPath, "utf-8");
    envContent = envContent.replace(/DB_NAME=MishutecT2\b/g, "DB_NAME=MishutecT2_Aceptacion");
    fs.writeFileSync(envLocalPath, envContent, "utf-8");
    console.log("       [OK] .env.local actualizado a DB_NAME=MishutecT2_Aceptacion.");

    console.log("================================================================================");
    console.log("     ENTORNO DE ACEPTACIÓN PREPARADO Y HABILITADO CORRECTAMENTE                 ");
    console.log("================================================================================");

  } catch (err: any) {
    console.error("\n[ERROR CRÍTICO DURANTE LA CREACIÓN DEL ENTORNO]:", err);
    process.exit(1);
  } finally {
    await closePool();
    process.exit(0);
  }
}

main();
