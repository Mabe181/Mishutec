import { getPool, closePool } from "../src/lib/db";

// Cargar .env.local si no está cargado
import fs from "fs";
import path from "path";

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
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function reconcile() {
  console.log("================================================================================");
  console.log("               MISHUTEC - AUDITORÍA Y CONCILIACIÓN DE DATOS                     ");
  console.log("================================================================================");

  const pool = await getPool();

  // 1. Productos individuales
  console.log("\n--- 1. DETALLE DE PRODUCTOS EN dbo.Producto ---");
  const prodsRes = await pool.request().query(`
    SELECT 
      p.Codbarras_prod,
      p.Nombre_prod,
      c.Nombre_cat AS Categoria,
      m.Nombre_marca AS Marca,
      p.Stock,
      p.Precio,
      (p.Stock * p.Precio) AS SubtotalValor
    FROM dbo.Producto p
    JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
    JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
    ORDER BY c.Nombre_cat, p.Nombre_prod;
  `);
  console.table(prodsRes.recordset);

  // 2. Suma global de dbo.Producto
  const prodTotalsRes = await pool.request().query(`
    SELECT 
      COUNT(*) AS TotalProductos,
      SUM(Stock) AS StockTotalGlobal,
      SUM(Stock * Precio) AS ValorInventarioGlobal,
      SUM(CASE WHEN Stock = 0 THEN 1 ELSE 0 END) AS ProductosAgotados,
      SUM(CASE WHEN Stock > 0 AND Stock <= 5 THEN 1 ELSE 0 END) AS ProductosStockBajo
    FROM dbo.Producto;
  `);
  const totals = prodTotalsRes.recordset[0];
  console.log("\n--- TOTALES GLOBALES EN dbo.Producto ---");
  console.log(`Total Productos:        ${totals.TotalProductos}`);
  console.log(`Stock Total Global:     ${totals.StockTotalGlobal} unidades`);
  console.log(`Valor Inventario Global: S/. ${Number(totals.ValorInventarioGlobal).toFixed(2)}`);
  console.log(`Productos Agotados (0): ${totals.ProductosAgotados}`);
  console.log(`Stock Bajo (1 a 5):     ${totals.ProductosStockBajo}`);

  // 3. Agrupación por Categoria
  console.log("\n--- 2. CONCILIACIÓN POR CATEGORÍA ---");
  const catRes = await pool.request().query(`
    SELECT 
      c.ID_categoria,
      c.Nombre_cat,
      COUNT(p.Codbarras_prod) AS NumProductos,
      ISNULL(SUM(p.Stock), 0) AS StockCategoria,
      ISNULL(SUM(CAST(p.Stock AS BIGINT) * p.Precio), 0) AS ValorCategoria
    FROM dbo.Categoria c
    LEFT JOIN dbo.Producto p ON c.ID_categoria = p.ID_categoria
    GROUP BY c.ID_categoria, c.Nombre_cat
    ORDER BY StockCategoria DESC, NumProductos DESC;
  `);
  console.table(catRes.recordset);

  const sumCatStock = catRes.recordset.reduce((acc, row) => acc + Number(row.StockCategoria), 0);
  const sumCatValor = catRes.recordset.reduce((acc, row) => acc + Number(row.ValorCategoria), 0);

  console.log(`Suma de Stock por Categorías:  ${sumCatStock} unidades`);
  console.log(`Suma de Valor por Categorías:  S/. ${sumCatValor.toFixed(2)}`);

  const stockMatches = sumCatStock === Number(totals.StockTotalGlobal);
  const valorMatches = sumCatValor === Number(totals.ValorInventarioGlobal);

  console.log(`¿Coincide Stock? ${stockMatches ? "SÍ (73 unidades)" : "NO"}`);
  console.log(`¿Coincide Valor? ${valorMatches ? "SÍ (S/. 27,810.00)" : "NO"}`);

  // 4. Detalle y sumas de Venta
  console.log("\n--- 3. CONCILIACIÓN DE VENTAS EN dbo.Venta ---");
  const ventasRes = await pool.request().query(`
    SELECT 
      v.ID_venta,
      v.Numero_comprobante,
      CONVERT(VARCHAR(10), v.Fecha_venta, 120) AS Fecha,
      v.Total_venta,
      tc.Nombre_tipo AS Tipo
    FROM dbo.Venta v
    JOIN dbo.Tipo_Comprobante tc ON v.ID_tipo_comp = tc.ID_tipo_comp
    ORDER BY v.Fecha_venta ASC, v.ID_venta ASC;
  `);
  console.table(ventasRes.recordset);

  const sumVentas = ventasRes.recordset.reduce((acc, row) => acc + Number(row.Total_venta), 0);
  console.log(`Total Comprobantes: ${ventasRes.recordset.length}`);
  console.log(`Suma Total de Ventas: S/. ${sumVentas.toFixed(2)} (Esperado: S/. 4,050.00)`);

  // 5. Clientes
  const clientesRes = await pool.request().query("SELECT COUNT(*) AS TotalClientes FROM dbo.Cliente");
  console.log(`Total Clientes: ${clientesRes.recordset[0].TotalClientes} (Esperado: 5)`);

  await closePool();
}

reconcile().catch(console.error);
