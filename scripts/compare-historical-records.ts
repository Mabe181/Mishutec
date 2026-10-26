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

async function runComparison() {
  console.log("================================================================================");
  console.log("      MISHUTEC - COMPARACIÓN DE REGISTROS HISTÓRICOS (SOLO LECTURA)             ");
  console.log("================================================================================");

  const connAcademic = "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-QV4VK5K\\SQLEXPRESS;Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;";
  const connAceptacion = "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-QV4VK5K\\SQLEXPRESS;Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;";

  const poolAcad = new sql.ConnectionPool({ connectionString: connAcademic } as any);
  const poolAcept = new sql.ConnectionPool({ connectionString: connAceptacion } as any);

  await poolAcad.connect();
  await poolAcept.connect();

  try {
    // 1. COMPARAR PRODUCTOS HISTÓRICOS (10 originales)
    console.log("\n--- 1. COMPARACIÓN DE PRODUCTOS HISTÓRICOS (10 ORIGINALES) ---");
    const prodsAcad = await poolAcad.request().query(`
      SELECT Codbarras_prod, Nombre_prod, Precio, Stock, ID_estado_prod, ID_categoria, ID_marca
      FROM dbo.Producto
      ORDER BY Codbarras_prod ASC
    `);
    const prodsAcept = await poolAcept.request().query(`
      SELECT Codbarras_prod, Nombre_prod, Precio, Stock, ID_estado_prod, ID_categoria, ID_marca
      FROM dbo.Producto
      WHERE Codbarras_prod IN (SELECT Codbarras_prod FROM dbo.Producto WHERE Codbarras_prod <= '7750000000010')
      ORDER BY Codbarras_prod ASC
    `);

    console.log(`Productos en Académica: ${prodsAcad.recordset.length}`);
    console.log(`Productos correspondientes en Aceptación: ${prodsAcept.recordset.length}`);

    prodsAcad.recordset.forEach((pA: any) => {
      const pAc = prodsAcept.recordset.find((x: any) => x.Codbarras_prod === pA.Codbarras_prod);
      if (!pAc) {
        console.error(`  [X] Producto ${pA.Codbarras_prod} no encontrado en aceptación!`);
      } else {
        const stockDiff = pA.Stock - pAc.Stock;
        console.log(`  [OK] ${pA.Codbarras_prod} | ${pA.Nombre_prod.padEnd(36)} | Precio Acad: S/ ${Number(pA.Precio).toFixed(2)} = Acept: S/ ${Number(pAc.Precio).toFixed(2)} | Stock Acad: ${pA.Stock} -> Acept: ${pAc.Stock} (Vendido: ${stockDiff})`);
      }
    });

    // 2. COMPARAR VENTAS HISTÓRICAS (5 ORIGINALES: ID_venta 1 a 5)
    console.log("\n--- 2. COMPARACIÓN DE VENTAS HISTÓRICAS (ID 1 AL 5) ---");
    const ventasAcad = await poolAcad.request().query(`
      SELECT ID_venta, CONVERT(VARCHAR(10), Fecha_venta, 120) AS Fecha, Total_venta, Numero_comprobante, ID_tipo_comp, Dni_cliente, ID_empleado
      FROM dbo.Venta
      ORDER BY ID_venta ASC
    `);
    const ventasAcept = await poolAcept.request().query(`
      SELECT ID_venta, CONVERT(VARCHAR(10), Fecha_venta, 120) AS Fecha, Total_venta, Numero_comprobante, ID_tipo_comp, Dni_cliente, ID_empleado
      FROM dbo.Venta
      WHERE ID_venta <= 5
      ORDER BY ID_venta ASC
    `);

    ventasAcad.recordset.forEach((vA: any) => {
      const vAc = ventasAcept.recordset.find((x: any) => x.ID_venta === vA.ID_venta);
      if (!vAc) {
        console.error(`  [X] Venta ID ${vA.ID_venta} no encontrada en aceptación!`);
      } else {
        const match =
          vA.Numero_comprobante === vAc.Numero_comprobante &&
          Number(vA.Total_venta) === Number(vAc.Total_venta) &&
          vA.Fecha === vAc.Fecha &&
          vA.Dni_cliente === vAc.Dni_cliente &&
          vA.ID_empleado === vAc.ID_empleado;
        console.log(`  [${match ? "OK" : "DIFERENCIA"}] Venta #${vA.ID_venta} | Comp: ${vA.Numero_comprobante} | Fecha: ${vA.Fecha} | Total: S/ ${Number(vA.Total_venta).toFixed(2)} | Cliente: ${vA.Dni_cliente} | Empleado: ${vA.ID_empleado}`);
      }
    });

    // 3. COMPARAR DETALLE_VENTA HISTÓRICO (8 FILAS ORIGINALES)
    console.log("\n--- 3. COMPARACIÓN DE DETALLES DE VENTA HISTÓRICOS (8 FILAS ORIGINALES) ---");
    const detAcad = await poolAcad.request().query(`
      SELECT ID_detalle, Cantidad, Precio_unitario, Subtotal, ID_venta, Codbarras_prod
      FROM dbo.Detalle_Venta
      ORDER BY ID_detalle ASC
    `);
    const detAcept = await poolAcept.request().query(`
      SELECT ID_detalle, Cantidad, Precio_unitario, Subtotal, ID_venta, Codbarras_prod
      FROM dbo.Detalle_Venta
      WHERE ID_venta <= 5
      ORDER BY ID_detalle ASC
    `);

    console.log(`Detalles en Académica: ${detAcad.recordset.length} (Esperado: 8)`);
    console.log(`Detalles correspondientes en Aceptación (Ventas 1-5): ${detAcept.recordset.length} (Esperado: 8)`);

    detAcad.recordset.forEach((dA: any) => {
      const dAc = detAcept.recordset.find((x: any) => x.ID_detalle === dA.ID_detalle);
      if (!dAc) {
        console.error(`  [X] Detalle ID ${dA.ID_detalle} no encontrado en aceptación!`);
      } else {
        const match =
          dA.ID_venta === dAc.ID_venta &&
          dA.Codbarras_prod === dAc.Codbarras_prod &&
          dA.Cantidad === dAc.Cantidad &&
          Number(dA.Precio_unitario) === Number(dAc.Precio_unitario) &&
          Number(dA.Subtotal) === Number(dAc.Subtotal);
        console.log(`  [${match ? "OK" : "DIFERENCIA"}] Detalle #${dA.ID_detalle} | Venta: ${dA.ID_venta} | Prod: ${dA.Codbarras_prod} | Cant: ${dA.Cantidad} | P.Unit: S/ ${Number(dA.Precio_unitario).toFixed(2)} | Subtotal: S/ ${Number(dA.Subtotal).toFixed(2)}`);
      }
    });

    // 4. COMPARAR VENTA_METODO_PAGO HISTÓRICO (6 FILAS ORIGINALES)
    console.log("\n--- 4. COMPARACIÓN DE PAGOS HISTÓRICOS (6 FILAS ORIGINALES) ---");
    const pagAcad = await poolAcad.request().query(`
      SELECT ID_venta, ID_metodo, Monto_pagado
      FROM dbo.Venta_Metodo_Pago
      ORDER BY ID_venta, ID_metodo ASC
    `);
    const pagAcept = await poolAcept.request().query(`
      SELECT ID_venta, ID_metodo, Monto_pagado
      FROM dbo.Venta_Metodo_Pago
      WHERE ID_venta <= 5
      ORDER BY ID_venta, ID_metodo ASC
    `);

    console.log(`Pagos en Académica: ${pagAcad.recordset.length} (Esperado: 6)`);
    console.log(`Pagos correspondientes en Aceptación (Ventas 1-5): ${pagAcept.recordset.length} (Esperado: 6)`);

    pagAcad.recordset.forEach((pA: any) => {
      const pAc = pagAcept.recordset.find((x: any) => x.ID_venta === pA.ID_venta && x.ID_metodo === pA.ID_metodo);
      if (!pAc) {
        console.error(`  [X] Pago Venta ${pA.ID_venta} Método ${pA.ID_metodo} no encontrado!`);
      } else {
        const match = Number(pA.Monto_pagado) === Number(pAc.Monto_pagado);
        console.log(`  [${match ? "OK" : "DIFERENCIA"}] Pago Venta #${pA.ID_venta} | Método: ${pA.ID_metodo} | Monto Acad: S/ ${Number(pA.Monto_pagado).toFixed(2)} = Acept: S/ ${Number(pAc.Monto_pagado).toFixed(2)}`);
      }
    });

    // 5. COMPARAR MOVIMIENTOS DE INVENTARIO HISTÓRICOS (17 FILAS ORIGINALES)
    console.log("\n--- 5. COMPARACIÓN DE MOVIMIENTOS KARDEX HISTÓRICOS (17 ORIGINALES) ---");
    const movAcad = await poolAcad.request().query(`
      SELECT ID_movimiento, CONVERT(VARCHAR(10), Fecha, 120) AS Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado
      FROM dbo.Mov_Inventario
      ORDER BY ID_movimiento ASC
    `);
    const movAcept = await poolAcept.request().query(`
      SELECT ID_movimiento, CONVERT(VARCHAR(10), Fecha, 120) AS Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado
      FROM dbo.Mov_Inventario
      WHERE ID_movimiento <= 17
      ORDER BY ID_movimiento ASC
    `);

    console.log(`Movimientos en Académica: ${movAcad.recordset.length} (Esperado: 17)`);
    console.log(`Movimientos correspondientes en Aceptación (ID <= 17): ${movAcept.recordset.length} (Esperado: 17)`);

    movAcad.recordset.forEach((mA: any) => {
      const mAc = movAcept.recordset.find((x: any) => x.ID_movimiento === mA.ID_movimiento);
      if (!mAc) {
        console.error(`  [X] Movimiento ID ${mA.ID_movimiento} no encontrado!`);
      } else {
        const match =
          mA.Fecha === mAc.Fecha &&
          mA.Cantidad === mAc.Cantidad &&
          mA.ID_tipo_mov === mAc.ID_tipo_mov &&
          mA.Codbarras_prod === mAc.Codbarras_prod &&
          mA.ID_empleado === mAc.ID_empleado;
        console.log(`  [${match ? "OK" : "DIFERENCIA"}] Mov #${mA.ID_movimiento} | Fecha: ${mA.Fecha} | Tipo: ${mA.ID_tipo_mov} | Prod: ${mA.Codbarras_prod} | Cant: ${mA.Cantidad} | Emp: ${mA.ID_empleado}`);
      }
    });

    // 6. RESUMEN GLOBAL DE CONTEOS
    console.log("\n--- 6. RESUMEN GLOBAL DE CONTEOS COMPARADOS ---");
    const summary = [
      {
        Tabla: "dbo.Producto",
        Academica: (await poolAcad.request().query("SELECT COUNT(1) AS c FROM dbo.Producto")).recordset[0].c,
        Aceptacion: (await poolAcept.request().query("SELECT COUNT(1) AS c FROM dbo.Producto")).recordset[0].c,
        Explicacion: "10 originales + 2 productos de prueba Fase 3B/4"
      },
      {
        Tabla: "dbo.Venta",
        Academica: (await poolAcad.request().query("SELECT COUNT(1) AS c FROM dbo.Venta")).recordset[0].c,
        Aceptacion: (await poolAcept.request().query("SELECT COUNT(1) AS c FROM dbo.Venta")).recordset[0].c,
        Explicacion: "5 históricas + 4 ventas de prueba Fase 6B"
      },
      {
        Tabla: "dbo.Detalle_Venta",
        Academica: (await poolAcad.request().query("SELECT COUNT(1) AS c FROM dbo.Detalle_Venta")).recordset[0].c,
        Aceptacion: (await poolAcept.request().query("SELECT COUNT(1) AS c FROM dbo.Detalle_Venta")).recordset[0].c,
        Explicacion: "8 originales + 5 líneas de las 4 ventas Fase 6B"
      },
      {
        Tabla: "dbo.Venta_Metodo_Pago",
        Academica: (await poolAcad.request().query("SELECT COUNT(1) AS c FROM dbo.Venta_Metodo_Pago")).recordset[0].c,
        Aceptacion: (await poolAcept.request().query("SELECT COUNT(1) AS c FROM dbo.Venta_Metodo_Pago")).recordset[0].c,
        Explicacion: "6 originales + 5 pagos asignados en Fase 6B"
      },
      {
        Tabla: "dbo.Mov_Inventario",
        Academica: (await poolAcad.request().query("SELECT COUNT(1) AS c FROM dbo.Mov_Inventario")).recordset[0].c,
        Aceptacion: (await poolAcept.request().query("SELECT COUNT(1) AS c FROM dbo.Mov_Inventario")).recordset[0].c,
        Explicacion: "17 originales + 8 de Fase 4 + 5 salidas Fase 6B"
      }
    ];

    console.table(summary);

    // 7. CONCILIACIÓN FINANCIERA Y STOCK ACTUAL DE ACEPTACIÓN
    console.log("\n--- 7. CONCILIACIÓN FINANCIERA EN ACEPTACIÓN ---");
    const vTot = (await poolAcept.request().query("SELECT SUM(Total_venta) AS s FROM dbo.Venta")).recordset[0].s;
    const dTot = (await poolAcept.request().query("SELECT SUM(Subtotal) AS s FROM dbo.Detalle_Venta")).recordset[0].s;
    const pTot = (await poolAcept.request().query("SELECT SUM(Monto_pagado) AS s FROM dbo.Venta_Metodo_Pago")).recordset[0].s;
    const sTot = (await poolAcept.request().query("SELECT SUM(Stock) AS s FROM dbo.Producto")).recordset[0].s;

    console.log(`  Total Venta:    S/ ${Number(vTot).toFixed(2)}`);
    console.log(`  Total Detalle:  S/ ${Number(dTot).toFixed(2)}`);
    console.log(`  Total Pagos:    S/ ${Number(pTot).toFixed(2)}`);
    console.log(`  Diferencia:     S/ ${(Number(vTot) - Number(dTot) + Number(vTot) - Number(pTot)).toFixed(4)}`);
    console.log(`  Stock Físico:   ${sTot} unidades`);

    const exact = Math.abs(Number(vTot) - Number(dTot)) < 0.001 && Math.abs(Number(vTot) - Number(pTot)) < 0.001;
    console.log(`  [${exact ? "OK" : "ERROR"}] Conciliación financiera exacta: ${exact}`);

  } finally {
    await poolAcad.close();
    await poolAcept.close();
  }
}

runComparison().catch((err) => {
  console.error("Error en comparación:", err);
  process.exit(1);
});
