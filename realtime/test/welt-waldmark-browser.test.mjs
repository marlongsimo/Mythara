/*
 * Mythara Echtzeit – Prüfung der Waldmark im Browser (Szene „Welt“): ruhiger Lauf ohne Sprünge, Nachladen an Chunk- und Regionsgrenzen,
 * Übergang durch das Südtor auf den Waldweg, Transparenz von Bäumen und Häusern, gemerkte Stelle nach dem Neuladen.
 * Vorher (im Ordner realtime): node werkzeug/welt/bauen.mjs waldmark waldweg && node build.mjs; im Hauptordner: node tools/testserver.js
 * Aufruf: node test/welt-waldmark-browser.test.mjs
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const ADR = "http://localhost:8765/echtzeit/?welt=waldmark&server=", O = 6400; /* Ursprung der Waldmark in Rechenfeldern */
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } }), fehler = [];
p.on("pageerror", (e) => fehler.push(e.message));
await p.goto(ADR + "&neu=1", { waitUntil: "load" }); await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(800);

/* Bei jedem Bild: Sprünge der Position, fehlender Boden im Bild, Region */
await p.evaluate(() => { const s = window.EZW.szene, k = s.cameras.main, m = window.M = { bilder: 0, sprung: 0, luecke: 0, regionen: new Set(), laden: 0 }; let alt = null;
  s.events.on("postupdate", () => { m.bilder++; const o = s.ort; if (alt && Math.hypot(o.x - alt.x, o.y - alt.y) > 0.4) m.sprung++; alt = { x: o.x, y: o.y }; m.regionen.add(s.hier);
    const x0 = Math.floor(k.scrollX / 1536), x1 = Math.floor((k.scrollX + k.width / k.zoom) / 1536), y0 = Math.floor(k.scrollY / 1536), y1 = Math.floor((k.scrollY + k.height / k.zoom) / 1536);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const n = cx + "_" + cy; if (!s.gueltig.has(n)) continue; const st = s.stuecke.get(n); if (!st || st.stand !== "aktiv" || !st.boden || st.boden.texture.key === "__MISSING") m.luecke++; } });
  window.addEventListener("beforeunload", () => { m.laden++; }); });
const geh = async (x, y, text) => { await p.evaluate(([x, y]) => window.EZW.gehe(x, y), [O + x, O + y]);
  await p.waitForFunction(([x, y]) => window.EZW.szene.pfad.length === 0, [x, y], { timeout: 90000, polling: 200 });
  const o = await p.evaluate(() => ({ ...window.EZW.ort() })); const d = Math.hypot(o.x - O - x, o.y - O - y); check(d < 1.6, `${text}: angekommen (${d.toFixed(1)} Felder vom Ziel)`); return o; };
/* Rundgang: Brunnen → Taverne → Schmiede → Heldenhalle → Tor → Waldweg → zurück */
const tueren = await p.evaluate(() => { const s = window.EZW.szene, a = []; for (const st of s.stuecke.values()) if (st.daten) for (const i of st.daten.interaktionen) a.push(i); return a; });
for (const id of ["taverne_tuer", "schmiede_tuer", "halle_tuer", "brunnen_ansehen", "tor_ansehen"]) { const t = tueren.find((a) => a.id === id); if (!t) { check(false, id + " fehlt"); continue; }
  await geh(t.x - O, t.y - O, `zur Interaktion ${id}`); await p.waitForTimeout(250);
  const knopf = await p.evaluate(() => { const k = document.querySelector("#ez-dorf-knopf"); return k.hidden ? "" : k.textContent; }); check(/Ansehen/.test(knopf), `${id}: der Knopf „Ansehen“ erscheint`); }
