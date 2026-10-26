import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9224;
const OUT_DIR = path.resolve(process.cwd(), "screenshots/phase7a");
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

async function run() {
  console.log("Iniciando Edge headless para captura precisa con CDP...");
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.resolve(process.cwd(), ".tmp-edge-phase7a-profile")}`,
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

  // 1. Captura de Modal en Desktop (1440x950)
  console.log("Configurando viewport Desktop 1440x950...");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 950,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log("Navegando a http://localhost:3000/devoluciones...");
  await client.send("Page.navigate", { url: "http://localhost:3000/devoluciones" });
  await sleep(2000);

  console.log("Haciendo click en el botón 'Ficha'...");
  const clickRes = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Ficha'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.textContent };
      }
      return { clicked: false, totalButtons: buttons.length };
    })()`,
    returnByValue: true,
  });
  console.log("Resultado del click:", clickRes.result.value);

  // Esperar a que el modal se renderice completamente
  console.log("Esperando renderizado del modal...");
  let modalRendered = false;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const checkRes = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const modal = document.querySelector('h3');
        return modal && modal.textContent && modal.textContent.includes('Ficha de Devolución');
      })()`,
      returnByValue: true,
    });
    if (checkRes.result.value) {
      modalRendered = true;
      console.log(`Modal detectado en iteración ${i + 1}`);
      break;
    }
  }

  // Esperar 500ms adicionales para estabilizar transiciones CSS
  await sleep(600);

  console.log("Capturando 04-fase7a-devoluciones-modal-desktop.png...");
  const desktopModalRes = await client.send("Page.captureScreenshot", { format: "png" });
  const desktopBuf = Buffer.from(desktopModalRes.data, "base64");
  const desktopOut = path.join(OUT_DIR, "04-fase7a-devoluciones-modal-desktop.png");
  fs.writeFileSync(desktopOut, desktopBuf);
  fs.writeFileSync(path.join(ARTIFACT_DIR, "04-fase7a-devoluciones-modal-desktop.png"), desktopBuf);
  console.log("Guardado:", desktopOut, "Tamaño:", desktopBuf.length);

  // 2. Captura de Modal en Mobile (390x844)
  console.log("Cambiando viewport a Mobile 390x844...");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);

  console.log("Capturando 05-fase7a-devoluciones-modal-mobile.png...");
  const mobileModalRes = await client.send("Page.captureScreenshot", { format: "png" });
  const mobileBuf = Buffer.from(mobileModalRes.data, "base64");
  const mobileOut = path.join(OUT_DIR, "05-fase7a-devoluciones-modal-mobile.png");
  fs.writeFileSync(mobileOut, mobileBuf);
  fs.writeFileSync(path.join(ARTIFACT_DIR, "05-fase7a-devoluciones-modal-mobile.png"), mobileBuf);
  console.log("Guardado:", mobileOut, "Tamaño:", mobileBuf.length);

  client.close();
  edgeProc.kill();
  console.log("Proceso completado exitosamente.");
}

run().catch((e) => {
  console.error("Error en capture-phase7a-cdp:", e);
  process.exit(1);
});
