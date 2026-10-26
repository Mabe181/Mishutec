import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9225;
const OUT_DIR = path.resolve(process.cwd(), "screenshots/phase7b");
const ARTIFACT_DIR = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\74973783-98f5-4036-b8a0-a9eb9bf55896";

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

async function saveScreenshot(client: CDPClient, filename: string) {
  const res = await client.send("Page.captureScreenshot", { format: "png" });
  const buf = Buffer.from(res.data, "base64");
  const localPath = path.join(OUT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(localPath, buf);
  fs.writeFileSync(artifactPath, buf);
  console.log(`  ✓ Guardado: ${filename} (${buf.length} bytes)`);
}

async function run() {
  console.log("Iniciando Edge headless para captura CDP Fase 7B...");
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.resolve(process.cwd(), ".tmp-edge-phase7b-profile")}`,
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
    throw new Error("No fue posible conectar con Edge vía CDP en el puerto " + PORT);
  }

  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: "PUT" });
  const tabData = (await newTabRes.json()) as any;
  const client = new CDPClient();
  await client.connect(tabData.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("DOM.enable");
  await client.send("Runtime.enable");

  // 1. Dashboard Desktop (1440x900)
  console.log("1. Capturando Dashboard Desktop (1440x900)...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await client.send("Page.navigate", { url: "http://localhost:3000/devoluciones" });
  await sleep(1500);
  await saveScreenshot(client, "01-fase7b-devoluciones-dashboard-desktop.png");

  // 2. Dashboard Tablet (768x1024)
  console.log("2. Capturando Dashboard Tablet (768x1024)...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 2, mobile: false });
  await sleep(500);
  await saveScreenshot(client, "02-fase7b-devoluciones-dashboard-tablet.png");

  // 3. Dashboard Mobile 390 (390x844)
  console.log("3. Capturando Dashboard Mobile (390x844)...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  await saveScreenshot(client, "03-fase7b-devoluciones-dashboard-mobile-390.png");

  // 4. Dashboard Mobile 320 (320x568)
  console.log("4. Capturando Dashboard Mobile (320x568)...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  await saveScreenshot(client, "04-fase7b-devoluciones-dashboard-mobile-320.png");

  // 5. Modal de Registro de Devolución Desktop (1440x900)
  console.log("5. Abriendo Modal de Registro de Devolución...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400);

  // Click en "Registrar Devolución"
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Registrar Devolución'));
      if (btn) btn.click();
    })()`,
  });
  await sleep(600);

  // Buscar venta "B001-000005"
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const pill = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('B001-000005'));
      if (pill) {
        pill.click();
      } else {
        const input = document.querySelector('input[placeholder*="B001"]');
        if (input) {
          (input as any).value = 'B001-000005';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Buscar Venta'));
          if (searchBtn) searchBtn.click();
        }
      }
    })()`,
  });
  await sleep(1000);

  // Marcar el checkbox del producto
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length > 0) {
        (checkboxes[0] as any).click();
      }
    })()`,
  });
  await sleep(600);
  await saveScreenshot(client, "05-fase7b-registro-modal-desktop.png");

  // 6. Modal de Registro Mobile (390x844)
  console.log("6. Capturando Modal de Registro Mobile (390x844)...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(600);
  await saveScreenshot(client, "06-fase7b-registro-modal-mobile.png");

  // Cerrar modal de registro
  await client.send("Runtime.evaluate", {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`,
  });
  await sleep(500);

  // 7. Ficha de Devolución con Panel de Resolución (Desktop 1440x900)
  console.log("7. Capturando Ficha de Devolución...");
  await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400);

  // Abrir ficha del primer trámite
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fichaBtn = buttons.find(b => b.textContent && (b.textContent.includes('Ficha') || b.textContent.includes('Resolver')));
      if (fichaBtn) fichaBtn.click();
    })()`,
  });
  await sleep(1200);
  await saveScreenshot(client, "07-fase7b-ficha-devolucion-resolucion.png");

  client.close();
  edgeProc.kill();
  console.log("✓ Todas las capturas CDP de la Fase 7B fueron completadas exitosamente.");
}

run().catch((e) => {
  console.error("Error en capturas CDP:", e);
  process.exit(1);
});
