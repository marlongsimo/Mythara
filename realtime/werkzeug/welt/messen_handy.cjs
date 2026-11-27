/* Messung #91: Ladezeit, Bilder/s und Ruckler beim Gehen im Testbrowser mit Handy-Profil (Pixel 5). Voraussetzung: node tools/testserver.js (Port 8765). Aufruf: node realtime/werkzeug/welt/messen_handy.cjs [ausgabe.json] */
const { chromium, devices } = require("playwright");
const ORTE = [["Waldmark", 6448, 6440, "waldmark"], ["Graufurt", 6689, 6516, "graufurt"], ["Glutbrunn", 7160, 6955, "fl_216_211"]];
(async () => { const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] }); const erg = [];
 for (const [n, x, y, reg] of ORTE) {
  const c = await b.newContext({ ...devices["Pixel 5"] }), p = await c.newPage(); let bytes = 0, anz = 0; p.on("response", async (r) => { try { const l = +(r.headers()["content-length"] || 0) || (await r.body()).length; bytes += l; anz++; } catch {} });
  await c.addInitScript(([x, y, reg]) => { localStorage.setItem("ez__alles", "1"); localStorage.setItem("ez_welt_pos", JSON.stringify([x, y, reg])); }, [x, y, reg]);
  const t0 = Date.now(); await p.goto("http://localhost:8765/echtzeit/?welt=1&server=&3d=1&fps=1");
  await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.figur, null, { timeout: 180000 }); const tBereit = Date.now() - t0;
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); const tBild = Date.now() - t0;
  await p.evaluate(() => { if (!document.querySelector("#ez-fps")) { const d = document.createElement("div"); d.id = "ez-fps"; document.body.appendChild(d); } }); await p.waitForTimeout(8000);
  const ruhig = await p.evaluate(() => new Promise((res) => { const t = []; const f = (z) => { t.push(z); if (t.length < 120) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); }));
  const d = ruhig.slice(1).map((v, i) => v - ruhig[i]), fps = 1000 / (d.reduce((a, b) => a + b, 0) / d.length);
  const info = await p.evaluate(() => document.querySelector("#ez-fps")?.textContent || "");
  /* Gehen: 8 s nach Osten (über Chunk-Grenzen), Bildzeiten aufzeichnen */
  const lauf = p.evaluate(() => new Promise((res) => { const t = []; const ende = performance.now() + 8000; const f = (z) => { t.push(z); if (z < ende) requestAnimationFrame(f); else res(t); }; requestAnimationFrame(f); }));
  await p.keyboard.down("d"); await p.waitForTimeout(8000); await p.keyboard.up("d"); const tl = await lauf;
  const dl = tl.slice(1).map((v, i) => v - tl[i]), fpsL = 1000 / (dl.reduce((a, b) => a + b, 0) / dl.length), max = Math.max(...dl), ruck = dl.filter((v) => v > 2.5 * (1000 / fpsL)).length;
  const pos = await p.evaluate(() => [Math.round(EZW.szene.ort.x), Math.round(EZW.szene.ort.y)]);
  erg.push({ ort: n, bereit_ms: tBereit, erstes_bild_ms: tBild, daten_mb: +(bytes / 1e6).toFixed(1), anfragen: anz, fps_ruhig: +fps.toFixed(1), fps_gehen: +fpsL.toFixed(1), max_bild_ms: Math.round(max), ruckler: ruck, info, weg: [x, y, ...pos] });
  console.log(JSON.stringify(erg[erg.length - 1])); await c.close(); }
 await b.close(); require("fs").writeFileSync(process.argv[2] || "messung_handy.json", JSON.stringify(erg, null, 1)); })();
