/*
 * Riftmere – Leistung auf dem Handy messen (Issue #103, Messung aus #91): 3D-Welt im Testbrowser mit Handy-Profil (Pixel 5 quer, Software-Grafik),
 * als Gast in der Waldmark, ohne Spielserver. Misst Bilder/s im Stand und beim Gehen, das längste Bild, die Pixel der Leinwand und was geladen wurde
 * (2D-Bodenbilder, Figuren-Atlanten). Kein Test mit Prüfungen – ein Werkzeug zum Vergleichen.
 * Aufruf (im Ordner realtime, nach node build.mjs): node test/messen-handy.mjs [Zusatz für die Adresse, z. B. "&grafik=scharf"]
 */
import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url), { chromium, devices } = require("playwright");
const WURZEL = path.resolve(process.cwd(), ".."), TYP = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".mp3": "audio/mpeg" };
const geladen = []; const dateien = (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith("/")) u += "index.html"; const f = path.join(WURZEL, decodeURIComponent(u));
  if (!f.startsWith(WURZEL) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: "" }); const b = fs.readFileSync(f); geladen.push({ u, n: b.length }); return r.fulfill({ status: 200, contentType: TYP[path.extname(f)] || "application/octet-stream", body: b }); };
const GAST = `window.supabase = { createClient() { return { auth: { async getSession() { return { data: { session: null } }; }, onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; } }, async rpc() { return { data: null, error: { message: "anon" } }; } }; } };`;
const zusatz = process.argv[2] || "";
const br = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await br.newContext({ ...devices["Pixel 5 landscape"] }), p = await ctx.newPage(); const fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
await ctx.route("http://localhost:8765/**", dateien); await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: GAST }));
await ctx.addInitScript(() => { sessionStorage.setItem("ez__gefragt", "1"); localStorage.setItem("ez__alles", "1"); sessionStorage.setItem("ez__hilfe", "1");
  localStorage.setItem("ez_mein_held", JSON.stringify({ aussehen: { g: "mann", frisur: "scheitel", bart: "ohne", haar: "orange", haut: "hell" }, waffe: "schwert" })); localStorage.setItem("ez_ort_weidenhain", JSON.stringify({ ankunft: true })); });
if (process.env.ZWEI_D) { await p.goto("http://localhost:8765/echtzeit/?server=ws://localhost:1" + zusatz); await p.waitForTimeout(20000);
  const mb = (re) => Math.round(geladen.filter((g) => re.test(g.u)).reduce((a, g) => a + g.n, 0) / 1e5) / 10;
  if (process.env.FOTO) await p.screenshot({ path: process.env.FOTO });
  console.log(`2D: Figuren ${mb(/figuren-fabrik/)} MB (davon mobil ${mb(/figuren-fabrik.*\.mobil\./)} MB) · alles ${mb(/./)} MB`); if (fehler.length) console.log("Fehler:", fehler.slice(0, 3).join(" | ")); await br.close(); process.exit(0); }
await p.goto("http://localhost:8765/echtzeit/?welt3d=1&server=ws://localhost:1" + zusatz);
await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.motor, null, { timeout: 120000 }); await p.waitForTimeout(6000); /* Chunks und Figuren laden */
const messen = (ms) => p.evaluate((ms) => new Promise((ok) => { const t = []; let a = performance.now(); const s = a; const f = (n) => { t.push(n - a); a = n; if (n - s < ms) requestAnimationFrame(f); else ok(t); }; requestAnimationFrame(f); }), ms);
const auswerten = (t) => ({ bps: Math.round(10 * t.length / (t.reduce((a, b) => a + b, 0) / 1000)) / 10, max: Math.round(Math.max(...t)) });
if (process.env.ZEITEN) await p.evaluate(() => { const W = window.EZW.welt3d, M = W.motor; window.__z = {}; const hin = (o, k, n) => { const f = o[k]; if (typeof f !== "function") return; o[k] = function (...a) { const t = performance.now(), r = f.apply(this, a); const d = performance.now() - t; const z = window.__z[n] || (window.__z[n] = { n: 0, sum: 0, max: 0 }); z.n++; z.sum += d; z.max = Math.max(z.max, d); return r; }; };
  for (const k of ["gelaende", "dinge", "figuren", "nachladen", "holen", "bild"]) hin(M, k, "motor." + k); if (M.beimBild) { const f = M.beimBild; M.beimBild = (dt) => { const t = performance.now(); f(dt); const z = window.__z.beimBild || (window.__z.beimBild = { n: 0, sum: 0, max: 0 }); const d = performance.now() - t; z.n++; z.sum += d; z.max = Math.max(z.max, d); }; } hin(W.raster, "dazu", "raster.dazu"); hin(W.raster, "sperren", "raster.sperren"); hin(W, "sperrenNeu", "welt.sperrenNeu"); hin(M.r, "render", "render"); });
