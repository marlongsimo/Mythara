/*
 * Mythara – Streifgebiete für Rudel (Welt #143), ohne Browser: wenige Gebiete, je Art und Land höchstens eins; Fläche 60–120 Felder; alle Ziele begehbar, in der Fläche,
 * außerhalb der Meidekreise und untereinander verbunden (ohne Meidekreise zu betreten); keine Orte oder Questorte in der Fläche, die nicht gemieden werden;
 * Stufe wie die Art in der Gegend; Rudelgröße 5–7.
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
const groesse = SG.filter((g) => { const b = g.flaeche[2] - g.flaeche[0], h = g.flaeche[3] - g.flaeche[1]; return b < 60 || b > 120 || h < 60 || h > 120; }).map((g) => g.id); check(!groesse.length, "Flächen 60–120 Felder", groesse);
const anzahl = SG.filter((g) => g.anzahl[0] < 5 || g.anzahl[1] > 7 || g.anzahl[0] > g.anzahl[1]).map((g) => g.id); check(!anzahl.length, "Rudel 5–7 Tiere", anzahl);
const stufe = SG.filter((g) => { const l = GP.filter((p) => p.gegner.includes(g.gegner) && (p.land === g.land || g.land === "Süden")).map((p) => p.stufe); return !l.length || Math.abs(g.stufe - l[0]) > 4; }).map((g) => g.id);
check(!stufe.length, "Stufe wie die Art in der Gegend", stufe);
const R = new G.WeltRaster(), geladen = new Set();
for (const g of SG) for (const n of readdirSync(join(WELT, "regionen"))) { if (geladen.has(n)) continue; const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; const [a, b, c, d] = g.flaeche; if (x1 < a || x0 > c || y1 < b || y0 > d) continue;
  geladen.add(n); for (const ch of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(ch); }
const RADIUS = { Stadt: 42, Dorf: 28, "Gehöft": 18, Ort: 16 };
for (const g of SG) {
  const [a, b, c, d] = g.flaeche, gemieden = (x, y) => g.meiden.some((m) => Math.hypot(m.x - x, m.y - y) < m.r);
  const s = 1, seen = new Set(), [sx, sy] = g.ziele[0], q = [[Math.floor(sx), Math.floor(sy)]]; seen.add(q[0].join(","));
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx < a || ny < b || nx >= c || ny >= d || !R.begehbar(nx + .5, ny + .5) || gemieden(nx + .5, ny + .5)) continue; seen.add(k); q.push([nx, ny]); } }
  const schlecht = g.ziele.filter(([x, y]) => x < a || x >= c || y < b || y >= d || !R.begehbar(x, y) || gemieden(x, y) || !seen.has(Math.floor(x) + "," + Math.floor(y)));
  const flaecheAnteil = seen.size / ((c - a) * (d - b) * s);
  const orte = [...ON.gebiete.filter((o) => RADIUS[o.art]).map((o) => ({ name: o.name, x: o.schrift[0], y: o.schrift[1] })), ...ON.orte.filter((o) => RADIUS[o.art]).map((o) => ({ name: o.name, x: o.x, y: o.y }))]
    .filter((o) => o.x >= a && o.x < c && o.y >= b && o.y < d && !g.meiden.some((m) => Math.hypot(m.x - o.x, m.y - o.y) < 1)).map((o) => o.name);
  check(g.ziele.length >= 4 && !schlecht.length && flaecheAnteil > 0.4 && !orte.length, `${g.name} (${g.gegner}, Stufe ${g.stufe}, ${g.modell}): ${g.ziele.length} Ziele verbunden, ${Math.round(flaecheAnteil * 100)} % der Fläche begehbar, ${g.meiden.length} Meidekreise`,
    [...schlecht.map(([x, y]) => `Ziel ${x}|${y}`), ...orte.map((o) => "Ort in der Fläche: " + o)]); }
console.log(ok ? "\nStreifgebiete: alles in Ordnung" : "\nStreifgebiete: FEHLER"); process.exit(ok ? 0 : 1);
