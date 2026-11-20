/*
 * Mythara Echtzeit – Prüfung: Nachladen der offenen Welt im Browser (Szene „Welt“).
 * Ein Held läuft quer durch die Prüfwelt; dabei darf nie ein Stück Boden im Bild fehlen, und was weit weg ist, muss wieder freigegeben werden.
 *
 * Vorher (im Ordner realtime):  node werkzeug/welt/pruefwelt.mjs && node werkzeug/welt/bauen.mjs pruefwelt && node build.mjs
 * und im Hauptordner:           node tools/testserver.js
 * Aufruf: node test/welt-strom.test.mjs [--nur rechner,handy,gross,eilig] [--bilder ordner]
 */
import { createRequire } from "node:module";
const { chromium, devices } = createRequire(import.meta.url)("playwright");
const ADR = "http://localhost:8765/echtzeit/?welt=pruefwelt&server=&neu=1", bilder = process.argv.includes("--bilder") ? process.argv[process.argv.indexOf("--bilder") + 1] : null;
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };

/** Im Browser: bei jedem Bild messen, ob alle Chunks im Sichtfeld gezeigt werden, und den Helden nach Osten den Weg entlang steuern */
const einrichten = (tempo) => {
  const W = window.EZW, s = W.szene, C = 32, PX = 1536, k = s.cameras.main;
  const m = window.MESS = { bilder: 0, luecken: 0, lueckenBilder: 0, aktivMax: 0, bereitMax: 0, texturMax: 0, listeMax: 0, zeiten: [], fertig: false, steht: 0 }; let zuletzt = performance.now(), altX = 0;
  const H = 128, wegY = (x) => H / 2 + 7 * Math.sin(x / 17) + 3 * Math.sin(x / 6.3), U = 100 * C;
  const D = window.EZW_HELDEN = null; void D;
  s.events.on("postupdate", () => { const jetzt = performance.now(); m.zeiten.push(jetzt - zuletzt); zuletzt = jetzt; m.bilder++;
    const x0 = Math.floor(k.scrollX / PX), x1 = Math.floor((k.scrollX + k.width / k.zoom) / PX), y0 = Math.floor(k.scrollY / PX), y1 = Math.floor((k.scrollY + k.height / k.zoom) / PX); let fehlt = 0;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const n = cx + "_" + cy; if (!s.gueltig.has(n)) continue; const st = s.stuecke.get(n); if (!st || st.stand !== "aktiv" || !st.boden || st.boden.texture.key === "__MISSING") fehlt++; }
    if (fehlt) { m.luecken += fehlt; m.lueckenBilder++; }
    let aktiv = 0, bereit = 0; for (const st of s.stuecke.values()) { if (st.stand === "aktiv") aktiv++; else if (st.stand === "bereit") bereit++; }
    m.aktivMax = Math.max(m.aktivMax, aktiv); m.bereitMax = Math.max(m.bereitMax, bereit); m.texturMax = Math.max(m.texturMax, s.textures.getTextureKeys().length); m.listeMax = Math.max(m.listeMax, s.children.length);
    /* steuern: nach Osten, dabei auf dem Weg bleiben */
    const o = s.ort, x = o.x - U, y = o.y - U; if (x > 6 * C - 4) { s.rx = 0; s.ry = 0; m.fertig = true; return; }
    s.rx = 1; s.ry = Math.max(-1, Math.min(1, (wegY(x + 1.5) - y) * 1.5)); if (Math.abs(o.x - altX) < 1e-4) m.steht++; altX = o.x; });
  if (tempo !== 1) { /* schneller laufen als jeder Held: Belastungsprobe für das Vorholen (Phaser ruft sys.sceneUpdate) */ const u = s.update.bind(s); s.sys.sceneUpdate = (t, dt) => { for (let i = 0; i < tempo; i++) u(t, dt); }; }
};

async function lauf(name, kontext, tempo, bremse) {
  const b = await chromium.launch(), c = await b.newContext(kontext), p = await c.newPage(), fehler = [];
  p.on("pageerror", (e) => fehler.push(e.message)); p.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
  if (bremse) await p.route("**/welt/*", async (r) => { await new Promise((ok) => setTimeout(ok, bremse)); await r.continue(); });
  await p.goto(ADR, { waitUntil: "load" }); await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const start = await p.evaluate(() => ({ ...window.EZW.ort() })); await p.evaluate(einrichten, tempo);
  if (bilder) { await p.waitForTimeout(6000 / tempo); await p.screenshot({ path: `${bilder}/strom-${name}.png` }); }
  await p.waitForFunction(() => window.MESS.fertig, null, { timeout: 240000, polling: 500 });
  const m = await p.evaluate(() => { const m = window.MESS, z = m.zeiten.slice(30).sort((a, b) => a - b), s = window.EZW.szene; return { ...m, zeiten: undefined, mittel: z.reduce((a, b) => a + b, 0) / z.length, p95: z[Math.floor(z.length * 0.95)], max: z[z.length - 1], mess: s.mess, am: s.stuecke.size, raster: s.raster.anzahl, zoom: s.cameras.main.zoom, ort: { ...window.EZW.ort() } }; });
  await b.close();
  console.log(`\n${name} – Zoom ${m.zoom.toFixed(2)}, Tempo ×${tempo}${bremse ? `, jede Datei ${bremse} ms verzögert` : ""}`);
  check(fehler.length === 0, fehler.length ? "Fehler im Browser: " + fehler.slice(0, 3).join(" | ") : "keine Fehler im Browser");
  check(m.ort.x - start.x > 180, `quer durch die Welt gelaufen: ${(m.ort.x - start.x).toFixed(0)} Felder über ${m.bilder} Bilder (${m.steht} davon ohne Fortschritt)`);
  check(m.lueckenBilder === 0, `nie fehlte ein Chunk im Bild (${m.lueckenBilder} Bilder mit Lücke)`);
  check(m.mess.entladen >= 6 && m.am <= 14, `weit Entferntes wurde freigegeben: ${m.mess.geholt} geholt, ${m.mess.entladen} entladen, am Ende ${m.am} im Speicher (von 24)`);
  check(m.aktivMax <= 12, `höchstens ${m.aktivMax} Chunks zugleich im Bild, ${m.bereitMax} bereit; Texturen höchstens ${m.texturMax}, Anzeigeliste höchstens ${m.listeMax}`);
  console.log(`    Bildzeit: Mittel ${m.mittel.toFixed(1)} ms, 95 % unter ${m.p95.toFixed(1)} ms, längstes ${m.max.toFixed(0)} ms · längstes Holen ${m.mess.laengsteMs.toFixed(0)} ms`);
}

const nur = process.argv.includes("--nur") ? process.argv[process.argv.indexOf("--nur") + 1].split(",") : null;
for (const [name, kontext, tempo, bremse] of [["rechner", { viewport: { width: 1280, height: 800 } }, 1, 0], ["handy", { ...devices["iPhone 13"] }, 1, 0],
  ["gross", { viewport: { width: 1920, height: 1080 } }, 3, 0], ["eilig", { viewport: { width: 1280, height: 800 } }, 3, 250]]) if (!nur || nur.includes(name)) await lauf(name, kontext, tempo, bremse);
console.log(ok ? "\nNachladen: alles in Ordnung" : "\nNachladen: FEHLER"); process.exit(ok ? 0 : 1);