await geh(54, 64 + 22, "durchs Südtor auf den Waldweg");
const titel = await p.evaluate(() => document.querySelector("#ez-titel b").textContent); check(titel === "Der Waldweg", `Region gewechselt, ohne die Seite neu zu laden (Titel „${titel}“)`);
await geh(48, 37.5, "zurück zum Brunnen");
const m = await p.evaluate(() => ({ ...window.M, regionen: [...window.M.regionen] }));
check(m.sprung === 0, `ruhiger Lauf über ${m.bilder} Bilder: keine Sprünge der Position (${m.sprung})`);
check(m.luecke === 0, `kein Bild mit fehlendem Boden (${m.luecke})`);
check(m.laden === 0 && m.regionen.includes("waldweg") && m.regionen.includes("waldmark"), "beide Regionen besucht, kein Neuladen");

/* Transparenz: hinter die Heldenhalle stellen */
const halle = await p.evaluate(() => { const s = window.EZW.szene; for (const st of s.stuecke.values()) for (const g of st.scheinend) if (g.texture.key === "obj-dorf_heldenhalle_01") { s.ort.x = g.x / 48; s.ort.y = g.y / 48 - 2.2; s.pfad = []; return true; } return false; });
await p.waitForTimeout(1500);
const alpha = await p.evaluate(() => { const s = window.EZW.szene; for (const st of s.stuecke.values()) for (const g of st.scheinend) if (g.texture.key === "obj-dorf_heldenhalle_01") return g.alpha; return 1; });
check(halle && alpha < 0.6, `hinter der Heldenhalle wird sie durchscheinend (Deckkraft ${alpha.toFixed(2)})`);
await p.evaluate(() => { const s = window.EZW.szene; s.ort.x = 6448; s.ort.y = 6437.5; }); await p.waitForTimeout(1500);
const zurueck = await p.evaluate(() => { const s = window.EZW.szene; for (const st of s.stuecke.values()) for (const g of st.scheinend) if (g.texture.key === "obj-dorf_heldenhalle_01") return g.alpha; return 0; });
check(zurueck > 0.95, `davor wieder voll sichtbar (${zurueck.toFixed(2)})`);
/* Bäume: einen Baum suchen, hinter den man treten kann */
const baum = await p.evaluate(() => { const s = window.EZW.szene; for (const st of s.stuecke.values()) for (const g of st.scheinend) if (g.texture.key.startsWith("obj-wald_baum") && s.raster.begehbar(g.x / 48, g.y / 48 - 1.5)) { s.ort.x = g.x / 48; s.ort.y = g.y / 48 - 1.5; return g.texture.key; } return ""; });
await p.waitForTimeout(1500);
const baumAlpha = await p.evaluate(() => { const s = window.EZW.szene, o = s.ort; let a = 1; for (const st of s.stuecke.values()) for (const g of st.scheinend) if (g.texture.key.startsWith("obj-wald_baum") && Math.abs(g.x / 48 - o.x) < 0.01) a = Math.min(a, g.alpha); return a; });
check(Boolean(baum) && baumAlpha < 0.6, `hinter einem Baum wird seine Krone durchscheinend (${baum}, Deckkraft ${baumAlpha.toFixed(2)})`);

/* Gemerkte Stelle */
await p.evaluate(() => { const s = window.EZW.szene; s.ort.x = 6430.5; s.ort.y = 6440.5; }); await p.waitForTimeout(2600);
await p.goto(ADR, { waitUntil: "load" }); await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(500);
const da = await p.evaluate(() => ({ ...window.EZW.ort() })); check(Math.hypot(da.x - 6430.5, da.y - 6440.5) < 0.05, `nach dem Neuladen an derselben Stelle (${(da.x - O).toFixed(2)} | ${(da.y - O).toFixed(2)})`);
check(fehler.length === 0, fehler.length ? "Fehler im Browser: " + fehler.slice(0, 3).join(" | ") : "keine Fehler im Browser");
await b.close(); console.log(ok ? "\nWaldmark im Browser: alles in Ordnung" : "\nWaldmark im Browser: FEHLER"); process.exit(ok ? 0 : 1);
