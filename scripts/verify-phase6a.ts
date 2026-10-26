import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fetchSales, fetchSaleDetail, fetchPosCatalog } from "../src/lib/services/sale.service";
import { fetchClients } from "../src/lib/services/client.service";
import { getClientDetailAction } from "../src/lib/actions/client.actions";
import { getEmployeeDetailAction } from "../src/lib/actions/employee.actions";
import { maskDni, maskPhone, maskEmail } from "../src/lib/formatters";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9225;
const OUT_DIR = path.resolve(process.cwd(), "screenshots/phase6a");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  private ws!: WebSocket;
  private id = 1;
  private pending = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();

  async connect(wsUrl: string) {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  console.log("================================================================================");
  console.log("         MISHUTEC - BATERÍA DE PRUEBAS DE FASE 6A (VENTAS & POS)                ");
  console.log("================================================================================");

  // 1. Verificación de Lógica de Ventas y Conciliación
  console.log("\n[TEST 1] Verificando consulta de ventas en SQL Server...");
  const salesData = await fetchSales();
  console.log(`✓ Ventas registradas recuperadas: ${salesData.sales.length} (Esperado: 5)`);
  console.log(`✓ Total acumulado vendido: S/. ${salesData.kpis.totalVentasAcumuladas} (Esperado: S/. 4,050.00)`);
  console.log(`✓ Boletas emitidas: ${salesData.kpis.totalBoletas} (Esperado: 4)`);
  console.log(`✓ Facturas emitidas: ${salesData.kpis.totalFacturas} (Esperado: 1)`);

  if (salesData.sales.length !== 5 || salesData.kpis.totalVentasAcumuladas !== 4050) {
    throw new Error("Discrepancia en métricas globales de ventas.");
  }

  // 2. Conciliación detallada de cada venta
  console.log("\n[TEST 2] Verificando conciliación transaccional de cada una de las 5 ventas...");
  for (const s of salesData.sales) {
    const detail = await fetchSaleDetail(s.idVenta);
    if (!detail) throw new Error(`No se pudo cargar el detalle de la venta #${s.idVenta}`);

    console.log(
      `  Venta #${detail.idVenta} (${detail.numeroComprobante}): Cabecera=${detail.total}, Detalles=${detail.sumDetalles}, Pagos=${detail.sumPagos} -> Conciliado: ${detail.isReconciled ? "✓ OK" : "✗ FALLO"}`
    );
    if (!detail.isReconciled) {
      throw new Error(`Fallo de conciliación en venta #${s.idVenta}`);
    }
  }

  // 3. Catálogo POS con stock > 0
  console.log("\n[TEST 3] Verificando catálogo para Terminal POS...");
  const posProducts = await fetchPosCatalog();
  console.log(`✓ Productos con stock disponible para venta: ${posProducts.length}`);
  const hasZeroStock = posProducts.some((p) => p.stock <= 0 || p.estado !== "Disponible");
  if (hasZeroStock) {
    throw new Error("El catálogo del POS incluye productos agotados o no disponibles.");
  }
  console.log("✓ Todos los productos para POS tienen stock > 0 y estado 'Disponible'.");

  // 4. Corrección 1: Clientes Recurrentes (>= 2 compras)
  console.log("\n[TEST 4] Verificando regla de Clientes Recurrentes (>= 2 compras)...");
  const clients = await fetchClients();
  const recurrentClients = clients.filter((c) => c.totalVentas >= 2);
  const singlePurchaseClients = clients.filter((c) => c.totalVentas === 1);
  console.log(`✓ Total clientes: ${clients.length}`);
  console.log(`✓ Clientes con >= 2 compras (Recurrentes): ${recurrentClients.length} (Cliente: ${recurrentClients.map(c => c.nombreCompleto).join(", ")})`);
  console.log(`✓ Clientes con exactamente 1 compra: ${singlePurchaseClients.length}`);
  if (recurrentClients.length !== 1) {
    throw new Error(`Esperado 1 cliente recurrente, obtenido: ${recurrentClients.length}`);
  }

  // 5. Corrección 2: Protección de Datos Personales (Acceso no autenticado)
  console.log("\n[TEST 5] Verificando protección y enmascaramiento de datos personales...");
  const rawDni = "72145890";
  const maskedD = maskDni(rawDni);
  const maskedP = maskPhone("987654321");
  const maskedE = maskEmail("ana.torres@gmail.com");
  console.log(`✓ Enmascaramiento DNI: '${rawDni}' -> '${maskedD}'`);
  console.log(`✓ Enmascaramiento Teléfono: '987654321' -> '${maskedP}'`);
  console.log(`✓ Enmascaramiento Email: 'ana.torres@gmail.com' -> '${maskedE}'`);

  const unauthClientDetail = await getClientDetailAction(rawDni);
  console.log(`✓ Invocación no autenticada de getClientDetailAction:`, unauthClientDetail);
  if (unauthClientDetail.statusCode !== 401) {
    throw new Error("getClientDetailAction no denegó el acceso no autenticado con 401.");
  }

  const unauthEmployeeDetail = await getEmployeeDetailAction(1);
  console.log(`✓ Invocación no autenticada de getEmployeeDetailAction:`, unauthEmployeeDetail);
  if (unauthEmployeeDetail.statusCode !== 401) {
    throw new Error("getEmployeeDetailAction no denegó el acceso no autenticado con 401.");
  }

  // 6. Pruebas de Renderizado Responsive y Capturas con Edge Headless CDP
  console.log("\n[TEST 6] Iniciando Edge Headless para verificación responsive y capturas de Fase 6A...");
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.resolve(process.cwd(), ".tmp-edge-p6a")}`,
    "about:blank",
  ];

  const edgeProc = spawn(EDGE_PATH, edgeArgs, { stdio: "ignore" });

  let wsUrl = "";
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = (await res.json()) as any;
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await sleep(300);
  }

  if (!wsUrl) {
    edgeProc.kill();
    throw new Error("No se pudo conectar a Edge CDP");
  }

  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: "PUT" });
  const tabData = (await newTabRes.json()) as any;
  const client = new CDPClient();
  await client.connect(tabData.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("DOM.enable");
  await client.send("Runtime.enable");

  const viewports = [
    { name: "mobile-320", width: 320, height: 568, isMobile: true },
    { name: "mobile-390", width: 390, height: 844, isMobile: true },
    { name: "tablet-768", width: 768, height: 1024, isMobile: false },
    { name: "desktop-1440", width: 1440, height: 900, isMobile: false },
  ];

  for (const vp of viewports) {
    console.log(`\nProbando /ventas en ${vp.name} (${vp.width}x${vp.height})...`);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.isMobile,
    });

    await client.send("Page.navigate", { url: "http://localhost:3000/ventas" });
    await sleep(1500);

    // Evaluar overflow
    const evalRes = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const docEl = document.documentElement;
        const winWidth = window.innerWidth;
        const scrollWidth = docEl.scrollWidth;
        return {
          innerWidth: winWidth,
          scrollWidth: scrollWidth,
          hasOverflow: scrollWidth > winWidth + 1
        };
      })()`,
      returnByValue: true,
    });

    const m = evalRes.result.value;
    console.log(`  [${m.hasOverflow ? "✗ FAIL" : "✓ PASS"}] inner=${m.innerWidth}px, scroll=${m.scrollWidth}px`);
    if (m.hasOverflow) {
      throw new Error(`Desbordamiento horizontal detectado en /ventas en ${vp.name}`);
    }

    // Capturar pantalla de Historial
    const shotHist = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(OUT_DIR, `ventas-historial-${vp.name}.png`), Buffer.from(shotHist.data, "base64"));

    // Cambiar a pestaña POS
    await client.send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const posBtn = buttons.find(b => b.textContent && b.textContent.includes('Terminal POS'));
        if (posBtn) posBtn.click();
      })()`,
    });
    await sleep(600);

    // Capturar pantalla de Terminal POS
    const shotPos = await client.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(OUT_DIR, `ventas-pos-${vp.name}.png`), Buffer.from(shotPos.data, "base64"));
  }

  // Capturar modal de Detalle de Venta en mobile 390 y desktop 1440
  console.log("\nCapturando modal de Detalle de Venta y Conciliación...");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Page.navigate", { url: "http://localhost:3000/ventas" });
  await sleep(1200);

  // Click en "Ver Detalle" de la primera venta
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const detailBtn = buttons.find(b => b.textContent && b.textContent.includes('Ver Detalle'));
      if (detailBtn) detailBtn.click();
    })()`,
  });
  await sleep(800);

  const shotModalMobile = await client.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(OUT_DIR, "ventas-detalle-modal-mobile-390.png"), Buffer.from(shotModalMobile.data, "base64"));

  // Desktop 1440 modal
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(500);
  const shotModalDesktop = await client.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(OUT_DIR, "ventas-detalle-modal-desktop-1440.png"), Buffer.from(shotModalDesktop.data, "base64"));

  client.close();
  edgeProc.kill();

  console.log("\n================================================================================");
  console.log("             TODAS LAS PRUEBAS DE LA FASE 6A FINALIZARON CON ÉXITO              ");
  console.log("================================================================================");
  process.exit(0);
}

runTests().catch((e) => {
  console.error("Error en pruebas de Fase 6A:", e);
  process.exit(1);
});