let prof = null; if (process.env.PROFIL) { prof = await ctx.newCDPSession(p); await prof.send("Profiler.enable"); await prof.send("Profiler.start"); }
const stand = auswerten(await messen(8000));
if (prof) { const { profile: P } = await prof.send("Profiler.stop"); const selbst = new Map(), dt = P.timeDeltas, je = new Map(P.nodes.map((n) => [n.id, n])); P.samples.forEach((id, i) => selbst.set(id, (selbst.get(id) || 0) + (dt[i] || 0)));
  const sum = new Map(); for (const [id, t] of selbst) { const n = je.get(id), c = n.callFrame, k = `${c.functionName || "(anonym)"} ${c.url.split("/").pop()}:${c.lineNumber + 1}`; sum.set(k, (sum.get(k) || 0) + t); }
  console.log([...sum].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, t]) => `${Math.round(t / 1000)} ms  ${k}`).join("\n")); }
const o = await p.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y }));
await p.evaluate((o) => { const W = window.EZW.welt3d; if (W.laufen) W.laufen(o.x + 60, o.y); else if (W.beimKlick) W.beimKlick(o.x + 60, o.y); }, o);
const gehen = auswerten(await messen(8000));
let sprung = null; if (process.env.SPRUNG) { await p.evaluate((o) => window.EZW.welt3d.springen(o.x + 70, o.y + 10), o); sprung = auswerten(await messen(8000)); console.log(`nach einem Sprung (70 Felder, neue Chunks): ${sprung.bps} Bilder/s, längstes ${sprung.max} ms`); }
const info = await p.evaluate(() => { const r = window.EZW.welt3d.motor.r; r.info.autoReset = true; return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok({ dreiecke: r.info.render.triangles, aufrufe: r.info.render.calls })))); });
if (process.env.BAEUME) console.log(JSON.stringify(await p.evaluate(() => { const M = window.EZW.welt3d.motor, je = {}; let lod = 0; for (const s of M.st.values()) { if (s.lod) lod++; for (const d of s.d.dinge) { const t = M.ix.typen[d[0]]; if (t.kategorie === "bewuchs") je[t.id] = (je[t.id] || 0) + 1; } }
  const top = Object.entries(je).sort((a, b) => b[1] - a[1]).slice(0, 12); return { chunks: M.st.size, mitLod: lod, lodAb: M.lodAb, top }; })));
if (process.env.DREIECKE) console.log(JSON.stringify(await p.evaluate(() => { const M = window.EZW.welt3d.motor, je = {}; M.szene.traverse((o) => { if (!o.visible || !o.isMesh) return; let v = o.parent; while (v) { if (!v.visible) return; v = v.parent; }
  const g = o.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); const k = o.isInstancedMesh ? "instanzen" : (o.name || o.geometry.type) + "|" + (o.material && (o.material.name || o.material.type)) + "|" + Math.round(n / (o.isInstancedMesh ? o.count : 1)); je[k] = (je[k] || 0) + n; });
  return Object.fromEntries(Object.entries(je).map(([k, n]) => [k, Math.round(n / 1000) + " Tsd."])); })));
console.log(`je Bild: ${Math.round(info.dreiecke / 1000)} Tsd. Dreiecke, ${info.aufrufe} Aufrufe`);
const lein = await p.evaluate(() => { const c = document.querySelector("canvas"); return c ? `${c.width}×${c.height}` : "?"; }), weg = await p.evaluate((o) => Math.round(Math.hypot(window.EZW.welt3d.ort.x - o.x, window.EZW.welt3d.ort.y - o.y)), o);
const mb = (re) => Math.round(geladen.filter((g) => re.test(g.u)).reduce((a, g) => a + g.n, 0) / 1e5) / 10;
console.log(`Leinwand ${lein} · Stand ${stand.bps} Bilder/s (längstes ${stand.max} ms) · Gehen ${gehen.bps} Bilder/s (längstes ${gehen.max} ms, ${weg} Felder)`);
console.log(`geladen: 2D-Bodenbilder ${geladen.filter((g) => /\/echtzeit\/welt\/\d+_\d+\.webp/.test(g.u)).length} Dateien (${mb(/\/echtzeit\/welt\/\d+_\d+\.webp/)} MB) · Figuren ${mb(/figuren-fabrik/)} MB (davon mobil ${mb(/figuren-fabrik.*\.mobil\./)} MB) · alles ${mb(/./)} MB`);
if (process.env.ZEITEN) console.log(JSON.stringify(await p.evaluate(() => Object.fromEntries(Object.entries(window.__z).map(([k, z]) => [k, { n: z.n, schnitt: Math.round(z.sum / z.n), max: Math.round(z.max) }])))));
if (process.env.LISTE) { const je = {}; for (const g of geladen) { const k = process.env.LISTE === "2" ? g.u : g.u.replace(/\/[^/]*$/, "/…"); je[k] = (je[k] || 0) + g.n; } console.log(Object.entries(je).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, n]) => `${Math.round(n / 1e4) / 100} MB ${k}`).join("\n")); }
if (fehler.length) console.log("Fehler auf der Seite:", fehler.slice(0, 3).join(" | "));
await br.close();
