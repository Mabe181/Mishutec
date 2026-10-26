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

import { verifyPassword } from "../src/lib/auth/password";
import { isMutationAllowed, assertMutationsAllowed } from "../src/lib/db-guard";
import {
  createProductSchema,
  updateProductSchema,
} from "../src/lib/validations/product-mutation.schema";
import { getPool, closePool } from "../src/lib/db";

async function runTests() {
  console.log("================================================================================");
  console.log("       PRUEBAS DE SEGURIDAD, VALIDACIÓN Y PROTECCIÓN ACADÉMICA (FASE 3B)        ");
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

  // Test 1: Verificación de contraseñas y hash scrypt
  const testPass = "AdminMishutec2026*";
  const storedHash = process.env.ADMIN_PASSWORD_HASH || "";
  const isPassValid = verifyPassword(testPass, storedHash);
  assert("Autenticación: Hash scrypt valida contraseña administrativa correcta", isPassValid);

  const isWrongPassRejected = !verifyPassword("WrongPassword123!", storedHash);
  assert("Autenticación: Contraseña incorrecta rechazada de inmediato", isWrongPassRejected);

  // Test 2: Protección de la base de datos académica MishutecT2
  const guardStatus = isMutationAllowed();
  assert(
    "Guardián de BD: Base académica MishutecT2 detectada y protegida",
    !guardStatus.allowed && guardStatus.dbName.toLowerCase() === "mishutect2",
    guardStatus.reason
  );

  let errorCaptured = false;
  try {
    assertMutationsAllowed("Crear Producto");
  } catch (err: any) {
    errorCaptured = true;
    assert("Guardián de BD: Excepción AcademicDatabaseProtectedError lanzada", err.name === "AcademicDatabaseProtectedError");
  }
  assert("Guardián de BD: Mutación abortada antes de alcanzar SQL Server", errorCaptured);

  // Test 3: Validación Zod de Creación - Código Duplicado o Malformado
  const validPayload = {
    codbarras: "7750000000099",
    nombre: "Intel Core i7-14700K",
    precio: 1650.0,
    garantiaMeses: 36,
    idCategoria: 3, // CPU
    idMarca: 5,
    idEstado: 1,
    specs: {
      cpu: {
        frecuenciaGhz: 3.4,
        nucleos: 20,
      },
    },
    proveedores: [{ idProveedor: 1, precioCompra: 1350.0 }],
  };

  const parseValid = createProductSchema.safeParse(validPayload);
  assert("Validación Zod: Producto completo válido aceptado", parseValid.success);

  // Test 4: Validación Zod - Precio inválido (<= 0)
  const invalidPrice = { ...validPayload, precio: -50 };
  const parseInvalidPrice = createProductSchema.safeParse(invalidPrice);
  assert("Validación Zod: Precio negativo rechazado por regla positive()", !parseInvalidPrice.success);

  // Test 5: Validación Zod - Nombre mayor a 120 caracteres (límite SQL)
  const invalidName = { ...validPayload, nombre: "A".repeat(125) };
  const parseInvalidName = createProductSchema.safeParse(invalidName);
  assert("Validación Zod: Nombre mayor a 120 caracteres rechazado", !parseInvalidName.success);

  // Test 6: Validación Zod - Código de barras mayor a 13 caracteres (límite SQL)
  const invalidCode = { ...validPayload, codbarras: "123456789012345" };
  const parseInvalidCode = createProductSchema.safeParse(invalidCode);
  assert("Validación Zod: Código mayor a 13 caracteres rechazado", !parseInvalidCode.success);

  // Test 7: Validación Zod - Interfaz SSD mayor a 20 caracteres (límite SQL varchar(20))
  const invalidSsd = {
    ...validPayload,
    idCategoria: 2, // SSD
    specs: {
      ssd: {
        capacidadGb: 1000,
        interfaz: "InterfazSuperMegaUltraLargaQueExcede20Car",
      },
    },
  };
  const parseInvalidSsd = createProductSchema.safeParse(invalidSsd);
  assert("Validación Zod: Interfaz SSD mayor a 20 caracteres rechazada", !parseInvalidSsd.success);

  // Test 8: Conciliación de datos reales en MishutecT2 (comprobar que la base original sigue 100% intacta)
  const pool = await getPool();
  const [prodRes, ventRes] = await Promise.all([
    pool.request().query("SELECT COUNT(*) AS total, SUM(Stock) AS totalStock FROM dbo.Producto"),
    pool.request().query("SELECT COUNT(*) AS total, SUM(Total_venta) AS totalVentas FROM dbo.Venta"),
  ]);

  const prodCount = Number(prodRes.recordset[0].total);
  const totalStock = Number(prodRes.recordset[0].totalStock);
  const ventCount = Number(ventRes.recordset[0].total);
  const totalVentas = Number(ventRes.recordset[0].totalVentas);

  assert("Integridad SQL: 10 productos en dbo.Producto (intactos)", prodCount === 10, `Total: ${prodCount}`);
  assert("Integridad SQL: 73 unidades de stock total en dbo.Producto (intacto)", totalStock === 73, `Stock: ${totalStock}`);
  assert("Integridad SQL: 5 ventas en dbo.Venta (intactas)", ventCount === 5, `Total: ${ventCount}`);
  assert("Integridad SQL: S/ 4,050.00 en ventas acumuladas (intacto)", totalVentas === 4050, `Ventas: S/ ${totalVentas}`);

  console.log("================================================================================");
  console.log(`[RESUMEN] ${passed} pruebas exitosas, ${failed} fallos.`);
  console.log("================================================================================");

  await closePool();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
