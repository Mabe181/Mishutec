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

async function auditPhase5Schema() {
  console.log("================================================================================");
  console.log("         MISHUTEC - AUDITORÍA DE ESQUEMA: FASE 5 (ENTIDADES Y RELACIONES)       ");
  console.log("================================================================================");

  const pool = await getPool();

  try {
    // 1. Columnas y Tipos
    console.log("\n--- 1. COLUMNAS Y TIPOS (sys.columns) ---");
    const colQuery = `
      SELECT 
        t.name AS Tabla,
        c.name AS Columna,
        ty.name AS Tipo,
        c.max_length AS Longitud,
        c.is_nullable AS EsNullable,
        c.is_identity AS EsIdentity
      FROM sys.tables t
      JOIN sys.columns c ON t.object_id = c.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.name IN ('Cliente', 'Proveedor', 'Empleado', 'Suministra', 'Venta', 'Mov_Inventario', 'Devolucion')
      ORDER BY t.name, c.column_id;
    `;
    const colRes = await pool.request().query(colQuery);
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
      WHERE tp.name IN ('Cliente', 'Proveedor', 'Empleado', 'Suministra', 'Venta', 'Mov_Inventario', 'Devolucion')
         OR tr.name IN ('Cliente', 'Proveedor', 'Empleado', 'Suministra', 'Venta', 'Mov_Inventario', 'Devolucion')
      ORDER BY tp.name, fk.name;
    `;
    const fkRes = await pool.request().query(fkQuery);
    console.table(fkRes.recordset);

    // 3. Restricciones CHECK
    console.log("\n--- 3. RESTRICCIONES CHECK Y UNIQUE ---");
    const checkQuery = `
      SELECT 
        t.name AS Tabla,
        cc.name AS NombreRestriccion,
        cc.definition AS Definicion
      FROM sys.check_constraints cc
      JOIN sys.tables t ON cc.parent_object_id = t.object_id
      WHERE t.name IN ('Cliente', 'Proveedor', 'Empleado', 'Suministra', 'Venta', 'Mov_Inventario', 'Devolucion');
    `;
    const checkRes = await pool.request().query(checkQuery);
    console.table(checkRes.recordset);

    // 4. Registros existentes en dbo.Cliente
    console.log("\n--- 4. REGISTROS EXISTENTES EN dbo.Cliente ---");
    const cliRes = await pool.request().query("SELECT * FROM dbo.Cliente");
    console.table(cliRes.recordset);

    // 5. Registros existentes en dbo.Proveedor
    console.log("\n--- 5. REGISTROS EXISTENTES EN dbo.Proveedor ---");
    const provRes = await pool.request().query("SELECT * FROM dbo.Proveedor");
    console.table(provRes.recordset);

    // 6. Registros existentes en dbo.Empleado
    console.log("\n--- 6. REGISTROS EXISTENTES EN dbo.Empleado ---");
    const empRes = await pool.request().query("SELECT * FROM dbo.Empleado");
    console.table(empRes.recordset);

    // 7. Registros existentes en dbo.Suministra
    console.log("\n--- 7. REGISTROS EXISTENTES EN dbo.Suministra ---");
    const sumRes = await pool.request().query(`
      SELECT 
        s.Codbarras_prod,
        p.Nombre_prod,
        s.ID_proveedor,
        pr.Nombre_prov,
        s.Precio_compra
      FROM dbo.Suministra s
      JOIN dbo.Producto p ON s.Codbarras_prod = p.Codbarras_prod
      JOIN dbo.Proveedor pr ON s.ID_proveedor = pr.ID_proveedor
      ORDER BY s.ID_proveedor, s.Codbarras_prod;
    `);
    console.table(sumRes.recordset);

    // 8. Registros existentes en dbo.Devolucion
    console.log("\n--- 8. REGISTROS EXISTENTES EN dbo.Devolucion ---");
    const devRes = await pool.request().query("SELECT * FROM dbo.Devolucion");
    console.table(devRes.recordset);

    // 9. Comprobar relación Venta e Inventario
    console.log("\n--- 9. VERIFICACIÓN DE VÍNCULO VENTA - INVENTARIO ---");
    const vMQuery = `
      SELECT 
        fk.name AS NombreFK,
        tp.name AS TablaOrigen,
        tr.name AS TablaDestino
      FROM sys.foreign_keys fk
      JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
      JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
      WHERE (tp.name = 'Mov_Inventario' AND tr.name IN ('Venta', 'Detalle_Venta'))
         OR (tp.name IN ('Venta', 'Detalle_Venta') AND tr.name = 'Mov_Inventario');
    `;
    const vMRes = await pool.request().query(vMQuery);
    console.log("FKs directas entre Mov_Inventario y Venta/Detalle_Venta:", vMRes.recordset.length);
    if (vMRes.recordset.length === 0) {
      console.log("[DOCUMENTADO] CONFIRMADO: NO existe Foreign Key directa entre Mov_Inventario y Detalle_Venta/Venta.");
      console.log("La relación actual es por coincidencia de negocio (Fecha, Codbarras_prod, Cantidad y Empleado), pero no referencialmente forzada por el esquema.");
    }

  } finally {
    await closePool();
  }
}

auditPhase5Schema().catch(console.error);
