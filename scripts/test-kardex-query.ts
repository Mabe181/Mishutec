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

async function testKardex() {
  const pool = await getPool();
  try {
    const query = `
      SELECT 
        m.ID_movimiento,
        CONVERT(VARCHAR(10), m.Fecha, 120) AS Fecha,
        m.Codbarras_prod,
        p.Nombre_prod,
        c.Nombre_cat,
        tm.ID_tipo_mov,
        tm.Nombre_tipo AS TipoMovimiento,
        m.Cantidad,
        e.ID_empleado,
        CONCAT(e.Nombre_emp, ' ', e.Apellido_emp) AS Empleado,
        SUM(
          CASE 
            WHEN tm.Nombre_tipo = 'Entrada' THEN m.Cantidad
            WHEN tm.Nombre_tipo = 'Salida' THEN -m.Cantidad
            ELSE 0
          END
        ) OVER (
          PARTITION BY m.Codbarras_prod 
          ORDER BY m.Fecha ASC, m.ID_movimiento ASC
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS SaldoCalculado
      FROM dbo.Mov_Inventario m
      JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
      JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
      JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
      JOIN dbo.Empleado e ON m.ID_empleado = e.ID_empleado
      ORDER BY m.Fecha DESC, m.ID_movimiento DESC;
    `;
    const res = await pool.request().query(query);
    console.table(res.recordset);
  } finally {
    await closePool();
  }
}

testKardex().catch(console.error);
