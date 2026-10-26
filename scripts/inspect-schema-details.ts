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
    const query = `
      SELECT 
        t.name AS Tabla,
        c.name AS Columna,
        ty.name AS Tipo,
        c.max_length AS LongitudBytes,
        c.precision AS PrecisionNum,
        c.scale AS EscalaNum,
        c.is_nullable AS EsNulo
      FROM sys.tables t
      JOIN sys.columns c ON t.object_id = c.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.name IN ('Producto', 'CPU', 'RAM', 'SSD', 'Grafica', 'Fuente_Poder', 'Gabinete', 'Estado_Prod', 'Categoria', 'Marca', 'Suministra', 'Proveedor')
      ORDER BY t.name, c.column_id;
    `;

    const res = await pool.request().query(query);
    console.table(res.recordset);
  } catch (err) {
    console.error("Error inspecting schema:", err);
  } finally {
    await closePool();
    process.exit(0);
  }
}

main();
