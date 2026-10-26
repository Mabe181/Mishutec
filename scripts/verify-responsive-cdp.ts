import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;
const AFTER_DIR = path.resolve(process.cwd(), "screenshots/responsive_audit/after");

if (!fs.existsSync(AFTER_DIR)) {
  fs.mkdirSync(AFTER_DIR, { recursive: true });
}

interface Viewport {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  takeScreenshot: boolean;
}

const VIEWPORTS: Viewport[] = [
  { name: "mobile-320", width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, takeScreenshot: true },
  { name: "mobile-360", width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, takeScreenshot: false },
  { name: "mobile-390", width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, takeScreenshot: true },
  { name: "mobile-430", width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, takeScreenshot: false },
  { name: "tablet-768", width: 768, height: 1024, deviceScaleFactor: 2, isMobile: false, takeScreenshot: true },
  { name: "tablet-1024", width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false, takeScreenshot: false },
  { name: "desktop-1440", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, takeScreenshot: true },
];

const ROUTES = [
  "/dashboard",
  "/productos",
  "/inventario",
  "/clientes",
  "/proveedores",
  "/empleados",
  "/ventas",
  "/devoluciones",
  "/reportes",
];

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

async function run() {
  console.log("================================================================================");
  console.log("         MISHUTEC - VERIFICACIÓN PROGRAMÁTICA RESPONSIVE & HORIZONTAL OVERFLOW  ");
  console.log("================================================================================");

  // Iniciar Edge en modo headless con CDP
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.resolve(process.cwd(), ".tmp-edge-profile")}`,
    "about:blank",
  ];

  console.log(`Iniciando Edge headless en puerto ${PORT}...`);
  const edgeProc = spawn(EDGE_PATH, edgeArgs, { stdio: "ignore" });

  // Esperar a que el puerto de depuración esté disponible
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
    throw new Error("No se pudo conectar a Edge DevTools WebSocket.");
  }

  console.log("[OK] Conectado a Edge CDP.");

  // Crear una nueva página/tab
  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: "PUT" });
  const tabData = (await newTabRes.json()) as any;
  const pageWsUrl = tabData.webSocketDebuggerUrl;

  const client = new CDPClient();
  await client.connect(pageWsUrl);

  await client.send("Page.enable");
  await client.send("DOM.enable");
  await client.send("Runtime.enable");

  const results: Array<{
    route: string;
    viewport: string;
    width: number;
    innerWidth: number;
    scrollWidth: number;
    hasOverflow: boolean;
    overflowDetails?: string;
  }> = [];

  let totalTests = 0;
  let passedTests = 0;

  for (const route of ROUTES) {
    console.log(`\n--- Auditando ruta: ${route} ---`);

    for (const vp of VIEWPORTS) {
      totalTests++;
      // Configurar emulación de pantalla y viewport
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1, // 1 para medir CSS pixels exactos
        mobile: vp.isMobile,
      });

      // Navegar a la ruta
      await client.send("Page.navigate", { url: `http://localhost:3000${route}` });

      // Esperar renderizado y settle de CSS
      await sleep(1000);

      // Evaluar métricas de overflow
      const evalRes = await client.send("Runtime.evaluate", {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winInnerWidth = window.innerWidth;
          const docScrollWidth = docEl.scrollWidth;
          const bodyScrollWidth = body ? body.scrollWidth : 0;
          const maxScrollWidth = Math.max(docScrollWidth, bodyScrollWidth);
          const hasOverflow = maxScrollWidth > winInnerWidth + 1; // 1px tolerancia por subpixel rendering

          let offending = [];
          if (hasOverflow) {
            const all = document.querySelectorAll('*');
            for (let el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > winInnerWidth + 2) {
                offending.push({
                  tag: el.tagName,
                  class: (el.className || '').toString().slice(0, 50),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
                if (offending.length >= 3) break;
              }
            }
          }

          return {
            innerWidth: winInnerWidth,
            docScrollWidth,
            bodyScrollWidth,
            maxScrollWidth,
            hasOverflow,
            offending,
          };
        })()`,
        returnByValue: true,
      });

      const metrics = evalRes.result.value;
      const pass = !metrics.hasOverflow;
      if (pass) passedTests++;

      results.push({
        route,
        viewport: `${vp.name} (${vp.width}x${vp.height})`,
        width: vp.width,
        innerWidth: metrics.innerWidth,
        scrollWidth: metrics.maxScrollWidth,
        hasOverflow: metrics.hasOverflow,
        overflowDetails: metrics.offending.length > 0 ? JSON.stringify(metrics.offending) : undefined,
      });

      const statusIcon = pass ? "✓ PASS" : "✗ FAIL";
      console.log(
        `  [${statusIcon}] ${vp.name.padEnd(12)} (${vp.width}px): inner=${metrics.innerWidth}px, scroll=${metrics.maxScrollWidth}px`
      );

      if (metrics.hasOverflow) {
        console.log(`      -> Elementos causantes:`, metrics.offending);
      }

      // Tomar screenshot si corresponde
      if (vp.takeScreenshot) {
        const cleanRoute = route === "/" ? "home" : route.replace(/^\//, "");
        const screenshotFile = path.join(AFTER_DIR, `${cleanRoute}-${vp.name}.png`);

        const screenshotRes = await client.send("Page.captureScreenshot", {
          format: "png",
        });

        const buf = Buffer.from(screenshotRes.data, "base64");
        fs.writeFileSync(screenshotFile, buf);
      }
    }
  }

  client.close();
  edgeProc.kill();

  console.log("\n================================================================================");
  console.log(`RESUMEN DE PRUEBAS DE OVERFLOW HORIZONTAL: ${passedTests}/${totalTests} PASADAS`);
  console.log("================================================================================");

  const failures = results.filter((r) => r.hasOverflow);
  if (failures.length === 0) {
    console.log("¡ÉXITO TOTAL! 0 fallas de desbordamiento horizontal en todas las resoluciones.");
    console.log("Todas las páginas cumplen estrictamente document.documentElement.scrollWidth <= window.innerWidth");
  } else {
    console.log(`SE DETECTARON ${failures.length} CASOS CON DESBORDAMIENTO:`);
    console.table(failures);
  }

  // Guardar resultados en un log JSON estructurado
  const reportPath = path.resolve(process.cwd(), "screenshots/responsive_audit/audit_results.json");
  fs.writeFileSync(reportPath, JSON.stringify({ totalTests, passedTests, results }, null, 2));
  console.log(`Resultados guardados en: ${reportPath}`);
}

run().catch((err) => {
  console.error("Error fatal en verificación responsive:", err);
  process.exit(1);
});
