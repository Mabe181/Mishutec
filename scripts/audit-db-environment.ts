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
  try {
    const pool = await getPool();
    console.log("=== AUDITORÍA DEL ENTORNO SQL SERVER ===");

    // 1. Rutas por defecto del servidor
    const pathsRes = await pool.request().query(`
      SELECT 
        CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS VARCHAR(255)) AS DefaultDataPath,
        CAST(SERVERPROPERTY('InstanceDefaultLogPath') AS VARCHAR(255)) AS DefaultLogPath,
        CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS VARCHAR(255)) AS DefaultBackupPath;
    `);
    console.log("\nRutas por defecto del servidor:");
    console.table(pathsRes.recordset);

    // 2. Bases de datos existentes
    const dbRes = await pool.request().query(`
      SELECT database_id, name, state_desc, create_date 
      FROM sys.databases 
      WHERE name IN ('MishutecT2', 'MishutecT2_Aceptacion');
    `);
    console.log("\nBases de datos relacionadas existentes:");
    console.table(dbRes.recordset);

    // 3. Archivos de MishutecT2
    const filesRes = await pool.request().query(`
      SELECT name, physical_name, type_desc, size * 8 / 1024 AS SizeMB 
      FROM sys.master_files 
      WHERE database_id = DB_ID('MishutecT2');
    `);
    console.log("\nArchivos físicos de MishutecT2:");
    console.table(filesRes.recordset);

  } catch (err) {
    console.error("Error en auditoría:", err);
  } finally {
    await closePool();
    process.exit(0);
  }
}

main();
