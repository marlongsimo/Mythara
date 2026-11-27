/*
 * Mythara – Streifgebiete (Welt #143, jedes Tier streift einzeln), ohne Browser: wenige Gebiete, je Art und Land höchstens eins; Fläche 60–120 Felder; alle Ziele begehbar, in der Fläche,
 * außerhalb der Meidekreise und untereinander verbunden (ohne Meidekreise zu betreten); keine Orte oder Questorte in der Fläche, die nicht gemieden werden;
 * Stufe wie die Art in der Gegend; 5–7 Tiere je Gebiet.
 * Aufruf (im Ordner realtime): node test/welt-streifgebiete.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const SG = lies("streifgebiete.json").gebiete, GP = lies("gegnerplaetze.json").plaetze, ON = lies("ortsnamen.json");
console.log("\nStreifgebiete");
check(SG.length >= 5 && SG.length <= 12, `${SG.length} Gebiete – wenige, etwas Besonderes`);
const paare = SG.map((g) => g.gegner + "|" + g.land); check(new Set(paare).size === paare.length, "je Art und Land höchstens ein Gebiet");
const groesse = SG.filter((g) => { const b = g.rechteck[2] - g.rechteck[0] + 1, h = g.rechteck[3] - g.rechteck[1] + 1; return b < 60 || b > 120 || h < 60 || h > 120; }).map((g) => g.id); check(!groesse.length, "Rechtecke 60–120 Felder (einschließlich, Format von weltzonen.py)", groesse);
const format = SG.filter((g) => !g.id || !g.gegner || !Number.isInteger(g.anzahl) || g.rechteck?.length !== 4 || /rudel/i.test(g.id + g.name)).map((g) => g.id); check(!format.length, "Format für weltzonen.py: id, gegner, anzahl (Zahl), rechteck; kein „Rudel“", format);
const MON = readFileSync(join(WELT, "..", "shared", "config.ts"), "utf8"), unbekannt = SG.filter((g) => !new RegExp(`^\\s{2}${g.gegner}: \\{ name:`, "m").test(MON)).map((g) => g.gegner); check(!unbekannt.length, "alle Gegner haben Werte in shared/config.ts", unbekannt);
const anzahl = SG.filter((g) => g.anzahl < 5 || g.anzahl > 7).map((g) => g.id); check(!anzahl.length, "5–7 Tiere je Gebiet", anzahl);
const stufe = SG.filter((g) => { const l = GP.filter((p) => p.gegner.includes(g.gegner) && (p.land === g.land || g.land === "Süden")).map((p) => p.stufe); return !l.length || Math.abs(g.stufe - l[0]) > 4; }).map((g) => g.id);
check(!stufe.length, "Stufe wie die Art in der Gegend", stufe);
const R = new G.WeltRaster(), geladen = new Set();
const draussen = []; for (const g of SG) { const r = JSON.parse(readFileSync(join(WELT, "regionen", g.region, "region.json"), "utf8")), x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, [a, b, c, d] = g.rechteck; if (a < x0 || b < y0 || c >= x0 + r.chunks[0] * 32 || d >= y0 + r.chunks[1] * 32) draussen.push(g.id); }
check(!draussen.length, "jedes Rechteck liegt ganz in seinem Gebiet (weltzonen.py schneidet sonst ab)", draussen);
for (const g of SG) for (const n of readdirSync(join(WELT, "regionen"))) { if (geladen.has(n)) continue; const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; const [a, b, c, d] = g.rechteck; if (x1 < a || x0 > c || y1 < b || y0 > d) continue;
  geladen.add(n); for (const ch of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(ch); }
const RADIUS = { Stadt: 42, Dorf: 28, "Gehöft": 18, Ort: 16 };
for (const g of SG) {
  const [a, b, c1, d1] = g.rechteck, c = c1 + 1, d = d1 + 1, gemieden = (x, y) => g.meiden.some((m) => Math.hypot(m.x - x, m.y - y) < m.r);
  let start = null; for (let r = 0; r < 60 && !start; r++) for (let t = 0; t < 6.3 && !start; t += 0.1) { const x = Math.floor(g.mitte[0] + Math.cos(t) * r), y = Math.floor(g.mitte[1] + Math.sin(t) * r); if (R.begehbar(x + .5, y + .5) && !gemieden(x + .5, y + .5)) start = [x, y]; }
  const seen = new Set(), q = start ? [start] : []; if (start) seen.add(start.join(","));
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx < a || ny < b || nx >= c || ny >= d || !R.begehbar(nx + .5, ny + .5) || gemieden(nx + .5, ny + .5)) continue; seen.add(k); q.push([nx, ny]); } }
  const anteil = seen.size / ((c - a) * (d - b));
  const orte = [...ON.gebiete.filter((o) => RADIUS[o.art]).map((o) => ({ name: o.name, x: o.schrift[0], y: o.schrift[1] })), ...ON.orte.filter((o) => RADIUS[o.art]).map((o) => ({ name: o.name, x: o.x, y: o.y }))]
    .filter((o) => o.x >= a && o.x < c && o.y >= b && o.y < d && !g.meiden.some((m) => Math.hypot(m.x - o.x, m.y - o.y) < 1)).map((o) => o.name);
  check(anteil > 0.4 && !orte.length, `${g.name} (${g.gegner}, ${g.anzahl} Tiere, Stufe ${g.stufe}): ${Math.round(anteil * 100)} % der Fläche zusammenhängend begehbar, keine Orte darin`, orte.map((o) => "Ort in der Fläche: " + o)); }
console.log(ok ? "\nStreifgebiete: alles in Ordnung" : "\nStreifgebiete: FEHLER"); process.exit(ok ? 0 : 1);
