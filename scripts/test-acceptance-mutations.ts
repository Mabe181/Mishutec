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
import { assertMutationsAllowed } from "../src/lib/db-guard";
import {
  createProductTransactional,
  updateProductTransactional,
  discontinueProductLogical,
} from "../src/lib/repositories/product-mutation.repository";
import { findProductByBarcode } from "../src/lib/repositories/product.repository";

async function runAcceptanceTests() {
  console.log("================================================================================");
  console.log("    PRUEBAS TRANSACCIONALES REALES EN BASE DE ACEPTACIÓN (MishutecT2_Aceptacion)");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail = "") {
    if (condition) {
      console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  const pool = await getPool();

  // Test 0: Confirmar que estamos conectados a MishutecT2_Aceptacion
  const currentDbRes = await pool.request().query("SELECT DB_NAME() AS currentDb");
  const currentDb = String(currentDbRes.recordset[0].currentDb);
  assert(
    "Entorno Activo: Conectado a la base de aceptación autorizada",
    currentDb.toLowerCase() === "mishutect2_aceptacion",
    currentDb
  );

  // Limpiar si el producto de prueba '7750000000011' existía de una corrida previa para dejar prueba limpia
  await pool.request().query(`
    DELETE FROM [MishutecT2_Aceptacion].dbo.Suministra WHERE Codbarras_prod = '7750000000011';
    DELETE FROM [MishutecT2_Aceptacion].dbo.CPU WHERE Codbarras_prod = '7750000000011';
    DELETE FROM [MishutecT2_Aceptacion].dbo.Producto WHERE Codbarras_prod = '7750000000011';
  `);

  // ============================================================================
  // TEST 1: REGISTRO DE PRODUCTO VÁLIDO (COMMIT TRANSACCIONAL)
  // ============================================================================
  console.log("\n--- TEST 1: Creación Atómica (Producto + CPU + Proveedor) ---");
  const newProductPayload = {
    codbarras: "7750000000011",
    nombre: "AMD Ryzen 5 5600X 6-Core",
    precio: 720.50,
    garantiaMeses: 36,
    idCategoria: 3, // CPU
    idMarca: 4,     // AMD
    idEstado: undefined, // Debe resolverse a Agotado (2) por tener Stock = 0
    specs: {
      cpu: {
        frecuenciaGhz: 3.70,
        nucleos: 6,
      },
    },
    proveedores: [
      { idProveedor: 1, precioCompra: 580.00 }, // Tecno Import Perú
    ],
  };

  const createRes = await createProductTransactional(newProductPayload);
  assert("Transacción 1 (COMMIT): Producto creado exitosamente", createRes.success, createRes.codbarras);

  // Verificar en SQL Server directamente
  const verifyP1 = await findProductByBarcode("7750000000011");
  assert("Integridad SQL: Producto recuperado de dbo.Producto", verifyP1 !== null && verifyP1.nombre === "AMD Ryzen 5 5600X 6-Core");
  assert("Integridad SQL: Stock inicial es estrictamente 0", verifyP1?.stock === 0, `Stock: ${verifyP1?.stock}`);
  assert("Coherencia Inventario: Estado operativo es 'Agotado'", verifyP1?.estado === "Agotado", `Estado: ${verifyP1?.estado}`);
  assert("Especialización Técnica: Frecuencia 3.70 GHz y 6 núcleos", verifyP1?.specs.cpu?.frecuenciaGhz === 3.7 && verifyP1?.specs.cpu?.nucleos === 6);
  assert("Cadena de Suministro: 1 proveedor vinculado con costo S/ 580.00", verifyP1?.proveedores.length === 1 && verifyP1?.proveedores[0].precioCompra === 580);

  // ============================================================================
  // TEST 2: RECHAZO DE CÓDIGO DUPLICADO
  // ============================================================================
  console.log("\n--- TEST 2: Rechazo de Código de Barras Duplicado ---");
  let duplicateRejected = false;
  try {
    await createProductTransactional(newProductPayload);
  } catch (err: any) {
    duplicateRejected = true;
    assert("Validación Unicidad: Código duplicado capturado y rechazado", err.message.includes("ya se encuentra registrado"), err.message);
  }
  assert("Validación Unicidad: Excepción lanzada correctamente", duplicateRejected);

  // ============================================================================
  // TEST 3: ROLLBACK COMPLETO ANTE ERROR (Atomicidad Total)
  // ============================================================================
  console.log("\n--- TEST 3: Verificación de ROLLBACK ante fallo en especialización ---");
  const failedPayload = {
    codbarras: "7750000000099",
    nombre: "Producto Fallido de Prueba",
    precio: 300.0,
    garantiaMeses: 12,
    idCategoria: 3, // CPU
    idMarca: 1,
    specs: {}, // CPU specs ausentes intencionalmente para forzar fallo
    proveedores: [],
  };

  let rollbackExecuted = false;
  try {
    await createProductTransactional(failedPayload as any);
  } catch (err: any) {
    rollbackExecuted = true;
    assert("Atomicidad SQL: Error intencional capturado en transacción", err.message.includes("características técnicas requeridas"));
  }
  assert("Atomicidad SQL: Excepción capturada", rollbackExecuted);

  // Comprobar que en dbo.Producto NO existe '7750000000099' (Rollback exitoso)
  const orphanCheck = await pool.request().query("SELECT Codbarras_prod FROM dbo.Producto WHERE Codbarras_prod = '7750000000099'");
  assert("Atomicidad SQL: Cero registros huérfanos en dbo.Producto (Rollback total verificado)", orphanCheck.recordset.length === 0);

  // ============================================================================
  // TEST 4: EDICIÓN TRANSACCIONAL DEL PRODUCTO
  // ============================================================================
  console.log("\n--- TEST 4: Edición Atómica (Actualización de Comercial, Specs y Proveedores) ---");
  const updatePayload = {
    codbarras: "7750000000011",
    nombre: "AMD Ryzen 5 5600X Black Edition",
    precio: 699.90,
    garantiaMeses: 24,
    idMarca: 4,
    idEstado: 2, // Agotado
    specs: {
      cpu: {
        frecuenciaGhz: 3.90,
        nucleos: 6,
      },
    },
    proveedores: [
      { idProveedor: 1, precioCompra: 560.00 },
      { idProveedor: 2, precioCompra: 575.00 }, // Agregar segundo proveedor
    ],
  };

  const updateRes = await updateProductTransactional(updatePayload);
  assert("Transacción 2 (COMMIT): Edición confirmada exitosamente", updateRes.success, updateRes.codbarras);

  const verifyP1Updated = await findProductByBarcode("7750000000011");
  assert("Edición SQL: Nombre actualizado", verifyP1Updated?.nombre === "AMD Ryzen 5 5600X Black Edition");
  assert("Edición SQL: Precio actualizado a S/ 699.90", verifyP1Updated?.precio === 699.9);
  assert("Edición SQL: Frecuencia actualizada a 3.90 GHz", verifyP1Updated?.specs.cpu?.frecuenciaGhz === 3.9);
  assert("Edición SQL: 2 proveedores actualizados en dbo.Suministra", verifyP1Updated?.proveedores.length === 2);
  assert("Edición SQL: Stock se mantiene inalterado en 0", verifyP1Updated?.stock === 0);

  // ============================================================================
  // TEST 5: DESCONTINUACIÓN POR BAJA LÓGICA (Estado_Prod)
  // ============================================================================
  console.log("\n--- TEST 5: Descontinuación por Baja Lógica ---");
  const discRes = await discontinueProductLogical("7750000000011");
  assert("Baja Lógica: Estado resuelto y actualizado a Descontinuado", discRes.success, discRes.estadoNombre);

  const verifyP1Disc = await findProductByBarcode("7750000000011");
  assert("Baja Lógica: Producto persiste en SQL Server (no borrado físico)", verifyP1Disc !== null);
  assert("Baja Lógica: Estado es 'Descontinuado'", verifyP1Disc?.estado === "Descontinuado", `Estado: ${verifyP1Disc?.estado}`);
  assert("Baja Lógica: Especificaciones técnicas e historial intactos", verifyP1Disc?.specs.cpu?.nucleos === 6 && verifyP1Disc?.proveedores.length === 2);

  // ============================================================================
  // TEST 6: INTEGRIDAD Y CONCILIACIÓN DE LA BASE ACADÉMICA MishutecT2
  // ============================================================================
  console.log("\n--- TEST 6: Conciliación Cruzada entre Ambas Bases de Datos ---");
  const [acadProd, acadStock, acadVentas, acadTotal] = await Promise.all([
    pool.request().query("SELECT COUNT(*) AS total FROM [MishutecT2].dbo.Producto"),
    pool.request().query("SELECT SUM(Stock) AS totalStock FROM [MishutecT2].dbo.Producto"),
    pool.request().query("SELECT COUNT(*) AS total FROM [MishutecT2].dbo.Venta"),
    pool.request().query("SELECT SUM(Total_venta) AS totalVentas FROM [MishutecT2].dbo.Venta"),
  ]);

  const [acepProd, acepStock, acepVentas, acepTotal] = await Promise.all([
    pool.request().query("SELECT COUNT(*) AS total FROM [MishutecT2_Aceptacion].dbo.Producto"),
    pool.request().query("SELECT SUM(Stock) AS totalStock FROM [MishutecT2_Aceptacion].dbo.Producto"),
    pool.request().query("SELECT COUNT(*) AS total FROM [MishutecT2_Aceptacion].dbo.Venta"),
    pool.request().query("SELECT SUM(Total_venta) AS totalVentas FROM [MishutecT2_Aceptacion].dbo.Venta"),
  ]);

  const cAcadProd = Number(acadProd.recordset[0].total);
  const cAcadStock = Number(acadStock.recordset[0].totalStock);
  const cAcadVentas = Number(acadVentas.recordset[0].total);
  const cAcadTotal = Number(acadTotal.recordset[0].totalVentas);

  const cAcepProd = Number(acepProd.recordset[0].total);
  const cAcepStock = Number(acepStock.recordset[0].totalStock);
  const cAcepVentas = Number(acepVentas.recordset[0].total);
  const cAcepTotal = Number(acepTotal.recordset[0].totalVentas);

  console.log(`\nBase Académica [MishutecT2]:`);
  console.log(`   - Productos: ${cAcadProd} (Esperado: 10)`);
  console.log(`   - Stock: ${cAcadStock} (Esperado: 73)`);
  console.log(`   - Ventas: ${cAcadVentas} (Esperado: 5)`);
  console.log(`   - Total Ventas: S/ ${cAcadTotal.toFixed(2)} (Esperado: S/ 4,050.00)`);

  console.log(`\nBase de Aceptación [MishutecT2_Aceptacion]:`);
  console.log(`   - Productos: ${cAcepProd} (Esperado: 11: 10 iniciales + 1 creado)`);
  console.log(`   - Stock: ${cAcepStock} (Esperado: 73: stock inicial 0 no altera stock total)`);
  console.log(`   - Ventas: ${cAcepVentas} (Esperado: 5)`);
  console.log(`   - Total Ventas: S/ ${cAcepTotal.toFixed(2)} (Esperado: S/ 4,050.00)`);

  assert("DEMOSTRACIÓN: Base académica MishutecT2 permanece 100% INTACTA", cAcadProd === 10 && cAcadStock === 73 && cAcadVentas === 5 && cAcadTotal === 4050);
  assert("PERSISTENCIA: Base de aceptación MishutecT2_Aceptacion conserva 11 productos", cAcepProd === 11);

  console.log("================================================================================");
  console.log(`[RESUMEN FINAL] ${passed} pruebas exitosas, ${failed} fallos.`);
  console.log("================================================================================");

  await closePool();
  process.exit(failed > 0 ? 1 : 0);
}

runAcceptanceTests();
