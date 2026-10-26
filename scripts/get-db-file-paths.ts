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
    const res = await pool.request().query(`
      SELECT 
        name AS LogicalName,
        physical_name AS PhysicalPath,
        type_desc AS TypeDesc,
        size * 8 / 1024 AS SizeMB
      FROM sys.database_files;
    `);
    console.table(res.recordset);
  } catch (err) {
    console.error(err);
  } finally {
    await closePool();
    process.exit(0);
  }
}

main();
