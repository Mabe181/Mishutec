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

import { getProductDetailByBarcode } from "../src/lib/services/product.service";
import { closePool } from "../src/lib/db";

async function runTests() {
  console.log("=== VERIFICACIÓN DE FICHAS TÉCNICAS (ETAPA 1) ===");

  const barcodesToTest = [
    { code: "7750000000001", expectedCat: "RAM", expectedSuppliers: 2 },
    { code: "7750000000007", expectedCat: "Grafica", expectedSuppliers: 1 },
    { code: "7750000000010", expectedCat: "SSD", expectedSuppliers: 0 },
    { code: "9999999999999", expectedCat: null, expectedSuppliers: null },
  ];

  for (const t of barcodesToTest) {
    try {
      const detail = await getProductDetailByBarcode(t.code);
      if (detail) {
        console.log(`\n[OK] Código ${t.code} (${detail.nombre}):`);
        console.log(`   - Categoría: ${detail.categoria} (Esperada: ${t.expectedCat})`);
        console.log(`   - Stock: ${detail.stock} | Estado: ${detail.estado}`);
        console.log(`   - Proveedores: ${detail.proveedores.length} (Esperados: ${t.expectedSuppliers})`);
        console.log(`   - Specs:`, JSON.stringify(detail.specs));
      } else {
        if (t.expectedCat === null) {
          console.log(`\n[OK] Código ${t.code} no existe -> Retorna null (404 esperado)`);
        } else {
          console.error(`\n[FAIL] Código ${t.code} no encontrado pero se esperaba categoría ${t.expectedCat}`);
        }
      }
    } catch (err) {
      console.error(`[ERROR] Falló consulta para ${t.code}:`, err);
    }
  }

  await closePool();
  process.exit(0);
}

runTests();
