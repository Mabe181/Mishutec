import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9223;
const AFTER_DIR = path.resolve(process.cwd(), "screenshots/responsive_audit/after");

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
  const edgeArgs = [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.resolve(process.cwd(), ".tmp-edge-modal-profile")}`,
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
    throw new Error("No CDP connection");
  }

  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: "PUT" });
  const tabData = (await newTabRes.json()) as any;
  const client = new CDPClient();
  await client.connect(tabData.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("DOM.enable");
  await client.send("Runtime.enable");

  // Mobile 390x844
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });

  // Navigate to /clientes
  await client.send("Page.navigate", { url: "http://localhost:3000/clientes" });
  await sleep(1500);

  // Click on "Nuevo Cliente" button
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Nuevo Cliente'));
      if (btn) btn.click();
    })()`,
  });

  await sleep(600);

  // Take screenshot of opened modal
  const screenshotRes = await client.send("Page.captureScreenshot", { format: "png" });
  const buf = Buffer.from(screenshotRes.data, "base64");
  fs.writeFileSync(path.join(AFTER_DIR, "clientes-modal-mobile-390.png"), buf);

  // Now test mobile drawer: close modal via Escape
  await client.send("Runtime.evaluate", {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`,
  });
  await sleep(400);

  // Open mobile drawer
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label="Abrir menú de navegación"]');
      if (btn) (btn as any).click();
    })()`,
  });
  await sleep(600);

  // Take screenshot of mobile drawer
  const drawerScreenshotRes = await client.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(AFTER_DIR, "drawer-mobile-390.png"), Buffer.from(drawerScreenshotRes.data, "base64"));

  client.close();
  edgeProc.kill();
  console.log("Modal y Drawer screenshots capturados correctamente.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
