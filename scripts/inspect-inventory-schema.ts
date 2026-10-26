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

async function inspectInventorySchema() {
  console.log("================================================================================");
  console.log("          MISHUTEC - INSPECCIÓN DETALLADA DEL MÓDULO DE INVENTARIO              ");
  console.log("================================================================================");

  const pool = await getPool();

  try {
    // 1. Columnas y tipos de datos
    console.log("\n--- 1. COLUMNAS Y TIPOS DE DATOS (sys.columns) ---");
    const columnsQuery = `
      SELECT 
        t.name AS Tabla,
        c.name AS Columna,
        ty.name AS Tipo,
        c.max_length AS Longitud,
        c.precision AS Precision,
        c.scale AS Escala,
        c.is_nullable AS EsNullable,
        c.is_identity AS EsIdentity
      FROM sys.tables t
      JOIN sys.columns c ON t.object_id = c.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.name IN ('Producto', 'Mov_Inventario', 'Tipo_Movimiento', 'Empleado', 'Estado_Prod')
      ORDER BY t.name, c.column_id;
    `;
    const colRes = await pool.request().query(columnsQuery);
    console.table(colRes.recordset);

    // 2. Claves primarias y foráneas
    console.log("\n--- 2. CLAVES FORÁNEAS (sys.foreign_keys) ---");
    const fkQuery = `
      SELECT 
        fk.name AS NombreFK,
        tp.name AS TablaOrigen,
        cp.name AS ColumnaOrigen,
        tr.name AS TablaDestino,
        cr.name AS ColumnaDestino
      FROM sys.foreign_keys fk
      JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
      JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
      JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
      WHERE tp.name IN ('Producto', 'Mov_Inventario', 'Tipo_Movimiento', 'Empleado', 'Estado_Prod')
         OR tr.name IN ('Producto', 'Mov_Inventario', 'Tipo_Movimiento', 'Empleado', 'Estado_Prod')
      ORDER BY tp.name, fk.name;
    `;
    const fkRes = await pool.request().query(fkQuery);
    console.table(fkRes.recordset);

    // 3. Restricciones CHECK
    console.log("\n--- 3. RESTRICCIONES CHECK (sys.check_constraints) ---");
    const checkQuery = `
      SELECT 
        t.name AS Tabla,
        cc.name AS NombreCheck,
        cc.definition AS Definicion
      FROM sys.check_constraints cc
      JOIN sys.tables t ON cc.parent_object_id = t.object_id
      WHERE t.name IN ('Producto', 'Mov_Inventario', 'Tipo_Movimiento', 'Empleado', 'Estado_Prod');
    `;
    const checkRes = await pool.request().query(checkQuery);
    console.table(checkRes.recordset);

    // 4. Datos en dbo.Tipo_Movimiento
    console.log("\n--- 4. DATOS EN dbo.Tipo_Movimiento ---");
    const tipoMovRes = await pool.request().query("SELECT * FROM dbo.Tipo_Movimiento");
    console.table(tipoMovRes.recordset);

    // 5. Datos en dbo.Estado_Prod
    console.log("\n--- 5. DATOS EN dbo.Estado_Prod ---");
    const estadoRes = await pool.request().query("SELECT * FROM dbo.Estado_Prod");
    console.table(estadoRes.recordset);

    // 6. Datos en dbo.Empleado
    console.log("\n--- 6. DATOS EN dbo.Empleado ---");
    const empRes = await pool.request().query("SELECT * FROM dbo.Empleado");
    console.table(empRes.recordset);

    // 7. Datos en dbo.Mov_Inventario
    console.log("\n--- 7. DATOS ACTUALES EN dbo.Mov_Inventario ---");
    const movRes = await pool.request().query(`
      SELECT 
        m.ID_movimiento,
        m.Codbarras_prod,
        p.Nombre_prod,
        m.Fecha,
        m.Cantidad,
        tm.ID_tipo_mov,
        tm.Nombre_tipo,
        e.ID_empleado,
        CONCAT(e.Nombre_emp, ' ', e.Apellido_emp) AS Empleado
      FROM dbo.Mov_Inventario m
      JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
      JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
      JOIN dbo.Empleado e ON m.ID_empleado = e.ID_empleado
      ORDER BY m.ID_movimiento ASC
    `);
    console.table(movRes.recordset);

    // 8. Resumen de Stock actual en dbo.Producto
    console.log("\n--- 8. STOCK ACTUAL EN dbo.Producto ---");
    const prodRes = await pool.request().query(`
      SELECT 
        p.Codbarras_prod,
        p.Nombre_prod,
        p.Stock,
        p.Precio,
        p.ID_estado_prod,
        ep.Estado AS Nombre_estado_prod,
        c.Nombre_cat
      FROM dbo.Producto p
      JOIN dbo.Estado_Prod ep ON p.ID_estado_prod = ep.ID_estado_prod
      JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
      ORDER BY p.Stock ASC, p.Codbarras_prod ASC
    `);
    console.table(prodRes.recordset);

    // 9. Conciliación Histórica: Movimientos vs Stock vs Ventas
    console.log("\n--- 9. ANÁLISIS DE CONCILIACIÓN DE MOVIMIENTOS ---");
    const concilQuery = `
      SELECT 
        p.Codbarras_prod,
        p.Nombre_prod,
        p.Stock AS StockActual,
        ISNULL(SUM(CASE WHEN tm.Nombre_tipo = 'Entrada' THEN m.Cantidad ELSE 0 END), 0) AS TotalEntradas,
        ISNULL(SUM(CASE WHEN tm.Nombre_tipo = 'Salida' THEN m.Cantidad ELSE 0 END), 0) AS TotalSalidas,
        ISNULL(SUM(CASE WHEN tm.Nombre_tipo = 'Ajuste' THEN m.Cantidad ELSE 0 END), 0) AS TotalAjustes,
        (
          SELECT ISNULL(SUM(dv.Cantidad), 0)
          FROM dbo.Detalle_Venta dv
          WHERE dv.Codbarras_prod = p.Codbarras_prod
        ) AS UnidadesVendidasEnVentas
      FROM dbo.Producto p
      LEFT JOIN dbo.Mov_Inventario m ON p.Codbarras_prod = m.Codbarras_prod
      LEFT JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
      GROUP BY p.Codbarras_prod, p.Nombre_prod, p.Stock
      ORDER BY p.Codbarras_prod;
    `;
    const concilRes = await pool.request().query(concilQuery);
    console.table(concilRes.recordset);

  } finally {
    await closePool();
  }
}

inspectInventorySchema().catch(console.error);
