/*
 * Welt-Test Ockerlande (#172, Schritt 1–2): Lehmsteppe, Ockerstrom mit Furt, drei Tafelberge mit begehbarer Kuppe, Trockenflüsse, Wasserlöcher;
 * Rotlehm (~40–60 Gebäude, Markt, Bank, Karawanenhof, Lehmfeste, Werkstatt, Taverne, Wegstein, Bindestein) und Brunnenkreis, Rastplätze;
 * alles von Glutbrunn aus zu Fuß über die Karawanenstraße erreichbar, an der Straße höchstens ~150 Felder ohne Ort oder Rastplatz; keine Gegner in Rotlehm.
 * Aufruf (im Ordner realtime): node test/welt-ockerlande.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const OK = lies("ockerlande_orte.json"), BOX = [6640, 6900, 8020, 7820], BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const R = new G.WeltRaster(), IA = new Map(), OBJ = []; let lehm = 0;
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; if (x1 < BOX[0] || x0 > BOX[2] || y1 < BOX[1] || y0 > BOX[3]) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); for (const o of reg.objekte) OBJ.push({ ...o, x: o.x + x0, y: o.y + y0, region: n });
  for (const z of reg.gelaende) for (const c of z) if (c === "l" || c === "L") lehm++; }
const flut = ([sx, sy], box) => { const s = 1, seen = new Set(), q = [[Math.floor(sx), Math.floor(sy)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx < box[0] || ny < box[1] || nx > box[2] || ny > box[3] || !R.begehbar(nx + 0.5, ny + 0.5)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 2) => { for (let dy = -w; dy <= w; dy++) for (let dx = -w; dx <= w; dx++) if (seen.has(Math.floor(x + dx) + "," + Math.floor(y + dy))) return true; return false; }; };
const GLUTBRUNN = [7150, 6972], da = flut(GLUTBRUNN, BOX);
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };

console.log("\nGelände");
check(lehm > 300000, `Lehmsteppe: ${lehm} Felder Lehm (l, L)`);
{ const [fx, fy] = OK.furt, w = flut([fx - 25, fy], [fx - 40, fy - 30, fx + 40, fy + 30]); check(w(fx + 25, fy), "der Ockerstrom ist über die Furt bei Rotlehm zu queren");
  let wasser = 0, proben = 0; for (let i = 1; i < OK.strom.length; i++) { const [x0, y0] = OK.strom[i - 1], [x1, y1] = OK.strom[i]; for (let t = 0; t < 1; t += 0.1) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; proben++; let w = false; for (let dx = -6; dx <= 6 && !w; dx++) if (!R.begehbar(x + dx + 0.5, y + 0.5) && Math.abs(Math.abs(fy - y) > 3 ? 0 : 1) === 0) w = true; if (w) wasser++; } }
  check(wasser >= proben * 0.9, `der Strom ist Wasser (${wasser} von ${proben} Proben)`); }
for (const [name, T] of Object.entries(OK.tafelberge)) { const [cx, cy] = T.mitte; check(!R.begehbar(cx + T.r[0] * 0.92, cy) || !R.begehbar(cx, cy + T.r[1] * 0.92), `Tafelberg ${name}: Felsrand`); check(da(cx, cy, 3), `Tafelberg ${name}: Kuppe über den Aufgang erreichbar`); }

console.log("\nRotlehm, Brunnenkreis, Rastplätze");
{ const [cx, cy] = OK.orte.rotlehm, geb = OBJ.filter((o) => Math.abs(o.x - cx) < 80 && Math.abs(o.y - cy) < 60 && BIB.get(o.objekt)?.kategorie === "gebaeude").length;
  const hat = (id) => OBJ.some((o) => o.id === id); check(geb >= 40 && geb <= 70 && ["rotlehm_bank", "rotlehm_karawanenhof_tor", "rotlehm_feste_bergfried", "rotlehm_schmiede", "rotlehm_taverne", "rotlehm_wegstein", "rotlehm_bindestein", "rotlehm_brunnen"].every(hat), `Rotlehm: ${geb} Gebäude, Bank, Karawanenhof, Lehmfeste, Werkstatt, Taverne, Wegstein, Bindestein`); }
{ const ziele = [...[...IA.values()].filter((i) => /^(rotlehm|brunnenkreis|rast_ockerlande|fischplatz_ockerstrom)/.test(i.id)).map((i) => [i.id, i.x, i.y]), ...OK.npc.map((n) => [n.id, n.x, n.y]), ...OK.laeden.map((l) => [l.id, l.x, l.y]), ...OK.stationen.map((s) => [s.id, s.x, s.y]), ...OK.banken.map((b) => [b.id, ...b.schalter])];
  const weg = ziele.filter(([, x, y]) => !da(x, y)).map(([id]) => id); check(ziele.length > 30 && !weg.length, `${ziele.length} Lesestellen, NPC-, Laden-, Stations- und Bankplätze von Glutbrunn aus erreichbar`, weg); }
{ const orte = [GLUTBRUNN, [7108, 6968] /* Westrand von Glutbrunn */, OK.orte.rotlehm, OK.orte.brunnenkreis, ...OK.rastplaetze.map((id) => [IA.get(id).x, IA.get(id).y])], K = OK.wege.at(-1).punkte, luecken = [];
  for (let i = 1; i < K.length; i++) { const [x0, y0] = K[i - 1], [x1, y1] = K[i], L = Math.hypot(x1 - x0, y1 - y0); for (let t = 0; t <= L; t += 5) { const x = x0 + (x1 - x0) * t / L, y = y0 + (y1 - y0) * t / L; if (!orte.some(([a, b]) => Math.hypot(a - x, b - y) <= 80)) luecken.push(`${Math.round(x)}|${Math.round(y)}`); } }
  check(!luecken.length, "an der Karawanenstraße höchstens ~150 Felder ohne Ort oder Rastplatz", luecken); }
check(OK.fischplaetze.every((f) => da(...f.stehplatz, 1) && !R.begehbar(f.x, f.y)), `${OK.fischplaetze.length} Fischplätze am Ockerstrom`);

console.log("\nGegner, Namen");
{ const [cx, cy] = OK.orte.rotlehm, gp = lies("gegnerplaetze.json").plaetze.filter((p) => p.x > cx - 66 && p.x < cx + 74 && p.y > cy - 50 && p.y < cy + 54).map((p) => p.id); check(!gp.length, "kein Gegnerplatz in Rotlehm", gp);
  const ON = lies("ortsnamen.json").orte.map((o) => o.name), nf = OK.namen.map((n) => n[0]).filter((n) => !ON.includes(n)); check(!nf.length, `Ortsnamen auf der Karte: ${OK.namen.map((n) => n[0]).join(", ")}`, nf); }
console.log(ok ? "\nOckerlande: alles in Ordnung" : "\nOckerlande: FEHLER"); process.exit(ok ? 0 : 1);
