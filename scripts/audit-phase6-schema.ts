import { getPool } from "../src/lib/db";

async function runAudit() {
  const pool = await getPool();
  console.log("================================================================================");
  console.log("          MISHUTEC - AUDITORÍA DE ESQUEMA REAL PARA FASE 6A (VENTAS & POS)      ");
  console.log("================================================================================");

  // 1. Columnas y tipos de las tablas involucradas
  const tables = [
    "Venta",
    "Detalle_Venta",
    "Venta_Metodo_Pago",
    "Metodo_Pago",
    "Tipo_Comprobante",
    "Mov_Inventario",
    "Tipo_Movimiento",
    "Producto",
    "Cliente",
    "Empleado",
  ];

  console.log("\n--- 1. ESTRUCTURA DE COLUMNAS (sys.columns) ---");
  for (const table of tables) {
    const colRes = await pool.request().query(`
      SELECT 
        c.column_id AS ColID,
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length AS MaxLength,
        c.precision AS Precision,
        c.scale AS Scale,
        c.is_nullable AS IsNullable,
        c.is_identity AS IsIdentity,
        ISNULL(dc.definition, '') AS DefaultDefinition
      FROM sys.columns c
      JOIN sys.types t ON c.user_type_id = t.user_type_id
      LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
      WHERE c.object_id = OBJECT_ID('dbo.${table}')
      ORDER BY c.column_id;
    `);
    console.log(`\n[TABLA: dbo.${table}]`);
    console.table(colRes.recordset);
  }

  // 2. Claves primarias, foráneas, restricciones UNIQUE y CHECK
  console.log("\n--- 2. RESTRICCIONES (PK, FK, UNIQUE, CHECK) ---");
  const constrRes = await pool.request().query(`
    SELECT 
      t.name AS TableName,
      k.name AS ConstraintName,
      k.type_desc AS ConstraintType,
      ISNULL(c.definition, '') AS CheckDefinition
    FROM sys.tables t
    JOIN sys.objects k ON t.object_id = k.parent_object_id
    LEFT JOIN sys.check_constraints c ON k.object_id = c.object_id
    WHERE t.name IN (${tables.map((t) => `'${t}'`).join(",")})
    ORDER BY t.name, k.type_desc, k.name;
  `);
  console.table(constrRes.recordset);

  // 3. Foreign Keys detalladas
  console.log("\n--- 3. DETALLE DE FOREIGN KEYS ---");
  const fkRes = await pool.request().query(`
    SELECT 
      fk.name AS ForeignKeyName,
      tp.name AS ParentTable,
      cp.name AS ParentColumn,
      tr.name AS ReferencedTable,
      cr.name AS ReferencedColumn,
      fk.delete_referential_action_desc AS OnDelete,
      fk.update_referential_action_desc AS OnUpdate
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
    JOIN sys.columns cp ON tp.object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
    JOIN sys.columns cr ON tr.object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
    WHERE tp.name IN (${tables.map((t) => `'${t}'`).join(",")})
    ORDER BY tp.name, fk.name;
  `);
  console.table(fkRes.recordset);

  // 4. Catálogos maestros: Tipo_Comprobante, Metodo_Pago, Tipo_Movimiento
  console.log("\n--- 4. CATÁLOGOS MAESTROS ---");
  const tcRes = await pool.request().query("SELECT * FROM dbo.Tipo_Comprobante");
  console.log("dbo.Tipo_Comprobante:");
  console.table(tcRes.recordset);

  const mpRes = await pool.request().query("SELECT * FROM dbo.Metodo_Pago");
  console.log("dbo.Metodo_Pago:");
  console.table(mpRes.recordset);

  const tmRes = await pool.request().query("SELECT * FROM dbo.Tipo_Movimiento");
  console.log("dbo.Tipo_Movimiento:");
  console.table(tmRes.recordset);

  // 5. Registros actuales de dbo.Venta
  console.log("\n--- 5. REGISTROS EN dbo.Venta ---");
  const ventaRes = await pool.request().query(`
    SELECT 
      v.ID_venta,
      v.Numero_comprobante,
      CONVERT(VARCHAR(10), v.Fecha_venta, 120) AS FechaStr,
      v.Total_venta,
      v.ID_tipo_comp,
      tc.Nombre_tipo AS TipoComprobante,
      v.Dni_cliente,
      c.Nombre_cl,
      c.Apellido_cl,
      v.ID_empleado,
      e.Nombre_emp,
      e.Apellido_emp
    FROM dbo.Venta v
    JOIN dbo.Tipo_Comprobante tc ON v.ID_tipo_comp = tc.ID_tipo_comp
    JOIN dbo.Cliente c ON v.Dni_cliente = c.Dni_cliente
    JOIN dbo.Empleado e ON v.ID_empleado = e.ID_empleado
    ORDER BY v.ID_venta;
  `);
  console.table(ventaRes.recordset);

  // 6. Registros actuales de dbo.Detalle_Venta
  console.log("\n--- 6. REGISTROS EN dbo.Detalle_Venta ---");
  const detalleRes = await pool.request().query(`
    SELECT 
      dv.ID_venta,
      dv.Codbarras_prod,
      p.Nombre_prod,
      dv.Cantidad,
      dv.Precio_unitario,
      dv.Subtotal,
      (dv.Cantidad * dv.Precio_unitario) AS CalcSubtotal,
      CASE WHEN dv.Subtotal = (dv.Cantidad * dv.Precio_unitario) THEN 'OK' ELSE 'MISMATCH' END AS SubtotalCheck
    FROM dbo.Detalle_Venta dv
    JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
    ORDER BY dv.ID_venta, dv.Codbarras_prod;
  `);
  console.table(detalleRes.recordset);

  // 7. Registros actuales de dbo.Venta_Metodo_Pago
  console.log("\n--- 7. REGISTROS EN dbo.Venta_Metodo_Pago ---");
  const vmpRes = await pool.request().query(`
    SELECT 
      vmp.ID_venta,
      vmp.ID_metodo,
      mp.Nombre_metodo,
      vmp.Monto_pagado
    FROM dbo.Venta_Metodo_Pago vmp
    JOIN dbo.Metodo_Pago mp ON vmp.ID_metodo = mp.ID_metodo
    ORDER BY vmp.ID_venta, vmp.ID_metodo;
  `);
  console.table(vmpRes.recordset);

  // 8. Conciliación Transaccional de las 5 Ventas
  console.log("\n--- 8. CONCILIACIÓN TRANSACCIONAL EXACTA (VENTA vs DETALLES vs PAGOS) ---");
  const reconcRes = await pool.request().query(`
    SELECT 
      v.ID_venta,
      v.Numero_comprobante,
      v.Total_venta AS VentaTotal,
      ISNULL(d.SumDetalles, 0) AS SumDetalles,
      ISNULL(p.SumPagos, 0) AS SumPagos,
      CASE 
        WHEN v.Total_venta = ISNULL(d.SumDetalles, 0) AND v.Total_venta = ISNULL(p.SumPagos, 0) THEN 'CONCILIADO_EXACTO'
        ELSE 'DISCREPANCIA'
      END AS EstadoConciliacion
    FROM dbo.Venta v
    LEFT JOIN (
      SELECT ID_venta, SUM(Subtotal) AS SumDetalles
      FROM dbo.Detalle_Venta
      GROUP BY ID_venta
    ) d ON v.ID_venta = d.ID_venta
    LEFT JOIN (
      SELECT ID_venta, SUM(Monto_pagado) AS SumPagos
      FROM dbo.Venta_Metodo_Pago
      GROUP BY ID_venta
    ) p ON v.ID_venta = p.ID_venta
    ORDER BY v.ID_venta;
  `);
  console.table(reconcRes.recordset);

  // 9. Revisión de Mov_Inventario existente
  console.log("\n--- 9. MOVIMIENTOS EN dbo.Mov_Inventario ---");
  const movRes = await pool.request().query(`
    SELECT 
      m.ID_movimiento,
      CONVERT(VARCHAR(10), m.Fecha, 120) AS FechaStr,
      m.Codbarras_prod,
      p.Nombre_prod,
      m.ID_tipo_mov,
      tm.Nombre_tipo AS Nombre_movimiento,
      m.Cantidad,
      m.ID_empleado,
      e.Nombre_emp
    FROM dbo.Mov_Inventario m
    JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
    JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
    JOIN dbo.Empleado e ON m.ID_empleado = e.ID_empleado
    ORDER BY m.ID_movimiento;
  `);
  console.table(movRes.recordset);

  process.exit(0);
}

runAudit().catch((e) => {
  console.error("Error en auditoría:", e);
  process.exit(1);
});
