/*
 * Mythara Echtzeit – Steuerung am Handy (nachgestellt): Steuerknüppel unter dem Finger, Gegner antippen wählt das Ziel.
 * Aufruf (nach „npm run build“, Testserver des Hauptspiels auf Port 8765): node test/handy.test.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const br = await chromium.launch(), k = await br.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), p = await k.newPage(), fehler = [];
p.on("pageerror", (e) => fehler.push(String(e)));
await p.goto("http://localhost:8765/echtzeit/?server="); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 15000 });
const ort = () => p.evaluate(() => { const z = window.EZ.zustand(), e = z.w.find((e) => e[0] === z.ich.id); return [e[4], e[5]]; });
const cdp = await k.newCDPSession(p), finger = (typ, x, y) => cdp.send("Input.dispatchTouchEvent", { type: typ, touchPoints: typ === "touchEnd" ? [] : [{ x, y, id: 1 }] });
const a = await ort(); await finger("touchStart", 160, 260); await finger("touchMove", 215, 260); await p.waitForTimeout(700);
check(await p.evaluate(() => !document.querySelector("#ez-stick").hidden), "Finger aufs Feld: Der Steuerknüppel erscheint unter dem Finger");
await finger("touchEnd"); await p.waitForTimeout(200); const b = await ort();
check(b[0] - a[0] > 1 && b[1] - a[1] < -1, `Knüppel nach rechts: Der Held läuft am Bildschirm nach rechts (${(b[0] - a[0]).toFixed(1)} / ${(b[1] - a[1]).toFixed(1)} Felder)`);
await p.waitForTimeout(300); const c = await ort(); check(Math.hypot(c[0] - b[0], c[1] - b[1]) < 0.05 && await p.evaluate(() => document.querySelector("#ez-stick").hidden), "Finger weg: Der Held bleibt stehen, der Knüppel verschwindet");
// einen Gegner antippen: Er wird Ziel (auch wenn er zu weit weg ist), der Held läuft nicht von selbst hin
await p.evaluate(() => window.EZ.szene.cameras.main.setZoom(0.35)); await p.waitForTimeout(600); // weit herauszoomen, damit ein Gegner im Bild ist
const tipp = await p.evaluate(() => { const s = window.EZ.szene, z = window.EZ.zustand(), g = z.w.filter((e) => e[3] !== 0).sort((x, y) => x[4] + x[5] - y[4] - y[5])[0], k = s.cameras.main, w = { x: (g[4] - g[5]) * 32, y: (g[4] + g[5]) * 16 - 4 };
  return { id: g[0], x: (w.x - k.worldView.x) * k.zoom, y: (w.y - k.worldView.y) * k.zoom }; });
await p.touchscreen.tap(tipp.x, tipp.y); await p.waitForTimeout(400); const d = await ort();
check(await p.evaluate((id) => window.EZ.zustand().ich.zielId === id, tipp.id) && Math.hypot(d[0] - c[0], d[1] - c[1]) < 0.05, "Gegner antippen: Er ist das Ziel; der Held läuft nicht von selbst hin");
if (process.env.EZ_BILD) await p.screenshot({ path: process.env.EZ_BILD });
check(fehler.length === 0, "keine Fehler" + (fehler.length ? " – " + fehler[0] : "")); await br.close();
console.log(ok ? "\nHandy-Steuerung: alles in Ordnung" : "\nHandy-Steuerung: FEHLER"); process.exit(ok ? 0 : 1);
